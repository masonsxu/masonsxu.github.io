# 徐俊飞 Masons Xu

**Go 后端工程师 · 分布式系统 · 云原生基础设施**

---

## 个人简介

5 年 Go 后端开发经验，深耕**分布式系统架构**与**云原生基础设施**。

主导 Python 单体到 **CloudWeGo 微服务架构**的整体转型，独立设计并交付 10+ 微服务的分布式数据平台；

构建基于 **Apache Iceberg + Airflow + Polars** 的数据湖平台，处理多源异构数据的 ETL 与跨源 JOIN；

向 **CloudWeGo 开源项目**提交 3 个已合并 PR，持续贡献 RPC/HTTP 框架生态。

---

## 架构实践 / Projects

### 1. 分布式数据管理平台 — CloudWeGo 微服务架构

**时间：** 2025.03 - 2026.04

**摘要：** 独立设计并交付基于 CloudWeGo 生态的分布式数据平台。采用 Kitex RPC + Hertz HTTP 双栈架构，通过 Thrift IDL-First 定义 10+ 微服务契约，使用 Google Wire 编译时依赖注入，构建从 API 网关到 8 个 RPC 微服务的完整分布式系统。

**核心亮点：**

- **DDD 四层架构**：Handler → Logic → DAL → Model 严格分层，业务逻辑与框架零耦合，仓储模式隔离数据访问
- **分布式服务治理**：Etcd 服务注册发现 + 通告地址 (Advertise Address) 解决容器网络映射；Kitex metainfo 实现全链路 RequestID 传播
- **可观测性体系**：OpenTelemetry + Jaeger 分布式追踪，中间件链路自动标记 `>100ms` 慢调用为 Warn 级别
- **安全与权限**：JWT 三位置 Token 查找 (Header/Cookie/Query) + Casbin RBAC 多角色权限合并 + 菜单级粒度控制

**技术栈：** Kitex、Hertz、Wire、Thrift、etcd、Casbin

**规模：**
- 10+ Services
- 数万行 Go Code

**其他亮点：**
- 6 位结构化错误码体系
- 100 goroutines 并发隔离测试
- unsafe.Pointer 零拷贝转换

---

### 2. 数据湖平台 — Apache Iceberg + Airflow 配置驱动 ETL

**时间：** 2025.03 - 2026.04

**摘要：** 构建基于 Apache Iceberg 的数据湖平台，将业务系统 REST API、MySQL、MongoDB 多源数据统一入湖。采用 Airflow 3.1 编排 + PyIceberg 直写 + Trino SQL 查询 + Polars 内存 JOIN 的技术栈，实现从配置同步→数据入湖→字典抽取→业务回传的完整数据流水线。

**核心亮点：**

- **配置驱动 SQL 生成引擎**：解析业务 API 下发的 JSON 配置（mapping_rules），DictConfigParser 自动解析 interface_code 编码（source@table@field），生成 UNION ALL / JOIN SQL，BFS 图搜索在表关联图中找到最优 JOIN 路径
- **多源异构数据统一入湖**：MySQL 使用 SSDictCursor 流式游标逐批读取，MongoDB 采用原始模式（raw_document JSON 三列 schema）避免 schema 推断问题，数据统一写入 Iceberg Parquet 文件
- **跨源 JOIN 与字典抽取**：MongoDB raw_document 通过 Polars 解析 JSON 提取字段，Trino 查询 MySQL 侧小表，Polars 内存中执行 5 表链式 LEFT JOIN；FieldCommon0 聚合算法实现患者维度数据归一
- **癌种数据隔离与回传**：两阶段抽取（基础字典→癌种专属字典），通过 FieldCommon0 集合交集过滤防止数据混入；抽取结果生成 api_payload JSON 分批回传业务系统 REST API

**技术栈：** Iceberg、Airflow、Trino、Polars、PyIceberg、PyArrow

**规模：**
- 4 阶段 ETL Steps
- 3 源数据来源

**其他亮点：**
- BFS 图搜索最优 JOIN 路径
- FieldCommon0 聚合归一算法
- Schema Evolution 自动加列

---

### 3. 放疗流程管理系统 — 表单引擎与流程编排核心开发

**时间：** 2021.06 - 2025.03

**摘要：** 作为系统主程（累计提交 4,000+ commits），独立负责 Flask + MySQL + MongoDB + Redis 架构的放疗流程管理系统。从应届生成长为系统实际负责人，主导表单引擎设计、跨表单数据联动、性能重构、容器化转型与 25+ 第三方系统对接。

**核心亮点：**

- **自定义表单引擎**：基于 MongoDB 文档嵌套树实现 4 层深度组件树，支持 30+ 组件类型；Form → FormTemplate → PatientInfo 三层模型分离，支持表单设计、版本管理、模板快照与在线设计器
- **跨表单数据联动机制**：设计 association_code + association_form_code + is_quote 三元引用模型，实现跨表单、跨工作流的实时数据同步；MongoDB array_filters 实现 3 层嵌套数组精准批量更新，源组件元数据变更自动传播到所有引用表单
- **工作流引擎**：JSON 驱动的流程节点拓扑（node_config），支持 NEXT/PREVIOUS/REJECT 三种节点推进模式；预置组件值自动提取更新程/段实例字段；子流程系统支持主流程派生并行子流程
- **性能优化**：MySQL 连接池 LIFO 策略 + pool_pre_ping 健康检测；MongoDB primaryPreferred 读偏好 + 复合索引优化；组件样本扁平化索引替代全树遍历；响应时间降低 50%，系统可用性 99.9%
- **第三方系统集成**：设计 HOSPITAL_CODE 路由的适配器模式，对接 Mosaiq/Aria 放疗信息系统、HIS/EMR 医院系统、CA 电子签名、DICOM 影像、HL7 消息等 25+ 第三方系统
- **容器化转型**：从手动部署到 Docker 容器化，编写 Dockerfile + entrypoint.sh + 多环境配置模板，交付时间缩短 87%；Celery 异步任务处理 PDF 导出、数据同步、消息推送等后台任务

**技术栈：** Flask、MongoDB、MySQL、Redis、Celery、Docker

**贡献：**
- 4,000+ Commits
- 4 年系统所有权

**其他亮点：**
- 4 层嵌套组件树引擎
- 跨表单实时数据联动
- 25+ 第三方系统对接

---

### 4. CloudWeGo 微服务模板与开源贡献 — 生产级架构实践 · 开源贡献者

**时间：** 2025 - 至今

**摘要：** 基于生产经验沉淀 CloudWeGo 微服务标准架构模板，覆盖网关接入、服务发现、可观测、容器化与工程规范。系统性落地 AI 辅助开发流程，参与 CloudWeGo 生态组件问题修复与贡献。

**核心亮点：**

- **生产级微服务模板**：提炼 Radius 项目实践经验，开源 CloudWeGo 标准架构模板，覆盖 Kitex/Hertz 双栈、DDD 分层、Wire DI、可观测性等完整工程规范
- **AI 辅助开发体系**：建立 AGENTS.md 架构规范文档、Custom Skills 开发流程脚本与 AI 驱动 GitHub Actions 工作流，提升端到端交付效率
- **生态组件贡献**：修复 hertz-contrib/jwt RefreshToken 窗口失效 Bug；优化可观测性组件稳定性；修复 Go 1.25+ 编译兼容性问题

**技术栈：** CloudWeGo、Kitex、Hertz、GitHub Actions、Claude Code

**规模：**
- 3 Merged PRs
- 330+ AGENTS.md Lines

**其他亮点：**
- 开源架构模板
- AI 辅助开发工作流
- 生产级工程规范

---

> "架构不是设计出来的，而是在解决真实问题的过程中自然涌现的"
> — 工程哲学

---

## 架构能力 / Architecture

### 核心竞争力

#### 1. 分布式系统落地
独立完成从技术选型到系统交付的全链路设计，掌握 RPC 框架、服务治理、可观测性体系

**技术：** Kitex、Hertz、etcd、OpenTelemetry

#### 2. 数据湖与 ETL
构建 Iceberg 数据湖平台，多源异构数据统一入湖，配置驱动 SQL 生成与跨源 JOIN

**技术：** Iceberg、Airflow、Trino、Polars

#### 3. 云原生工程效能
IDL-First 流程 + Google Wire 编译时 DI + CI/CD 自动化，构建标准化开发工作流

**技术：** CloudWeGo、Docker、Wire DI、OpenTelemetry

---

### 数据指标

- **10+** 独立设计的微服务模块
- **数万行** Go 生产环境核心代码
- **Python → Go** 主导整体架构转型
  - Team Size: 8 人
  - Arch Docs: 2,000+ 行

---

### 性能数据

- **99.9%** 系统可用性
- **50%** 响应时间降低
- **10+** 微服务模块
- **87%** 部署时间缩短

---

## 技术域 / Domains

### 1. Go 分布式系统

**标签：** Go 1.24+、Kitex RPC、Hertz HTTP、gRPC、GORM、Google Wire、Thrift IDL、Casbin RBAC

---

### 2. 数据湖与 ETL

**标签：** Apache Iceberg、Airflow 3.1、Trino、Polars、PyIceberg、PyArrow、Schema Evolution

---

### 3. 云原生与工程化

**标签：** Docker、Podman、Kubernetes、etcd、OpenTelemetry、Jaeger、PostgreSQL、Redis

---

## 职业经历 / Career

### 福建自贸试验区厦门片区 Manteia 数据科技有限公司

**定位：** 核心业务研发与后端架构体系演进
**时间：** 2021.06 - 2026.04

#### Go 后端架构师 / 技术负责人（2025.03 - 2026.04）

*基于前期在核心业务重构与工程提效上的突出表现，晋升主导新一代微服务架构升级与技术团队规范建设。*

- 主导后端服务化升级，完成 **8 RPC + 1 API Gateway** 的 9 服务体系建设，支撑多模块独立演进与部署
- 统一 IDL-First 开发流程、分层架构约束与 Wire 依赖注入规范，将服务研发从「个人经验驱动」升级为「标准体系驱动」
- 建设 **OTel、Jaeger** 与 trace / request_id 传播链路，打通网关到核心 RPC 的排障路径
- 推动 8 人研发协作机制标准化，沉淀结构化技术资产，降低跨模块协作成本

#### Python 后端开发工程师（2021.06 - 2025.03）

- 以应届生加入，独立成长为系统实际负责人，主导 **Asyncio 性能重构**：重写核心链路为异步架构，查询效率提升 50%，数据加载响应提升 35%
- 推动核心服务从 Shell 方式迁移至容器化工程流程，部署时间从 **4 小时缩短至 30 分钟**，交付效率提升 87.5%
- 通过链路治理与变更风险收敛，故障率下降 **45%**，系统可用性提升至 **99.9%**
- 多次在核心链路故障中实现当日快速恢复，兼顾极速止损与根因修复

---

### 关键词

Go、微服务、DDD、CloudWeGo、OpenTelemetry、容器化、AI 辅助开发、架构决策

---

## 灵魂底色 / The Essence

设计与架构的**华丽交响**

我认为，一段优雅的代码应当如顶级奢侈品般，在隐秘处追求极致的细节。**Midnight Pearl** 不仅仅是一套配色方案，它代表了我对系统架构的追求：深邃、稳定且散发着理性的光芒。

### 设计理念

- **Obsidian** — Stability / 稳健
- **Pearl** — Clarity / 纯粹
- **Gold** — Excellence / 卓越

### 星座象征

**Taurus 金牛座 / 4.20 - 5.20**

> "Luxury is balance of design and function, much like steady heart of the Bull."

特质：Reliable（可靠）· Artistic（艺术感）

---

## 技术演示影集 / Technical Showreel

通过可视化视频演示展示 **Go 微服务架构**、**分布式系统演进**、**GitHub 开源贡献** 与 **数据平台实践**，让技术作品集不仅可读，也可被直观看见。

### 1. 动态技术名片 (Tech Card)

使用 Remotion 构建的个人动态名片。通过 spring() 与 interpolate() 呈现名字入场、核心技术栈标签轮播与域名收尾。

**时长：** 15s | **技术：** spring()、interpolate()、Sequence

---

### 2. 开源项目看板 (Open Source Dashboard)

数据驱动的开源看板动画。终端打字机入场、指标数字滚动、环形进度条、Kitex/Hertz 微服务拓扑图，数据来源于 Cloudflare 环境变量每日更新。

**时长：** 20s | **技术：** Env Driven、SVG Topology、Ring Chart

---

### 3. 架构演进历程 (Architecture Evolution)

从 Python 单体到 Go 微服务的架构演进叙事。展示 Monolith 裂变、DDD 分层设计、请求链路追踪与性能指标跳变，诠释架构即设计与功能的平衡。

**时长：** 25s | **技术：** Series、DDD、Fission、spring()

---

### 4. GitHub 贡献热力图 (Contribution Heatmap)

GitHub 贡献热力图动态生长动画。星空粒子漂浮入场、流星击中方格涟漪扩散、成就标签数据叠加、最终定格全景贡献墙，诠释持续构建的力量。

**时长：** 20s | **技术：** Heatmap、Ripple、spring()、SVG Grid

---

### 5. 作品集预告片 (Portfolio Trailer)

60 秒完整预告片。通过 TransitionSeries + fade 交叉溶解串联技术名片、架构演进、贡献热力图与域名定格，附带全局暗角与胶片噪点后期。

**时长：** 60s | **技术：** TransitionSeries、fade()、Vignette、Grain

---

## 开源贡献与教育背景 / Open Source & Education

### 开源项目

#### CloudWeGo 微服务架构模板 · AI 辅助开发实践

基于生产级 Go 微服务实践，提炼并开源 CloudWeGo 标准架构模板；系统性落地 AI 辅助开发（Vibe Coding），构建从编码到 DevOps 的全流程人机协作体系。

**核心亮点：**
- 编写 **330+ 行 AGENTS.md**，将架构规范编码为 AI 可理解的上下文
- 设计 **8 个 Custom Skills** 封装端到端开发流程
- 部署 **3 个 AI 驱动 GitHub Actions**，实现 DevOps 自动化

**技术标签：**
- **核心：** Kitex RPC、Hertz HTTP、CloudWeGo
- **辅助：** Etcd、Wire DI、Casbin、OpenTelemetry、AGENTS.md、GitHub Actions

---

### Pull Requests 贡献

- **hertz-contrib/jwt #27** — 修复 RefreshToken 中 orig_iat 被意外重置导致 MaxRefresh 窗口失效的 Bug
- **hertz-contrib/obs-opentelemetry #67** — 优化可观测性组件，提升链路追踪稳定性与准确性
- **cloudwego/abcoder #84** — 修复 Go 1.25+ 环境下 sonic 依赖版本导致的安装编译错误

---

### 教育背景

**学校：** 河南城建学院
**专业：** 信息管理与信息系统（大数据方向）
**学历：** 本科
**时间：** 2017 - 2021

**奖项荣誉：**
- ⭐ 国家级单项奖学金 x2（2018 / 2019）
- 🎓 河南省优秀学位论文（省级荣誉，Top 1%）
- 🎓 省级单项奖学金（2020）

---

## 联系方式

- **Email：** masonsxu@foxmail.com
- **GitHub：** [github.com/masonsxu](https://github.com/masonsxu)
- **Resume：** [下载简历](resume.pdf)
- **在线访问：** [masonsxu-github-io.pages.dev](https://masonsxu-github-io.pages.dev)

---

**© 2026 徐俊飞. All rights reserved.**
