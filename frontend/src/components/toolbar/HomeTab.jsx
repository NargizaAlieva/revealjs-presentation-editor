import { useState, useRef, useEffect } from "react";
import "./HomeTab.css"
import {
  MdAdd,
  MdDelete,
  MdContentCopy,
  MdVisibilityOff,
  MdVisibility,
  MdArrowUpward,
  MdArrowDownward,
  MdContentPaste,
  MdContentCut,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdSearch,
  MdTextFields,
} from "react-icons/md";
import ColorPicker from "../canvas/ColorPicker";

const BULLET_STYLES = [
  { marker: null, label: "None" },
  { marker: "•", label: "Filled circle" },
  { marker: "○", label: "Open circle" },
  { marker: "▪", label: "Small square" },
  { marker: "□", label: "Open square" },
  { marker: "❖", label: "Diamond" },
  { marker: "➢", label: "Arrow" },
  { marker: "✓", label: "Checkmark" },
];

const NUMBERED_STYLES = [
  { style: null, label: "None" },
  { style: "decimal", label: "1. 2. 3." },
  { style: "lower-alpha", label: "a. b. c." },
  { style: "upper-alpha", label: "A. B. C." },
  { style: "lower-roman", label: "i. ii. iii." },
  { style: "upper-roman", label: "I. II. III." },
];

const LAYOUTS = [
  { id: "title-content", label: "Title and Content" },
  { id: "title-content-media", label: "Title, Content and Media" },
  { id: "two-columns", label: "Two Columns" },
  { id: "title-only", label: "Title Only" },
  { id: "blank", label: "Blank" },
];

const DEFAULT_FONTS = [
  "Sora",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Roboto",
  "Source Sans Pro",
  "Impact",
  "Comic Sans MS",
];

const FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72,
];

export default function HomeTab({
  onAddSlide,
  onApplyLayout,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  canDelete,
  canMoveUp,
  canMoveDown,
  onToggleSlideHidden,
  isSlideHidden,
  currentFormatting = {},
  onFormatChange,
  isTextSelected = false,
  presentation,
  onCut,
  onCopy,
  onPaste,
  hasSelection = false,
  canPaste = false,
}) {
  const [showLayouts, setShowLayouts] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState({ top: 0, left: 0 });
  const [showBulletPicker, setShowBulletPicker] = useState(false);
  const [showNumberedPicker, setShowNumberedPicker] = useState(false);
  const bulletPickerRef = useRef(null);
  const numberedPickerRef = useRef(null);

  useEffect(() => {
    if (!showBulletPicker && !showNumberedPicker) return;
    const handleClick = (e) => {
      if (
        bulletPickerRef.current &&
        !bulletPickerRef.current.contains(e.target)
      )
        setShowBulletPicker(false);
      if (
        numberedPickerRef.current &&
        !numberedPickerRef.current.contains(e.target)
      )
        setShowNumberedPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showBulletPicker, showNumberedPicker]);

  const handleLayoutSelect = (layoutId) => {
    onAddSlide?.(layoutId);
    setShowLayouts(false);
  };

  const fmt = (updates) => {
    if (!isTextSelected || !onFormatChange) return;
    onFormatChange(updates);
  };

  const presentationFonts = (presentation?.slideset?.fonts ?? [])
    .map((f) => f["font-id"])
    .filter(Boolean);
  const fonts =
    presentationFonts.length > 0 ? presentationFonts : DEFAULT_FONTS;

  const currentFont = currentFormatting.font ?? fonts[0] ?? "Arial";
  const currentSize = parseInt(currentFormatting.size ?? "28", 10);
  const isBold = currentFormatting.weight === "bold";
  const isItalic = !!currentFormatting.italics;
  const isUnderline = currentFormatting["text-decoration"] === "underline";
  const currentColor = currentFormatting.color ?? "#111111";
  const currentAlign = currentFormatting.align ?? "left";
  const currentListType = currentFormatting["list-type"] ?? null;
  const currentListLevel = currentFormatting["list-level"] ?? 0;

  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [newSlidePos, setNewSlidePos] = useState({ top: 0, left: 0 });
  const layoutBtnRef = useRef(null);
  const newSlideBtnRef = useRef(null);

  const handleNewSlideToggle = () => {
    if (!showLayouts && newSlideBtnRef.current) {
      const rect = newSlideBtnRef.current.getBoundingClientRect();
      setNewSlidePos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowLayouts((v) => !v);
  };

  const handleLayoutPanelToggle = () => {
    if (!showLayoutPanel && layoutBtnRef.current) {
      const rect = layoutBtnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowLayoutPanel((v) => !v);
  };

  useEffect(() => {
    if (!showLayoutPanel) return;
    const handler = (e) => {
      if (layoutBtnRef.current && !layoutBtnRef.current.closest(".layout-apply-container").contains(e.target)) {
        setShowLayoutPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLayoutPanel]);

  useEffect(() => {
    if (!showLayouts) return;
    const handler = (e) => {
      if (newSlideBtnRef.current && !newSlideBtnRef.current.closest(".toolbar-dropdown-container").contains(e.target)) {
        setShowLayouts(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLayouts]);

  return (
    <>
      <div className="ribbon-group clipboard-group">
        <button
          className="toolbar-item large"
          disabled={!canPaste}
          onClick={onPaste}
          title="Paste (Ctrl+V)"
        >
          <MdContentPaste />
          <span>Paste</span>
        </button>

        <div className="mini-stack">
          <button
            className="mini-command"
            disabled={!hasSelection}
            onClick={onCut}
            title="Cut (Ctrl+X)"
          >
            <MdContentCut />
          </button>
          <button
            className="mini-command"
            disabled={!hasSelection}
            onClick={onCopy}
            title="Copy (Ctrl+C)"
          >
            <MdContentCopy />
          </button>
        </div>

        <div className="ribbon-group-title">Clipboard</div>
      </div>

      <div className="ribbon-group slides-group">
        <div className="toolbar-dropdown-container">
          <button
            ref={newSlideBtnRef}
            className="toolbar-item large"
            onClick={handleNewSlideToggle}
          >
            <MdAdd />
            <span>New Slide</span>
          </button>

          {showLayouts && (
            <div className="layout-popup" style={{ top: newSlidePos.top, left: newSlidePos.left }}>
              <h4>Layouts</h4>

              {LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  className="layout-option"
                  onClick={() => handleLayoutSelect(layout.id)}
                >
                  <div className={`layout-thumb layout-thumb--${layout.id}`}>
                    {layout.id === "title-content-media" && (
                      <div className="layout-thumb-media" />
                    )}
                  </div>
                  <span>{layout.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mini-stack text-stack">
          <div className="layout-apply-container">
            <button
              ref={layoutBtnRef}
              className="mini-text-command layout-apply-btn"
              onClick={handleLayoutPanelToggle}
            >
              Layout
            </button>
            {showLayoutPanel && (
              <div className="layout-apply-popup" style={{ top: popupPos.top, left: popupPos.left }}>
                {LAYOUTS.map((layout) => (
                  <button
                    key={layout.id}
                    className="layout-apply-option"
                    onClick={() => { onApplyLayout?.(layout.id); setShowLayoutPanel(false); }}
                  >
                    <div className={`layout-thumb layout-thumb--${layout.id} layout-thumb--small`}>
                      {layout.id === "title-content-media" && <div className="layout-thumb-media" />}
                    </div>
                    <span>{layout.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="mini-text-command" disabled>Reset</button>
          <button className="mini-text-command" disabled>Section</button>
        </div>

        <button
          className="toolbar-item"
          onClick={onDeleteSlide}
          disabled={!canDelete}
        >
          <MdDelete />
          <span>Delete</span>
        </button>

        <button className="toolbar-item" onClick={onDuplicateSlide}>
          <MdContentCopy />
          <span>Duplicate</span>
        </button>

        <div className="ribbon-group-title">Slides</div>
      </div>

      <div className="ribbon-group font-group">
        <div className="font-row">
          <select
            className="toolbar-select"
            disabled={!isTextSelected}
            value={currentFont}
            onChange={(e) => fmt({ font: e.target.value })}
          >
            {fonts.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>

          <select
            className="toolbar-size"
            disabled={!isTextSelected}
            value={currentSize}
            onChange={(e) => fmt({ size: `${e.target.value}px` })}
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="font-row">
          <button
            className={`small-format${isBold ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Bold"
            onClick={() => fmt({ weight: isBold ? "normal" : "bold" })}
          >
            <MdFormatBold />
          </button>

          <button
            className={`small-format${isItalic ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Italic"
            onClick={() => fmt({ italics: !isItalic })}
          >
            <MdFormatItalic />
          </button>

          <button
            className={`small-format${isUnderline ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Underline"
            onClick={() =>
              fmt({ "text-decoration": isUnderline ? "none" : "underline" })
            }
          >
            <MdFormatUnderlined />
          </button>

          <button
            className="small-format"
            disabled={!isTextSelected}
            title="Increase font size"
            onClick={() => fmt({ size: `${Math.min(120, currentSize + 2)}px` })}
          >
            A<sup>+</sup>
          </button>

          <div className="color-btn-container">
            <button
              className={`small-format color-format-btn${!isTextSelected ? " disabled" : ""}`}
              title="Text color"
              disabled={!isTextSelected}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setColorPickerPos({ top: rect.bottom + 4, left: rect.left });
                setShowColorPicker((v) => !v);
              }}
            >
              <span className="color-format-letter">
                A
                <span
                  className="color-format-bar"
                  style={{ background: isTextSelected ? currentColor : "#ccc" }}
                />
              </span>
              <span className="color-format-arrow">▾</span>
            </button>
            {showColorPicker && isTextSelected && (
              <ColorPicker
                color={currentColor}
                onChange={(c) => fmt({ color: c })}
                onClose={() => setShowColorPicker(false)}
                style={{ top: colorPickerPos.top, left: colorPickerPos.left, position: "fixed" }}
              />
            )}
          </div>
        </div>

        <div className="ribbon-group-title">Font</div>
      </div >

      <div className="ribbon-group paragraph-group">
        <div className="font-row">
          {/* Bullets split-button */}
          <div className="list-split-btn" ref={bulletPickerRef}>
            <button
              className={`small-format${currentListType === "bullet" ? " active" : ""}`}
              disabled={!isTextSelected}
              title="Bulleted list"
              onClick={() =>
                fmt({
                  "list-type": currentListType === "bullet" ? null : "bullet",
                  "list-marker":
                    currentListType === "bullet"
                      ? null
                      : (currentFormatting["list-marker"] ?? "•"),
                  "list-level": 0,
                })
              }
            >
              <MdFormatListBulleted />
            </button>
            <button
              className="list-split-arrow"
              disabled={!isTextSelected}
              title="Bullet styles"
              onClick={() => {
                setShowBulletPicker((v) => !v);
                setShowNumberedPicker(false);
              }}
            >
              ▾
            </button>
            {showBulletPicker && (
              <div className="list-picker-popup">
                <div className="list-picker-grid">
                  {BULLET_STYLES.map(({ marker, label }) => (
                    <button
                      key={label}
                      className={`list-picker-cell${(currentFormatting["list-marker"] ?? "•") === marker && currentListType === "bullet" ? " selected" : ""}`}
                      title={label}
                      onClick={() => {
                        fmt(
                          marker === null
                            ? {
                                "list-type": null,
                                "list-marker": null,
                                "list-level": 0,
                              }
                            : {
                                "list-type": "bullet",
                                "list-marker": marker,
                                "list-level": currentListLevel,
                              },
                        );
                        setShowBulletPicker(false);
                      }}
                    >
                      {marker === null ? (
                        <span className="list-picker-none">None</span>
                      ) : (
                        <span className="list-picker-preview">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="list-picker-row">
                              <span className="list-picker-marker">
                                {marker}
                              </span>
                              <span className="list-picker-line" />
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Numbered split-button */}
          <div className="list-split-btn" ref={numberedPickerRef}>
            <button
              className={`small-format${currentListType === "numbered" ? " active" : ""}`}
              disabled={!isTextSelected}
              title="Numbered list"
              onClick={() =>
                fmt({
                  "list-type":
                    currentListType === "numbered" ? null : "numbered",
                  "list-numbered-style":
                    currentListType === "numbered"
                      ? null
                      : (currentFormatting["list-numbered-style"] ?? "decimal"),
                  "list-level": 0,
                })
              }
            >
              <MdFormatListNumbered />
            </button>
            <button
              className="list-split-arrow"
              disabled={!isTextSelected}
              title="Numbering styles"
              onClick={() => {
                setShowNumberedPicker((v) => !v);
                setShowBulletPicker(false);
              }}
            >
              ▾
            </button>
            {showNumberedPicker && (
              <div className="list-picker-popup">
                <div className="list-picker-grid list-picker-grid--numbered">
                  {NUMBERED_STYLES.map(({ style, label }) => (
                    <button
                      key={label}
                      className={`list-picker-cell${(currentFormatting["list-numbered-style"] ?? "decimal") === style && currentListType === "numbered" ? " selected" : ""}`}
                      title={label}
                      onClick={() => {
                        fmt(
                          style === null
                            ? {
                                "list-type": null,
                                "list-numbered-style": null,
                                "list-level": 0,
                              }
                            : {
                                "list-type": "numbered",
                                "list-numbered-style": style,
                                "list-level": currentListLevel,
                              },
                        );
                        setShowNumberedPicker(false);
                      }}
                    >
                      {style === null ? (
                        <span className="list-picker-none">None</span>
                      ) : (
                        <span className="list-picker-preview">
                          {["1", "2", "3"].map((n, i) => (
                            <span key={i} className="list-picker-row">
                              <span
                                className="list-picker-marker"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                {style === "decimal"
                                  ? `${n}.`
                                  : style === "lower-alpha"
                                    ? `${String.fromCharCode(96 + Number(n))}.`
                                    : style === "upper-alpha"
                                      ? `${String.fromCharCode(64 + Number(n))}.`
                                      : style === "lower-roman"
                                        ? ["i.", "ii.", "iii."][i]
                                        : ["I.", "II.", "III."][i]}
                              </span>
                              <span className="list-picker-line" />
                            </span>
                          ))}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="small-format"
            disabled={!isTextSelected || currentListLevel <= 0}
            title="Decrease list level"
            onClick={() =>
              fmt({ "list-level": Math.max(0, currentListLevel - 1) })
            }
          >
            <MdArrowUpward />
          </button>
          <button
            className="small-format"
            disabled={!isTextSelected || !currentListType}
            title="Increase list level"
            onClick={() =>
              fmt({ "list-level": Math.min(4, currentListLevel + 1) })
            }
          >
            <MdArrowDownward />
          </button>
        </div>

        <div className="font-row">
          <button
            className={`small-format${currentAlign === "left" ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Align left"
            onClick={() => fmt({ align: "left" })}
          >
            <MdFormatAlignLeft />
          </button>
          <button
            className={`small-format${currentAlign === "center" ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Align center"
            onClick={() => fmt({ align: "center" })}
          >
            <MdFormatAlignCenter />
          </button>
          <button
            className={`small-format${currentAlign === "right" ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Align right"
            onClick={() => fmt({ align: "right" })}
          >
            <MdFormatAlignRight />
          </button>
          <button
            className={`small-format${currentAlign === "justify" ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Justify"
            onClick={() => fmt({ align: "justify" })}
          >
            <MdFormatAlignJustify />
          </button>
        </div>

        <div className="ribbon-group-title">Paragraph</div>
      </div>

      <div className="ribbon-group arrange-group">
        <button className="toolbar-item" onClick={onToggleSlideHidden}>
          {isSlideHidden ? <MdVisibility /> : <MdVisibilityOff />}
          <span>{isSlideHidden ? "Show" : "Hide"}</span>
        </button>

        <button
          className="toolbar-item"
          onClick={onMoveSlideUp}
          disabled={!canMoveUp}
        >
          <MdArrowUpward />
          <span>Up</span>
        </button>

        <button
          className="toolbar-item"
          onClick={onMoveSlideDown}
          disabled={!canMoveDown}
        >
          <MdArrowDownward />
          <span>Down</span>
        </button>

        <div className="ribbon-group-title">Arrange</div>
      </div>

      <div className="ribbon-group editing-group">
        <button className="toolbar-item" disabled>
          <MdSearch />
          <span>Find</span>
        </button>

        <button className="toolbar-item" disabled>
          <MdTextFields />
          <span>Select</span>
        </button>

        <div className="ribbon-group-title">Editing</div>
      </div>
    </>
  );
}
