import { useState } from "react";
import { MdPreview, MdSpeed, MdSelectAll } from "react-icons/md";
import "./TransitionsTab.css";
import { TRANSITIONS, TRANSITION_SPEEDS, DEFAULT_TRANSITION_DURATION, PREVIEW_TRANSITION_MS } from "../../../core/model/transitionDefaults";

export default function TransitionsTab({
  currentTransition,
  currentDuration,
  onTransitionChange,
  onTransitionPreview,
  onDurationChange,
  onApplyToAll,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  const duration = currentDuration ?? DEFAULT_TRANSITION_DURATION;

  const triggerPreview = (value) => {
    setIsPlaying(true);
    onTransitionPreview?.(value);
    setTimeout(() => setIsPlaying(false), PREVIEW_TRANSITION_MS);
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
            {TRANSITION_SPEEDS.map((option) => (
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
          <div className="ribbon-group-title">Speed</div>
        </div>

        <div className="timing-divider" />

        <div className="apply-group">
          <button
            className="apply-to-all-btn"
            onClick={onApplyToAll}
            disabled={!currentTransition}
          >
            <MdSelectAll className="apply-icon-svg" />
            Apply To All
          </button>
        </div>
      </div>
    </>
  );
}
