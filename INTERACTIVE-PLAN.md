# Interactive Portfolio Plan — “MasonsOS” 终端化作品集

> **Status:** 🚧 Active · **Owner:** masonsxu · **Started:** 2026-06-04
> **Related:** `DESIGN.md`（视觉系统）· `website-content.md`（内容源）· `src/data/site-content.ts`（结构化数据）

本文件是「路线 A：On-brand 交互升级」的**正式接手文档**。任何人（包括未来的你、或新的 AI 会话）读完本文，应能在任意 Phase 边界接手继续。

---

## 1. 背景与目标

- **根本目标**：让个人品牌站不枯燥，用「可玩性」让访客更立体地认识 Masons。
- **被否决的方案**：3D 草地漫游 + 卡通小人 —— 与品牌内核（可靠/精工/系统感）错位，违反 `DESIGN.md` 的「diagrams and code are the decoration」铁律。
- **采用的方案**：把网站做成「Masons 的一台机器」，访客像用终端一样把我「查询」出来。**媒介本身即名片**。

---

## 2. 核心创意

> **一句话：整站是一台机器，开机自检（已有 `BootSequence`）→ 终端就绪 → 敲命令探索我。**

代表性体验：`whoami` / `ls projects` / `cat about` / `neofetch`（系统信息风身份卡）/ `sudo hire-me`（彩蛋）。对后端工程师是天花板级对味彩蛋，且**截图可传播**。

---

## 3. 设计原则

1. **媒介即名片**：交互形式证明专业身份（terminal / kubectl / boot），不靠装饰性插画。
2. **渐进增强**：终端是「亮点层」；底下永远是可滚动、可读、SEO/移动端友好的正常 portfolio。禁用 JS 也能看。
3. **注册表驱动（接手核心）**：每个命令 = 注册表一条 `{ name, run() }`。**加功能 = 加一个文件条目**，不碰 UI、不碰渲染。
4. **复用而非重写**：最大化复用 chip 组件、i18n、site-content、showreel-registry。
5. **可恢复阶段**：6 个 Phase，各自独立可交付、有验收标准。

---

## 4. 已锁定决策（2026-06-04 确认）

| # | 决策 | 选择 |
|---|------|------|
| 1 | 终端形态 | Hero 常驻迷你终端 **+** `~` 全局唤起下拉式（两者都要） |
| 2 | 3D 旧作 | 归档到 `src/_archive/`（`game/` + `room/`），**不删除** |
| 3 | 内容 i18n | UI 文案双语；项目正文暂以中文呈现（en UI 下回退中文）；正文全量双语化列为后续独立任务 |
| 4 | 人格语气 | 提示符 `masons@portfolio:~$`，自称「MasonsOS」，彩蛋偏极客玩梗 |
| 5 | 文档落盘 | 本文件 `INTERACTIVE-PLAN.md` |

---

## 5. 架构

### 5.1 入口与挂载
- 入口链：`src/frontend.tsx` → `I18nProvider` → `App`。
- `App.tsx` 渲染 chip 主题 portfolio（`BootSequence` → `ChipFabricBG` → `ScrollProgressBar` → `ClockBar` → sections，section 间以 `PcbTrace` 分隔）。
- 交互层（终端 / 命令面板）作为**全局叠加层**挂在 `App` 顶层，独立于 sections。

### 5.2 复用 vs 新建

| 复用 | 新建 |
|------|------|
| `components/chip/*`（`ChipFrame` 包终端）、`ChipFabricBG`、`BootSequence` | `components/terminal/` |
| `i18n`（命令输出本地化、`lang` 命令切换） | `components/palette/` |
| `data/site-content.ts`（projects/career/contact 数据源） | `terminal/commands/`（注册表） |
| `data/showreel-registry.ts` + `@remotion/player`（已是依赖） | `i18n` 新增 `terminal` 文案块 |
| `lib/silicon.ts`（`hexAddr` 做提示符地址）、`ScrollReveal` | — |

### 5.3 终端文件结构

```
src/components/terminal/
  Terminal.tsx          # 终端 UI（外套 ChipFrame）；含 Hero 内联实例 + ~ 唤起的全局叠加层
  useTerminal.ts        # 状态：历史 / 输入 / 执行 / Tab 补全 / ↑↓ 历史
  TerminalOutput.tsx    # 渲染输出行（纯文本 / 富 React 节点 / 链接）
  commands/
    types.ts            # Command / CommandContext / CommandOutput 类型契约
    index.ts            # 汇总注册表（唯一聚合点）
    system.ts           # help / clear / lang / neofetch / whoami
    content.ts          # projects / about / stack / metrics / career / contact / resume
    media.ts            # showreel / play <name>
    easter.ts           # sudo hire-me / kubectl get masons / git log
src/components/palette/
  CommandPalette.tsx    # Cmd+K，复用同一注册表 + sections
```

### 5.4 命令契约（实现时定稿）

```ts
type CommandOutput =
  | { kind: "text"; lines: string[] }
  | { kind: "node"; node: React.ReactNode }   // neofetch 卡片、项目卡等
  | { kind: "navigate"; sectionId: string }   // 滚动到 section
  | { kind: "action"; effect: () => void };   // 下载简历 / 切语言 / 播放视频

interface CommandContext {
  t: TranslationSet;                 // i18n 文案
  locale: Locale;
  setLocale: (l: Locale) => void;
  navigateTo: (sectionId: string) => void;
  playVideo: (id: ShowreelId) => void;
  data: { projects; career; contact; ... };  // 来自 site-content.ts
}

interface Command {
  name: string;
  aliases?: string[];
  usage: string;
  describe: (t: TranslationSet) => string;       // 本地化描述（help 自动列出）
  run: (args: string[], ctx: CommandContext) => CommandOutput | CommandOutput[];
}
```

> **接手要点**：新增命令 = 在 `commands/` 某文件 `export` 一个 `Command` 对象并加入 `index.ts` 数组。`help` 会自动列出，无需改 UI。

---

## 6. 功能规格

### 6.1 终端命令（Phase 1）

| 命令 | 作用 | 数据来源 |
|------|------|----------|
| `help` | 列出全部命令（自注册表生成） | registry |
| `whoami` / `neofetch` | ASCII logo + 系统信息身份卡（OS: MasonsOS / Uptime / Kernel: Go 1.24 / Shell: CloudWeGo …） | site-content + 静态 |
| `ls projects` | 列出项目 | site-content.projects |
| `cat <id>` / `open <id>` | 查看项目摘要，并可 `navigate` 到对应 section | site-content.projects |
| `about` | 自述 | website-content / i18n |
| `stack` / `skills` | 技术栈 | site-content |
| `metrics` | 关键指标（99.9% / 50% / 10+ / 87%） | site-content |
| `career` | 职业经历 | site-content.career |
| `contact` | 联系方式 | site-content.contactLinks |
| `resume` | 下载简历 `/resume.pdf` | action |
| `showreel` | 列出 6 支视频 | showreel-registry |
| `play <name>` | 打开某 Remotion 视频 | action → playVideo |
| `lang zh\|en` | 切换语言 | action → setLocale |
| `clear` | 清屏 | — |
| 🥚 `sudo hire-me` | 招聘彩蛋（CTA → contact） | 彩蛋 |
| 🥚 `kubectl get masons` | 列「资源」风格输出 | 彩蛋 |
| 🥚 `git log` | 把职业经历当 commit 历史打印 | 彩蛋 |

**交互细节**：
- Quake 风 **`~` 全局唤起**下拉终端；Hero 区一个常驻迷你终端。
- 键盘：↑↓ 历史、Tab 补全、Ctrl+C 取消、Enter 执行。
- **移动端**：用可点 command chip 替代打字。
- 尊重 `prefers-reduced-motion`（用 `lib/silicon.ts` 的 `useReducedMotion`）。

### 6.2 命令面板 Cmd+K（Phase 2）
复用同一注册表 + sections，模糊搜索快速跳转/执行。

### 6.3 放映厅（Phase 3）
6 支视频用 `@remotion/player` 聚焦播放 + 进度条；`play <name>` 命令可唤起。懒加载。

### 6.4 活的架构图（Phase 4）
`diagrams/ProjectDiagram` 升级为可点节点 + trace 动画 + hover 详情；与项目联动。

---

## 7. i18n 策略
- UI 文案与命令描述：新增 `i18n/zh.ts` / `en.ts` 的 `terminal` 块，类型在 `i18n/types.ts`。
- 项目正文（`site-content.ts`）目前仅中文：en UI 下回退中文呈现；**全量双语化为后续独立任务**（见 Backlog）。

---

## 8. 路线图（每阶段独立可交付）

- [x] **Phase 0 · 地基恢复** ✅（2026-06-04 完成）
  - App.tsx 接回 chip portfolio；`src/game`、`components/room` 归档到 `src/_archive/`；`tsconfig` 排除 `_archive`；`vite build` 绿（67 modules，无报错）。
  - **验收**：✅ portfolio 渲染、i18n 正常、构建通过、无 game/room 残留引用。
- [x] **Phase 1 · 交互终端** ⭐ ✅（2026-06-04 完成核心）
  - 已建：命令注册表 + 类型契约 + `useTerminal`（历史/Tab 补全）+ `Terminal` UI + 13 命令（help/whoami/neofetch/ls/cat/about/metrics/contact/lang/clear + 🥚 sudo/kubectl/git）+ `~` 全局唤起叠加层 + Hero「打开终端」入口 + 移动端命令 chip + i18n(zh/en) + reduced-motion。
  - **验收**：✅ 命令可完整探索；键盘(↑↓/Tab/Esc)、移动端可用；中英文案到位；`help` 自注册表生成；`vite build` 绿（75 modules）。
  - 待补（可选 polish）：✅ Hero「常驻内联终端」已补（`variant="inline"` · `autoFocus=false` · `bodyMaxHeight=200`，地址位 `0x0002 · LIVE_CONSOLE.tty`）；更多彩蛋（top/uptime/fortune）；`play <name>`（依赖 Phase 3）。
- [x] **Phase 2 · 命令面板 Cmd+K** ✅（2026-06-04 完成）
  - `components/palette/CommandPalette.tsx`：⌘K / Ctrl+K 唤起，模糊搜索（子串→子序列打分）；**Navigate 组**跳转 9 个 section，**Run 组**复用终端注册表（选中 → 唤起终端执行，经 `initialCommand` 打通）；Hero 加 ⌘K 入口；i18n(zh/en)。
  - **验收**：✅ Cmd+K 开关、↑↓/↵/Esc、模糊匹配、nav 跳转、run 唤起终端执行；`vite build` 绿（76 modules）。
- [x] **Phase 3 · 放映厅** ✅（2026-06-04 完成）
  - Showreel 区原已有 `@remotion/player` 聚焦播放（卡片 → 逻辑分析仪 modal）；本阶段补：`play <name>` / `showreel` 终端命令 + 命令面板「播放」分组，经 `data/showreelBus.ts`（带 latch 的轻量总线，避免懒加载竞态且不污染主包）唤起；并修复 VideoModal 的 Esc 关闭。
  - **验收**：✅ 6 支可播；`play arch` / ⌘K 搜片名可唤起；remotion 仍为独立 chunk（主包 80KB 未被污染）；`vite build` 绿（78 modules）。
- [x] **Phase 4 · 活架构图** ✅（2026-06-04 完成）
  - `diagrams/ProjectDiagram.tsx`：`DiagramContext` 共享 active 状态 + `DiagramFrame` 说明栏 + 交互式 `ChipBox`（带 `info` 的节点可悬停/聚焦/点击/键盘 Enter·Space → 高亮 + 下方说明）；19 个关键节点已注解；svg `role="group"` + 节点 `role="button"` 可达；trace 脉冲沿用 SVG `<animate>`（reduced-motion 友好）；Projects 图列加高避免与底部 silk 重叠。
  - **验收**：✅ 节点可交互高亮+说明、键盘可达、trace 动画在、`vite build` 绿。
  - 注：节点 `info` 目前为中文（en UI 回退中文，符合决策 #3），双语化进 Backlog。
- [x] **Phase 5 · 打磨上线** ✅（2026-06-04，Lighthouse 跑分按用户要求跳过）
  - 共享引用计数滚动锁 `lib/scrollLock.ts`（终端/面板/放映厅统一，修复叠加竞态）；终端/面板/视频弹窗 `role="dialog"` + 焦点管理 `lib/focus.ts`（关闭回焦 + Tab 焦点陷阱；终端因 Tab 补全仅回焦）；终端弹窗加大（`max-w-[860px]` + 更高输出区）；放映厅移除 `autoPlay` 改 `PlayerRef` 显式 `play()` 修复"假播放"；`<title>` → `Masons Xu — Go Backend Engineer · Distributed Systems`；BootSequence → MasonsOS 叙事衔接。
  - **验收**：✅ 无 console 报错、`vite build` 绿；SEO/meta 与代码分包此前已良好；Lighthouse/真机由用户侧确认。

---

## 9. 风险与对策

| 风险 | 对策 |
|------|------|
| 终端「玩具化」、信息密度低 | 终端是增强层；正常 portfolio 始终存在并承载全部信息与 SEO |
| 移动端打字门槛高 | 命令 chip + 一键示例命令 |
| 可访问性（屏幕阅读器） | 终端为 `aria-live` 日志；所有内容在语义化 sections 里有等价表达 |
| 包体积（remotion） | Showreel/Player 懒加载 + 代码分割 |
| 内容仅中文 | 见 §7，正文双语化进 Backlog，不阻塞 Phase 1 |

---

## 10. 非目标（Non-goals）
- 不做 3D / 游戏引擎（已归档）。
- 终端不做真实 shell / 任意代码执行（仅白名单命令）。
- 不引入后端服务（纯静态站）。

---

## 11. Backlog（后续）
- [x] 架构图节点 `info` 双语化 ✅（inline `{zh,en}`，随 locale 解析）。
- [x] 终端彩蛋 `top` / `uptime` / `fortune` ✅。
- [x] 分享卡：`neofetch` 一键导出 PNG ✅（零依赖 canvas）。
- 站点可见正文已由 i18n（`t.*`）双语覆盖；`site-content.ts` 的中文字段仅供语言中性数据（techs / 指标值），无需额外双语化。

---

## 12. 变更记录
- 2026-06-04 — 创建文档，锁定 5 项决策，启动 Phase 0。
- 2026-06-04 — Phase 0 完成：归档 3D 旧作至 `src/_archive/`，App.tsx 接回 chip portfolio，`vite build` 通过。下一步 Phase 1（交互终端）。
- 2026-06-04 — Phase 1 核心完成：`src/components/terminal/` 终端系统（注册表/hook/UI）+ 13 命令 + `~` 唤起 + Hero 入口 + i18n + 移动端 chip，`vite build` 绿（75 modules）。下一步 Phase 2（Cmd+K）。
- 2026-06-04 — Phase 2 完成：`components/palette/CommandPalette.tsx`（⌘K 模糊导航 + 复用终端注册表 + 面板↔终端打通），Hero 加 ⌘K 入口，`vite build` 绿（76 modules）。下一步 Phase 3（放映厅）。
- 2026-06-04 — 补完 Phase 1 尾巴：Hero 内嵌常驻内联终端（`0x0002 · LIVE_CONSOLE.tty`），`Terminal` 新增 `bodyMaxHeight` 参数，`vite build` 绿。
- 2026-06-04 — 精简 Hero 状态行（移除冗余 `~` 提示，`~` 快捷键改在终端欢迎语展示）。
- 2026-06-04 — Phase 3 完成：`play <name>`/`showreel` 命令 + 面板「播放」分组 + `showreelBus` latch 总线 + 修复 Esc 关闭；remotion 保持懒加载独立 chunk，`vite build` 绿（78 modules）。下一步 Phase 4（活架构图）。
- 2026-06-04 — Phase 4 完成：ProjectDiagram 升级为活架构图（Context 共享 active + 说明栏 + 19 交互节点 + a11y role 修正），Projects 图列加高，`vite build` 绿。下一步 Phase 5（打磨上线）。
- 2026-06-04 — Phase 5 完成：共享滚动锁 + 焦点管理（回焦 / Tab 陷阱）+ 弹层 dialog a11y + 终端弹窗加大 + 视频自动播放修复 + 英文 `<title>` + boot 叙事衔接；文档移至仓库根目录。Lighthouse 按用户要求跳过。路线图 0–5 全部完成。
- 2026-06-04 — 收尾打磨：依赖清理（移除 three / `package-lock.json`，统一 bun 单锁）+ 架构图节点双语 + 终端彩蛋（top/uptime/fortune）+ neofetch 导出分享卡 PNG（零依赖 canvas）。Backlog 主项清空。
