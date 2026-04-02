<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1JqsWM7FPfTTFWBnJNs4ibJe5PSW2P1yQ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `VITE_ARK_API_KEY` in [.env.local](.env.local) to your Ark API key
3. (Optional) Set `VITE_ARK_MODEL` (default: `doubao-seed-2-0-pro-260215`)
4. Set Volc TTS config in `.env.local`:
   - `VITE_VOLC_TTS_APP_ID`
   - `VITE_VOLC_TTS_ACCESS_TOKEN`
   - (Optional) `VITE_VOLC_TTS_RESOURCE_ID` (default: `volc.service_type.10029`)
   - (Optional) `VITE_VOLC_TTS_ENDPOINT=/api/volc-tts` (recommended for local dev to avoid browser CORS)
5. For realtime Q&A, also set:
   - `VITE_VOLC_DIALOG_APP_ID`
   - `VITE_VOLC_DIALOG_ACCESS_TOKEN`
   - `VITE_VOLC_DIALOG_RESOURCE_ID`
   - (Optional) `VITE_VOLC_DIALOG_APP_KEY` (default: `PlgvMymc7f3tQnJ6`)
   - (Optional) `VITE_VOLC_DIALOG_ENDPOINT=/api/volc-dialog`
6. If realtime websocket startup fails and you see `requested resource not granted`, the configured
   `VITE_VOLC_DIALOG_RESOURCE_ID` is not granted to your AppID/AccessToken pair. Use the resource ID
   granted in Volc console for the same app.
7. Run the app:
   `npm run dev`

## Deploy To Alibaba Cloud ECS

Use the beginner guide in `DEPLOY_ALIYUN_ECS.md`.

### One-command update on server

After you upload updated code to the ECS project directory:

```bash
chmod +x deploy.sh
./deploy.sh
```

Useful commands:

```bash
./deploy.sh status
./deploy.sh logs
./deploy.sh restart
./deploy.sh down
```
