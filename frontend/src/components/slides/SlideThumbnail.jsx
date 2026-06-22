import { useRef, useState, useEffect } from "react";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { buildColorThemeStyle, buildTextElementStyle } from "../../core/render/revealRenderer";
import { extractPlainTextFromParagraphs } from "../../core/text/textFormatting";
import { getPlaceholderFormatting } from "../../core/render/slidesetRenderUtils";
import SlideDecorations from "../canvas/SlideDecorations";
import "./SlideThumbnail.css";

function ThumbnailMedia({ media }) {
  const src = useMediaSrc(media["file-link"]);
  return (
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        left: media.position?.x ?? 0,
        top: media.position?.y ?? 0,
        width: media.width ?? 300,
        height: media.height ?? 200,
        objectFit: "contain",
        pointerEvents: "none",
      }}
    />
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
        <SlideDecorations
          presentation={presentation}
          width={slideWidth}
          height={slideHeight}
          layoutId={slide?.["layout-id"]}
        />

        {textElements.filter((element) => !element.hidden).map((textElement, index) => {
          const placeholderFormatting = getPlaceholderFormatting(presentation, slide, textElement);
          const style = buildTextElementStyle(textElement, index, masterFormatting, placeholderFormatting);
          return (
            <div key={textElement.id} style={{ ...style, overflow: "hidden", zIndex: 1 }}>
              {extractPlainTextFromParagraphs(textElement.paragraphs, " ")}
            </div>
          );
        })}

        {mediaElements.filter((element) => !element.hidden).map((media) => (
          <ThumbnailMedia key={media.id} media={media} />
        ))}
      </div>
    </div>
  );
}
