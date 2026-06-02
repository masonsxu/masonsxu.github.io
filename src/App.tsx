/**
 * App.tsx —— 「我记忆的旧房间」入口
 *
 * 本网站是一个第一人称 3D 探索类个人网站（微型步行模拟器）。
 * 所有内容数据来自 src/data/room-content.ts（衍生自 website-content.md）。
 * Three.js 从 CDN 加载，不打包进产物。
 */

import MemoryRoom from "./components/room/MemoryRoom";
import "./index.css";

export function App() {
  return <MemoryRoom />;
}

export default App;
