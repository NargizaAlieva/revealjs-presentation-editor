import { useState } from "react";
import "./EditorCanvas.css";

export default function EditorCanvas({
  slide,
  onChangeTextElement,
  onMoveTextElement,
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!slide) {
    return (
      <main className="canvas-wrapper">
        <section className="editor-slide">No slide selected</section>
      </main>
    );
  }

  const textElements = slide.contents?.text ?? [];

  const handleMouseMove = (e) => {
    if (!draggingElementId) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    onMoveTextElement(draggingElementId, newX, newY);
  };

  const stopDragging = () => {
    setDraggingElementId(null);
  };

  return (
    <main className="canvas-wrapper">
      <section
        className="editor-slide"
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        {textElements.map((textElement) => {
          const text = textElement.paragraphs?.[0]?.runs?.[0]?.text ?? "";

          const isTitle = textElement.role === "title";

          return (
            <div
              key={textElement.id}
              className="draggable"
              style={{
                position: "absolute",
                left: `${textElement.position?.x ?? 0}px`,
                top: `${textElement.position?.y ?? 0}px`,
                width: `${textElement.width ?? 300}px`,
                height: `${textElement.height ?? 80}px`,
                background: textElement.background ?? "transparent",
                zIndex: textElement["z-index"] ?? textElement.zindex ?? 1,
              }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();

                setDraggingElementId(textElement.id);
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              {isTitle ? (
                <input
                  value={text}
                  onChange={(e) =>
                    onChangeTextElement(textElement.id, e.target.value)
                  }
                />
              ) : (
                <textarea
                  value={text}
                  onChange={(e) =>
                    onChangeTextElement(textElement.id, e.target.value)
                  }
                />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
