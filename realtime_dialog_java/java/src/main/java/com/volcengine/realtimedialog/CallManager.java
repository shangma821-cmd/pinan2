package com.volcengine.realtimedialog;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

public class CallManager {
    private final String sessionId;
    private NetClient netClient;
    private AudioCapture audioCapture;
    private Thread audioSendThread;
    private Thread textInputThread;
    private final AtomicBoolean isRunning;
    private final AtomicBoolean isAudioMode;
    private static final BlockingQueue<Object> queryChan = new LinkedBlockingQueue<>();
    private static volatile CallManager currentInstance;

    public CallManager() {
        this.sessionId = Protocol.generateSessionId();
        this.isRunning = new AtomicBoolean(false);
        this.isAudioMode = new AtomicBoolean(true);
    }

    public void start() throws Exception {
        System.out.println("启动实时通话管理器，会话ID: " + sessionId);

        // 设置当前实例
        currentInstance = this;

        // 建立WebSocket连接
        connectWebSocket();

        isRunning.set(true);

        // 启动音频模式或文本模式
        if (Config.mod.equals("text")) {
            isAudioMode.set(false);
            startTextMode();
        } else {
            isAudioMode.set(true);
            startAudioMode();
        }


        // 等待运行结束
        waitForCompletion();
    }

    private void connectWebSocket() throws Exception {
        URI uri = new URI(Config.WS_URL);

        Map<String, String> headers = new HashMap<>();
        headers.put("X-Api-Resource-Id", Config.API_RESOURCE_ID);
        headers.put("X-Api-Access-Key", Config.API_ACCESS_KEY);
        headers.put("X-Api-App-Key", Config.API_APP_KEY);
        headers.put("X-Api-App-ID", Config.API_APP_ID);
        headers.put("X-Api-Connect-Id", sessionId);

        netClient = new NetClient(uri, headers);
        netClient.connectBlocking(30, TimeUnit.SECONDS);

        if (!netClient.isConnected()) {
            throw new IOException("WebSocket连接失败");
        }

        System.out.println("WebSocket连接成功");

        // 发送连接开始消息（事件1）
        startConnection();

        // 发送会话开始消息（事件100）
        startSession();
    }

    private void startConnection() throws Exception {
        System.out.println("发送连接开始消息...");
        // 使用正确的协议格式发送事件1
        netClient.sendProtocolMessage(sessionId, "{}", 1);
        System.out.println("连接开始消息发送完成");
    }

    private void startSession() throws Exception {
        System.out.println("发送会话开始消息...");

        RequestPayloads.StartSessionPayload payload = new RequestPayloads.StartSessionPayload();

        // 根据模式设置参数
        if (Config.mod.equals("text")) {
            payload.dialog.extra = createExtraMap("text");
        } else if (!Config.audioFilePath.isEmpty()) {
            payload.dialog.extra = createExtraMap("audio_file");
        } else {
            payload.dialog.extra = createExtraMap("audio");
        }

        // 发送会话开始消息
        String jsonPayload = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
        netClient.sendProtocolMessage(sessionId, jsonPayload, 100); // 事件100的载荷

        System.out.println("会话开始消息发送完成，等待服务器响应...");
        
        // 等待会话启动响应（事件150），对齐Go实现
        long startTime = System.currentTimeMillis();
        long timeout = 30000; // 30秒超时
        boolean sessionStarted = false;
        
        while (System.currentTimeMillis() - startTime < timeout) {
            Protocol.Message message = netClient.pollIncomingMessage(1, TimeUnit.SECONDS);
            if (message != null && message.type == Protocol.MsgType.FULL_SERVER && message.event == 150) {
                // 解析响应payload获取dialog_id
                try {
                    String responseJson = new String(message.payload, "UTF-8");
                    com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                    java.util.Map<String, Object> response = mapper.readValue(responseJson, java.util.Map.class);
                    String dialogId = (String) response.get("dialog_id");
                    if (dialogId != null && !dialogId.isEmpty()) {
                        System.out.println("会话启动成功，dialog_id: " + dialogId);
                        sessionStarted = true;
                        break;
                    }
                } catch (Exception e) {
                    System.err.println("解析会话启动响应失败: " + e.getMessage());
                }
            }
        }
        
        if (!sessionStarted) {
            throw new IOException("会话启动超时或失败，未收到服务器的会话启动确认");
        }
        
        System.out.println("会话开始完成\n" + jsonPayload);
    }

    private Map<String, Object> createExtraMap(String inputMod) {
        Map<String, Object> extra = new HashMap<>();
        extra.put("strict_audit", false);
        extra.put("audit_response", "抱歉这个问题我无法回答，你可以换个其他话题，我会尽力为你提供帮助。");
        extra.put("input_mod", inputMod);
        extra.put("model", "O");
        return extra;
    }

    private void startAudioMode() throws Exception {
        System.out.println("启动音频模式");

        if (Config.audioFilePath.isEmpty()) {
            // 麦克风模式
            sendGreetingMessage();
            startMicrophoneCapture();
            startMessageReceiver();
        } else {
            // 音频文件模式 - 不启动麦克风，只启动消息接收
            startFilePlayback();
            startMessageReceiver();
        }
    }

    private void startTextMode() throws Exception {
        System.out.println("启动文本模式");

        // 发送问候语，对齐Golang版本
        sendGreetingMessage();

        // 启动文本输入线程
        startTextInput();

        // 启动消息接收线程
        startMessageReceiver();
    }

    private void startMicrophoneCapture() throws Exception {
        audioCapture = new AudioCapture();
        audioCapture.startCapture();

        // 启动音频发送线程
        audioSendThread = new Thread(this::microphoneSendLoop);
        audioSendThread.setName("MicrophoneAudioSend");
        audioSendThread.start();

        System.out.println("麦克风采集已启动");
    }

    private void startFilePlayback() throws Exception {
        System.out.println("开始发送音频文件: " + Config.audioFilePath);

        // 读取音频文件
        byte[] audioData = AudioCapture.readWavFile(Config.audioFilePath);

        // 启动文件发送线程
        audioSendThread = new Thread(() -> fileSendLoop(audioData));
        audioSendThread.setName("FileAudioSend");
        audioSendThread.start();
    }

    private void microphoneSendLoop() {
        try {
            while (isRunning.get() && audioCapture.isCapturing()) {
                byte[] audioData = audioCapture.readAudioData();
                if (audioData != null) {
                    netClient.sendAudioData(sessionId, audioData);
                }

                // 模拟实时发送间隔
                Thread.sleep(Config.AUDIO_SEND_INTERVAL);
            }
        } catch (Exception e) {
            System.err.println("麦克风发送线程错误: " + e.getMessage());
        }
    }

    private void fileSendLoop(byte[] audioData) {
        try {
            int chunkSize = Config.AUDIO_CHUNK_SIZE; // 640字节，与Go实现保持一致
            int totalSize = audioData.length;
            int position = 0;
            int chunkCount = 0;

            System.out.println("开始发送音频文件，总大小: " + totalSize + " 字节, 块大小: " + chunkSize + " 字节");

            while (isRunning.get() && position < totalSize) {
                int remaining = totalSize - position;
                int currentChunkSize = Math.min(chunkSize, remaining);

                byte[] chunk = new byte[currentChunkSize];
                System.arraycopy(audioData, position, chunk, 0, currentChunkSize);

                System.out.println("发送音频块 #" + (++chunkCount) + ": 位置=" + position + ", 大小=" + currentChunkSize + " 字节");

                netClient.sendAudioData(sessionId, chunk);

                position += currentChunkSize;

                // 模拟实时发送间隔 - 每20ms发送一块，与Go实现保持一致
                Thread.sleep(Config.AUDIO_SEND_INTERVAL);
            }

            System.out.println("音频文件发送完成，共发送 " + chunkCount + " 块");
            
            // 发送音频结束标记 - 发送一段静音数据提示服务器音频输入结束
            System.out.println("发送音频结束标记...");
            byte[] silenceChunk = new byte[chunkSize]; // 静音数据
            netClient.sendAudioData(sessionId, silenceChunk);
            
            System.out.println("音频文件发送完成，等待服务器响应...");
            // 文件发送完成后，等待服务器通过事件359通知退出
        } catch (Exception e) {
            System.err.println("文件发送线程错误: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendGreetingMessage() throws Exception {
        System.out.println("发送问候语...");
        
        // 创建SayHello载荷，对齐Golang版本，使用事件300
        RequestPayloads.SayHelloPayload payload = new RequestPayloads.SayHelloPayload("你好，我是豆包，有什么可以帮助你的吗？");
        
        String jsonPayload = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
        netClient.sendProtocolMessage(sessionId, jsonPayload, 300); // 事件300 - SayHello，对齐Golang版本
        
        System.out.println("问候语发送完成");
    }

    private void startTextInput() {
        textInputThread = new Thread(this::textInputLoop);
        textInputThread.setName("TextInput");
        textInputThread.start();
    }

    private void textInputLoop() {
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入文本 (输入 'quit' 退出):");

        try {
            while (isRunning.get()) {
                String text = scanner.nextLine();

                if (text.equalsIgnoreCase("quit")) {
                    stop();
                    break;
                }

                if (!text.trim().isEmpty()) {
                    // 使用事件501发送文本查询，对齐Golang版本
                    netClient.sendChatTextQuery(sessionId, text);
                }
            }
        } catch (Exception e) {
            System.err.println("文本输入线程错误: " + e.getMessage());
        }
    }

    private void startMessageReceiver() {
        Thread receiverThread = new Thread(this::messageReceiveLoop);
        receiverThread.setName("MessageReceiver");
        receiverThread.start();
    }

    private void messageReceiveLoop() {
        try {
            while (isRunning.get()) {
                Protocol.Message message = netClient.pollIncomingMessage(1, TimeUnit.SECONDS);
                if (message != null) {
                    // 消息已在NetClient中处理，这里可以添加额外的逻辑
                    if (message.type == Protocol.MsgType.ERROR) {
                        String error = new String(message.payload);
                        System.err.println("服务器错误: " + error);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("消息接收线程错误: " + e.getMessage());
        }
    }

    private void waitForCompletion() throws InterruptedException {
        while (isRunning.get()) {
            Thread.sleep(100);

            // 对于音频文件模式，文件发送完成后等待服务器响应
            if (isAudioMode.get() && !Config.audioFilePath.isEmpty() && audioSendThread != null && !audioSendThread.isAlive()) {
                // 音频文件已发送完成，继续等待服务器响应
                System.out.println("音频文件发送完成，等待服务器响应...");
                // 不退出，继续等待消息接收线程处理服务器响应
                // 服务器会通过事件359通知可以退出
            }
        }
    }

    public void stop() {
        System.out.println("停止通话管理器");
        isRunning.set(false);

        try {
            // 发送会话结束消息（事件102）- 参考Go实现
            if (netClient != null && netClient.isConnected()) {
                System.out.println("发送会话结束消息...");
                finishSession();
                Thread.sleep(100); // 给服务器处理时间
            }
        } catch (Exception e) {
            System.err.println("发送会话结束消息失败: " + e.getMessage());
        }

        // 停止音频采集
        if (audioCapture != null) {
            audioCapture.stopCapture();
        }

        // 关闭WebSocket连接并打印logid
        if (netClient != null) {
            String logid = netClient.getLogid();
            if (logid != null && !logid.isEmpty()) {
                System.out.println("通话结束，logid: " + logid);
            }
            netClient.close();
        }

        // 等待线程结束
        try {
            if (audioSendThread != null) {
                audioSendThread.join(1000);
            }
            if (textInputThread != null) {
                textInputThread.join(1000);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("通话管理器已停止");
    }
    
    private void finishSession() throws Exception {
        if (netClient != null && sessionId != null) {
            netClient.sendProtocolMessage(sessionId, "{}", 102); // 事件102 - FinishSession
            System.out.println("会话结束消息已发送");
        }
    }

    // 通知用户查询事件
    public static void notifyUserQuery() {
        queryChan.offer(new Object());
    }

    // 从处理器停止CallManager
    public static void stopFromHandler() {
        if (currentInstance != null) {
            currentInstance.stop();
        }
    }
}