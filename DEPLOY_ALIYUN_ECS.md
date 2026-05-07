# 阿里云 ECS 部署指南（小白版）

这个项目是 `Vite + React` 前端应用。  
你现在可以直接用仓库内的 `Docker + Nginx` 方案部署到阿里云 ECS。

## 1. 先准备阿里云服务器

1. 在阿里云创建 `ECS` 实例（推荐 `Ubuntu 22.04`）。
2. 确保实例有公网 IP。
3. 安全组入方向放行：
   - `22`（SSH，建议只放行你自己的公网 IP）
   - `80`（HTTP，`0.0.0.0/0`）
   - `443`（HTTPS，后续配证书时会用到，`0.0.0.0/0`）

## 2. 登录 ECS 并安装 Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl
curl -fsSL https://get.docker.com | sudo sh
sudo apt install -y docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 3. 上传项目代码

有 Git 仓库就用 `git clone`，没有就用 SFTP/Workbench 上传目录。

```bash
git clone <你的仓库地址>
cd 谷歌自动讲PPT
```

## 4. 准备部署环境变量

1. 复制模板：
```bash
cp .env.deploy.example .env.deploy
```

2. 编辑：
```bash
nano .env.deploy
```

3. 重点要填：
   - `VITE_ARK_API_KEY`
   - `VOLC_TTS_APP_ID` / `VOLC_TTS_ACCESS_TOKEN`
   - `VOLC_ASR_APP_ID` / `VOLC_ASR_ACCESS_TOKEN`
   - `VOLC_DIALOG_APP_ID` / `VOLC_DIALOG_ACCESS_TOKEN`

说明：
- `VITE_` 开头的是前端构建时变量。
- `VOLC_` 开头的是 Nginx 反向代理运行时变量。

## 5. 一键构建并启动

```bash
docker compose up -d --build
docker compose ps
```

看到 `web` 服务是 `Up` 状态就表示启动成功。

## 6. 访问测试

浏览器访问：

```text
http://<你的ECS公网IP>
```

如果页面打开正常，说明部署成功。

## 7. 后续更新项目

每次更新代码后执行：

```bash
git pull
docker compose up -d --build
```

## 8. 常用排查命令

```bash
docker compose logs -f web
docker compose ps
curl -I http://127.0.0.1
```

## 9. 域名和 HTTPS（推荐）

1. 在阿里云 DNS 把域名 `A` 记录指向 ECS 公网 IP。  
2. 有了域名后，再做 HTTPS（Nginx + 证书，或挂阿里云 SLB/CLB 证书）。

## 10. 安全提醒（请尽快做）

你本地 `.env.local` 里已经有真实密钥内容。建议立即：

1. 到对应平台重置/轮换这些密钥。
2. 不要把真实密钥提交到 Git 仓库。
3. 生产环境只保留 `.env.deploy` 在服务器本机。

