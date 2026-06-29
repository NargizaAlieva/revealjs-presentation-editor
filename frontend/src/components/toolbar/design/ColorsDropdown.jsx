import { useState, useRef, useEffect } from "react";
import "./ColorsDropdown.css";
import { COLOR_SCHEMES } from "../../../core/model/designThemes";

function ColorPalettePreview({ colors }) {
  return (
    <div className="colors-palette-preview">
      {colors.slice(0, 5).map((color, idx) => (
        <span
          key={idx}
          className="colors-palette-swatch"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

export function ColorsDropdown({ onColorSchemeSelect, currentSchemeId }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const currentScheme = COLOR_SCHEMES.find(s => s.id === currentSchemeId);
  const displayName = currentScheme?.name ?? "Colors";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  const handleItemClick = (scheme) => {
    onColorSchemeSelect(scheme);
    setIsOpen(false);
  };

  return (
    <div className="colors-dropdown-wrapper" ref={ref}>
      <button
        className="colors-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={displayName}
      >
        <span className="colors-dropdown-label">{displayName}</span>
        <span className="colors-dropdown-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="colors-dropdown-panel">
          <div className="colors-list">
            {COLOR_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                className={`colors-item ${
                  currentSchemeId === scheme.id ? "active" : ""
                }`}
                onClick={() => handleItemClick(scheme)}
                title={scheme.name}
              >
                <ColorPalettePreview colors={scheme.colors} />
                <span className="colors-item-name">{scheme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
