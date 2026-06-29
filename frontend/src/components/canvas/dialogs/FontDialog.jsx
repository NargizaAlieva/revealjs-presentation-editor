import { useState } from "react";
import { createPortal } from "react-dom";
import { getAvailableFonts } from "../../../core/model/fontConfig";
import "./dialogs.css";

export default function FontDialog({
  formatting = {},
  presentation,
  onApply,
  onClose,
}) {
  const fonts = getAvailableFonts(presentation);
  const [font, setFont] = useState(
    formatting.font === "mixed" ? fonts[0] : (formatting.font ?? fonts[0]),
  );
  const [size, setSize] = useState(Number.parseInt(formatting.size, 10) || 24);
  const [bold, setBold] = useState(
    formatting.weight === "bold" || formatting.weight === true,
  );
  const [italic, setItalic] = useState(
    formatting.italics === true || formatting.italics === "italic",
  );
  const [underline, setUnderline] = useState(
    String(formatting["text-decoration"] ?? "").includes("underline"),
  );

  const apply = () => {
    onApply?.({
      font,
      size: `${Math.max(1, Number(size) || 24)}px`,
      weight: bold ? "bold" : "normal",
      italics: italic,
      "text-decoration": underline ? "underline" : "none",
    });
    onClose?.();
  };

  return createPortal(
    <div className="text-dialog-backdrop" onMouseDown={onClose}>
      <section
        className="text-context-dialog font-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Font"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="text-context-dialog-header">
          <span>Font</span>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="font-dialog-grid">
          <label>
            <span>Font:</span>
            <select
              value={font}
              onChange={(event) => setFont(event.target.value)}
            >
              {fonts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Size:</span>
            <input
              type="number"
              min="1"
              max="400"
              value={size}
              onChange={(event) => setSize(event.target.value)}
            />
          </label>
        </div>

        <div className="font-dialog-effects">
          <label>
            <input
              type="checkbox"
              checked={bold}
              onChange={(event) => setBold(event.target.checked)}
            />
            Bold
          </label>
          <label>
            <input
              type="checkbox"
              checked={italic}
              onChange={(event) => setItalic(event.target.checked)}
            />
            Italic
          </label>
          <label>
            <input
              type="checkbox"
              checked={underline}
              onChange={(event) => setUnderline(event.target.checked)}
            />
            Underline
          </label>
        </div>

        <footer className="text-context-dialog-actions">
          <button type="button" className="primary" onClick={apply}>
            OK
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
