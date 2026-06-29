export default function PlaceLinkPanel({
  slideTitles,
  selectedSlideIndex,
  showAndReturn,
  onSlideSelect,
  onShowAndReturnChange,
}) {
  return (
    <div className="insert-hyperlink-place-panel">
      <div className="insert-hyperlink-place-column">
        <span>Select a place in this document:</span>
        <div className="insert-hyperlink-slide-tree">
          <div className="insert-hyperlink-tree-root">
            <span className="insert-hyperlink-tree-toggle">⊟</span>
            <span>Slide Titles</span>
          </div>
          <div className="insert-hyperlink-tree-items">
            {slideTitles.map((title, index) => (
              <button
                type="button"
                key={`${title}-${index}`}
                className={selectedSlideIndex === index ? "selected" : ""}
                onClick={() => onSlideSelect(index)}
              >
                {index + 1}. {title}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="insert-hyperlink-preview-column">
        <span>Slide preview:</span>
        <div className="insert-hyperlink-slide-preview" />
        <label className="insert-hyperlink-checkbox">
          <input
            type="checkbox"
            checked={showAndReturn}
            onChange={(event) => onShowAndReturnChange(event.target.checked)}
          />
          <span>Show and return</span>
        </label>
      </div>
    </div>
  );
}
