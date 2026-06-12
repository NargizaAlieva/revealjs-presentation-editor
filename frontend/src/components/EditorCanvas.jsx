import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
  updateElement,
  updateMedia,
}) {
  const [localSelectedElementId, setLocalSelectedElementId] = useState(null);

  const selectedElementId =
    externalSelectedElementId !== undefined
      ? externalSelectedElementId
      : localSelectedElementId;

  const setSelectedElementId = useCallback(
    (id) => {
      if (onSelectElement) {
        onSelectElement(id);
        return;
      }

      setLocalSelectedElementId(id);
    },
    [onSelectElement],
  );

  const { width, height } = getSlideSize(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  const zoomScale = zoom / 100;
  const scaledWidth = width * zoomScale;
  const scaledHeight = height * zoomScale;

  const textElements = useMemo(
    () => slide?.contents?.text ?? [],
    [slide?.contents?.text],
  );

  const mediaElements = useMemo(
    () => slide?.contents?.media ?? [],
    [slide?.contents?.media],
  );

  const {
    handleMouseMove,
    stopInteraction,
    startDraggingText,
    startDraggingMedia,
    startResizingText,
    startResizingMedia,
    startRotatingText,
    startRotatingMedia,
    snapInfo,
    isRotating,
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
    onRotateTextElement: (textElementId, angle) =>
      updateElement(textElementId, { rotation: angle }),
    onRotateMediaElement: (mediaId, angle) =>
      updateMedia(mediaId, { rotation: angle }),
    setSelectedElementId,
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

  const workspaceRef = useRef(null);

  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    const handleWheel = (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();

      // Use proportional delta for smooth touchpad pinch-to-zoom.
      // Touchpad pinch fires many small events; mouse wheel fires few large ones.
      const raw = event.deltaY;
      const delta = -(raw * 0.3);
      onCanvasZoom?.(delta);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [onCanvasZoom]);

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
      <div className="slide-workspace" ref={workspaceRef}>
        <div className="slide-workspace-inner">
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
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${zoomScale})`,
                transformOrigin: "center center",
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
                  onStartResize={startResizingText}
                  onStartRotate={startRotatingText}
                />
              ))}

              {mediaElements.map((media) => (
                <MediaElement
                  key={media.id}
                  media={media}
                  isSelected={selectedElementId === media.id}
                  onSelect={setSelectedElementId}
                  onStartDrag={startDraggingMedia}
                  onDeleteMedia={(id) => {
                    onDeleteMedia(id);
                    setSelectedElementId(null);
                  }}
                  onStartResize={startResizingMedia}
                  onStartRotate={startRotatingMedia}
                />
              ))}

              {/* Rotation guide — shows snap angle during rotation */}
              {isRotating &&
                snapInfo &&
                (() => {
                  const el =
                    textElements.find((e) => e.id === snapInfo.elementId) ||
                    mediaElements.find((e) => e.id === snapInfo.elementId);
                  if (!el) return null;
                  const cx = (el.position?.x ?? 0) + (el.width ?? 300) / 2;
                  const cy = (el.position?.y ?? 0) + (el.height ?? 80) / 2;
                  return (
                    <>
                      {/* Horizontal guide at 0° / 180° — passes through element center */}
                      {(snapInfo.angle === 0 || snapInfo.angle === 180) && (
                        <div
                          style={{
                            position: "absolute",
                            top: cy,
                            left: 0,
                            right: 0,
                            height: 1,
                            background: "#4f46e5",
                            opacity: 0.7,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {/* Vertical guide at 90° / 270° — passes through element center */}
                      {(snapInfo.angle === 90 || snapInfo.angle === 270) && (
                        <div
                          style={{
                            position: "absolute",
                            left: cx,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: "#4f46e5",
                            opacity: 0.7,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      {/* Diagonal guide at 45° / 135° / 225° / 315° */}
                      {(snapInfo.angle === 45 ||
                        snapInfo.angle === 135 ||
                        snapInfo.angle === 225 ||
                        snapInfo.angle === 315) && (
                        <svg
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            pointerEvents: "none",
                            overflow: "visible",
                          }}
                        >
                          <line
                            x1={cx - 2000}
                            y1={
                              cy +
                              (snapInfo.angle === 45 || snapInfo.angle === 225
                                ? 2000
                                : -2000)
                            }
                            x2={cx + 2000}
                            y2={
                              cy +
                              (snapInfo.angle === 45 || snapInfo.angle === 225
                                ? -2000
                                : 2000)
                            }
                            stroke="#4f46e5"
                            strokeWidth="1"
                            opacity="0.7"
                          />
                        </svg>
                      )}
                      {/* Angle badge near element center */}
                      <div
                        style={{
                          position: "absolute",
                          top: cy - 32,
                          left: cx,
                          transform: "translateX(-50%)",
                          background: snapInfo.snapped
                            ? "#4f46e5"
                            : "rgba(0,0,0,0.65)",
                          color: "white",
                          fontSize: 12,
                          padding: "2px 8px",
                          borderRadius: 4,
                          pointerEvents: "none",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {snapInfo.angle}°
                      </div>
                    </>
                  );
                })()}
            </div>
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