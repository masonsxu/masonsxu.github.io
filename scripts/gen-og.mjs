#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

export async function generateOg() {
  const { Resvg } = await import("@resvg/resvg-js");
  const svgPath = path.join(root, "public/og-image.svg");
  const outDir = path.join(root, "dist");
  const outFile = path.join(outDir, "og-image.png");

  const fonts = [
    "assets/fonts/ClashDisplay-Semibold.otf",
    "assets/fonts/JetBrainsMono-Regular.ttf",
    "assets/fonts/NotoSansSC-900-subset.ttf",
  ]
    .map(f => path.join(root, f))
    .filter(f => existsSync(f));

  const resvg = new Resvg(readFileSync(svgPath), {
    background: "#0A0B0D",
    font: {
      fontFiles: fonts,
      loadSystemFonts: false,
      defaultFontFamily: "JetBrains Mono",
    },
  });

  const png = resvg.render();
  if (!existsSync(outDir)) mkdirSync(outDir);
  writeFileSync(outFile, png.asPng());
  return { width: png.width, height: png.height, fonts: fonts.length };
}

if (import.meta.main) {
  const r = await generateOg();
  console.log(`og-image: ${r.width}x${r.height} -> dist/og-image.png (${r.fonts} fonts)`);
}
