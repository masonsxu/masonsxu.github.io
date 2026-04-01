import ScrollReveal, { StaggerChild } from './ScrollReveal';
import SectionHeader from './SectionHeader';

export default function Projects() {
  return (
    <section id="projects" className="mb-24 lg:mb-28">
      <SectionHeader title="架构实践 / Projects" className="mb-12" />

      <ScrollReveal stagger className="space-y-6">
        {/* Project 1: Radius Backend - Go Microservices */}
        <StaggerChild>
          <div className="group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
            <div className="grid md:grid-cols-12 gap-0">
              <div className="md:col-span-8 p-6 lg:p-7 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-mono font-bold">CORE</span>
                    <span className="text-muted text-xs font-mono">2025.03 - 至今</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-3 group-hover:text-accent transition-colors">
                    分布式数据管理平台 — CloudWeGo 微服务架构
                  </h3>
                  <p className="text-muted text-[15px] leading-7 mb-5 max-w-2xl">
                    独立设计并交付基于 CloudWeGo 生态的分布式数据平台。采用 Kitex RPC + Hertz HTTP 双栈架构，通过 Thrift IDL-First 定义 10+ 微服务契约，使用 Google Wire 编译时依赖注入，构建从 API 网关到 8 个 RPC 微服务的完整分布式系统。
                  </p>
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span><strong className="text-text">DDD 四层架构</strong>：Handler → Logic → DAL → Model 严格分层，业务逻辑与框架零耦合，仓储模式隔离数据访问</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span><strong className="text-text">分布式服务治理</strong>：Etcd 服务注册发现 + 通告地址 (Advertise Address) 解决容器网络映射；Kitex metainfo 实现全链路 RequestID 传播</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span><strong className="text-text">可观测性体系</strong>：OpenTelemetry + Jaeger 分布式追踪，中间件链路自动标记 {'>'}100ms 慢调用为 Warn 级别</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-accent mt-1">▹</span>
                      <span><strong className="text-text">安全与权限</strong>：JWT 三位置 Token 查找 (Header/Cookie/Query) + Casbin RBAC 多角色权限合并 + 菜单级粒度控制</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 border-l border-border/20 p-6 lg:p-7 flex flex-col justify-center space-y-5">
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Scale</div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="10+" label="Services" />
                    <StatItem value="数万行" label="Go Code" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Stack</div>
                  <div className="flex flex-wrap gap-2">
                    <Tag text="Kitex" />
                    <Tag text="Hertz" />
                    <Tag text="Wire" />
                    <Tag text="Thrift" />
                    <Tag text="etcd" />
                    <Tag text="Casbin" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Highlights</div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted leading-6">
                      <span className="text-primary">●</span> 6 位结构化错误码体系
                    </div>
                    <div className="text-xs text-muted leading-6">
                      <span className="text-primary">●</span> 100 goroutines 并发隔离测试
                    </div>
                    <div className="text-xs text-muted leading-6">
                      <span className="text-primary">●</span> unsafe.Pointer 零拷贝转换
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerChild>

        {/* Project 2: Radius DataLake */}
        <StaggerChild>
          <div className="group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
            <div className="grid md:grid-cols-12 gap-0">
              <div className="md:col-span-8 p-6 lg:p-7 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono font-bold">DATA LAKE</span>
                    <span className="text-muted text-xs font-mono">2025.03 - 至今</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-3 group-hover:text-blue-400 transition-colors">
                    数据湖平台 — Apache Iceberg + Airflow 配置驱动 ETL
                  </h3>
                  <p className="text-muted text-[15px] leading-7 mb-5 max-w-2xl">
                    构建基于 Apache Iceberg 的数据湖平台，将业务系统 REST API、MySQL、MongoDB 多源数据统一入湖。采用 Airflow 3.1 编排 + PyIceberg 直写 + Trino SQL 查询 + Polars 内存 JOIN 的技术栈，实现从配置同步→数据入湖→字典抽取→业务回传的完整数据流水线。
                  </p>
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-blue-400 mt-1">▹</span>
                      <span><strong className="text-text">配置驱动 SQL 生成引擎</strong>：解析业务 API 下发的 JSON 配置（mapping_rules），DictConfigParser 自动解析 interface_code 编码（source@table@field），生成 UNION ALL / JOIN SQL，BFS 图搜索在表关联图中找到最优 JOIN 路径</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-blue-400 mt-1">▹</span>
                      <span><strong className="text-text">多源异构数据统一入湖</strong>：MySQL 使用 SSDictCursor 流式游标逐批读取，MongoDB 采用原始模式（raw_document JSON 三列 schema）避免 schema 推断问题，数据统一写入 Iceberg Parquet 文件</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-blue-400 mt-1">▹</span>
                      <span><strong className="text-text">跨源 JOIN 与字典抽取</strong>：MongoDB raw_document 通过 Polars 解析 JSON 提取字段，Trino 查询 MySQL 侧小表，Polars 内存中执行 5 表链式 LEFT JOIN；FieldCommon0 聚合算法实现患者维度数据归一</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-blue-400 mt-1">▹</span>
                      <span><strong className="text-text">癌种数据隔离与回传</strong>：两阶段抽取（基础字典→癌种专属字典），通过 FieldCommon0 集合交集过滤防止数据混入；抽取结果生成 api_payload JSON 分批回传业务系统 REST API</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 border-l border-border/20 p-6 lg:p-7 flex flex-col justify-center space-y-5">
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Pipeline</div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="4 阶段" label="ETL Steps" />
                    <StatItem value="3 源" label="Data Sources" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Stack</div>
                  <div className="flex flex-wrap gap-2">
                    <Tag text="Iceberg" />
                    <Tag text="Airflow" />
                    <Tag text="Trino" />
                    <Tag text="Polars" />
                    <Tag text="PyIceberg" />
                    <Tag text="PyArrow" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Highlights</div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted leading-6">
                      <span className="text-blue-400">●</span> BFS 图搜索最优 JOIN 路径
                    </div>
                    <div className="text-xs text-muted leading-6">
                      <span className="text-blue-400">●</span> FieldCommon0 聚合归一算法
                    </div>
                    <div className="text-xs text-muted leading-6">
                      <span className="text-blue-400">●</span> Schema Evolution 自动加列
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerChild>

        {/* Project 3: Legacy System - Full Card */}
        <StaggerChild>
          <div className="group relative bg-surface border border-border/20 rounded-lg overflow-hidden hover:border-primary/50 transition-colors spotlight-card">
            <div className="grid md:grid-cols-12 gap-0">
              <div className="md:col-span-8 p-6 lg:p-7 flex flex-col justify-between h-full relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2 py-0.5 rounded-full bg-muted/10 text-muted text-xs font-mono font-bold">PYTHON ERA</span>
                    <span className="text-muted text-xs font-mono">2021.06 - 2025.03</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text mb-3 group-hover:text-primary transition-colors">
                    放疗流程管理系统 — 表单引擎与流程编排核心开发
                  </h3>
                  <p className="text-muted text-[15px] leading-7 mb-5 max-w-2xl">
                    作为系统主程（累计提交 4,000+ commits），独立负责 Flask + MySQL + MongoDB + Redis 架构的放疗流程管理系统。从应届生成长为系统实际负责人，主导表单引擎设计、跨表单数据联动、性能重构、容器化转型与 25+ 第三方系统对接。
                  </p>
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span><strong className="text-text">自定义表单引擎</strong>：基于 MongoDB 文档嵌套树实现 4 层深度组件树，支持 30+ 组件类型；Form → FormTemplate → PatientInfo 三层模型分离，支持表单设计、版本管理、模板快照与在线设计器</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span><strong className="text-text">跨表单数据联动机制</strong>：设计 association_code + association_form_code + is_quote 三元引用模型，实现跨表单、跨工作流的实时数据同步；MongoDB array_filters 实现 3 层嵌套数组精准批量更新，源组件元数据变更自动传播到所有引用表单</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span><strong className="text-text">工作流引擎</strong>：JSON 驱动的流程节点拓扑（node_config），支持 NEXT/PREVIOUS/REJECT 三种节点推进模式；预置组件值自动提取更新程/段实例字段；子流程系统支持主流程派生并行子流程</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span><strong className="text-text">性能优化</strong>：MySQL 连接池 LIFO 策略 + pool_pre_ping 健康检测；MongoDB primaryPreferred 读偏好 + 复合索引优化；组件样本扁平化索引替代全树遍历；响应时间降低 50%，系统可用性 99.9%</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span><strong className="text-text">第三方系统集成</strong>：设计 HOSPITAL_CODE 路由的适配器模式，对接 Mosaiq/Aria 放疗信息系统、HIS/EMR 医院系统、CA 电子签名、DICOM 影像、HL7 消息等 25+ 第三方系统</span>
                    </div>
                    <div className="flex items-start gap-3 text-[15px] leading-7 text-text">
                      <span className="text-primary mt-1">▹</span>
                      <span><strong className="text-text">容器化转型</strong>：从手动部署到 Docker 容器化，编写 Dockerfile + entrypoint.sh + 多环境配置模板，交付时间缩短 87%；Celery 异步任务处理 PDF 导出、数据同步、消息推送等后台任务</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-4 border-l border-border/20 p-6 lg:p-7 flex flex-col justify-center space-y-5">
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Contribution</div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatItem value="4,000+" label="Commits" />
                    <StatItem value="4 年" label="Ownership" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Stack</div>
                  <div className="flex flex-wrap gap-2">
                    <Tag text="Flask" />
                    <Tag text="MongoDB" />
                    <Tag text="MySQL" />
                    <Tag text="Redis" />
                    <Tag text="Celery" />
                    <Tag text="Docker" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase mb-2">Highlights</div>
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted leading-6">
                      <span className="text-primary">●</span> 4 层嵌套组件树引擎
                    </div>
                    <div className="text-xs text-muted leading-6">
                      <span className="text-primary">●</span> 跨表单实时数据联动
                    </div>
                    <div className="text-xs text-muted leading-6">
                      <span className="text-primary">●</span> 25+ 第三方系统对接
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerChild>
      </ScrollReveal>
    </section>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[1.35rem] font-bold text-text font-mono leading-none">{value}</div>
      <div className="text-[11px] text-muted mt-1">{label}</div>
    </div>
  )
}

function Tag({ text }: { text: string }) {
  return <span className="text-xs px-2.5 py-1 bg-surface-light/30 rounded text-muted">{text}</span>
}
