import { useEffect, useRef, useState, useMemo } from "react";
import "./EditorCanvas.css";
import { getSlideSize } from "../../core/render/slidesetRenderUtils";
import { getAnimationDurationMs } from "../../core/operations/animationOperations";
import { buildColorThemeStyle, buildAdjustedAnimationMap } from "../../core/render/revealRenderer";
import {
  isEditableTarget,
  isUndoShortcut,
  isRedoShortcut,
  isCopyShortcut,
  isPasteShortcut,
  isCutShortcut,
  isDeleteShortcut,
  isSelectAllShortcut,
} from "../../core/events/keyboardShortcuts";
import { useCanvasInteractions } from "../../hooks/useCanvasInteractions";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import { findElementInSlide } from "../../core/operations/elementOperations";
import { TRANSPARENT_SLIDE_BG } from "../../core/operations/slideOperations";
import TextElement from "../canvas/elements/TextElement";
import MediaElement from "../canvas/elements/MediaElement";
import SlideDecorations from "../canvas/SlideDecorations";
import CanvasContextMenu from "../canvas/menus/CanvasContextMenu";

function BgFillImageLayer({ src, settings, width, height }) {
  const scale = settings.fitToCanvas ?? false;
  const ol = scale ? 0 : (settings.offsetLeft ?? 0) / 100;
  const or = scale ? 0 : (settings.offsetRight ?? 0) / 100;
  const ot = scale ? 0 : (settings.offsetTop ?? 0) / 100;
  const ob = scale ? 0 : (settings.offsetBottom ?? 0) / 100;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          left: ol * width, top: ot * height,
          width: (1 - ol - or) * width,
          height: (1 - ot - ob) * height,
          objectFit: scale ? "fill" : "cover",
          opacity: 1 - (settings.transparency ?? 0) / 100,
        }}
      />
    </div>
  );
}

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
  hyperlinkText = "",
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
  updateElementSilent,
  updateMedia,
  previewEffect,
  showAnimationBadges = false,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onPasteText,
  onPastePicture,
  onCut,
  onPlaceholderImageUpload,
  onPlaceholderVideoUpload,
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
  cropSignal,
  previewMediaEffects,
  previewMediaStyleId,
  hideMasterElements = false,
  formatPainterClipboard = null,
  onFormatPainterCopy,
  onFormatPainterPaste,
  clearSelectionSignal = 0,
  onPromoteLayoutElement,
}) {
  const [playingElementId, setPlayingElementId] = useState(null);
  const [playingEffect, setPlayingEffect] = useState(null);
  const [playingParagraphIndex, setPlayingParagraphIndex] = useState(null);
  const [playingByParagraph, setPlayingByParagraph] = useState(false);
  const [playingTransition, setPlayingTransition] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const workspaceRef = useRef(null);
  const containerRef = useRef(null);
  const placeholderImageInputRef = useRef(null);
  const placeholderVideoInputRef = useRef(null);
  const placeholderUploadTargetRef = useRef(null);

  const { width, height } = getSlideSize(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);

  const slideBg = slide?.contents?.background ?? null;
  const isImageBg = slideBg && typeof slideBg === "object" && slideBg.type === "image";
  const bgFillImageKey = isImageBg ? slideBg["file-link"] : null;
  const bgFillImageSrc = useMediaSrc(bgFillImageKey);
  const bgFillSettings = isImageBg ? slideBg : {};

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

  const slideContentIds = useMemo(() => {
    const ids = new Set();
    textElements.forEach((el) => {
      ids.add(el.id);
      if (el["placeholder-id"]) ids.add(el["placeholder-id"]);
    });
    mediaElements.forEach((el) => {
      ids.add(el.id);
      if (el["placeholder-id"]) ids.add(el["placeholder-id"]);
    });
    return ids;
  }, [textElements, mediaElements]);

  const animationSequenceMap = useMemo(
    () => {
      const adjusted = buildAdjustedAnimationMap(slide);
      return new Map([...adjusted.entries()].map(([id, anim]) => [id, anim.sequence]));
    },
    [slide],
  );

  const {
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
                overflow: "visible",
              }}
            >
              <div
                className={["transition-wrapper", transitionClass]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor:
                    !slideBg || isImageBg || slideBg === TRANSPARENT_SLIDE_BG
                      ? "var(--bg-light, white)"
                      : slideBg,
                  color: "var(--text-dark, black)",
                  overflow: "hidden",
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
                {bgFillImageSrc && (
                  <BgFillImageLayer
                    src={bgFillImageSrc}
                    settings={bgFillSettings}
                    width={width}
                    height={height}
                  />
                )}

                <SlideDecorations
                  presentation={presentation}
                  width={width}
                  height={height}
                  hideMasterElements={hideMasterElements}
                  layoutId={slide?.["layout-id"]}
                  slideContentIds={slideContentIds}
                  onPromoteLayoutElement={onPromoteLayoutElement}
                />

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
                      onAutoFit={updateElementSilent}
                      onContextMenu={openContextMenu}
                      onPlaceholderImageClick={() =>
                        {
                          placeholderUploadTargetRef.current = textElement;
                          placeholderImageInputRef.current?.click();
                        }
                      }
                      onPlaceholderVideoClick={() =>
                        {
                          placeholderUploadTargetRef.current = textElement;
                          placeholderVideoInputRef.current?.click();
                        }
                      }
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
                      cropSignal={cropSignal}
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

      <input
        ref={placeholderImageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file)
            onPlaceholderImageUpload?.(
              placeholderUploadTargetRef.current,
              file,
            );
          placeholderUploadTargetRef.current = null;
          event.target.value = "";
        }}
      />
      <input
        ref={placeholderVideoInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file)
            onPlaceholderVideoUpload?.(
              placeholderUploadTargetRef.current,
              file,
            );
          placeholderUploadTargetRef.current = null;
          event.target.value = "";
        }}
      />

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
          hyperlinkText={hyperlinkText}
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
