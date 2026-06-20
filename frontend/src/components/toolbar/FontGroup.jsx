import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";
import { FONT_SIZES } from "./homeTabConstants";
import "./FontGroup.css"

export default function FontGroup({
  currentFormatting = {},
  isTextSelected = false,
  fonts = [],
  onFormatChange,
}) {
  const fmt = (updates) => {
    if (!isTextSelected || !onFormatChange) return;
    onFormatChange(updates);
  };

  const currentFont = currentFormatting.font ?? fonts[0] ?? "Arial";
  const currentSize = parseInt(currentFormatting.size ?? "28", 10);
  const isBold = currentFormatting.weight === "bold";
  const isItalic = !!currentFormatting.italics;
  const isUnderline = currentFormatting["text-decoration"] === "underline";
  const currentColor = currentFormatting.color ?? "#111111";

  return (
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
  );
}
