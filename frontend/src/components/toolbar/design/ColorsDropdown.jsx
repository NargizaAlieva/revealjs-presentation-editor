import { useState, useRef, useEffect } from "react";
import "./ColorsDropdown.css";
import { DESIGN_THEMES } from "../../../core/model/designThemes";

function ColorPalettePreview({ colorTheme }) {
  return (
    <div className="colors-palette-preview">
      {colorTheme.slice(0, 6).map((entry, idx) => (
        <span
          key={idx}
          className="colors-palette-swatch"
          style={{ backgroundColor: entry.color }}
          title={entry["css-variable-name"]}
        />
      ))}
    </div>
  );
}

export function ColorsDropdown({ onThemeSelect, currentThemeId }) {
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

  return (
    <div className="colors-dropdown-wrapper" ref={ref}>
      <button
        className="colors-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="colors-dropdown-label">Colors</span>
        <span className="colors-dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="colors-dropdown-panel">
          <div className="colors-list">
            {DESIGN_THEMES.map((theme) => (
              <button
                key={theme.id}
                className={`colors-item ${
                  currentThemeId === theme.id ? "active" : ""
                }`}
                onClick={() => {
                  onThemeSelect(theme.id);
                  setIsOpen(false);
                }}
                title={theme.name}
              >
                <ColorPalettePreview colorTheme={theme.colorTheme} />
                <span className="colors-item-name">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
