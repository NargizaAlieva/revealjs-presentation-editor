import { useCallback, useState } from "react";

const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];
const SNAP_THRESHOLD = 5;

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function snapAngle(angle) {
  const normalized = normalizeAngle(angle);
  for (const snap of SNAP_ANGLES) {
    if (Math.abs(normalized - snap) <= SNAP_THRESHOLD) return snap % 360;
  }
  return normalized;
}

/**
 * Вычисляет новые position и size при resize с учётом направления ручки.
 *
 * dir: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
 *
 * Для ручек nw/n/ne/w — двигаем позицию и уменьшаем размер.
 * Для ручек se/s/e   — только меняем размер.
 */
function computeResize(dir, initial, mouse, canvasWidth, canvasHeight) {
  const { x, y, width, height } = initial;
  const dx = mouse.x - initial.mouseX;
  const dy = mouse.y - initial.mouseY;

  let newX = x,
    newY = y,
    newW = width,
    newH = height;

  // горизонталь
  if (dir === "nw" || dir === "w" || dir === "sw") {
    newX = x + dx;
    newW = width - dx;
  } else if (dir === "ne" || dir === "e" || dir === "se") {
    newW = width + dx;
  }

  // вертикаль
  if (dir === "nw" || dir === "n" || dir === "ne") {
    newY = y + dy;
    newH = height - dy;
  } else if (dir === "sw" || dir === "s" || dir === "se") {
    newH = height + dy;
  }

  // минимальные размеры
  const minW = 80,
    minH = 30;

  if (newW < minW) {
    if (dir === "nw" || dir === "w" || dir === "sw") newX = x + width - minW;
    newW = minW;
  }
  if (newH < minH) {
    if (dir === "nw" || dir === "n" || dir === "ne") newY = y + height - minH;
    newH = minH;
  }

  // не выходим за границы канваса
  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  newW = Math.min(newW, canvasWidth - newX);
  newH = Math.min(newH, canvasHeight - newY);

  return { newX, newY, newW, newH };
}

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

  // resizingState хранит начальное состояние + направление ручки
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

  const getRotationAngle = useCallback((mouseX, mouseY, element) => {
    const cx = (element.position?.x ?? 0) + (element.width ?? 300) / 2;
    const cy = (element.position?.y ?? 0) + (element.height ?? 200) / 2;
    return Math.atan2(mouseY - cy, mouseX - cx) * (180 / Math.PI);
  }, []);

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
          Math.max(
            0,
            Math.min(width - (el.width ?? 300), mouse.x - dragOffset.x),
          ),
          Math.max(
            0,
            Math.min(height - (el.height ?? 80), mouse.y - dragOffset.y),
          ),
        );
      }

      // ── drag media ─────────────────────────────────────────────────
      if (draggingMediaId) {
        const media = mediaElements.find((e) => e.id === draggingMediaId);
        if (!media) return;
        onMoveMediaElement(
          draggingMediaId,
          Math.max(
            0,
            Math.min(width - (media.width ?? 300), mouse.x - dragOffset.x),
          ),
          Math.max(
            0,
            Math.min(height - (media.height ?? 200), mouse.y - dragOffset.y),
          ),
        );
      }

      // ── resize text (8 направлений) ────────────────────────────────
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

      // ── resize media (8 направлений) ───────────────────────────────
      if (resizingState?.type === "media") {
        const { newX, newY, newW, newH } = computeResize(
          resizingState.dir,
          resizingState.initial,
          mouse,
          width,
          height,
        );
        onMoveMediaElement(resizingState.id, newX, newY);
        onResizeMediaElement(resizingState.id, newW, newH);
      }

      // ── rotate text ────────────────────────────────────────────────
      if (rotatingElement?.type === "text") {
        const el = textElements.find((e) => e.id === rotatingElement.id);
        if (!el) return;
        const raw =
          getRotationAngle(mouse.x, mouse.y, el) -
          (rotatingElement.angleOffset ?? 0);
        const snapped = snapAngle(raw);
        setSnapInfo({
          angle: Math.round(snapped),
          snapped: snapped !== normalizeAngle(raw),
          elementId: rotatingElement.id,
        });
        onRotateTextElement?.(rotatingElement.id, snapped);
      }

      // ── rotate media ───────────────────────────────────────────────
      if (rotatingElement?.type === "media") {
        const media = mediaElements.find((e) => e.id === rotatingElement.id);
        if (!media) return;
        const raw =
          getRotationAngle(mouse.x, mouse.y, media) -
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
      getRotationAngle,
      onMoveTextElement,
      onResizeTextElement,
      onRotateTextElement,
      onMoveMediaElement,
      onResizeMediaElement,
      onRotateMediaElement,
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
      onSelectElement?.(textElementId);

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
      onSelectElement?.(mediaId);

      const rect = event.currentTarget.parentElement.getBoundingClientRect();
      setDraggingMediaId(mediaId);
      setDragOffset({
        x: (event.clientX - rect.left) / zoomScale - (media.position?.x ?? 0),
        y: (event.clientY - rect.top) / zoomScale - (media.position?.y ?? 0),
      });
    },
    [mediaElements, onBeginHistory, onSelectElement, zoomScale],
  );

  // dir: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
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
      onSelectElement?.(textElementId);
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

      onBeginHistory?.();
      onSelectElement?.(mediaId);
      setResizingState({
        type: "media",
        id: mediaId,
        dir,
        initial: {
          x: media.position?.x ?? 0,
          y: media.position?.y ?? 0,
          width: media.width ?? 300,
          height: media.height ?? 200,
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
        getRotationAngle(mouseX, mouseY, el) - (el.rotation ?? 0);

      onBeginHistory?.();
      onSelectElement?.(textElementId);
      setRotatingElement({ type: "text", id: textElementId, angleOffset });
    },
    [
      textElements,
      onBeginHistory,
      onSelectElement,
      zoomScale,
      getRotationAngle,
    ],
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
        getRotationAngle(mouseX, mouseY, media) - (media.rotation ?? 0);

      onBeginHistory?.();
      onSelectElement?.(mediaId);
      setRotatingElement({ type: "media", id: mediaId, angleOffset });
    },
    [
      mediaElements,
      onBeginHistory,
      onSelectElement,
      zoomScale,
      getRotationAngle,
    ],
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
