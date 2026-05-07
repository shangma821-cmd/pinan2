package com.volcengine.realtimedialog;

import org.apache.commons.cli.*;

public class Main {
    
    public static void main(String[] args) {
        // 解析命令行参数
        CommandLine cmd = parseCommandLine(args);
        if (cmd == null) {
            System.exit(1);
        }
        
        // 应用配置
        applyConfiguration(cmd);
        
        // 验证必要的配置
        if (!validateConfiguration()) {
            System.exit(1);
        }
        
        // 启动通话管理器
        CallManager callManager = new CallManager();
        
        try {
            // 添加关闭钩子
            Runtime.getRuntime().addShutdownHook(new Thread(() -> {
                System.out.println("正在关闭应用...");
                callManager.stop();
            }));
            
            // 开始通话
            callManager.start();
            System.out.println("通话结束");
        } catch (Exception e) {
            System.err.println("运行错误: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static CommandLine parseCommandLine(String[] args) {
        Options options = new Options();
        
        // 音频文件路径
        Option audioOption = Option.builder("a")
                .longOpt("audio")
                .desc("音频文件路径，如果不设置则使用麦克风输入")
                .hasArg()
                .argName("FILE")
                .build();
        options.addOption(audioOption);
        
        // 输入模式
        Option modOption = Option.builder("m")
                .longOpt("mod")
                .desc("输入模式：audio（默认）或text")
                .hasArg()
                .argName("MODE")
                .build();
        options.addOption(modOption);
        
        // 音频格式
        Option formatOption = Option.builder("f")
                .longOpt("format")
                .desc("音频格式，默认为pcm，可选pcm_s16le")
                .hasArg()
                .argName("FORMAT")
                .build();
        options.addOption(formatOption);
        
        // 应用ID
        Option appIdOption = Option.builder()
                .longOpt("app_id")
                .desc("应用ID，如果不设置则使用Config中的默认值")
                .hasArg()
                .argName("APP_ID")
                .build();
        options.addOption(appIdOption);
        
        // 访问密钥
        Option accessKeyOption = Option.builder()
                .longOpt("access_key")
                .desc("访问密钥，如果不设置则使用Config中的默认值")
                .hasArg()
                .argName("ACCESS_KEY")
                .build();
        options.addOption(accessKeyOption);
        
        // 帮助
        Option helpOption = Option.builder("h")
                .longOpt("help")
                .desc("显示帮助信息")
                .build();
        options.addOption(helpOption);
        
        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();
        
        try {
            CommandLine cmd = parser.parse(options, args);
            
            if (cmd.hasOption("help")) {
                formatter.printHelp("java -jar realtimelog-1.0.0.jar", options);
                return null;
            }
            
            return cmd;
            
        } catch (ParseException e) {
            System.err.println("参数解析错误: " + e.getMessage());
            formatter.printHelp("java -jar realtimelog-1.0.0.jar", options);
            return null;
        }
    }
    
    private static void applyConfiguration(CommandLine cmd) {
        // 应用音频文件路径
        if (cmd.hasOption("audio")) {
            Config.setAudioFilePath(cmd.getOptionValue("audio"));
        }
        
        // 应用输入模式
        if (cmd.hasOption("mod")) {
            String mode = cmd.getOptionValue("mod");
            if (!mode.equals("audio") && !mode.equals("text")) {
                System.err.println("错误：mod参数必须是audio或text");
                System.exit(1);
            }
            Config.setMod(mode);
        }
        
        // 应用音频格式
        if (cmd.hasOption("format")) {
            String format = cmd.getOptionValue("format");
            if (!format.equals("pcm") && !format.equals("pcm_s16le")) {
                System.err.println("错误：format参数必须是pcm或pcm_s16le");
                System.exit(1);
            }
            Config.setPcmFormat(format);
        }
        
        // 应用应用ID
        if (cmd.hasOption("app_id")) {
            Config.setAppId(cmd.getOptionValue("app_id"));
        }
        
        // 应用访问密钥
        if (cmd.hasOption("access_key")) {
            Config.setAccessKey(cmd.getOptionValue("access_key"));
        }
    }
    
    private static boolean validateConfiguration() {
        // 检查必要的配置
        if (Config.API_APP_ID.equals("your_app_id")) {
            System.err.println("错误：必须设置应用ID");
            System.err.println("请在Config.java中设置API_APP_ID，或使用--app_id参数");
            return false;
        }
        
        if (Config.API_ACCESS_KEY.equals("your_access_key")) {
            System.err.println("错误：必须设置访问密钥");
            System.err.println("请在Config.java中设置API_ACCESS_KEY，或使用--access_key参数");
            return false;
        }
        
        // 检查音频文件是否存在
        if (!Config.audioFilePath.isEmpty()) {
            java.io.File file = new java.io.File(Config.audioFilePath);
            if (!file.exists()) {
                System.err.println("错误：音频文件不存在: " + Config.audioFilePath);
                return false;
            }
        }
        
        return true;
    }
}