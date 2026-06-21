export const renderShapes = (shapes) =>
  (shapes ?? []).map((s, i) => {
    const base = {
      fill: s.fill ?? "none",
      stroke: s.stroke ?? "none",
      strokeWidth: s.strokeWidth ?? 0,
      opacity: s.opacity ?? 1,
    };
    switch (s.type) {
      case "rect":    return <rect    key={i} {...base} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} />;
      case "circle":  return <circle  key={i} {...base} cx={s.cx} cy={s.cy} r={s.r} />;
      case "ellipse": return <ellipse key={i} {...base} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
      case "polygon": return <polygon key={i} {...base} points={s.points} />;
      case "path":    return <path    key={i} {...base} d={s.d} />;
      case "line":    return <line    key={i} stroke={s.stroke ?? s.fill ?? "none"} strokeWidth={s.strokeWidth ?? 2} opacity={s.opacity ?? 1} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />;
      default:        return null;
    }
  });
