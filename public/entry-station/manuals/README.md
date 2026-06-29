# 产品说明书 PDF 放置目录

把每个产品的说明书 PDF 放在这里，文件名必须与产品的永久标识一致：

| 文件名 | 对应页面 / NFC 链接 |
| --- | --- |
| `p1.pdf` | https://pinancs.com/entry-station/manuals/p1 |
| `p2.pdf` | https://pinancs.com/entry-station/manuals/p2 |
| `p3.pdf` | https://pinancs.com/entry-station/manuals/p3 |

说明：

- 文件名（`p1` / `p2` / `p3`）是 **永久标识**，已写入 NFC 标签，请勿改名。
- 产品**显示名称**在 `landing/content/manualsContent.ts` 里改，不影响 URL / 标签。
- 缩略图自动取 PDF 第一页生成，无需另外提供封面图。
- PDF 未放置时，页面显示「说明书即将上线」占位，不会报错。
- 替换 PDF 直接覆盖同名文件即可，标签无需重写。
