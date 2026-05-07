package com.volcengine.realtimedialog;

import javax.sound.sampled.*;
import java.io.*;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class AudioCapture {
    private static final int BUFFER_SIZE = 4096;
    private TargetDataLine targetLine;
    private volatile boolean isCapturing = false;
    private Thread captureThread;
    private final BlockingQueue<byte[]> audioQueue;
    
    public AudioCapture() {
        this.audioQueue = new ArrayBlockingQueue<>(100);
    }
    
    public void startCapture() throws LineUnavailableException {
        AudioFormat format = new AudioFormat(
            Config.INPUT_SAMPLE_RATE,
            16,
            Config.CHANNELS,
            true,
            false // little endian
        );
        
        DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
        if (!AudioSystem.isLineSupported(info)) {
            throw new LineUnavailableException("音频输入设备不支持指定格式");
        }
        
        targetLine = (TargetDataLine) AudioSystem.getLine(info);
        targetLine.open(format);
        targetLine.start();
        
        isCapturing = true;
        captureThread = new Thread(this::captureLoop);
        captureThread.setName("AudioCapture");
        captureThread.start();
    }
    
    private void captureLoop() {
        byte[] buffer = new byte[Config.AUDIO_CHUNK_SIZE];
        
        while (isCapturing) {
            int bytesRead = targetLine.read(buffer, 0, buffer.length);
            if (bytesRead > 0) {
                byte[] audioData = new byte[bytesRead];
                System.arraycopy(buffer, 0, audioData, 0, bytesRead);
                try {
                    audioQueue.put(audioData);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }
    
    public byte[] readAudioData() throws InterruptedException {
        return audioQueue.poll();
    }
    
    public void stopCapture() {
        isCapturing = false;
        if (captureThread != null) {
            captureThread.interrupt();
        }
        if (targetLine != null) {
            targetLine.stop();
            targetLine.close();
        }
    }
    
    public boolean isCapturing() {
        return isCapturing;
    }
    
    public static byte[] readWavFile(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new FileNotFoundException("音频文件不存在: " + filePath);
        }
        
        try (FileInputStream fis = new FileInputStream(file)) {
            byte[] fileData = new byte[(int) file.length()];
            fis.read(fileData);
            
            // 跳过WAV文件头（44字节）
            if (filePath.toLowerCase().endsWith(".wav") && fileData.length > Config.WAV_HEADER_SIZE) {
                byte[] audioData = new byte[fileData.length - Config.WAV_HEADER_SIZE];
                System.arraycopy(fileData, Config.WAV_HEADER_SIZE, audioData, 0, audioData.length);
                return audioData;
            }
            
            return fileData;
        }
    }
    
    public static short[] bytesToInt16Samples(byte[] data) {
        short[] samples = new short[data.length / 2];
        ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(samples);
        return samples;
    }
    
    public static byte[] int16SamplesToBytes(short[] samples) {
        byte[] bytes = new byte[samples.length * 2];
        ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().put(samples);
        return bytes;
    }
}