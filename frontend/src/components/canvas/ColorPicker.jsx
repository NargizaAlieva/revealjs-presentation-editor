import { useRef, useEffect } from "react";
import "./ColorPicker.css";

const THEME_COLORS = [
  [
    "#FFFFFF",
    "#000000",
    "#E7E6E6",
    "#44546A",
    "#4472C4",
    "#ED7D31",
    "#A9D18E",
    "#FF0000",
    "#FFD966",
    "#8EA9C1",
  ],
  [
    "#F2F2F2",
    "#808080",
    "#CFCECE",
    "#D6DCE4",
    "#D9E1F2",
    "#FCE4D6",
    "#E2EFDA",
    "#FFE2E2",
    "#FFF2CC",
    "#DEEAF1",
  ],
  [
    "#D9D9D9",
    "#595959",
    "#AEABAB",
    "#ADB9CA",
    "#B4C6E7",
    "#F8CBAD",
    "#C6EFCE",
    "#FFC7CE",
    "#FFEB9C",
    "#BDD7EE",
  ],
  [
    "#BFBFBF",
    "#404040",
    "#747070",
    "#8496B0",
    "#8FAADC",
    "#F4B183",
    "#A9D18E",
    "#FF9999",
    "#FFCC00",
    "#9DC3E6",
  ],
  [
    "#A6A6A6",
    "#262626",
    "#3A3838",
    "#323F4F",
    "#2E75B6",
    "#C55A11",
    "#538135",
    "#C00000",
    "#BF8F00",
    "#2E75B6",
  ],
  [
    "#7F7F7F",
    "#0D0D0D",
    "#171616",
    "#212934",
    "#1F4E79",
    "#833C00",
    "#375623",
    "#820000",
    "#7F5F00",
    "#1F3864",
  ],
];

const STANDARD_COLORS = [
  "#C00000",
  "#FF0000",
  "#FFC000",
  "#FFFF00",
  "#92D050",
  "#00B050",
  "#00B0F0",
  "#0070C0",
  "#002060",
  "#7030A0",
];

export default function ColorPicker({
  color,
  onChange,
  onClose,
  style,
  allowNoColor = false,
  onNoColor,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const pick = (c) => {
    onChange(c);
    onClose?.();
  };

  return (
    <div
      className="cp-popup"
      ref={ref}
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {allowNoColor && (
        <>
          <button
            type="button"
            className="cp-no-color"
            onClick={() => {
              onNoColor?.();
              onClose?.();
            }}
          >
            <span className="cp-no-color-icon" aria-hidden="true" />
            No Color
          </button>
          <div className="cp-divider" />
        </>
      )}

      <div className="cp-label">Theme Colors</div>
      <div className="cp-grid">
        {THEME_COLORS.map((row, ri) =>
          row.map((c, ci) => (
            <button
              key={`${ri}-${ci}`}
              className={`cp-swatch${color === c ? " cp-swatch--active" : ""}`}
              style={{ background: c }}
              title={c}
              onClick={() => pick(c)}
            />
          )),
        )}
      </div>

      <div className="cp-label cp-label--std">Standard Colors</div>
      <div className="cp-row">
        {STANDARD_COLORS.map((c) => (
          <button
            key={c}
            className={`cp-swatch${color === c ? " cp-swatch--active" : ""}`}
            style={{ background: c }}
            title={c}
            onClick={() => pick(c)}
          />
        ))}
      </div>

      <div className="cp-divider" />

      <label className="cp-more">
        <span className="cp-more-icon">🎨</span>
        More Colors...
        <input
          type="color"
          value={color?.length === 7 ? color : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
}
