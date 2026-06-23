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
  const bgImageKey = slide?.contents?.["background-image"] ?? null;
  const bgImageSrc = useMediaSrc(bgImageKey);
  const bgImagePosition = slide?.contents?.["background-image-position"] ?? "center center";
  const bgImageScale = slide?.contents?.["background-image-scale"] ?? 100;

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
          ...(bgImageSrc ? {
            backgroundImage: `url(${bgImageSrc})`,
            backgroundSize: bgImageScale === 100 ? "cover" : `${bgImageScale}%`,
            backgroundPosition: bgImagePosition,
            backgroundRepeat: "no-repeat",
          } : {}),
          position: "relative",
          overflow: "hidden",
        }}
      >
        <SlideDecorations
          presentation={presentation}
          width={slideWidth}
          height={slideHeight}
          layoutId={slide?.["layout-id"]}
        />
        {textElements.filter((element) => !element.hidden).map((textElement, index) => {
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
