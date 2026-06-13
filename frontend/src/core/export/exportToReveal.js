import {
  getSlideSize,
  getVisibleSlides,
  escapeHtml,
  getTextElements,
  getMediaElements,
} from "../../utils/slidesetRenderUtils";
import { downloadHtml } from "./downloadHtml";
import { idbGet } from "../persistence/autoSaveService";

function buildColorThemeCss(presentation) {
  const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
  if (colorTheme.length === 0) return "";
  const vars = colorTheme
    .map((entry) => `  --${entry["css-variable-name"]}: ${entry.color};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

const FRAGMENT_EFFECT_CLASSES = new Set([
  "grow", "shrink", "shrink-down", "fade-out", "fade-up", "fade-down",
  "fade-left", "fade-right", "fade-in-then-out", "fade-in-then-semi-out",
  "highlight-red", "highlight-green", "highlight-blue",
  "highlight-current-red", "highlight-current-green", "highlight-current-blue",
  "strike",
]);

const SPEED_MAP = { 0.5: "fast", 1: undefined, 2: "slow" };

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function resolveMediaLinks(slides) {
  const resolvedMap = new Map();
  for (const slide of slides) {
    for (const media of getMediaElements(slide)) {
      const fileLink = media["file-link"];
      if (fileLink?.startsWith("indexeddb://")) {
        const key = fileLink.replace("indexeddb://", "");
        const blob = await idbGet(key);
        if (blob) {
          resolvedMap.set(fileLink, await blobToDataUrl(blob));
        }
      }
    }
  }
  return resolvedMap;
}

function buildAnimationMap(slide) {
  const animations = slide.contents?.animations ?? [];
  const map = new Map();
  animations.forEach((animation) => {
    if (animation?.id) map.set(animation.id, animation);
  });
  return map;
}

function fragmentClassesFor(effect) {
  const classes = ["fragment"];
  if (effect !== "fade-in" && effect !== "none" && FRAGMENT_EFFECT_CLASSES.has(effect)) {
    classes.push(effect);
  }
  return classes.join(" ");
}

function fragmentDataAttrs(sequence, speedRaw) {
  const speed = SPEED_MAP[speedRaw];
  return [
    Number.isFinite(sequence) ? `data-fragment-index="${sequence}"` : "",
    speed ? `data-fragment-speed="${speed}"` : "",
  ].filter(Boolean).join(" ");
}

function applyFragment(innerHtml, wrapperStyle, animation) {
  if (!animation) {
    return `<div style="${wrapperStyle}">${innerHtml}</div>`;
  }
  const effect = animation.effect ?? "fade-in";
  const sequence = animation.sequence;
  const speedRaw = animation["effect-options"]?.speed ?? animation.speed;
  const classes = fragmentClassesFor(effect);
  const dataAttrs = fragmentDataAttrs(sequence, speedRaw);
  return `<div class="${classes}" ${dataAttrs} style="${wrapperStyle}">${innerHtml}</div>`;
}

function buildTextElementStyle(textElement, index) {
  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const rotation = textElement.rotation ?? 0;
  return [
    "position: absolute",
    `left: ${textElement.position?.x ?? 0}px`,
    `top: ${textElement.position?.y ?? 0}px`,
    `width: ${textElement.width ?? 300}px`,
    `height: ${textElement.height ?? 80}px`,
    `background: ${textElement.background ?? "transparent"}`,
    "overflow: hidden",
    `z-index: ${textElement["z-index"] ?? index + 1}`,
    ...(rotation ? [`transform: rotate(${rotation}deg)`] : []),
    `font-size: ${formatting.size ?? (index === 0 ? "44px" : "28px")}`,
    `font-weight: ${formatting.weight ?? (index === 0 ? "bold" : "normal")}`,
    `font-style: ${formatting.italics ? "italic" : "normal"}`,
    `color: ${formatting.color ?? "var(--text-dark, black)"}`,
    `text-align: ${formatting.align ?? "left"}`,
    `line-height: ${formatting["line-spacing"] ?? "1.4"}`,
    "box-sizing: border-box",
  ].join("; ");
}

function buildPStyle(paragraphFormatting) {
  return [
    paragraphFormatting.align ? `text-align: ${paragraphFormatting.align}` : "",
    paragraphFormatting.margin ? `margin: ${paragraphFormatting.margin}` : "margin: 0 0 4px 0",
  ].filter(Boolean).join("; ");
}

function buildRunHtml(run) {
  const runFormatting = run.formatting ?? {};
  const style = [
    runFormatting.weight ? `font-weight: ${runFormatting.weight}` : "",
    runFormatting.italics ? "font-style: italic" : "",
    runFormatting.color ? `color: ${runFormatting.color}` : "",
    runFormatting.size ? `font-size: ${runFormatting.size}` : "",
    runFormatting["text-decoration"] ? `text-decoration: ${runFormatting["text-decoration"]}` : "",
  ].filter(Boolean).join("; ");

  const text = escapeHtml(run.text ?? "");
  if (run.link?.href) {
    return `<a href="${escapeHtml(run.link.href)}" target="${run.link.target ?? "_blank"}" style="${style}">${text}</a>`;
  }
  return style ? `<span style="${style}">${text}</span>` : text;
}

function buildTextElementContent(textElement, animation) {
  if (!textElement.paragraphs?.length) return "";
  const sequenceMode = animation?.["effect-options"]?.sequence ?? "as-one-object";
  const perLine = animation && sequenceMode !== "as-one-object";

  return textElement.paragraphs.map((paragraph) => {
    const paragraphFormatting = paragraph.formatting ?? {};
    const pStyle = buildPStyle(paragraphFormatting);
    const runsHtml = (paragraph.runs ?? []).map(buildRunHtml).join("");

    if (!perLine) return `<p style="${pStyle}">${runsHtml}</p>`;

    const lines = runsHtml.split("\n");
    if (lines.length === 1) {
      const classes = fragmentClassesFor(animation.effect ?? "fade-in");
      const dataAttrs = fragmentDataAttrs(animation.sequence, animation["effect-options"]?.speed ?? animation.speed);
      return `<p class="${classes}" ${dataAttrs} style="${pStyle}">${runsHtml}</p>`;
    }

    return lines.map((line, lineIndex) => {
      const fragIndex = sequenceMode === "all-at-once" ? animation.sequence : animation.sequence + lineIndex;
      const classes = fragmentClassesFor(animation.effect ?? "fade-in");
      const dataAttrs = fragmentDataAttrs(fragIndex, animation["effect-options"]?.speed ?? animation.speed);
      return `<p class="${classes}" ${dataAttrs} style="${pStyle}">${line}</p>`;
    }).join("");
  }).join("");
}

function buildSlideSection(slide, width, height, resolvedMap) {
  const textElements = getTextElements(slide);
  const mediaElements = getMediaElements(slide);
  const transition = slide.contents?.transition ?? "slide";
  const background = slide.contents?.background ?? "var(--bg-light, white)";
  const animationMap = buildAnimationMap(slide);

  const textElementsHtml = textElements.map((textElement, index) => {
    const animation = animationMap.get(textElement.id);
    const sequenceMode = animation?.["effect-options"]?.sequence ?? "as-one-object";
    const style = buildTextElementStyle(textElement, index);
    const content = buildTextElementContent(textElement, animation);
    if (!animation || sequenceMode === "as-one-object") {
      return applyFragment(content, style, animation);
    }
    return `<div style="${style}">${content}</div>`;
  }).join("");

  const mediaElementsHtml = mediaElements.map((media, index) => {
    const animation = animationMap.get(media.id);
    const rotation = media.rotation ?? 0;
    const wrapperStyle = [
      "position: absolute",
      `left: ${media.position?.x ?? 0}px`,
      `top: ${media.position?.y ?? 0}px`,
      `width: ${media.width ?? 200}px`,
      `height: ${media.height ?? 120}px`,
      `z-index: ${media["z-index"] ?? index + 1}`,
    ].join("; ");

    const imgStyle = [
      "width: 100%",
      "height: 100%",
      "object-fit: contain",
      ...(rotation ? [`transform: rotate(${rotation}deg)`] : []),
    ].join("; ");

    const fileLink = media["file-link"] ?? "";
    const src = resolvedMap.get(fileLink) ?? fileLink;
    const imgHtml = `<img src="${escapeHtml(src)}" alt="" style="${imgStyle}" />`;

    return applyFragment(imgHtml, wrapperStyle, animation);
  }).join("");

  return `
    <section data-transition="${escapeHtml(transition)}" style="background: ${background};">
      <div style="position: relative; width: ${width}px; height: ${height}px; overflow: hidden;">
        ${textElementsHtml}
        ${mediaElementsHtml}
      </div>
    </section>`;
}

export async function exportToReveal(presentation) {
  const { width, height } = getSlideSize(presentation);
  const slides = getVisibleSlides(presentation);
  const colorThemeCss = buildColorThemeCss(presentation);
  const title = escapeHtml(presentation?.slideset?.title ?? "Presentation");
  const filename = presentation?.slideset?.filename ?? "presentation";

  const resolvedMap = await resolveMediaLinks(slides);

  const slideSections = slides
    .map((slide) => buildSlideSection(slide, width, height, resolvedMap))
    .join("\n");

  const htmlContent = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/white.css">
  <style>
    ${colorThemeCss}
    .reveal .slides section { text-align: left; }
    .reveal .slides section p { margin: 0 0 4px 0; }
    .reveal .slides section .fragment { transition-duration: 800ms; }
    .reveal .slides section .fragment[data-fragment-speed="fast"] { transition-duration: 200ms; }
    .reveal .slides section .fragment[data-fragment-speed="slow"] { transition-duration: 2200ms; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slideSections}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      controls: true,
      progress: true,
      center: false,
      hash: false,
      width: ${width},
      height: ${height},
      margin: 0,
      minScale: 0.5,
      maxScale: 2.0,
    });
  </script>
</body>
</html>`;

  downloadHtml(htmlContent, `${filename}.html`);
}