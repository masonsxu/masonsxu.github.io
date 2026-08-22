---
version: alpha
name: Masons Xu — Void Black Technical Portfolio
description: >-
  Senior backend engineer's personal brand site. Pure void black canvas,
  single gold accent discipline, architecture diagrams as primary visual
  assets. Three visual layers on one token base: shadcn base layer,
  SYNAPSE/OBSERVATORY WebGL layers, v5 editorial layer.
colors:
  background: "#000000"
  foreground: "#FCFCFC"
  card: "#050507"
  muted-foreground: "#A1A1AA"
  primary: "#D4AF37"
  gold-light: "#F8E7B9"
  gold-deep: "#7A5810"
  blue: "#0099FF"
  border: "rgba(0, 153, 255, 0.12)"
  ring: "rgba(0, 153, 255, 0.4)"
  destructive: "#DC2626"
  ink: "#0A0B0D"
  panel: "#121419"
  bone: "#EFEDE6"
  dim: "#9BA0A8"
  faint: "#5A5F67"
  indigo: "#4353FF"
  indigo-hi: "#8B96FF"
  syn-bg: "#02030A"
  syn-fg: "#EEF2FF"
  syn-cyan: "#22D3EE"
  syn-gold: "#D4AF37"
typography:
  hero-name:
    fontFamily: Clash Display
    fontSize: 6.875rem
    fontWeight: 500
    lineHeight: 0.85
    letterSpacing: "-0.055em"
  section-title:
    fontFamily: Clash Display
    fontSize: 4.5rem
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.05em"
  project-name:
    fontFamily: Clash Display
    fontSize: 2.625rem
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.048em"
  metric-number:
    fontFamily: Inter
    fontSize: 3.5rem
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "-1.5px"
  card-title:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.5px"
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: 400
    lineHeight: 1.5
  code:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.4
  eyebrow:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.24em"
  cn-body:
    fontFamily: Noto Sans SC
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
rounded:
  code: 8px
  card: 12px
  pill: 999px
spacing:
  unit: 8px
  card-padding: 32px
  section-y: 120px
components:
  button-solid-pill:
    backgroundColor: "#FFFFFF"
    textColor: "#000000"
    rounded: "{rounded.pill}"
    padding: 28px
  button-frosted-pill:
    backgroundColor: "rgba(255, 255, 255, 0.08)"
    textColor: "{colors.foreground}"
    rounded: 40px
    padding: 20px
  button-gold-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    rounded: 40px
    padding: 20px
  card-project:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  card-metric:
    backgroundColor: "{colors.card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  tag-tech:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.foreground}"
    typography: "{typography.code}"
    rounded: 20px
  syn-panel:
    backgroundColor: "rgba(4, 6, 18, 0.62)"
    textColor: "{colors.syn-fg}"
    rounded: 20px
    padding: 36px
  nav-link-active:
    textColor: "{colors.primary}"
    typography: "{typography.body}"
  link-inline:
    textColor: "{colors.blue}"
    typography: "{typography.body}"
  link-v5:
    textColor: "{colors.indigo-hi}"
    typography: "{typography.body}"
  text-muted:
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body}"
  metric-gold-glow:
    textColor: "{colors.gold-light}"
    typography: "{typography.metric-number}"
  quote-v5:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.bone}"
    rounded: 8px
    padding: 24px
  text-v5-caption:
    textColor: "{colors.dim}"
    typography: "{typography.code}"
  text-decorative:
    textColor: "{colors.faint}"
    typography: "{typography.eyebrow}"
  badge-syn:
    backgroundColor: "rgba(238, 242, 255, 0.06)"
    textColor: "{colors.syn-cyan}"
    typography: "{typography.eyebrow}"
    rounded: 20px
  syn-canvas:
    backgroundColor: "{colors.syn-bg}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.foreground}"
    rounded: 12px
    padding: 20px
---

## Overview

资深后端工程师的个人品牌站：在纯虚空黑画布上，把架构拓扑图、数据流和性能指标作为第一视觉资产。整体气质是"暗色 IDE 里读一份排版精良的系统设计文档"——冷静、结构化、精确。

站点由三层视觉体系共用一套 token 基座：

1. **shadcn 基座层**（`styles/globals.css`）：全局组件与交互色，暗色单主题
2. **SYNAPSE / OBSERVATORY 层**（`styles/v2.css`、`styles/v3.css`）：WebGPU 神经组织与 HUD 沉浸层
3. **v5 编辑层**（`styles/v5.css`）：ink/bone 报刊风内容排版

三层的色值与字体全部从本文件 token 推导，禁止在 JSX 中硬编码。

## Colors

金色纪律是整个配色体系的核心约束：**金色（`primary` / `gold-light` / `gold-deep`）只出现在个人 monogram、关键指标数字、分节线和高强调 CTA 上，覆盖面不超过页面的 10%**。

- **background (#000000)**：绝对黑，无暖调。任何场景不得替换为暖灰或深蓝灰。
- **foreground (#FCFCFC)**：主文字，比纯白柔和一档。
- **primary (#D4AF37)**：金属金（代码 `--primary` / `--syn-gold` 同值），品牌与关键指标专用。
- **blue (#0099FF)**：标准交互色——链接、focus ring（`ring`）、常规边框（`border`）。
- **card (#050507) / muted-foreground (#A1A1AA)**：卡片面与次级文字。
- **ink / panel / bone / dim / faint**：v5 编辑层五阶——ink 为内容页底色，bone 为正文，dim/faint 为两级弱化文字（faint 仅装饰性文本，不承载关键信息）。
- **indigo (#4353FF) / indigo-hi (#8B96FF)**：v5 层的电光靛蓝，用于该层内的交互与强调。
- **syn-bg / syn-fg / syn-cyan**：SYNAPSE 层的深空底、冷白前景与生物荧光青。

## Typography

字体栈实际加载为 Clash Display / Inter / Noto Sans SC / JetBrains Mono（Cabinet Grotesk 为 display 回退）。旧文档中的 GT Walsheim 已弃用，display 职责由 Clash Display 承担，全部仅用 weight 500。

- **Clash Display**：`hero-name`（110px）、`section-title`（72px）、`project-name`（42px）三级大标题，负字距（-0.055em 起）制造收紧的标题块
- **Inter**：正文双轨（`body-lg` 18px / `body` 15px）、`card-title`、`metric-number`（56px/700，金色）
- **JetBrains Mono**：`code`、`eyebrow`（11px 大写、0.24em 字距，SYNAPSE 眉标横线样式）
- **Noto Sans SC**：中文正文（`cn-body`），与 Inter 混排时作为 fallback 链成员

Metric 数字固定 700 weight + 金色；标题禁止加粗到 600 以上。

## Layout

- 内容最大宽度 1200px 居中；间距基单位 8px
- 分节纵向留白：桌面 120px / 平板 80px / 移动 60px
- Hero 占满首屏：居中名字 + 下方 4 列金色指标网格（移动端 2 列）
- Projects 为左右交替双栏（文 45% / 图 55%），移动端堆叠
- 响应式断点：<809px 单列 + 汉堡导航；809–1199px 双栏收紧；>1199px 完整桌面

## Elevation & Depth

深度只来自四种手段，按层归属使用：

- **毛玻璃卡**：`rgba(255,255,255,0.08)` 底 + 蓝色 ring 边框 + `backdrop-filter: blur`
- **抬升卡**：在毛玻璃卡上叠加顶部 0.5px 白色高光边 + `0px 10px 30px rgba(0,0,0,0.25)` 投影
- **SYNAPSE 面板**：`rgba(4,6,18,0.62)` 底 + `blur(18px) saturate(1.3)` + 24px/80px 深投影
- **辉光**：蓝 `rgba(0,153,255,0.12)` / 金 `rgba(212,175,55,0.12)`，只垫在图表和指标之后

> 半透明 token 的对比度说明：毛玻璃类背景（`rgba(255,255,255,0.08)` 等）按 lint 白底合成会报 1.03:1，实际叠合在 `background` (#000000) 上有效对比度约 17:1，符合 WCAG AA；此类 warning 为半透明值的合成误报。
>
> `border` / `ring` / `gold-deep` / `ink` / `indigo` / `syn-gold` 为行级 token（线条、描边、页面底色、v5 强调），不进入组件表，由 CSS 变量直接消费，orphaned 警告按此接受。

## Shapes

- 按钮只有 pill 形：实心白 pill（主 CTA）、毛玻璃 pill（次级）、金色描边 pill（高强调），禁止直角/圆角矩形按钮
- 卡片 12px、代码块 8px、tech 标签 20px、SYNAPSE 面板 20px
- 架构图节点为圆角矩形毛玻璃填充 + 蓝边框，关键路径节点用金色

## Components

- **button-solid-pill**：白色实心 pill，唯一主 CTA，hover `scale(1.02)` / 0.2s
- **button-frosted-pill / button-gold-outline**：次级与高强调动作；Contact 固定用 gold-outline
- **card-project / card-metric**：黑底蓝 ring；metric 变体的数字用金色
- **tag-tech**：JetBrains Mono 11px 的技术栈胶囊
- **syn-panel**：SYNAPSE 层浮层面板，`data-side` 控制左/右/中/底四种停靠

## Do's and Don'ts

**Do**

- 背景永远 `#000000`；所有颜色经 CSS 变量引用本文件 token
- 图标只用 lucide-react，图内文字用真实 SVG text 元素
- 金色克制纪律：指标、分节线、monogram、高强调 CTA 之外不用金
- 动效尊重 `prefers-reduced-motion`；Remotion 内禁 CSS 动画，全部时间线驱动

**Don't**

- 禁止暖深灰背景、衬线字体、装饰性插画——架构图和代码就是装饰
- 禁止在 JSX 硬编码 hex；禁止动态类名拼接
- 金色覆盖不超过 10% 的元素；faint (#5A5F67) 不用于承载关键信息的文字
