import { useState } from "react";
import { createPortal } from "react-dom";
import ColorPicker from "./ColorPicker";
import "./FormatToolbar.css";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
} from "react-icons/md";

let formattingClipboard = null;

const DEFAULT_FONTS = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
  "Source Sans Pro",
  "Roboto",
];

const stop = (event) => event.stopPropagation();

export default function FormatToolbar({
  elementId,
  formatting,
  onFormatTextElement,
  presentation,
  style,
}) {
  const [justCopied, setJustCopied] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [colorPickerPos, setColorPickerPos] = useState({ top: 0, left: 0 });
  const [highlightPickerPos, setHighlightPickerPos] = useState({
    top: 0,
    left: 0,
  });

  const fmt = (updates) => onFormatTextElement(elementId, updates);

  const presentationFonts = (presentation?.slideset?.fonts ?? [])
    .map((f) => f["font-id"])
    .filter(Boolean);
  const fonts =
    presentationFonts.length > 0 ? presentationFonts : DEFAULT_FONTS;

  const currentSize = parseInt(formatting.size ?? "24", 10);
  const currentFont = formatting.font ?? fonts[0] ?? "Arial";
  const currentAlign = formatting.align ?? "left";
  const currentColor = formatting.color ?? "#111111";
  const currentHighlight = formatting.highlight ?? "transparent";
  const currentLineSpacing = parseFloat(formatting["line-spacing"] ?? "1.15");

  const hasPaste =
    formattingClipboard !== null &&
    formattingClipboard.sourceElementId !== elementId;

  const handleFormatPainter = () => {
    if (hasPaste) {
      fmt({ ...formattingClipboard.formatting });
      formattingClipboard = null;
    } else {
      formattingClipboard = {
        formatting: { ...formatting },
        sourceElementId: elementId,
      };
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    }
  };

  return (
    <div
      className="format-toolbar"
      style={style}
      onMouseDown={stop}
      onClick={stop}
    >
      <div className="format-row">
        <select
          className="font-select"
          value={currentFont}
          onChange={(e) => fmt({ font: e.target.value })}
          title="Font"
        >
          {fonts.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>

        <input
          className="size-input"
          type="number"
          min={6}
          max={120}
          value={currentSize}
          onChange={(e) => fmt({ size: `${e.target.value}px` })}
          title="Font size"
        />

        <button
          type="button"
          title="Increase font size"
          onClick={() => fmt({ size: `${Math.min(120, currentSize + 2)}px` })}
        >
          A<sup>+</sup>
        </button>

        <button
          type="button"
          title="Decrease font size"
          onClick={() => fmt({ size: `${Math.max(6, currentSize - 2)}px` })}
        >
          A<sup>−</sup>
        </button>

        <div className="separator" />

        <select
          className="spacing-select"
          value={currentLineSpacing}
          onChange={(e) => fmt({ "line-spacing": `${e.target.value}em` })}
          title="Line spacing"
        >
          <option value={1}>1.0</option>
          <option value={1.15}>1.15</option>
          <option value={1.5}>1.5</option>
          <option value={2}>2.0</option>
          <option value={2.5}>2.5</option>
          <option value={3}>3.0</option>
        </select>
      </div>

      <div className="format-row">
        <button
          type="button"
          className={`fmt-btn bold ${formatting.weight === "bold" ? "active" : ""}`}
          title="Bold"
          onClick={() =>
            fmt({ weight: formatting.weight === "bold" ? "normal" : "bold" })
          }
        >
          B
        </button>

        <button
          type="button"
          className={`fmt-btn italic ${formatting.italics ? "active" : ""}`}
          title="Italic"
          onClick={() => fmt({ italics: !formatting.italics })}
        >
          I
        </button>

        <button
          type="button"
          className={`fmt-btn underline ${formatting["text-decoration"] === "underline" ? "active" : ""}`}
          title="Underline"
          onClick={() =>
            fmt({
              "text-decoration":
                formatting["text-decoration"] === "underline"
                  ? "none"
                  : "underline",
            })
          }
        >
          U
        </button>

        <div className="separator" />

        {["left", "center", "right", "justify"].map((align) => (
          <button
            key={align}
            type="button"
            className={`fmt-btn align-btn ${currentAlign === align ? "active" : ""}`}
            title={`Align ${align}`}
            onClick={() => fmt({ align })}
          >
            {align === "left" && <MdFormatAlignLeft />}
            {align === "center" && <MdFormatAlignCenter />}
            {align === "right" && <MdFormatAlignRight />}
            {align === "justify" && <MdFormatAlignJustify />}
          </button>
        ))}

        <div className="separator" />

        <div className="ft-color-container">
          <button
            type="button"
            className="color-btn"
            title="Text color"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setColorPickerPos({ top: rect.bottom + 4, left: rect.left });
              setShowColorPicker((v) => !v);
              setShowHighlightPicker(false);
            }}
          >
            <span
              className="color-icon"
              style={{ borderBottom: `3px solid ${currentColor}` }}
            >
              A
            </span>
            <span className="ft-color-arrow">▾</span>
          </button>

          {/* Portal — рендерится в document.body, вне zoom-трансформа канваса.
              Иначе position:fixed считается от трансформированного предка,
              и пикер уходит далеко от тулбара. */}
          {showColorPicker &&
            createPortal(
              <ColorPicker
                color={currentColor}
                onChange={(c) => fmt({ color: c })}
                onClose={() => setShowColorPicker(false)}
                style={{
                  position: "fixed",
                  top: colorPickerPos.top,
                  left: colorPickerPos.left,
                  zIndex: 99999,
                }}
              />,
              document.body,
            )}
        </div>

        <div className="ft-color-container">
          <button
            type="button"
            className="color-btn"
            title="Highlight color"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setHighlightPickerPos({ top: rect.bottom + 4, left: rect.left });
              setShowHighlightPicker((v) => !v);
              setShowColorPicker(false);
            }}
          >
            <span
              className="color-icon highlight-icon"
              style={{
                background:
                  currentHighlight === "transparent"
                    ? "#ffff00"
                    : currentHighlight,
              }}
            >
              A
            </span>
            <span className="ft-color-arrow">▾</span>
          </button>

          {showHighlightPicker &&
            createPortal(
              <ColorPicker
                color={
                  currentHighlight === "transparent"
                    ? "#ffff00"
                    : currentHighlight
                }
                onChange={(c) => fmt({ highlight: c })}
                onClose={() => setShowHighlightPicker(false)}
                style={{
                  position: "fixed",
                  top: highlightPickerPos.top,
                  left: highlightPickerPos.left,
                  zIndex: 99999,
                }}
              />,
              document.body,
            )}
        </div>

        <button
          type="button"
          className={`fmt-btn painter-btn ${hasPaste ? "painter-paste" : ""} ${justCopied ? "painter-copied" : ""}`}
          title={hasPaste ? "Apply copied formatting" : "Copy formatting"}
          onClick={handleFormatPainter}
        >
          🖌️
        </button>

        <div className="separator" />

        <button
          type="button"
          className="fmt-btn clear-btn"
          title="Clear formatting"
          onClick={() =>
            fmt({
              weight: "normal",
              italics: false,
              "text-decoration": "none",
              color: "var(--text-dark, #111111)",
              highlight: "transparent",
            })
          }
        >
          ✕
        </button>
      </div>
    </div>
  );
}
