import { ScrollReveal, SectionLabel } from "../ScrollReveal";

interface Project {
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

const projects: Project[] = [
  {
    num: "01",
    title: "分布式数据管理平台",
    subtitle: "CloudWeGo 微服务架构",
    time: "2025.03 — Present",
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
    time: "2025.03 — Present",
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
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <ScrollReveal delay={index * 150}>
      <article className="rounded-2xl border border-white/[0.04] bg-surface-elevated/40 p-6 md:p-10 transition-all duration-500 gold-border-glow hover:bg-surface-elevated/60 group">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 mb-6">
          <span className="text-4xl md:text-5xl font-mono font-bold gold-text opacity-25 leading-none select-none">
            {project.num}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-tight">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{project.subtitle}</p>
          </div>
          <span className="text-[11px] font-mono text-gold/70 border border-gold/15 rounded-full px-3 py-1.5 whitespace-nowrap">
            {project.time}
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm text-foreground/60 leading-relaxed mb-8">{project.summary}</p>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
          {project.highlights.map((h, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/[0.02] border border-white/[0.03] p-4 transition-colors duration-300 hover:border-gold/10"
            >
              <h4 className="text-sm font-medium text-foreground mb-1.5">{h.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techs.map((t) => (
            <span
              key={t}
              className="text-[11px] font-mono px-3 py-1 rounded-full bg-gold/[0.06] text-gold-light/80 border border-gold/[0.08]"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Bottom row: metrics + extras */}
        <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-white/[0.04]">
          <div className="flex gap-8">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <div className="text-lg font-mono font-semibold text-gold">{m.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.extras.map((e) => (
              <span
                key={e}
                className="text-[10px] text-muted-foreground/70 border border-white/[0.04] rounded-full px-2.5 py-1"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </article>
    </ScrollReveal>
  );
}

export function Projects() {
  return (
    <section className="section-padding relative">
      <div className="section-container">
        <ScrollReveal>
          <SectionLabel>架构实践 / Projects</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            从设计到<span className="gold-text">交付</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-relaxed">
            每个项目都是从零到一独立设计并落地的分布式系统实践
          </p>
        </ScrollReveal>

        <div className="mt-14 space-y-8">
          {projects.map((p, i) => (
            <ProjectCard key={p.num} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
