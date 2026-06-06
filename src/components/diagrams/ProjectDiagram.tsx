import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type SVGProps,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useTranslation } from "../../i18n";

interface ProjectDiagramProps {
  variant: number;
}

/**
 * ProjectDiagram — IC-topology SVG used as the right column of each project
 * card. Nodes carrying an `info` prop become interactive (hover / focus /
 * click) and surface their detail in the caption strip below the board.
 *
 * Interaction state is shared via DiagramContext so individual nodes need not
 * be prop-drilled. The passive critical-path pulse uses SVG `<animate>` for
 * prefers-reduced-motion compatibility.
 */
export function ProjectDiagram({ variant }: ProjectDiagramProps) {
  const v = variant % 4;
  let board: ReactNode;
  if (v === 0) board = <Microservices />;
  else if (v === 1) board = <DataLake />;
  else if (v === 2) board = <Monolith />;
  else board = <ContribGraph />;
  return <DiagramFrame>{board}</DiagramFrame>;
}

/* ──── Interaction context + caption frame ──── */
interface DiagramCtx {
  activeId: string | null;
  activate: (id: string, info: string) => void;
  clear: () => void;
}

const DiagramContext = createContext<DiagramCtx>({
  activeId: null,
  activate: () => {},
  clear: () => {},
});

function useDiagram() {
  return useContext(DiagramContext);
}

function DiagramFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [active, setActive] = useState<{ id: string; info: string } | null>(null);
  const ctx = useMemo<DiagramCtx>(
    () => ({
      activeId: active?.id ?? null,
      activate: (id, info) => setActive({ id, info }),
      clear: () => setActive(null),
    }),
    [active],
  );

  return (
    <DiagramContext.Provider value={ctx}>
      <div className="relative z-10 w-full max-w-[520px]">
        {children}
        <div
          className="mt-2 min-h-[36px] rounded-md px-3 py-2 font-mono text-[11px] leading-snug"
          style={{
            boxShadow: "inset 0 0 0 1px rgba(0,153,255,0.14)",
            background: "rgba(0,153,255,0.03)",
          }}
        >
          {active ? (
            <span className="text-foreground/75">
              <span className="text-gold/90">{active.id}</span>
              <span className="text-foreground/30"> · </span>
              {active.info}
            </span>
          ) : (
            <span className="text-foreground/35">{t.diagrams.hint}</span>
          )}
        </div>
      </div>
    </DiagramContext.Provider>
  );
}

const COMMON_DEFS = (
  <defs>
    <marker
      id="diag-arr-blue"
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path d="M0,0 L10,5 L0,10 z" fill="#0099ff" opacity="0.7" />
    </marker>
    <marker
      id="diag-arr-gold"
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto"
    >
      <path d="M0,0 L10,5 L0,10 z" fill="#D4AF37" opacity="0.85" />
    </marker>
    <linearGradient id="diag-pulse" x1="0" x2="1">
      <stop offset="0" stopColor="#D4AF37" stopOpacity="0" />
      <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.85" />
      <stop offset="1" stopColor="#D4AF37" stopOpacity="0" />
    </linearGradient>
  </defs>
);

function ChipBox({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = "blue",
  info,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone?: "blue" | "gold";
  info?: string;
}) {
  const ctx = useDiagram();
  const detail = info ?? "";
  const interactive = detail !== "";
  const isActive = interactive && ctx.activeId === label;
  const stroke = tone === "gold" ? "#D4AF37" : "#0099ff";
  const baseOpacity = tone === "gold" ? 0.7 : 0.55;
  const fill = tone === "gold" ? "rgba(212, 175, 55, 0.05)" : "rgba(0, 153, 255, 0.04)";

  const toggle = () => (isActive ? ctx.clear() : ctx.activate(label, detail));

  const handlers: SVGProps<SVGGElement> = interactive
    ? {
        role: "button",
        tabIndex: 0,
        "aria-label": `${label}: ${detail}`,
        onMouseEnter: () => ctx.activate(label, detail),
        onMouseLeave: () => ctx.clear(),
        onFocus: () => ctx.activate(label, detail),
        onBlur: () => ctx.clear(),
        onClick: toggle,
        onKeyDown: (e: ReactKeyboardEvent<SVGGElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        },
        style: { cursor: "pointer", outline: "none" },
      }
    : { "aria-hidden": true };

  return (
    <g {...handlers}>
      {isActive && (
        <rect
          x={x - 3}
          y={y - 3}
          width={w + 6}
          height={h + 6}
          rx="8"
          fill="none"
          stroke="#D4AF37"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="6"
        fill={isActive ? "rgba(212, 175, 55, 0.09)" : fill}
        stroke={isActive ? "#D4AF37" : stroke}
        strokeOpacity={isActive ? 1 : baseOpacity}
        strokeWidth={isActive ? 1.5 : 1}
        style={{ transition: "stroke-opacity 0.2s ease, stroke-width 0.2s ease" }}
      />
      {sub && (
        <text
          x={x + w / 2}
          y={y + 16}
          fill={tone === "gold" ? "#D4AF37" : "#0099ff"}
          fontFamily="JetBrains Mono"
          fontSize="8.5"
          textAnchor="middle"
          letterSpacing="2"
          opacity="0.85"
          style={{ pointerEvents: "none" }}
        >
          {sub}
        </text>
      )}
      <text
        x={x + w / 2}
        y={y + h / 2 + (sub ? 6 : 4)}
        fill="#FCFCFC"
        fontFamily="Inter"
        fontSize="11"
        textAnchor="middle"
        fontWeight="500"
        style={{ pointerEvents: "none" }}
      >
        {label}
      </text>
    </g>
  );
}

function Microservices() {
  return (
    <svg viewBox="0 0 560 420" className="w-full h-auto" role="group" aria-label="Microservices topology">
      {COMMON_DEFS}
      {/* Critical-path pulse */}
      <path
        d="M 30 100 C 130 100, 220 140, 280 140 C 350 140, 430 220, 510 290"
        stroke="url(#diag-pulse)"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="6 6"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2.4s" repeatCount="indefinite" />
      </path>
      <text x="280" y="85" fill="#D4AF37" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" letterSpacing="2.5">
        TRACE_ID PROPAGATION
      </text>

      {/* Client */}
      <g>
        <circle cx="40" cy="200" r="22" fill="rgba(0,0,0,0.6)" stroke="#0099ff" strokeOpacity="0.55" />
        <text x="40" y="204" fill="#FCFCFC" fontFamily="Inter" fontSize="10" textAnchor="middle">Client</text>
      </g>
      <line x1="64" y1="200" x2="118" y2="200" stroke="#0099ff" strokeOpacity="0.55" markerEnd="url(#diag-arr-blue)" />

      {/* Gateway (gold critical) */}
      <ChipBox x={120} y={160} w={140} h={80} label="Hertz HTTP" sub="API GATEWAY" tone="gold" info="API 网关 · JWT 三位置查找 + Casbin RBAC · trace 入口" />
      <text x="190" y="224" fill="#A1A1AA" fontFamily="Inter" fontSize="9" textAnchor="middle">JWT · Casbin RBAC</text>

      {/* Etcd registry */}
      <ChipBox x={380} y={70} w={140} h={56} label="etcd" sub="SERVICE REGISTRY" info="服务注册发现 · 通告地址解决容器网络映射" />
      <path d="M 220 160 C 240 110, 350 95, 380 92" stroke="#0099ff" strokeOpacity="0.4" fill="none" strokeDasharray="3 3" markerEnd="url(#diag-arr-blue)" />

      {/* RPC services row */}
      {[
        { x: 110, name: "user-svc", info: "Kitex RPC · 身份与权限" },
        { x: 215, name: "form-svc", info: "Kitex RPC · 自定义表单引擎" },
        { x: 320, name: "etl-svc", info: "Kitex RPC · 数据入湖流水线" },
        { x: 425, name: "menu-svc", info: "Kitex RPC · 菜单与 RBAC 治理" },
      ].map((s) => (
        <g key={s.name}>
          <line
            x1="190"
            y1="240"
            x2={s.x + 45}
            y2="310"
            stroke="#0099ff"
            strokeOpacity="0.42"
            markerEnd="url(#diag-arr-blue)"
          />
          <ChipBox x={s.x} y={310} w={90} h={58} label={s.name} sub="KITEX RPC" info={s.info} />
        </g>
      ))}

      {/* Footer silk */}
      <g fontFamily="JetBrains Mono" fontSize="8.5" fill="#A1A1AA" opacity="0.7">
        <text x="30" y="404">▪ OpenTelemetry</text>
        <text x="170" y="404">▪ Jaeger</text>
        <text x="240" y="404">▪ Wire DI</text>
        <text x="310" y="404">▪ Thrift IDL</text>
        <text x="395" y="404">▪ DDD 4-Layer</text>
      </g>
    </svg>
  );
}

function DataLake() {
  return (
    <svg viewBox="0 0 560 420" className="w-full h-auto" role="group" aria-label="Data lake topology">
      {COMMON_DEFS}

      {/* Sources */}
      <ChipBox x={20} y={80} w={120} h={50} label="MySQL" sub="SOURCE 01" info="SSDictCursor 流式游标增量入湖" />
      <ChipBox x={20} y={180} w={120} h={50} label="MongoDB" sub="SOURCE 02" info="raw_document JSON → 三列 schema" />
      <ChipBox x={20} y={280} w={120} h={50} label="REST API" sub="SOURCE 03" info="多源业务 API 统一抽取" />

      {/* Airflow orchestrator */}
      <ChipBox x={210} y={170} w={140} h={70} label="Airflow 3.1" sub="DAG ORCHESTRATOR" tone="gold" info="DAG 编排 · PyIceberg 直写 · BFS 最优 JOIN 路径" />
      <text x="280" y="222" fill="#A1A1AA" fontFamily="Inter" fontSize="9" textAnchor="middle">PyIceberg · BFS Join</text>

      {/* Lines into Airflow */}
      {[105, 205, 305].map((y) => (
        <line key={y} x1="140" y1={y} x2="208" y2="200" stroke="#0099ff" strokeOpacity="0.4" markerEnd="url(#diag-arr-blue)" />
      ))}

      {/* Iceberg lake */}
      <ChipBox x={400} y={120} w={140} h={70} label="Iceberg" sub="DATA LAKE" tone="gold" info="湖仓表格式 · Schema Evolution · Parquet" />
      <line x1="350" y1="190" x2="398" y2="155" stroke="#D4AF37" strokeOpacity="0.7" markerEnd="url(#diag-arr-gold)" strokeDasharray="4 3" />

      {/* Trino + Polars */}
      <ChipBox x={400} y={230} w={140} h={50} label="Trino" sub="QUERY ENGINE" info="分布式 SQL · 小表查询" />
      <line x1="470" y1="190" x2="470" y2="228" stroke="#0099ff" strokeOpacity="0.55" markerEnd="url(#diag-arr-blue)" />
      <ChipBox x={400} y={310} w={140} h={50} label="Polars" sub="IN-MEM JOIN" info="内存 5 表链式 LEFT JOIN" />
      <line x1="470" y1="280" x2="470" y2="308" stroke="#0099ff" strokeOpacity="0.55" markerEnd="url(#diag-arr-blue)" />

      {/* Pulse */}
      <path
        d="M 80 105 L 210 200 L 400 155"
        stroke="url(#diag-pulse)"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="6 6"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2.6s" repeatCount="indefinite" />
      </path>

      {/* Footer silk */}
      <g fontFamily="JetBrains Mono" fontSize="8.5" fill="#A1A1AA" opacity="0.7">
        <text x="20" y="394">▪ Schema Evolution</text>
        <text x="180" y="394">▪ Parquet</text>
        <text x="260" y="394">▪ FieldCommon0</text>
        <text x="400" y="394">▪ api_payload</text>
      </g>
    </svg>
  );
}

function Monolith() {
  return (
    <svg viewBox="0 0 560 420" className="w-full h-auto" role="group" aria-label="Monolith topology">
      {COMMON_DEFS}

      {/* Big monolith chip */}
      <rect x="120" y="60" width="320" height="300" rx="8" fill="rgba(212, 175, 55, 0.04)" stroke="#D4AF37" strokeOpacity="0.6" />
      <text x="280" y="86" fill="#D4AF37" fontFamily="JetBrains Mono" fontSize="9" textAnchor="middle" letterSpacing="2.5">
        FORM-ENGINE CORE
      </text>

      {/* Inner blocks */}
      <ChipBox x={140} y={100} w={130} h={56} label="Form Tree" sub="MONGO 4-LVL" info="MongoDB 文档嵌套树 · 4 层深度 · 30+ 组件类型" />
      <ChipBox x={290} y={100} w={130} h={56} label="Workflow" sub="JSON DAG" info="JSON 驱动节点拓扑 · NEXT / PREV / REJECT" />
      <ChipBox x={140} y={172} w={130} h={56} label="Cross-form" sub="3-REF MODEL" info="三元引用模型 · 跨表单实时数据联动" />
      <ChipBox x={290} y={172} w={130} h={56} label="Adapter" sub="25+ EXTERNAL" info="适配器模式对接 25+ 第三方系统" />
      <ChipBox x={140} y={244} w={130} h={56} label="Asyncio" sub="50% LATENCY" tone="gold" info="异步重构核心链路 · 查询效率 +50%" />
      <ChipBox x={290} y={244} w={130} h={56} label="Container" sub="87% DEPLOY" tone="gold" info="容器化交付 · 部署 4h → 30min（+87%）" />

      {/* IO ports left/right */}
      <ChipBox x={20} y={180} w={80} h={40} label="HTTP" />
      <line x1="100" y1="200" x2="118" y2="200" stroke="#0099ff" strokeOpacity="0.55" markerEnd="url(#diag-arr-blue)" />
      <ChipBox x={460} y={120} w={80} h={40} label="Redis" />
      <ChipBox x={460} y={180} w={80} h={40} label="MySQL" />
      <ChipBox x={460} y={240} w={80} h={40} label="Celery" />

      {/* Critical pulse */}
      <path
        d="M 100 200 L 270 130 L 410 260"
        stroke="url(#diag-pulse)"
        strokeWidth="1.4"
        fill="none"
        strokeDasharray="6 6"
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="2.4s" repeatCount="indefinite" />
      </path>

      <g fontFamily="JetBrains Mono" fontSize="8.5" fill="#A1A1AA" opacity="0.7">
        <text x="120" y="392">▪ 4,000+ commits</text>
        <text x="280" y="392">▪ 4-yr ownership</text>
        <text x="430" y="392">▪ 50% latency↓</text>
      </g>
    </svg>
  );
}

function ContribGraph() {
  // 12 col x 6 row contribution mini-grid + 3 PR markers
  const cells: { x: number; y: number; intensity: number }[] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 14; c++) {
      const seed = (r * 31 + c * 17) % 11;
      cells.push({ x: 30 + c * 22, y: 110 + r * 22, intensity: seed / 10 });
    }
  }
  return (
    <svg viewBox="0 0 560 420" className="w-full h-auto" role="group" aria-label="Contribution graph">
      {COMMON_DEFS}

      <text x="30" y="80" fill="#D4AF37" fontFamily="JetBrains Mono" fontSize="9" letterSpacing="2.5">
        CONTRIBUTION HEATMAP · 14W
      </text>

      {cells.map((c, i) => {
        const alpha = 0.08 + c.intensity * 0.7;
        const isHot = c.intensity > 0.7;
        return (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width="16"
            height="16"
            rx="2"
            fill={isHot ? `rgba(212, 175, 55, ${alpha})` : `rgba(0, 153, 255, ${alpha})`}
          />
        );
      })}

      {/* PR markers */}
      <ChipBox x={30} y={270} w={155} h={50} label="hertz/jwt #27" sub="MERGED" tone="gold" info="修复 RefreshToken orig_iat 重置导致 MaxRefresh 窗口失效" />
      <ChipBox x={205} y={270} w={155} h={50} label="obs-otel #67" sub="MERGED" tone="gold" info="优化可观测性组件 · 提升链路追踪稳定性" />
      <ChipBox x={380} y={270} w={155} h={50} label="abcoder #84" sub="MERGED" tone="gold" info="修复 Go 1.25+ sonic 依赖编译兼容性" />

      {/* Connect heatmap → PRs */}
      {[107, 281, 455].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1="252"
          x2={x}
          y2="268"
          stroke="#D4AF37"
          strokeOpacity="0.55"
          markerEnd="url(#diag-arr-gold)"
        />
      ))}

      <g fontFamily="JetBrains Mono" fontSize="8.5" fill="#A1A1AA" opacity="0.7">
        <text x="30" y="392">▪ AGENTS.md 330+</text>
        <text x="200" y="392">▪ 8 Custom Skills</text>
        <text x="370" y="392">▪ 3 GH Actions</text>
      </g>
    </svg>
  );
}
