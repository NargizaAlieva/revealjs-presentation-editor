import { useEffect, useRef } from "react";
import { useMediaSrc } from "../hooks/useMediaSrc";
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
  getTextLines,
  getVisibleSlidesForPreview,
  getSlideTextElements,
  getSlideMediaElements,
  getSlideDimensions,
  getSlideTransition,
  buildAnimationMap,
  getFragmentProps,
  getPerLineFragments,
} from "../core/render/revealRenderer";

function PreviewMediaElement({ media, index, fragmentProps }) {
  const src = useMediaSrc(media["file-link"]);
  return (
    <img
      src={src}
      alt=""
      style={buildMediaElementStyle(media, index)}
      {...fragmentProps}
    />
  );
}

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
      <div
        className="preview-window"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: "95vw",
          maxHeight: "95vh",
        }}
      >
        <button className="preview-close" onClick={onClose}>
          Close
        </button>

        <div className="reveal" ref={deckRef}>
          <div className="slides">
            {visibleSlides.map((slide, slideIndex) => {
              const textElements = getSlideTextElements(slide);
              const mediaElements = getSlideMediaElements(slide);
              const animationMap = buildAnimationMap(slide);

              return (
                <section
                  key={`slide-${slideIndex}`}
                  data-transition={getSlideTransition(slide)}
                  style={{ background: slide.contents?.background ?? "white" }}
                >
                  <div style={buildSlideContainerStyle(width, height)}>

                    {textElements.map((textElement, index) => {
                      const animation = animationMap.get(textElement.id);
                      const baseStyle = buildTextElementStyle(textElement, index);
                      const lines = getTextLines(textElement);
                      const perLine = getPerLineFragments(textElement, animation, lines);

                      if (perLine) {
                        return (
                          <div
                            key={textElement.id || index}
                            style={baseStyle}
                          >
                            {perLine.map((entry, lineIndex) => (
                              <p key={lineIndex} {...entry.fragmentProps}>
                                {entry.text}
                              </p>
                            ))}
                          </div>
                        );
                      }

                      const fragmentProps = getFragmentProps(animation);
                      return (
                        <div
                          key={textElement.id || index}
                          style={baseStyle}
                          {...fragmentProps}
                        >
                          {getTextContent(textElement)}
                        </div>
                      );
                    })}

                    {mediaElements.map((media, index) => {
                      const fragmentProps = getFragmentProps(animationMap.get(media.id));
                      return (
                        <PreviewMediaElement
                          key={media.id || index}
                          media={media}
                          index={index}
                          fragmentProps={fragmentProps}
                        />
                      );
                    })}

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