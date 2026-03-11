# RealtimeDialog Java客户端

## 项目简介
Java版本的RealtimeDialog客户端，支持实时语音对话功能。

## 环境要求
- Java 1.8 或更高版本
- Maven 3.6 或更高版本

## 快速开始

### 1. 编译项目
```bash
cd java
mvn clean compile
```

### 2. 运行应用

#### 麦克风模式（默认）
```bash
mvn exec:java
```

#### 音频文件模式
```bash
mvn exec:java -Dexec.args="--audio=whoareyou.wav"
```

#### 文本模式
```bash
mvn exec:java -Dexec.args="--mod=text"
```

#### 指定音频格式
```bash
mvn exec:java -Dexec.args="--format=pcm_s16le"
```

### 3. 打包可执行JAR
```bash
mvn clean package
java -jar target/realtimedialog-1.0.0.jar --audio=whoareyou.wav
```

## 配置说明

在使用前，需要在`Config.java`中配置以下参数：
- `X-Api-App-ID`: 你的应用ID
- `X-Api-Access-Key`: 你的访问密钥

## 功能特性
- 支持麦克风实时语音输入
- 支持音频文件输入
- 支持文本输入模式
- 支持音频输出播放
- 支持外部RAG功能
- 支持多种音频格式（pcm, pcm_s16le）

## 命令行参数
- `--format`: 音频格式，默认为"pcm"
- `--audio`: 音频文件路径，如果不设置则使用麦克风输入
- `--mod`: 输入模式，audio（默认）或text