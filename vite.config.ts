import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Elastic product manuals: scan public/entry-station/manuals/*.pdf at build (and
// dev-server) time and expose the result as the `virtual:manuals-manifest`
// module. The PDF filename (sans extension) is the permanent slug/NFC id, so the
// page adapts to however many PDFs exist — drop a PDF, rebuild, it appears.
function manualsManifestPlugin(): Plugin {
  const VIRTUAL_ID = 'virtual:manuals-manifest';
  const RESOLVED_ID = '\0' + VIRTUAL_ID;
  const manualsDir = path.resolve(__dirname, 'public/entry-station/manuals');

  const scan = (): Array<{ id: string; file: string }> => {
    let files: string[] = [];
    try {
      files = fs.readdirSync(manualsDir).filter((name) => /\.pdf$/i.test(name));
    } catch {
      files = [];
    }
    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    return files.map((file) => ({ id: file.replace(/\.pdf$/i, ''), file }));
  };

  return {
    name: 'pinan-manuals-manifest',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export const manualsManifest = ${JSON.stringify(scan())};`;
    },
    configureServer(server) {
      server.watcher.add(manualsDir);
      const onChange = (changed: string) => {
        if (!changed.startsWith(manualsDir) || !/\.pdf$/i.test(changed)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', onChange);
      server.watcher.on('unlink', onChange);
    },
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const volcAppId = env.VITE_VOLC_TTS_APP_ID || env.VITE_VOLC_APP_ID || '';
    const volcAccessToken = env.VITE_VOLC_TTS_ACCESS_TOKEN || env.VITE_VOLC_ACCESS_TOKEN || '';
    const volcResourceId = env.VITE_VOLC_TTS_RESOURCE_ID || 'volc.service_type.10029';
    const volcAsrAppId = env.VITE_VOLC_ASR_APP_ID || env.VITE_VOLC_TTS_APP_ID || env.VITE_VOLC_APP_ID || '';
    const volcAsrAccessToken = env.VITE_VOLC_ASR_ACCESS_TOKEN || env.VITE_VOLC_TTS_ACCESS_TOKEN || env.VITE_VOLC_ACCESS_TOKEN || '';
    const volcAsrResourceId = env.VITE_VOLC_ASR_RESOURCE_ID || 'volc.bigasr.auc_turbo';
    const volcDialogAppId = env.VITE_VOLC_DIALOG_APP_ID || env.VITE_VOLC_TTS_APP_ID || env.VITE_VOLC_APP_ID || '';
    const volcDialogAccessToken = env.VITE_VOLC_DIALOG_ACCESS_TOKEN || env.VITE_VOLC_TTS_ACCESS_TOKEN || env.VITE_VOLC_ACCESS_TOKEN || '';
    const volcDialogResourceId = env.VITE_VOLC_DIALOG_RESOURCE_ID || 'volc.speech.dialog';
    const volcDialogAppKey = env.VITE_VOLC_DIALOG_APP_KEY || '';
    const toSingleHeaderValue = (value: unknown): string => {
      if (Array.isArray(value)) return String(value[0] || '').trim();
      return String(value || '').trim();
    };
    const selectAsrAuth = (profileRaw: string) => {
      const profile = profileRaw.toLowerCase();
      if (profile === 'tts') {
        return { appId: volcAppId, accessToken: volcAccessToken };
      }
      if (profile === 'dialog') {
        return { appId: volcDialogAppId, accessToken: volcDialogAccessToken };
      }
      return { appId: volcAsrAppId, accessToken: volcAsrAccessToken };
    };

    const createAsrProxy = (rewritePath: string, withSequence = false) => ({
      target: 'https://openspeech.bytedance.com',
      changeOrigin: true,
      secure: true,
      rewrite: () => rewritePath,
      configure: (proxy: any) => {
        proxy.on('proxyReq', (proxyReq: any, req: any) => {
          const clientResourceId = String(proxyReq.getHeader('x-volc-resource-id') || '').trim();
          const clientRequestId = String(proxyReq.getHeader('x-volc-request-id') || '').trim();
          const resourceId = clientResourceId || volcAsrResourceId;
          const requestId = clientRequestId || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

        proxyReq.removeHeader('x-volc-resource-id');
        proxyReq.removeHeader('x-volc-request-id');
        proxyReq.removeHeader('x-volc-auth-profile');
        const authProfile = toSingleHeaderValue(req?.headers?.['x-volc-auth-profile']);
        const selectedAuth = selectAsrAuth(authProfile);
        if (selectedAuth.appId) {
          proxyReq.setHeader('X-Api-App-Key', selectedAuth.appId);
          proxyReq.setHeader('X-Api-App-Id', selectedAuth.appId);
        }
        if (selectedAuth.accessToken) proxyReq.setHeader('X-Api-Access-Key', selectedAuth.accessToken);
        if (resourceId) proxyReq.setHeader('X-Api-Resource-Id', resourceId);
        proxyReq.setHeader('X-Api-Request-Id', requestId);
        if (withSequence) {
            proxyReq.setHeader('X-Api-Sequence', '-1');
          } else {
            proxyReq.removeHeader('X-Api-Sequence');
          }
        });
      },
    });

    const createConnectId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/volc-tts': {
            target: 'https://openspeech.bytedance.com',
            changeOrigin: true,
            secure: true,
            rewrite: () => '/api/v3/tts/unidirectional',
            configure: (proxy) => {
              proxy.on('proxyReq', (proxyReq) => {
                if (volcAppId) proxyReq.setHeader('X-Api-App-Id', volcAppId);
                if (volcAccessToken) proxyReq.setHeader('X-Api-Access-Key', volcAccessToken);
                if (volcResourceId) proxyReq.setHeader('X-Api-Resource-Id', volcResourceId);
              });
            },
          },
          '/api/volc-asr': {
            ...createAsrProxy('/api/v3/auc/bigmodel/recognize/flash', true),
          },
          '/api/volc-asr-submit': {
            ...createAsrProxy('/api/v3/auc/bigmodel/submit', false),
          },
          '/api/volc-asr-query': {
            ...createAsrProxy('/api/v3/auc/bigmodel/query', false),
          },
          '/api/volc-dialog': {
            target: 'wss://openspeech.bytedance.com',
            ws: true,
            changeOrigin: true,
            secure: true,
            rewrite: () => '/api/v3/realtime/dialogue',
            configure: (proxy: any) => {
              proxy.on('proxyReqWs', (proxyReq: any, req: any) => {
                const headerValue = req?.headers?.['x-volc-connect-id'];
                const connectIdRaw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
                const connectId = String(connectIdRaw || createConnectId()).trim();

                if (volcDialogAppId) proxyReq.setHeader('X-Api-App-ID', volcDialogAppId);
                if (volcDialogAccessToken) proxyReq.setHeader('X-Api-Access-Key', volcDialogAccessToken);
                if (volcDialogResourceId) proxyReq.setHeader('X-Api-Resource-Id', volcDialogResourceId);
                if (volcDialogAppKey) proxyReq.setHeader('X-Api-App-Key', volcDialogAppKey);
                proxyReq.setHeader('X-Api-Connect-Id', connectId || createConnectId());
              });
            },
          },
        },
      },
      plugins: [react(), manualsManifestPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.VITE_ARK_API_KEY': JSON.stringify(env.VITE_ARK_API_KEY),
        'process.env.VITE_ARK_MODEL': JSON.stringify(env.VITE_ARK_MODEL),
        'process.env.VITE_ARK_BASE_URL': JSON.stringify(env.VITE_ARK_BASE_URL),
        'process.env.VITE_VOLC_TTS_APP_ID': JSON.stringify(env.VITE_VOLC_TTS_APP_ID),
        'process.env.VITE_VOLC_TTS_ACCESS_TOKEN': JSON.stringify(env.VITE_VOLC_TTS_ACCESS_TOKEN),
        'process.env.VITE_VOLC_TTS_RESOURCE_ID': JSON.stringify(env.VITE_VOLC_TTS_RESOURCE_ID),
        'process.env.VITE_VOLC_TTS_SPEAKER': JSON.stringify(env.VITE_VOLC_TTS_SPEAKER),
        'process.env.VITE_VOLC_TTS_ENDPOINT': JSON.stringify(env.VITE_VOLC_TTS_ENDPOINT),
        'process.env.VITE_VOLC_TTS_UID': JSON.stringify(env.VITE_VOLC_TTS_UID),
        'process.env.VITE_VOLC_ASR_APP_ID': JSON.stringify(env.VITE_VOLC_ASR_APP_ID),
        'process.env.VITE_VOLC_ASR_ACCESS_TOKEN': JSON.stringify(env.VITE_VOLC_ASR_ACCESS_TOKEN),
        'process.env.VITE_VOLC_ASR_RESOURCE_ID': JSON.stringify(env.VITE_VOLC_ASR_RESOURCE_ID),
        'process.env.VITE_VOLC_ASR_ENDPOINT': JSON.stringify(env.VITE_VOLC_ASR_ENDPOINT),
        'process.env.VITE_VOLC_ASR_SUBMIT_ENDPOINT': JSON.stringify(env.VITE_VOLC_ASR_SUBMIT_ENDPOINT),
        'process.env.VITE_VOLC_ASR_QUERY_ENDPOINT': JSON.stringify(env.VITE_VOLC_ASR_QUERY_ENDPOINT),
        'process.env.VITE_VOLC_ASR_UID': JSON.stringify(env.VITE_VOLC_ASR_UID),
        'process.env.VITE_VOLC_DIALOG_APP_ID': JSON.stringify(env.VITE_VOLC_DIALOG_APP_ID),
        'process.env.VITE_VOLC_DIALOG_ACCESS_TOKEN': JSON.stringify(env.VITE_VOLC_DIALOG_ACCESS_TOKEN),
        'process.env.VITE_VOLC_DIALOG_RESOURCE_ID': JSON.stringify(env.VITE_VOLC_DIALOG_RESOURCE_ID),
        'process.env.VITE_VOLC_DIALOG_APP_KEY': JSON.stringify(env.VITE_VOLC_DIALOG_APP_KEY),
        'process.env.VITE_VOLC_DIALOG_ENDPOINT': JSON.stringify(env.VITE_VOLC_DIALOG_ENDPOINT),
        'process.env.VITE_VOLC_DIALOG_VOICE': JSON.stringify(env.VITE_VOLC_DIALOG_VOICE),
        'process.env.VITE_VOLC_DIALOG_MODEL': JSON.stringify(env.VITE_VOLC_DIALOG_MODEL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
