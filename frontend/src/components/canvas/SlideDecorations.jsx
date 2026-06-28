import { useMediaSrc } from "../../hooks/useMediaSrc";
import { extractPlainTextFromParagraphs } from "../../core/text/textFormatting";

function MediaDecorationElement({ el, zIndex, interactive = false, onPromote }) {
  const resolvedSrc = useMediaSrc(el["file-link"]);
  const src = el.src ?? resolvedSrc;
  const isVideo = el["media-type"] === "video";

  const [ct = 0, cr = 0, cb = 0, cl = 0] = el.crop ?? [];
  const hasCrop = ct !== 0 || cr !== 0 || cb !== 0 || cl !== 0;
  const scale = el.scale ?? 1;
  const scaleStyle = scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: "center center" } : {};

  const containerStyle = {
    position: "absolute",
    left: el.position?.x ?? 0,
    top: el.position?.y ?? 0,
    width: el.width ?? 200,
    height: el.height ?? 120,
    overflow: "hidden",
    pointerEvents: (interactive || onPromote) ? "auto" : "none",
    cursor: onPromote ? "pointer" : undefined,
    zIndex: zIndex ?? 5,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
  };

  const handleClick = onPromote ? (e) => { e.stopPropagation(); onPromote(); } : undefined;

  if (isVideo) {
    return (
      <div style={containerStyle} onClick={handleClick}>
        <video
          src={src}
          preload="metadata"
          {...(interactive ? { controls: true } : { onLoadedMetadata: (e) => { e.target.currentTime = 0; } })}
          style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
        />
        {!interactive && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (hasCrop) {
    const srcW = (el["source-width"] ?? el.width ?? 200) * scale;
    const srcH = (el["source-height"] ?? el.height ?? 120) * scale;
    return (
      <div style={containerStyle} onClick={handleClick}>
        <img
          src={src}
          alt=""
          style={{
            position: "absolute",
            width: srcW,
            height: srcH,
            left: -(cl / 100) * srcW,
            top: -(ct / 100) * srcH,
            objectFit: "fill",
          }}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle} onClick={handleClick}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", ...scaleStyle }} />
    </div>
  );
}

export default function SlideDecorations({ presentation, width, height, hideMasterElements = false, layoutId, interactive = false, slideContentIds, onPromoteLayoutElement }) {
  const master = presentation?.slideset?.master;
  const decorations = master?.decorations;
  const masterElements = hideMasterElements ? null : master?.elements;
  const layoutElements = layoutId
    ? (presentation?.slideset?.layouts ?? []).find((l) => l["layout-id"] === layoutId)?.elements
    : null;

  return (
    <>
      {decorations?.shapes?.length > 0 && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
          }}
          viewBox={`0 0 ${width ?? 960} ${height ?? 540}`}
          preserveAspectRatio="none"
        >
          {decorations.shapes.map((shape, i) => {
            const common = {
              fill: shape.fill ?? "none",
              stroke: shape.stroke ?? "none",
              strokeWidth: shape.strokeWidth ?? 0,
              opacity: shape.opacity ?? 1,
            };
            switch (shape.type) {
              case "rect":
                return (
                  <rect key={i} {...common}
                    x={shape.x} y={shape.y}
                    width={shape.w} height={shape.h}
                    rx={shape.rx ?? 0} ry={shape.ry ?? 0}
                  />
                );
              case "circle":
                return <circle key={i} {...common} cx={shape.cx} cy={shape.cy} r={shape.r} />;
              case "ellipse":
                return <ellipse key={i} {...common} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />;
              case "polygon":
                return <polygon key={i} {...common} points={shape.points} />;
              case "line":
                return (
                  <line key={i} {...common}
                    x1={shape.x1} y1={shape.y1}
                    x2={shape.x2} y2={shape.y2}
                    stroke={shape.stroke ?? common.fill}
                    strokeWidth={shape.strokeWidth ?? 2}
                  />
                );
              case "path":
                return <path key={i} {...common} d={shape.d} />;
              default:
                return null;
            }
          })}
        </svg>
      )}

      {(masterElements?.text ?? []).filter((el) => !el.hidden).map((el) => {
        const fmt = el.paragraphs?.[0]?.formatting ?? {};
        const mf = master?.formatting ?? {};
        const text = extractPlainTextFromParagraphs(el.paragraphs, "\n");
        return (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: el.position?.x ?? 0,
              top: el.position?.y ?? 0,
              width: el.width ?? 300,
              height: el.height ?? 80,
              fontSize: fmt.size ?? mf.size ?? "16px",
              fontWeight: fmt.weight ?? mf.weight ?? "normal",
              fontStyle: (fmt.italics ?? mf.italics) ? "italic" : "normal",
              fontFamily: fmt.font ?? mf.font ?? "inherit",
              color: fmt.color ?? mf.color ?? "var(--text-dark, black)",
              textAlign: fmt.align ?? mf.align ?? "left",
              lineHeight: fmt["line-spacing"] ?? mf["line-spacing"] ?? "1.4",
              background: el.background ?? "transparent",
              overflow: "hidden",
              pointerEvents: "none",
              zIndex: el["z-index"] ?? 5,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              boxSizing: "border-box",
              whiteSpace: "pre-wrap",
            }}
          >
            {text}
          </div>
        );
      })}

      {(masterElements?.media ?? []).filter((el) => !el.hidden).map((el) => (
        <MediaDecorationElement key={el.id} el={el} zIndex={el["z-index"] ?? 5} interactive={interactive} />
      ))}

      {(layoutElements?.text ?? []).filter((el) => !el.hidden && !slideContentIds?.has(el.id)).map((el) => {
        const fmt = el.paragraphs?.[0]?.formatting ?? {};
        const mf = master?.formatting ?? {};
        const text = extractPlainTextFromParagraphs(el.paragraphs, "\n");
        const canPromote = !!onPromoteLayoutElement;
        return (
          <div
            key={el.id}
            onClick={canPromote ? () => onPromoteLayoutElement(el, "text") : undefined}
            style={{
              position: "absolute",
              left: el.position?.x ?? 0,
              top: el.position?.y ?? 0,
              width: el.width ?? 300,
              height: el.height ?? 80,
              fontSize: fmt.size ?? mf.size ?? "16px",
              fontWeight: fmt.weight ?? mf.weight ?? "normal",
              fontStyle: (fmt.italics ?? mf.italics) ? "italic" : "normal",
              fontFamily: fmt.font ?? mf.font ?? "inherit",
              color: fmt.color ?? mf.color ?? "var(--text-dark, black)",
              textAlign: fmt.align ?? mf.align ?? "left",
              lineHeight: fmt["line-spacing"] ?? mf["line-spacing"] ?? "1.4",
              background: el.background ?? "transparent",
              overflow: "hidden",
              pointerEvents: canPromote ? "auto" : "none",
              cursor: canPromote ? "pointer" : undefined,
              zIndex: el["z-index"] ?? 4,
              transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
              boxSizing: "border-box",
              whiteSpace: "pre-wrap",
            }}
          >
            {text}
          </div>
        );
      })}

      {(layoutElements?.media ?? []).filter((el) => !el.hidden && !slideContentIds?.has(el.id)).map((el) => (
        <MediaDecorationElement
          key={el.id}
          el={el}
          zIndex={el["z-index"] ?? 4}
          interactive={interactive}
          onPromote={onPromoteLayoutElement ? () => onPromoteLayoutElement(el, "media") : undefined}
        />
      ))}
    </>
  );
}