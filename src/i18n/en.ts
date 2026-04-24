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
      {
        title: "CloudWeGo Microservices Template & Open Source Contributions",
        subtitle: "Production-Grade Architecture Practice · Open Source Contributor",
        time: "2025 — Present",
        summary:
          "Distilled from production experience into a CloudWeGo standard microservices template, covering gateway integration, service discovery, observability, containerization and engineering conventions. Systematically implementing AI-assisted development workflows and contributing to the CloudWeGo ecosystem.",
        highlights: [
          {
            title: "Production-Grade Microservices Template",
            desc: "Distilled from the Radius project, open-sourced a CloudWeGo standard architecture template covering Kitex/Hertz dual-stack, DDD layering, Wire DI, and observability engineering conventions",
          },
          {
            title: "AI-Assisted Development System",
            desc: "Built AGENTS.md architecture spec, Custom Skills development workflow scripts, and AI-driven GitHub Actions workflows to improve end-to-end delivery efficiency",
          },
          {
            title: "Ecosystem Component Contributions",
            desc: "Fixed hertz-contrib/jwt RefreshToken window invalidation bug; improved observability component stability; resolved Go 1.25+ build compatibility issues",
          },
        ],
        metrics: [
          { value: "3", label: "Merged PRs" },
          { value: "330+", label: "AGENTS.md Lines" },
        ],
        extras: [
          "Open-source architecture template",
          "AI-assisted dev workflow",
          "Production-grade engineering specs",
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
        company: "Manteia Data Technology Co., Ltd. (Xiamen Free Trade Zone)",
        subtitle: "Core Business R&D & Backend Architecture Evolution",
        roles: [
          {
            role: "Go Backend Architect / Tech Lead",
            context:
              "Promoted to lead the next-generation microservices architecture upgrade and team engineering standards, based on outstanding performance in core business refactoring and engineering efficiency",
            points: [
              "Led backend service-oriented upgrade, delivering 8 RPC + 1 API Gateway microservices system supporting independent module evolution and deployment",
              "Unified IDL-First development workflow, layered architecture constraints and Wire dependency injection conventions, upgrading from \"individual-experience-driven\" to \"standard-system-driven\"",
              "Built OTel, Jaeger and trace/request_id propagation pipeline, enabling end-to-end troubleshooting from gateway to core RPC services",
              "Standardized 8-person R&D collaboration, accumulating structured technical assets to reduce cross-module coordination costs",
            ],
          },
          {
            role: "Python Backend Developer",
            points: [
              "Joined as a fresh graduate, grew into de facto system owner. Led Asyncio performance refactoring: rewrote core paths to async, improving query efficiency by 50% and data loading response by 35%",
              "Drove migration from Shell-based deployment to containerized engineering workflow, reducing deploy time from 4 hours to 30 minutes — an 87.5% efficiency gain",
              "Through pipeline governance and change risk convergence, reduced failure rate by 45% and improved system availability to 99.9%",
              "Achieved same-day rapid recovery in multiple core pipeline incidents, balancing swift mitigation with root-cause fixes",
            ],
          },
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
