import Reveal from "reveal.js";
import {
  getSlideSize,
  getTextElements,
  getMediaElements,
} from "../render/slidesetRenderUtils";
import { getStyleById } from "../model/imageStyles";

export function buildTextElementStyle(textElement, index, masterFormatting = {}, placeholderFormatting = {}) {
  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const rotation = textElement.rotation ?? 0;
  const r = (elemVal, phVal, masterVal, fallback) => elemVal ?? phVal ?? masterVal ?? fallback;

  return {
    position: "absolute",
    left: `${textElement.position?.x ?? 0}px`,
    top: `${textElement.position?.y ?? 0}px`,
    width: `${textElement.width ?? 300}px`,
    height: `${textElement.height ?? 80}px`,
    background: textElement.background ?? "transparent",
    overflow: "hidden",
    zIndex: textElement["z-index"] ?? index + 1,
    ...(rotation ? { transform: `rotate(${rotation}deg)` } : {}),
    fontSize: r(formatting.size, placeholderFormatting.size, masterFormatting.size, index === 0 ? "44px" : "28px"),
    fontWeight: r(formatting.weight, placeholderFormatting.weight, masterFormatting.weight, index === 0 ? "bold" : "normal"),
    fontStyle: r(formatting.italics, placeholderFormatting.italics, masterFormatting.italics, false) ? "italic" : "normal",
    fontFamily: r(formatting.font, placeholderFormatting.font, masterFormatting.font, "inherit"),
    color: r(formatting.color, placeholderFormatting.color, masterFormatting.color, "var(--text-dark, black)"),
    textAlign: r(formatting.align, placeholderFormatting.align, masterFormatting.align, "left"),
    textAlignLast: r(formatting.align, placeholderFormatting.align, masterFormatting.align, "left") === "justify" ? "left" : undefined,
    lineHeight: r(formatting["line-spacing"], placeholderFormatting["line-spacing"], masterFormatting["line-spacing"], "1.4"),
    boxSizing: "border-box",
  };
}

// Converts a React camelCase style object to a CSS string for HTML export.
export function styleToString(styleObj) {
  return Object.entries(styleObj)
    .filter(([, v]) => v != null)
    .map(([k, v]) => {
      const prop = k.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
      return `${prop}: ${v}`;
    })
    .join("; ");
}

export function buildMediaContainerStyle(media, index) {
  const rotation = media.rotation ?? 0;
  const styleId = media.effects?.["style-id"];
  const styleCss = styleId ? getStyleById(styleId).css : {};
  const transforms = [
    rotation ? `rotate(${rotation}deg)` : null,
    styleCss.transform ?? null,
  ].filter(Boolean).join(" ");
  return {
    position: "absolute",
    left: `${media.position?.x ?? 0}px`,
    top: `${media.position?.y ?? 0}px`,
    width: `${media.width ?? 200}px`,
    height: `${media.height ?? 120}px`,
    zIndex: media["z-index"] ?? index + 1,
    overflow: "hidden",
    ...styleCss,
    ...(transforms ? { transform: transforms, transformOrigin: "center center" } : {}),
  };
}

export function buildMediaInnerStyle(media) {
  const scale = media.scale ?? 1;
  const [ct = 0, cr = 0, cb = 0, cl = 0] = media.crop ?? [];
  const hasCrop = ct !== 0 || cr !== 0 || cb !== 0 || cl !== 0;

  if (hasCrop) {
    // Use source-width/source-height so image is always positioned correctly,
    // including when crop extends outside image (negative cl/cr/ct/cb).
    const srcW = media["source-width"] ?? media.width ?? 200;
    const srcH = media["source-height"] ?? media.height ?? 120;
    return {
      position: "absolute",
      width: `${srcW}px`,
      height: `${srcH}px`,
      left: `${-(cl / 100) * srcW}px`,
      top: `${-(ct / 100) * srcH}px`,
      objectFit: "fill",
      ...(scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: "center center" } : {}),
    };
  }

  return {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    display: "block",
    ...(scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: "center center" } : {}),
  };
}

export function buildVideoAttributes(media) {
  const playback = media.playback ?? {};
  return {
    ...(playback.autoplay ? { autoPlay: true } : {}),
    ...(playback.loop ? { loop: true } : {}),
    ...(playback.muted ? { muted: true } : {}),
  };
}

export function buildSlideContainerStyle(width, height) {
  return {
    position: "relative",
    width: `${width}px`,
    height: `${height}px`,
    overflow: "hidden",
  };
}

export function getTextContent(textElement) {
  return (
    textElement?.paragraphs
      ?.map((paragraph) =>
        paragraph?.runs?.map((run) => run?.text || "").join(""),
      )
      .join("\n") || ""
  );
}

export function getTextLines(textElement) {
  if (!textElement?.paragraphs?.length) return [];

  return textElement.paragraphs.flatMap((paragraph) => {
    const text = paragraph?.runs?.map((run) => run?.text || "").join("") ?? "";
    return text.split("\n");
  });
}

export function getSlideDimensions(presentation) {
  return getSlideSize(presentation);
}

export function getVisibleSlidesForPreview(slides) {
  return (slides || []).filter((slide) => !slide.hidden);
}

export function getSlideTextElements(slide) {
  return getTextElements(slide);
}

export function getSlideMediaElements(slide) {
  return getMediaElements(slide);
}

export function initRevealDeck(
  containerElement,
  width,
  height,
  initialSlide = 0,
) {
  const deck = new Reveal(containerElement, {
    controls: true,
    progress: true,
    center: false,
    hash: false,
    embedded: true,
    width,
    height,
    margin: 0,
    minScale: 0.1,
    maxScale: 10,
    plugins: [],
  });

  deck.initialize().then(() => {
    requestAnimationFrame(() => {
      deck.layout();
      if (initialSlide > 0) {
        deck.slide(initialSlide);
      }
    });
  });

  return deck;
}

export function buildColorThemeStyle(presentation) {
  const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
  const cssVars = {};
  colorTheme.forEach((entry) => { 
    const color = entry.color;
    const normalized = typeof color === "string" && color.length === 9 && color.startsWith("#")
      ? color.slice(0, 7)
      : color;
    cssVars[`--${entry["css-variable-name"]}`] = normalized;
  });
  return cssVars;
}

export function getSlideTransition(slide, defaultTransition = "slide") {
  const transition = slide?.contents?.transition;
  const validTransitions = [
    "fade",
    "slide",
    "convex",
    "concave",
    "zoom",
    "none",
  ];
  if (transition && validTransitions.includes(transition)) {
    return transition;
  }
  return defaultTransition;
}

const FRAGMENT_EFFECT_CLASSES = new Set([
  "grow",
  "shrink",
  "shrink-down",
  "fade-out",
  "fade-up",
  "fade-down",
  "fade-left",
  "fade-right",
  "fade-in-then-out",
  "fade-in-then-semi-out",
  "highlight-red",
  "highlight-green",
  "highlight-blue",
  "highlight-current-red",
  "highlight-current-green",
  "highlight-current-blue",
  "strike",
]);

const SPEED_MAP = {
  0.5: "fast",
  1: undefined,
  2: "slow",
};

export function buildAnimationMap(slide) {
  const animations = slide?.contents?.animations ?? [];
  const map = new Map();
  animations.forEach((animation) => {
    if (animation?.id) map.set(animation.id, animation);
  });
  return map;
}

export function buildAdjustedAnimationMap(slide) {
  const animations = slide?.contents?.animations ?? [];
  const textElements = getTextElements(slide);
  if (!animations.length) return new Map();

  const sorted = [...animations].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

  const adjustedStartMap = new Map(); 
  let next = 1;
  for (const anim of sorted) {
    adjustedStartMap.set(anim.id, next);
    const byParagraph = (anim["effect-options"]?.sequence ?? "as-one-object") !== "as-one-object";
    if (byParagraph) {
      const textEl = textElements.find((el) => el.id === anim.id);
      const lines = getTextLines(textEl ?? { paragraphs: [] });
      next += lines.length || 1;
    } else {
      next += 1;
    }
  }

  const map = new Map();
  animations.forEach((animation) => {
    if (!animation?.id) return;
    const adjustedSeq = adjustedStartMap.get(animation.id);
    map.set(animation.id, adjustedSeq !== undefined
      ? { ...animation, sequence: adjustedSeq }
      : animation,
    );
  });
  return map;
}

function fragmentClassNameFor(effect) {
  const classes = ["fragment"];
  if (
    effect !== "fade-in" &&
    effect !== "none" &&
    FRAGMENT_EFFECT_CLASSES.has(effect)
  ) {
    classes.push(effect);
  }
  return classes.join(" ");
}

function buildFragmentProps(animation, sequenceOverride) {
  if (!animation) return null;

  const effect = animation.effect ?? "fade-in";
  const sequence = sequenceOverride ?? animation.sequence;
  const rawSpeed = animation["effect-options"]?.speed ?? animation.speed;
  const speed = SPEED_MAP[rawSpeed];

  return {
    className: fragmentClassNameFor(effect),
    "data-fragment-index": Number.isFinite(sequence) ? sequence : undefined,
    "data-fragment-speed": speed,
  };
}

export function getFragmentProps(animation) {
  return buildFragmentProps(animation);
}

export function getPerLineFragments(textElement, animation, lines) {
  if (!animation) return null;

  const sequenceMode = animation["effect-options"]?.sequence ?? "as-one-object";
  if (sequenceMode === "as-one-object") return null;
  if (!lines || lines.length <= 1) return null;

  return lines.map((line, index) => {
    const fragIndex =
      sequenceMode === "all-at-once"
        ? animation.sequence
        : animation.sequence + index;

    return {
      text: line,
      fragmentProps: buildFragmentProps(animation, fragIndex),
    };
  });
}