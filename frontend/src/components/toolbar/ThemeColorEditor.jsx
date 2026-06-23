import { useState, useRef, useEffect } from "react";
import "./ThemeColorEditor.css";
import { toHex6 } from "../../core/utils/colorUtils";

const COLOR_VARIABLES = [
  { id: "bg-light", label: "Background Light", description: "Light background color" },
  { id: "bg-dark", label: "Background Dark", description: "Dark background color" },
  { id: "text-dark", label: "Text Dark", description: "Dark text color" },
  { id: "text-light", label: "Text Light", description: "Light text color" },
  { id: "accent1", label: "Accent 1", description: "Primary accent" },
  { id: "accent2", label: "Accent 2", description: "Secondary accent" },
  { id: "accent3", label: "Accent 3", description: "Tertiary accent" },
  { id: "accent4", label: "Accent 4", description: "Quaternary accent" },
  { id: "accent5", label: "Accent 5", description: "Quinary accent" },
  { id: "accent6", label: "Accent 6", description: "Senary accent" },
  { id: "link", label: "Link", description: "Hyperlink color" },
  { id: "link-visited", label: "Visited Link", description: "Visited hyperlink color" },
];

function ColorInput({ variableName, currentColor, onColorChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  const hex6 = toHex6(currentColor);

  return (
    <div className="theme-color-input-wrapper" ref={ref}>
      <button
        className="theme-color-button"
        style={{ backgroundColor: hex6 }}
        onClick={() => setIsOpen(!isOpen)}
        title={hex6}
      >
        <span className="theme-color-value">{hex6}</span>
      </button>

      {isOpen && (
        <div className="theme-color-picker-popup">
          <label className="theme-color-picker-label">
            <span>Color:</span>
            <input
              type="color"
              value={hex6}
              onChange={(e) => {
                onColorChange(variableName, e.target.value);
              }}
              className="theme-color-picker-input"
            />
          </label>
          <input
            type="text"
            value={hex6}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9A-F]{6}$/i.test(val)) {
                onColorChange(variableName, val);
              }
            }}
            placeholder="#RRGGBB"
            className="theme-color-hex-input"
          />
        </div>
      )}
    </div>
  );
}

export function ThemeColorEditor({ colorTheme, onColorChange }) {
  return (
    <div className="theme-color-editor">
      <div className="theme-color-editor-header">
        <h3>Theme Colors</h3>
        <p>Customize individual theme colors</p>
      </div>

      <div className="theme-colors-grid">
        {COLOR_VARIABLES.map((variable) => {
          const colorEntry = colorTheme.find(
            (e) => e["css-variable-name"] === variable.id
          );
          const currentColor = colorEntry?.color ?? "#000000";

          return (
            <div key={variable.id} className="theme-color-row">
              <div className="theme-color-label-section">
                <div className="theme-color-label">{variable.label}</div>
                <div className="theme-color-description">{variable.description}</div>
              </div>

              <ColorInput
                variableName={variable.id}
                currentColor={currentColor}
                onColorChange={onColorChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}