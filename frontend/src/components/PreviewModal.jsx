import { useEffect, useRef } from "react";
import "reveal.js/reveal.css";
import "reveal.js/theme/white.css";
import "./PreviewModal.css";
import {
  initRevealDeck,
  buildTextElementStyle,
  buildMediaElementStyle,
  buildSlideContainerStyle,
  buildColorThemeStyle,
  getTextContent,
  getVisibleSlidesForPreview,
  getSlideTextElements,
  getSlideMediaElements,
  getSlideDimensions,
} from "../core/render/revealRenderer";

export default function PreviewModal({ slides, presentation, onClose }) {
  const deckRef = useRef(null);
  const { width, height } = getSlideDimensions(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  useEffect(() => {
    if (!deckRef.current) return;
    const deck = initRevealDeck(deckRef.current, width, height);
    return () => {
      deck.destroy();
    };
  }, [slides, width, height]);

  const visibleSlides = getVisibleSlidesForPreview(slides);

  return (
    <div className="preview-overlay" style={colorThemeStyle}>
      <div className="preview-window">
        <button className="preview-close" onClick={onClose}>
          Close
        </button>

        <div className="reveal" ref={deckRef}>
          <div className="slides">
            {visibleSlides.map((slide, slideIndex) => {
              const textElements = getSlideTextElements(slide);
              const mediaElements = getSlideMediaElements(slide);

              return (
                <section
                  key={`slide-${slideIndex}`}
                  data-transition={slide.contents?.transition ?? "slide"}
                  style={{ background: slide.contents?.background ?? "white" }}
                >
                  <div style={buildSlideContainerStyle(width, height)}>

                    {textElements.map((textElement, index) => (
                      <div
                        key={textElement.id || index}
                        style={buildTextElementStyle(textElement, index)}
                      >
                        {getTextContent(textElement)}
                      </div>
                    ))}

                    {mediaElements.map((media, index) => (
                      <img
                        key={media.id || index}
                        src={media["file-link"]}
                        alt=""
                        style={buildMediaElementStyle(media, index)}
                      />
                    ))}

                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}