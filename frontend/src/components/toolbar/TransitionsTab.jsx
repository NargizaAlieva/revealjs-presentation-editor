import "./TransitionsTab.css";

const TRANSITIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "convex", label: "Convex" },
  { value: "concave", label: "Concave" },
  { value: "zoom", label: "Zoom" },
];

export default function TransitionsTab({
  currentTransition,
  onTransitionChange,
  onTransitionPreview,
}) {
  const handleClick = (value) => {
    onTransitionChange?.(value);
    onTransitionPreview?.(value);
  };

  return (
    <div className="ribbon-group ribbon-group--transitions">
      {TRANSITIONS.map((transition) => (
        <button
          key={transition.value}
          className={`transition-card ${currentTransition === transition.value ? "active" : ""
            }`}
          onClick={() => handleClick(transition.value)}
          title={transition.label}
        >
          <div
            className={`transition-preview transition-preview--${transition.value}`}
          >
            <span className="preview-square preview-square--a" />
            <span className="preview-square preview-square--b" />
          </div>
          <span className="transition-card-label">{transition.label}</span>
        </button>
      ))}
      <div className="ribbon-group-title">Transition to This Slide</div>
    </div>
  );
}