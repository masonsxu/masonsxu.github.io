import { ChevronRight, Code, Database, Server } from "lucide-react";
import SectionHeader from "./SectionHeader";

type ProjectItem = {
  id: string;
  title: string;
  period: string;
  badge: string;
  badgeClassName: string;
  summary: string;
  description: string;
  highlights: string[];
  highlightIcons: string[];
  stats: { value: string; label: string }[];
  techs: string[];
  icon: typeof Server;
};

const projects: ProjectItem[] = [
  {
    id: "microservices",
    title: "分布式数据管理平台 — CloudWeGo 微服务架构",
    period: "2025.03 - 至今",
    badge: "CORE",
    badgeClassName: "bg-primary/10 text-primary",
    summary:
      "独立设计并交付基于 CloudWeGo 生态的分布式数据平台。采用 Kitex RPC + Hertz HTTP 双栈架构，通过 Thrift IDL-First 定义 10+ 微服务契约。",
    description:
      "采用 Kitex RPC + Hertz HTTP 双栈架构，通过 Thrift IDL-First 定义 10+ 微服务契约，使用 Google Wire 编译时依赖注入，构建从 API 网关到 8 个 RPC 微服务的完整分布式系统。DDD 四层架构严格分层，Etcd 服务注册发现解决容器网络映射，OpenTelemetry + Jaeger 实现全链路可观测性。",
    highlights: [
      "DDD 四层架构：Handler → Logic → DAL → Model 严格分层，业务逻辑与框架零耦合",
      "分布式服务治理：Etcd 服务注册发现 + 通告地址解决容器网络映射",
      "可观测性体系：OpenTelemetry + Jaeger 分布式追踪，慢调用自动标记",
      "安全与权限：JWT 三位置 Token 查找 + Casbin RBAC 多角色权限合并",
    ],
    highlightIcons: ["▹", "▹", "▹", "▹"],
    stats: [
      { value: "10+", label: "Services" },
      { value: "数万行", label: "Go Code" },
    ],
    techs: ["Kitex", "Hertz", "Wire", "Thrift", "etcd", "Casbin"],
    icon: Server,
  },
  {
    id: "datalake",
    title: "数据湖平台 — Apache Iceberg + Airflow 配置驱动 ETL",
    period: "2025.03 - 至今",
    badge: "DATA LAKE",
    badgeClassName: "bg-blue-500/10 text-blue-400",
    summary:
      "构建基于 Apache Iceberg 的数据湖平台，将多源数据统一入湖。采用 Airflow 3.1 编排 + PyIceberg 直写 + Trino SQL 查询 + Polars 内存 JOIN。",
    description:
      "采用 Airflow 3.1 编排 + PyIceberg 直写 + Trino SQL 查询 + Polars 内存 JOIN 的技术栈，实现从配置同步到数据入湖到字典抽取到业务回传的完整数据流水线。配置驱动 SQL 生成引擎自动解析 JSON 配置，BFS 图搜索找到最优 JOIN 路径。",
    highlights: [
      "配置驱动 SQL 生成引擎：自动解析 JSON 配置，BFS 图搜索最优 JOIN 路径",
      "多源异构数据统一入湖：MySQL 流式游标 + MongoDB raw_document 模式",
      "跨源 JOIN 与字典抽取：Polars 5 表链式 LEFT JOIN，FieldCommon0 聚合归一",
      "癌种数据隔离与回传：两阶段抽取，FieldCommon0 集合交集过滤",
    ],
    highlightIcons: ["▹", "▹", "▹", "▹"],
    stats: [
      { value: "4 阶段", label: "ETL Steps" },
      { value: "3 源", label: "Data Sources" },
    ],
    techs: ["Iceberg", "Airflow", "Trino", "Polars", "PyIceberg", "PyArrow"],
    icon: Database,
  },
  {
    id: "legacy",
    title: "放疗流程管理系统 — 表单引擎与流程编排核心开发",
    period: "2021.06 - 2025.03",
    badge: "PYTHON ERA",
    badgeClassName: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    summary:
      "作为系统主程（累计提交 4,000+ commits），独立负责 Flask + MySQL + MongoDB + Redis 架构的放疗流程管理系统。",
    description:
      "从应届生成长为系统实际负责人，主导表单引擎设计、跨表单数据联动、性能重构、容器化转型与 25+ 第三方系统对接。自定义表单引擎基于 MongoDB 文档嵌套树实现 4 层深度组件树，支持 30+ 组件类型。设计三元引用模型实现跨表单实时数据同步。",
    highlights: [
      "自定义表单引擎：MongoDB 文档嵌套树 4 层深度组件树，30+ 组件类型",
      "跨表单数据联动：三元引用模型，MongoDB array_filters 精准批量更新",
      "工作流引擎：JSON 驱动流程节点拓扑，支持 NEXT/PREVIOUS/REJECT 三种模式",
      "性能优化：MySQL 连接池 LIFO + MongoDB primaryPreferred，响应时间降低 50%",
      "第三方系统集成：适配器模式对接 Mosaiq/Aria、HIS/EMR、CA 签名等 25+ 系统",
      "容器化转型：Dockerfile + entrypoint.sh + 多环境配置，交付时间缩短 87%",
    ],
    highlightIcons: ["▹", "▹", "▹", "▹", "▹", "▹"],
    stats: [
      { value: "4,000+", label: "Commits" },
      { value: "4 年", label: "Ownership" },
    ],
    techs: ["Flask", "MongoDB", "MySQL", "Redis", "Celery", "Docker"],
    icon: Code,
  },
];

function ProjectCard({ project }: { project: ProjectItem }) {
  const Icon = project.icon;

  return (
    <details className="group bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
      <summary className="flex items-start gap-4 w-full text-left p-5 lg:p-6 cursor-pointer list-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-bg rounded-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-surface-light border border-border/20 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${project.badgeClassName}`}
            >
              {project.badge}
            </span>
            <span className="text-muted text-xs font-mono">
              {project.period}
            </span>
          </div>

          <h3 className="text-xl font-bold text-text group-open:text-accent transition-colors">
            {project.title}
          </h3>

          <p className="text-muted text-[15px] leading-7 line-clamp-2 mt-2">
            {project.summary}
          </p>
        </div>

        <ChevronRight
          className="flex-shrink-0 text-muted transition-transform group-open:rotate-90"
          size={18}
        />
      </summary>

      <div className="px-5 lg:px-6 pb-6 pt-0 border-t border-border/10">
        <div className="pt-5 grid md:grid-cols-12 gap-6">
          <div className="md:col-span-8 space-y-5">
            <p className="text-muted text-[15px] leading-7">
              {project.description}
            </p>

            <div className="space-y-2.5">
              {project.highlights.map((highlight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-[15px] leading-7 text-text"
                >
                  <span className="text-accent mt-1">
                    {project.highlightIcons[i]}
                  </span>
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 space-y-5">
            <div>
              <div className="text-xs text-muted font-mono uppercase mb-2">
                Scale
              </div>
              <div className="grid grid-cols-2 gap-4">
                {project.stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-[1.35rem] font-bold text-text font-mono leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-muted mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted font-mono uppercase mb-2">
                Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {project.techs.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2.5 py-1 bg-stone-100 text-stone-600 rounded font-mono dark:bg-stone-800/50 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="mb-24 lg:mb-28">
      <SectionHeader title="架构实践 / Projects" className="mb-12" />

      <div className="space-y-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
