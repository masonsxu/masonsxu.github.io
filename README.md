# masonsxu.github.io

徐俊飞（Masons Xu）的个人作品集网站，托管于 Cloudflare Pages。

**线上地址：** [masonsxu-github-io.pages.dev](https://masonsxu-github-io.pages.dev)

## 技术栈

- **React 19** + **TypeScript** — 函数式组件
- **Vite** — 构建工具，支持 HMR
- **Tailwind CSS v4** — 样式（CSS `@theme` 配置，无 `tailwind.config.js`）
- **Three.js** — 3D 动态背景（Obsidian Neural Network 多层效果）
- **Remotion** — 时间线 SVG 动画（星座效果、视频作品）
- **framer-motion** — 滚动触发动画
- **lucide-react** — 图标库
- 字体：Noto Sans SC（中文）、Playfair Display（衬线）、JetBrains Mono（代码）（通过 `fonts.loli.net` 加载）

## 项目结构

```
├── index.html              # Vite 入口（meta 标签、SEO、JSON-LD）
├── vite.config.ts          # Vite 配置（React、Tailwind v4、chunk splitting）
├── tsconfig.json           # TypeScript 项目引用
├── public/                 # 静态资源（原样复制到 dist/）
│   ├── favicon.svg
│   ├── og-image.png / .svg
│   ├── resume.pdf / .html
│   ├── robots.txt / sitemap.xml
│   ├── CNAME
│   └── 404.html            # 独立 404 页面
├── src/
│   ├── main.tsx            # React 入口
│   ├── App.tsx             # 根组件（聚光灯效果、布局）
│   ├── index.css           # Tailwind v4 @theme + 全局 CSS
│   ├── components/
│   │   ├── ThreeBackground.tsx # Three.js 动态背景（星云、流场粒子、网络拓扑、线框几何）
│   │   ├── Navbar.tsx      # 固定毛玻璃导航栏
│   │   ├── Hero.tsx        # Hero 区（Remotion 星座动画）
│   │   ├── Architecture.tsx # 架构能力（Bento Box 网格）
│   │   ├── Skills.tsx      # 专业技能（标签式展示）
│   │   ├── Projects.tsx    # 核心项目
│   │   ├── Experience.tsx  # 职业经历时间线
│   │   ├── Education.tsx   # 教育背景与奖项
│   │   ├── Essence.tsx     # 设计哲学 + 星座卡片
│   │   ├── OpenSource.tsx  # 开源贡献 & PR
│   │   ├── Footer.tsx
│   │   ├── SectionHeader.tsx  # 通用区块标题
│   │   └── ScrollReveal.tsx   # framer-motion 滚动动画
│   └── remotion/
│       └── ConstellationAnimation.tsx  # Remotion 动画（spring + interpolate）
```

## 本地开发

```bash
bun install     # 安装依赖
bun run dev     # 启动 Vite 开发服务器（HMR）
bun run build   # 生产构建（TypeScript 检查 + Vite 构建 → dist/）
bun run preview # 本地预览构建产物
```

## 部署

推送到 `main` 分支后，Cloudflare Pages 自动构建部署：
- Build command: `bun run build`
- Output directory: `dist`
- 自定义域名: `masonsxu-github-io.pages.dev`

## 设计系统

**"Midnight Pearl" 黑金主题**（在 `src/index.css` 的 `@theme` 中定义）：

| 变量 | 色值 | 用途 |
|------|------|------|
| `bg` | `#0C0C0E` | 页面背景 |
| `surface` | `#121214` | 卡片背景 |
| `surface-light` | `#1E1E21` | 次级背景 |
| `border` | `#D4AF37` | 边框（需加 `/20` 透明度） |
| `primary` | `#D4AF37` | 主色（金） |
| `accent` | `#F2D288` | 强调色（浅金） |
| `muted` | `#A1A1AA` | 次要文字 |

**代码规范**：
- 始终使用语义化 class（`bg-surface`、`border-border/20`、`text-primary`）
- 禁止硬编码颜色值
- 图标统一使用 `lucide-react`
- 卡片统一使用 `rounded-lg` + `spotlight-card`

## Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)（小写中文）：

| 前缀 | 用途 |
|---|---|
| `feat:` | 新功能 |
| `fix:` | 问题修复 |
| `refactor:` | 代码重构 |
| `style:` | 样式调整 |
| `docs:` | 文档变更 |
