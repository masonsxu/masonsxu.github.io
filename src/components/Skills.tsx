import { Code2, Database, Network } from 'lucide-react'
import ScrollReveal, { StaggerChild } from './ScrollReveal'
import SectionHeader from './SectionHeader'

const domains = [
  {
    icon: <Code2 size={18} />,
    title: 'Go 分布式系统',
    tags: ['Go 1.24+', 'Kitex RPC', 'Hertz HTTP', 'gRPC', 'GORM', 'Google Wire', 'Thrift IDL', 'Casbin RBAC']
  },
  {
    icon: <Database size={18} />,
    title: '数据湖与 ETL',
    tags: ['Apache Iceberg', 'Airflow 3.1', 'Trino', 'Polars', 'PyIceberg', 'PyArrow', 'Schema Evolution']
  },
  {
    icon: <Network size={18} />,
    title: '云原生与工程化',
    tags: ['Docker', 'Podman', 'Kubernetes', 'etcd', 'OpenTelemetry', 'Jaeger', 'PostgreSQL', 'Redis']
  }
]

export default function Skills() {
  return (
    <section id="skills" className="mb-32">
      <SectionHeader title="技术域 / Domains" className="mb-12" />

      <ScrollReveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <StaggerChild key={domain.title} className="h-full">
            <div className="h-full bg-surface border border-border/20 rounded-lg p-6 spotlight-card hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="text-primary">{domain.icon}</div>
                <h3 className="text-sm font-bold text-text uppercase tracking-wider">{domain.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {domain.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 bg-surface-light/50 border border-border/10 rounded text-muted hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </StaggerChild>
        ))}
      </ScrollReveal>
    </section>
  )
}
