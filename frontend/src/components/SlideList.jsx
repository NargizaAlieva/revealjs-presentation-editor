import "./SlideList.css";

const getTextFromElement = (textElement) => {
  return textElement?.paragraphs?.[0]?.runs?.[0]?.text ?? "";
};

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;

const SCALE_X = THUMBNAIL_WIDTH / SLIDE_WIDTH;
const SCALE_Y = THUMBNAIL_HEIGHT / SLIDE_HEIGHT;

export default function SlideList({ slides, selectedSlideId, onSelectSlide }) {
  return (
    <aside className="slide-list">
      <h3>Slides</h3>

      {(slides ?? []).map((slide, index) => {
        const textElements = slide.contents?.text ?? [];
        const mediaElements = slide.contents?.media ?? [];
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
                      left: `${(textElement.position?.x ?? 0) * SCALE_X}px`,
                      top: `${(textElement.position?.y ?? 0) * SCALE_Y}px`,
                      width: `${(textElement.width ?? 300) * SCALE_X}px`,
                      height: `${(textElement.height ?? 80) * SCALE_Y}px`,
                      fontSize: `${fontSize * SCALE_Y}px`,
                      fontWeight: formatting.weight ?? "normal",
                      textAlign: formatting.align ?? "left",
                      margin: 0,
                      padding: 0,
                      lineHeight: 1,
                      boxSizing: "border-box",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getTextFromElement(textElement)}
                  </div>
                );
              })}
              {mediaElements.map((media) => (
                <img
                  key={media.id}
                  src={media["file-link"]}
                  alt=""
                  className="slide-thumbnail-media"
                  style={{
                    position: "absolute",
                    left: `${(media.position?.x ?? 0) * SCALE_X}px`,
                    top: `${(media.position?.y ?? 0) * SCALE_Y}px`,
                    width: `${(media.width ?? 300) * SCALE_X}px`,
                    height: `${(media.height ?? 200) * SCALE_Y}px`,
                    objectFit: "contain",
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </aside>
  );
}
