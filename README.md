# masonsxu.github.io

徐俊飞（Masons Xu）的个人作品集网站，托管于 Cloudflare Pages。

**线上地址：** [masonsxu-github-io.pages.dev](https://masonsxu-github-io.pages.dev)

## 技术栈

- **React 19** + **TypeScript** — 函数式组件
- **Bun** — 构建工具与包管理
- **Tailwind CSS v4** — 样式（CSS `@theme` 配置，无 `tailwind.config.js`）
- **Remotion** — 时间线动画与视频合成
- **lucide-react** — 图标库
- 字体：Inter、Noto Sans SC、JetBrains Mono（通过 Google Fonts 加载）

## 项目结构

```
├── build.ts              # Bun 构建脚本（Tailwind 插件 + sitemap 生成）
├── tsconfig.json         # TypeScript 配置
├── public/               # 静态资源（构建时复制到 dist/）
│   ├── favicon.svg
│   ├── og-image.png      # 1280×640 Open Graph 封面
│   ├── robots.txt
│   ├── CNAME
│   └── 404.html
├── styles/
│   └── globals.css       # Tailwind v4 @theme + 全局 CSS 变量
├── src/
│   ├── index.html        # HTML 入口（SEO meta、JSON-LD）
│   ├── frontend.tsx      # React 入口（HMR 支持）
│   ├── index.css         # 动画 keyframes + 工具类
│   ├── App.tsx           # 根组件（页面布局）
│   ├── hooks.ts          # 自定义 hooks（useInView、useAnimatedCounter）
│   ├── components/
│   │   ├── ScrollReveal.tsx      # IntersectionObserver 滚动揭示
│   │   ├── ScrollProgressBar.tsx # 顶部滚动进度条（零 re-render）
│   │   ├── sections/
│   │   │   ├── Hero.tsx         # 首屏（品牌 Logo + 标语 + 关键指标）
│   │   │   ├── About.tsx        # 个人简介
│   │   │   ├── Projects.tsx     # 核心项目（3 个生产级系统）
│   │   │   ├── Architecture.tsx # 架构能力展示
│   │   │   ├── Essence.tsx      # 设计哲学
│   │   │   ├── Showreel.tsx     # Remotion 视频作品
│   │   │   ├── Timeline.tsx     # 职业经历时间线
│   │   │   ├── Community.tsx    # 开源贡献（CloudWeGo PR）
│   │   │   └── Contact.tsx      # 联系方式
│   │   └── ui/                  # 基础 UI 组件（button、card、input 等）
│   └── assets/                  # 品牌 Logo（SVG）
└── remotion/                    # Remotion 视频合成（独立预览）
```

## 本地开发

```bash
bun install         # 安装依赖
bun run dev         # 启动 Bun 开发服务器（HMR）
bun run build       # 生产构建 → dist/
```

## 部署

推送到 `main` 分支后，Cloudflare Pages 自动构建部署：
- Build command: `bun run build`
- Output directory: `dist`
- 自定义域名: `masonsxu-github-io.pages.dev`

## 设计系统

**"Midnight Pearl" 黑金主题**（在 `styles/globals.css` 的 `@theme` 中定义）：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--background` | `#0C0C0E` | 页面背景 |
| `--card` | `#111113` | 卡片背景 |
| `--secondary` | `#1E1E21` | 次级背景 |
| `--primary` | `#D4AF37` | 主色（金） |
| `--foreground` | `#FCFCFC` | 主文字 |
| `--muted-foreground` | `#A1A1AA` | 次要文字 |

## Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)（小写中文）：

| 前缀 | 用途 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | 问题修复 |
| `refactor:` | 代码重构 |
| `style:` | 样式调整 |
| `docs:` | 文档变更 |
