export const DESIGN_THEMES = [
  {
    id: "default", name: "Default",
    colorTheme: [
      { "css-variable-name": "bg-light", color: "#FFFFFFFF" },
      { "css-variable-name": "bg-dark", color: "#1E1E2EFF" },
      { "css-variable-name": "text-dark", color: "#111111FF" },
      { "css-variable-name": "text-light", color: "#F8F8F8FF" },
      { "css-variable-name": "accent1", color: "#4F46E5FF" },
      { "css-variable-name": "accent2", color: "#7C3AEDFF" },
      { "css-variable-name": "accent3", color: "#06B6D4FF" },
      { "css-variable-name": "accent4", color: "#10B981FF" },
      { "css-variable-name": "accent5", color: "#F59E0BFF" },
      { "css-variable-name": "accent6", color: "#EF4444FF" },
      { "css-variable-name": "link", color: "#2563EBFF" },
      { "css-variable-name": "link-visited", color: "#7C3AEDFF" },
    ],
    decorations: { shapes: [] },
    preview: { bg: "#FFFFFF", header: "#4F46E5", dots: ["#4F46E5", "#7C3AED", "#06B6D4"] },
  },
  {
    id: "ocean", name: "Ocean",
    colorTheme: [
      { "css-variable-name": "bg-light", color: "#0C2340FF" },
      { "css-variable-name": "bg-dark", color: "#071628FF" },
      { "css-variable-name": "text-dark", color: "#E0F4FFFF" },
      { "css-variable-name": "text-light", color: "#FFFFFFFF" },
      { "css-variable-name": "accent1", color: "#00B4D8FF" },
      { "css-variable-name": "accent2", color: "#0077B6FF" },
      { "css-variable-name": "accent3", color: "#90E0EFFF" },
      { "css-variable-name": "accent4", color: "#48CAE4FF" },
      { "css-variable-name": "accent5", color: "#ADE8F4FF" },
      { "css-variable-name": "accent6", color: "#CAF0F8FF" },
      { "css-variable-name": "link", color: "#90E0EFFF" },
      { "css-variable-name": "link-visited", color: "#48CAE4FF" },
    ],
    decorations: {
      shapes: [
        { type: "polygon", fill: "#0077B6", opacity: 0.5, points: "0,720 0,480 500,720" },
        { type: "polygon", fill: "#00B4D8", opacity: 0.25, points: "0,720 0,580 700,720" },
        { type: "polygon", fill: "#48CAE4", opacity: 0.18, points: "1280,0 900,0 1280,260" },
        { type: "circle", fill: "none", stroke: "#90E0EF", strokeWidth: 3, opacity: 0.3, cx: 1180, cy: 640, r: 60 },
        { type: "circle", fill: "none", stroke: "#90E0EF", strokeWidth: 2, opacity: 0.15, cx: 1180, cy: 640, r: 100 },
      ],
    },
    preview: { bg: "#0C2340", header: "#00B4D8", dots: ["#00B4D8", "#0077B6", "#90E0EF"] },
  },
  {
    id: "forest", name: "Forest",
    colorTheme: [
      { "css-variable-name": "bg-light", color: "#F0F7F0FF" },
      { "css-variable-name": "bg-dark", color: "#1A2E1AFF" },
      { "css-variable-name": "text-dark", color: "#1A2E1AFF" },
      { "css-variable-name": "text-light", color: "#F0FFF0FF" },
      { "css-variable-name": "accent1", color: "#2D6A4FFF" },
      { "css-variable-name": "accent2", color: "#40916CFF" },
      { "css-variable-name": "accent3", color: "#52B788FF" },
      { "css-variable-name": "accent4", color: "#74C69DFF" },
      { "css-variable-name": "accent5", color: "#B7E4C7FF" },
      { "css-variable-name": "accent6", color: "#D8F3DCFF" },
      { "css-variable-name": "link", color: "#2D6A4FFF" },
      { "css-variable-name": "link-visited", color: "#40916CFF" },
    ],
    decorations: {
      shapes: [
        { type: "path", fill: "#2D6A4F", opacity: 0.12, d: "M0,0 L220,0 Q260,360 220,720 L0,720 Z" },
        { type: "path", fill: "#40916C", opacity: 0.15, d: "M0,620 Q640,560 1280,640 L1280,720 L0,720 Z" },
        { type: "circle", fill: "#52B788", opacity: 0.12, cx: 1180, cy: 80, r: 130 },
        { type: "circle", fill: "#74C69D", opacity: 0.18, cx: 1180, cy: 80, r: 70 },
        { type: "line", stroke: "#2D6A4F", strokeWidth: 2, opacity: 0.15, x1: 220, y1: 0, x2: 220, y2: 720 },
      ],
    },
    preview: { bg: "#F0F7F0", header: "#2D6A4F", dots: ["#2D6A4F", "#52B788", "#B7E4C7"] },
  },
  {
    id: "sunset", name: "Sunset",
    colorTheme: [
      { "css-variable-name": "bg-light", color: "#FFF3E0FF" },
      { "css-variable-name": "bg-dark", color: "#3E1C00FF" },
      { "css-variable-name": "text-dark", color: "#3E1C00FF" },
      { "css-variable-name": "text-light", color: "#FFF8F0FF" },
      { "css-variable-name": "accent1", color: "#E85D04FF" },
      { "css-variable-name": "accent2", color: "#F48C06FF" },
      { "css-variable-name": "accent3", color: "#FAA307FF" },
      { "css-variable-name": "accent4", color: "#FFBA08FF" },
      { "css-variable-name": "accent5", color: "#DC2F02FF" },
      { "css-variable-name": "accent6", color: "#9D0208FF" },
      { "css-variable-name": "link", color: "#E85D04FF" },
      { "css-variable-name": "link-visited", color: "#DC2F02FF" },
    ],
    decorations: {
      shapes: [
        { type: "polygon", fill: "#E85D04", opacity: 0.18, points: "1280,0 780,0 1280,420" },
        { type: "polygon", fill: "#FAA307", opacity: 0.15, points: "1280,0 1000,0 1280,220" },
        { type: "polygon", fill: "#DC2F02", opacity: 0.12, points: "0,720 0,440 380,720" },
        { type: "rect", fill: "#E85D04", opacity: 0.6, x: 0, y: 0, w: 1280, h: 8, rx: 0 },
        { type: "rect", fill: "#FFBA08", opacity: 0.4, x: 0, y: 712, w: 1280, h: 8, rx: 0 },
      ],
    },
    preview: { bg: "#FFF3E0", header: "#E85D04", dots: ["#E85D04", "#FAA307", "#FFBA08"] },
  },
  {
    id: "midnight", name: "Midnight",
    colorTheme: [
      { "css-variable-name": "bg-light", color: "#0F0F1EFF" },
      { "css-variable-name": "bg-dark", color: "#07070FFF" },
      { "css-variable-name": "text-dark", color: "#D0D0FFFF" },
      { "css-variable-name": "text-light", color: "#FFFFFFFF" },
      { "css-variable-name": "accent1", color: "#E040FBFF" },
      { "css-variable-name": "accent2", color: "#7C4DFFFF" },
      { "css-variable-name": "accent3", color: "#40C4FFFF" },
      { "css-variable-name": "accent4", color: "#64FFDAFF" },
      { "css-variable-name": "accent5", color: "#FFD740FF" },
      { "css-variable-name": "accent6", color: "#FF6D00FF" },
      { "css-variable-name": "link", color: "#40C4FFFF" },
      { "css-variable-name": "link-visited", color: "#7C4DFFFF" },
    ],
    decorations: {
      shapes: [
        { type: "ellipse", fill: "#7C4DFF", opacity: 0.15, cx: 100, cy: 100, rx: 260, ry: 200 },
        { type: "ellipse", fill: "#E040FB", opacity: 0.12, cx: 1180, cy: 640, rx: 280, ry: 180 },
        { type: "line", stroke: "#7C4DFF", strokeWidth: 1, opacity: 0.12, x1: 0, y1: 180, x2: 1280, y2: 180 },
        { type: "line", stroke: "#7C4DFF", strokeWidth: 1, opacity: 0.12, x1: 0, y1: 360, x2: 1280, y2: 360 },
        { type: "line", stroke: "#7C4DFF", strokeWidth: 1, opacity: 0.12, x1: 0, y1: 540, x2: 1280, y2: 540 },
        { type: "line", stroke: "#E040FB", strokeWidth: 1, opacity: 0.1, x1: 320, y1: 0, x2: 320, y2: 720 },
        { type: "line", stroke: "#E040FB", strokeWidth: 1, opacity: 0.1, x1: 640, y1: 0, x2: 640, y2: 720 },
        { type: "line", stroke: "#E040FB", strokeWidth: 1, opacity: 0.1, x1: 960, y1: 0, x2: 960, y2: 720 },
        { type: "rect", fill: "#40C4FF", opacity: 0.8, x: 0, y: 0, w: 5, h: 720, rx: 0 },
      ],
    },
    preview: { bg: "#0F0F1E", header: "#E040FB", dots: ["#E040FB", "#7C4DFF", "#40C4FF"] },
  },
  {
    id: "rose", name: "Rose Gold",
    colorTheme: [
      { "css-variable-name": "bg-light", color: "#FDF2F8FF" },
      { "css-variable-name": "bg-dark", color: "#4A1942FF" },
      { "css-variable-name": "text-dark", color: "#3B0A35FF" },
      { "css-variable-name": "text-light", color: "#FDF2F8FF" },
      { "css-variable-name": "accent1", color: "#BE185DFF" },
      { "css-variable-name": "accent2", color: "#DB2777FF" },
      { "css-variable-name": "accent3", color: "#EC4899FF" },
      { "css-variable-name": "accent4", color: "#F472B6FF" },
      { "css-variable-name": "accent5", color: "#C9A96EFF" },
      { "css-variable-name": "accent6", color: "#A0522DFF" },
      { "css-variable-name": "link", color: "#BE185DFF" },
      { "css-variable-name": "link-visited", color: "#DB2777FF" },
    ],
    decorations: {
      shapes: [
        { type: "circle", fill: "#F9A8D4", opacity: 0.18, cx: 1180, cy: 360, r: 340 },
        { type: "circle", fill: "none", stroke: "#C9A96E", strokeWidth: 3, opacity: 0.35, cx: 1180, cy: 360, r: 290 },
        { type: "rect", fill: "#BE185D", opacity: 1, x: 0, y: 0, w: 1280, h: 10, rx: 0 },
        { type: "rect", fill: "#C9A96E", opacity: 0.7, x: 0, y: 710, w: 1280, h: 10, rx: 0 },
        { type: "rect", fill: "#EC4899", opacity: 0.12, x: 0, y: 0, w: 180, h: 720, rx: 0 },
        { type: "circle", fill: "#C9A96E", opacity: 0.25, cx: 90, cy: 90, r: 55 },
      ],
    },
    preview: { bg: "#FDF2F8", header: "#BE185D", dots: ["#BE185D", "#EC4899", "#C9A96E"] },
  },
];

// Update a single color-theme entry by css-variable-name, preserving the original alpha channel.
export const updateThemeColor = (colorTheme, cssVariableName, newHex6) => {
  return (colorTheme ?? []).map((entry) => {
    if (entry["css-variable-name"] !== cssVariableName) return entry;
    const alpha =
      typeof entry.color === "string" && entry.color.length === 9
        ? entry.color.slice(7)
        : "FF";
    return { ...entry, color: `${newHex6}${alpha}` };
  });
};

// Return a new colorTheme array with the bg-light entry updated to the given 9-digit hex color.
export const updateThemeBackground = (colorTheme, hex9Color) =>
  (colorTheme ?? []).map((e) =>
    e["css-variable-name"] === "bg-light" ? { ...e, color: hex9Color } : e,
  );

export const findActiveTheme = (colorTheme) => {
  const currentAccent1 = (colorTheme ?? []).find(
    (e) => e["css-variable-name"] === "accent1",
  )?.color ?? "";
  return DESIGN_THEMES.find((t) => {
    const a1 = t.colorTheme.find((e) => e["css-variable-name"] === "accent1")?.color ?? "";
    return a1.slice(0, 7).toLowerCase() === currentAccent1.slice(0, 7).toLowerCase();
  }) ?? null;
};
