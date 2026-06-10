import "./GlobalSettingsPanel.css";

const TRANSITIONS = ["slide", "fade", "convex", "concave", "zoom", "none"];
const ASPECT_RATIOS = [
  { label: "16:9", width: 1280, height: 720 },
  { label: "4:3", width: 1024, height: 768 },
];

export default function GlobalSettingsPanel({ presentation, updateMasterDimensions, updateSlideTransition }) {
  const master = presentation?.slideset?.master ?? {};
  const currentAspectRatio = master["aspect-ratio"] ?? "16:9";
  const currentWidth = master["slide-dimensions"]?.width ?? 1280;
  const currentHeight = master["slide-dimensions"]?.height ?? 720;

  const handleAspectRatioChange = (e) => {
    const selected = ASPECT_RATIOS.find((r) => r.label === e.target.value);
    if (selected) {
      updateMasterDimensions(
        { width: selected.width, height: selected.height },
        selected.label
      );
    }
  };

  const handleTransitionChange = (e) => {
    updateSlideTransition(e.target.value);
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
        <label className="global-settings-label">Slide Transition</label>
        <select
          className="global-settings-select"
          defaultValue="slide"
          onChange={handleTransitionChange}
        >
          {TRANSITIONS.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="global-settings-info">
        <span>Size: {currentWidth}×{currentHeight}px</span>
      </div>
    </div>
  );
}