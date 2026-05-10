import { useEffect } from "react";
import Reveal from "reveal.js";
import "reveal.js/reveal.css";
import "reveal.js/theme/white.css";
import "./PreviewModal.css";

function getTextFromElement(textElement) {
  return (
    textElement?.paragraphs
      ?.map((paragraph) =>
        paragraph?.runs?.map((run) => run?.text || "").join("")
      )
      .join("\n") || ""
  );
}

function getTextElements(slide) {
  return slide?.contents?.text || [];
}

function getMediaElements(slide) {
  return slide?.contents?.media || [];
}

export default function PreviewModal({ slides, onClose }) {
  useEffect(() => {
    const deck = new Reveal({
      controls: true,
      progress: true,
      center: false,
      hash: false,
      embedded: true,
    });

    deck.initialize();

    return () => {
      deck.destroy();
    };
  }, [slides]);

  return (
    <div className="preview-overlay">
      <div className="preview-window">
        <button className="preview-close" onClick={onClose}>
          Close
        </button>

        <div className="reveal">
          <div className="slides">
            {slides
              .filter((slide) => !slide.hidden)
              .map((slide, slideIndex) => (
                <section
                  key={`${slide.title || "slide"}-${slideIndex}`}
                  data-transition={slide.contents?.transition || "slide"}
                  style={{
                    position: "relative",
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
                        overflow: textElement.overflow || "hidden",
                        zIndex:
                          textElement["z-index"] || textElement.zindex || 1,
                        transform: `rotate(${textElement.rotation || 0}deg)`,
                      }}
                    >
                      {getTextFromElement(textElement)}
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
    </div>
  );
}