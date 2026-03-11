package com.volcengine.realtimedialog;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.HashMap;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class RequestPayloads {
    
    // StartSession请求载荷
    public static class StartSessionPayload {
        public ASRPayload asr;
        public TTSPayload tts;
        public DialogPayload dialog;
        
        public StartSessionPayload() {
            this.asr = new ASRPayload();
            this.tts = new TTSPayload();
            this.dialog = new DialogPayload();
        }
    }
    
    public static class ASRPayload {
        public Map<String, Object> extra = new HashMap<>();
    }
    
    public static class TTSPayload {
        public String speaker = Config.DEFAULT_SPEAKER;
        public AudioConfig audio_config = new AudioConfig();
    }
    
    public static class AudioConfig {
        public int channel = 1;
        public String format = Config.pcmFormat;
        public int sample_rate = Config.OUTPUT_SAMPLE_RATE;
    }
    
    public static class DialogPayload {
        public String dialog_id = "";
        public String bot_name = "豆包";
        public String system_role = "你使用活泼灵动的女声，性格开朗，热爱生活。";
        public String speaking_style = "你的说话风格简洁明了，语速适中，语调自然。";
        public LocationInfo location = new LocationInfo();
        public Map<String, Object> extra = new HashMap<>();
    }
    
    public static class LocationInfo {
        public double longitude = 0.0;
        public double latitude = 0.0;
        public String city = "北京";
        public String country = "中国";
        public String province = "北京";
        public String district = "";
        public String town = "";
        public String country_code = "CN";
        public String address = "";
    }
    
    // SayHello请求载荷
    public static class SayHelloPayload {
        public String content;
        
        public SayHelloPayload(String content) {
            this.content = content;
        }
    }
    
    // ChatTextQuery请求载荷
    public static class ChatTextQueryPayload {
        public String content;
        
        public ChatTextQueryPayload(String content) {
            this.content = content;
        }
    }
    
    // ChatTTSText请求载荷
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
    
    // ChatRAGText请求载荷
    public static class ChatRAGTextPayload {
        public String external_rag;
        
        public ChatRAGTextPayload(String externalRAG) {
            this.external_rag = externalRAG;
        }
    }
}