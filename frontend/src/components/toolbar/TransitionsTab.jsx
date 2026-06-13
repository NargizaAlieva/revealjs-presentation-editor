import { useState } from "react";
import { MdPreview, MdSpeed } from "react-icons/md";
import "./TransitionsTab.css";

const TRANSITIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "convex", label: "Convex" },
  { value: "concave", label: "Concave" },
  { value: "zoom", label: "Zoom" },
];

const SPEEDS = [
  { value: 0.3, label: "Fast" },
  { value: 0.75, label: "Medium" },
  { value: 1.5, label: "Slow" },
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
        <div className="speed-group">
          <div className="speed-options">
            {SPEEDS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`speed-option ${duration === option.value ? "active" : ""}`}
                onClick={() => onDurationChange?.(option.value)}
              >
                <MdSpeed className="speed-option-icon" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          <div className="ribbon-group-title">Timing</div>
        </div>

        <div className="apply-group">
          <button
            className="apply-to-all-btn"
            onClick={onApplyToAll}
            disabled={!currentTransition}
          >
            <span className="apply-icon">⬛</span>
            Apply To All
          </button>
        </div>
      </div>
    </>
  );
}