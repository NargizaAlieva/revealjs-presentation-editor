import "./EditorCanvas.css";

export default function EditorCanvas({
  slide,
  onChangePlaceholder,
  onMovePlaceholder,
}) {
  return (
    <main className="canvas-wrapper">
      <section className="editor-slide">
        {slide.placeholders.map((p) => (
          <div
            key={p.id}
            className="draggable"
            style={{
              position: "absolute",
              left: p.position?.x || 0,
              top: p.position?.y || 0,
            }}
            draggable
            onDragEnd={(e) =>
              onMovePlaceholder(p.id, e.clientX - 300, e.clientY - 100)
            }
          >
            {p.id === "title" ? (
              <input
                value={p.content}
                onChange={(e) => onChangePlaceholder(p.id, e.target.value)}
              />
            ) : (
              <textarea
                value={p.content}
                onChange={(e) => onChangePlaceholder(p.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
