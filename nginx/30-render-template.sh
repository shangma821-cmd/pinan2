#!/bin/sh
set -eu

TEMPLATE="/etc/nginx/templates/default.conf.template"
TARGET="/etc/nginx/conf.d/default.conf"

envsubst '${VOLC_TTS_APP_ID} ${VOLC_TTS_ACCESS_TOKEN} ${VOLC_TTS_RESOURCE_ID} ${VOLC_ASR_APP_ID} ${VOLC_ASR_ACCESS_TOKEN} ${VOLC_ASR_RESOURCE_ID} ${VOLC_DIALOG_APP_ID} ${VOLC_DIALOG_ACCESS_TOKEN} ${VOLC_DIALOG_RESOURCE_ID} ${VOLC_DIALOG_APP_KEY}' < "$TEMPLATE" > "$TARGET"

