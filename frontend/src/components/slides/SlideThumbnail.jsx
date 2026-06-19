import { useMediaSrc } from "../../hooks/useMediaSrc";
import { buildColorThemeStyle } from "../../core/render/revealRenderer";
import SlideDecorations from "../canvas/SlideDecorations";
import "./SlideThumbnail.css";

const THUMB_W = 180;
const THUMB_H = 101; // 16:9

const getElementText = (textElement) =>
  (textElement?.paragraphs ?? [])
    .map((p) => (p.runs ?? []).map((r) => r.text ?? "").join(""))
    .join(" ");

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
  const textElements = slide?.contents?.text ?? [];
  const mediaElements = slide?.contents?.media ?? [];
  const scale = THUMB_W / slideWidth;
  const colorThemeStyle = buildColorThemeStyle(presentation);

  return (
    <div
      className="slide-thumbnail"
      style={{ width: THUMB_W, height: THUMB_H, ...colorThemeStyle }}
    >
      {commentCount > 0 && (
        <div
          className="slide-thumbnail-comment-badge"
          title={`${commentCount} comment${commentCount > 1 ? "s" : ""}`}
        >
          💬 {commentCount}
        </div>
      )}
      {/* Inner div at full slide size, scaled down — matches EditorCanvas exactly */}
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

        {textElements.map((textElement) => {
          const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
          return (
            <div
              key={textElement.id}
              style={{
                position: "absolute",
                left: textElement.position?.x ?? 0,
                top: textElement.position?.y ?? 0,
                width: textElement.width ?? 300,
                height: textElement.height ?? 80,
                fontSize: formatting.size ?? "16px",
                fontWeight: formatting.weight ?? "normal",
                fontStyle: formatting.italics ? "italic" : "normal",
                textAlign: formatting.align ?? "left",
                color: formatting.color ?? "var(--text-dark, #111)",
                lineHeight: formatting["line-spacing"] ?? 1.2,
                overflow: "hidden",
                boxSizing: "border-box",
                padding: "8px",
                zIndex: 1,
              }}
            >
              {getElementText(textElement)}
            </div>
          );
        })}

        {mediaElements.map((media) => (
          <ThumbnailMedia key={media.id} media={media} />
        ))}
      </div>
    </div>
  );
}