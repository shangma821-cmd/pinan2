package com.volcengine.realtimedialog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.*;

public class Protocol {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // 消息类型
    public enum MsgType {
        INVALID(0),
        FULL_CLIENT(1),
        AUDIO_ONLY_CLIENT(2),
        FULL_SERVER(9),
        AUDIO_ONLY_SERVER(11),
        FRONT_END_RESULT_SERVER(12),
        ERROR(15);
        
        private final int value;
        
        MsgType(int value) {
            this.value = value;
        }
        
        public int getValue() {
            return value;
        }
        
        public static MsgType fromBits(int bits) {
            for (MsgType type : values()) {
                if (type.value == bits) {
                    return type;
                }
            }
            return INVALID;
        }
    }
    
    // 消息类型标志位
    public static final int MSG_TYPE_FLAG_NO_SEQ = 0;
    public static final int MSG_TYPE_FLAG_POSITIVE_SEQ = 0b1;
    public static final int MSG_TYPE_FLAG_LAST_NO_SEQ = 0b10;
    public static final int MSG_TYPE_FLAG_NEGATIVE_SEQ = 0b11;
    public static final int MSG_TYPE_FLAG_WITH_EVENT = 0b100;
    
    // 版本和头部大小
    public static final int VERSION_1 = 0x10;
    public static final int HEADER_SIZE_4 = 0x1;
    
    // 序列化方法
    public static final int SERIALIZATION_RAW = 0;
    public static final int SERIALIZATION_JSON = 0b1 << 4;
    
    // 压缩方法
    public static final int COMPRESSION_NONE = 0;
    
    public static class Message {
        public MsgType type;
        public int typeFlag;
        public int event;
        public String sessionId;
        public String connectId;
        public int sequence;
        public long errorCode;
        public byte[] payload;
        
        public Message() {
            this.type = MsgType.INVALID;
        }
    }
    
    public static byte[] marshal(Message msg) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(baos);
        
        // 构建头部
        int versionAndHeaderSize = VERSION_1 | HEADER_SIZE_4;
        dos.writeByte(versionAndHeaderSize);
        
        // 消息类型和标志
        int typeAndFlag = (msg.type.getValue() << 4) | (msg.typeFlag & 0x0F);
        dos.writeByte(typeAndFlag);
        
        // 序列化和压缩
        int serializationAndCompression = SERIALIZATION_JSON | COMPRESSION_NONE;
        dos.writeByte(serializationAndCompression);
        
        // 保留字节
        dos.writeByte(0);
        
        // 根据消息类型写入数据
        List<WriteFunc> writers = getWriters(msg);
        for (WriteFunc writer : writers) {
            writer.write(dos, msg);
        }
        
        return baos.toByteArray();
    }
    
    public static Message unmarshal(byte[] data) throws IOException {
        if (data.length < 4) {
            throw new IOException("数据长度不足");
        }
        
        ByteBuffer buf = ByteBuffer.wrap(data).order(ByteOrder.BIG_ENDIAN);
        Message msg = new Message();
        
        // 读取头部
        int versionAndHeaderSize = buf.get() & 0xFF;
        int typeAndFlag = buf.get() & 0xFF;
        int serializationAndCompression = buf.get() & 0xFF;
        int reserved = buf.get() & 0xFF;
        
        // 解析消息类型
        int msgTypeBits = (typeAndFlag >> 4) & 0x0F;
        msg.type = MsgType.fromBits(msgTypeBits);
        msg.typeFlag = typeAndFlag & 0x0F;
        
        // 根据消息类型读取数据
        List<ReadFunc> readers = getReaders(msg);
        for (ReadFunc reader : readers) {
            reader.read(buf, msg);
        }
        
        return msg;
    }
    
    private interface WriteFunc {
        void write(DataOutputStream dos, Message msg) throws IOException;
    }
    
    private interface ReadFunc {
        void read(ByteBuffer buf, Message msg) throws IOException;
    }
    
    private static List<WriteFunc> getWriters(Message msg) {
        List<WriteFunc> writers = new ArrayList<>();
        
        // 事件ID
        if (containsEvent(msg.typeFlag)) {
            writers.add((dos, m) -> dos.writeInt(m.event));
        }
        
        // 会话ID
        if (shouldWriteSessionId(msg)) {
            writers.add((dos, m) -> {
                byte[] sessionIdBytes = m.sessionId.getBytes("UTF-8");
                dos.writeInt(sessionIdBytes.length);
                dos.write(sessionIdBytes);
            });
        }
        
        // 连接ID
        if (shouldWriteConnectId(msg)) {
            writers.add((dos, m) -> {
                byte[] connectIdBytes = m.connectId.getBytes("UTF-8");
                dos.writeInt(connectIdBytes.length);
                dos.write(connectIdBytes);
            });
        }
        
        // 序列号
        if (containsSequence(msg.typeFlag)) {
            writers.add((dos, m) -> dos.writeInt(m.sequence));
        }
        
        // 错误码
        if (msg.type == MsgType.ERROR) {
            writers.add((dos, m) -> dos.writeInt((int) m.errorCode));
        }
        
        // 载荷
        writers.add((dos, m) -> {
            if (m.payload != null) {
                dos.writeInt(m.payload.length);
                dos.write(m.payload);
            } else {
                dos.writeInt(0);
            }
        });
        
        return writers;
    }
    
    private static List<ReadFunc> getReaders(Message msg) {
        List<ReadFunc> readers = new ArrayList<>();
        
        // 事件ID
        if (containsEvent(msg.typeFlag)) {
            readers.add((buf, m) -> m.event = buf.getInt());
        }
        
        // 会话ID
        if (shouldReadSessionId(msg)) {
            readers.add((buf, m) -> {
                int size = buf.getInt();
                if (size > 0) {
                    byte[] bytes = new byte[size];
                    buf.get(bytes);
                    m.sessionId = new String(bytes, "UTF-8");
                }
            });
        }
        
        // 连接ID
        if (shouldReadConnectId(msg)) {
            readers.add((buf, m) -> {
                int size = buf.getInt();
                if (size > 0) {
                    byte[] bytes = new byte[size];
                    buf.get(bytes);
                    m.connectId = new String(bytes, "UTF-8");
                }
            });
        }
        
        // 序列号
        if (containsSequence(msg.typeFlag)) {
            readers.add((buf, m) -> m.sequence = buf.getInt());
        }
        
        // 错误码
        if (msg.type == MsgType.ERROR) {
            readers.add((buf, m) -> m.errorCode = buf.getInt() & 0xFFFFFFFFL);
        }
        
        // 载荷
        readers.add((buf, m) -> {
            int size = buf.getInt();
            if (size > 0) {
                m.payload = new byte[size];
                buf.get(m.payload);
            }
        });
        
        return readers;
    }
    
    private static boolean containsEvent(int typeFlag) {
        return (typeFlag & MSG_TYPE_FLAG_WITH_EVENT) == MSG_TYPE_FLAG_WITH_EVENT;
    }
    
    private static boolean containsSequence(int typeFlag) {
        return (typeFlag & MSG_TYPE_FLAG_POSITIVE_SEQ) == MSG_TYPE_FLAG_POSITIVE_SEQ ||
               (typeFlag & MSG_TYPE_FLAG_NEGATIVE_SEQ) == MSG_TYPE_FLAG_NEGATIVE_SEQ;
    }
    
    private static boolean shouldWriteSessionId(Message msg) {
        // 根据Go版本的逻辑，某些事件不需要会话ID
        return containsEvent(msg.typeFlag) && 
               msg.event != 1 && msg.event != 2 && msg.event != 50 && msg.event != 51 && msg.event != 52;
    }
    
    private static boolean shouldReadSessionId(Message msg) {
        return containsEvent(msg.typeFlag) && 
               msg.event != 1 && msg.event != 2 && msg.event != 50 && msg.event != 51 && msg.event != 52;
    }
    
    private static boolean shouldWriteConnectId(Message msg) {
        return containsEvent(msg.typeFlag) && (msg.event == 50 || msg.event == 51 || msg.event == 52);
    }
    
    private static boolean shouldReadConnectId(Message msg) {
        return containsEvent(msg.typeFlag) && (msg.event == 50 || msg.event == 51 || msg.event == 52);
    }
    
    // 辅助方法
    public static byte[] createStartConnectionMessage() throws IOException {
        Message msg = new Message();
        msg.type = MsgType.FULL_CLIENT;
        msg.typeFlag = MSG_TYPE_FLAG_WITH_EVENT;
        msg.event = 1;
        msg.payload = "{}".getBytes("UTF-8");
        return marshal(msg);
    }
    
    public static byte[] createStartSessionMessage(String sessionId, String payload) throws IOException {
        Message msg = new Message();
        msg.type = MsgType.FULL_CLIENT;
        msg.typeFlag = MSG_TYPE_FLAG_WITH_EVENT;
        msg.event = 100;
        msg.sessionId = sessionId;
        msg.payload = payload.getBytes("UTF-8");
        return marshal(msg);
    }
    
    public static byte[] createAudioMessage(String sessionId, byte[] audioData) throws IOException {
        Message msg = new Message();
        msg.type = MsgType.AUDIO_ONLY_CLIENT;
        msg.typeFlag = MSG_TYPE_FLAG_WITH_EVENT;
        msg.event = 200; // 音频事件 - 完全对齐Go版本
        msg.sessionId = sessionId;
        msg.payload = audioData;
        return marshalRawAudio(msg);
    }
    
    // 专门用于音频消息的方法 - 使用原始序列化
    private static byte[] marshalRawAudio(Message message) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DataOutputStream dos = new DataOutputStream(baos);
        
        // 构建头部 - 使用原始序列化
        int versionAndHeaderSize = VERSION_1 | HEADER_SIZE_4;
        dos.writeByte(versionAndHeaderSize);
        
        // 消息类型和标志
        int typeAndFlag = (message.type.getValue() << 4) | (message.typeFlag & 0x0F);
        dos.writeByte(typeAndFlag);
        
        // 序列化和压缩 - 使用原始数据
        int serializationAndCompression = SERIALIZATION_RAW | COMPRESSION_NONE;
        dos.writeByte(serializationAndCompression);
        
        // 保留字节
        dos.writeByte(0);
        
        // 事件ID
        if (containsEvent(message.typeFlag)) {
            dos.writeInt(message.event);
        }
        
        // 会话ID
        if (shouldWriteSessionId(message)) {
            byte[] sessionIdBytes = message.sessionId.getBytes("UTF-8");
            dos.writeInt(sessionIdBytes.length);
            dos.write(sessionIdBytes);
        }
        
        // 载荷
        if (message.payload != null) {
            dos.writeInt(message.payload.length);
            dos.write(message.payload);
        } else {
            dos.writeInt(0);
        }
        
        return baos.toByteArray();
    }
    
    public static String generateSessionId() {
        return UUID.randomUUID().toString();
    }
    
    // 创建FullClient消息 - 用于兼容旧代码
    public static byte[] createFullClientMessage(String sessionId, String text) throws IOException {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("session_id", sessionId);
        root.put("text", text);
        root.put("speaker", Config.DEFAULT_SPEAKER);
        
        Message message = new Message();
        message.type = MsgType.FULL_CLIENT;
        message.typeFlag = MSG_TYPE_FLAG_WITH_EVENT;
        message.sessionId = sessionId;
        message.payload = objectMapper.writeValueAsBytes(root);
        
        return marshal(message);
    }
}