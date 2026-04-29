import "./PreviewModal.css";

export default function PreviewModal({ slide, onClose }) {
  const title = slide.placeholders.find((p) => p.id === "title")?.content;
  const body = slide.placeholders.find((p) => p.id === "body")?.content;

  return (
    <div className="preview-overlay">
      <div className="preview-window">
        <button className="preview-close" onClick={onClose}>
          Close
        </button>

        <div className="reveal">
          <div className="slides">
            <section>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
