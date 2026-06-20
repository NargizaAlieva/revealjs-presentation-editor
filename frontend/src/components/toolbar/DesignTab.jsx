import { useState, useEffect, useRef } from "react";
import "./DesignTab.css";
import { DEFAULT_FONTS } from "./homeTabConstants";

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

const SLIDE_SIZES = [
    { label: "Widescreen (16:9)", aspectRatio: "16:9", width: 1280, height: 720 },
    { label: "Standard (4:3)", aspectRatio: "4:3", width: 1024, height: 768 },
];

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

function toHex6(color) {
    if (typeof color === "string" && color.length === 9) return color.slice(0, 7);
    return color ?? "#ffffff";
}

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

    const applyBg = (hex6) => {
        const newColor = (hex6.length === 7 ? hex6 : hex6.slice(0, 7)) + "FF";
        const updated = colorTheme.map(e =>
            e["css-variable-name"] === "bg-light" ? { ...e, color: newColor } : e
        );
        onApplyTheme(updated, presentation?.slideset?.master?.decorations);
    };

    const applyPreset = (size) => {
        onUpdateDimensions({ width: size.width, height: size.height }, size.aspectRatio, "px");
        setShowSizeMenu(false);
    };

    const applyCustom = () => {
        const w = Math.max(100, parseInt(customW) || 1280);
        const h = Math.max(100, parseInt(customH) || 720);
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
    const currentAccent1 = currentTheme.find(e => e["css-variable-name"] === "accent1")?.color ?? "";

    const activeTheme = DESIGN_THEMES.find((t) => {
        const a1 = t.colorTheme.find(e => e["css-variable-name"] === "accent1")?.color ?? "";
        return a1.slice(0, 7).toLowerCase() === currentAccent1.slice(0, 7).toLowerCase();
    }) ?? null;

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