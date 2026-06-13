import { useEffect, useRef, useState, useMemo } from "react";
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
  selectedElementId,
  onSelectElement,
  onBeginHistory,
  onCommitHistory,
  onCancelHistory,
  updateElement,
  updateMedia,
  previewEffect,
  animations = [],
  showAnimationBadges = false,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
}) {
  const [playingElementId, setPlayingElementId] = useState(null);
  const [playingEffect, setPlayingEffect] = useState(null);
  const [playingTransition, setPlayingTransition] = useState(null);

  const workspaceRef = useRef(null);

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

  const animationSequenceMap = useMemo(
    () =>
      new Map(
        animations.map((animation) => [animation.id, animation.sequence]),
      ),
    [animations],
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
    onSelectElement,
    onMoveTextElement,
    onResizeTextElement,
    onMoveMediaElement,
    onResizeMediaElement,
    onRotateTextElement: (textElementId, angle) => {
      updateElement?.(textElementId, { rotation: angle });
    },
    onRotateMediaElement: (mediaId, angle) => {
      updateMedia?.(mediaId, { rotation: angle });
    },
    onBeginHistory,
    onCommitHistory,
    onCancelHistory,
  });

  useEffect(() => {
    if (!previewEffect) return;

    let cancelled = false;
    let rafId = null;
    let timerId = null;

    // React 19: setState cannot be called synchronously in an effect body.
    // Yield to the microtask queue first, then run all state updates.
    Promise.resolve().then(() => {
      if (cancelled) return;

      if (previewEffect.type === "animation") {
        setPlayingElementId(null);
        setPlayingEffect(null);

        rafId = requestAnimationFrame(() => {
          if (!cancelled) {
            setPlayingElementId(previewEffect.elementId);
            setPlayingEffect(previewEffect.effect);
          }
        });

        const duration =
          previewEffect.speed === 0.5
            ? 200
            : previewEffect.speed === 2
              ? 2200
              : 800;

        timerId = setTimeout(() => {
          setPlayingElementId(null);
          setPlayingEffect(null);
        }, duration + 100);
      }

      if (previewEffect.type === "transition") {
        setPlayingTransition(null);

        rafId = requestAnimationFrame(() => {
          if (!cancelled) {
            setPlayingTransition(previewEffect.effect);
          }
        });

        timerId = setTimeout(() => {
          setPlayingTransition(null);
        }, 900);
      }
    });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
    };
  }, [previewEffect]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isEditableTarget =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target.isContentEditable;

      const key = event.key.toLowerCase();

      const isUndo =
        (event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z";

      const isRedo =
        ((event.ctrlKey || event.metaKey) && key === "y") ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && key === "z");

      if (isUndo && !isEditableTarget) {
        event.preventDefault();
        onUndo?.();
        return;
      }

      if (isRedo && !isEditableTarget) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      const isCopy = (event.ctrlKey || event.metaKey) && key === "c";
      const isPaste = (event.ctrlKey || event.metaKey) && key === "v";

      if (isCopy && !isEditableTarget && selectedElementId) {
        const element =
          textElements.find((el) => el.id === selectedElementId) ||
          mediaElements.find((el) => el.id === selectedElementId);
        if (element) onCopy?.(element);
        return;
      }

      if (isPaste && !isEditableTarget) {
        onPaste?.();
        return;
      }

      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isEditableTarget) return;
      if (!selectedElementId) return;

      const isTextElement = textElements.some(
        (element) => element.id === selectedElementId,
      );

      const isMediaElement = mediaElements.some(
        (element) => element.id === selectedElementId,
      );

      if (isTextElement) {
        onDeleteTextElement(selectedElementId);
        onSelectElement?.(null);
      }

      if (isMediaElement) {
        onDeleteMedia(selectedElementId);
        onSelectElement?.(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedElementId,
    textElements,
    mediaElements,
    onDeleteTextElement,
    onDeleteMedia,
    onSelectElement,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
  ]);

  useEffect(() => {
    const element = workspaceRef.current;
    if (!element) return;

    const handleWheel = (event) => {
      if (!event.ctrlKey) return;

      event.preventDefault();

      const delta = -(event.deltaY * 0.3);
      onCanvasZoom?.(delta);
    };

    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleWheel);
    };
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

  const transitionClass = playingTransition
    ? `play-transition play-transition-${playingTransition}`
    : "";

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
              className={["editor-slide", transitionClass]
                .filter(Boolean)
                .join(" ")}
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
                  onSelectElement?.(null);
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
                    onSelect={onSelectElement}
                    onChangeTextElement={onChangeTextElement}
                    onFormatTextElement={onFormatTextElement}
                    onDeleteTextElement={(id) => {
                      onDeleteTextElement(id);
                      onSelectElement?.(null);
                    }}
                    onStartDrag={startDraggingText}
                    onStartResize={startResizingText}
                    onStartRotate={startRotatingText}
                    onBeginHistory={onBeginHistory}
                    onCommitHistory={onCommitHistory}
                    onCancelHistory={onCancelHistory}
                    previewClassName={playClass}
                    presentation={presentation}
                    animationOrder={
                      showAnimationBadges
                        ? animationSequenceMap.get(textElement.id)
                        : undefined
                    }
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
                    onSelect={onSelectElement}
                    onStartDrag={startDraggingMedia}
                    onStartResize={startResizingMedia}
                    onStartRotate={startRotatingMedia}
                    onDeleteMedia={(id) => {
                      onDeleteMedia(id);
                      onSelectElement?.(null);
                    }}
                    previewClassName={playClass}
                    animationOrder={
                      showAnimationBadges
                        ? animationSequenceMap.get(media.id)
                        : undefined
                    }
                  />
                );
              })}

              {isRotating &&
                snapInfo &&
                (() => {
                  const element =
                    textElements.find(
                      (item) => item.id === snapInfo.elementId,
                    ) ||
                    mediaElements.find(
                      (item) => item.id === snapInfo.elementId,
                    );

                  if (!element) return null;

                  const centerX =
                    (element.position?.x ?? 0) + (element.width ?? 300) / 2;

                  const centerY =
                    (element.position?.y ?? 0) + (element.height ?? 80) / 2;

                  return (
                    <>
                      {(snapInfo.angle === 0 || snapInfo.angle === 180) && (
                        <div
                          style={{
                            position: "absolute",
                            top: centerY,
                            left: 0,
                            right: 0,
                            height: 1,
                            background: "#4f46e5",
                            opacity: 0.7,
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      {(snapInfo.angle === 90 || snapInfo.angle === 270) && (
                        <div
                          style={{
                            position: "absolute",
                            left: centerX,
                            top: 0,
                            bottom: 0,
                            width: 1,
                            background: "#4f46e5",
                            opacity: 0.7,
                            pointerEvents: "none",
                          }}
                        />
                      )}

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
                            x1={centerX - 2000}
                            y1={
                              centerY +
                              (snapInfo.angle === 45 || snapInfo.angle === 225
                                ? 2000
                                : -2000)
                            }
                            x2={centerX + 2000}
                            y2={
                              centerY +
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

                      <div
                        style={{
                          position: "absolute",
                          top: centerY - 32,
                          left: centerX,
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
            onFocus={() => onBeginHistory?.()}
            onChange={(event) => onUpdateSlideNotes(event.target.value)}
            onBlur={() => onCommitHistory?.()}
            placeholder="Click to add notes"
          />
        </div>
      )}
    </main>
  );
}