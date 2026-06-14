import { useEffect, useRef, useState, useCallback } from "react";
import { useMediaSrc } from "../hooks/useMediaSrc";
import "reveal.js/reveal.css";
import "reveal.js/theme/white.css";
import "./PreviewModal.css";
import SlideDecorations from "./canvas/SlideDecorations";
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
  const isVideo = media["media-type"] === "video";

  if (isVideo) {
    return (
      <video
        src={src}
        style={buildMediaElementStyle(media, index)}
        controls
        preload="metadata"
        {...fragmentProps}
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      style={buildMediaElementStyle(media, index)}
      {...fragmentProps}
    />
  );
}

export default function PreviewModal({ slides, presentation, onClose, initialSlide = 0 }) {
  const deckRef = useRef(null);
  const deckInstanceRef = useRef(null);
  const { width, height } = getSlideDimensions(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);
  const [showUI, setShowUI] = useState(false);
  const hideTimerRef = useRef(null);

  const handleMouseMove = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowUI(false), 2000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!deckRef.current) return;
    const deck = initRevealDeck(deckRef.current, width, height, initialSlide);
    deckInstanceRef.current = deck;
    return () => {
      deck.destroy();
      deckInstanceRef.current = null;
    };
  }, [slides, width, height, initialSlide]);

  const handleClick = useCallback((e) => {
    if (e.target.closest(".preview-close")) return;
    const deck = deckInstanceRef.current;
    if (!deck) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width / 2) {
      deck.next();
    } else {
      deck.prev();
    }
  }, []);

  const visibleSlides = getVisibleSlidesForPreview(slides);

  return (
    <div
      className={`preview-overlay${showUI ? " show-ui" : ""}`}
      style={colorThemeStyle}
      onMouseMove={handleMouseMove}
    >
      <div className="preview-window" onClick={handleClick}>
        <button
          className="preview-close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          ✕
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
                  style={{
                    background:
                      !slide?.contents?.background || slide.contents.background === "#FFFFFFFF"
                        ? "var(--bg-light, white)"
                        : slide.contents.background,
                  }}                >
                  <div style={buildSlideContainerStyle(width, height)}>
                    <SlideDecorations
                      presentation={presentation}
                      width={width}
                      height={height}
                    />
                    {textElements.map((textElement, index) => {
                      const animation = animationMap.get(textElement.id);
                      const baseStyle = buildTextElementStyle(textElement, index);
                      const lines = getTextLines(textElement);
                      const perLine = getPerLineFragments(textElement, animation, lines);

                      if (perLine) {
                        return (
                          <div key={textElement.id || index} style={baseStyle}>
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