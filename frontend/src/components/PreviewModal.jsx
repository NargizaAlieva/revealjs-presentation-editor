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
              .map((slide, slideIndex) => {
                const textElements = slide.contents?.text ?? [];
                const mediaElements = slide.contents?.media ?? [];

                return (
                  <section
                    key={`slide-${slideIndex}`}
                    data-transition={slide.contents?.transition || "slide"}
                    style={{
                      background: slide.contents?.background || "white",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "960px",
                        height: "540px",
                        color: "black",
                        textAlign: "left",
                      }}
                    >
                      {textElements.map((textElement, index) => {
                        const formatting =
                          textElement.paragraphs?.[0]?.formatting ?? {};

                        return (
                          <div
                            key={textElement.id || index}
                            style={{
                              position: "absolute",
                              left: `${textElement.position?.x ?? 0}px`,
                              top: `${textElement.position?.y ?? 0}px`,
                              width: `${textElement.width ?? 300}px`,
                              height: `${textElement.height ?? 80}px`,
                              background: textElement.background ?? "transparent",
                              overflow: textElement.overflow ?? "hidden",
                              zIndex: textElement["z-index"] ?? index + 1,
                              transform: `rotate(${textElement.rotation ?? 0}deg)`,
                              fontSize: formatting.size ?? (index === 0 ? "34px" : "26px"),
                              fontWeight: formatting.weight ?? (index === 0 ? "bold" : "normal"),
                              fontStyle: formatting.italics ? "italic" : "normal",
                              color: formatting.color ?? "black",
                              textAlign: formatting.align ?? "left",
                              boxSizing: "border-box",
                            }}
                          >
                            {getTextFromElement(textElement)}
                          </div>
                        );
                      })}

                      {mediaElements.map((media, index) => (
                        <img
                          key={media.id || index}
                          src={media["file-link"]}
                          alt=""
                          style={{
                            position: "absolute",
                            left: `${media.position?.x ?? 0}px`,
                            top: `${media.position?.y ?? 0}px`,
                            width: `${media.width ?? 200}px`,
                            height: `${media.height ?? 120}px`,
                            objectFit: "contain",
                            zIndex: media["z-index"] ?? index + 1,
                            transform: `rotate(${media.rotation ?? 0}deg)`,
                          }}
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