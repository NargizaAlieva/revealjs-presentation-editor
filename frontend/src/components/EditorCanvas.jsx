import { useEffect, useState } from "react";
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
  selectedElementId: externalSelectedElementId,
  onSelectElement,
  previewEffect,
  animations = [],
}) {
  const [localSelectedElementId, setLocalSelectedElementId] = useState(null);

  const selectedElementId =
    externalSelectedElementId !== undefined
      ? externalSelectedElementId
      : localSelectedElementId;

  const setSelectedElementId = (id) => {
    if (onSelectElement) {
      onSelectElement(id);
      return;
    }

    setLocalSelectedElementId(id);
  };

  const { width, height } = getSlideSize(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  const zoomScale = zoom / 100;
  const scaledWidth = width * zoomScale;
  const scaledHeight = height * zoomScale;

  const textElements = slide?.contents?.text ?? [];
  const mediaElements = slide?.contents?.media ?? [];
  const animationSequenceMap = new Map(
    animations.map((a) => [a.id, a.sequence]),
  );

  const {
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
    setSelectedElementId,
  });

  const [playingElementId, setPlayingElementId] = useState(null);
  const [playingEffect, setPlayingEffect] = useState(null);
  const [playingTransition, setPlayingTransition] = useState(null);

  useEffect(() => {
    if (!previewEffect) return;

    if (previewEffect.type === "animation") {
      setPlayingElementId(null);
      setPlayingEffect(null);

      const raf = requestAnimationFrame(() => {
        setPlayingElementId(previewEffect.elementId);
        setPlayingEffect(previewEffect.effect);
      });

      const duration =
        previewEffect.speed === 0.5
          ? 200
          : previewEffect.speed === 2
            ? 2200
            : 800;

      const timer = setTimeout(() => {
        setPlayingElementId(null);
        setPlayingEffect(null);
      }, duration + 100);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }

    if (previewEffect.type === "transition") {
      setPlayingTransition(null);

      const raf = requestAnimationFrame(() => {
        setPlayingTransition(previewEffect.effect);
      });

      const timer = setTimeout(() => {
        setPlayingTransition(null);
      }, 900);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [previewEffect]);

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

  const transitionClass = playingTransition
    ? `play-transition play-transition-${playingTransition}`
    : "";

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
            className={["editor-slide", transitionClass]
              .filter(Boolean)
              .join(" ")}
            style={{
              width: `${width}px`,
              height: `${height}px`,
              background: "var(--bg-light, white)",
              color: "var(--text-dark, black)",
              transform: `scale(${zoomScale})`,
              transformOrigin: "top left",
              "--zoom-scale": zoomScale,
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
            {textElements.map((textElement) => {
              const playClass =
                playingElementId === textElement.id
                  ? `play-effect play-${playingEffect}`
                  : "";

              return (
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
                  previewClassName={playClass}
                  animationOrder={animationSequenceMap.get(textElement.id)}
                />
              );
            })}

            {mediaElements.map((media) => {
              const playClass =
                playingElementId === media.id
                  ? `play-effect play-${playingEffect}`
                  : "";

              return (
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
                  previewClassName={playClass}
                  animationOrder={animationSequenceMap.get(media.id)}
                />
              );
            })}
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