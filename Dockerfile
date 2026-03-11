FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time envs used by Vite (compiled into frontend bundle).
ARG VITE_ARK_API_KEY
ARG VITE_ARK_MODEL=doubao-seed-2-0-pro-260215
ARG VITE_ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARG VITE_VOLC_TTS_ENDPOINT=/api/volc-tts
ARG VITE_VOLC_ASR_ENDPOINT=/api/volc-asr
ARG VITE_VOLC_ASR_SUBMIT_ENDPOINT=/api/volc-asr-submit
ARG VITE_VOLC_ASR_QUERY_ENDPOINT=/api/volc-asr-query
ARG VITE_VOLC_DIALOG_ENDPOINT=/api/volc-dialog
ARG VITE_VOLC_DIALOG_VOICE=
ARG VITE_VOLC_DIALOG_MODEL=

ENV VITE_ARK_API_KEY=$VITE_ARK_API_KEY \
    VITE_ARK_MODEL=$VITE_ARK_MODEL \
    VITE_ARK_BASE_URL=$VITE_ARK_BASE_URL \
    VITE_VOLC_TTS_ENDPOINT=$VITE_VOLC_TTS_ENDPOINT \
    VITE_VOLC_ASR_ENDPOINT=$VITE_VOLC_ASR_ENDPOINT \
    VITE_VOLC_ASR_SUBMIT_ENDPOINT=$VITE_VOLC_ASR_SUBMIT_ENDPOINT \
    VITE_VOLC_ASR_QUERY_ENDPOINT=$VITE_VOLC_ASR_QUERY_ENDPOINT \
    VITE_VOLC_DIALOG_ENDPOINT=$VITE_VOLC_DIALOG_ENDPOINT \
    VITE_VOLC_DIALOG_VOICE=$VITE_VOLC_DIALOG_VOICE \
    VITE_VOLC_DIALOG_MODEL=$VITE_VOLC_DIALOG_MODEL

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/30-render-template.sh /docker-entrypoint.d/30-render-template.sh
RUN chmod +x /docker-entrypoint.d/30-render-template.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

