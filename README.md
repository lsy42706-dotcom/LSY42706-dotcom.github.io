# ORBIT 粒子星球

基于原生 HTML、CSS、JavaScript、Three.js 和 MediaPipe Hands 的交互式粒子星球。访问 [GitHub Pages](https://lsy42706-dotcom.github.io/) 体验。

## 使用

拖动页面旋转视角，滚轮缩放。点击“开启手势控制”并允许摄像头后，伸出食指、收起其他手指，指向上下左右即可持续转动视角；收起食指或移出画面停止转动。握拳向后移动远离，张开手向前移动靠近。摄像头图像用于浏览器内手势识别。

## 源码与运行

- `index.html`：页面结构及 CDN 库引用
- `style.css`：界面样式
- `app.js`：粒子场景、交互和手势识别

使用静态 HTTP 服务器提供这些文件，或通过 GitHub Pages HTTPS 访问。Three.js、MediaPipe、模型文件和字体需要网络连接；摄像头需要浏览器权限和安全上下文（HTTPS 或 localhost）。
