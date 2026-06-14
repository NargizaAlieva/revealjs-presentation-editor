import { useState } from "react";
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
            className="toolbar-item large"
            onClick={() => setShowLayouts((v) => !v)}
          >
            <MdAdd />
            <span>New Slide</span>
          </button>

          {showLayouts && (
            <div className="layout-popup">
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
          <button className="mini-text-command" disabled>
            Layout
          </button>
          <button className="mini-text-command" disabled>
            Reset
          </button>
          <button className="mini-text-command" disabled>
            Section
          </button>
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

          <label
            className={`small-format color-format-btn${!isTextSelected ? " disabled" : ""}`}
            title="Text color"
          >
            <span
              style={{
                borderBottom: `2px solid ${isTextSelected ? currentColor : "#888"}`,
              }}
            >
              A
            </span>
            <input
              type="color"
              value={currentColor.length === 7 ? currentColor : "#111111"}
              disabled={!isTextSelected}
              onChange={(e) => fmt({ color: e.target.value })}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className="ribbon-group-title">Font</div>
      </div>

      <div className="ribbon-group paragraph-group">
        <div className="font-row">
          <button className="small-format" disabled>
            <MdFormatListBulleted />
          </button>
          <button className="small-format" disabled>
            <MdFormatListNumbered />
          </button>
          <button className="small-format" disabled>
            <MdArrowUpward />
          </button>
          <button className="small-format" disabled>
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
