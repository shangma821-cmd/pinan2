#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ENV_FILE:-.env.deploy}"
SERVICE="${SERVICE:-web}"
LOG_TAIL="${LOG_TAIL:-80}"
ACTION="${1:-deploy}"

cd "$APP_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is not installed."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Error: docker compose plugin is not available."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found in $APP_DIR"
  echo "Create it from .env.deploy.example first."
  exit 1
fi

copy_env_for_compose_interpolation() {
  # Compose resolves ${...} from .env / shell. Keep .env in sync with deploy env.
  cp "$ENV_FILE" .env
}

show_status() {
  docker compose --env-file "$ENV_FILE" ps
}

show_logs() {
  docker compose --env-file "$ENV_FILE" logs --tail="$LOG_TAIL" "$SERVICE"
}

deploy() {
  copy_env_for_compose_interpolation
  docker compose --env-file "$ENV_FILE" up -d --build --remove-orphans
  show_status
  echo
  echo "Recent logs:"
  show_logs
  echo
  echo "Local health check:"
  curl -I --max-time 8 http://127.0.0.1 || true
}

restart() {
  docker compose --env-file "$ENV_FILE" restart "$SERVICE"
  show_status
}

down() {
  docker compose --env-file "$ENV_FILE" down
}

usage() {
  cat <<'EOF'
Usage:
  ./deploy.sh [deploy|status|logs|restart|down]

Environment variables:
  ENV_FILE   default: .env.deploy
  SERVICE    default: web
  LOG_TAIL   default: 80
EOF
}

case "$ACTION" in
  deploy) deploy ;;
  status) show_status ;;
  logs) show_logs ;;
  restart) restart ;;
  down) down ;;
  -h|--help|help) usage ;;
  *)
    echo "Unknown action: $ACTION"
    usage
    exit 1
    ;;
esac

