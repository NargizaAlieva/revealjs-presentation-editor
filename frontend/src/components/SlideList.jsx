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
        const slideTitle = slide.title?.content ?? `Slide ${index + 1}`;
        const isHidden = slide.hidden ?? false;

        return (
          <div
            key={`slide-${index}`}
            className={[
              "slide-list-item",
              selectedSlideId === index ? "active" : "",
              isHidden ? "hidden-slide" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectSlide(index)}
            title={isHidden ? `${slideTitle} (hidden)` : slideTitle}
          >
            <div className="slide-number">
              {index + 1}. {slideTitle}
              {isHidden && <span className="hidden-badge">hidden</span>}
            </div>

            <div className="slide-thumbnail">
              {textElements.map((textElement) => {
                const formatting =
                  textElement.paragraphs?.[0]?.formatting ?? {};
                const fontSize = parseInt(formatting.size ?? "16", 10);

                return (
                  <div
                    key={textElement.id}
                    className="slide-thumbnail-element"
                    style={{
                      position: "absolute",
                      left: `${(textElement.position?.x ?? 0) * THUMBNAIL_SCALE}px`,
                      top: `${(textElement.position?.y ?? 0) * THUMBNAIL_SCALE}px`,
                      width: `${(textElement.width ?? 300) * THUMBNAIL_SCALE}px`,
                      height: `${(textElement.height ?? 80) * THUMBNAIL_SCALE}px`,
                      fontSize: `${fontSize * THUMBNAIL_SCALE}px`,
                      fontWeight: formatting.weight ?? "normal",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getTextFromElement(textElement)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
