import { useEffect, useState } from "react";
import "./EditorCanvas.css";
import { getSlideSize } from "../utils/slidesetRenderUtils";
import { buildColorThemeStyle } from "../core/render/revealRenderer";

export default function EditorCanvas({
  slide,
  presentation,
  onChangeTextElement,
  onMoveTextElement,
  onResizeTextElement,
  onFormatTextElement,
  onDeleteMedia,
  onMoveMediaElement,
  onResizeMediaElement,
  onDeleteTextElement,
  slideNotes,
  onUpdateSlideNotes,
  selectedElementId,
  onSelectElement,
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingElementId, setResizingElementId] = useState(null);
  const [draggingMediaId, setDraggingMediaId] = useState(null);
  const [resizingMediaId, setResizingMediaId] = useState(null);
  const { width, height } = getSlideSize(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  const textElements = slide?.contents?.text ?? [];
  const mediaElements = slide?.contents?.media ?? [];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Delete" && event.key !== "Backspace") return;

      const tagName = event.target.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA") return;

      if (!selectedElementId) return;

      const isTextElement = textElements.some(
        (element) => element.id === selectedElementId,
      );

      const isMediaElement = mediaElements.some(
        (element) => element.id === selectedElementId,
      );

      if (isTextElement) {
        onDeleteTextElement(selectedElementId);
        onSelectElement(null);
      }

      if (isMediaElement) {
        onDeleteMedia(selectedElementId);
        onSelectElement(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElementId,
    textElements,
    mediaElements,
    onDeleteTextElement,
    onDeleteMedia,
    onSelectElement,
  ]);

  if (!slide) {
    return (
      <main className="canvas-wrapper" style={colorThemeStyle}>
        <section className="editor-slide">No slide selected</section>
      </main>
    );
  }

  const handleMouseMove = (e) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    if (draggingMediaId) {
      const media = mediaElements.find((item) => item.id === draggingMediaId);
      if (!media) return;

      const canvasWidth = canvasRect.width;
      const canvasHeight = canvasRect.height;

      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      onMoveMediaElement(
        draggingMediaId,
        Math.max(0, Math.min(canvasWidth - (media.width ?? 300), newX)),
        Math.max(0, Math.min(canvasHeight - (media.height ?? 200), newY)),
      );

      return;
    }

    if (resizingMediaId) {
      const media = mediaElements.find((item) => item.id === resizingMediaId);
      if (!media) return;

      const mediaX = media.position?.x ?? 0;
      const mediaY = media.position?.y ?? 0;

      const newWidth = e.clientX - canvasRect.left - mediaX;
      const newHeight = e.clientY - canvasRect.top - mediaY;

      onResizeMediaElement(
        resizingMediaId,
        Math.max(80, Math.min(canvasRect.width - mediaX, newWidth)),
        Math.max(60, Math.min(canvasRect.height - mediaY, newHeight)),
      );

      return;
    }

    if (resizingElementId) {
      const element = textElements.find(
        (item) => item.id === resizingElementId,
      );
      if (!element) return;

      const newWidth = e.clientX - canvasRect.left - element.position.x;
      const newHeight = e.clientY - canvasRect.top - element.position.y;

      onResizeTextElement(
        resizingElementId,
        Math.max(
          100,
          Math.min(canvasRect.width - element.position.x, newWidth),
        ),
        Math.max(
          40,
          Math.min(canvasRect.height - element.position.y, newHeight),
        ),
      );
      return;
    }

    if (!draggingElementId) return;

    const element = textElements.find((item) => item.id === draggingElementId);
    if (!element) return;

    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    onMoveTextElement(
      draggingElementId,
      Math.max(0, Math.min(canvasWidth - (element.width ?? 300), newX)),
      Math.max(0, Math.min(canvasHeight - (element.height ?? 80), newY)),
    );
  };

  const stopInteraction = () => {
    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingElementId(null);
    setResizingMediaId(null);
  };

  return (
    <main className="canvas-wrapper" style={colorThemeStyle}>
      <section
        className="editor-slide"
        style={{ width: `${width}px`, height: `${height}px`, background: "var(--bg-light, white)", color: "var(--text-dark, black)", }}
        onMouseMove={handleMouseMove}
        onMouseUp={stopInteraction}
        onMouseLeave={stopInteraction}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelectElement(null);
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
              onMouseDown={() => onSelectElement(textElement.id)}
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
                        const rect =
                          e.currentTarget.parentElement.getBoundingClientRect();
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
                <button
                  type="button"
                  className="element-delete-button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTextElement(textElement.id);
                    onSelectElement(null);
                  }}
                >
                  Delete
                </button>
              )}

              {isSelected && (
                <div className="format-toolbar">
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormatTextElement(textElement.id, {
                        weight:
                          formatting.weight === "bold" ? "normal" : "bold",
                      });
                    }}
                    style={{
                      fontWeight:
                        formatting.weight === "bold" ? "bold" : "normal",
                    }}
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
                    style={{
                      fontStyle: formatting.italics ? "italic" : "normal",
                    }}
                  >
                    I
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormatTextElement(textElement.id, {
                        align: "left",
                      });
                    }}
                  >
                    L
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormatTextElement(textElement.id, {
                        align: "center",
                      });
                    }}
                  >
                    C
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFormatTextElement(textElement.id, {
                        align: "right",
                      });
                    }}
                  >
                    R
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

                  <label className="line-spacing-control">
                    LS
                    <select
                      title="Line Spacing"
                      value={formatting["line-spacing"] ?? 1.15}
                      onMouseDown={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        onFormatTextElement(textElement.id, {
                          "line-spacing": Number(e.target.value),
                        })
                      }
                    >
                      <option value={1}>1.0</option>
                      <option value={1.15}>1.15</option>
                      <option value={1.5}>1.5</option>
                      <option value={2}>2.0</option>
                      <option value={2.5}>2.5</option>
                      <option value={3}>3.0</option>
                    </select>
                  </label>
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
                    color: formatting.color ?? "var(--text-dark, black)",
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
                    lineHeight: formatting["line-spacing"] ?? 1.2,
                    color: formatting.color ?? "var(--text-dark, black)",
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
        {mediaElements.map((media) => {
          const isSelected = selectedElementId === media.id;

          return (
            <div
              key={media.id}
              className={
                isSelected
                  ? "canvas-media-wrapper selected"
                  : "canvas-media-wrapper"
              }
              style={{
                position: "absolute",
                left: `${media.position?.x ?? 0}px`,
                top: `${media.position?.y ?? 0}px`,
                width: `${media.width ?? 300}px`,
                height: `${media.height ?? 200}px`,
                zIndex: media["z-index"] ?? 1,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelectElement(media.id);

                const rect = e.currentTarget.getBoundingClientRect();
                setDraggingMediaId(media.id);
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              <img
                src={media["file-link"]}
                alt=""
                className="canvas-media"
                style={{
                  width: "100%",
                  height: "100%",
                  transform: `rotate(${media.rotation ?? 0}deg)`,
                }}
              />

              {isSelected && (
                <button
                  type="button"
                  className="media-delete-button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMedia(media.id);
                    onSelectElement(null);
                  }}
                >
                  Delete
                </button>
              )}

              {isSelected && (
                <div
                  className="resize-handle"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizingMediaId(media.id);
                  }}
                />
              )}
            </div>
          );
        })}
      </section>
      <div className="slide-notes">
        <label>Slide Notes</label>
        <textarea
          value={slideNotes}
          onChange={(e) => onUpdateSlideNotes(e.target.value)}
          placeholder="Add speaker notes..."
        />
      </div>
    </main>
  );
}