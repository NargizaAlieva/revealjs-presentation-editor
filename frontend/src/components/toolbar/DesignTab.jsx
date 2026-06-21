import { useState, useEffect, useRef } from "react";
import "./DesignTab.css";
import { DEFAULT_FONTS } from "./homeTabConstants";
import { toHex6, toHex9 } from "../../core/utils/colorUtils";
import { DESIGN_THEMES, findActiveTheme, updateThemeBackground } from "../../core/model/designThemes";
import { SLIDE_SIZES, clampSlideDimension } from "../../core/model/slideSizes";

const THEME_PALETTE_COLUMNS = [
    ["#FFFFFF", "#F2F2F2", "#D9D9D9", "#BFBFBF", "#A6A6A6", "#808080"],
    ["#000000", "#808080", "#595959", "#404040", "#262626", "#0D0D0D"],
    ["#E7E6E6", "#CFCECE", "#AEABAB", "#757070", "#3B3838", "#191718"],
    ["#44546A", "#D6DCE4", "#ADB9CA", "#8497B0", "#2E74B5", "#1F4E79"],
    ["#4472C4", "#D9E2F3", "#B4C7E7", "#2F75B6", "#1F4E79", "#0D2B4A"],
    ["#ED7D31", "#FCE4D6", "#F8CBAD", "#F4B183", "#C55A11", "#843C0C"],
    ["#A9D18E", "#E2EFD9", "#C6E0B4", "#70AD47", "#375623", "#1E3A14"],
    ["#FFD700", "#FFF2CC", "#FFE699", "#FFD966", "#BF8F00", "#7F6000"],
    ["#FF0000", "#FFCCCC", "#FF9999", "#FF6666", "#C00000", "#800000"],
    ["#7030A0", "#E2CEED", "#C39BD3", "#A569BD", "#512D6D", "#311B4E"],
];

const STANDARD_COLORS = [
    "#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050",
    "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0",
];


export function ColorPalettePopup({ currentColor, onSelect, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", fn, true);
        return () => document.removeEventListener("mousedown", fn, true);
    }, [onClose]);

    return (
        <div className="bg-palette-popup" ref={ref}>
            <div className="bg-palette-section-label">Theme Colors</div>
            <div className="bg-palette-grid">
                {THEME_PALETTE_COLUMNS.map((col, ci) =>
                    col.map((color, ri) => (
                        <button
                            key={`${ci}-${ri}`}
                            className={`bg-palette-swatch${toHex6(currentColor).toLowerCase() === color.toLowerCase() ? " selected" : ""}`}
                            style={{ background: color }}
                            title={color}
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onClick={() => { onSelect(color); onClose(); }}
                        />
                    ))
                )}
            </div>
            <div className="bg-palette-section-label" style={{ marginTop: 10 }}>Standard Colors</div>
            <div className="bg-palette-standard-row">
                {STANDARD_COLORS.map((color) => (
                    <button
                        key={color}
                        className={`bg-palette-swatch${toHex6(currentColor).toLowerCase() === color.toLowerCase() ? " selected" : ""}`}
                        style={{ background: color }}
                        title={color}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={() => { onSelect(color); onClose(); }}
                    />
                ))}
            </div>
            <div className="bg-palette-more-row">
                <label className="bg-palette-more-btn">
                    🎨 More Colors...
                    <input type="color" value={toHex6(currentColor)} className="design-bg-input"
                        onChange={(e) => onSelect(e.target.value)} />
                </label>
            </div>
        </div>
    );
}

function renderShapes(shapes) {
    return shapes.map((s, i) => {
        const base = { fill: s.fill ?? "none", stroke: s.stroke ?? "none", strokeWidth: s.strokeWidth ?? 0, opacity: s.opacity ?? 1 };
        switch (s.type) {
            case "rect": return <rect key={i} {...base} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx ?? 0} />;
            case "circle": return <circle key={i} {...base} cx={s.cx} cy={s.cy} r={s.r} />;
            case "ellipse": return <ellipse key={i} {...base} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
            case "polygon": return <polygon key={i} {...base} points={s.points} />;
            case "path": return <path key={i} {...base} d={s.d} />;
            case "line": return <line key={i} stroke={s.stroke ?? s.fill ?? "none"} strokeWidth={s.strokeWidth ?? 2} opacity={s.opacity ?? 1} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />;
            default: return null;
        }
    });
}

function ThemeThumbnail({ theme, isActive, onClick }) {
    const { bg, header, dots } = theme.preview;
    return (
        <button
            className={`design-theme-thumb${isActive ? " active" : ""}`}
            onClick={() => onClick(theme)}
            title={theme.name}
        >
            <div className="thumb-slide" style={{ background: bg }}>
                <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}
                    viewBox="0 0 1280 720" preserveAspectRatio="none">
                    {renderShapes(theme.decorations?.shapes ?? [])}
                </svg>
                <div className="thumb-header" style={{ background: header }} />
                <div className="thumb-lines">
                    <div className="thumb-line" style={{ background: header + "66", width: "65%" }} />
                    <div className="thumb-line" style={{ background: header + "44", width: "45%" }} />
                </div>
                <div className="thumb-dots">
                    {dots.map((color, i) => <span key={i} className="thumb-dot" style={{ background: color }} />)}
                </div>
            </div>
            <span className="thumb-label">{theme.name}</span>
        </button>
    );
}

function RightPanel({ presentation, onApplyTheme, onApplyFont, onUpdateDimensions }) {
    const [showPalette, setShowPalette] = useState(false);
    const [showSizeMenu, setShowSizeMenu] = useState(false);
    const [showCustomSize, setShowCustomSize] = useState(false);
    const sizeRef = useRef(null);

    const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
    const currentFont = presentation?.slideset?.master?.formatting?.font ?? "Arial";
    const bgEntry = colorTheme.find(e => e["css-variable-name"] === "bg-light");
    const bgColor = toHex6(bgEntry?.color ?? "#ffffff");

    const currentW = presentation?.slideset?.master?.["slide-dimensions"]?.width ?? 1280;
    const currentH = presentation?.slideset?.master?.["slide-dimensions"]?.height ?? 720;
    const [customW, setCustomW] = useState(currentW);
    const [customH, setCustomH] = useState(currentH);

    useEffect(() => {
        const fn = (e) => {
            if (sizeRef.current && !sizeRef.current.contains(e.target)) {
                setShowSizeMenu(false);
                setShowCustomSize(false);
            }
        };
        document.addEventListener("mousedown", fn, true);
        return () => document.removeEventListener("mousedown", fn, true);
    }, []);

    const applyBg = (hex6) =>
        onApplyTheme(updateThemeBackground(colorTheme, toHex9(hex6)), presentation?.slideset?.master?.decorations);

    const applyPreset = (size) => {
        onUpdateDimensions({ width: size.width, height: size.height }, size.aspectRatio, "px");
        setShowSizeMenu(false);
    };

    const applyCustom = () => {
        const w = clampSlideDimension(customW, 1280);
        const h = clampSlideDimension(customH, 720);
        onUpdateDimensions({ width: w, height: h }, "custom", "px");
        setShowSizeMenu(false);
        setShowCustomSize(false);
    };

    const currentPreset = SLIDE_SIZES.find(s => s.width === currentW && s.height === currentH);
    const sizeLabel = currentPreset ? currentPreset.aspectRatio : "Custom";

    return (
        <div className="design-right-panel">

            {/* ── Customize ── */}
            <div className="design-right-section">
                <div className="design-section-title">Customize</div>

                <div className="design-customize-row">
                    <span className="design-customize-label">Background</span>
                    <div className="design-bg-wrapper">
                        <button className="design-bg-swatch-btn" onClick={() => setShowPalette(v => !v)}>
                            <span className="design-bg-swatch" style={{ background: bgColor }} />
                            <span className="design-bg-arrow">▾</span>
                        </button>
                        {showPalette && (
                            <ColorPalettePopup currentColor={bgColor} onSelect={applyBg} onClose={() => setShowPalette(false)} />
                        )}
                    </div>
                </div>

                <div className="design-customize-row">
                    <span className="design-customize-label">Fonts</span>
                    <select
                        className="design-font-select"
                        value={currentFont}
                        onChange={(e) => { e.stopPropagation(); onApplyFont({ font: e.target.value }); }}
                    >
                        {DEFAULT_FONTS.map(f => (
                            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                        ))}
                    </select>
                </div>

                <span className="ribbon-group-title">Customize</span>
            </div>

            <div className="design-right-divider" />

            {/* ── Slide Size ── */}
            <div className="design-right-section">
                <div className="design-section-title">Slide Size</div>

                <div className="design-customize-row">
                    <span className="design-customize-label">Size</span>
                    <div className="design-slide-size-wrap" ref={sizeRef}>
                        <button
                            className="design-slide-size-btn"
                            onClick={() => { setShowSizeMenu(v => !v); setShowCustomSize(false); }}
                        >
                            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                                <rect x="0.5" y="0.5" width="19" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                                <line x1="0.5" y1="3.5" x2="19.5" y2="3.5" stroke="currentColor" strokeWidth="0.8" />
                            </svg>
                            <span>{sizeLabel}</span>
                            <span className="design-slide-size-dim">{currentW}×{currentH}</span>
                            <span className="design-slide-size-arrow">▾</span>
                        </button>

                        {showSizeMenu && (
                            <div className="slide-size-dropdown">
                                {SLIDE_SIZES.map((size) => {
                                    const isActive = size.width === currentW && size.height === currentH;
                                    return (
                                        <button
                                            key={size.label}
                                            className={`slide-size-option${isActive ? " active" : ""}`}
                                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                            onClick={() => applyPreset(size)}
                                        >
                                            <div className="slide-size-option-icon">
                                                <svg width={size.aspectRatio === "16:9" ? 32 : 26} height={size.aspectRatio === "16:9" ? 18 : 20} viewBox="0 0 32 18" fill="none">
                                                    <rect x="0.5" y="0.5" width="31" height="17" rx="1" stroke="#666" strokeWidth="1" fill="#f8f8f8" />
                                                </svg>
                                            </div>
                                            <div className="slide-size-option-text">
                                                <span className="slide-size-option-label">{size.label}</span>
                                                <span className="slide-size-option-dim">{size.width} × {size.height} px</span>
                                            </div>
                                            {isActive && <span className="slide-size-check">✓</span>}
                                        </button>
                                    );
                                })}

                                <div className="slide-size-divider" />

                                <button
                                    className="slide-size-option slide-size-custom-btn"
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    onClick={() => setShowCustomSize(v => !v)}
                                >
                                    <span>⚙ Custom Slide Size...</span>
                                </button>

                                {showCustomSize && (
                                    <div className="slide-size-custom-form">
                                        <label className="slide-size-custom-row">
                                            <span>Width (px)</span>
                                            <input type="number" value={customW} min={100} max={9999}
                                                onChange={(e) => setCustomW(e.target.value)} className="slide-size-custom-input" />
                                        </label>
                                        <label className="slide-size-custom-row">
                                            <span>Height (px)</span>
                                            <input type="number" value={customH} min={100} max={9999}
                                                onChange={(e) => setCustomH(e.target.value)} className="slide-size-custom-input" />
                                        </label>
                                        <button className="slide-size-custom-apply" onClick={applyCustom}>Apply</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <span className="ribbon-group-title">Slide Size</span>
            </div>

        </div>
    );
}

export default function DesignTab({ presentation, onApplyTheme, onApplyFont, onUpdateDimensions }) {
    const currentTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
    const activeTheme = findActiveTheme(currentTheme);

    return (
        <div className="design-tab-wrapper">
            <div className="ribbon-group design-tab-group">
                <div className="design-themes-row">
                    {DESIGN_THEMES.map((theme) => (
                        <ThemeThumbnail
                            key={theme.id}
                            theme={theme}
                            isActive={theme.id === activeTheme?.id}
                            onClick={(t) => onApplyTheme(t.colorTheme, t.decorations)}
                        />
                    ))}
                </div>
                <span className="ribbon-group-title">Themes</span>
            </div>

            <div className="design-tab-divider" />

            <RightPanel
                presentation={presentation}
                onApplyTheme={onApplyTheme}
                onApplyFont={onApplyFont}
                onUpdateDimensions={onUpdateDimensions}
            />
        </div>
    );
}