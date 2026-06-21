import "./GlobalSettingsPanel.css";
import { normalizeColorTheme } from "../core/utils/colorUtils";
import { ASPECT_RATIOS } from "../core/model/slideSizes";
import { DEFAULT_COLOR_THEME } from "../core/model/designThemes";

export default function GlobalSettingsPanel({
  presentation,
  updateMasterDimensions,
  onColorChange,
}) {
  const master = presentation?.slideset?.master ?? {};
  const currentAspectRatio = master["aspect-ratio"] ?? "16:9";
  const currentWidth = master["slide-dimensions"]?.width ?? 1280;
  const currentHeight = master["slide-dimensions"]?.height ?? 720;

  const colorTheme = normalizeColorTheme(master["color-theme"] ?? DEFAULT_COLOR_THEME);

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
              onChange={(e) => onColorChange?.(entry["css-variable-name"], e.target.value)}
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
