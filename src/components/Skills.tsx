import { Code2, Network, Container, Brain } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ScrollReveal, { StaggerChild } from './ScrollReveal'

const skillGroups = [
  {
    icon: <Code2 size={16} />,
    title: 'Go 微服务架构（核心主线）',
    skills: [
      { label: '语言与并发：', text: 'Go 1.24+，精通 goroutine/channel 并发模型、内存管理、GC 调优与性能分析' },
      { label: '微服务框架：', text: 'CloudWeGo（Kitex RPC + Hertz HTTP）、gRPC、etcd 服务注册/发现/配置热更新、负载均衡' },
      { label: '架构设计：', text: 'DDD 四层架构（Handler→Logic→DAL→Converter）、IDL-First 开发（Thrift）、API 网关设计、Google Wire 编译期依赖注入' },
      { label: '存储：', text: 'PostgreSQL / MySQL / MongoDB 事务与索引优化；Redis 缓存设计与分布式锁；S3 兼容对象存储' },
    ],
  },
  {
    icon: <Network size={16} />,
    title: '分布式治理与可观测性',
    skills: [
      { label: '服务治理：', text: '限流熔断、服务发现与健康检查、配置中心（etcd）热更新、服务降级' },
      { label: '可观测性：', text: 'OpenTelemetry 全链路追踪（request_id / trace_id 透传）、统一 6 位错误码体系、分层错误转换、监控告警' },
      { label: '权限安全：', text: 'Casbin RBAC/ABAC、JWT 认证、API 级鉴权、组织→部门→用户三级权限体系' },
    ],
  },
  {
    icon: <Container size={16} />,
    title: '工程化与生产落地',
    skills: [
      { label: '容器化：', text: 'Docker、Docker Compose、Podman、Portainer，多环境镜像构建策略与容器化运维' },
      { label: '工程规范：', text: 'IDL-First 开发流程、代码评审机制、技术分享制度、架构文档体系' },
    ],
  },
  {
    icon: <Brain size={16} />,
    title: '差异化领域能力',
    skills: [
      { label: '数据库优化：', text: '查询性能分析、索引策略、读写分离、分库分表方案' },
      { label: 'Python 工程化：', text: 'Asyncio 高性能异步、Flask、Pydantic / SQLAlchemy、大规模数据处理（Pandas / Polars / PyArrow）、自动化迁移与容器化改造' },
    ],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="mb-32">
      <SectionHeader title="专业技能 / Skills" className="mb-12" />

      <ScrollReveal stagger className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillGroups.map(group => (
          <StaggerChild key={group.title} className="h-full">
            <div className="h-full bg-surface border border-border/20 rounded-lg p-6 spotlight-card hover:border-primary/50 transition-colors flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-primary">{group.icon}</div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{group.title}</h3>
              </div>
              <div className="space-y-3 flex-1">
                {group.skills.map(skill => (
                  <div key={skill.label} className="text-sm">
                    <span className="text-primary font-medium">{skill.label}</span>
                    <span className="text-muted">{skill.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerChild>
        ))}
      </ScrollReveal>
    </section>
  )
}
