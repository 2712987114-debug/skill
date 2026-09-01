# GitHub Pages 与腾讯云 COS

每次推送 `main` 分支，GitHub Actions 会自动构建并发布网站到 GitHub Pages。首次使用时，请在仓库 **Settings → Pages → Build and deployment** 中将 Source 设为 **GitHub Actions**。

网站地址为：`https://2712987114-debug.github.io/Cuimengyuan/`

## 上传视频

1. 打开网站右下角的齿轮图标。
2. 输入腾讯云 COS 的 `SecretId` 和 `SecretKey`，点击保存授权。
3. 上传首页背景视频，或在“添加项目”中上传项目封面；上传完成后内容清单会同步到 COS。
4. 访客刷新网站后可以看到新增内容；项目视频会以播放器形式打开并可点击播放。

密钥仅保存在当前浏览器的 localStorage 中，不会提交到 GitHub。请使用只允许该存储桶写入的腾讯云子账号密钥。

## COS CORS

在 COS 控制台为桶 `cuimengyuan-1473942157` 添加 CORS 规则：

- Origin：`https://2712987114-debug.github.io`
- Methods：`GET, PUT, HEAD, POST`
- Allowed Headers：`*`
- Expose Headers：`ETag`

