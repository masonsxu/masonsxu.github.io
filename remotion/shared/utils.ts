import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { VIDEO } from "./theme";

/**
 * 通用平滑淡入工具
 * 避免跳帧：使用 clamp + ease 曲线，内容从 0 平滑过渡到 1
 */
export function useSmoothFadeIn(delayInFrames: number, durationInFrames = 20) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return interpolate(frame, [delayInFrames, delayInFrames + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
}

/**
 * 通用平滑淡出工具
 */
export function useSmoothFadeOut(startFrame: number, durationInFrames = 15) {
  const frame = useCurrentFrame();

  return interpolate(frame, [startFrame, startFrame + durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
}

/**
 * 平滑滑入（从下方）
 */
export function useSmoothSlideUp(delayInFrames: number, distance = 40, durationInFrames = 25) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delayInFrames,
    fps,
    config: { damping: 200 },
    durationInFrames,
  });

  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    translateY: interpolate(progress, [0, 1], [distance, 0]),
  };
}

/**
 * 平滑滑入（从左侧）
 */
export function useSmoothSlideLeft(delayInFrames: number, distance = 60, durationInFrames = 25) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delayInFrames,
    fps,
    config: { damping: 200 },
    durationInFrames,
  });

  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    translateX: interpolate(progress, [0, 1], [-distance, 0]),
  };
}

/**
 * 平滑缩放（从小到大）
 */
export function useSmoothScale(delayInFrames: number, from = 0.85, durationInFrames = 25) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delayInFrames,
    fps,
    config: { damping: 200 },
    durationInFrames,
  });

  return {
    opacity: interpolate(progress, [0, 1], [0, 1]),
    scale: interpolate(progress, [0, 1], [from, 1]),
  };
}

/**
 * 交错动画延迟计算器
 */
export function staggerDelay(index: number, baseDelay: number, stagger = 5) {
  return baseDelay + index * stagger;
}

/**
 * 秒转帧数
 */
export function sec(seconds: number): number {
  return Math.round(seconds * VIDEO.fps);
}

/**
 * 安全 clamp 插值（防跳帧核心工具）
 * 所有 interpolate 调用都应通过此函数确保边界 clamp
 */
export function safeInterpolate(
  frame: number,
  inputRange: number[],
  outputRange: number[],
  easing = Easing.out(Easing.quad),
) {
  return interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}
