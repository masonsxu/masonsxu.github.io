import { ChevronDown, Download } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fitHeadlineFontSize,
  layoutAllLines,
  layoutNextLine,
  prepareWithSegments,
} from "../pretext/layout-utils";
import {
  carveTextLineSlots,
  circleIntervalForBand,
  type Interval,
} from "../pretext/obstacle-geometry";

const HEADLINE_TEXT = "徐俊飞 Masons Xu";
const HEADLINE_FONT_FAMILY = "'Playfair Display', serif";
const BODY_TEXT = "Go 后端工程师 · 分布式系统 · 云原生基础设施";
const BODY_FONT = "700 clamp(1.25rem, 3vw, 2.25rem) 'Playfair Display', serif";
const BODY_LINE_HEIGHT = 42;
const DESCRIPTION_TEXT =
  "我是专注 Go 后端开发的工程师，长期聚焦分布式系统架构、云原生基础设施与数据湖平台。主导 Python 单体到 CloudWeGo 微服务架构的整体转型，独立设计并交付 10+ 微服务的分布式数据平台。";
const DESCRIPTION_FONT =
  "400 clamp(0.9375rem, 1.5vw, 1.125rem) 'Inter', system-ui, sans-serif";
const DESCRIPTION_LINE_HEIGHT = 28;
const GUTTER = 24;
const NARROW_BREAKPOINT = 760;

type Orb = {
  cx: number;
  cy: number;
  r: number;
  vx: number;
  vy: number;
  isDragging: boolean;
};

type PositionedLine = {
  x: number;
  y: number;
  text: string;
  width: number;
  className: string;
};

type LayoutObstacle = {
  cx: number;
  cy: number;
  r: number;
  hPad: number;
  vPad: number;
};

export default function HeroEditorial() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<PositionedLine[]>([]);
  const [stageHeight, setStageHeight] = useState(480);
  const [orbPositions, setOrbPositions] = useState<Orb[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const dragRef = useRef<{
    orbIndex: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const computeLayout = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const stageWidth = stage.clientWidth;
    const isNarrow = stageWidth < NARROW_BREAKPOINT;

    const headlineRegion = {
      x: GUTTER,
      y: isNarrow ? 20 : 32,
      width: stageWidth - GUTTER * 2,
      height: isNarrow ? 80 : 110,
    };

    const headlineFit = fitHeadlineFontSize(
      HEADLINE_TEXT,
      HEADLINE_FONT_FAMILY,
      headlineRegion.width,
      headlineRegion.height,
      isNarrow ? 28 : 36,
      isNarrow ? 56 : 84,
    );

    const headlinePrepared = prepareWithSegments(
      HEADLINE_TEXT,
      headlineFit.font,
    );
    const headlineLines = layoutAllLines(
      headlinePrepared,
      headlineRegion.width,
      headlineFit.lineHeight,
      headlineRegion.x,
      headlineRegion.y,
    );

    const bodyTop =
      headlineRegion.y + headlineRegion.height + (isNarrow ? 16 : 24);
    const bodyPrepared = prepareWithSegments(BODY_TEXT, BODY_FONT);
    const bodyLines = layoutAllLines(
      bodyPrepared,
      headlineRegion.width,
      BODY_LINE_HEIGHT,
      headlineRegion.x,
      bodyTop,
    );

    const descTop =
      bodyTop + bodyLines.length * BODY_LINE_HEIGHT + (isNarrow ? 12 : 16);
    const descMaxHeight = Math.max(120, 480 - descTop);
    const descPrepared = prepareWithSegments(
      DESCRIPTION_TEXT,
      DESCRIPTION_FONT,
    );

    const orbCount = isNarrow ? 2 : 4;
    if (orbsRef.current.length !== orbCount) {
      orbsRef.current = Array.from({ length: orbCount }, (_, i) => ({
        cx: stageWidth * (0.2 + 0.6 * ((i * 0.618) % 1)),
        cy: descTop + descMaxHeight * (0.15 + 0.7 * ((i * 0.382) % 1)),
        r: isNarrow ? 40 + i * 10 : 55 + i * 15,
        vx: (12 + i * 4) * (i % 2 === 0 ? 1 : -1),
        vy: (8 + i * 3) * (i % 3 === 0 ? 1 : -1),
        isDragging: false,
      }));
    }

    setOrbPositions([...orbsRef.current]);

    const allPositionedLines: PositionedLine[] = [
      ...headlineLines.map((l) => ({ ...l, className: "hero-headline-line" })),
      ...bodyLines.map((l) => ({ ...l, className: "hero-body-line" })),
    ];

    const layoutObstacles: LayoutObstacle[] = orbsRef.current.map((orb) => ({
      cx: orb.cx,
      cy: orb.cy,
      r: orb.r,
      hPad: isNarrow ? 8 : 12,
      vPad: isNarrow ? 2 : 3,
    }));

    const descLines = layoutTextWithObstacles(
      descPrepared,
      {
        x: GUTTER,
        y: descTop,
        width: stageWidth - GUTTER * 2,
        height: descMaxHeight,
      },
      DESCRIPTION_LINE_HEIGHT,
      layoutObstacles,
    );

    allPositionedLines.push(
      ...descLines.map((l) => ({ ...l, className: "hero-desc-line" })),
    );

    setLines(allPositionedLines);
    setStageHeight(Math.max(480, descTop + descMaxHeight));
  }, []);

  useEffect(() => {
    computeLayout();

    const handleResize = () => {
      computeLayout();
    };

    window.addEventListener("resize", handleResize);
    document.fonts.ready.then(computeLayout);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [computeLayout]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const findOrbAtPoint = (clientX: number, clientY: number) => {
      const rect = stage.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = orbsRef.current.length - 1; i >= 0; i--) {
        const orb = orbsRef.current[i]!;
        const dx = x - orb.cx;
        const dy = y - orb.cy;
        if (dx * dx + dy * dy <= (orb.r + 16) * (orb.r + 16)) return i;
      }
      return -1;
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const orbIndex = findOrbAtPoint(clientX, clientY);
      if (orbIndex < 0) return;

      const orb = orbsRef.current[orbIndex]!;
      const rect = stage.getBoundingClientRect();
      dragRef.current = {
        orbIndex,
        offsetX: clientX - rect.left - orb.cx,
        offsetY: clientY - rect.top - orb.cy,
      };
      orb.isDragging = true;
      orb.vx = 0;
      orb.vy = 0;
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = stage.getBoundingClientRect();
      const orb = orbsRef.current[dragRef.current.orbIndex]!;
      orb.cx = clientX - rect.left - dragRef.current.offsetX;
      orb.cy = clientY - rect.top - dragRef.current.offsetY;
    };

    const handlePointerUp = () => {
      if (!dragRef.current) return;
      const orb = orbsRef.current[dragRef.current.orbIndex];
      if (orb) orb.isDragging = false;
      dragRef.current = null;
    };

    stage.addEventListener("mousedown", handlePointerDown);
    stage.addEventListener("touchstart", handlePointerDown, { passive: true });
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      stage.removeEventListener("mousedown", handlePointerDown);
      stage.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [computeLayout]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    lastTimeRef.current = 0;

    const animate = (now: number) => {
      const dt = lastTimeRef.current
        ? Math.min((now - lastTimeRef.current) / 1000, 0.05)
        : 0.016;
      lastTimeRef.current = now;

      const stageWidth = stage.clientWidth;
      const currentStageHeight = stage.clientHeight;
      const orbs = orbsRef.current;

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i]!;
        if (orb.isDragging) continue;

        orb.cx += orb.vx * dt;
        orb.cy += orb.vy * dt;

        if (orb.cx - orb.r < 0) {
          orb.cx = orb.r;
          orb.vx = Math.abs(orb.vx);
        }
        if (orb.cx + orb.r > stageWidth) {
          orb.cx = stageWidth - orb.r;
          orb.vx = -Math.abs(orb.vx);
        }
        if (orb.cy - orb.r < 0) {
          orb.cy = orb.r;
          orb.vy = Math.abs(orb.vy);
        }
        if (orb.cy + orb.r > currentStageHeight) {
          orb.cy = currentStageHeight - orb.r;
          orb.vy = -Math.abs(orb.vy);
        }
      }

      setOrbPositions([...orbs]);
      computeLayout();
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [computeLayout]);

  return (
    <section
      id="hero"
      className="mb-24 lg:mb-28 relative"
      aria-labelledby="hero-title"
    >
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-gold/4 rounded-full blur-[72px] pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border/20 text-[11px] font-medium text-primary mb-7">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          正在求职 / Actively Seeking
        </div>

        <div
          ref={stageRef}
          id="hero-editorial-stage"
          className="relative"
          style={{ height: `${stageHeight}px` }}
        >
          {lines.map((line, i) => (
            <span
              key={i}
              className={`absolute whitespace-pre ${line.className}`}
              style={{
                left: `${line.x}px`,
                top: `${line.y}px`,
              }}
            >
              {line.text}
            </span>
          ))}

          {orbPositions.map((orb, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${orb.cx - orb.r}px`,
                top: `${orb.cy - orb.r}px`,
                width: `${orb.r * 2}px`,
                height: `${orb.r * 2}px`,
                cursor: "grab",
                background: orb.isDragging
                  ? `radial-gradient(circle at 35% 35%, rgba(212, 175, 55, 0.32), rgba(212, 175, 55, 0.12) 55%, transparent 72%)`
                  : `radial-gradient(circle at 35% 35%, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.06) 55%, transparent 72%)`,
                boxShadow: orb.isDragging
                  ? `0 0 60px 16px rgba(212, 175, 55, 0.16), 0 0 120px 32px rgba(212, 175, 55, 0.08)`
                  : `0 0 40px 10px rgba(212, 175, 55, 0.08), 0 0 80px 20px rgba(212, 175, 55, 0.04)`,
                transition: orb.isDragging
                  ? "box-shadow 0.2s ease, background 0.2s ease"
                  : "box-shadow 0.4s ease, background 0.4s ease",
              }}
            />
          ))}
        </div>

        <h1 id="hero-title" className="sr-only">
          {HEADLINE_TEXT}
        </h1>

        <div className="flex flex-wrap gap-3 lg:gap-4 mt-6">
          <a
            href="#projects"
            className="group px-7 py-3.5 bg-pearl text-obsidian font-bold uppercase tracking-[0.18em] text-[11px] rounded hover:bg-pearl/90 transition-all flex items-center gap-2 shimmer-effect"
          >
            查看架构实践 / View Projects
            <ChevronDown
              size={16}
              className="transition-transform group-hover:translate-y-1"
            />
          </a>
          <a
            href="mailto:masonsxu@foxmail.com"
            className="px-7 py-3.5 bg-surface border border-border/20 text-primary font-bold uppercase tracking-[0.18em] text-[11px] rounded hover:border-primary/50 transition-colors"
          >
            联系我 / Contact Me
          </a>
          <a
            href="resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3.5 border border-border/20 text-muted font-bold uppercase tracking-[0.18em] text-[11px] rounded hover:text-text hover:border-text/30 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            下载简历 / Resume
          </a>
        </div>
      </div>
    </section>
  );
}

function layoutTextWithObstacles(
  prepared: ReturnType<typeof prepareWithSegments>,
  region: { x: number; y: number; width: number; height: number },
  lineHeight: number,
  obstacles: LayoutObstacle[],
): Array<{ x: number; y: number; text: string; width: number }> {
  const lines: Array<{ x: number; y: number; text: string; width: number }> =
    [];
  let cursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineTop = region.y;

  while (true) {
    if (lineTop + lineHeight > region.y + region.height) break;

    const bandTop = lineTop;
    const bandBottom = lineTop + lineHeight;
    const blocked: Interval[] = [];

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i]!;
      const interval = circleIntervalForBand(
        obs.cx,
        obs.cy,
        obs.r,
        bandTop,
        bandBottom,
        obs.hPad,
        obs.vPad,
      );
      if (interval) blocked.push(interval);
    }

    const slots = carveTextLineSlots(
      { left: region.x, right: region.x + region.width },
      blocked,
    );

    if (slots.length === 0) {
      lineTop += lineHeight;
      continue;
    }

    let bestSlot = slots[0]!;
    for (let i = 1; i < slots.length; i++) {
      const slot = slots[i]!;
      if (slot.right - slot.left > bestSlot.right - bestSlot.left) {
        bestSlot = slot;
      }
    }

    const slotWidth = bestSlot.right - bestSlot.left;
    const line = layoutNextLine(prepared, cursor, slotWidth);
    if (!line) break;

    lines.push({
      text: line.text,
      width: line.width,
      x: Math.round(bestSlot.left),
      y: Math.round(lineTop),
    });

    cursor = line.end;
    lineTop += lineHeight;
  }

  return lines;
}
