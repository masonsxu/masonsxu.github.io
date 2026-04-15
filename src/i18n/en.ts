import type { TranslationSet } from "./types";

export const en: TranslationSet = {
  hero: {
    tagline: "Go Backend Engineer · Distributed Systems · Cloud Native Infrastructure",
    description:
      "5 years of Go backend experience. Led the Python → CloudWeGo microservices transformation. Independently designed a distributed data platform with 10+ microservices.",
    scroll: "Scroll",
    stats: [
      { value: "10+", label: "Microservices" },
      { value: "99.9%", label: "Availability" },
      { value: "50%", label: "Latency Reduced" },
      { value: "87%", label: "Deploy Faster" },
    ],
  },
  about: {
    label: "About",
    highlights: [
      "Led the end-to-end transformation from Python monolith to CloudWeGo microservices",
      "Independently designed and delivered a distributed data platform with 10+ microservices",
      "Built an Apache Iceberg + Airflow data lake platform",
      "Submitted 3 merged PRs to the CloudWeGo open-source project",
    ],
    paragraph:
      "5 years of Go backend experience, specializing in {0}distributed systems architecture{1} and {2}cloud-native infrastructure{3}. Grew from a fresh graduate to the de facto system owner — leading form engine design, cross-form data linking, performance refactoring, containerization, and integration with 25+ third-party systems. Extensive hands-on experience in production deployment and distributed systems debugging.",
    quote:
      "Architecture is not designed — it emerges naturally from solving real problems",
    cite: "— Engineering Philosophy",
  },
  projects: {
    label: "Projects",
    title: "From Design to",
    accent: "Delivery",
    description:
      "Each project is a distributed system built from scratch — independently designed and delivered end-to-end.",
    items: [
      {
        title: "Distributed Data Platform",
        subtitle: "CloudWeGo Microservices Architecture",
        time: "2025.03 — 2026.04",
        summary:
          "Independently designed and delivered a CloudWeGo-based distributed data platform. Kitex RPC + Hertz HTTP dual-stack architecture, Thrift IDL-First contracts for 10+ microservices, Google Wire compile-time DI, from API gateway to 8 RPC microservices.",
        highlights: [
          {
            title: "DDD Four-Layer Architecture",
            desc: "Handler → Logic → DAL → Model strict layering, zero coupling between business logic and framework, repository pattern for data access isolation",
          },
          {
            title: "Distributed Service Governance",
            desc: "Etcd service discovery + advertise address for container network mapping; Kitex metainfo for full-chain RequestID propagation",
          },
          {
            title: "Observability Stack",
            desc: "OpenTelemetry + Jaeger distributed tracing, middleware auto-tagging >100ms slow calls as Warn level",
          },
          {
            title: "Security & Authorization",
            desc: "JWT triple-location token lookup + Casbin RBAC multi-role permission merging + menu-level granularity control",
          },
        ],
        metrics: [
          { value: "10+", label: "Services" },
          { value: "Tens of K", label: "Go Code" },
        ],
        extras: [
          "6-digit structured error code system",
          "100 goroutines concurrent isolation tests",
          "unsafe.Pointer zero-copy conversion",
        ],
      },
      {
        title: "Data Lake Platform",
        subtitle: "Apache Iceberg + Airflow Config-Driven ETL",
        time: "2025.03 — 2026.04",
        summary:
          "Built an Apache Iceberg data lake platform for unified ingestion from REST APIs, MySQL, and MongoDB. Airflow 3.1 orchestration + PyIceberg writes + Trino SQL queries + Polars in-memory JOINs.",
        highlights: [
          {
            title: "Config-Driven SQL Engine",
            desc: "DictConfigParser auto-resolves interface_code encoding, BFS graph search finds optimal JOIN paths",
          },
          {
            title: "Multi-Source Data Ingestion",
            desc: "MySQL SSDictCursor streaming, MongoDB raw_document JSON 3-column schema, unified Iceberg Parquet writes",
          },
          {
            title: "Cross-Source JOINs & Dictionary Extraction",
            desc: "Polars parses JSON for field extraction, Trino queries small tables, Polars executes 5-table chained LEFT JOINs in memory",
          },
          {
            title: "Cancer Type Data Isolation & Backfill",
            desc: "Two-phase extraction with FieldCommon0 set intersection filtering; api_payload batch backfill to business systems",
          },
        ],
        metrics: [
          { value: "4", label: "ETL Steps" },
          { value: "3", label: "Data Sources" },
        ],
        extras: [
          "BFS optimal JOIN path search",
          "FieldCommon0 aggregation normalization",
          "Schema Evolution auto-add columns",
        ],
      },
      {
        title: "Radiation Therapy Workflow System",
        subtitle: "Form Engine & Process Orchestration",
        time: "2021.06 — 2025.03",
        summary:
          "As the lead developer (4,000+ commits), independently built and maintained a Flask + MySQL + MongoDB + Redis radiation therapy workflow management system. Grew from a fresh graduate to the de facto system owner.",
        highlights: [
          {
            title: "Custom Form Engine",
            desc: "MongoDB document-nested tree for 4-level deep component trees, supporting 30+ component types; three-layer model separation",
          },
          {
            title: "Cross-Form Data Linking",
            desc: "Ternary reference model for real-time data sync across forms and workflows; MongoDB array_filters for 3-level nested precise updates",
          },
          {
            title: "Workflow Engine",
            desc: "JSON-driven process node topology, supporting NEXT/PREVIOUS/REJECT progression modes",
          },
          {
            title: "Performance & Integration",
            desc: "50% response time reduction, 99.9% availability; adapter pattern for 25+ third-party system integrations",
          },
        ],
        metrics: [
          { value: "4,000+", label: "Commits" },
          { value: "4 Years", label: "System Ownership" },
        ],
        extras: [
          "4-level nested component tree engine",
          "Cross-form real-time data linking",
          "25+ third-party integrations",
        ],
      },
    ],
  },
  architecture: {
    label: "Architecture",
    title: "Core",
    accent: "Competencies",
    competencies: [
      {
        title: "Distributed Systems",
        desc: "Full-lifecycle design from tech selection to system delivery. Proficient in RPC frameworks, service governance, and observability",
      },
      {
        title: "Data Lake & ETL",
        desc: "Built an Iceberg data lake for unified multi-source ingestion, config-driven SQL generation, and cross-source JOINs",
      },
      {
        title: "Cloud Native Engineering",
        desc: "IDL-First workflow + Google Wire compile-time DI + CI/CD automation for standardized development processes",
      },
    ],
    performanceBefore: "By the numbers —",
    performanceAfter: "Performance Metrics",
    metrics: ["System Availability", "Latency Reduction", "Microservice Modules", "Deploy Time Reduced"],
    domainsLabel: "Domains",
    domains: ["Go Distributed Systems", "Data Lake & ETL", "Cloud Native & Engineering"],
  },
  essence: {
    label: "The Essence",
    titleBefore: "Design & Architecture's",
    titleAccent: "Grand Symphony",
    description:
      "I believe elegant code should be like fine craftsmanship — pursuing ultimate detail in places unseen. Midnight Pearl is more than a color scheme; it represents my pursuit of system architecture: deep, stable, and radiating rational brilliance.",
    pillars: [
      {
        meaning: "Stability / 稳健",
        desc: "The bedrock of distributed systems — steady, reliable, bearing the weight of everything above",
      },
      {
        meaning: "Clarity / 纯粹",
        desc: "Purity of code and transparency of logic — every line stands up to scrutiny",
      },
      {
        meaning: "Excellence / 卓越",
        desc: "The relentless pursuit of detail, radiating rational brilliance in places unseen",
      },
    ],
    taurusQuote:
      '"Luxury is balance of design and function, much like steady heart of the Bull."',
    taurusTraits: ["Reliable", "Artistic"],
  },
  showreel: {
    label: "Technical Showreel",
    title: "Making the Portfolio",
    accent: "Visible",
    description:
      "Visual video demonstrations showcasing Go microservices architecture, distributed system evolution, GitHub open-source contributions, and data platform practices",
    videos: [
      {
        title: "Tech Identity Card",
        desc: "A 15-second narrative short reconstructed around real technical identity and capability boundaries. Using Go, CloudWeGo, OpenTelemetry and data platform stack as threads, presenting technical positioning, capability domains, and problem boundaries — not fabricated KPIs.",
      },
      {
        title: "Open Source Dashboard",
        desc: "A technical narrative reconstructed around real CloudWeGo contributions. Through terminal context, contribution fact cards, and scope topology, showcasing jwt fixes, observability stability, and Go 1.25+ compatibility issues.",
      },
      {
        title: "Architecture Evolution",
        desc: "An architecture evolution narrative around real request paths. Demonstrating monolith responsibility splitting, Hertz/Kitex call chain explicitization, intra-service layering, and trace-driven diagnostic loops.",
      },
      {
        title: "Data Lake Platform",
        desc: "A mechanism narrative around real config-driven ETL. Showcasing multi-source heterogeneous ingestion, mapping_rules to DAG transformation, BFS optimal JOIN paths, and the two-phase extraction api_payload backfill loop.",
      },
      {
        title: "GitHub Contribution Heatmap",
        desc: "A contribution trajectory narrative around a real 52-week GitHub contribution matrix. Showcasing annual contribution wall growth, peak cells mapped to key events, and fact cards for total contributions and consecutive windows.",
      },
      {
        title: "Portfolio Trailer",
        desc: "A 60-second master narrative reconstructed around real technical identity, system mechanisms, open-source evidence, and long-term contribution trajectory. Upgrading the portfolio from a clip reel to a complete technical portrait through cross-video excerpts and global bridging layers.",
      },
    ],
  },
  timeline: {
    careerLabel: "Career",
    careerTitle: "Growth",
    careerAccent: "Trajectory",
    careerItems: [
      {
        role: "Go Backend Architect / Tech Lead",
        points: [
          "Independently designed and delivered a CloudWeGo-based distributed data platform: Kitex RPC + Hertz HTTP dual-stack, 9-module go.work workspace",
          "Built an Apache Iceberg data lake platform: Airflow 3.1 orchestration + PyIceberg direct reads + Trino queries + Polars in-memory compute",
          "Designed distributed service governance: Etcd service discovery + OpenTelemetry + Jaeger full-chain tracing; Casbin RBAC",
          "Established engineering standards: Google Wire compile-time DI, 6-digit structured error code system, DDD four-layer architecture conventions",
        ],
      },
      {
        role: "Python Backend Developer",
        points: [
          "Joined as a fresh graduate, independently grew into the de facto system owner. Led Asyncio performance refactoring: rewrote core paths to async, reducing response time by 50%",
          "Led Docker containerization: from manual deployment to container orchestration, cutting delivery time by 87% and establishing standardized CI/CD",
          "Led production deployment and troubleshooting long-term, accumulating distributed systems debugging experience that drove the subsequent Go microservices transformation",
        ],
      },
    ],
    careerKeywords: [
      "Go",
      "Microservices",
      "DDD",
      "CloudWeGo",
      "OpenTelemetry",
      "Containerization",
      "AI-Assisted Dev",
      "Architecture Decisions",
    ],
    educationLabel: "Education",
    school: "Henan University of Urban Construction",
    major: "Information Management & Systems (Big Data) · Bachelor's",
    honorsLabel: "Honors & Awards",
    awards: [
      { text: "National Individual Scholarship ×2", detail: "Provincial Honor Top 1%", year: "2018 / 2019" },
      { text: "Henan Provincial Outstanding Thesis", detail: "Provincial Honor Top 1%" },
      { text: "Provincial Individual Scholarship", year: "2020" },
    ],
  },
  community: {
    label: "Open Source",
    title: "Community",
    accent: "Contributions",
    featuredTitle: "CloudWeGo Microservices Architecture Template",
    featuredSubtitle: "· AI-Assisted Development Practice",
    featuredDesc:
      "Distilled from production-grade Go microservices practices, open-sourced as a CloudWeGo standard architecture template. Systematically implementing AI-assisted development (Vibe Coding), building a full-pipeline human-AI collaboration system from coding to DevOps.",
    featuredStats: [
      { value: "330+", unit: " lines", label: "AGENTS.md Architecture Spec" },
      { value: "8", unit: "", label: "Custom Skills Dev Workflow" },
      { value: "3", unit: "", label: "AI-Driven GitHub Actions" },
    ],
    prTitle: "Pull Requests",
    prs: [
      { desc: "Fixed RefreshToken orig_iat being unexpectedly reset, causing MaxRefresh window invalidation" },
      { desc: "Improved observability components, enhancing tracing stability and accuracy" },
      { desc: "Fixed sonic dependency version causing build errors on Go 1.25+" },
    ],
  },
  contact: {
    label: "Contact",
    title: "Let's",
    accent: "Connect",
    resumeValue: "Download Resume",
    copyright: "© 2026 Xu Junfei. All rights reserved.",
  },
};
