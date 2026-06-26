import { useRef, useState, useEffect } from "react";
import { buildColorThemeStyle } from "../../../core/render/revealRenderer";
import { getPlaceholderFormatting } from "../../../core/render/slidesetRenderUtils";
import { buildTextElementStyle } from "../../../core/render/revealRenderer";
import { extractPlainTextFromParagraphs } from "../../../core/text/textFormatting";
import SlideDecorations from "../../canvas/SlideDecorations";
import { buildLayoutPseudoSlide } from "../../../core/operations/masterOperations";

export default function LayoutThumb({ layout, presentation }) {
  const containerRef = useRef(null);
  const [thumbW, setThumbW] = useState(120);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setThumbW(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dims = presentation?.slideset?.master?.["slide-dimensions"];
  const slideW = dims?.width ?? 1280;
  const slideH = dims?.height ?? 720;
  const scale = thumbW / slideW;
  const thumbH = Math.round(thumbW * slideH / slideW);
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const colorThemeStyle = buildColorThemeStyle(presentation);
  const bgColor = presentation?.slideset?.master?.["color-theme"]
    ?.find((e) => e["css-variable-name"] === "bg-light")?.color ?? "#fff";

  const pseudoSlide = buildLayoutPseudoSlide(layout ?? { placeholders: [], elements: {} }, masterFormatting);
  const textElements = pseudoSlide?.contents?.text ?? [];
  const mediaElements = pseudoSlide?.contents?.media ?? [];

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: thumbH, position: "relative", overflow: "hidden", ...colorThemeStyle }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: slideW,
          height: slideH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          background: bgColor,
          overflow: "hidden",
        }}
      >
        <SlideDecorations
          presentation={presentation}
          width={slideW}
          height={slideH}
          layoutId={layout?.["layout-id"]}
        />
        {textElements.map((el, index) => {
          const phFormatting = getPlaceholderFormatting(presentation, { "layout-id": layout?.["layout-id"] }, el);
          const style = buildTextElementStyle(el, index, masterFormatting, phFormatting);
          return (
            <div key={el.id} style={{ ...style, overflow: "hidden", zIndex: 1 }}>
              {extractPlainTextFromParagraphs(el.paragraphs, "\n")}
            </div>
          );
        })}
        {mediaElements.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: el.position?.x ?? 0,
              top: el.position?.y ?? 0,
              width: el.width ?? 200,
              height: el.height ?? 150,
              border: "1px dashed rgba(80,80,80,0.4)",
              background: "rgba(200,200,200,0.15)",
              boxSizing: "border-box",
            }}
          />
        ))}
      </div>
    </div>
  );
}
