import "./GlobalSettingsPanel.css";

const TRANSITIONS = ["slide", "fade", "convex", "concave", "zoom", "none"];
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

export default function GlobalSettingsPanel({
    presentation,
    updateMasterDimensions,
    updateSlideTransition,
    updateMasterTheme,
}) {
    const master = presentation?.slideset?.master ?? {};
    const currentAspectRatio = master["aspect-ratio"] ?? "16:9";
    const currentWidth = master["slide-dimensions"]?.width ?? 1280;
    const currentHeight = master["slide-dimensions"]?.height ?? 720;
    const colorTheme = (master["color-theme"] ?? DEFAULT_COLOR_THEME).map((entry) => ({
        ...entry,
        color: entry.color?.length === 9 ? entry.color.slice(0, 7) : (entry.color ?? "#000000"),
    }));

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

    const handleColorChange = (cssVariableName, newColor) => {
        if (!updateMasterTheme) return;
        const color6 = newColor.length === 9
            ? newColor.slice(0, 7)
            : newColor;
        const updatedTheme = colorTheme.map((entry) =>
            entry["css-variable-name"] === cssVariableName
                ? { ...entry, color: color6 }
                : entry
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
                <span>Size: {currentWidth}×{currentHeight}px</span>
            </div>
        </div>
    );
}