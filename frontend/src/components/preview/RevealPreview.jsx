import {
  getSlideSize,
  getVisibleSlides,
  getTextElements,
  getTextFromTextElement,
} from "../../utils/slidesetRenderUtils";

export default function RevealPreview({ presentation }) {
  const { width, height } = getSlideSize(presentation);
  const slides = getVisibleSlides(presentation);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "420px",
        border: "1px solid #ddd",
        background: "#f5f5f5",
      }}
    >
      <div className="reveal">
        <div className="slides">
          {slides.map((slide, slideIndex) => (
            <section
              key={`${slide.title || "slide"}-${slideIndex}`}
              style={{
                position: "relative",
                width: `${width}px`,
                height: `${height}px`,
                background: slide.contents?.background || "white",
              }}
            >
              {getTextElements(slide).map((textElement) => (
                <div
                  key={textElement.id}
                  style={{
                    position: "absolute",
                    left: `${textElement.position?.x || 0}px`,
                    top: `${textElement.position?.y || 0}px`,
                    width: `${textElement.width || 300}px`,
                    height: `${textElement.height || 80}px`,
                    background: textElement.background || "transparent",
                  }}
                >
                  {getTextFromTextElement(textElement)}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}