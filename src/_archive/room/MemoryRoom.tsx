/**
 * ============================================================================
 *  MemoryRoom.tsx —— 「我记忆的旧房间」React UI 层
 * ============================================================================
 *
 *  负责：
 *   - 引导进入 / 暂停覆盖
 *   - HUD：碎片计数、准星、提示、静音
 *   - 聚焦卡片（展品详情、相框、窗户愿景）
 *   - ★收集系统：记忆碎片浮层
 *   - ★结局触发：结束语
 *   - 移动端双虚拟摇杆
 *
 *  所有内容文字从 src/data/room-content.ts 读取。
 *  3D 引擎通过 loadThree() 异步加载后初始化。
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { loadThree } from "./loadThree";
import {
  type RoomCallbacks,
  type RoomController,
  createMemoryRoom,
} from "./roomEngine";
import {
  exhibits,
  memoryShards,
  paintings as paintingData,
  contact,
  guide,
  ending,
  type WindowVision,
  type PaintingCard,
  type MemoryShard,
} from "../../data/room-content";

/* ============================================================================
 *  样式常量（内联，无外部 CSS 依赖）
 * ============================================================================ */

/** 毛玻璃卡片 */
const GLASS: React.CSSProperties = {
  background: "rgba(255,248,235,0.84)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(210,185,150,0.35)",
  borderRadius: 16,
  color: "#3a2e22",
  fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
};

const SOFT_SHADOW: React.CSSProperties = {
  boxShadow: "0 8px 32px rgba(60,40,20,0.18), 0 2px 8px rgba(60,40,20,0.10)",
};

/* ============================================================================
 *  MemoryRoom 主组件
 * ============================================================================ */
export default function MemoryRoom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<RoomController | null>(null);
  const isMobile = useRef(
    "ontouchstart" in window || navigator.maxTouchPoints > 0,
  );

  // ---------- 游戏状态 ----------
  const [phase, setPhase] = useState<
    "intro" | "playing" | "ending" | "ended"
  >("intro");
  const [locked, setLocked] = useState(false); // 桌面端指针锁定
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  // ★收集系统
  const [shardCount, setShardCount] = useState(0);
  const [shardTotal] = useState(memoryShards.length);
  const [shardPopup, setShardPopup] = useState<MemoryShard | null>(null);

  // ★物件交互
  const [focusTarget, setFocusTarget] = useState<{
    kind: string;
    id: string;
  } | null>(null);
  const [hoverHint, setHoverHint] = useState<string | null>(null);

  // 窗户愿景索引
  const [visionIdx, setVisionIdx] = useState(0);

  // 引导
  const [showGuide, setShowGuide] = useState(false);

  /* ---------- 初始化 Three.js + 引擎 ---------- */
  const initRoom = useCallback(async () => {
    try {
      const THREE = await loadThree();
      if (!containerRef.current) return;
      const isMob = isMobile.current;

      const callbacks: RoomCallbacks = {
        onReady: () => setLoading(false),
        onPointerLockChange: (l) => setLocked(l),
        onShardCollected: (shardId, collected, total) => {
          setShardCount(collected);
          const s = memoryShards.find((m) => m.id === shardId);
          if (s) {
            setShardPopup(s);
            setTimeout(() => setShardPopup(null), 6000);
          }
        },
        onFocusChange: (f) => {
          setFocusTarget(f);
          if (f) setShowGuide(false);
        },
        onHoverChange: (h) =>
          setHoverHint(h ? `${h.label}` : null),
        onVisionChange: (i) => setVisionIdx(i),
        onEndingReady: () => {
          setPhase("ending");
        },
        onEndingReached: () => {
          setPhase("ended");
        },
      };

      ctrlRef.current = createMemoryRoom({
        container: containerRef.current,
        THREE,
        isMobile: isMob,
        callbacks,
      });
    } catch (err: any) {
      console.error("Failed to load Three.js:", err);
      setLoadingError(err?.message || "Failed to load 3D engine");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (phase === "intro") return; // intro 阶段不初始化引擎
    initRoom();
    return () => {
      ctrlRef.current?.dispose();
      ctrlRef.current = null;
    };
  }, [phase, initRoom]);

  /* ---------- 开始 / 交互 ---------- */
  const handleEnter = () => {
    setPhase("playing");
    setShowGuide(true);
  };

  const handleCanvasClick = () => {
    const ctrl = ctrlRef.current;
    if (!ctrl) return;
    if (isMobile.current) return; // 移动端用 tapAt + 专用按钮
    // 桌面：如果没锁定则请求锁定
    ctrl.requestLock();
  };

  const handleMobileTap = useCallback(
    (e: React.TouchEvent) => {
      if (!ctrlRef.current || focusTarget) return;
      const t = e.changedTouches[0];
      ctrlRef.current.tapAt(t.clientX, t.clientY);
    },
    [focusTarget],
  );

  const handleInteractBtn = () => {
    ctrlRef.current?.interactHovered();
  };

  const handleExitFocus = () => {
    ctrlRef.current?.exitFocus();
  };

  const handleMute = () => {
    const next = !muted;
    setMuted(next);
    ctrlRef.current?.setMuted(next);
  };

  // 引导 5 秒后自动消失
  useEffect(() => {
    if (!showGuide) return;
    const t = setTimeout(() => setShowGuide(false), 8000);
    return () => clearTimeout(t);
  }, [showGuide]);

  /* ---------- 获取当前卡片内容 ---------- */
  const getFocusContent = useCallback(() => {
    if (!focusTarget) return null;
    const { kind, id } = focusTarget;

    if (kind === "exhibit") {
      if (id === "computer") {
        const ex = exhibits.computer;
        return {
          title: ex.title,
          subtitle: ex.subtitle,
          icon: ex.icon,
          body: (
            <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 8 }}>
              {ex.projects.map((p) => (
                <ProjectCard key={p.num} p={p} />
              ))}
            </div>
          ),
        };
      }
      if (id === "book") {
        const ex = exhibits.book;
        return {
          title: ex.title,
          subtitle: ex.subtitle,
          icon: ex.icon,
          body: (
            <div style={{ lineHeight: 1.75 }}>
              <p
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  fontStyle: "italic",
                  color: "#6b4a2a",
                  marginBottom: 12,
                }}
              >
                "{ex.epigraph}"
              </p>
              {ex.paragraphs.map((para, i) => (
                <p key={i} style={{ margin: "8px 0", fontSize: 14 }}>
                  {para}
                </p>
              ))}
              {ex.quotes.map((q, i) => (
                <blockquote
                  key={i}
                  style={{
                    borderLeft: "3px solid #c9a96e",
                    margin: "16px 0",
                    padding: "8px 16px",
                    color: "#7a6244",
                    fontStyle: "italic",
                  }}
                >
                  "{q.text}"<br />
                  <span style={{ fontSize: 12 }}>- {q.from}</span>
                </blockquote>
              ))}
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  关于我
                </h4>
                {ex.about.map((a, i) => (
                  <p
                    key={i}
                    style={{
                      fontSize: 13,
                      margin: "4px 0",
                      paddingLeft: 12,
                      borderLeft: "2px solid #e0d0b8",
                    }}
                  >
                    {a}
                  </p>
                ))}
              </div>
            </div>
          ),
        };
      }
      if (id === "backpack") {
        const ex = exhibits.backpack;
        return {
          title: ex.title,
          subtitle: ex.subtitle,
          icon: ex.icon,
          body: (
            <div>
              <p style={{ fontSize: 13, color: "#7a6a5a", marginBottom: 4 }}>
                {ex.company}
              </p>
              <p style={{ fontSize: 12, color: "#9a8a7a", marginBottom: 16 }}>
                {ex.positioning} · {ex.roles.map((r) => r.time).join(" → ")}
              </p>
              {ex.roles.map((role, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                    {role.title}
                  </h4>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9a8a7a",
                      marginBottom: 8,
                    }}
                  >
                    {role.time}
                  </p>
                  {role.note && (
                    <p
                      style={{
                        fontSize: 12,
                        fontStyle: "italic",
                        color: "#8a7a6a",
                        marginBottom: 8,
                        padding: "6px 10px",
                        background: "rgba(200,180,150,0.15)",
                        borderRadius: 8,
                      }}
                    >
                      {role.note}
                    </p>
                  )}
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {role.points.map((pt, j) => (
                      <li
                        key={j}
                        style={{ fontSize: 13, margin: "4px 0", lineHeight: 1.6 }}
                      >
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 12,
                }}
              >
                {ex.keywords.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: "rgba(180,160,130,0.2)",
                      color: "#6a5a4a",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ),
        };
      }
      if (id === "window") {
        const visions = exhibits.window.visions;
        const v = visions[visionIdx];
        return {
          title: v.title,
          subtitle: exhibits.window.hint,
          icon: exhibits.window.icon,
          body: (
            <div style={{ textAlign: "center", lineHeight: 1.8 }}>
              <p style={{ fontSize: 15, margin: "12px 0" }}>{v.caption}</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                {visions.map((vis, i) => (
                  <div
                    key={vis.id}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: `linear-gradient(180deg, ${vis.sky[0]}, ${vis.sky[2]})`,
                      border:
                        i === visionIdx
                          ? "2px solid #c9a96e"
                          : "2px solid transparent",
                      opacity: i === visionIdx ? 1 : 0.5,
                      cursor: "pointer",
                    }}
                    title={vis.title}
                  />
                ))}
              </div>
            </div>
          ),
        };
      }
    }

    if (kind === "painting") {
      const p = paintingData.find((x) => x.id === id);
      if (!p) return null;
      return {
        title: p.title,
        subtitle: "",
        icon: "🖼️",
        body: (
          <div>
            {p.lines.map((l, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 3,
                    color: "#5a4a3a",
                  }}
                >
                  {l.heading}
                </h4>
                <p style={{ fontSize: 13, color: "#7a6a5a", margin: 0 }}>
                  {l.body}
                </p>
              </div>
            ))}
          </div>
        ),
      };
    }

    return null;
  }, [focusTarget, visionIdx]);

  /* ========================================================================
   *  渲染
   * ======================================================================== */

  // ---------- 加载失败降级 ----------
  if (loadingError) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5ead6",
          fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
          color: "#5a4a3a",
          flexDirection: "column",
          gap: 12,
          padding: 32,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 20, fontWeight: 600 }}>3D 引擎加载失败</p>
        <p style={{ fontSize: 14, color: "#8a7a6a" }}>{loadingError}</p>
        <p style={{ fontSize: 13, color: "#9a8a7a" }}>
          请检查网络连接，或尝试刷新页面
        </p>
      </div>
    );
  }

  // ---------- 引导进入 ----------
  if (phase === "intro") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 50% 35%, #f6d78e66 0%, #e8c49a55 30%, #d4a06866 70%, #b8885444 100%), linear-gradient(180deg, #f5ead6 0%, #ead5b5 100%)",
          fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
          color: "#3a2e22",
          flexDirection: "column",
          textAlign: "center",
          padding: 24,
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={handleEnter}
      >
        {/* 模拟窗户光斑 */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "35%",
            width: "30%",
            height: "50%",
            background: "radial-gradient(ellipse at 50% 50%, rgba(255,230,170,0.35) 0%, rgba(255,220,150,0.1) 40%, transparent 70%)",
            pointerEvents: "none",
            animation: "introGlow 6s ease-in-out infinite alternate",
          }}
        />
        {/* 尘埃粒子动画层 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='0.5' fill='rgba(180,150,100,0.15)'/%3E%3C/svg%3E\") repeat",
            opacity: 0.4,
            pointerEvents: "none",
            animation: "dustDrift 30s linear infinite",
          }}
        />
        <div style={{ maxWidth: 440, position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginBottom: 8,
              textShadow: "0 2px 12px rgba(180,140,80,0.2)",
            }}
          >
            我记忆的旧房间
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#8a7a6a",
              marginBottom: 6,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
            }}
          >
            A Room of My Memories
          </p>
          <p style={{ fontSize: 15, color: "#7a6a5a", marginBottom: 36, lineHeight: 1.7 }}>
            {guide.enterSubtitle}
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "16px 42px",
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(180,145,90,0.22), rgba(200,165,100,0.18))",
              border: "1px solid rgba(180,145,90,0.35)",
              boxShadow: "0 4px 20px rgba(160,120,60,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
              fontSize: 16,
              fontWeight: 600,
              color: "#6b5030",
              transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(160,120,60,0.25), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(160,120,60,0.15), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
          >
            {guide.enterButton}
          </div>
          <p style={{ fontSize: 11, color: "#a09080", marginTop: 28, lineHeight: 1.6 }}>
            {isMobile.current ? guide.enterHintMobile : guide.enterHintDesktop}
          </p>
        </div>
        <style>{`
          @keyframes introGlow{0%{opacity:0.6;transform:scale(1)}100%{opacity:1;transform:scale(1.05)}}
          @keyframes dustDrift{from{background-position:0 0}to{background-position:100px 200px}}
        `}</style>
      </div>
    );
  }

  // ---------- 隐藏结局 ----------
  if (phase === "ended") {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 50% 30%, #fff8e788 0%, #f5ead6 50%, #e0c9a0 100%)",
          fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
          color: "#3a2e22",
          flexDirection: "column",
          textAlign: "center",
          padding: 32,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 光晕效果 */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "30%",
            width: "40%",
            height: "60%",
            background: "radial-gradient(ellipse, rgba(255,240,180,0.3) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 700,
              marginBottom: 16,
              letterSpacing: "-0.02em",
              textShadow: "0 2px 12px rgba(180,140,80,0.2)",
            }}
          >
            {ending.title}
          </h1>
          <p
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#6b5030",
              marginBottom: 20,
            }}
          >
            {ending.message}
          </p>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              maxWidth: 460,
              color: "#5a4a3a",
              marginBottom: 24,
            }}
          >
            {ending.body}
          </p>
          <p style={{ fontSize: 13, color: "#9a8a7a", marginBottom: 32 }}>
            {ending.signature}
          </p>
          <div
            style={{
              ...GLASS,
              ...SOFT_SHADOW,
              padding: "20px 28px",
              maxWidth: 380,
              width: "100%",
              textAlign: "left",
              margin: "0 auto",
            }}
          >
            <h4
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12,
                color: "#6b5030",
              }}
            >
              {contact.title}
            </h4>
            {contact.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  fontSize: 13,
                  color: "#5a7a9a",
                  textDecoration: "none",
                  margin: "6px 0",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#3a5a7a")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#5a7a9a")}
              >
                <strong>{l.label}:</strong> {l.value}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------- 游戏 HUD + 3D 画布 ----------
  const focusContent = getFocusContent();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#000",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* 3D 画布容器 */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
        onClick={handleCanvasClick}
        onTouchEnd={handleMobileTap}
      />

      {/* 加载遮罩 */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, #f5ead6 0%, #ead5b5 100%)",
            zIndex: 100,
            flexDirection: "column",
            gap: 20,
            fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
            color: "#6b5030",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: "3px solid rgba(180,145,90,0.25)",
              borderTopColor: "#b4915a",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <p style={{ fontSize: 15, fontWeight: 500 }}>正在布置房间…</p>
          <p style={{ fontSize: 11, color: "#9a8a7a" }}>推开那扇记忆的门</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* ---- HUD：只在漫游/过渡状态显示 ---- */}
      {!loading && !focusTarget && phase === "playing" && (
        <>
          {/* ★碎片计数 */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              ...GLASS,
              ...SOFT_SHADOW,
              padding: "6px 18px",
              fontSize: 14,
              fontWeight: 600,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>✨</span>
            <span>
              {shardCount} / {shardTotal}
            </span>
          </div>

          {/* 准星 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: "2px solid rgba(255,240,200,0.65)",
                boxShadow: "0 0 6px rgba(255,210,140,0.4)",
              }}
            />
          </div>

          {/* 悬停提示 */}
          {hoverHint && (
            <div
              style={{
                position: "absolute",
                top: "calc(50% + 28px)",
                left: "50%",
                transform: "translateX(-50%)",
                ...GLASS,
                padding: "4px 14px",
                fontSize: 13,
                zIndex: 10,
                pointerEvents: "none",
                whiteSpace: "nowrap",
              }}
            >
              {isMobile.current ? "点按" : "点击"}查看「{hoverHint}」
            </div>
          )}

          {/* 引导文字 */}
          {showGuide && (
            <div
              style={{
                position: "absolute",
                top: "calc(50% - 50px)",
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,240,200,0.7)",
                fontSize: 15,
                fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
                pointerEvents: "none",
                zIndex: 10,
                textAlign: "center",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                animation: "guideFade 8s ease forwards",
              }}
            >
              {guide.floatingHint}
              <style>{`@keyframes guideFade{0%,70%{opacity:1}100%{opacity:0}}`}</style>
            </div>
          )}

          {/* 桌面端：未锁定提示 */}
          {!isMobile.current && !locked && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(30,20,10,0.4)",
                zIndex: 20,
                cursor: "pointer",
                flexDirection: "column",
                gap: 8,
              }}
              onClick={() => ctrlRef.current?.requestLock()}
            >
              <p
                style={{
                  color: "rgba(255,240,200,0.85)",
                  fontSize: 16,
                  fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
                }}
              >
                点击任意位置继续漫游
              </p>
              <p
                style={{
                  color: "rgba(255,240,200,0.5)",
                  fontSize: 12,
                  fontFamily: "'Inter','Noto Sans SC',system-ui,sans-serif",
                }}
              >
                ESC 暂停 · 鼠标环视
              </p>
            </div>
          )}

          {/* 静音按钮 */}
          <button
            onClick={handleMute}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: "50%",
              ...GLASS,
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            title={muted ? "取消静音" : "静音"}
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* ★结局提示：门开了 */}
          {phase === "ending" && (
            <div
              style={{
                position: "absolute",
                bottom: 80,
                left: "50%",
                transform: "translateX(-50%)",
                ...GLASS,
                ...SOFT_SHADOW,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 600,
                zIndex: 10,
                animation: "endingPulse 2s ease infinite",
              }}
            >
              🚪 门，开了。走向那道光…
              <style>{`@keyframes endingPulse{0%,100%{opacity:0.85;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.03)}}`}</style>
            </div>
          )}

          {/* 移动端虚拟摇杆 */}
          {isMobile.current && <MobileJoysticks ctrl={ctrlRef} />}
        </>
      )}

      {/* ---- ★物件交互：聚焦卡片 ---- */}
      {focusTarget && focusContent && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 30,
            background: "rgba(20,15,8,0.35)",
          }}
          onClick={(e) => {
            // 点击卡片外区域退出
            if ((e.target as HTMLElement).dataset.overlay !== undefined) {
              handleExitFocus();
            }
          }}
        >
          {/* 半透明背景层（可点击退出） */}
          <div data-overlay style={{ position: "absolute", inset: 0 }} />
          {/* 卡片 */}
          <div
            style={{
              ...GLASS,
              ...SOFT_SHADOW,
              padding: "28px 32px",
              maxWidth: 520,
              width: "90%",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleExitFocus}
              style={{
                position: "absolute",
                top: 12,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#9a8a7a",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 22, marginRight: 8 }}>
                {focusContent.icon}
              </span>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  display: "inline",
                  color: "#4a3a2a",
                }}
              >
                {focusContent.title}
              </h2>
              {focusContent.subtitle && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#9a8a7a",
                    margin: "4px 0 0 32px",
                  }}
                >
                  {focusContent.subtitle}
                </p>
              )}
            </div>
            {focusContent.body}
          </div>
        </div>
      )}

      {/* ---- ★收集系统：碎片拾取浮层 ---- */}
      {shardPopup && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            ...GLASS,
            ...SOFT_SHADOW,
            padding: "24px 32px",
            maxWidth: 420,
            width: "85%",
            textAlign: "center",
            zIndex: 40,
            animation: "shardIn 0.5s ease-out",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 10,
              color: "#5a4a30",
            }}
          >
            {shardPopup.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.8,
              color: "#6a5a4a",
            }}
          >
            {shardPopup.story}
          </p>
          <style>{`@keyframes shardIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 *  子组件：项目卡片（电脑展品内的时间线条目）
 * ============================================================================ */
function ProjectCard({ p }: { p: any }) {
  return (
    <div
      style={{
        marginBottom: 20,
        padding: "14px 16px",
        borderRadius: 12,
        background: "rgba(200,180,150,0.1)",
        borderLeft: "3px solid #c9a96e",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 4,
        }}
      >
        <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#4a3a2a" }}>
          {p.num}. {p.title}
        </h4>
        <span style={{ fontSize: 11, color: "#9a8a7a" }}>{p.time}</span>
      </div>
      <p style={{ fontSize: 12, color: "#7a6a5a", margin: "0 0 4px" }}>
        {p.subtitle}
      </p>
      <p style={{ fontSize: 13, lineHeight: 1.6, margin: "6px 0" }}>
        {p.summary}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "8px 0" }}>
        {p.techs.map((t: string) => (
          <span
            key={t}
            style={{
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 4,
              background: "rgba(160,140,110,0.15)",
              color: "#6a5a4a",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
        {p.metrics.map((m: any) => (
          <div key={m.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#6b5030" }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: "#9a8a7a" }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 *  移动端双虚拟摇杆
 *  ★游戏逻辑 - 漫游控制（移动端）
 *  - 左摇杆：控制 W/S/A/D 移动
 *  - 右侧：任意位置触摸后拖动 = 环视
 *  - 「查看」按钮：对准物品后点击交互
 * ============================================================================ */
function MobileJoysticks({ ctrl }: { ctrl: React.RefObject<RoomController | null> }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const leftTouch = useRef<number | null>(null);
  const leftCenter = useRef({ x: 0, y: 0 });

  const rightTouch = useRef<number | null>(null);
  const rightStart = useRef({ x: 0, y: 0 });

  /* 左摇杆：touchstart 记录圆心，touchmove 算偏移 */
  const onLeftStart = (e: React.TouchEvent) => {
    if (leftTouch.current !== null) return;
    const t = e.changedTouches[0];
    leftTouch.current = t.identifier;
    const rect = leftRef.current!.getBoundingClientRect();
    leftCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  const onLeftMove = (e: React.TouchEvent) => {
    const tid = leftTouch.current;
    if (tid === null) return;
    const t = Array.from(e.changedTouches).find((x) => x.identifier === tid);
    if (!t) return;
    const dx = (t.clientX - leftCenter.current.x) / 45;
    const dy = -(t.clientY - leftCenter.current.y) / 45; // 上=y正
    const len = Math.hypot(dx, dy);
    const clamp = Math.min(len, 1);
    const nx = len > 0.001 ? (dx / len) * clamp : 0;
    const ny = len > 0.001 ? (dy / len) * clamp : 0;
    ctrl.current?.setMoveInput(nx, ny);
    // 移动摇杆视觉
    if (leftRef.current) {
      const knob = leftRef.current.querySelector('[data-knob]') as HTMLElement;
      if (knob) {
        knob.style.transform = `translate(${nx * 18}px, ${-ny * 18}px)`;
      }
    }
  };
  const onLeftEnd = () => {
    leftTouch.current = null;
    ctrl.current?.setMoveInput(0, 0);
    if (leftRef.current) {
      const knob = leftRef.current.querySelector('[data-knob]') as HTMLElement;
      if (knob) knob.style.transform = "translate(0,0)";
    }
  };

  /* 右侧：任意位置按下后拖动 = 环视 */
  const onRightStart = (e: React.TouchEvent) => {
    if (rightTouch.current !== null) return;
    const t = e.changedTouches[0];
    rightTouch.current = t.identifier;
    rightStart.current = { x: t.clientX, y: t.clientY };
  };
  const onRightMove = (e: React.TouchEvent) => {
    const tid = rightTouch.current;
    if (tid === null) return;
    const t = Array.from(e.changedTouches).find((x) => x.identifier === tid);
    if (!t) return;
    const dx = (t.clientX - rightStart.current.x) * 0.004;
    const dy = (t.clientY - rightStart.current.y) * 0.004;
    ctrl.current?.applyLook(dx, dy);
    rightStart.current = { x: t.clientX, y: t.clientY };
  };
  const onRightEnd = () => {
    rightTouch.current = null;
  };

  const joyBase: React.CSSProperties = {
    width: 110,
    height: 110,
    borderRadius: "50%",
    background: "rgba(255,248,235,0.18)",
    border: "2px solid rgba(255,240,200,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
  };
  const joyKnob: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(255,240,200,0.45)",
    border: "2px solid rgba(255,240,200,0.35)",
    transition: "transform 0.05s ease-out",
  };

  return (
    <>
      {/* 左摇杆：移动 */}
      <div
        ref={leftRef}
        style={{
          position: "absolute",
          bottom: 32,
          left: 28,
          ...joyBase,
          zIndex: 15,
        }}
        onTouchStart={onLeftStart}
        onTouchMove={onLeftMove}
        onTouchEnd={onLeftEnd}
      >
        <div data-knob style={joyKnob} />
      </div>

      {/* 右侧：环视区域（右半屏） */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: 0,
          width: "35%",
          height: "50%",
          zIndex: 14,
          touchAction: "none",
        }}
        onTouchStart={onRightStart}
        onTouchMove={onRightMove}
        onTouchEnd={onRightEnd}
      />

      {/* 查看按钮 */}
      <button
        onClick={() => ctrl.current?.interactHovered()}
        style={{
          position: "absolute",
          bottom: 52,
          right: 28,
          ...GLASS,
          border: "none",
          padding: "12px 22px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          color: "#5a4a30",
          cursor: "pointer",
          zIndex: 15,
        }}
      >
        👁 查看
      </button>
    </>
  );
}
