import { useEffect, useRef } from "react";
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
  if (slide?.contents?.text?.length) {
    return slide.contents.text;
  }

  if (slide?.placeholders?.length) {
    return slide.placeholders.map((placeholder, index) => {
      const isTitle = placeholder.id === "title" || placeholder.role === "title";

      return {
        id: placeholder.id || `placeholder-${index}`,
        position: placeholder.position || {
          x: 80,
          y: isTitle ? 80 : 180,
        },
        width: placeholder.width || 800,
        height: placeholder.height || (isTitle ? 80 : 200),
        rotation: 0,
        overflow: "hidden",
        background: "transparent",
        paragraphs: [
          {
            id: `${placeholder.id || index}-paragraph`,
            runs: [{ text: placeholder.content || "" }],
          },
        ],
        "z-index": index + 1,
        formatting: {
          size: isTitle ? 36 : 24,
          weight: isTitle ? "bold" : "normal",
        },
      };
    });
  }

  if (slide?.title) {
    return [
      {
        id: "fallback-title",
        position: { x: 80, y: 80 },
        width: 800,
        height: 80,
        rotation: 0,
        overflow: "hidden",
        background: "transparent",
        paragraphs: [
          {
            id: "fallback-title-paragraph",
            runs: [{ text: slide.title }],
          },
        ],
        "z-index": 1,
        formatting: {
          size: 36,
          weight: "bold",
        },
      },
    ];
  }

  return [];
}

function getMediaElements(slide) {
  return slide?.contents?.media || [];
}

export default function PreviewModal({ slides, onClose }) {
  const deckRef = useRef(null);

  useEffect(() => {
    if (!deckRef.current) return;

    const deck = new Reveal(deckRef.current, {
      controls: true,
      progress: true,
      center: false,
      hash: false,
      embedded: true,
      width: 960,
      height: 540,
      margin: 0,
      minScale: 1,
      maxScale: 1,
    });

    deck.initialize().then(() => {
      deck.layout();
    });

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

        <div className="reveal" ref={deckRef}>
          <div className="slides">
            {(slides || [])
              .filter((slide) => !slide.hidden)
              .map((slide, slideIndex) => (
                <section
                  key={`${slide.title || "slide"}-${slideIndex}`}
                  data-transition={slide.contents?.transition || "slide"}
                  style={{
                    background: slide.contents?.background || "white",
                  }}
                >
                  <div
                    style={{
                      padding: "80px 120px",
                      color: "black",
                      textAlign: "left",
                    }}
                  >
                    {getTextElements(slide).map((textElement, index) => (
                      <div
                        key={textElement.id || index}
                        style={{
                          fontSize: index === 0 ? "34px" : "26px",
                          fontWeight: index === 0 ? "bold" : "normal",
                          marginBottom: "40px",
                        }}
                      >
                        {getTextFromElement(textElement)}
                      </div>
                    ))}
                  </div>

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