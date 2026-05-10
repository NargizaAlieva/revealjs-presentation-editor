import { useEffect, useRef } from "react";
import Reveal from "reveal.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";

import {
  getSlideSize,
  getVisibleSlides,
  getTextElements,
  getTextFromTextElement,
  getMediaElements,
} from "../../utils/slidesetRenderUtils";

export default function RevealPreview({ presentation }) {
  const deckRef = useRef(null);
  const revealInstanceRef = useRef(null);

  const { width, height } = getSlideSize(presentation);
  const slides = getVisibleSlides(presentation);

  useEffect(() => {
    if (!deckRef.current) return;

    if (revealInstanceRef.current) {
      revealInstanceRef.current.destroy();
      revealInstanceRef.current = null;
    }

    const deck = new Reveal(deckRef.current, {
      embedded: true,
      controls: true,
      progress: true,
      center: false,
      width,
      height,
      transition: "slide",
    });

    deck.initialize();
    revealInstanceRef.current = deck;

    return () => {
      if (revealInstanceRef.current) {
        revealInstanceRef.current.destroy();
        revealInstanceRef.current = null;
      }
    };
  }, [presentation, width, height]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "420px",
        border: "1px solid #ddd",
        background: "#f5f5f5",
      }}
    >
      <div className="reveal" ref={deckRef}>
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
              data-transition={slide.contents?.transition || "slide"}
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
                    overflow: textElement.overflow || "hidden",
                    zIndex: textElement["z-index"] || textElement.zindex || 1,
                    transform: `rotate(${textElement.rotation || 0}deg)`,
                  }}
                >
                  {getTextFromTextElement(textElement)}
                </div>
              ))}

              {getMediaElements(slide).map((media) => (
                <img
                  key={media.id}
                  src={media["file-link"]}
                  alt=""
                  style={{
                    position: "absolute",
                    left: `${media.position?.x || 0}px`,
                    top: `${media.position?.y || 0}px`,
                    width: `${media.width || 200}px`,
                    height: `${media.height || 120}px`,
                    objectFit: "contain",
                    zIndex: media["z-index"] || media.zindex || 1,
                    transform: `rotate(${media.rotation || 0}deg)`,
                  }}
                />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}