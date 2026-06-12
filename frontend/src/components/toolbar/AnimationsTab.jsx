import {
  MdBlock,
  MdCloseFullscreen,
  MdFormatListNumbered,
  MdNorth,
  MdOpacity,
  MdPreview,
  MdSouth,
  MdSpeed,
  MdStrikethroughS,
  MdWest,
  MdEast,
  MdZoomOutMap,
} from "react-icons/md";
import "./AnimationsTab.css";

const ANIMATION_EFFECTS = [
  { value: "none", label: "None", icon: MdBlock },
  { value: "fade-in", label: "Fade", icon: MdOpacity },
  { value: "fade-up", label: "Fade Up", icon: MdNorth },
  { value: "fade-down", label: "Fade Down", icon: MdSouth },
  { value: "fade-left", label: "Fade Left", icon: MdWest },
  { value: "fade-right", label: "Fade Right", icon: MdEast },
  { value: "grow", label: "Grow", icon: MdZoomOutMap },
  { value: "shrink", label: "Shrink", icon: MdCloseFullscreen },
  { value: "strike", label: "Strike", icon: MdStrikethroughS },
];

export default function AnimationsTab({
  onOpenPreview,
  selectedElement,
  animations,
  onAddAnimation,
  onUpdateAnimation,
  onDeleteAnimation,
}) {
  const animation = selectedElement
    ? (animations ?? []).find((item) => item.id === selectedElement.id)
    : null;

  const currentEffect = animation?.effect ?? "none";

  const handleEffectClick = (effectValue) => {
    if (!selectedElement) return;

    if (effectValue === "none") {
      if (animation) onDeleteAnimation?.(animation.id);
      return;
    }

    if (animation) {
      onUpdateAnimation?.(animation.id, { effect: effectValue });
      return;
    }

    onAddAnimation?.({
      id: selectedElement.id,
      sequence: (animations?.length ?? 0) + 1,
      effect: effectValue,
      speed: 1,
      "effect-options": {},
    });
  };

  return (
    <>
      <div className="ribbon-group transitions-preview-group">
        <button className="toolbar-item large" onClick={onOpenPreview}>
          <MdPreview />
          <span>Preview</span>
        </button>
        <div className="ribbon-group-title">Preview</div>
      </div>

      <div
        className={`ribbon-group ribbon-group--animations ${
          !selectedElement ? "is-disabled" : ""
        }`}
      >
        {ANIMATION_EFFECTS.map((effect) => {
          const Icon = effect.icon;

          return (
            <button
              key={effect.value}
              className={`effect-card ${
                currentEffect === effect.value ? "active" : ""
              }`}
              onClick={() => handleEffectClick(effect.value)}
              disabled={!selectedElement}
              title={effect.label}
            >
              <Icon className="effect-card-icon" />
              <span className="effect-card-label">{effect.label}</span>
            </button>
          );
        })}

        <div className="ribbon-group-title">
          {selectedElement
            ? `${selectedElement.label} — Animation`
            : "Select an element on the slide"}
        </div>
      </div>

      {animation && (
        <div className="ribbon-group ribbon-group--timing">
          <div className="timing-button timing-button--order">
            <MdFormatListNumbered className="timing-icon" />
            <span className="timing-label">Order</span>

            <div className="timing-stepper">
              <button
                type="button"
                className="timing-step-btn"
                onClick={() =>
                  onUpdateAnimation?.(animation.id, {
                    sequence: Math.max(1, (animation.sequence ?? 1) - 1),
                  })
                }
              >
                −
              </button>

              <span className="timing-value">{animation.sequence ?? 1}</span>

              <button
                type="button"
                className="timing-step-btn"
                onClick={() =>
                  onUpdateAnimation?.(animation.id, {
                    sequence: (animation.sequence ?? 1) + 1,
                  })
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="timing-button">
            <MdSpeed className="timing-icon" />
            <span className="timing-label">Speed</span>
            <span className="timing-value">
              {animation.speed === 0.5
                ? "Fast"
                : animation.speed === 2
                  ? "Slow"
                  : "Medium"}
            </span>

            <select
              className="timing-control"
              value={animation.speed ?? 1}
              onChange={(event) =>
                onUpdateAnimation?.(animation.id, {
                  speed: Number(event.target.value),
                })
              }
            >
              <option value={0.5}>Fast</option>
              <option value={1}>Medium</option>
              <option value={2}>Slow</option>
            </select>
          </div>

          <div className="ribbon-group-title">Timing</div>
        </div>
      )}
    </>
  );
}
