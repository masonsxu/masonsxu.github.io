import type { TranslationSet } from "./types";

export const zh: TranslationSet = {
  hero: {
    tagline: "Go 后端工程师 · 分布式系统 · 云原生基础设施",
    description:
      "5 年 Go 后端开发经验，主导 Python → CloudWeGo 微服务架构转型，独立设计 10+ 微服务分布式数据平台",
    scroll: "Scroll",
    stats: [
      { num: 10, suffix: "+", label: "Microservices" },
      { num: 99.9, suffix: "%", label: "Availability" },
      { num: 50, suffix: "%", label: "Latency Reduced" },
      { num: 87, suffix: "%", label: "Deploy Faster" },
    ],
  },
  about: {
    label: "个人简介",
    highlights: [
      "主导 Python 单体到 CloudWeGo 微服务架构的整体转型",
      "独立设计并交付 10+ 微服务的分布式数据平台",
      "构建 Apache Iceberg + Airflow 数据湖平台",
      "向 CloudWeGo 开源项目提交 3 个已合并 PR",
    ],
    paragraph: [
      { text: "5 年 Go 后端开发经验，深耕" },
      { text: "分布式系统架构", highlight: true },
      { text: "与" },
      { text: "云原生基础设施", highlight: true },
      { text: "。从应届生成长为系统实际负责人，主导表单引擎设计、跨表单数据联动、性能重构、容器化转型与 25+ 第三方系统对接，长期主导生产环境部署与排障，积累大量分布式系统调试经验。" },
    ],
    quote: "架构不是设计出来的，而是在解决真实问题的过程中自然涌现的",
    cite: "— 工程哲学",
  },
  projects: {
    label: "架构实践",
    title: "从设计到",
    accent: "交付",
    description: "每个项目都是从零到一独立设计并落地的分布式系统实践",
    items: [
      {
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
        metrics: [
          { value: "10+", label: "Services" },
          { value: "数万行", label: "Go Code" },
        ],
        extras: [
          "6 位结构化错误码体系",
          "100 goroutines 并发隔离测试",
          "unsafe.Pointer 零拷贝转换",
        ],
      },
      {
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
        metrics: [
          { value: "4", label: "ETL Steps" },
          { value: "3", label: "Data Sources" },
        ],
        extras: [
          "BFS 图搜索最优 JOIN 路径",
          "FieldCommon0 聚合归一算法",
          "Schema Evolution 自动加列",
        ],
      },
      {
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
        metrics: [
          { value: "4,000+", label: "Commits" },
          { value: "4 年", label: "System Ownership" },
        ],
        extras: [
          "4 层嵌套组件树引擎",
          "跨表单实时数据联动",
          "25+ 第三方系统对接",
        ],
      },
      {
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
        metrics: [
          { value: "3", label: "Merged PRs" },
          { value: "330+", label: "AGENTS.md Lines" },
        ],
        extras: [
          "开源架构模板",
          "AI 辅助开发工作流",
          "生产级工程规范",
        ],
      },
    ],
  },
  architecture: {
    label: "架构能力",
    title: "核心",
    accent: "竞争力",
    competencies: [
      {
        id: "distributed",
        title: "分布式系统落地",
        desc: "独立完成从技术选型到系统交付的全链路设计，掌握 RPC 框架、服务治理、可观测性体系",
      },
      {
        id: "data-lake",
        title: "数据湖与 ETL",
        desc: "构建 Iceberg 数据湖平台，多源异构数据统一入湖，配置驱动 SQL 生成与跨源 JOIN",
      },
      {
        id: "cloud-native",
        title: "云原生工程效能",
        desc: "IDL-First 流程 + Google Wire 编译时 DI + CI/CD 自动化，构建标准化开发工作流",
      },
    ],
    performanceBefore: "数据说话 —",
    performanceAfter: "性能指标",
    metrics: [
      { id: "availability", label: "系统可用性" },
      { id: "latency", label: "响应时间降低" },
      { id: "modules", label: "微服务模块" },
      { id: "deploy", label: "部署时间缩短" },
    ],
    domainsLabel: "技术域",
    domains: [
      { id: "go-distributed", title: "Go 分布式系统" },
      { id: "data-etl", title: "数据湖与 ETL" },
      { id: "cloud-eng", title: "云原生与工程化" },
    ],
  },
  timeline: {
    careerLabel: "职业经历",
    careerTitle: "成长",
    careerAccent: "轨迹",
    careerItems: [
      {
        company: "福建自贸试验区厦门片区 Manteia 数据科技有限公司",
        subtitle: "核心业务研发与后端架构体系演进",
        roles: [
          {
            role: "Go 后端架构师 / 技术负责人",
            context:
              "基于前期在核心业务重构与工程提效上的突出表现，晋升主导新一代微服务架构升级与技术团队规范建设",
            points: [
              "主导后端服务化升级，完成 8 RPC + 1 API Gateway 的 9 服务体系建设，支撑多模块独立演进与部署",
              "统一 IDL-First 开发流程、分层架构约束与 Wire 依赖注入规范，将服务研发从「个人经验驱动」升级为「标准体系驱动」",
              "建设 OTel、Jaeger 与 trace / request_id 传播链路，打通网关到核心 RPC 的排障路径",
              "推动 8 人研发协作机制标准化，沉淀结构化技术资产，降低跨模块协作成本",
            ],
          },
          {
            role: "Python 后端开发工程师",
            points: [
              "以应届生加入，独立成长为系统实际负责人，主导 Asyncio 性能重构：重写核心链路为异步架构，查询效率提升 50%，数据加载响应提升 35%",
              "推动核心服务从 Shell 方式迁移至容器化工程流程，部署时间从 4 小时缩短至 30 分钟，交付效率提升 87.5%",
              "通过链路治理与变更风险收敛，故障率下降 45%，系统可用性提升至 99.9%",
              "多次在核心链路故障中实现当日快速恢复，兼顾极速止损与根因修复",
            ],
          },
        ],
      },
    ],
    careerKeywords: [
      "Go",
      "微服务",
      "DDD",
      "CloudWeGo",
      "OpenTelemetry",
      "容器化",
      "AI 辅助开发",
      "架构决策",
    ],
    educationLabel: "教育背景",
    school: "河南城建学院",
    major: "信息管理与信息系统（大数据方向）· 本科",
    honorsLabel: "Honors & Awards",
    awards: [
      { text: "国家级单项奖学金 ×2", detail: "省级荣誉 Top 1%", year: "2018 / 2019" },
      { text: "河南省优秀学位论文", detail: "省级荣誉 Top 1%" },
      { text: "省级单项奖学金", year: "2020" },
    ],
  },
  community: {
    label: "开源贡献",
    title: "社区",
    accent: "参与",
    featuredTitle: "CloudWeGo 微服务架构模板",
    featuredSubtitle: "· AI 辅助开发实践",
    featuredDesc:
      "基于生产级 Go 微服务实践，提炼并开源 CloudWeGo 标准架构模板；系统性落地 AI 辅助开发（Vibe Coding），构建从编码到 DevOps 的全流程人机协作体系。",
    featuredStats: [
      { value: "330+", unit: "行", label: "AGENTS.md 架构规范" },
      { value: "8", unit: "个", label: "Custom Skills 开发流程" },
      { value: "3", unit: "个", label: "AI 驱动 GitHub Actions" },
    ],
    prTitle: "Pull Requests 贡献",
    prs: [
      { id: "jwt-refresh", desc: "修复 RefreshToken 中 orig_iat 被意外重置导致 MaxRefresh 窗口失效的 Bug" },
      { id: "obs-otel", desc: "优化可观测性组件，提升链路追踪稳定性与准确性" },
      { id: "abcoder-go125", desc: "修复 Go 1.25+ 环境下 sonic 依赖版本导致的安装编译错误" },
    ],
  },
  contact: {
    label: "联系方式",
    title: "Let's",
    accent: "Connect",
    resumeValue: "Download Resume",
    copyright: "© 2026 徐俊飞. All rights reserved.",
  },
};
