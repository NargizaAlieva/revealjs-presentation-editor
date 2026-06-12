import { useState } from "react";
import { MdPreview } from "react-icons/md";
import "./TransitionsTab.css";

const TRANSITIONS = [
  { value: "none",    label: "None" },
  { value: "fade",    label: "Fade" },
  { value: "slide",   label: "Slide" },
  { value: "convex",  label: "Convex" },
  { value: "concave", label: "Concave" },
  { value: "zoom",    label: "Zoom" },
];

export default function TransitionsTab({
  currentTransition,
  currentDuration,
  onTransitionChange,
  onTransitionPreview,
  onDurationChange,
  onApplyToAll,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const duration = currentDuration ?? 0.75;

  const triggerPreview = (value) => {
    setIsPlaying(true);
    onTransitionPreview?.(value);
    setTimeout(() => setIsPlaying(false), 1200);
  };

  const handleClick = (value) => {
    onTransitionChange?.(value);
    triggerPreview(value);
  };

  const handlePreviewClick = () => {
    if (!currentTransition || currentTransition === "none") return;
    triggerPreview(currentTransition);
  };

  const handleDurationChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0.1 && val <= 9.99) {
      onDurationChange?.(Math.round(val * 100) / 100);
    }
  };

  const handleDurationStep = (delta) => {
    const next = Math.round((duration + delta) * 100) / 100;
    if (next >= 0.1 && next <= 9.99) {
      onDurationChange?.(next);
    }
  };

  return (
    <>
      <div className="ribbon-group transitions-preview-group">
        <button
          className={`toolbar-item large ${isPlaying ? "is-playing" : ""}`}
          onClick={handlePreviewClick}
          disabled={!currentTransition || currentTransition === "none"}
          title="Preview transition"
        >
          <MdPreview />
          <span>Preview</span>
        </button>
        <div className="ribbon-group-title">Preview</div>
      </div>

      <div className="ribbon-group ribbon-group--transitions">
        {TRANSITIONS.map((transition) => (
          <button
            key={transition.value}
            className={`transition-card ${currentTransition === transition.value ? "active" : ""}`}
            onClick={() => handleClick(transition.value)}
            title={transition.label}
          >
            <div className={`transition-preview transition-preview--${transition.value}`}>
              <span className="preview-square preview-square--a" />
              <span className="preview-square preview-square--b" />
            </div>
            <span className="transition-card-label">{transition.label}</span>
          </button>
        ))}
        <div className="ribbon-group-title">Transition to This Slide</div>
      </div>

      <div className="ribbon-group ribbon-group--timing-panel">
        <div className="timing-row">
          <span className="timing-icon">⏱</span>
          <span className="timing-label">Duration:</span>
          <div className="timing-input-wrap">
            <input
              type="number"
              className="timing-input"
              value={duration.toFixed(2)}
              min="0.10"
              max="9.99"
              step="0.25"
              onChange={handleDurationChange}
            />
            <div className="timing-spinners">
              <button
                className="timing-spinner-btn"
                onClick={() => handleDurationStep(0.25)}
                tabIndex={-1}
              >▲</button>
              <button
                className="timing-spinner-btn"
                onClick={() => handleDurationStep(-0.25)}
                tabIndex={-1}
              >▼</button>
            </div>
          </div>
        </div>

        <button
          className="apply-to-all-btn"
          onClick={onApplyToAll}
          disabled={!currentTransition}
        >
          <span className="apply-icon">⬛</span>
          Apply To All
        </button>

        <div className="ribbon-group-title">Timing</div>
      </div>
    </>
  );
}