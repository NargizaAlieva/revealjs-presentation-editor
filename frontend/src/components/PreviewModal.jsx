import { useEffect } from "react";
import Reveal from "reveal.js";
import "../../node_modules/reveal.js/dist/reveal.css";
import "../../node_modules/reveal.js/dist/theme/white.css";
import "./PreviewModal.css";

const getTextFromElement = (textElement) => {
  return textElement.paragraphs?.[0]?.runs?.[0]?.text ?? "";
};

export default function PreviewModal({ slides, onClose }) {
  useEffect(() => {
    const deck = new Reveal({
      controls: true,
      progress: true,
      center: true,
      hash: false,
    });

    deck.initialize();
    deck.sync();

    return () => {
      deck.destroy();
    };
  }, []);

  return (
    <div className="preview-overlay">
      <div className="preview-window">
        <button className="preview-close" onClick={onClose}>
          Close
        </button>

        <div className="reveal">
          <div className="slides">
            {(slides ?? []).map((slide, slideIndex) => {
              const textElements = slide.contents?.text ?? [];

              return (
                <section key={slideIndex}>
                  {textElements.map((textElement) => {
                    const text = getTextFromElement(textElement);
                    const isTitle =
                      textElement["placeholder-id"] === "title-placeholder";

                    return isTitle ? (
                      <h2 key={textElement.id}>{text}</h2>
                    ) : (
                      <p key={textElement.id}>{text}</p>
                    );
                  })}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}