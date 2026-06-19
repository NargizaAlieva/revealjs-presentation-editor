import { useState, useCallback, useRef, useEffect } from "react";
import "./SlideMasterView.css";
import { buildColorThemeStyle } from "../core/render/revealRenderer";
import SlideDecorations from "./canvas/SlideDecorations";
import EditorCanvas from "./EditorCanvas";
import DesignTab, { DESIGN_THEMES } from "./toolbar/DesignTab";
import { createPlaceholderPseudoElement } from "../core/operations/layoutOperations";

function renderShapes(shapes) {
  return shapes.map((s, i) => {
    const base = {
      fill: s.fill ?? "none",
      stroke: s.stroke ?? "none",
      strokeWidth: s.strokeWidth ?? 0,
      opacity: s.opacity ?? 1,
    };
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

function ThemeThumbnailMini({ theme, isActive, onClick }) {
  const { bg, header, dots } = theme.preview;
  return (
    <button
      className={`sm-theme-thumb${isActive ? " active" : ""}`}
      onClick={() => onClick(theme)}
      title={theme.name}
    >
      <div className="sm-thumb-slide" style={{ background: bg }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}
          viewBox="0 0 1280 720" preserveAspectRatio="none">
          {renderShapes(theme.decorations?.shapes ?? [])}
        </svg>
        <div className="sm-thumb-header" style={{ background: header }} />
        <div className="sm-thumb-lines">
          <div className="sm-thumb-line" style={{ background: header + "66", width: "65%" }} />
          <div className="sm-thumb-line" style={{ background: header + "44", width: "45%" }} />
        </div>
        <div className="sm-thumb-dots">
          {dots.map((color, i) => (
            <span key={i} className="sm-thumb-dot" style={{ background: color }} />
          ))}
        </div>
      </div>
      <span className="sm-thumb-label">{theme.name}</span>
    </button>
  );
}

function ThemesDropdown({ presentation, onApplyTheme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
  const currentAccent1 = currentTheme.find(e => e["css-variable-name"] === "accent1")?.color ?? "";
  const activeTheme = DESIGN_THEMES.find((t) => {
    const a1 = t.colorTheme.find(e => e["css-variable-name"] === "accent1")?.color ?? "";
    return a1.slice(0, 7).toLowerCase() === currentAccent1.slice(0, 7).toLowerCase();
  }) ?? null;

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn, true);
    return () => document.removeEventListener("mousedown", fn, true);
  }, []);

  const active = activeTheme ?? DESIGN_THEMES[0];
  const { bg, header, dots } = active.preview;

  return (
    <div className="sm-themes-wrap" ref={ref}>
      <button
        className={`master-ribbon-btn master-ribbon-btn--large sm-themes-btn${open ? " open" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="Themes"
      >
        <div className="sm-themes-preview" style={{ background: bg }}>
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "hidden" }}
            viewBox="0 0 1280 720" preserveAspectRatio="none">
            {renderShapes(active.decorations?.shapes ?? [])}
          </svg>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30%", background: header, zIndex: 1 }} />
          <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", gap: 2, zIndex: 1 }}>
            {dots.map((c, i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: c, display: "inline-block" }} />
            ))}
          </div>
        </div>
        <span>Themes<br />▾</span>
      </button>

      {open && (
        <div className="sm-themes-dropdown">
          <div className="sm-themes-dropdown-title">This Presentation</div>
          {activeTheme && (
            <div className="sm-themes-section">
              <ThemeThumbnailMini
                theme={activeTheme}
                isActive={true}
                onClick={(t) => { onApplyTheme(t.colorTheme, t.decorations); setOpen(false); }}
              />
            </div>
          )}
          <div className="sm-themes-dropdown-title" style={{ marginTop: 8 }}>All Themes</div>
          <div className="sm-themes-grid">
            {DESIGN_THEMES.map((theme) => (
              <ThemeThumbnailMini
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeTheme?.id}
                onClick={(t) => { onApplyTheme(t.colorTheme, t.decorations); setOpen(false); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SLIDE_SIZES = [
  { label: "Widescreen (16:9)", aspectRatio: "16:9", width: 1280, height: 720 },
  { label: "Standard (4:3)", aspectRatio: "4:3", width: 1024, height: 768 },
];

function SlideSizeDropdown({ presentation, onUpdateDimensions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentW = presentation?.slideset?.master?.["slide-dimensions"]?.width ?? 1280;
  const currentH = presentation?.slideset?.master?.["slide-dimensions"]?.height ?? 720;
  const currentPreset = SLIDE_SIZES.find(s => s.width === currentW && s.height === currentH);
  const sizeLabel = currentPreset ? currentPreset.aspectRatio : "Custom";

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn, true);
    return () => document.removeEventListener("mousedown", fn, true);
  }, []);

  return (
    <div className="sm-themes-wrap" ref={ref}>
      <button
        className={`master-ribbon-btn master-ribbon-btn--large sm-themes-btn${open ? " open" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="Slide Size"
      >
        <svg width="32" height="22" viewBox="0 0 32 22" fill="none">
          <rect x="0.5" y="0.5" width="31" height="21" rx="1.5" stroke="#4472c4" strokeWidth="1.2" fill="#dce6f4" />
          <line x1="0.5" y1="4.5" x2="31.5" y2="4.5" stroke="#4472c4" strokeWidth="0.8" />
        </svg>
        <span>Slide<br />Size ▾</span>
      </button>

      {open && (
        <div className="sm-themes-dropdown" style={{ minWidth: 220 }}>
          {SLIDE_SIZES.map((size) => {
            const isActive = size.width === currentW && size.height === currentH;
            return (
              <button
                key={size.label}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", background: isActive ? "#eef1f6" : "none",
                  border: "none", padding: "8px 10px", cursor: "pointer",
                  borderRadius: 3, fontFamily: "inherit", fontSize: 12,
                }}
                onClick={() => {
                  onUpdateDimensions({ width: size.width, height: size.height }, size.aspectRatio, "px");
                  setOpen(false);
                }}
              >
                <svg width={size.aspectRatio === "16:9" ? 28 : 22} height={16} viewBox="0 0 28 16" fill="none">
                  <rect x="0.5" y="0.5" width="27" height="15" rx="1" stroke="#666" strokeWidth="1" fill="#f8f8f8" />
                </svg>
                <span>{size.label}</span>
                {isActive && <span style={{ marginLeft: "auto", color: "#4472c4" }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MasterThumb({ label, isSelected, onClick, presentation, layout, isMaster }) {
  const colorThemeStyle = buildColorThemeStyle(presentation);
  const dims = presentation?.slideset?.master?.["slide-dimensions"];
  const width = dims?.width ?? 1280;
  const height = dims?.height ?? 720;
  const THUMB_W = isMaster ? 160 : 140;
  const scale = THUMB_W / width;
  const thumbH = height * scale;
  const bgColor = presentation?.slideset?.master?.["color-theme"]
    ?.find((e) => e["css-variable-name"] === "bg-light")?.color ?? "#fff";

  return (
    <div
      className={`master-thumb-wrap${isSelected ? " selected" : ""}${isMaster ? " is-master" : " is-layout"}`}
      onClick={onClick}
    >
      <div className="master-thumb-frame" style={{ ...colorThemeStyle, width: THUMB_W, height: thumbH }}>
        <div style={{
          position: "relative", width, height,
          transform: `scale(${scale})`, transformOrigin: "top left",
          background: bgColor.replace(/FF$/, ""), overflow: "hidden",
        }}>
          <SlideDecorations presentation={presentation} width={width} height={height} layoutId={layout?.["layout-id"]} />
          {(layout?.placeholders ?? []).map((ph, i) => {
            const pseudo = createPlaceholderPseudoElement(ph, presentation?.slideset?.master?.formatting ?? {});
            if (ph.type === "text") {
              const fmt = pseudo.paragraphs?.[0]?.formatting ?? {};
              return (
                <div key={i} style={{
                  position: "absolute",
                  left: ph.position?.x ?? 0,
                  top: ph.position?.y ?? 0,
                  width: ph.width,
                  height: ph.height,
                  border: "1px dashed rgba(80,80,80,0.4)",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  fontSize: fmt.size ?? "16px",
                  fontWeight: fmt.weight ?? "normal",
                  fontFamily: fmt.font ?? "inherit",
                  color: fmt.color ?? "var(--text-dark)",
                  textAlign: fmt.align ?? "left",
                  padding: "4px 8px",
                }}>
                  {pseudo.paragraphs?.[0]?.runs?.[0]?.text ?? ""}
                </div>
              );
            }
            return (
              <div key={i} style={{
                position: "absolute",
                left: ph.position?.x ?? 0,
                top: ph.position?.y ?? 0,
                width: ph.width,
                height: ph.height,
                border: "1px dashed rgba(80,80,80,0.4)",
                boxSizing: "border-box",
                background: "rgba(200,200,200,0.15)",
              }} />
            );
          })}
        </div>
      </div>
      <span className="master-thumb-label">
        {isMaster ? label : (layout?.name ?? layout?.["layout-id"] ?? label)}
      </span>
    </div>
  );
}

export function SlideMasterRibbon({
  onClose, presentation, onApplyTheme, onApplyFont, onUpdateDimensions,
  masterName, onRenameMaster, selectedMasterLayoutId, onRenameLayout,
  onDeleteLayout, onAddLayoutPlaceholder, onRemoveLayoutPlaceholder,
  onAddTextElement, onImageUpload, onVideoUpload,
}) {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [renaming, setRenaming] = useState(false);
  const [showPlaceholderMenu, setShowPlaceholderMenu] = useState(false);
  const placeholderBtnRef = useRef(null);
  const placeholderMenuRef = useRef(null);
  const isRenamingLayout = !!selectedMasterLayoutId;
  const selectedLayout = selectedMasterLayoutId
    ? (presentation?.slideset?.layouts ?? []).find((l) => l["layout-id"] === selectedMasterLayoutId)
    : null;

  const layoutPlaceholders = selectedLayout?.placeholders ?? [];
  const hasTitle = layoutPlaceholders.some((p) => p.role === "title");
  const hasFooters = layoutPlaceholders.some((p) => p["placeholder-id"]?.startsWith("footer-"));

  const TITLE_PLACEHOLDER = {
    "placeholder-id": "title-placeholder",
    position: { x: 120, y: 60 },
    width: 1040,
    height: 110,
    type: "text",
    role: "title",
    padding: { css: "8px" },
    background: "#FFFFFF00",
    formatting: { size: "36px", weight: "bold", align: "center" },
  };

  const FOOTER_PLACEHOLDERS = [
    { "placeholder-id": "footer-date", position: { x: 60, y: 640 }, width: 260, height: 40, type: "text", role: "footer", padding: { css: "4px" }, background: "#FFFFFF00", formatting: { size: "20px", align: "center" }, promptText: "Date" },
    { "placeholder-id": "footer-center", position: { x: 380, y: 640 }, width: 520, height: 40, type: "text", role: "footer", padding: { css: "4px" }, background: "#FFFFFF00", formatting: { size: "20px", align: "center" }, promptText: "Footer" },
    { "placeholder-id": "footer-page", position: { x: 960, y: 640 }, width: 260, height: 40, type: "text", role: "footer", padding: { css: "4px" }, background: "#FFFFFF00", formatting: { size: "20px", align: "center" }, promptText: "#" },
  ];

  const handleToggleTitle = () => {
    if (!selectedMasterLayoutId) return;
    if (hasTitle) {
      onRemoveLayoutPlaceholder?.(selectedMasterLayoutId, "title-placeholder");
    } else {
      onAddLayoutPlaceholder?.(selectedMasterLayoutId, TITLE_PLACEHOLDER);
    }
  };

  const handleToggleFooters = () => {
    if (!selectedMasterLayoutId) return;
    if (hasFooters) {
      FOOTER_PLACEHOLDERS.forEach((fp) =>
        onRemoveLayoutPlaceholder?.(selectedMasterLayoutId, fp["placeholder-id"]),
      );
    } else {
      FOOTER_PLACEHOLDERS.forEach((fp) =>
        onAddLayoutPlaceholder?.(selectedMasterLayoutId, fp),
      );
    }
  };
  const currentName = isRenamingLayout
    ? (selectedLayout?.name ?? selectedMasterLayoutId)
    : (masterName ?? "Office Theme");
  const [nameVal, setNameVal] = useState(currentName);

  useEffect(() => { setNameVal(currentName); }, [currentName]);

  const commitRename = () => {
    setRenaming(false);
    if (isRenamingLayout) {
      onRenameLayout?.(selectedMasterLayoutId, nameVal);
    } else {
      onRenameMaster?.(nameVal);
    }
  };

  useEffect(() => {
    if (!showPlaceholderMenu) return;
    const handler = (e) => {
      if (
        placeholderBtnRef.current && !placeholderBtnRef.current.contains(e.target) &&
        placeholderMenuRef.current && !placeholderMenuRef.current.contains(e.target)
      ) {
        setShowPlaceholderMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPlaceholderMenu]);

  const handleInsertPlaceholder = (type) => {
    setShowPlaceholderMenu(false);
    if (!selectedMasterLayoutId) return;
    if (type === "text") {
      onAddTextElement?.();
    } else if (type === "image") {
      imageInputRef.current?.click();
    } else if (type === "video") {
      videoInputRef.current?.click();
    }
  };

  return (
    <>
      <div className="slide-master-ribbon">

        <div className="ribbon-group master-ribbon-group">
          <div className="master-ribbon-row">
            <button className="master-ribbon-btn master-ribbon-btn--large" disabled>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="4" width="28" height="22" rx="2" stroke="#4472c4" strokeWidth="1.2" fill="#f0f4fc" />
                <rect x="5" y="7" width="22" height="6" rx="1" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.7" />
                <line x1="16" y1="17" x2="16" y2="23" stroke="#4472c4" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="13" y1="20" x2="19" y2="20" stroke="#4472c4" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span>Insert<br />Layout</span>
            </button>
            <div className="master-ribbon-small-col">
              <button
                className="master-ribbon-btn master-ribbon-btn--small"
                disabled={!selectedMasterLayoutId}
                onClick={() => selectedMasterLayoutId && onDeleteLayout?.(selectedMasterLayoutId)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="2" y1="2" x2="12" y2="12" stroke={selectedMasterLayoutId ? "#c00" : "#aaa"} strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="12" y1="2" x2="2" y2="12" stroke={selectedMasterLayoutId ? "#c00" : "#aaa"} strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Delete
              </button>
              <button className="master-ribbon-btn master-ribbon-btn--small" onClick={() => setRenaming(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 10 L9 3 L11 5 L4 12 L2 12 Z" stroke="#4472c4" strokeWidth="1" fill="#dce6f4" />
                </svg>
                Rename
              </button>
            </div>
          </div>
          <span className="ribbon-group-title">Edit Master</span>
        </div>

        <div className="ribbon-group master-ribbon-group">
          <div className="master-ribbon-row" style={{ position: "relative" }}>
            <button className="master-ribbon-btn master-ribbon-btn--large" disabled>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="4" width="28" height="22" rx="2" stroke="#bbb" strokeWidth="1.2" fill="#f5f5f5" />
                <rect x="5" y="7" width="22" height="5" rx="1" fill="#e0e0e0" stroke="#bbb" strokeWidth="0.7" />
                <rect x="5" y="14" width="10" height="9" rx="1" fill="#e0e0e0" stroke="#bbb" strokeWidth="0.7" />
                <rect x="17" y="14" width="10" height="9" rx="1" fill="#e0e0e0" stroke="#bbb" strokeWidth="0.7" />
              </svg>
              <span style={{ color: "#aaa" }}>Master<br />Layout</span>
            </button>
            <div style={{ position: "relative" }}>
              <button
                ref={placeholderBtnRef}
                className="master-ribbon-btn master-ribbon-btn--large"
                disabled={!selectedMasterLayoutId}
                onClick={() => setShowPlaceholderMenu((v) => !v)}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect x="3" y="5" width="26" height="18" rx="2" stroke={selectedMasterLayoutId ? "#4472c4" : "#aaa"} strokeWidth="1.2" fill={selectedMasterLayoutId ? "#dce6f4" : "#f5f5f5"} strokeDasharray="3 2" />
                  <line x1="16" y1="10" x2="16" y2="18" stroke={selectedMasterLayoutId ? "#4472c4" : "#aaa"} strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="12" y1="14" x2="20" y2="14" stroke={selectedMasterLayoutId ? "#4472c4" : "#aaa"} strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <span style={{ color: selectedMasterLayoutId ? undefined : "#aaa" }}>Insert<br />Placeholder ▾</span>
              </button>
              {showPlaceholderMenu && (
                <div ref={placeholderMenuRef} className="placeholder-type-menu" style={{
                  position: "fixed",
                  top: placeholderBtnRef.current ? placeholderBtnRef.current.getBoundingClientRect().bottom + 4 : 80,
                  left: placeholderBtnRef.current ? placeholderBtnRef.current.getBoundingClientRect().left : 0,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  zIndex: 9999,
                  minWidth: 140,
                }}>
                  {[
                    { type: "text", label: "Text" },
                    { type: "image", label: "Picture" },
                    { type: "video", label: "Video" },
                  ].map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => handleInsertPlaceholder(type)}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "7px 14px", border: "none", background: "none",
                        cursor: "pointer", fontSize: 13,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4fc"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="master-ribbon-checks">
              <label className="master-check-row" style={{ opacity: selectedMasterLayoutId ? 1 : 0.4 }}>
                <input
                  type="checkbox"
                  checked={hasTitle}
                  disabled={!selectedMasterLayoutId}
                  onChange={handleToggleTitle}
                />
                {" "}Title
              </label>
              <label className="master-check-row" style={{ opacity: selectedMasterLayoutId ? 1 : 0.4 }}>
                <input
                  type="checkbox"
                  checked={hasFooters}
                  disabled={!selectedMasterLayoutId}
                  onChange={handleToggleFooters}
                />
                {" "}Footers
              </label>
            </div>
          </div>
          <span className="ribbon-group-title">Master Layout</span>
        </div>

        <div className="ribbon-group master-ribbon-group sm-edit-theme-group">
          <div className="master-ribbon-row">
            <ThemesDropdown presentation={presentation} onApplyTheme={onApplyTheme} />
          </div>
          <span className="ribbon-group-title">Edit Theme</span>
        </div>

        <div className="ribbon-group master-ribbon-group sm-edit-theme-group">
          <div className="master-ribbon-row">
            <SlideSizeDropdown presentation={presentation} onUpdateDimensions={onUpdateDimensions} />
          </div>
          <span className="ribbon-group-title">Size</span>
        </div>

        <div className="ribbon-group master-close-group">
          <button className="master-close-btn" onClick={onClose}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="3" fill="#c00" stroke="#a00" strokeWidth="0.8" />
              <line x1="8" y1="8" x2="20" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="20" y1="8" x2="8" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Close<br />Master View</span>
          </button>
          <span className="ribbon-group-title">Close</span>
        </div>
      </div>

      {renaming && (
        <div className="master-rename-overlay" onClick={() => setRenaming(false)}>
          <div className="master-rename-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="master-rename-title">{isRenamingLayout ? "Rename Layout" : "Rename Master"}</div>
            <input
              className="master-rename-input"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              autoFocus
            />
            <div className="master-rename-actions">
              <button className="master-rename-ok" onClick={commitRename}>OK</button>
              <button className="master-rename-cancel" onClick={() => setRenaming(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onImageUpload} />
      <input ref={videoInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={onVideoUpload} />
    </>
  );
}

export default function SlideMasterView({
  presentation,
  onClose,
  onApplyTheme,
  onApplyFont,
  onUpdateDimensions,
  onUpdateLayout,
  masterName,
  onAddMasterElement,
  onUpdateMasterTextContent,
  onUpdateMasterTextFormatting,
  onUpdateMasterElementPosition,
  onUpdateMasterElementSize,
  onUpdateMasterElement,
  onDeleteMasterElement,
  onUpdateLayoutPlaceholder,
  onUpdateLayoutElement,
  onUpdateLayoutElementTextContent,
  onDeleteLayoutElement,
  onBeginHistory,
  onCommitHistory,
  onCancelHistory,
  selectedMasterElementId,
  onSelectMasterElement,
  onSelectedLayoutChange,
}) {
  const [selectedLayoutId, setSelectedLayoutId] = useState(null);
  const [canvasZoom, setCanvasZoom] = useState(75);
  const canvasAreaRef = useRef(null);

  const layouts = presentation?.slideset?.layouts ?? [];
  const selectedLayout = selectedLayoutId
    ? layouts.find((l) => l["layout-id"] === selectedLayoutId) ?? null
    : null;

  const dims = presentation?.slideset?.master?.["slide-dimensions"];
  const slideW = dims?.width ?? 1280;
  const slideH = dims?.height ?? 720;

  useEffect(() => {
    const el = canvasAreaRef.current;
    if (!el) return;
    const compute = () => {
      const availW = el.clientWidth - 80;
      const availH = el.clientHeight - 80;
      const zoomByW = (availW / slideW) * 100;
      const zoomByH = (availH / slideH) * 100;
      const computed = Math.floor(Math.min(zoomByW, zoomByH, 100));
      if (computed > 0) setCanvasZoom(computed);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [slideW, slideH]);

  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const masterElements = presentation?.slideset?.master?.elements ?? {};
  const masterPseudoSlide = {
    contents: {
      text: masterElements.text ?? [],
      media: masterElements.media ?? [],
      background: "#FFFFFFFF",
    },
  };

  const layoutPseudoSlide = selectedLayout
    ? {
      contents: {
        text: [
          ...(selectedLayout.placeholders ?? [])
            .filter((p) => p.type === "text")
            .map((p) => createPlaceholderPseudoElement(p, masterFormatting)),
          ...(selectedLayout.elements?.text ?? []),
        ],
        media: [
          ...(selectedLayout.placeholders ?? [])
            .filter((p) => p.type === "image" || p.type === "video")
            .map((p) => createPlaceholderPseudoElement(p, masterFormatting)),
          ...(selectedLayout.elements?.media ?? []),
        ],
        background: "#FFFFFFFF",
      },
    }
    : null;

  const activeSlide = selectedLayout ? layoutPseudoSlide : masterPseudoSlide;
  const noop = () => { };

  const handleSelectLayout = (layoutId) => {
    setSelectedLayoutId(layoutId);
    onSelectMasterElement?.(null);
    onSelectedLayoutChange?.(layoutId);
  };

  const isLayoutPlaceholder = useCallback(
    (id) => (selectedLayout?.placeholders ?? []).some((p) => p["placeholder-id"] === id),
    [selectedLayout],
  );

  const handlePlaceholderUpdate = useCallback(
    (id, updates) => {
      if (!selectedLayout) return;
      if (isLayoutPlaceholder(id)) {
        onUpdateLayoutPlaceholder?.(selectedLayout["layout-id"], id, updates);
      } else {
        const { formatting, ...rest } = updates;
        if (Object.keys(rest).length)
          onUpdateLayoutElement?.(selectedLayout["layout-id"], "text", id, rest);
        if (formatting)
          onUpdateLayoutElement?.(selectedLayout["layout-id"], "text", id, { formatting });
      }
    },
    [selectedLayout, isLayoutPlaceholder, onUpdateLayoutPlaceholder, onUpdateLayoutElement],
  );

  const handleMediaUpdate = useCallback(
    (id, updates) => {
      if (!selectedLayout) return;
      if (isLayoutPlaceholder(id)) {
        onUpdateLayoutPlaceholder?.(selectedLayout["layout-id"], id, updates);
      } else {
        onUpdateLayoutElement?.(selectedLayout["layout-id"], "media", id, updates);
      }
    },
    [selectedLayout, isLayoutPlaceholder, onUpdateLayoutPlaceholder, onUpdateLayoutElement],
  );

  const handleLayoutDelete = useCallback(
    (elementType, id) => {
      if (!selectedLayout) return;
      if (!isLayoutPlaceholder(id)) {
        onDeleteLayoutElement?.(selectedLayout["layout-id"], elementType, id);
      }
    },
    [selectedLayout, isLayoutPlaceholder, onDeleteLayoutElement],
  );

  return (
    <div className="slide-master-body slide-master-body--full">
      <div className="master-panel">
        <MasterThumb
          label={masterName ?? "Office Theme"}
          isSelected={selectedLayoutId === null}
          isMaster={true}
          presentation={presentation}
          layout={null}
          onClick={() => handleSelectLayout(null)}
        />
        {layouts.map((layout) => (
          <MasterThumb
            key={layout["layout-id"]}
            label={layout["layout-id"]}
            isSelected={selectedLayoutId === layout["layout-id"]}
            isMaster={false}
            presentation={presentation}
            layout={layout}
            onClick={() => handleSelectLayout(layout["layout-id"])}
          />
        ))}
      </div>

      <div className="master-canvas-area" ref={canvasAreaRef}>
        <EditorCanvas
          slide={activeSlide}
          presentation={presentation}
          zoom={canvasZoom}
          showNotes={false}
          hideMasterElements={!selectedLayout}
          selectedElementId={selectedMasterElementId}
          onSelectElement={onSelectMasterElement}
          onChangeTextElement={
            selectedLayout
              ? (id, text) => {
                if (isLayoutPlaceholder(id)) {
                  onUpdateLayoutPlaceholder?.(selectedLayout["layout-id"], id, { promptText: text });
                } else {
                  onUpdateLayoutElementTextContent?.(selectedLayout["layout-id"], id, text);
                }
              }
              : (id, text) => onUpdateMasterTextContent?.(id, text)
          }
          onFormatTextElement={
            selectedLayout
              ? (id, fmt) => handlePlaceholderUpdate(id, { formatting: fmt })
              : (id, fmt) => onUpdateMasterTextFormatting?.(id, fmt)
          }
          onMoveTextElement={
            selectedLayout
              ? (id, x, y) => handlePlaceholderUpdate(id, { position: { x, y } })
              : (id, x, y) => onUpdateMasterElementPosition?.(id, x, y)
          }
          onResizeTextElement={
            selectedLayout
              ? (id, w, h) => handlePlaceholderUpdate(id, { width: w, height: h })
              : (id, w, h) => onUpdateMasterElementSize?.(id, w, h)
          }
          onMoveMediaElement={
            selectedLayout
              ? (id, x, y) => handleMediaUpdate(id, { position: { x, y } })
              : (id, x, y) => onUpdateMasterElementPosition?.(id, x, y)
          }
          onResizeMediaElement={
            selectedLayout
              ? (id, w, h) => handleMediaUpdate(id, { width: w, height: h })
              : (id, w, h) => onUpdateMasterElementSize?.(id, w, h)
          }
          onDeleteMedia={
            selectedLayout
              ? (id) => handleLayoutDelete("media", id)
              : (id) => onDeleteMasterElement?.("media", id)
          }
          onDeleteTextElement={
            selectedLayout
              ? (id) => handleLayoutDelete("text", id)
              : (id) => onDeleteMasterElement?.("text", id)
          }
          updateElement={
            selectedLayout
              ? (id, updates) => handlePlaceholderUpdate(id, updates)
              : (id, updates) => onUpdateMasterElement?.("text", id, updates)
          }
          updateMedia={
            selectedLayout
              ? (id, updates) => handleMediaUpdate(id, updates)
              : (id, updates) => onUpdateMasterElement?.("media", id, updates)
          }
          onBeginHistory={onBeginHistory}
          onCommitHistory={onCommitHistory}
          onCancelHistory={onCancelHistory}
        />
        <div className="master-canvas-label">
          {selectedLayoutId === null
            ? "Slide Master — changes apply to all slides"
            : `Layout: ${selectedLayout?.["layout-id"] ?? ""} — changes apply to slides using this layout`}
        </div>
      </div>
    </div>
  );
}