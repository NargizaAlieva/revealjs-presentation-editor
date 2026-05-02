import { useEffect } from "react";
import Reveal from "reveal.js";
import "../../node_modules/reveal.js/dist/reveal.css";
import "../../node_modules/reveal.js/dist/theme/white.css";
import "./PreviewModal.css";

export default function PreviewModal({ slides, onClose }) {
  useEffect(() => {
    const deck = new Reveal({
      controls: true,
      progress: true,
      center: true,
      hash: false,
    });

    deck.initialize();

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
            {slides.map((slide) => {
              const title = slide.placeholders.find(
                (p) => p.id === "title",
              )?.content;
              const body = slide.placeholders.find(
                (p) => p.id === "body",
              )?.content;

              return (
                <section key={slide.id}>
                  <h2>{title}</h2>
                  <p>{body}</p>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}