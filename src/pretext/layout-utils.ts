import {
  layout,
  prepare,
  prepareWithSegments,
  layoutNextLine,
  walkLineRanges,
  measureLineGeometry,
  measureNaturalWidth,
  type LayoutCursor,
  type PreparedTextWithSegments,
  type LayoutLineRange,
} from "@chenglou/pretext";
import {
  prepareInlineFlow,
  walkInlineFlowLines,
  measureInlineFlowGeometry,
  type InlineFlowItem,
  type PreparedInlineFlow,
  type InlineFlowFragment,
} from "@chenglou/pretext/inline-flow";

export type {
  LayoutCursor,
  PreparedTextWithSegments,
  PreparedInlineFlow,
  InlineFlowItem,
};

export {
  layout,
  prepare,
  prepareWithSegments,
  layoutNextLine,
  walkLineRanges,
  measureLineGeometry,
  measureNaturalWidth,
  prepareInlineFlow,
  walkInlineFlowLines,
  measureInlineFlowGeometry,
};

export type TextMetrics = {
  lineCount: number;
  height: number;
};

export type LineInfo = {
  text: string;
  width: number;
  x: number;
  y: number;
};

export type LayoutConfig = {
  font: string;
  lineHeight: number;
  maxWidth: number;
};

export function computeTextHeight(
  text: string,
  config: LayoutConfig,
): TextMetrics {
  const prepared = prepare(text, config.font);
  return layout(prepared, config.maxWidth, config.lineHeight);
}

export function computeTextHeightPrepared(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number,
): TextMetrics {
  return layout(prepared, maxWidth, lineHeight);
}

export function layoutAllLines(
  prepared: PreparedTextWithSegments,
  maxWidth: number,
  lineHeight: number,
  startX = 0,
  startY = 0,
): LineInfo[] {
  const lines: LineInfo[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineIndex = 0;

  while (true) {
    const line = layoutNextLine(prepared, cursor, maxWidth);
    if (line === null) break;
    lines.push({
      text: line.text,
      width: line.width,
      x: startX,
      y: startY + lineIndex * lineHeight,
    });
    cursor = line.end;
    lineIndex++;
  }

  return lines;
}

export type RichInlineSpec =
  | {
      kind: "text";
      text: string;
      className: string;
      font: string;
      extraWidth?: number;
    }
  | {
      kind: "chip";
      label: string;
      className: string;
      font: string;
      extraWidth: number;
      break?: "never";
    };

export type RichLineFragment = {
  className: string;
  text: string;
  leadingGap: number;
};

export type RichLine = {
  fragments: RichLineFragment[];
};

export type RichNoteLayout = {
  lineCount: number;
  height: number;
  lines: RichLine[];
};

export function prepareRichInlineFlow(specs: RichInlineSpec[]): {
  prepared: PreparedInlineFlow;
  classNames: string[];
} {
  const classNames = specs.map((spec) => spec.className);
  const items: InlineFlowItem[] = specs.map((spec) => {
    if (spec.kind === "chip") {
      return {
        text: spec.label,
        font: spec.font,
        break: spec.break ?? "never",
        extraWidth: spec.extraWidth,
      };
    }
    return {
      text: spec.text,
      font: spec.font,
      extraWidth: spec.extraWidth ?? 0,
    };
  });

  return {
    prepared: prepareInlineFlow(items),
    classNames,
  };
}

export function layoutRichNote(
  prepared: PreparedInlineFlow,
  classNames: string[],
  maxWidth: number,
  lineHeight: number,
): RichNoteLayout {
  const lines: RichLine[] = [];
  walkInlineFlowLines(prepared, maxWidth, (line) => {
    lines.push({
      fragments: line.fragments.map((fragment: InlineFlowFragment) => ({
        className: classNames[fragment.itemIndex]!,
        text: fragment.text,
        leadingGap: fragment.gapBefore,
      })),
    });
  });

  return {
    lineCount: lines.length,
    height: lines.length * lineHeight,
    lines,
  };
}

export function fitHeadlineFontSize(
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxHeight: number,
  minSize = 20,
  maxSize = 92,
): { fontSize: number; lineHeight: number; font: string } {
  let low = minSize;
  let high = maxSize;
  let best = low;
  let bestLineHeight = Math.round(low * 0.93);
  let bestFont = `${best}px ${fontFamily}`;

  while (low <= high) {
    const size = Math.floor((low + high) / 2);
    const lineHeight = Math.round(size * 0.93);
    const font = `700 ${size}px ${fontFamily}`;
    const prepared = prepareWithSegments(text, font);

    let breaksWord = false;
    const metrics = walkLineRanges(
      prepared,
      maxWidth,
      (line: LayoutLineRange) => {
        if (line.end.graphemeIndex !== 0) breaksWord = true;
      },
    );
    const totalHeight = metrics * lineHeight;

    if (!breaksWord && totalHeight <= maxHeight) {
      best = size;
      bestLineHeight = lineHeight;
      bestFont = font;
      low = size + 1;
    } else {
      high = size - 1;
    }
  }

  return { fontSize: best, lineHeight: bestLineHeight, font: bestFont };
}
