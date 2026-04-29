import "./EditorCanvas.css";

export default function EditorCanvas({ slide, onChangePlaceholder }) {
  const titlePlaceholder = slide.placeholders.find(
    (placeholder) => placeholder.id === "title",
  );

  const bodyPlaceholder = slide.placeholders.find(
    (placeholder) => placeholder.id === "body",
  );

  return (
    <main className="canvas-wrapper">
      <section className="editor-slide">
        <input
          value={titlePlaceholder.content}
          onChange={(e) =>
            onChangePlaceholder(titlePlaceholder.id, e.target.value)
          }
          className="title-editor"
        />

        <textarea
          value={bodyPlaceholder.content}
          onChange={(e) =>
            onChangePlaceholder(bodyPlaceholder.id, e.target.value)
          }
          className="text-editor"
        />
      </section>
    </main>
  );
}
