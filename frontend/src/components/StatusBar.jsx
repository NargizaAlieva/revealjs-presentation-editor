import "./StatusBar.css";

export default function StatusBar({
  selectedSlideIndex,
  totalSlides,
  zoom,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  showNotes,
  onToggleNotes,
}) {
  return (
    <footer className="status-bar">
      <div className="status-left">
        <span>
          Slide {selectedSlideIndex + 1} of {totalSlides}
        </span>
      </div>

      <div className="status-right">
        <button
          className={`status-button ${showNotes ? "active" : ""}`}
          onClick={onToggleNotes}
        >
          Notes
        </button>

        <button className="zoom-button" onClick={onZoomOut} title="Zoom Out">
          −
        </button>

        <input
          className="zoom-slider"
          type="range"
          min="25"
          max="200"
          step="5"
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
        />

        <button className="zoom-button" onClick={onZoomIn} title="Zoom In">
          +
        </button>

        <span className="zoom-value">{zoom}%</span>
      </div>
    </footer>
  );
}
