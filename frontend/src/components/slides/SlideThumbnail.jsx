import { useRef, useState, useEffect } from "react";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import {
  buildColorThemeStyle,
  buildTextElementStyle,
  buildMediaContainerStyle,
  buildMediaInnerStyle,
  buildMediaFilterStyle,
  buildBevelOverlayStyle,
} from "../../core/render/revealRenderer";
import { paragraphsToHTML } from "../../core/text/textFormatting";
import { getPlaceholderFormatting, getPlaceholderPadding } from "../../core/render/slidesetRenderUtils";
import { REFLECTION_PRESETS } from "../../core/model/imageEffects";
import SlideDecorations from "../canvas/SlideDecorations";
import "./SlideThumbnail.css";

const PLACEHOLDER_PROMPTS = new Set([
  "",
  "Start editing your presentation.",
  "Click to edit text",
  "Click to add text",
]);

const getPlainText = (paragraphs = []) =>
  paragraphs
    .map((paragraph) =>
      (paragraph.runs ?? []).map((run) => run.text ?? "").join(""),
    )
    .join("\n")
    .trim();

const isEmptyPlaceholderPrompt = (textElement) =>
  textElement["placeholder-id"] && PLACEHOLDER_PROMPTS.has(getPlainText(textElement.paragraphs));

function ThumbnailMedia({ media, index }) {
  const src = useMediaSrc(media["file-link"]);
  const containerStyle = buildMediaContainerStyle(media, index);
  const innerStyle = buildMediaInnerStyle(media);
  const cssFilter = buildMediaFilterStyle(media);
  const bevelStyle = buildBevelOverlayStyle(media);

  const refId = media.effects?.reflectionId;
  const rp = refId && refId !== "none" ? REFLECTION_PRESETS.find((p) => p.id === refId) : null;
  const reflection = rp && rp.size > 0 ? (() => {
    const elH = media.height ?? 200;
    const elW = media.width ?? 200;
    const refH = Math.round((rp.size / 100) * elH);
    return {
      position: "absolute",
      left: `${media.position?.x ?? 0}px`,
      top: `${(media.position?.y ?? 0) + elH + (rp.offset ?? 0)}px`,
      width: `${elW}px`,
      height: `${refH}px`,
      objectFit: "cover",
      objectPosition: "top",
      transform: "scaleY(-1)",
      opacity: rp.opacity,
      ...(rp.blur > 0 ? { filter: `blur(${rp.blur}px)` } : {}),
      WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
      maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
      pointerEvents: "none",
      zIndex: (media["z-index"] ?? index + 1),
    };
  })() : null;

  return (
    <>
      <div style={{ ...containerStyle, pointerEvents: "none" }}>
        <img
          src={src}
          alt=""
          style={{ ...innerStyle, ...(cssFilter ? { filter: cssFilter } : {}) }}
        />
        {bevelStyle && <div style={bevelStyle} />}
      </div>
      {reflection && <img src={src} alt="" style={reflection} />}
    </>
  );
}

export default function SlideThumbnail({
  slide,
  slideWidth = 1280,
  slideHeight = 720,
  presentation,
  commentCount = 0,
}) {
  const containerRef = useRef(null);
  const [thumbW, setThumbW] = useState(160);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setThumbW(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const textElements = slide?.contents?.text ?? [];
  const mediaElements = slide?.contents?.media ?? [];
  const scale = thumbW / slideWidth;
  const thumbH = Math.round(thumbW * slideHeight / slideWidth);
  const colorThemeStyle = buildColorThemeStyle(presentation);
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const bgFillImageKey = slide?.contents?.["bg-fill-image"] ?? null;
  const bgFillImageSrc = useMediaSrc(bgFillImageKey);
  const bgFillSettings = slide?.contents?.["bg-fill-settings"] ?? {};

  return (
    <div
      ref={containerRef}
      className="slide-thumbnail"
      style={{ width: "100%", height: thumbH, ...colorThemeStyle }}
    >
      {commentCount > 0 && (
        <div
          className="slide-thumbnail-comment-badge"
          title={`${commentCount} comment${commentCount > 1 ? "s" : ""}`}
        >
          💬 {commentCount}
        </div>
      )}
      <div
        className="slide-thumbnail-inner"
        style={{
          width: slideWidth,
          height: slideHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background:
            !slide?.contents?.background || slide.contents.background === "#FFFFFFFF"
              ? "var(--bg-light, white)"
              : slide.contents.background,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {bgFillImageSrc && (() => {
          const s = bgFillSettings;
          const scale = s.fitToCanvas ?? false;
          const ol = scale ? 0 : (s.offsetLeft ?? 0) / 100;
          const or = scale ? 0 : (s.offsetRight ?? 0) / 100;
          const ot = scale ? 0 : (s.offsetTop ?? 0) / 100;
          const ob = scale ? 0 : (s.offsetBottom ?? 0) / 100;
          return (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
              <img src={bgFillImageSrc} alt="" style={{
                position: "absolute",
                left: ol * slideWidth, top: ot * slideHeight,
                width: (1 - ol - or) * slideWidth,
                height: (1 - ot - ob) * slideHeight,
                objectFit: scale ? "fill" : "cover",
                opacity: 1 - (s.transparency ?? 0) / 100,
              }} />
            </div>
          );
        })()}
        <SlideDecorations
          presentation={presentation}
          width={slideWidth}
          height={slideHeight}
          layoutId={slide?.["layout-id"]}
        />
        {textElements.filter((element) => !element.hidden && !isEmptyPlaceholderPrompt(element)).map((textElement, index) => {
          const placeholderFormatting = getPlaceholderFormatting(presentation, slide, textElement);
          const placeholderPadding = getPlaceholderPadding(presentation, slide, textElement);
          const style = buildTextElementStyle(textElement, index, masterFormatting, placeholderFormatting, placeholderPadding);
          const html = paragraphsToHTML(textElement.paragraphs, masterFormatting, placeholderFormatting);
          return (
            <div
              key={textElement.id}
              style={style}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
        {mediaElements.filter((element) => !element.hidden).map((media, index) => (
          <ThumbnailMedia key={media.id} media={media} index={index} />
        ))}
      </div>
    </div>
  );
}
