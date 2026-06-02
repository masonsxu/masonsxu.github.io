/**
 * ============================================================================
 *  room-content.ts —— 「我记忆的旧房间」唯一内容源
 * ============================================================================
 *
 *  本文件是整个第一人称探索体验的【唯一数据源】，所有文字、故事片段、项目描述
 *  全部从 website-content.md 抽取并结构化。要修改网站内容，只需改这个文件，
 *  3D 场景与 UI 浮层会自动读取注入，无需触碰渲染逻辑。
 *
 *  数据分区：
 *   - profile      个人名片（Hero）
 *   - exhibits     4 个大型主题展品（电脑 / 书 / 背包 / 窗）—— 决定结局的核心交互
 *   - paintings    墙上的相框（教育 / 开源 / 影集）—— 加分探索，非结局必需
 *   - shards       5 个记忆碎片（隐藏的、更私人的故事）—— 收集系统
 *   - guide/ending 引导文案与隐藏结局文案
 *   - contact      联系方式
 * ============================================================================
 */

/* ----------------------------- 类型定义 ----------------------------- */

export interface Metric {
  value: string;
  label: string;
}

export interface ProjectEntry {
  num: string;
  title: string;
  subtitle: string;
  time: string;
  summary: string;
  highlights: { title: string; desc: string }[];
  techs: string[];
  metrics: Metric[];
}

export interface CareerRole {
  title: string;
  time: string;
  note?: string;
  points: string[];
}

export interface WindowVision {
  id: string;
  title: string;
  caption: string;
  /** 窗外天空渐变色（自上而下）—— 驱动 3D 场景换天 */
  sky: [string, string, string];
  /** 室内主光颜色，呼应不同"白日梦" */
  light: string;
}

export interface MemoryShard {
  id: string;
  /** 拾取后浮层标题 */
  title: string;
  /** 隐藏的、更私人的故事 */
  story: string;
  /** 藏匿点的诗意提示（仅作设计参考） */
  place: string;
}

export interface PaintingCard {
  id: string;
  label: string;
  title: string;
  lines: { heading: string; body: string }[];
}

/* ----------------------------- 个人名片 ----------------------------- */

export const profile = {
  name: "徐俊飞",
  alias: "Masons Xu",
  title: "Go 后端工程师 · 分布式系统 · 云原生基础设施",
  intro:
    "5 年 Go 后端开发经验，横跨分布式微服务架构、数据湖平台建设与云原生工程效能，具备从 0 到 1 独立交付复杂系统的全链路能力。",
  metrics: [
    { value: "10+", label: "Microservices" },
    { value: "99.9%", label: "Availability" },
    { value: "50%", label: "Latency Reduced" },
    { value: "87%", label: "Deploy Faster" },
  ] as Metric[],
};

/* ===========================================================================
 *  核心交互物件（4 个主题展品）
 *  —— 每个 position 是物件在房间里的世界坐标，引擎据此生成模型与镜头焦点
 * =========================================================================== */

/* 展品 ①：老式电脑 → 我的架构作品时间线 */
export const computerExhibit = {
  id: "computer",
  icon: "🖥️",
  label: "老式电脑",
  title: "我的架构作品",
  subtitle: "从单体到分布式，从 0 到 1 的独立交付",
  projects: [
    {
      num: "01",
      title: "分布式数据管理平台",
      subtitle: "CloudWeGo 微服务架构",
      time: "2025.03 — 2026.04",
      summary:
        "独立设计并交付基于 CloudWeGo 生态的分布式数据平台。Kitex RPC + Hertz HTTP 双栈架构，Thrift IDL-First 定义 10+ 微服务契约，Google Wire 编译时依赖注入，构建从 API 网关到 8 个 RPC 微服务的完整分布式系统。",
      highlights: [
        { title: "DDD 四层架构", desc: "Handler → Logic → DAL → Model 严格分层，业务逻辑与框架零耦合" },
        { title: "分布式服务治理", desc: "Etcd 服务注册发现 + Kitex metainfo 全链路 RequestID 传播" },
        { title: "可观测性体系", desc: "OpenTelemetry + Jaeger 分布式追踪，自动标记 >100ms 慢调用" },
        { title: "安全与权限", desc: "JWT 三位置 Token 查找 + Casbin RBAC 多角色权限合并" },
      ],
      techs: ["Kitex", "Hertz", "Wire", "Thrift", "etcd", "Casbin"],
      metrics: [
        { value: "10+", label: "Services" },
        { value: "数万行", label: "Go Code" },
      ],
    },
    {
      num: "02",
      title: "数据湖平台",
      subtitle: "Apache Iceberg + Airflow 配置驱动 ETL",
      time: "2025.03 — 2026.04",
      summary:
        "构建基于 Apache Iceberg 的数据湖平台，将 REST API、MySQL、MongoDB 多源数据统一入湖。Airflow 3.1 编排 + PyIceberg 直写 + Trino 查询 + Polars 内存 JOIN，5 个月从设计到生产投产。",
      highlights: [
        { title: "配置驱动 SQL 引擎", desc: "DictConfigParser 解析编码，BFS 图搜索找到最优 JOIN 路径" },
        { title: "多源异构入湖", desc: "MySQL 流式游标、MongoDB JSON 三列 schema，统一写入 Iceberg" },
        { title: "跨源 JOIN", desc: "Trino 查询小表，Polars 内存执行 5 表链式 LEFT JOIN" },
        { title: "数据隔离与回传", desc: "两阶段抽取，集合交集过滤防止数据混入，分批回传业务系统" },
      ],
      techs: ["Iceberg", "Airflow", "Trino", "Polars", "PyIceberg", "PyArrow"],
      metrics: [
        { value: "4", label: "ETL Steps" },
        { value: "3", label: "Data Sources" },
      ],
    },
    {
      num: "03",
      title: "放疗流程管理系统",
      subtitle: "表单引擎与流程编排核心开发",
      time: "2021.06 — 2025.03",
      summary:
        "作为系统主程（累计 4,000+ commits），独立负责 Flask + MySQL + MongoDB + Redis 架构的放疗流程管理系统。从应届生成长为系统实际负责人，是该系统整个生命周期的技术核心。",
      highlights: [
        { title: "自定义表单引擎", desc: "MongoDB 文档嵌套树实现 4 层组件树，支持 30+ 组件类型" },
        { title: "跨表单数据联动", desc: "三元引用模型实现跨表单实时同步，array_filters 3 层嵌套更新" },
        { title: "工作流引擎", desc: "JSON 驱动流程节点拓扑，支持 NEXT/PREVIOUS/REJECT 推进" },
        { title: "性能优化 & 集成", desc: "响应时间降低 50%，可用性 99.9%；对接 25+ 第三方系统" },
      ],
      techs: ["Flask", "MongoDB", "MySQL", "Redis", "Celery", "Docker"],
      metrics: [
        { value: "4,000+", label: "Commits" },
        { value: "近 4 年", label: "Ownership" },
      ],
    },
    {
      num: "04",
      title: "CloudWeGo 模板与开源贡献",
      subtitle: "生产级架构实践 · 开源贡献者",
      time: "2025 — 至今",
      summary:
        "基于生产经验沉淀 CloudWeGo 微服务标准架构模板，覆盖网关接入、服务发现、可观测、容器化与工程规范，并系统性落地 AI 辅助开发流程，参与 CloudWeGo 生态组件修复与贡献。",
      highlights: [
        { title: "生产级微服务模板", desc: "Kitex/Hertz 双栈、DDD 分层、Wire DI、可观测性完整规范" },
        { title: "AI 辅助开发体系", desc: "AGENTS.md 架构规范 + Custom Skills + AI 驱动 GitHub Actions" },
        { title: "生态组件贡献", desc: "修复 hertz-contrib/jwt 窗口失效、可观测稳定性、Go 1.25+ 兼容" },
      ],
      techs: ["CloudWeGo", "Kitex", "Hertz", "GitHub Actions", "Claude Code"],
      metrics: [
        { value: "3", label: "Merged PRs" },
        { value: "330+", label: "AGENTS.md Lines" },
      ],
    },
  ] as ProjectEntry[],
};

/* 展品 ②：摊开的书 → 灵魂底色与工程哲学（写作 / 自述） */
export const bookExhibit = {
  id: "book",
  icon: "📖",
  label: "摊开的书",
  title: "灵魂底色",
  subtitle: "The Essence —— 写在扉页的工程哲学",
  epigraph: "可靠与精工，是工程师最好的艺术。",
  paragraphs: [
    "我追求系统如同打磨一件精密仪器——在可见处表现从容，在不可见处苛求细节。",
    "Midnight Pearl 代表了这种理念：Obsidian 的稳健承载一切，Pearl 的纯粹保持逻辑透明，Gold 的卓越在关键路径上闪耀。",
    "作为金牛座工程师，我把可靠看作最高赞誉，把艺术感藏在每一行干净、可维护的代码里。",
  ],
  quotes: [
    { text: "架构不是设计出来的，而是在解决真实问题的过程中自然涌现的。", from: "工程哲学" },
  ],
  about: [
    "主导 Python 单体到 CloudWeGo 微服务架构的整体转型，6 个月内完成 Radius 项目设计、开发与测试闭环",
    "独立设计并交付 10+ 微服务的分布式数据平台",
    "仅用 5 个月完成 Apache Iceberg + Airflow 数据湖平台从设计到生产投入使用",
    "向 CloudWeGo 开源项目提交 3 个已合并 PR，持续贡献 RPC/HTTP 框架生态",
  ],
};

/* 展品 ③：旅行背包 → 职业旅程（从应届生到架构师的迁徙） */
export const backpackExhibit = {
  id: "backpack",
  icon: "🎒",
  label: "旅行背包",
  title: "我的职业旅程",
  subtitle: "福建 · 厦门 · Manteia 数据科技 · 2021 — 2026",
  company: "福建自贸试验区厦门片区 Manteia 数据科技有限公司",
  positioning: "核心业务研发与后端架构体系演进",
  roles: [
    {
      title: "Go 后端架构师 / 技术负责人",
      time: "2025.03 — 2026.04",
      note: "基于前期在核心业务重构与工程提效上的突出表现，晋升主导新一代微服务架构升级与团队规范建设。",
      points: [
        "主导后端服务化升级，完成 8 RPC + 1 API Gateway 的 9 服务体系建设",
        "统一 IDL-First 流程、分层架构约束与 Wire 依赖注入规范，从「个人经验驱动」升级为「标准体系驱动」",
        "建设 OTel、Jaeger 与 trace / request_id 传播链路，打通网关到核心 RPC 的排障路径",
        "推动 8 人研发协作机制标准化，沉淀结构化技术资产，降低跨模块协作成本",
      ],
    },
    {
      title: "Python 后端开发工程师",
      time: "2021.06 — 2025.03",
      points: [
        "以应届生加入，独立成长为系统实际负责人，主导 Asyncio 性能重构，查询效率提升 50%",
        "推动核心服务容器化，部署时间从 4 小时缩短至 30 分钟，交付效率提升 87.5%",
        "通过链路治理与变更风险收敛，故障率下降 45%，系统可用性提升至 99.9%",
        "多次在核心链路故障中实现当日快速恢复，兼顾极速止损与根因修复",
      ],
    },
  ] as CareerRole[],
  keywords: ["Go", "微服务", "DDD", "CloudWeGo", "OpenTelemetry", "容器化", "AI 辅助开发", "架构决策"],
};

/* 展品 ④：窗户 → 未来愿景 / 白日梦（点击切换窗外场景） */
export const windowExhibit = {
  id: "window",
  icon: "🪟",
  label: "一扇窗",
  title: "白日梦与未来愿景",
  hint: "再次点击，换一个梦",
  visions: [
    {
      id: "golden",
      title: "金色时刻 · 此刻",
      caption:
        "日落前的光斜斜照进来。眼下的系统在可见处从容、在不可见处苛求细节——这是我最喜欢的工作状态。",
      sky: ["#ffd89b", "#f6b06a", "#e87b52"],
      light: "#ffcf8f",
    },
    {
      id: "vision",
      title: "远方 · 想成为的工程师",
      caption:
        "我想继续把分布式系统的复杂，收拢成清晰的边界；让每一次 RPC 调用、每一条 trace，都可解释、可治理、可信赖。",
      sky: ["#bfe3ff", "#7fb6e6", "#4f86c6"],
      light: "#dbeeff",
    },
    {
      id: "night",
      title: "深夜 · 不可见处的苛求",
      caption:
        "凌晨三点的报警，我宁愿自己先醒来。可靠不是口号，是无数次在别人睡着时，把细节再确认一遍。",
      sky: ["#1b2a4a", "#2a3a63", "#46517e"],
      light: "#9fb4e6",
    },
  ] as WindowVision[],
};

/* ===========================================================================
 *  墙上的相框（加分探索，非结局必需）—— 点击展示卡片
 * =========================================================================== */
export const paintings: PaintingCard[] = [
  {
    id: "education",
    label: "毕业照",
    title: "起点 · 教育背景",
    lines: [
      { heading: "河南城建学院", body: "信息管理与信息系统（大数据方向）· 本科 · 2017 — 2021" },
      { heading: "★ 国家级单项奖学金 ×2", body: "2018 / 2019" },
      { heading: "◆ 河南省优秀学位论文", body: "省级荣誉 Top 1%" },
      { heading: "★ 省级单项奖学金", body: "2020" },
    ],
  },
  {
    id: "opensource",
    label: "贡献墙",
    title: "开源贡献 · Pull Requests",
    lines: [
      { heading: "hertz-contrib/jwt #27", body: "修复 RefreshToken 中 orig_iat 被意外重置导致 MaxRefresh 窗口失效的 Bug" },
      { heading: "hertz-contrib/obs-opentelemetry #67", body: "优化可观测性组件，提升链路追踪稳定性与准确性" },
      { heading: "cloudwego/abcoder #84", body: "修复 Go 1.25+ 环境下 sonic 依赖版本导致的安装编译错误" },
    ],
  },
  {
    id: "showreel",
    label: "影集",
    title: "技术演示影集 · Remotion",
    lines: [
      { heading: "技术身份短片 · 15s", body: "以 Go、CloudWeGo、可观测性为线索呈现技术定位与能力域" },
      { heading: "架构演进历程 · 25s", body: "单体职责拆分、Hertz/Kitex 调用链显式化、trace 驱动诊断闭环" },
      { heading: "数据湖平台 · 25s", body: "配置驱动 ETL、mapping_rules 到 DAG、BFS 最优 JOIN 路径" },
      { heading: "作品集总叙事片 · 60s", body: "跨视频 excerpt 与全局桥接层，组成完整技术画像" },
    ],
  },
];

/* ===========================================================================
 *  收集系统：5 个记忆碎片（隐藏的、更私人的故事）
 *  —— 靠近自动拾取，每个解锁一段更私人的自白
 * =========================================================================== */
export const memoryShards: MemoryShard[] = [
  {
    id: "taurus",
    title: "金牛座的执念",
    story:
      "我是金牛座。有人说这意味着固执，我更愿意叫它「对可靠的执念」。把一件事打磨到自己满意，是我能给世界的、最朴素的浪漫。",
    place: "书架的书缝里",
  },
  {
    id: "rookie",
    title: "4000 次提交",
    story:
      "刚毕业时，我谁也不认识，只有一个庞大的系统和一行行陌生的代码。近四年、四千多次提交之后，它从「别人的系统」，长成了「我的系统」。",
    place: "台灯的光晕下",
  },
  {
    id: "midnight",
    title: "凌晨的复活术",
    story:
      "有几次生产环境在深夜崩了。我记得那种心跳——不是恐惧，是想把它救回来的冲动。当日恢复的背后，是无数次没人看见的演练。",
    place: "窗台的角落",
  },
  {
    id: "pearl",
    title: "Midnight Pearl",
    story:
      "我给自己的工程哲学起了名字：Midnight Pearl。Obsidian 的稳健、Pearl 的纯粹、Gold 的卓越。听起来像首饰，其实是我写每一行代码时的标尺。",
    place: "绿植的盆栽后",
  },
  {
    id: "origin",
    title: "被看见的那一刻",
    story:
      "那篇拿了省优秀的毕业论文，是我第一次相信：把一件事做到极致，是会被看见的。这份相信，我一直带到了今天。",
    place: "旧木箱的盒底",
  },
];

/* ----------------------------- 引导 / 结局 / 联系方式 ----------------------------- */

export const guide = {
  enterTitle: "我记忆的旧房间",
  enterSubtitle: "一间被个人历史温柔包围的房间。四处走走，点击那些发光的物品。",
  enterButton: "推门进入",
  enterHintDesktop: "W A S D 移动 · 鼠标环视 · 点击物件查看 · ESC 暂停",
  enterHintMobile: "左摇杆移动 · 右侧滑动环视 · 点按物件查看",
  floatingHint: "四处走走，点击那些发光的物品",
};

export const ending = {
  title: "门，开了。",
  message: "感谢你了解了我的全部。",
  body:
    "你拾起了散落的记忆，也走完了这间房里所有的故事。可靠与精工，是我留在每一行代码里的注脚——很高兴，被你认真地读过一次。",
  signature: "— 徐俊飞 Masons Xu",
};

export const contact = {
  title: "门外的世界 · 联系我",
  links: [
    { label: "Email", value: "masonsxu@foxmail.com", href: "mailto:masonsxu@foxmail.com" },
    { label: "GitHub", value: "github.com/masonsxu", href: "https://github.com/masonsxu" },
    { label: "Resume", value: "下载简历", href: "/resume.pdf" },
    { label: "Online", value: "masonsxu-github-io.pages.dev", href: "https://masonsxu-github-io.pages.dev" },
  ],
};

/** 主题展品集合（供引擎遍历生成） */
export const exhibits = {
  computer: computerExhibit,
  book: bookExhibit,
  backpack: backpackExhibit,
  window: windowExhibit,
};

/** 结局判定所需：必须浏览的核心展品 id */
export const requiredExhibitIds = ["computer", "book", "backpack", "window"] as const;
