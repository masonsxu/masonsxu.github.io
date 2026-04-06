/**
 * Midnight Pearl 主题常量 - Remotion 视频专用
 * 延续网站 Obsidian/Gold/Pearl 设计语言
 */

export const THEME = {
  // 核心色
  obsidian: "#0C0C0E",
  pearl: "#FCFCFC",
  gold: "#D4AF37",
  goldLight: "#F8E7B9",
  goldDeep: "#7A5810",

  // 表面色
  surface: "#1E1E21",
  surfaceElevated: "#161618",
  card: "#111113",

  // 语义色
  muted: "#A1A1AA",
  border: "rgba(212, 175, 55, 0.08)",
  borderHover: "rgba(212, 175, 55, 0.25)",

  // 渐变
  goldGradient: "linear-gradient(135deg, #F8E7B9 0%, #D4AF37 50%, #7A5810 100%)",
  goldDivider: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent)",

  // 数据湖专属色
  lake: {
    primary: "#4FC3F7",     // 数据流 - 浅蓝
    secondary: "#81C784",   // 成功/完成 - 浅绿
    accent: "#FFB74D",      // 提示/警告 - 琥珀
    mysql: "#00758F",       // MySQL 数据源
    mongodb: "#4DB33D",     // MongoDB 数据源
    api: "#6B7280",         // REST API 数据源
    iceberg: "#3B82F6",     // Iceberg 存储
    airflow: "#017CEE",     // Airflow 编排
    trino: "#DD00A1",       // Trino 查询
    polars: "#CD7F32",      // Polars 计算
    parquet: "#50C878",     // Parquet 文件
  },

  // 字体
  fontSans: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, monospace",
} as const;

// 视频尺寸
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
} as const;
