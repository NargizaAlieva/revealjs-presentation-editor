import { useRef, useState, useEffect } from "react";
import { buildColorThemeStyle } from "../../../core/render/revealRenderer";
import SlideDecorations from "../../canvas/SlideDecorations";

function TextLines({ count = 4, titleStyle = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8%", padding: "8% 10%", width: "100%", height: "100%", boxSizing: "border-box", justifyContent: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          height: titleStyle ? "18%" : "10%",
          background: "rgba(50,60,180,0.5)",
          borderRadius: 3,
          width: i === count - 1 && !titleStyle ? "65%" : "100%",
          flexShrink: 0,
        }} />
      ))}
    </div>
  );
}

function ImageIcon() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(50,60,200,0.75)" strokeWidth="1.2"
        style={{ width: "45%", height: "45%" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    </div>
  );
}

function VideoIcon() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(50,60,200,0.75)" strokeWidth="1.2"
        style={{ width: "45%", height: "45%" }}>
        <rect x="2" y="4" width="16" height="16" rx="2" />
        <polygon points="22,12 16,7 16,17" fill="rgba(80,80,140,0.3)" stroke="none" />
        <polyline points="22,8 22,16" strokeWidth="2" />
      </svg>
    </div>
  );
}

function PlaceholderVisual({ ph }) {
  const isTitle = ph.role === "title";
  const isFooter = ph["placeholder-id"]?.startsWith("footer-");
  const isImage = ph.type === "image";
  const isVideo = ph.type === "video";

  return (
    <div style={{
      position: "absolute",
      left: ph.position?.x ?? 0,
      top: ph.position?.y ?? 0,
      width: ph.width,
      height: ph.height,
      boxSizing: "border-box",
      border: "4px dashed rgba(60,80,210,0.85)",
      background: "rgba(180,200,240,0.22)",
      overflow: "hidden",
      pointerEvents: "none",
    }}>
      {isImage && <ImageIcon />}
      {isVideo && <VideoIcon />}
      {!isImage && !isVideo && (
        isFooter
          ? <TextLines count={1} />
          : isTitle
            ? <TextLines count={1} titleStyle />
            : <TextLines count={4} />
      )}
    </div>
  );
}

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
  const colorThemeStyle = buildColorThemeStyle(presentation);
  const masterColorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
  const bgColor = masterColorTheme.find((e) => e["css-variable-name"] === "bg-light")?.color ?? "#fff";

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
        {(layout?.placeholders ?? []).map((ph, i) => (
          <PlaceholderVisual key={ph["placeholder-id"] ?? i} ph={ph} />
        ))}
      </div>
    </div>
  );
}
