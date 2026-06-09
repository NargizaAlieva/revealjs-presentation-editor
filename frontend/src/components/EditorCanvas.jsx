import { useState } from "react";
import "./EditorCanvas.css";

export default function EditorCanvas({
  slide,
  onChangeTextElement,
  onMoveTextElement,
  onResizeTextElement,
  onFormatTextElement,
}) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingElementId, setResizingElementId] = useState(null);

  if (!slide) {
    return (
      <main className="canvas-wrapper">
        <section className="editor-slide">No slide selected</section>
      </main>
    );
  }

  const textElements = slide.contents?.text ?? [];

  const handleMouseMove = (e) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();

    if (resizingElementId) {
      const element = textElements.find((item) => item.id === resizingElementId);
      if (!element) return;

      const newWidth = e.clientX - canvasRect.left - element.position.x;
      const newHeight = e.clientY - canvasRect.top - element.position.y;

      onResizeTextElement(
        resizingElementId,
        Math.max(100, newWidth),
        Math.max(40, newHeight),
      );
      return;
    }

    if (!draggingElementId) return;

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    onMoveTextElement(draggingElementId, newX, newY);
  };

  const stopInteraction = () => {
    setDraggingElementId(null);
    setResizingElementId(null);
  };

  return (
    <main className="canvas-wrapper">
      <section
        className="editor-slide"
        onMouseMove={handleMouseMove}
        onMouseUp={stopInteraction}
        onMouseLeave={stopInteraction}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedElementId(null);
        }}
      >
        {textElements.map((textElement) => {
          const text = textElement.paragraphs?.[0]?.runs?.[0]?.text ?? "";
          const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
          const isTitle = textElement["placeholder-id"]?.includes("title");
          const isSelected = selectedElementId === textElement.id;

          return (
            <div
              key={textElement.id}
              className={isSelected ? "draggable selected" : "draggable"}
              style={{
                position: "absolute",
                left: `${textElement.position?.x ?? 0}px`,
                top: `${textElement.position?.y ?? 0}px`,
                width: `${textElement.width ?? 300}px`,
                height: `${textElement.height ?? 80}px`,
                background: textElement.background ?? "transparent",
                zIndex: textElement["z-index"] ?? 1,
              }}
              onMouseDown={() => setSelectedElementId(textElement.id)}
            >
              {/* Drag handle — only visible when selected */}
              {isSelected && (
  <>
                {["top", "right", "bottom", "left"].map((side) => (
                  <div
                    key={side}
                    className={`drag-border drag-border-${side}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.parentElement.getBoundingClientRect();
                      setDraggingElementId(textElement.id);
                      setDragOffset({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }}
                  />
                ))}
              </>
            )}

              {isSelected && (
                <div className="format-toolbar">
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormatTextElement(textElement.id, {
                        weight: formatting.weight === "bold" ? "normal" : "bold",
                      });
                    }}
                    style={{ fontWeight: formatting.weight === "bold" ? "bold" : "normal" }}
                  >
                    B
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormatTextElement(textElement.id, {
                        italics: !formatting.italics,
                      });
                    }}
                    style={{ fontStyle: formatting.italics ? "italic" : "normal" }}
                  >
                    I
                  </button>

                  <input
                    type="number"
                    min={8}
                    max={96}
                    value={parseInt(formatting.size ?? "24", 10)}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      onFormatTextElement(textElement.id, {
                        size: `${e.target.value}px`,
                      })
                    }
                    style={{ width: "52px" }}
                  />
                </div>
              )}

              {isTitle ? (
                <input
                  value={text}
                  onChange={(e) =>
                    onChangeTextElement(textElement.id, e.target.value)
                  }
                  style={{
                    fontSize: formatting.size ?? "24px",
                    fontWeight: formatting.weight ?? "normal",
                    fontStyle: formatting.italics ? "italic" : "normal",
                    textAlign: formatting.align ?? "left",
                  }}
                />
              ) : (
                <textarea
                  value={text}
                  onChange={(e) =>
                    onChangeTextElement(textElement.id, e.target.value)
                  }
                  style={{
                    fontSize: formatting.size ?? "24px",
                    fontWeight: formatting.weight ?? "normal",
                    fontStyle: formatting.italics ? "italic" : "normal",
                    textAlign: formatting.align ?? "left",
                  }}
                />
              )}

              {isSelected && (
                <div
                  className="resize-handle"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizingElementId(textElement.id);
                  }}
                />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}