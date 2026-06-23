import { useCallback, useState } from "react";
import { snapAngle, normalizeAngle, computeResize, getElementRotationAngle } from "../core/geometry/canvasGeometry";

export function useCanvasInteractions({
  width,
  height,
  zoom,
  textElements,
  mediaElements,

  onSelectElement,

  onMoveTextElement,
  onResizeTextElement,
  onRotateTextElement,

  onMoveMediaElement,
  onResizeMediaElement,
  onRotateMediaElement,

  onBeginHistory,
  onCommitHistory,
  onCancelHistory,
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [draggingMediaId, setDraggingMediaId] = useState(null);

  const [resizingState, setResizingState] = useState(null);

  const [rotatingElement, setRotatingElement] = useState(null);
  const [snapInfo, setSnapInfo] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const zoomScale = zoom / 100;

  const hasActiveInteraction =
    Boolean(draggingElementId) ||
    Boolean(draggingMediaId) ||
    Boolean(resizingState) ||
    Boolean(rotatingElement);

  const clearInteractionState = useCallback(() => {
    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingState(null);
    setRotatingElement(null);
    setSnapInfo(null);
  }, []);

  const getMousePosition = useCallback(
    (event, rect) => ({
      x: (event.clientX - rect.left) / zoomScale,
      y: (event.clientY - rect.top) / zoomScale,
    }),
    [zoomScale],
  );


  const stopInteraction = useCallback(() => {
    if (!hasActiveInteraction) return;
    onCommitHistory?.();
    clearInteractionState();
  }, [hasActiveInteraction, onCommitHistory, clearInteractionState]);

  const cancelInteraction = useCallback(() => {
    if (!hasActiveInteraction) return;
    onCancelHistory?.();
    clearInteractionState();
  }, [hasActiveInteraction, onCancelHistory, clearInteractionState]);

  const handleMouseMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const mouse = getMousePosition(event, rect);

      // ── drag text ──────────────────────────────────────────────────
      if (draggingElementId) {
        const el = textElements.find((e) => e.id === draggingElementId);
        if (!el) return;
        onMoveTextElement(
          draggingElementId,
          mouse.x - dragOffset.x,
          mouse.y - dragOffset.y,
        );
      }

      if (draggingMediaId) {
        const media = mediaElements.find((e) => e.id === draggingMediaId);
        if (!media) return;
        onMoveMediaElement(
          draggingMediaId,
          mouse.x - dragOffset.x,
          mouse.y - dragOffset.y,
        );
      }

      if (resizingState?.type === "text") {
        const { newX, newY, newW, newH } = computeResize(
          resizingState.dir,
          resizingState.initial,
          mouse,
          width,
          height,
        );
        onMoveTextElement(resizingState.id, newX, newY);
        onResizeTextElement(resizingState.id, newW, newH);
      }

      if (resizingState?.type === "media") {
        let { newX, newY, newW, newH } = computeResize(
          resizingState.dir,
          resizingState.initial,
          mouse,
          width,
          height,
        );
        // Lock aspect ratio only for corner handles (diagonal drag)
        const dir = resizingState.dir;
        const isCorner = (dir.includes("n") || dir.includes("s")) && (dir.includes("e") || dir.includes("w"));
        if (resizingState.aspectRatio && isCorner) {
          const ar = resizingState.aspectRatio;
          if (newW / ar > newH) { newH = newW / ar; } else { newW = newH * ar; }
          if (dir.includes("w")) newX = resizingState.initial.x + resizingState.initial.width - newW;
          if (dir.includes("n")) newY = resizingState.initial.y + resizingState.initial.height - newH;
        }
        onMoveMediaElement(resizingState.id, newX, newY);
        onResizeMediaElement(resizingState.id, newW, newH);
      }

      if (rotatingElement?.type === "text") {
        const el = textElements.find((e) => e.id === rotatingElement.id);
        if (!el) return;
        const raw =
          getElementRotationAngle(el, mouse.x, mouse.y) -
          (rotatingElement.angleOffset ?? 0);
        const snapped = snapAngle(raw);
        setSnapInfo({
          angle: Math.round(snapped),
          snapped: snapped !== normalizeAngle(raw),
          elementId: rotatingElement.id,
        });
        onRotateTextElement?.(rotatingElement.id, snapped);
      }

      if (rotatingElement?.type === "media") {
        const media = mediaElements.find((e) => e.id === rotatingElement.id);
        if (!media) return;
        const raw =
          getElementRotationAngle(media, mouse.x, mouse.y) -
          (rotatingElement.angleOffset ?? 0);
        const snapped = snapAngle(raw);
        setSnapInfo({
          angle: Math.round(snapped),
          snapped: snapped !== normalizeAngle(raw),
          elementId: rotatingElement.id,
        });
        onRotateMediaElement?.(rotatingElement.id, snapped);
      }
    },
    [
      draggingElementId,
      draggingMediaId,
      resizingState,
      rotatingElement,
      dragOffset,
      width,
      height,
      textElements,
      mediaElements,
      getMousePosition,
      onMoveTextElement,
      onResizeTextElement,
      onRotateTextElement,
      onMoveMediaElement,
      onResizeMediaElement,
      onRotateMediaElement,
      onBeginHistory,
    ],
  );

  const startDraggingText = useCallback(
    (event, textElementId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const el = textElements.find((e) => e.id === textElementId);
      if (!el) return;

      onBeginHistory?.();
      onSelectElement?.(textElementId, { preserveIfSelected: true });

      const rect =
        event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      setDraggingElementId(textElementId);
      setDragOffset({
        x: (event.clientX - rect.left) / zoomScale - (el.position?.x ?? 0),
        y: (event.clientY - rect.top) / zoomScale - (el.position?.y ?? 0),
      });
    },
    [textElements, onBeginHistory, onSelectElement, zoomScale],
  );

  const startDraggingMedia = useCallback(
    (event, mediaId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const media = mediaElements.find((e) => e.id === mediaId);
      if (!media) return;

      onBeginHistory?.();
      onSelectElement?.(mediaId, { preserveIfSelected: true });

      const rect = event.currentTarget.parentElement.getBoundingClientRect();
      setDraggingMediaId(mediaId);
      setDragOffset({
        x: (event.clientX - rect.left) / zoomScale - (media.position?.x ?? 0),
        y: (event.clientY - rect.top) / zoomScale - (media.position?.y ?? 0),
      });
    },
    [mediaElements, onBeginHistory, onSelectElement, zoomScale],
  );

  const startResizingText = useCallback(
    (event, textElementId, dir = "se") => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const el = textElements.find((e) => e.id === textElementId);
      if (!el) return;

      const rect =
        event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / zoomScale;
      const mouseY = (event.clientY - rect.top) / zoomScale;

      onBeginHistory?.();
      onSelectElement?.(textElementId, { preserveIfSelected: true });
      setResizingState({
        type: "text",
        id: textElementId,
        dir,
        initial: {
          x: el.position?.x ?? 0,
          y: el.position?.y ?? 0,
          width: el.width ?? 300,
          height: el.height ?? 80,
          mouseX,
          mouseY,
        },
      });
    },
    [textElements, onBeginHistory, onSelectElement, zoomScale],
  );

  const startResizingMedia = useCallback(
    (event, mediaId, dir = "se") => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const media = mediaElements.find((e) => e.id === mediaId);
      if (!media) return;

      const rect =
        event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / zoomScale;
      const mouseY = (event.clientY - rect.top) / zoomScale;

      const initW = media.width ?? 300;
      const initH = media.height ?? 200;
      onBeginHistory?.();
      onSelectElement?.(mediaId, { preserveIfSelected: true });
      setResizingState({
        type: "media",
        id: mediaId,
        dir,
        aspectRatio: initW / initH,
        initial: {
          x: media.position?.x ?? 0,
          y: media.position?.y ?? 0,
          width: initW,
          height: initH,
          mouseX,
          mouseY,
        },
      });
    },
    [mediaElements, onBeginHistory, onSelectElement, zoomScale],
  );

  const startRotatingText = useCallback(
    (event, textElementId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const el = textElements.find((e) => e.id === textElementId);
      if (!el) return;

      const rect =
        event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / zoomScale;
      const mouseY = (event.clientY - rect.top) / zoomScale;
      const angleOffset =
        getElementRotationAngle(el, mouseX, mouseY) - (el.rotation ?? 0);

      onBeginHistory?.();
      onSelectElement?.(textElementId, { preserveIfSelected: true });
      setRotatingElement({ type: "text", id: textElementId, angleOffset });
    },
    [textElements, onBeginHistory, onSelectElement, zoomScale],
  );

  const startRotatingMedia = useCallback(
    (event, mediaId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const media = mediaElements.find((e) => e.id === mediaId);
      if (!media) return;

      const rect =
        event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / zoomScale;
      const mouseY = (event.clientY - rect.top) / zoomScale;
      const angleOffset =
        getElementRotationAngle(media, mouseX, mouseY) - (media.rotation ?? 0);

      onBeginHistory?.();
      onSelectElement?.(mediaId, { preserveIfSelected: true });
      setRotatingElement({ type: "media", id: mediaId, angleOffset });
    },
    [mediaElements, onBeginHistory, onSelectElement, zoomScale],
  );

  return {
    handleMouseMove,
    stopInteraction,
    cancelInteraction,
    startDraggingText,
    startDraggingMedia,
    startResizingText,
    startResizingMedia,
    startRotatingText,
    startRotatingMedia,
    snapInfo,
    isRotating: Boolean(rotatingElement),
  };
}
