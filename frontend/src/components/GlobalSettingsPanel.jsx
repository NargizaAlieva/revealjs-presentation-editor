import "./GlobalSettingsPanel.css";

const ASPECT_RATIOS = [
  { label: "16:9", width: 1280, height: 720 },
  { label: "4:3", width: 1024, height: 768 },
];

const DEFAULT_COLOR_THEME = [
  { "css-variable-name": "bg-light", color: "#ffffff" },
  { "css-variable-name": "bg-dark", color: "#191919" },
  { "css-variable-name": "text-dark", color: "#000000" },
  { "css-variable-name": "text-light", color: "#ffffff" },
  { "css-variable-name": "accent1", color: "#4f46e5" },
  { "css-variable-name": "accent2", color: "#7c3aed" },
];

// Color inputs only support 6-char hex (#RRGGBB). Strip alpha if present (#RRGGBBAA → #RRGGBB).
const toHex6 = (color) =>
  typeof color === "string" && color.length === 9
    ? color.slice(0, 7)
    : (color ?? "#000000");

export default function GlobalSettingsPanel({
  presentation,
  updateMasterDimensions,
  updateMasterTheme,
}) {
  const master = presentation?.slideset?.master ?? {};
  const currentAspectRatio = master["aspect-ratio"] ?? "16:9";
  const currentWidth = master["slide-dimensions"]?.width ?? 1280;
  const currentHeight = master["slide-dimensions"]?.height ?? 720;

  const colorTheme = (master["color-theme"] ?? DEFAULT_COLOR_THEME).map(
    (entry) => ({
      ...entry,
      color: toHex6(entry.color),
    }),
  );

  const handleAspectRatioChange = (e) => {
    const selected = ASPECT_RATIOS.find((r) => r.label === e.target.value);
    if (selected) {
      updateMasterDimensions(
        { width: selected.width, height: selected.height },
        selected.label,
        "px",
      );
    }
  };

  const handleColorChange = (cssVariableName, newColor) => {
    const originalRaw = (master["color-theme"] ?? DEFAULT_COLOR_THEME).find(
      (entry) => entry["css-variable-name"] === cssVariableName,
    )?.color;

    const alpha =
      typeof originalRaw === "string" && originalRaw.length === 9
        ? originalRaw.slice(7)
        : "FF";

    const updatedTheme = colorTheme.map((entry) =>
      entry["css-variable-name"] === cssVariableName
        ? { ...entry, color: `${newColor}${alpha}` }
        : entry,
    );
    updateMasterTheme(updatedTheme);
  };

  return (
    <div className="global-settings-panel">
      <h3 className="global-settings-title">Presentation Settings</h3>

      <div className="global-settings-row">
        <label className="global-settings-label">Aspect Ratio</label>
        <select
          className="global-settings-select"
          value={currentAspectRatio}
          onChange={handleAspectRatioChange}
        >
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.label} value={ratio.label}>
              {ratio.label} ({ratio.width}×{ratio.height})
            </option>
          ))}
        </select>
      </div>

      <div className="global-settings-row">
        <label className="global-settings-label">Color Theme</label>
        {colorTheme.map((entry) => (
          <div key={entry["css-variable-name"]} className="color-theme-row">
            <span className="color-theme-name">
              {entry["css-variable-name"]}
            </span>
            <input
              type="color"
              value={entry.color}
              onChange={(e) =>
                handleColorChange(entry["css-variable-name"], e.target.value)
              }
              className="color-theme-picker"
            />
          </div>
        ))}
      </div>

      <div className="global-settings-info">
        <span>
          Size: {currentWidth}×{currentHeight}px
        </span>
      </div>
    </div>
  );
}
