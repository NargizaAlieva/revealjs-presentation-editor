import { useState, useRef, useEffect } from "react";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";
import "./FontGroup.css"

const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72, 96];

function SizePicker({ value, disabled, onChange }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value === "" ? "" : String(value));
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  // Sync external value → input when not focused
  useEffect(() => {
    setInputVal(value === "" ? "" : String(value));
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Scroll selected item into view when list opens
  useEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector(".sz-active");
    active?.scrollIntoView({ block: "nearest" });
  }, [open]);

  const commit = (val) => {
    const n = parseInt(val, 10);
    if (n >= 1 && n <= 400) onChange(n);
    setOpen(false);
  };

  return (
    <div className="sz-picker" ref={wrapRef}>
      <input
        className="toolbar-size"
        type="text"
        disabled={disabled}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onFocus={() => {
            const r = wrapRef.current?.getBoundingClientRect();
            if (r) setDropPos({ top: r.bottom + 2, left: r.left, width: r.width });
            setOpen(true);
          }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { commit(inputVal); e.target.blur(); }
          if (e.key === "Escape") { setOpen(false); e.target.blur(); }
        }}
        onBlur={(e) => {
          // only commit if focus didn't move into the list
          if (!wrapRef.current?.contains(e.relatedTarget)) {
            commit(inputVal);
          }
        }}
      />
      {open && (
        <ul className="sz-dropdown" ref={listRef} onMouseDown={(e) => e.preventDefault()} style={{ top: dropPos.top, left: dropPos.left, minWidth: dropPos.width }}>
          {SIZES.map((s) => (
            <li
              key={s}
              className={`sz-item${String(s) === String(value) ? " sz-active" : ""}`}
              onClick={() => { setInputVal(String(s)); commit(s); }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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

  const currentFont = currentFormatting.font === "mixed" ? "" : (currentFormatting.font ?? fonts[0] ?? "Arial");
  const currentSize = currentFormatting.size === "mixed" ? "" : parseInt(currentFormatting.size ?? "28", 10);
  const isBold = currentFormatting.weight === "bold" || currentFormatting.weight === true;
  const isItalic = currentFormatting.italics === true || currentFormatting.italics === "italic";
  const isUnderline = currentFormatting["text-decoration"] === "underline";
  const currentColor = currentFormatting.color === "mixed" ? "#111111" : (currentFormatting.color ?? "#111111");

  return (
    <div className="ribbon-group font-group">
      <div className="font-row">
        <select
          className="toolbar-select"
          disabled={!isTextSelected}
          value={currentFont}
          onChange={(e) => { if (e.target.value) fmt({ font: e.target.value }); }}
        >
          {currentFont === "" && <option value="">—</option>}
          {fonts.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>

        <SizePicker
          value={currentSize}
          disabled={!isTextSelected}
          onChange={(n) => fmt({ size: `${n}px` })}
        />
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
          onClick={() => fmt({ size: `${Math.min(120, (currentSize || 28) + 2)}px` })}
        >
          A<sup>+</sup>
        </button>

        <label
          className={`small-format color-format-btn${!isTextSelected ? " disabled" : ""}`}
          title="Text color"
        >
          <span style={{ borderBottom: `2px solid ${isTextSelected ? currentColor : "#888"}` }}>
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
