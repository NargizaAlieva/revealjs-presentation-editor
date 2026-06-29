import { useState, useRef, useEffect } from "react";
import "./ThemeColorsPicker.css";
import { DESIGN_THEMES } from "../../../core/model/designThemes";
import { ThemeColorEditor } from "./ThemeColorEditor";

function ColorPalettePreview({ colorTheme }) {
  return (
    <div className="theme-palette-preview">
      {colorTheme.slice(0, 6).map((entry, idx) => (
        <span
          key={idx}
          className="theme-palette-swatch"
          style={{ backgroundColor: entry.color }}
          title={entry["css-variable-name"]}
        />
      ))}
    </div>
  );
}

export function ThemeColorsPicker({
  currentColorTheme,
  onThemeSelect,
  onResetTheme,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
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
    <div className="theme-colors-picker" ref={ref}>
      <button
        className="theme-colors-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Colors</span>
        <span className="theme-colors-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="theme-colors-dropdown-panel">
          <div className="theme-colors-list">
            {DESIGN_THEMES.map((theme) => (
              <button
                key={theme.id}
                className="theme-colors-item"
                onClick={() => {
                  onThemeSelect(theme.id);
                  setIsOpen(false);
                }}
              >
                <ColorPalettePreview colorTheme={theme.colorTheme} />
                <span className="theme-colors-item-name">{theme.name}</span>
              </button>
            ))}
          </div>

          <div className="theme-colors-divider" />

          <button
            className="theme-colors-action-btn"
            onClick={() => setShowCustomizeDialog(true)}
          >
            🎨 Customize Colors...
          </button>

          <button
            className="theme-colors-action-btn"
            onClick={() => {
              onResetTheme();
              setIsOpen(false);
            }}
          >
            ↺ Reset Slide Theme Colors
          </button>
        </div>
      )}

      {showCustomizeDialog && (
        <div className="theme-customize-dialog-overlay">
          <div className="theme-customize-dialog">
            <div className="theme-customize-dialog-header">
              <h2>Customize Colors</h2>
              <button
                className="theme-customize-close-btn"
                onClick={() => setShowCustomizeDialog(false)}
              >
                ✕
              </button>
            </div>

            <div className="theme-customize-dialog-body">
              <ThemeColorEditor
                colorTheme={currentColorTheme}
                onColorChange={(variable, color) => {
                  // Color change handler will be passed from parent
                }}
              />
            </div>

            <div className="theme-customize-dialog-footer">
              <button
                className="theme-customize-cancel-btn"
                onClick={() => setShowCustomizeDialog(false)}
              >
                Cancel
              </button>
              <button
                className="theme-customize-save-btn"
                onClick={() => setShowCustomizeDialog(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
