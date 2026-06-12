import { useEffect } from "react";
import "./EditorCanvas.css";
import { getSlideSize } from "../utils/slidesetRenderUtils";
import { buildColorThemeStyle } from "../core/render/revealRenderer";
import { useCanvasInteractions } from "../hooks/useCanvasInteractions";
import TextElement from "./canvas/TextElement";
import MediaElement from "./canvas/MediaElement";

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
  zoom = 100,
  showNotes = true,
  onCanvasZoom,
}) {
  const { width, height } = getSlideSize(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  const zoomScale = zoom / 100;
  const scaledWidth = width * zoomScale;
  const scaledHeight = height * zoomScale;

  const textElements = slide?.contents?.text ?? [];
  const mediaElements = slide?.contents?.media ?? [];

  const {
    selectedElementId,
    setSelectedElementId,
    handleMouseMove,
    stopInteraction,
    startDraggingText,
    startDraggingMedia,
    setResizingElementId,
    setResizingMediaId,
  } = useCanvasInteractions({
    width,
    height,
    zoom,
    textElements,
    mediaElements,
    onMoveTextElement,
    onResizeTextElement,
    onMoveMediaElement,
    onResizeMediaElement,
  });

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
        setSelectedElementId(null);
      }

      if (isMediaElement) {
        onDeleteMedia(selectedElementId);
        setSelectedElementId(null);
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
    setSelectedElementId,
  ]);

  const handleWorkspaceWheel = (event) => {
    if (!event.ctrlKey) return;

    event.preventDefault();
    event.stopPropagation();

    const delta = event.deltaY < 0 ? 2 : -2;
    onCanvasZoom?.(delta);
  };

  if (!slide) {
    return (
      <main className="canvas-wrapper" style={colorThemeStyle}>
        <div className="slide-workspace">
          <section className="editor-slide">No slide selected</section>
        </div>
      </main>
    );
  }

  return (
    <main className="canvas-wrapper" style={colorThemeStyle}>
      <div className="slide-workspace" onWheel={handleWorkspaceWheel}>
        <div
          className="zoom-stage"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
          }}
        >
          <div
            className="editor-slide"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              background: "var(--bg-light, white)",
              color: "var(--text-dark, black)",
              transform: `scale(${zoomScale})`,
              transformOrigin: "top left",
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={stopInteraction}
            onMouseLeave={stopInteraction}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedElementId(null);
              }
            }}
          >
            {textElements.map((textElement) => (
              <TextElement
                key={textElement.id}
                textElement={textElement}
                isSelected={selectedElementId === textElement.id}
                onSelect={setSelectedElementId}
                onChangeTextElement={onChangeTextElement}
                onFormatTextElement={onFormatTextElement}
                onDeleteTextElement={(id) => {
                  onDeleteTextElement(id);
                  setSelectedElementId(null);
                }}
                onStartDrag={startDraggingText}
                onStartResize={setResizingElementId}
              />
            ))}

            {mediaElements.map((media) => (
              <MediaElement
                key={media.id}
                media={media}
                isSelected={selectedElementId === media.id}
                onStartDrag={startDraggingMedia}
                onDeleteMedia={(id) => {
                  onDeleteMedia(id);
                  setSelectedElementId(null);
                }}
                onStartResize={setResizingMediaId}
              />
            ))}
          </div>
        </div>
      </div>

      {showNotes && (
        <div className="slide-notes">
          <textarea
            value={slideNotes}
            onChange={(event) => onUpdateSlideNotes(event.target.value)}
            placeholder="Click to add notes"
          />
        </div>
      )}
    </main>
  );
}
