import { useMediaSrc } from "../../hooks/useMediaSrc";
import { extractPlainTextFromParagraphs } from "../../core/text/textFormatting";

function MasterMediaImage({ el }) {
  const resolvedSrc = useMediaSrc(el["file-link"]);

  return (
    <img
      src={el.src ?? resolvedSrc}
      alt=""
      style={{
        position: "absolute",
        left: el.position?.x ?? 0,
        top: el.position?.y ?? 0,
        width: el.width ?? 200,
        height: el.height ?? 120,
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: el["z-index"] ?? 5,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      }}
    />
  );
}

function LayoutMediaImage({ el }) {
  const resolvedSrc = useMediaSrc(el["file-link"]);
  return (
    <img
      src={el.src ?? resolvedSrc}
      alt=""
      style={{
        position: "absolute",
        left: el.position?.x ?? 0,
        top: el.position?.y ?? 0,
        width: el.width ?? 200,
        height: el.height ?? 120,
        objectFit: "contain",
        pointerEvents: "none",
        zIndex: el["z-index"] ?? 4,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      }}
    />
  );
}

export default function SlideDecorations({ presentation, width, height, hideMasterElements = false, layoutId }) {
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
          viewBox="0 0 1280 720"
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

      {(masterElements?.text ?? []).map((el) => {
        const fmt = el.paragraphs?.[0]?.formatting ?? {};
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
              fontSize: fmt.size ?? "16px",
              fontWeight: fmt.weight ?? "normal",
              fontStyle: fmt.italics ? "italic" : "normal",
              fontFamily: fmt.font ?? master?.formatting?.font ?? "inherit",
              color: fmt.color ?? "var(--text-dark, black)",
              textAlign: fmt.align ?? "left",
              lineHeight: fmt["line-spacing"] ?? "1.4",
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

      {(masterElements?.media ?? []).map((el) => (
        <MasterMediaImage key={el.id} el={el} />
      ))}

      {(layoutElements?.text ?? []).map((el) => {
        const fmt = el.paragraphs?.[0]?.formatting ?? {};
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
              fontSize: fmt.size ?? "16px",
              fontWeight: fmt.weight ?? "normal",
              fontStyle: fmt.italics ? "italic" : "normal",
              fontFamily: fmt.font ?? master?.formatting?.font ?? "inherit",
              color: fmt.color ?? "var(--text-dark, black)",
              textAlign: fmt.align ?? "left",
              lineHeight: fmt["line-spacing"] ?? "1.4",
              background: el.background ?? "transparent",
              overflow: "hidden",
              pointerEvents: "none",
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

      {(layoutElements?.media ?? []).map((el) => (
        <LayoutMediaImage key={el.id} el={el} />
      ))}
    </>
  );
}