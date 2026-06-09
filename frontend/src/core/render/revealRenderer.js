import Reveal from "reveal.js";
import { getSlideSize, getTextElements, getMediaElements } from "../../utils/slidesetRenderUtils";

export function buildTextElementStyle(textElement, index) {
  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  return {
    position: "absolute",
    left: `${textElement.position?.x ?? 0}px`,
    top: `${textElement.position?.y ?? 0}px`,
    width: `${textElement.width ?? 300}px`,
    height: `${textElement.height ?? 80}px`,
    background: textElement.background ?? "transparent",
    overflow: "hidden",
    zIndex: textElement["z-index"] ?? index + 1,
    transform: `rotate(${textElement.rotation ?? 0}deg)`,
    fontSize: formatting.size ?? (index === 0 ? "44px" : "28px"),
    fontWeight: formatting.weight ?? (index === 0 ? "bold" : "normal"),
    fontStyle: formatting.italics ? "italic" : "normal",
    color: formatting.color ?? "var(--text-dark, black)",
    textAlign: formatting.align ?? "left",
    lineHeight: formatting["line-spacing"] ?? "1.4",
    boxSizing: "border-box",
  };
}

export function buildMediaElementStyle(media, index) {
  return {
    position: "absolute",
    left: `${media.position?.x ?? 0}px`,
    top: `${media.position?.y ?? 0}px`,
    width: `${media.width ?? 200}px`,
    height: `${media.height ?? 120}px`,
    objectFit: "contain",
    zIndex: media["z-index"] ?? index + 1,
    transform: `rotate(${media.rotation ?? 0}deg)`,
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
        paragraph?.runs?.map((run) => run?.text || "").join("")
      )
      .join("\n") || ""
  );
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

export function initRevealDeck(containerElement, width, height) {
  const deck = new Reveal(containerElement, {
    controls: true,
    progress: true,
    center: false,
    hash: false,
    embedded: true,
    width,
    height,
    margin: 0,
    minScale: 0.5,
    maxScale: 2.0,
  });

  deck.initialize().then(() => {
    deck.layout();
  });

  return deck;
}

export function buildColorThemeStyle(presentation) {
  const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
  const cssVars = {};
  colorTheme.forEach((entry) => {
    cssVars[`--${entry["css-variable-name"]}`] = entry.color;
  });
  return cssVars;
}