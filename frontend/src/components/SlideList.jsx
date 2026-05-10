import "./SlideList.css";

const getTextFromElement = (textElement) => {
  return textElement?.paragraphs?.[0]?.runs?.[0]?.text ?? "";
};

const THUMBNAIL_SCALE = 0.16;

export default function SlideList({ slides, selectedSlideId, onSelectSlide }) {
  return (
    <aside className="slide-list">
      <h3>Slides</h3>

      {(slides ?? []).map((slide, index) => {
        const textElements = slide.contents?.text ?? [];

        return (
          <div
            key={`slide-${index}`}
            className={
              selectedSlideId === index
                ? "slide-list-item active"
                : "slide-list-item"
            }
            onClick={() => onSelectSlide(index)}
          >
            <div className="slide-number">Slide {index + 1}</div>

            <div className="slide-thumbnail">
              {textElements.map((textElement) => (
                <div
                  key={textElement.id}
                  className="slide-thumbnail-element"
                  style={{
                    position: "absolute",
                    left: `${(textElement.position?.x ?? 0) * THUMBNAIL_SCALE}px`,
                    top: `${(textElement.position?.y ?? 0) * THUMBNAIL_SCALE}px`,
                    width: `${(textElement.width ?? 300) * THUMBNAIL_SCALE}px`,
                    height: `${(textElement.height ?? 80) * THUMBNAIL_SCALE}px`,
                  }}
                >
                  {getTextFromElement(textElement)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
