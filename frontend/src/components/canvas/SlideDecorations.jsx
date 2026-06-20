export default function SlideDecorations({ presentation, width, height }) {
  const decorations = presentation?.slideset?.master?.decorations;
  if (!decorations?.shapes?.length) return null;

  return (
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
      viewBox={`0 0 ${width} ${height}`}
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
              <rect
                key={i}
                {...common}
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
              <line
                key={i}
                {...common}
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
  );
}