export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

export interface Project {
  num: string;
  title: string;
  subtitle: string;
  time: string;
  summary: string;
  highlights: { title: string; desc: string }[];
  techs: string[];
  metrics: { value: string; label: string }[];
  extras: string[];
}

export interface CareerRole {
  time: string;
}

export interface CareerCompany {
  company: string;
  time: string;
  roles: CareerRole[];
}

export interface AwardItem {
  icon: string;
  text: string;
  year?: string;
  detail?: string;
}

export const contactLinks: ContactLink[] = [
  {
    label: "Email",
    value: "masonsxu@foxmail.com",
    href: "mailto:masonsxu@foxmail.com",
  },
  {
    label: "GitHub",
    value: "github.com/masonsxu",
    href: "https://github.com/masonsxu",
  },
  {
    label: "Resume",
    value: "下载简历",
    href: "/resume.pdf",
  },
  {
    label: "Online",
    value: "masonsxu-github-io.pages.dev",
    href: "https://masonsxu-github-io.pages.dev",
  },
];

export const projects: Project[] = [
  {
    num: "01",
    title: "分布式数据管理平台",
    subtitle: "CloudWeGo 微服务架构",
    time: "2025.03 — 2026.04",
    summary:
      "独立设计并交付基于 CloudWeGo 生态的分布式数据平台。采用 Kitex RPC + Hertz HTTP 双栈架构，通过 Thrift IDL-First 定义 10+ 微服务契约，使用 Google Wire 编译时依赖注入，构建从 API 网关到 8 个 RPC 微服务的完整分布式系统。",
    highlights: [
      {
        title: "DDD 四层架构",
        desc: "Handler → Logic → DAL → Model 严格分层，业务逻辑与框架零耦合，仓储模式隔离数据访问",
      },
      {
        title: "分布式服务治理",
        desc: "Etcd 服务注册发现 + 通告地址解决容器网络映射；Kitex metainfo 全链路 RequestID 传播",
      },
      {
        title: "可观测性体系",
        desc: "OpenTelemetry + Jaeger 分布式追踪，中间件链路自动标记 >100ms 慢调用为 Warn 级别",
      },
      {
        title: "安全与权限",
        desc: "JWT 三位置 Token 查找 + Casbin RBAC 多角色权限合并 + 菜单级粒度控制",
      },
    ],
    techs: ["Kitex", "Hertz", "Wire", "Thrift", "etcd", "Casbin"],
    metrics: [
      { value: "10+", label: "Services" },
      { value: "数万行", label: "Go Code" },
    ],
    extras: ["6 位结构化错误码体系", "100 goroutines 并发隔离测试", "unsafe.Pointer 零拷贝转换"],
  },
  {
    num: "02",
    title: "数据湖平台",
    subtitle: "Apache Iceberg + Airflow 配置驱动 ETL",
    time: "2025.03 — 2026.04",
    summary:
      "构建基于 Apache Iceberg 的数据湖平台，将业务系统 REST API、MySQL、MongoDB 多源数据统一入湖。采用 Airflow 3.1 编排 + PyIceberg 直写 + Trino SQL 查询 + Polars 内存 JOIN 的技术栈。",
    highlights: [
      {
        title: "配置驱动 SQL 引擎",
        desc: "DictConfigParser 自动解析 interface_code 编码，BFS 图搜索找到最优 JOIN 路径",
      },
      {
        title: "多源异构数据入湖",
        desc: "MySQL SSDictCursor 流式游标，MongoDB raw_document JSON 三列 schema，统一写入 Iceberg Parquet",
      },
      {
        title: "跨源 JOIN 与字典抽取",
        desc: "Polars 解析 JSON 提取字段，Trino 查询小表，Polars 内存执行 5 表链式 LEFT JOIN",
      },
      {
        title: "癌种数据隔离与回传",
        desc: "两阶段抽取，FieldCommon0 集合交集过滤防止数据混入；api_payload 分批回传业务系统",
      },
    ],
    techs: ["Iceberg", "Airflow", "Trino", "Polars", "PyIceberg", "PyArrow"],
    metrics: [
      { value: "4", label: "ETL Steps" },
      { value: "3", label: "Data Sources" },
    ],
    extras: ["BFS 图搜索最优 JOIN 路径", "FieldCommon0 聚合归一算法", "Schema Evolution 自动加列"],
  },
  {
    num: "03",
    title: "放疗流程管理系统",
    subtitle: "表单引擎与流程编排核心开发",
    time: "2021.06 — 2025.03",
    summary:
      "作为系统主程（累计提交 4,000+ commits），独立负责 Flask + MySQL + MongoDB + Redis 架构的放疗流程管理系统。从应届生成长为系统实际负责人。",
    highlights: [
      {
        title: "自定义表单引擎",
        desc: "MongoDB 文档嵌套树实现 4 层深度组件树，支持 30+ 组件类型；三层模型分离",
      },
      {
        title: "跨表单数据联动",
        desc: "三元引用模型实现跨表单、跨工作流实时数据同步；MongoDB array_filters 3 层嵌套精准更新",
      },
      {
        title: "工作流引擎",
        desc: "JSON 驱动流程节点拓扑，支持 NEXT/PREVIOUS/REJECT 三种推进模式",
      },
      {
        title: "性能优化 & 集成",
        desc: "响应时间降低 50%，可用性 99.9%；适配器模式对接 25+ 第三方系统",
      },
    ],
    techs: ["Flask", "MongoDB", "MySQL", "Redis", "Celery", "Docker"],
    metrics: [
      { value: "4,000+", label: "Commits" },
      { value: "4 年", label: "System Ownership" },
    ],
    extras: ["4 层嵌套组件树引擎", "跨表单实时数据联动", "25+ 第三方系统对接"],
  },
  {
    num: "04",
    title: "CloudWeGo 微服务模板与开源贡献",
    subtitle: "生产级架构实践 · 开源贡献者",
    time: "2025 — 至今",
    summary:
      "基于生产经验沉淀 CloudWeGo 微服务标准架构模板，覆盖网关接入、服务发现、可观测、容器化与工程规范。系统性落地 AI 辅助开发流程，参与 CloudWeGo 生态组件问题修复与贡献。",
    highlights: [
      {
        title: "生产级微服务模板",
        desc: "提炼 Radius 项目实践经验，开源 CloudWeGo 标准架构模板，覆盖 Kitex/Hertz 双栈、DDD 分层、Wire DI、可观测性等完整工程规范",
      },
      {
        title: "AI 辅助开发体系",
        desc: "建立 AGENTS.md 架构规范文档、Custom Skills 开发流程脚本与 AI 驱动 GitHub Actions 工作流，提升端到端交付效率",
      },
      {
        title: "生态组件贡献",
        desc: "修复 hertz-contrib/jwt RefreshToken 窗口失效 Bug；优化可观测性组件稳定性；修复 Go 1.25+ 编译兼容性问题",
      },
    ],
    techs: ["CloudWeGo", "Kitex", "Hertz", "GitHub Actions", "Claude Code"],
    metrics: [
      { value: "3", label: "Merged PRs" },
      { value: "330+", label: "AGENTS.md Lines" },
    ],
    extras: ["开源架构模板", "AI 辅助开发工作流", "生产级工程规范"],
  },
];

export const career: CareerCompany[] = [
  {
    company: "Manteia 数据科技",
    time: "2021.06 — 2026.04",
    roles: [
      { time: "2025.03 — 2026.04" },
      { time: "2021.06 — 2025.03" },
    ],
  },
];

export const awards: AwardItem[] = [
  { icon: "★", text: "国家级单项奖学金 ×2", year: "2018 / 2019" },
  { icon: "◆", text: "河南省优秀学位论文", detail: "省级荣誉 Top 1%" },
  { icon: "★", text: "省级单项奖学金", year: "2020" },
];

export const careerKeywords = [
  "Go",
  "微服务",
  "DDD",
  "CloudWeGo",
  "OpenTelemetry",
  "容器化",
  "AI 辅助开发",
  "架构决策",
] as const;
