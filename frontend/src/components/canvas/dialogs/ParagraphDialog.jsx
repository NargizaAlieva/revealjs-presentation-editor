import { useState } from "react";
import { createPortal } from "react-dom";
import "./TextContextDialogs.css";

const numberFrom = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseVerticalMargin = (margin) => {
  const values = String(margin ?? "0")
    .match(/-?\d*\.?\d+/g)
    ?.map(Number) ?? [0];
  if (values.length === 1) return { before: values[0], after: values[0] };
  if (values.length === 2) return { before: values[0], after: values[1] };
  return { before: values[0] ?? 0, after: values[2] ?? values[0] ?? 0 };
};

export default function ParagraphDialog({ formatting = {}, onApply, onClose }) {
  const spacing = parseVerticalMargin(formatting.margin);
  const [alignment, setAlignment] = useState(
    formatting.align === "mixed" ? "left" : (formatting.align ?? "left"),
  );
  const [indentLevel, setIndentLevel] = useState(
    Number(formatting["indent-level"] ?? 0),
  );
  const [before, setBefore] = useState(spacing.before);
  const [after, setAfter] = useState(spacing.after);
  const [lineSpacing, setLineSpacing] = useState(
    numberFrom(formatting["line-spacing"], 1.15),
  );

  const apply = () => {
    onApply?.({
      align: alignment,
      "indent-level": Math.max(0, Math.min(4, Number(indentLevel) || 0)),
      margin: `${Math.max(0, Number(before) || 0)}px 0 ${Math.max(
        0,
        Number(after) || 0,
      )}px 0`,
      "line-spacing": String(Math.max(0.5, Number(lineSpacing) || 1.15)),
    });
    onClose?.();
  };

  return createPortal(
    <div className="text-dialog-backdrop" onMouseDown={onClose}>
      <section
        className="text-context-dialog paragraph-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Paragraph"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="text-context-dialog-header">
          <span>Paragraph</span>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="paragraph-dialog-section-title">
          Indents and Spacing
        </div>

        <fieldset>
          <legend>General</legend>
          <label>
            <span>Alignment:</span>
            <select
              value={alignment}
              onChange={(event) => setAlignment(event.target.value)}
            >
              <option value="left">Left</option>
              <option value="center">Centered</option>
              <option value="right">Right</option>
              <option value="justify">Justified</option>
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Indentation</legend>
          <div className="paragraph-dialog-grid paragraph-dialog-grid--indent">
            <label>
              <span>Before text:</span>
              <input
                type="number"
                min="0"
                max="4"
                step="1"
                value={indentLevel}
                onChange={(event) => setIndentLevel(event.target.value)}
              />
            </label>
            <label>
              <span>Special:</span>
              <select disabled value="none">
                <option value="none">(none)</option>
              </select>
            </label>
            <label className="paragraph-dialog-disabled">
              <span>By:</span>
              <input disabled type="number" value="0" readOnly />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Spacing</legend>
          <div className="paragraph-dialog-grid paragraph-dialog-grid--spacing">
            <label>
              <span>Before:</span>
              <input
                type="number"
                min="0"
                step="1"
                value={before}
                onChange={(event) => setBefore(event.target.value)}
              />
            </label>
            <label>
              <span>Line Spacing:</span>
              <select value="multiple" disabled>
                <option value="multiple">Multiple</option>
              </select>
            </label>
            <label>
              <span>After:</span>
              <input
                type="number"
                min="0"
                step="1"
                value={after}
                onChange={(event) => setAfter(event.target.value)}
              />
            </label>
            <label>
              <span>At:</span>
              <input
                type="number"
                min="0.5"
                max="5"
                step="0.05"
                value={lineSpacing}
                onChange={(event) => setLineSpacing(event.target.value)}
              />
            </label>
          </div>
        </fieldset>

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
