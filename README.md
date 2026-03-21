# masonsxu.github.io

徐俊飞（Mason Xu）的个人作品集网站，托管于 Cloudflare Pages。

**线上地址：** [masonsxu-github-io.pages.dev](https://masonsxu-github-io.pages.dev)

## 技术栈

- 纯静态 HTML，无框架，无打包工具
- [Tailwind CSS](https://tailwindcss.com) — 本地 CLI 构建，非 CDN
- 字体：Inter（英文）、Noto Sans SC（中文）、JetBrains Mono（代码）（通过 `fonts.loli.net` 加载，国内可访问）

## 项目结构

```
.
├── index.html          # 主页（全部内容内联）
├── 404.html            # 自定义 404 页面
├── tailwind.css        # Tailwind 构建产物（已提交，部署时无需构建）
├── tailwind.config.js  # Tailwind 配置（主题色、字体、动画）
├── src/input.css       # Tailwind 入口文件
├── package.json        # 仅含 tailwindcss 开发依赖
├── og-image.png        # 社交分享封面图（1200×630）
├── og-image.svg        # 封面图矢量源文件
├── sitemap.xml         # 站点地图
├── robots.txt          # 爬虫声明
└── favicon.svg         # 网站图标
```

## 本地开发

直接用浏览器打开 `index.html` 即可，无需启动服务器。

修改内容后若新增了 Tailwind 类，需重新构建 CSS：

```bash
npm install        # 首次使用
npm run build:css  # 重新生成 tailwind.css
```

## 部署

推送到 `main` 分支后，Cloudflare Pages 自动部署。`tailwind.css` 已提交到仓库，Cloudflare 无需执行构建命令，直接托管静态文件即可。

## Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)（小写中文）：

| 前缀 | 用途 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | 问题修复 |
| `refactor:` | 代码重构 |
| `style:` | 样式调整 |
| `docs:` | 文档变更 |
