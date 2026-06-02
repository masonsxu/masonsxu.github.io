/**
 * loadThree.ts —— 从 CDN 动态加载 Three.js（ESM 模块构建）
 *
 * 需求约束：「Three.js 库从 CDN 引入，不打包进产物」。
 * 实现方式：用带有 vite-ignore 注释的动态 import 拉取完整 URL，
 * Vite 在构建/开发期都会把它当作外部 URL 原样保留，浏览器在运行时直接
 * 从 CDN 拉取这一个自包含的 three.module.js（核心库，无内部依赖）。
 * 这样既满足「CDN 引入」，又无需在本地安装 three，dev / build 都可用。
 *
 * 注：本地未安装 three 的类型，故以 any 标注；引擎内部对 THREE 的使用
 * 都集中在 roomEngine.ts，保持可控。
 */

// 锁定版本，避免 CDN 漂移导致行为变化
const THREE_CDN = "https://unpkg.com/three@0.160.0/build/three.module.js";

// 缓存 Promise，确保整个应用只加载一次
let cached: Promise<any> | null = null;

export function loadThree(): Promise<any> {
  if (!cached) {
    cached = import(/* @vite-ignore */ THREE_CDN);
  }
  return cached;
}
