package com.volcengine.realtimedialog;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;

import javax.sound.sampled.*;
import java.io.IOException;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class NetClient extends WebSocketClient {
    private final BlockingQueue<Protocol.Message> incomingMessages;
    private volatile boolean isConnected = false;
    private volatile boolean shouldStop = false;
    private SourceDataLine audioOutputLine;
    private Thread audioPlaybackThread;
    private final BlockingQueue<byte[]> audioQueue;
    private volatile String logid; // 保存logid用于通话结束时打印
    
    public NetClient(URI serverUri, Map<String, String> headers) {
        super(serverUri, new Draft_6455(), headers, 0);
        this.incomingMessages = new LinkedBlockingQueue<>();
        this.audioQueue = new LinkedBlockingQueue<>();
        // 只在非录音文件模式下初始化音频输出（文本模式需要播放器）
        if (!isAudioFileInput()) {
            initializeAudioOutput();
        }
    }
    
    private void initializeAudioOutput() {
        try {
            AudioFormat format = new AudioFormat(
                Config.OUTPUT_SAMPLE_RATE,
                16,
                Config.CHANNELS,
                true,
                false // little endian
            );
            
            DataLine.Info info = new DataLine.Info(SourceDataLine.class, format);
            if (!AudioSystem.isLineSupported(info)) {
                System.err.println("不支持音频输出格式");
                return;
            }
            
            audioOutputLine = (SourceDataLine) AudioSystem.getLine(info);
            audioOutputLine.open(format);
            audioOutputLine.start();
            
            // 启动音频播放线程
            audioPlaybackThread = new Thread(this::audioPlaybackLoop);
            audioPlaybackThread.setName("AudioPlayback");
            audioPlaybackThread.start();
            
        } catch (LineUnavailableException e) {
            System.err.println("音频输出初始化失败: " + e.getMessage());
        }
    }
    
    // 播放状态枚举
    private enum PlaybackState {
        IDLE,           // 空闲状态
        PLAYING,        // 正在播放
        WAITING_DATA    // 等待数据
    }
    
    private void audioPlaybackLoop() {
        PlaybackState state = PlaybackState.IDLE;
        int emptyCount = 0;
        final int maxEmptyCount = 20; // 1秒没有数据
        final boolean isTextMode = Config.mod.equals("text");
        final boolean isAudioFileMode = isAudioFileInput();
        
        System.out.println("音频播放线程启动 - 模式: " + Config.mod + 
                          ", 文本模式: " + isTextMode + 
                          ", 音频文件模式: " + isAudioFileMode);
        
        while (!shouldStop) {
            try {
                byte[] audioData = audioQueue.poll(50, TimeUnit.MILLISECONDS);
                
                if (audioData != null && audioOutputLine != null) {
                    // 状态转换：接收到数据 -> 播放状态
                    if (state != PlaybackState.PLAYING) {
                        state = PlaybackState.PLAYING;
                        if (!isTextMode && !isAudioFileMode) {
                            System.out.println("🎵 开始播放音频...");
                        }
                    }
                    
                    // 写入音频数据到播放设备
                    audioOutputLine.write(audioData, 0, audioData.length);
                    emptyCount = 0;
                    
                    // 调试信息控制
                    if (!isTextMode && !isAudioFileMode && audioData.length > 0) {
                        System.out.println("播放音频数据: " + audioData.length + " 字节");
                    }
                } else {
                    // 没有数据到达
                    if (state == PlaybackState.PLAYING) {
                        // 从播放状态转换到等待数据状态
                        state = PlaybackState.WAITING_DATA;
                        emptyCount = 0;
                    } else if (state == PlaybackState.WAITING_DATA) {
                        emptyCount++;
                        if (emptyCount > maxEmptyCount) {
                            // 转换到空闲状态
                            state = PlaybackState.IDLE;
                            if (!isTextMode && !isAudioFileMode) {
                                System.out.println("⏸️ 音频播放暂停，等待数据...");
                            }
                            emptyCount = 0;
                        }
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                System.err.println("❌ 音频播放错误: " + e.getMessage());
                e.printStackTrace();
                state = PlaybackState.IDLE;
            }
        }
        
        System.out.println("🛑 音频播放线程结束");
    }
    
    @Override
    public void onOpen(ServerHandshake handshake) {
        System.out.println("WebSocket连接已建立");
        isConnected = true;
        
        // 获取并保存logid
        logid = handshake.getFieldValue("X-Tt-Logid");
        if (logid != null && !logid.isEmpty()) {
            System.out.println("连接建立，logid: " + logid);
        }
    }
    
    @Override
    public void onMessage(String message) {
        System.out.println("收到文本消息: " + message);
    }
    
    @Override
    public void onMessage(ByteBuffer bytes) {
        try {
            byte[] data = new byte[bytes.remaining()];
            bytes.get(data);
            
            System.out.println("收到WebSocket二进制消息，长度: " + data.length + " 字节");
            System.out.println("原始数据前20字节: " + bytesToHex(data, Math.min(20, data.length)));
            
            try {
                Protocol.Message message = Protocol.unmarshal(data);
                
                System.out.println("解析消息成功 - 类型: " + message.type + ", 事件ID: " + message.event + ", 会话ID: " + message.sessionId);
                
                // 直接使用ProtocolV2.Message，不再转换到旧格式
                switch (message.type) {
                    case FULL_SERVER:
                        handleFullServerMessage(message);
                        break;
                    case AUDIO_ONLY_SERVER:
                        handleAudioOnlyServerMessage(message);
                        break;
                    case ERROR:
                        handleErrorMessage(message);
                        break;
                    default:
                        System.err.println("未知消息类型: " + message.type);
                }
                
                incomingMessages.offer(message);
                
            } catch (IOException e) {
                System.err.println("消息解析失败: " + e.getMessage());
                System.err.println("尝试解析为文本消息...");
                try {
                    String text = new String(data, "UTF-8");
                    System.err.println("文本内容: " + text);
                } catch (Exception textEx) {
                    System.err.println("也无法解析为文本: " + textEx.getMessage());
                }
            }
            
        } catch (Exception e) {
            System.err.println("处理消息时出错: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private String bytesToHex(byte[] bytes, int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(String.format("%02X ", bytes[i]));
        }
        return sb.toString();
    }
    
    private void handleFullServerMessage(Protocol.Message message) {
        ServerResponseHandler.handleFullServerMessage(this, message);
    }
    
    private void handleAudioOnlyServerMessage(Protocol.Message message) {
        ServerResponseHandler.handleAudioOnlyServerMessage(this, message);
    }
    
    private void handleErrorMessage(Protocol.Message message) {
        ServerResponseHandler.handleErrorMessage(message);
    }
    
    // 播放音频数据 - 对齐Golang实现，简化音频处理
    public void playAudioData(byte[] audioData) {
        // 录音文件模式下不播放音频
        if (isAudioFileInput()) {
            return;
        }
        
        try {
            if (audioData == null || audioData.length == 0) {
                return;
            }
            
            System.out.println("播放音频数据: " + audioData.length + " 字节");
            
            // 根据配置格式处理音频数据
            switch (Config.pcmFormat) {
                case Config.PCM_S16LE:
                    // s16le格式直接播放
                    if (audioData.length % 2 != 0) {
                        System.err.println("s16le音频数据长度不是2的倍数: " + audioData.length);
                        return;
                    }
                    audioQueue.offer(audioData);
                    break;
                    
                case Config.DEFAULT_PCM:
                    // f32le格式需要转换为s16le
                    if (audioData.length % 4 != 0) {
                        System.err.println("f32le音频数据长度不是4的倍数: " + audioData.length);
                        return;
                    }
                    
                    int sampleCount = audioData.length / 4;
                    short[] samples = new short[sampleCount];
                    ByteBuffer buffer = ByteBuffer.wrap(audioData).order(ByteOrder.LITTLE_ENDIAN);
                    
                    for (int i = 0; i < sampleCount; i++) {
                        float sample = buffer.getFloat();
                        // 将float转换为short，确保范围正确
                        samples[i] = (short) Math.max(-32768, Math.min(32767, sample * 32767.0f));
                    }
                    
                    // 转换为字节数组并播放
                    byte[] s16Data = AudioCapture.int16SamplesToBytes(samples);
                    audioQueue.offer(s16Data);
                    break;
            }
            
        } catch (Exception e) {
            System.err.println("播放音频数据失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("WebSocket连接已关闭. 代码: " + code + ", 原因: " + reason);
        
        // 打印logid
        if (logid != null && !logid.isEmpty()) {
            System.out.println("连接关闭，logid: " + logid);
        }
        
        isConnected = false;
        cleanup();
    }
    
    @Override
    public void onError(Exception ex) {
        System.err.println("WebSocket错误: " + ex.getMessage());
        ex.printStackTrace();
    }
    
    // 检查是否为录音文件输入模式
    private boolean isAudioFileInput() {
        return !Config.audioFilePath.isEmpty();
    }
    
    public boolean isConnected() {
        return isConnected;
    }
    
    public String getLogid() {
        return logid;
    }
    
    public Protocol.Message pollIncomingMessage(long timeout, TimeUnit unit) throws InterruptedException {
        return incomingMessages.poll(timeout, unit);
    }
    
    public void sendAudioData(String sessionId, byte[] audioData) throws IOException {
        if (!isConnected) {
            throw new IOException("WebSocket未连接");
        }
        
        try {
            byte[] message = Protocol.createAudioMessage(sessionId, audioData);
            send(message);
        } catch (Exception e) {
            throw new IOException("发送音频消息失败: " + e.getMessage(), e);
        }
    }
    
    public void sendTextMessage(String sessionId, String text) throws IOException {
        if (!isConnected) {
            throw new IOException("WebSocket未连接");
        }
        
        byte[] message = Protocol.createFullClientMessage(sessionId, text);
        send(message);
    }
    
    public void sendProtocolMessage(String sessionId, String text, int eventId) throws IOException {
        if (!isConnected) {
            throw new IOException("WebSocket未连接");
        }
        
        try {
            byte[] messageBytes;
            if (eventId == 1) {
                messageBytes = Protocol.createStartConnectionMessage();
            } else if (eventId == 100) {
                messageBytes = Protocol.createStartSessionMessage(sessionId, text);
            } else {
                // 创建带特定事件ID的消息
                Protocol.Message message = new Protocol.Message();
                message.type = Protocol.MsgType.FULL_CLIENT;
                message.typeFlag = Protocol.MSG_TYPE_FLAG_WITH_EVENT;
                message.event = eventId;
                message.sessionId = sessionId;
                message.payload = text.getBytes("UTF-8");
                messageBytes = Protocol.marshal(message);
            }
            send(messageBytes);
        } catch (Exception e) {
            throw new IOException("发送协议消息失败: " + e.getMessage(), e);
        }
    }
    
    public void sendChatTextQuery(String sessionId, String text) throws IOException {
        if (!isConnected) {
            throw new IOException("WebSocket未连接");
        }
        
        try {
            // 创建ChatTextQuery消息（事件501）
            RequestPayloads.ChatTextQueryPayload payload = new RequestPayloads.ChatTextQueryPayload(text);
            String jsonPayload = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
            
            Protocol.Message message = new Protocol.Message();
            message.type = Protocol.MsgType.FULL_CLIENT;
            message.typeFlag = Protocol.MSG_TYPE_FLAG_WITH_EVENT;
            message.event = 501; // ChatTextQuery事件
            message.sessionId = sessionId;
            message.payload = jsonPayload.getBytes("UTF-8");
            
            byte[] messageBytes = Protocol.marshal(message);
            send(messageBytes);
            
            System.out.println("发送ChatTextQuery消息成功: " + text);
        } catch (Exception e) {
            throw new IOException("发送ChatTextQuery消息失败: " + e.getMessage(), e);
        }
    }
    
    private void cleanup() {
        shouldStop = true;
        
        if (audioPlaybackThread != null) {
            audioPlaybackThread.interrupt();
        }
        
        if (audioOutputLine != null) {
            audioOutputLine.drain();
            audioOutputLine.stop();
            audioOutputLine.close();
        }
        
        // 保存音频到文件
        ServerResponseHandler.saveAudioToPCMFile("output.pcm");
    }
}