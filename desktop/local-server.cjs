const fs = require("fs");
const http = require("http");
const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const OPEN_SPEECH_HOST = "openspeech.bytedance.com";
const OPEN_SPEECH_HTTPS = `https://${OPEN_SPEECH_HOST}`;
const DEFAULT_PORT = 37891;

const trim = (value) => String(value || "").trim();

const pickEnv = (...keys) => {
  for (const key of keys) {
    const val = trim(process.env[key]);
    if (val) return val;
  }
  return "";
};

const loadEnvFiles = (appRoot) => {
  const candidates = [
    process.env.PPT_ENV_FILE,
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    path.join(appRoot, ".env.local"),
    path.join(appRoot, ".env"),
    process.resourcesPath ? path.join(process.resourcesPath, ".env.local") : "",
    process.resourcesPath ? path.join(process.resourcesPath, ".env") : "",
  ]
    .map((item) => trim(item))
    .filter(Boolean);

  const loaded = [];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    dotenv.config({ path: file, override: false });
    loaded.push(file);
  }
  return loaded;
};

const buildVolcConfig = () => {
  const tts = {
    appId: pickEnv("VOLC_TTS_APP_ID", "VITE_VOLC_TTS_APP_ID", "VITE_VOLC_APP_ID"),
    accessToken: pickEnv("VOLC_TTS_ACCESS_TOKEN", "VITE_VOLC_TTS_ACCESS_TOKEN", "VITE_VOLC_ACCESS_TOKEN"),
    resourceId: pickEnv("VOLC_TTS_RESOURCE_ID", "VITE_VOLC_TTS_RESOURCE_ID", "VITE_VOLC_TTS_RESOURCE_ID"),
  };

  const asr = {
    appId: pickEnv(
      "VOLC_ASR_APP_ID",
      "VITE_VOLC_ASR_APP_ID",
      "VITE_VOLC_TTS_APP_ID",
      "VITE_VOLC_APP_ID"
    ),
    accessToken: pickEnv(
      "VOLC_ASR_ACCESS_TOKEN",
      "VITE_VOLC_ASR_ACCESS_TOKEN",
      "VITE_VOLC_TTS_ACCESS_TOKEN",
      "VITE_VOLC_ACCESS_TOKEN"
    ),
    resourceId: pickEnv("VOLC_ASR_RESOURCE_ID", "VITE_VOLC_ASR_RESOURCE_ID", "volc.bigasr.auc_turbo"),
  };

  const dialog = {
    appId: pickEnv(
      "VOLC_DIALOG_APP_ID",
      "VITE_VOLC_DIALOG_APP_ID",
      "VITE_VOLC_TTS_APP_ID",
      "VITE_VOLC_APP_ID"
    ),
    accessToken: pickEnv(
      "VOLC_DIALOG_ACCESS_TOKEN",
      "VITE_VOLC_DIALOG_ACCESS_TOKEN",
      "VITE_VOLC_TTS_ACCESS_TOKEN",
      "VITE_VOLC_ACCESS_TOKEN"
    ),
    resourceId: pickEnv("VOLC_DIALOG_RESOURCE_ID", "VITE_VOLC_DIALOG_RESOURCE_ID", "volc.speech.dialog"),
    appKey: pickEnv("VOLC_DIALOG_APP_KEY", "VITE_VOLC_DIALOG_APP_KEY", "PlgvMymc7f3tQnJ6"),
  };

  return { tts, asr, dialog };
};

const generateRequestId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createProxy = (pathRewrite, onProxyReq) =>
  createProxyMiddleware({
    target: OPEN_SPEECH_HTTPS,
    changeOrigin: true,
    secure: true,
    ws: false,
    pathRewrite,
    on: {
      proxyReq: onProxyReq,
    },
  });

const selectAsrAuth = (volc, profileRaw) => {
  const profile = trim(profileRaw).toLowerCase();
  if (profile === "tts") {
    return { appId: volc.tts.appId, accessToken: volc.tts.accessToken };
  }
  if (profile === "dialog") {
    return { appId: volc.dialog.appId, accessToken: volc.dialog.accessToken };
  }
  return { appId: volc.asr.appId, accessToken: volc.asr.accessToken };
};

const startLocalServer = async (options = {}) => {
  const appRoot = options.appRoot || path.resolve(__dirname, "..");
  const distDir = options.distDir || path.join(appRoot, "dist");
  const port = Number(options.port || DEFAULT_PORT);

  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(`dist not found: ${distDir}`);
  }

  const loadedEnvFiles = loadEnvFiles(appRoot);
  const volc = buildVolcConfig();

  const app = express();
  app.disable("x-powered-by");

  app.get("/healthz", (_req, res) => {
    res.status(200).json({
      ok: true,
      envLoaded: loadedEnvFiles.length > 0,
      envFiles: loadedEnvFiles,
    });
  });

  app.use(
    "/api/volc-tts",
    createProxy(
      { "^/api/volc-tts$": "/api/v3/tts/unidirectional" },
      (proxyReq) => {
        if (volc.tts.appId) proxyReq.setHeader("X-Api-App-Id", volc.tts.appId);
        if (volc.tts.accessToken) proxyReq.setHeader("X-Api-Access-Key", volc.tts.accessToken);
        if (volc.tts.resourceId) proxyReq.setHeader("X-Api-Resource-Id", volc.tts.resourceId);
      }
    )
  );

  app.use(
    "/api/volc-asr",
    createProxy(
      { "^/api/volc-asr$": "/api/v3/auc/bigmodel/recognize/flash" },
      (proxyReq, req) => {
        const resourceId = trim(req.headers["x-volc-resource-id"]) || volc.asr.resourceId;
        const requestId = trim(req.headers["x-volc-request-id"]) || generateRequestId();
        const authProfile = trim(req.headers["x-volc-auth-profile"]);
        const selectedAuth = selectAsrAuth(volc, authProfile);
        proxyReq.removeHeader("x-volc-resource-id");
        proxyReq.removeHeader("x-volc-request-id");
        proxyReq.removeHeader("x-volc-auth-profile");
        if (selectedAuth.appId) {
          proxyReq.setHeader("X-Api-App-Key", selectedAuth.appId);
          proxyReq.setHeader("X-Api-App-Id", selectedAuth.appId);
        }
        if (selectedAuth.accessToken) proxyReq.setHeader("X-Api-Access-Key", selectedAuth.accessToken);
        if (resourceId) proxyReq.setHeader("X-Api-Resource-Id", resourceId);
        proxyReq.setHeader("X-Api-Request-Id", requestId);
        proxyReq.setHeader("X-Api-Sequence", "-1");
      }
    )
  );

  app.use(
    "/api/volc-asr-submit",
    createProxy(
      { "^/api/volc-asr-submit$": "/api/v3/auc/bigmodel/submit" },
      (proxyReq, req) => {
        const resourceId = trim(req.headers["x-volc-resource-id"]) || volc.asr.resourceId;
        const requestId = trim(req.headers["x-volc-request-id"]) || generateRequestId();
        const authProfile = trim(req.headers["x-volc-auth-profile"]);
        const selectedAuth = selectAsrAuth(volc, authProfile);
        proxyReq.removeHeader("x-volc-resource-id");
        proxyReq.removeHeader("x-volc-request-id");
        proxyReq.removeHeader("x-volc-auth-profile");
        if (selectedAuth.appId) {
          proxyReq.setHeader("X-Api-App-Key", selectedAuth.appId);
          proxyReq.setHeader("X-Api-App-Id", selectedAuth.appId);
        }
        if (selectedAuth.accessToken) proxyReq.setHeader("X-Api-Access-Key", selectedAuth.accessToken);
        if (resourceId) proxyReq.setHeader("X-Api-Resource-Id", resourceId);
        proxyReq.setHeader("X-Api-Request-Id", requestId);
      }
    )
  );

  app.use(
    "/api/volc-asr-query",
    createProxy(
      { "^/api/volc-asr-query$": "/api/v3/auc/bigmodel/query" },
      (proxyReq, req) => {
        const resourceId = trim(req.headers["x-volc-resource-id"]) || volc.asr.resourceId;
        const requestId = trim(req.headers["x-volc-request-id"]) || generateRequestId();
        const authProfile = trim(req.headers["x-volc-auth-profile"]);
        const selectedAuth = selectAsrAuth(volc, authProfile);
        proxyReq.removeHeader("x-volc-resource-id");
        proxyReq.removeHeader("x-volc-request-id");
        proxyReq.removeHeader("x-volc-auth-profile");
        if (selectedAuth.appId) {
          proxyReq.setHeader("X-Api-App-Key", selectedAuth.appId);
          proxyReq.setHeader("X-Api-App-Id", selectedAuth.appId);
        }
        if (selectedAuth.accessToken) proxyReq.setHeader("X-Api-Access-Key", selectedAuth.accessToken);
        if (resourceId) proxyReq.setHeader("X-Api-Resource-Id", resourceId);
        proxyReq.setHeader("X-Api-Request-Id", requestId);
      }
    )
  );

  const wsDialogProxy = createProxyMiddleware({
    target: OPEN_SPEECH_HTTPS,
    changeOrigin: true,
    secure: true,
    ws: true,
    pathRewrite: { "^/api/volc-dialog$": "/api/v3/realtime/dialogue" },
    on: {
      proxyReqWs: (proxyReq, req) => {
        const connectId = trim(req.headers["x-volc-connect-id"]) || generateRequestId();
        if (volc.dialog.appId) proxyReq.setHeader("X-Api-App-ID", volc.dialog.appId);
        if (volc.dialog.accessToken) proxyReq.setHeader("X-Api-Access-Key", volc.dialog.accessToken);
        if (volc.dialog.resourceId) proxyReq.setHeader("X-Api-Resource-Id", volc.dialog.resourceId);
        if (volc.dialog.appKey) proxyReq.setHeader("X-Api-App-Key", volc.dialog.appKey);
        proxyReq.setHeader("X-Api-Connect-Id", connectId);
      },
    },
  });
  app.use("/api/volc-dialog", wsDialogProxy);

  app.use(express.static(distDir, { index: false, maxAge: "1h" }));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });

  const server = http.createServer(app);
  server.on("upgrade", (req, socket, head) => {
    if (req.url && req.url.startsWith("/api/volc-dialog")) {
      wsDialogProxy.upgrade(req, socket, head);
      return;
    }
    socket.destroy();
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  return {
    appRoot,
    distDir,
    port,
    envFiles: loadedEnvFiles,
    close: async () =>
      await new Promise((resolve) => {
        server.close(() => resolve());
      }),
  };
};

module.exports = { startLocalServer, DEFAULT_PORT };
