import { useEffect, useRef, useState, useMemo } from "react";
import "./EditorCanvas.css";
import { getSlideSize } from "../core/render/slidesetRenderUtils";
import { getAnimationDurationMs } from "../core/operations/animationOperations";
import { buildColorThemeStyle } from "../core/render/revealRenderer";
import {
  isEditableTarget,
  isUndoShortcut,
  isRedoShortcut,
  isCopyShortcut,
  isPasteShortcut,
  isCutShortcut,
  isDeleteShortcut,
  isSelectAllShortcut,
} from "../core/events/keyboardShortcuts";
import { useCanvasInteractions } from "../hooks/useCanvasInteractions";
import { useMediaSrc } from "../hooks/useMediaSrc";
import { findElementInSlide } from "../core/operations/elementOperations";
import { TRANSPARENT_SLIDE_BG } from "../core/operations/slideOperations";
import TextElement from "./canvas/TextElement";
import MediaElement from "./canvas/MediaElement";
import SlideDecorations from "./canvas/SlideDecorations";
import CanvasContextMenu from "./canvas/CanvasContextMenu";

export default function EditorCanvas({
  slide,
  presentation,
  onChangeTextElement,
  onChangeParagraphs,
  onSaveSelection,
  onMoveTextElement,
  onResizeTextElement,
  onFormatTextElement,
  currentFormatting = {},
  onFormatTextRangeElement,
  onStartEditing,
  onStopEditing,
  pendingFormatting = {},
  onClearPendingFormatting,
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
  selectedElementIds = [],
  onSelectElement,
  onDeleteSelection,
  onSelectAll,
  objectSelectionMode = false,
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
  onPasteText,
  onPastePicture,
  onCut,
  onNewComment,
  onHyperlink,
  canHyperlink = false,
  canPaste = false,
  canUndo = false,
  canRedo = false,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onRotateRight,
  onOpenPictureFormat,
  onUpdateBackgroundImagePosition,
  cropSignal,
  previewMediaEffects,
  previewMediaStyleId,
  hideMasterElements = false,
  formatPainterClipboard = null,
  onFormatPainterCopy,
  onFormatPainterPaste,
  clearSelectionSignal = 0,
}) {
  const [playingElementId, setPlayingElementId] = useState(null);
  const [playingEffect, setPlayingEffect] = useState(null);
  const [playingParagraphIndex, setPlayingParagraphIndex] = useState(null);
  const [playingByParagraph, setPlayingByParagraph] = useState(false);
  const [playingTransition, setPlayingTransition] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const workspaceRef = useRef(null);
  const containerRef = useRef(null);

  const { width, height } = getSlideSize(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  const bgImageKey = slide?.contents?.["background-image"] ?? null;
  const bgImageSrc = useMediaSrc(bgImageKey);
  const bgImageScale = slide?.contents?.["background-image-scale"] ?? 100;

  // Parse stored position ("50% 50%", "left top", etc.) → {x,y} in percent
  const parseBgPosition = (pos) => {
    const keywordMap = { left: 0, center: 50, right: 100, top: 0, bottom: 100 };
    const parts = (pos ?? "center center").split(" ");
    const parse = (v) => (v in keywordMap ? keywordMap[v] : parseFloat(v));
    return { x: parse(parts[0] ?? "50"), y: parse(parts[1] ?? "50") };
  };

  const storedBgPos = parseBgPosition(slide?.contents?.["background-image-position"]);
  const [bgDragPos, setBgDragPos] = useState(null); // {x,y} while dragging
  const bgDragRef = useRef(null);

  // Activate reposition mode automatically right after a new bg image is inserted
  const [bgRepoMode, setBgRepoMode] = useState(false);
  const prevBgKeyRef = useRef(bgImageKey);
  useEffect(() => {
    if (!prevBgKeyRef.current && bgImageKey) setBgRepoMode(true);
    if (!bgImageKey) setBgRepoMode(false);
    prevBgKeyRef.current = bgImageKey;
  }, [bgImageKey]);

  useEffect(() => {
    if (!bgRepoMode) return;
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setBgRepoMode(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [bgRepoMode]);

  const bgImagePosition = bgDragPos
    ? `${bgDragPos.x}% ${bgDragPos.y}%`
    : `${storedBgPos.x}% ${storedBgPos.y}%`;

  const zoomScale = zoom / 100;
  const scaledWidth = width * zoomScale;
  const scaledHeight = height * zoomScale;

  const closeContextMenu = () => setContextMenu(null);

  const openContextMenu = (event, elementId = null, contextType = "canvas") => {
    event.preventDefault();
    if (elementId && !selectedElementIds.includes(elementId)) {
      onSelectElement?.(elementId);
    }
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      hasSelection: Boolean(elementId),
      elementId,
      contextType,
    });
  };

  const exitTextEditing = (elementId) => {
    const editable = containerRef.current?.querySelector(
      `[data-element-id="${elementId}"] [contenteditable="true"]`,
    );
    editable?.blur();
    onStopEditing?.(elementId);
  };

  const textElements = useMemo(
    () => (slide?.contents?.text ?? []).filter((element) => !element.hidden),
    [slide?.contents?.text],
  );

  const mediaElements = useMemo(
    () => (slide?.contents?.media ?? []).filter((element) => !element.hidden),
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

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (previewEffect.type === "animation") {
        const duration = getAnimationDurationMs(previewEffect.speed);

        if (previewEffect.byParagraph && previewEffect.paragraphCount > 1) {
          setPlayingByParagraph(true);
          setPlayingElementId(previewEffect.elementId);
          setPlayingEffect(previewEffect.effect);
          setPlayingParagraphIndex(null);

          const N = previewEffect.paragraphCount;
          const timers = [];
          for (let i = 0; i < N; i++) {
            timers.push(
              setTimeout(
                () => {
                  if (!cancelled) setPlayingParagraphIndex(i);
                },
                30 + i * (duration + 50),
              ),
            );
          }
          timers.push(
            setTimeout(
              () => {
                if (!cancelled) {
                  setPlayingByParagraph(false);
                  setPlayingElementId(null);
                  setPlayingEffect(null);
                  setPlayingParagraphIndex(null);
                }
              },
              30 + N * (duration + 50) + 100,
            ),
          );

          timerId = { cancel: () => timers.forEach(clearTimeout) };
        } else {
          setPlayingByParagraph(false);
          setPlayingElementId(null);
          setPlayingEffect(null);
          setPlayingParagraphIndex(null);

          rafId = requestAnimationFrame(() => {
            if (!cancelled) {
              setPlayingElementId(previewEffect.elementId);
              setPlayingEffect(previewEffect.effect);
            }
          });

          timerId = setTimeout(
            () => {
              setPlayingElementId(null);
              setPlayingEffect(null);
            },
            getAnimationDurationMs(previewEffect.speed) + 100,
          );
        }
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
      if (timerId?.cancel) {
        timerId.cancel();
        setPlayingByParagraph(false);
        setPlayingParagraphIndex(null);
      } else if (timerId) clearTimeout(timerId);
    };
  }, [previewEffect]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const inCanvas = containerRef.current?.contains(target);
      const onBody =
        target === document.body || target === document.documentElement;
      if (!inCanvas && !onBody) return;

      const editable = isEditableTarget(target);

      if (event.key === "Escape") {
        setContextMenu(null);
      }

      if (isSelectAllShortcut(event) && !editable) {
        event.preventDefault();
        onSelectAll?.();
        return;
      }

      if (isUndoShortcut(event) && !editable) {
        event.preventDefault();
        onUndo?.();
        return;
      }

      if (isRedoShortcut(event) && !editable) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      if (isCopyShortcut(event) && !editable && selectedElementId) {
        onCopy?.();
        return;
      }

      if (isPasteShortcut(event) && !editable) {
        onPaste?.();
        return;
      }

      if (isCutShortcut(event) && !editable && selectedElementId) {
        onCut?.();
        return;
      }

      if (!isDeleteShortcut(event)) return;
      if (editable) return;
      if (!selectedElementId) return;

      if (selectedElementIds.length > 1) {
        onDeleteSelection?.();
        return;
      }

      const found = findElementInSlide(
        textElements,
        mediaElements,
        selectedElementId,
      );
      if (!found) return;

      if (found.type === "text") {
        onDeleteTextElement(selectedElementId);
        onSelectElement?.(null);
      } else {
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
    selectedElementIds,
    textElements,
    mediaElements,
    onDeleteTextElement,
    onDeleteMedia,
    onSelectElement,
    onUndo,
    onRedo,
    onCopy,
    onPaste,
    onCut,
    onDeleteSelection,
    onSelectAll,
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
    return () => element.removeEventListener("wheel", handleWheel);
  }, [onCanvasZoom]);

  if (!slide) {
    return (
      <main
        className={`canvas-wrapper ${
          objectSelectionMode ? "object-selection-mode" : ""
        }`}
        style={colorThemeStyle}
        ref={containerRef}
        tabIndex={-1}
      >
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
    <main
      className={`canvas-wrapper ${
        objectSelectionMode ? "object-selection-mode" : ""
      }`}
      style={colorThemeStyle}
      ref={containerRef}
      tabIndex={-1}
    >
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
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${zoomScale})`,
                transformOrigin: "center center",
                width: `${width}px`,
                height: `${height}px`,
                overflow: "hidden",
              }}
            >
              <div
                className={["transition-wrapper", transitionClass]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  background:
                    !slide?.contents?.background ||
                    slide.contents.background === TRANSPARENT_SLIDE_BG
                      ? "var(--bg-light, white)"
                      : slide.contents.background,
                  ...(bgImageSrc ? {
                    backgroundImage: `url(${bgImageSrc})`,
                    backgroundSize: bgImageScale === 100 ? "cover" : `${bgImageScale}%`,
                    backgroundPosition: bgImagePosition,
                    backgroundRepeat: "no-repeat",
                  } : {}),
                  color: "var(--text-dark, black)",
                  cursor: bgRepoMode ? "grab" : undefined,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={stopInteraction}
                onMouseLeave={stopInteraction}
                onMouseDown={(event) => {
                  if (!bgRepoMode || event.target !== event.currentTarget) return;
                  if (event.button !== 0) return;
                  event.preventDefault();
                  const startX = event.clientX;
                  const startY = event.clientY;
                  const startPos = { ...storedBgPos };
                  bgDragRef.current = true;

                  const onMove = (me) => {
                    const dx = (me.clientX - startX) / (width * zoomScale / 100);
                    const dy = (me.clientY - startY) / (height * zoomScale / 100);
                    setBgDragPos({
                      x: Math.max(0, Math.min(100, startPos.x - dx)),
                      y: Math.max(0, Math.min(100, startPos.y - dy)),
                    });
                  };
                  const onUp = (me) => {
                    window.removeEventListener("mousemove", onMove);
                    window.removeEventListener("mouseup", onUp);
                    if (!bgDragRef.current) return;
                    const dx = (me.clientX - startX) / (width * zoomScale / 100);
                    const dy = (me.clientY - startY) / (height * zoomScale / 100);
                    const nx = Math.max(0, Math.min(100, startPos.x - dx));
                    const ny = Math.max(0, Math.min(100, startPos.y - dy));
                    setBgDragPos(null);
                    bgDragRef.current = false;
                    onUpdateBackgroundImagePosition?.(`${Math.round(nx)}% ${Math.round(ny)}%`);
                  };
                  window.addEventListener("mousemove", onMove);
                  window.addEventListener("mouseup", onUp);
                }}
                onClick={(event) => {
                  if (event.target === event.currentTarget) {
                    onSelectElement?.(null);
                  }
                }}
                onContextMenu={(event) => {
                  onSelectElement?.(null);
                  openContextMenu(event);
                }}
              >
                <SlideDecorations
                  presentation={presentation}
                  width={width}
                  height={height}
                  hideMasterElements={hideMasterElements}
                  layoutId={slide?.["layout-id"]}
                />

                {bgRepoMode && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 9999,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(0,0,0,0.62)",
                      color: "#fff",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 13,
                      pointerEvents: "none",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span>✥ Drag to reposition</span>
                    <button
                      onMouseDown={(e) => { e.stopPropagation(); setBgRepoMode(false); }}
                      style={{
                        pointerEvents: "all",
                        background: "#4f46e5",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "2px 10px",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Done
                    </button>
                  </div>
                )}

                {textElements.map((textElement) => {
                  const isPlaying = playingElementId === textElement.id;
                  const isByParagraph = isPlaying && playingByParagraph;
                  const playClass =
                    isPlaying && !isByParagraph
                      ? `play-effect play-${playingEffect}`
                      : "";

                  return (
                    <TextElement
                      key={textElement.id}
                      textElement={textElement}
                      isSelected={selectedElementIds.includes(textElement.id)}
                      isPrimarySelected={selectedElementId === textElement.id}
                      onSelect={onSelectElement}
                      objectSelectionMode={objectSelectionMode}
                      onChangeTextElement={onChangeTextElement}
                      onFormatTextElement={onFormatTextElement}
                      onDeleteTextElement={(id) => {
                        onDeleteTextElement(id);
                        onSelectElement?.(null);
                      }}
                      onStartDrag={startDraggingText}
                      onStartResize={startResizingText}
                      onStartRotate={startRotatingText}
                      onAutoFit={updateElement}
                      slideHeight={height}
                      onBeginHistory={onBeginHistory}
                      onCommitHistory={onCommitHistory}
                      onCancelHistory={onCancelHistory}
                      onNewComment={onNewComment}
                      previewClassName={playClass}
                      activeParagraphIndex={
                        isByParagraph ? playingParagraphIndex : null
                      }
                      activeEffect={isByParagraph ? playingEffect : null}
                      presentation={presentation}
                      slide={slide}
                      onChangeParagraphs={onChangeParagraphs}
                      onSaveSelection={onSaveSelection}
                      clearSelectionSignal={clearSelectionSignal}
                      onFormatTextRangeElement={onFormatTextRangeElement}
                      onStartEditing={onStartEditing}
                      onStopEditing={onStopEditing}
                      pendingFormatting={pendingFormatting}
                      onClearPendingFormatting={onClearPendingFormatting}
                      formatPainterClipboard={formatPainterClipboard}
                      onFormatPainterCopy={onFormatPainterCopy}
                      onFormatPainterPaste={onFormatPainterPaste}
                      onContextMenu={openContextMenu}
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
                      isSelected={selectedElementIds.includes(media.id)}
                      isPrimarySelected={selectedElementId === media.id}
                      onSelect={onSelectElement}
                      onStartDrag={startDraggingMedia}
                      onStartResize={startResizingMedia}
                      onStartRotate={startRotatingMedia}
                      onContextMenu={openContextMenu}
                      onDeleteMedia={(id) => {
                        onDeleteMedia(id);
                        onSelectElement?.(null);
                      }}
                      onUpdateMedia={updateMedia ? (id, updates) => updateMedia(id, updates) : undefined}
                      onNewComment={onNewComment}
                      onOpenPictureFormat={onOpenPictureFormat}
                      cropSignal={media.id === selectedElementId ? cropSignal : undefined}
                      previewEffects={media.id === selectedElementId ? previewMediaEffects : undefined}
                      externalPreviewStyleId={media.id === selectedElementId ? previewMediaStyleId : undefined}
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
      </div>

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          hasSelection={contextMenu.hasSelection}
          contextType={contextMenu.contextType}
          elementId={contextMenu.elementId}
          formatting={currentFormatting}
          presentation={presentation}
          canPaste={canPaste}
          canUndo={canUndo}
          canRedo={canRedo}
          onClose={closeContextMenu}
          onUndo={onUndo}
          onRedo={onRedo}
          onCut={onCut}
          onCopy={onCopy}
          onPaste={onPaste}
          onPasteText={onPasteText}
          onPastePicture={onPastePicture}
          onDelete={onDeleteSelection}
          onSelectAll={onSelectAll}
          onBringToFront={onBringToFront}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onSendToBack={onSendToBack}
          onRotateRight={onRotateRight}
          onNewComment={onNewComment}
          onHyperlink={onHyperlink}
          canHyperlink={canHyperlink}
          onExitEditText={exitTextEditing}
          onFormatText={onFormatTextElement}
        />
      )}

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
