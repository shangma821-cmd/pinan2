# 部署运维手册（DevOps / Deploy）

> ⚠️ **安全提示**：本文件随仓库提交。**绝不写入服务器密码或私钥**。
> SSH 凭据存放在仓库**外**的 `proj/admin_backend/DevOps/SERVER-ACCESS.md`（已 gitignore）。
> 若本仓库为**公开**仓库，下方主机 IP / 用户名也属敏感信息，建议把本文件移入 `.gitignore`
> 或私有仓库。当前 SSH 密码曾在协作中以明文出现，**建议改用 SSH 公钥免密并轮换密码**。

## 拓扑

- **线上 = Server A**：`101.37.208.195`（hostname `pinan-prod-server-01`）。DNS `pinancs.com` → A。
- 由 **docker `nginx` 容器**（80/443）提供，vhost root = **宿主目录 `/opt/infra/nginx/html/portal_pinan/`**
  （`admin` 可写、无需 sudo；纯静态文件，**无需重启容器**）。
- **Server B** `120.26.176.69`（BaoTa 测试/备用，`/www/wwwroot/pinancs.com/`）：DNS 不指向它，常态**不**部署。
- Git 远端：`github.com/shangma821-cmd/pinan2`，部署落 `main`。

## 凭据

- SSH：`admin@101.37.208.195`，密码见 `proj/admin_backend/DevOps/SERVER-ACCESS.md`（本仓库不存明文）。

## 构建

- `pnpm build` → `dist/`（约 **814MB**，其中 `dist/preset-courses` 约 1.3GB 静态内容，几乎不变；`dist/` 已 gitignore）。
- 因此**只上传变更的「应用外壳」**，不要整目录同步。

## 部署（增量上传变更路径）

「产品说明书」功能涉及的变更路径：

| 路径 | 说明 |
| --- | --- |
| `dist/index.html` | 改为自托管 pdf.js |
| `dist/assets/` | 新的哈希打包产物（JS/CSS） |
| `dist/vendor/` | 新增：自托管 pdf.js 脚本 + worker |
| `dist/entry-station/manuals/` | 新增：说明书 PDF |

```bash
export SSHPASS='<见 SERVER-ACCESS.md，勿写入仓库>'
D=/opt/infra/nginx/html/portal_pinan
RSH="sshpass -e ssh -o StrictHostKeyChecking=accept-new -o NumberOfPasswordPrompts=1"

# 1) 先备份入口（沿用 index.html.bak-<时间戳> 约定）
sshpass -e ssh -o StrictHostKeyChecking=accept-new admin@101.37.208.195 \
  "cp $D/index.html $D/index.html.bak-\$(date +%Y%m%d-%H%M%S)"

# 2) 上传变更路径（rsync 不加 --delete，旧哈希包保留便于回滚）
rsync -az -e "$RSH" dist/index.html                 admin@101.37.208.195:$D/index.html
rsync -az -e "$RSH" dist/assets dist/vendor         admin@101.37.208.195:$D/
rsync -az -e "$RSH" dist/entry-station/manuals      admin@101.37.208.195:$D/entry-station/
```

> 注：连续多次密码登录可能被限流，报 `Permission denied, please try again`，**失败重试即可**（或改用 SSH 公钥）。

## 验证（务必在服务器上验）

本机开了 VPN（`pinancs.com` 被 fake-ip 解析到 `198.18.0.5`），本地 `curl`/浏览器会看到缓存/旧内容，**要在服务器上验**：

```bash
sshpass -e ssh -o StrictHostKeyChecking=accept-new admin@101.37.208.195 "
D=/opt/infra/nginx/html/portal_pinan
for u in /entry-station/manuals /entry-station/manuals/p1 /entry-station/manuals/p1.pdf /vendor/pdfjs/pdf.min.js; do
  curl -sk -o /dev/null -w '%{http_code} %{content_type} %{size_download}B  '\$u'\n' -H 'Host: pinancs.com' https://127.0.0.1\$u
done
# 入口引用的哈希包也应为 200
grep -oE '/assets/[A-Za-z0-9_.-]+\.(js|css)' \$D/index.html"
```

预期：PDF → `200 application/pdf`；路由 → `200 text/html`；assets 包 → `200`。
（也可在本机用 `--resolve pinancs.com:443:101.37.208.195` 绕过 VPN DNS。）

## 回滚

- 入口：`cp $D/index.html.bak-<时间戳> $D/index.html`。
- 新增目录可直接删：`$D/vendor`、`$D/entry-station/manuals`。
- 旧哈希包仍保留在 `$D/assets`，回滚入口即恢复旧版本。

## 新增 / 更新一份说明书

1. **压缩 PDF**（扫描件常 50MB+；pdf.js 渲染前要下载整份文件，移动端 NFC「碰一碰」必须压小）：

   ```bash
   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
      -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true \
      -sOutputFile=out.pdf in.pdf
   ```

   `-dPDFSETTINGS` 档位：`/screen`≈72dpi（最小）、`/ebook`≈150dpi（**推荐**，清晰且小）、
   `/printer`≈300dpi（更清晰更大）。示例：53MB → 5MB（`/ebook`）。

2. 命名为 `pN.pdf` 放进 `public/entry-station/manuals/`。
   **文件名 = 永久 slug = NFC 地址**，一旦写了标签就别改名。
3. （可选）在 `landing/content/manualsContent.ts` 的 `displayNames` 加显示名（否则页面显示文件名）。
4. `pnpm build`，按上面「部署」只上传 `entry-station/manuals/` + `assets/` + `index.html`。
5. NFC 标签写入：`https://pinancs.com/entry-station/manuals/pN`。

## 相关文档

- `docs/adr/0001-inline-pdf-rendering-for-manuals.md` — 为何用全局 pdf.js 内嵌渲染
- `docs/adr/0002-elastic-manuals-from-pdf-filenames.md` — 弹性说明书（构建时扫描目录）
- `CONTEXT.md` — 术语表
