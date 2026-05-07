import { SAMPLE_RATE } from '../constants';

// --- Decoding Helpers ---

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = SAMPLE_RATE,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Audio Player Class ---

export class AudioPlayer {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private onEndedCallback: (() => void) | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  constructor() {}

  private ensureAudioContext() {
    if (this.ctx && this.ctx.state !== 'closed' && this.gainNode) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
  }

  async playPCM(base64Data: string, onEnded?: () => void) {
    try {
      if (!base64Data) return;
      if (base64Data.startsWith('TEXT:')) {
        const text = decodeURIComponent(base64Data.slice(5));
        this.speakText(text, onEnded);
        return;
      }

      this.ensureAudioContext();
      if (!this.ctx || !this.gainNode) {
        throw new Error('Audio context initialization failed');
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.stop(); // Stop any previous audio
      this.onEndedCallback = onEnded || null;

      const bytes = decodeBase64(base64Data);
      const audioBuffer = await decodeAudioData(bytes, this.ctx);

      this.source = this.ctx.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.gainNode);
      const currentSource = this.source;
      
      this.source.onended = () => {
        if (this.source !== currentSource) return;
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      };

      this.source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
      if (onEnded) onEnded();
    }
  }

  private speakText(text: string, onEnded?: () => void) {
    this.stop();
    this.onEndedCallback = onEnded || null;

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      if (onEnded) onEnded();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (this.utterance === utterance) {
        this.utterance = null;
      }
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    };
    utterance.onerror = () => {
      if (this.utterance === utterance) {
        this.utterance = null;
      }
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    };

    this.utterance = utterance;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    this.onEndedCallback = null;
    if (this.source) {
      try {
        this.source.onended = null;
        this.source.stop();
        this.source.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.source = null;
    }
    if (this.utterance) {
      this.utterance.onend = null;
      this.utterance.onerror = null;
      window.speechSynthesis.cancel();
      this.utterance = null;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}

// --- Streaming Audio Player (for realtime Q&A) ---

interface StreamingChunk {
  bytes: Uint8Array;
  sampleRate: number;
  numChannels: number;
}

export class StreamingAudioPlayer {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private queuedChunks: StreamingChunk[] = [];
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime = 0;
  private processing = false;
  private onIdleCallback: (() => void) | null = null;

  private ensureAudioContext() {
    if (this.ctx && this.ctx.state !== 'closed' && this.gainNode) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: SAMPLE_RATE,
    });
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
    this.nextStartTime = this.ctx.currentTime;
  }

  setOnIdle(callback: (() => void) | null) {
    this.onIdleCallback = callback;
  }

  isPlaying(): boolean {
    if (!this.ctx) return false;
    if (this.activeSources.size > 0) return true;
    if (this.queuedChunks.length > 0) return true;
    return this.nextStartTime - this.ctx.currentTime > 0.02;
  }

  enqueuePCM(bytes: Uint8Array, sampleRate: number = SAMPLE_RATE, numChannels: number = 1) {
    if (!bytes || bytes.length === 0) return;
    this.queuedChunks.push({ bytes, sampleRate, numChannels });
    void this.flushQueue();
  }

  enqueuePCMBase64(base64Data: string, sampleRate: number = SAMPLE_RATE, numChannels: number = 1) {
    const bytes = decodeBase64(base64Data);
    this.enqueuePCM(bytes, sampleRate, numChannels);
  }

  interrupt() {
    this.stop();
  }

  stop() {
    this.queuedChunks = [];
    for (const source of this.activeSources) {
      try {
        source.onended = null;
        source.stop();
        source.disconnect();
      } catch {
        // Ignore stop race.
      }
    }
    this.activeSources.clear();
    if (this.ctx) {
      this.nextStartTime = this.ctx.currentTime;
    } else {
      this.nextStartTime = 0;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  private notifyIdleIfNeeded() {
    if (this.queuedChunks.length === 0 && this.activeSources.size === 0 && this.onIdleCallback) {
      this.onIdleCallback();
    }
  }

  private async flushQueue() {
    if (this.processing) return;
    this.processing = true;

    try {
      this.ensureAudioContext();
      if (!this.ctx || !this.gainNode) return;

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      while (this.queuedChunks.length > 0) {
        const chunk = this.queuedChunks.shift();
        if (!chunk) continue;

        const audioBuffer = await decodeAudioData(chunk.bytes, this.ctx, chunk.sampleRate, chunk.numChannels);
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.gainNode);

        const startAt = Math.max(this.ctx.currentTime, this.nextStartTime);
        this.nextStartTime = startAt + audioBuffer.duration;
        this.activeSources.add(source);

        source.onended = () => {
          this.activeSources.delete(source);
          this.notifyIdleIfNeeded();
        };

        source.start(startAt);
      }
    } catch (error) {
      console.error('Streaming audio playback failed:', error);
      this.stop();
    } finally {
      this.processing = false;
      this.notifyIdleIfNeeded();
    }
  }
}

// --- Realtime Microphone PCM Streamer ---

export interface MicrophonePcmChunk {
  bytes: Uint8Array;
  rms: number;
}

interface MicrophoneStartOptions {
  permissionTimeoutMs?: number;
}

export class MicrophonePcmStreamer {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sinkNode: MediaStreamAudioDestinationNode | null = null;
  private pendingSamples: number[] = [];
  private running = false;
  private chunkSamples: number;

  constructor(
    private targetSampleRate: number = 16000,
    chunkDurationMs: number = 20,
  ) {
    this.chunkSamples = Math.max(1, Math.round((this.targetSampleRate * chunkDurationMs) / 1000));
  }

  async start(
    onChunk: (chunk: MicrophonePcmChunk) => void,
    options: MicrophoneStartOptions = {}
  ): Promise<void> {
    if (this.running) return;
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error("当前浏览器不支持麦克风采集（getUserMedia）。");
    }

    const permissionTimeoutMs = Math.max(3000, options.permissionTimeoutMs ?? 10000);
    const rawGetMedia = navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        noiseSuppression: true,
        echoCancellation: true,
        autoGainControl: true,
      },
    });

    this.stream = await new Promise<MediaStream>((resolve, reject) => {
      let settled = false;
      const timeoutId = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("等待麦克风权限超时，请允许浏览器访问麦克风后重试。"));
      }, permissionTimeoutMs);

      rawGetMedia
        .then((stream) => {
          if (settled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }
          settled = true;
          clearTimeout(timeoutId);
          resolve(stream);
        })
        .catch((error) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.sourceNode = this.ctx.createMediaStreamSource(this.stream);
    this.processorNode = this.ctx.createScriptProcessor(4096, 1, 1);
    this.sinkNode = this.ctx.createMediaStreamDestination();
    this.pendingSamples = [];
    this.running = true;

    this.processorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this.running || !this.ctx) return;

      const inputBuffer = event.inputBuffer;
      const channelCount = inputBuffer.numberOfChannels;
      const frameCount = inputBuffer.length;
      const mono = new Float32Array(frameCount);

      for (let ch = 0; ch < channelCount; ch++) {
        const channelData = inputBuffer.getChannelData(ch);
        for (let i = 0; i < frameCount; i++) {
          mono[i] += channelData[i] || 0;
        }
      }

      const divisor = Math.max(1, channelCount);
      let energy = 0;
      for (let i = 0; i < frameCount; i++) {
        mono[i] /= divisor;
        energy += mono[i] * mono[i];
      }
      const rms = Math.sqrt(energy / Math.max(1, frameCount));

      const resampled = downsampleFloat32(mono, this.ctx.sampleRate, this.targetSampleRate);
      for (let i = 0; i < resampled.length; i++) {
        this.pendingSamples.push(resampled[i]);
      }

      while (this.pendingSamples.length >= this.chunkSamples) {
        const chunk = this.pendingSamples.splice(0, this.chunkSamples);
        const bytes = float32ChunkToPcm16Bytes(chunk);
        onChunk({ bytes, rms });
      }
    };

    this.sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.sinkNode);
  }

  stop() {
    this.running = false;
    this.pendingSamples = [];

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {
        // Ignore disconnect race.
      }
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sinkNode) {
      try {
        this.sinkNode.disconnect();
      } catch {
        // Ignore disconnect race.
      }
      this.sinkNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {
        // Ignore disconnect race.
      }
      this.sourceNode = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.ctx) {
      const toClose = this.ctx;
      this.ctx = null;
      void toClose.close().catch(() => {
        // Ignore close errors.
      });
    }
  }
}

// --- Audio Recorder Helper ---

export const getMicrophoneStream = async (): Promise<MediaStream> => {
  return await navigator.mediaDevices.getUserMedia({ audio: true });
};

const audioBufferToWav = (audioBuffer: AudioBuffer): Uint8Array => {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = 1;
  const length = audioBuffer.length;
  const bytesPerSample = 2;
  const dataSize = length * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM header size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    let sample = 0;
    for (let c = 0; c < channels.length; c++) {
      sample += channels[c][i] || 0;
    }
    sample /= Math.max(1, channels.length);
    const clamped = Math.max(-1, Math.min(1, sample));
    const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, pcm, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
};

const downsampleFloat32 = (
  input: Float32Array,
  inputSampleRate: number,
  targetSampleRate: number
): Float32Array => {
  if (targetSampleRate >= inputSampleRate) {
    return input;
  }

  const ratio = inputSampleRate / targetSampleRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);

  let inputOffset = 0;
  for (let i = 0; i < outputLength; i++) {
    const nextInputOffset = Math.min(input.length, Math.round((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = inputOffset; j < nextInputOffset; j++) {
      sum += input[j];
      count += 1;
    }
    output[i] = count > 0 ? sum / count : 0;
    inputOffset = nextInputOffset;
  }

  return output;
};

const float32ChunkToPcm16Bytes = (input: number[]): Uint8Array => {
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++) {
    const clamped = Math.max(-1, Math.min(1, input[i]));
    const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(i * 2, pcm, true);
  }
  return new Uint8Array(buffer);
};

const audioBufferToPcm16 = (audioBuffer: AudioBuffer, targetSampleRate: number): Uint8Array => {
  const frameCount = audioBuffer.length;
  const channelCount = audioBuffer.numberOfChannels;
  const mono = new Float32Array(frameCount);

  for (let channel = 0; channel < channelCount; channel++) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      mono[i] += channelData[i] || 0;
    }
  }

  for (let i = 0; i < frameCount; i++) {
    mono[i] /= Math.max(1, channelCount);
  }

  const resampled = downsampleFloat32(mono, audioBuffer.sampleRate, targetSampleRate);
  const pcm = new Int16Array(resampled.length);
  for (let i = 0; i < resampled.length; i++) {
    const clamped = Math.max(-1, Math.min(1, resampled[i]));
    pcm[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }

  return new Uint8Array(pcm.buffer);
};

const encodeBytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const blobToDataUrlBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1] || '');
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return (async () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return blobToDataUrlBase64(blob);
    }

    const ctx = new AudioContextClass();
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const wavBytes = audioBufferToWav(decoded);
      return encodeBytesToBase64(wavBytes);
    } catch {
      return blobToDataUrlBase64(blob);
    } finally {
      try {
        await ctx.close();
      } catch {
        // Ignore.
      }
    }
  })();
};

export const blobToPcm16Base64 = (blob: Blob, targetSampleRate: number = 16000): Promise<string> => {
  return (async () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      return blobToDataUrlBase64(blob);
    }

    const ctx = new AudioContextClass();
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      const pcmBytes = audioBufferToPcm16(decoded, targetSampleRate);
      return encodeBytesToBase64(pcmBytes);
    } catch {
      return blobToDataUrlBase64(blob);
    } finally {
      try {
        await ctx.close();
      } catch {
        // Ignore.
      }
    }
  })();
};

