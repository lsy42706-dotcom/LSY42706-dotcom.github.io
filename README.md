# GitHub Pages 占位网站

这是一个无需构建、无需安装依赖的静态占位网站。首页暂不展示任何项目，仅显示“网站准备中”和“内容将在准备好后上线。”。

预期用户站点地址：<https://lsy42706-dotcom.github.io/>。是否已上线，以 GitHub Pages 的部署结果为准。

## 文件结构

- `index.html`：占位首页。
- `assets/style.css`：响应式样式，字体来自访问者设备。
- `favicon.svg`：网站图标。
- `.nojekyll`：跳过 Jekyll 处理，直接发布静态文件。

网站不使用 JavaScript、外部字体、外部资源或统计服务。

## GitHub Pages 配置

1. 将这些文件提交到 `lsy42706-dotcom.github.io` 仓库的 `main` 分支根目录。
2. 在仓库的 **Settings → Pages → Build and deployment** 中选择 **Deploy from a branch**。
3. 选择 **main** 分支和 **/ (root)**，然后保存。
4. 等待 GitHub 的 Pages 部署完成，再访问上面的预期地址。

## 以后添加内容

需要展示内容时，直接用新的静态页面替换 `index.html`，并按需在 `assets/` 中加入本地样式、图片和其他资源。提交到 `main` 后，GitHub Pages 会重新部署。

此仓库只是静态网站，不能直接运行需要服务器的后端程序。未来若接入其他服务，应把服务端逻辑和秘密配置放在独立后端，而不是提交到本仓库。

## 安全提醒

不要在页面、脚本、配置文件或 Git 提交中存放 API Key、访问令牌、真实日志或其他敏感信息。`.gitignore` 只能帮助排除部分本地文件，不能代替提交前的人工检查，也无法移除已经进入 Git 历史的秘密。
