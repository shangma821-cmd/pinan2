package com.volcengine.realtimedialog;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class ServerResponseHandler {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final int SAMPLE_RATE = 24000;
    private static final int CHANNELS = 1;
    private static final int BUFFER_SECONDS = 100;
    
    // 音频缓冲区
    private static final List<Float> audioBuffer = Collections.synchronizedList(new ArrayList<>());
    private static final List<Short> s16Buffer = Collections.synchronizedList(new ArrayList<>());
    private static final List<Byte> audioData = Collections.synchronizedList(new ArrayList<>());
    
    // 状态标志
    private static final AtomicBoolean isSendingChatTTSText = new AtomicBoolean(false);
    private static final AtomicBoolean isUserQuerying = new AtomicBoolean(false);
    private static final Object sayHelloOverLock = new Object();
    private static volatile boolean sayHelloOver = false;
    private static final Object firstMsgLock = new Object();
    private static volatile boolean firstMsgProcessed = false;
    
    // 外部RAG数据结构
    public static class RAGObject {
        public String title;
        public String content;
        
        public RAGObject(String title, String content) {
            this.title = title;
            this.content = content;
        }
    }
    
    // ChatTTSText载荷
    public static class ChatTTSTextPayload {
        public boolean start;
        public boolean end;
        public String content;
        
        public ChatTTSTextPayload(boolean start, boolean end, String content) {
            this.start = start;
            this.end = end;
            this.content = content;
        }
    }
    
    // ChatRAGText载荷
    public static class ChatRAGTextPayload {
        public String externalRAG;
        
        public ChatRAGTextPayload(String externalRAG) {
            this.externalRAG = externalRAG;
        }
    }
    
    // 消息处理
    public static void handleFullServerMessage(NetClient netClient, Protocol.Message message) {
        try {
            String jsonStr = new String(message.payload);
            System.out.println("📨 收到服务器完整消息 (event=" + message.event + ", session_id=" + message.sessionId + "): " + jsonStr);
            
            // 事件处理
            System.out.println("🔍 处理事件 ID: " + message.event);
            switch (message.event) {
                case 50: // ConnectionStarted
                    System.out.println("✅ 连接已建立");
                    return;
                    
                case 150: // SessionStarted
                    System.out.println("✅ 会话已开始");
                    return;
                    
                case 152: // session finished event
                case 153: // session finished event
                    System.out.println("🏁 会话结束事件");
                    // 通知CallManager停止
                    CallManager.stopFromHandler();
                    return;
                    
                case 359: // 首次响应事件
                    System.out.println("🎯 收到事件359，音频文件模式: " + isAudioFileInput());
                    if (isAudioFileInput()) {
                        System.out.println("🎉 音频文件模式收到首次响应，保存音频并退出...");
                        // 音频文件模式下，收到事件359后保存音频并退出
                        saveAudioToPCMFile("output.pcm");
                        CallManager.stopFromHandler();
                        return;
                    }
                    
                    // 文本模式下，收到事件359后提示用户输入
                    if (Config.mod.equals("text")) {
                        System.out.println("💬 请输入内容");
                    } else {
                        // 音频模式下，标记首次消息已处理
                        synchronized (firstMsgLock) {
                            if (!firstMsgProcessed) {
                                firstMsgProcessed = true;
                                synchronized (sayHelloOverLock) {
                                    sayHelloOver = true;
                                    sayHelloOverLock.notifyAll();
                                }
                            }
                        }
                    }
                    break;
                    
                case 300: // SayHello响应事件，对齐Golang版本
                    System.out.println("🎯 收到SayHello响应事件");
                    if (Config.mod.equals("text")) {
                        System.out.println("💬 问候语已发送，请输入内容");
                    }
                    break;
                    
                case 450: // ASR info event, clear audio buffer
                    // 清空本地音频缓存，等待接收下一轮的音频
                    synchronized (audioData) {
                        audioData.clear();
                    }
                    synchronized (audioBuffer) {
                        audioBuffer.clear();
                    }
                    // 用户说话了，不需要触发连续SayHello引导用户交互了
                    CallManager.notifyUserQuery();
                    isUserQuerying.set(true);
                    break;
                    
                case 350: // 发送ChatTTSText请求事件之后，收到tts_type为chat_tts_text的事件
                    if (isSendingChatTTSText.get()) {
                        // 解析JSON数据
                        JsonNode jsonData = objectMapper.readTree(message.payload);
                        String ttsType = jsonData.get("tts_type").asText();
                        // 一种简单方式清空本地闲聊音频
                        if (Arrays.asList("chat_tts_text", "external_rag").contains(ttsType)) {
                            synchronized (audioData) {
                                audioData.clear();
                            }
                            synchronized (audioBuffer) {
                                audioBuffer.clear();
                            }
                            isSendingChatTTSText.set(false);
                        }
                    }
                    break;
                    
                case 459:
                    isUserQuerying.set(false);
                    // 概率触发发送ChatTTSText请求
                    if (new Random().nextInt(100000) % 1000 == 0) {
                        new Thread(() -> {
                            try {
                                isSendingChatTTSText.set(true);
                                System.out.println("hit ChatTTSText event, start sending...");
                                
                                // 发送ChatTTSText请求
                                sendChatTTSText(netClient, message.sessionId, new ChatTTSTextPayload(
                                    true, false, "这是查询到外部数据之前的安抚话术。"
                                ));
                                sendChatTTSText(netClient, message.sessionId, new ChatTTSTextPayload(
                                    false, true, ""
                                ));
                                
                                // 模拟查询外部RAG数据耗时，这里简单起见直接sleep5秒保证GTA安抚话术播报不受影响
                                Thread.sleep(5000);
                                
                                // 发送外部RAG数据
                                List<RAGObject> externalRAG = Arrays.asList(
                                    new RAGObject("北京天气", "今天北京整体以晴到多云为主，但西部和北部地带可能会出现分散性雷阵雨，特别是午后至傍晚时段需注意突发降雨。\n💨 风况与湿度\n风力较弱，一般为 2–3 级南风或西南风\n白天湿度较高，早晚略凉爽"),
                                    new RAGObject("北京空气质量", "当前北京空气质量为良，AQI指数在50左右，适合户外活动。建议关注实时空气质量变化，尤其是敏感人群。")
                                );
                                
                                String externalRAGJson = objectMapper.writeValueAsString(externalRAG);
                                sendChatRAGText(netClient, message.sessionId, new ChatRAGTextPayload(externalRAGJson));
                                
                            } catch (Exception e) {
                                System.err.println("ChatTTSText处理错误: " + e.getMessage());
                            }
                        }).start();
                    }
                    break;
            }
            
        } catch (Exception e) {
            System.err.println("处理完整服务器消息失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 处理音频消息 - 对齐Golang实现，简化逻辑
    public static void handleAudioOnlyServerMessage(NetClient netClient, Protocol.Message message) {
        try {
            System.out.println("🎵 收到音频消息 (event=" + message.event + "): session_id=" + message.sessionId + ", 数据长度: " + (message.payload != null ? message.payload.length : 0));
            
            if (message.payload != null && message.payload.length > 0) {
                // 直接处理音频数据（简化逻辑，对齐Golang）
                handleIncomingAudio(message.payload);
                
                // 保存音频数据到文件
                synchronized (audioData) {
                    for (byte b : message.payload) {
                        audioData.add(b);
                    }
                }
                
                // 直接播放音频 - 对齐Golang实现
                netClient.playAudioData(message.payload);
                
                System.out.println("✅ 音频数据已保存，当前总长度: " + audioData.size() + " 字节");
            }
            
        } catch (Exception e) {
            System.err.println("处理音频消息失败: " + e.getMessage());
        }
    }
    
    // 处理错误消息
    public static void handleErrorMessage(Protocol.Message message) {
        String errorMsg = new String(message.payload);
        System.err.println("收到错误消息 (code=" + message.event + "): " + errorMsg);
        System.exit(1);
    }
    
    // 处理输入音频数据 - 对齐Golang实现，简化逻辑
    private static void handleIncomingAudio(byte[] data) {
        if (isSendingChatTTSText.get()) {
            return;
        }
        
        // 简化音频处理逻辑，对齐Golang实现
        switch (Config.pcmFormat) {
            case Config.PCM_S16LE:
                System.out.println("收到音频字节长度: " + data.length + ", s16le长度: " + (data.length / 2));
                int sampleCount = data.length / 2;
                short[] samples = new short[sampleCount];
                
                ByteBuffer buffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN);
                for (int i = 0; i < sampleCount; i++) {
                    samples[i] = buffer.getShort();
                }
                
                // 将音频加载到缓冲区 - 简化逻辑对齐Golang
                synchronized (s16Buffer) {
                    for (short sample : samples) {
                        s16Buffer.add(sample);
                    }
                    // 限制缓冲区大小 - 简化逻辑
                    if (s16Buffer.size() > SAMPLE_RATE * BUFFER_SECONDS) {
                        s16Buffer.subList(0, s16Buffer.size() - (SAMPLE_RATE * BUFFER_SECONDS)).clear();
                    }
                }
                break;
                
            case Config.DEFAULT_PCM:
                System.out.println("收到音频字节长度: " + data.length + ", f32le长度: " + (data.length / 4));
                int floatSampleCount = data.length / 4;
                float[] floatSamples = new float[floatSampleCount];
                
                ByteBuffer floatBuffer = ByteBuffer.wrap(data).order(ByteOrder.LITTLE_ENDIAN);
                for (int i = 0; i < floatSampleCount; i++) {
                    int bits = floatBuffer.getInt();
                    floatSamples[i] = Float.intBitsToFloat(bits);
                }
                
                // 将音频加载到缓冲区 - 简化逻辑对齐Golang
                synchronized (audioBuffer) {
                    for (float sample : floatSamples) {
                        audioBuffer.add(sample);
                    }
                    // 限制缓冲区大小 - 简化逻辑
                    if (audioBuffer.size() > SAMPLE_RATE * BUFFER_SECONDS) {
                        audioBuffer.subList(0, audioBuffer.size() - (SAMPLE_RATE * BUFFER_SECONDS)).clear();
                    }
                }
                break;
        }
    }
    
    // 保存音频到PCM文件
    public static void saveAudioToPCMFile(String filename) {
        synchronized (audioData) {
            if (audioData.isEmpty()) {
                System.out.println("没有音频数据可保存。");
                return;
            }
        }
        
        try {
            File pcmFile = new File("./" + filename);
            try (FileOutputStream fos = new FileOutputStream(pcmFile)) {
                synchronized (audioData) {
                    byte[] audioBytes = new byte[audioData.size()];
                    for (int i = 0; i < audioData.size(); i++) {
                        audioBytes[i] = audioData.get(i);
                    }
                    fos.write(audioBytes);
                }
                System.out.println("音频已保存到: " + pcmFile.getAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("保存PCM文件失败: " + e.getMessage());
        }
    }
    
    // 发送ChatTTSText消息
    private static void sendChatTTSText(NetClient netClient, String sessionId, ChatTTSTextPayload payload) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("session_id", sessionId);
        root.put("start", payload.start);
        root.put("end", payload.end);
        root.put("content", payload.content);
        
        String jsonStr = objectMapper.writeValueAsString(root);
        byte[] message = Protocol.createFullClientMessage(sessionId, jsonStr);
        netClient.send(message);
    }
    
    // 发送ChatRAGText消息
    private static void sendChatRAGText(NetClient netClient, String sessionId, ChatRAGTextPayload payload) throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("session_id", sessionId);
        root.put("external_rag", payload.externalRAG);
        
        String jsonStr = objectMapper.writeValueAsString(root);
        byte[] message = Protocol.createFullClientMessage(sessionId, jsonStr);
        netClient.send(message);
    }
    
    // 检查是否为音频文件输入模式
    private static boolean isAudioFileInput() {
        return !Config.audioFilePath.isEmpty();
    }
}