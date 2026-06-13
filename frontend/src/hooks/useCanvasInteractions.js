import { useCallback, useState } from "react";

const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];
const SNAP_THRESHOLD = 5;

function normalizeAngle(angle) {
  return ((angle % 360) + 360) % 360;
}

function snapAngle(angle) {
  const normalized = normalizeAngle(angle);

  for (const snap of SNAP_ANGLES) {
    if (Math.abs(normalized - snap) <= SNAP_THRESHOLD) {
      return snap % 360;
    }
  }

  return normalized;
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
  const [resizingElementId, setResizingElementId] = useState(null);
  const [resizingMediaId, setResizingMediaId] = useState(null);
  const [rotatingElement, setRotatingElement] = useState(null);
  const [snapInfo, setSnapInfo] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const zoomScale = zoom / 100;

  const hasActiveInteraction =
    Boolean(draggingElementId) ||
    Boolean(draggingMediaId) ||
    Boolean(resizingElementId) ||
    Boolean(resizingMediaId) ||
    Boolean(rotatingElement);

  const clearInteractionState = useCallback(() => {
    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingElementId(null);
    setResizingMediaId(null);
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
    const x = element.position?.x ?? 0;
    const y = element.position?.y ?? 0;
    const elementWidth = element.width ?? 300;
    const elementHeight = element.height ?? 200;

    const centerX = x + elementWidth / 2;
    const centerY = y + elementHeight / 2;

    return Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
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

      if (draggingElementId) {
        const element = textElements.find((item) => item.id === draggingElementId);
        if (!element) return;

        const newX = mouse.x - dragOffset.x;
        const newY = mouse.y - dragOffset.y;

        onMoveTextElement(
          draggingElementId,
          Math.max(0, Math.min(width - (element.width ?? 300), newX)),
          Math.max(0, Math.min(height - (element.height ?? 80), newY)),
        );
      }

      if (draggingMediaId) {
        const media = mediaElements.find((item) => item.id === draggingMediaId);
        if (!media) return;

        const newX = mouse.x - dragOffset.x;
        const newY = mouse.y - dragOffset.y;

        onMoveMediaElement(
          draggingMediaId,
          Math.max(0, Math.min(width - (media.width ?? 300), newX)),
          Math.max(0, Math.min(height - (media.height ?? 200), newY)),
        );
      }

      if (resizingElementId) {
        const element = textElements.find((item) => item.id === resizingElementId);
        if (!element) return;

        const x = element.position?.x ?? 0;
        const y = element.position?.y ?? 0;

        onResizeTextElement(
          resizingElementId,
          Math.max(100, Math.min(width - x, mouse.x - x)),
          Math.max(40, Math.min(height - y, mouse.y - y)),
        );
      }

      if (resizingMediaId) {
        const media = mediaElements.find((item) => item.id === resizingMediaId);
        if (!media) return;

        const x = media.position?.x ?? 0;
        const y = media.position?.y ?? 0;

        onResizeMediaElement(
          resizingMediaId,
          Math.max(80, Math.min(width - x, mouse.x - x)),
          Math.max(60, Math.min(height - y, mouse.y - y)),
        );
      }

      if (rotatingElement?.type === "text") {
        const element = textElements.find((item) => item.id === rotatingElement.id);
        if (!element) return;

        const rawAngle = getRotationAngle(mouse.x, mouse.y, element) - (rotatingElement.angleOffset ?? 0);
        const snapped = snapAngle(rawAngle);

        setSnapInfo({
          angle: Math.round(snapped),
          snapped: snapped !== normalizeAngle(rawAngle),
          elementId: rotatingElement.id,
        });

        onRotateTextElement?.(rotatingElement.id, snapped);
      }

      if (rotatingElement?.type === "media") {
        const media = mediaElements.find((item) => item.id === rotatingElement.id);
        if (!media) return;

        const rawAngle = getRotationAngle(mouse.x, mouse.y, media) - (rotatingElement.angleOffset ?? 0);
        const snapped = snapAngle(rawAngle);

        setSnapInfo({
          angle: Math.round(snapped),
          snapped: snapped !== normalizeAngle(rawAngle),
          elementId: rotatingElement.id,
        });

        onRotateMediaElement?.(rotatingElement.id, snapped);
      }
    },
    [
      draggingElementId,
      draggingMediaId,
      resizingElementId,
      resizingMediaId,
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

      const element = textElements.find((item) => item.id === textElementId);
      if (!element) return;

      onBeginHistory?.();
      onSelectElement?.(textElementId);

      const rect = event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      setDraggingElementId(textElementId);

      setDragOffset({
        x: (event.clientX - rect.left) / zoomScale - (element.position?.x ?? 0),
        y: (event.clientY - rect.top) / zoomScale - (element.position?.y ?? 0),
      });
    },
    [textElements, onBeginHistory, onSelectElement, zoomScale],
  );

  const startDraggingMedia = useCallback(
    (event, mediaId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();
      
      const media = mediaElements.find((item) => item.id === mediaId);
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

  const startResizingText = useCallback(
    (event, textElementId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur(); 

      onBeginHistory?.();
      onSelectElement?.(textElementId);
      setResizingElementId(textElementId);
    },
    [onBeginHistory, onSelectElement],
  );

  const startResizingMedia = useCallback(
    (event, mediaId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur(); 

      onBeginHistory?.();
      onSelectElement?.(mediaId);
      setResizingMediaId(mediaId);
    },
    [onBeginHistory, onSelectElement],
  );

  const startRotatingText = useCallback(
    (event, textElementId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const element = textElements.find((item) => item.id === textElementId);
      if (!element) return;

      const rect = event.currentTarget.parentElement.parentElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / zoomScale;
      const mouseY = (event.clientY - rect.top) / zoomScale;
      const angleOffset = getRotationAngle(mouseX, mouseY, element) - (element.rotation ?? 0);

      onBeginHistory?.();
      onSelectElement?.(textElementId);
      setRotatingElement({ type: "text", id: textElementId, angleOffset });
    },
    [textElements, onBeginHistory, onSelectElement, zoomScale, getRotationAngle],
  );

  const startRotatingMedia = useCallback(
    (event, mediaId) => {
      event.preventDefault();
      event.stopPropagation();
      document.activeElement?.blur();

      const media = mediaElements.find((item) => item.id === mediaId);
      if (!media) return;

      const rect = event.currentTarget.parentElement.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / zoomScale;
      const mouseY = (event.clientY - rect.top) / zoomScale;
      const angleOffset = getRotationAngle(mouseX, mouseY, media) - (media.rotation ?? 0);

      onBeginHistory?.();
      onSelectElement?.(mediaId);
      setRotatingElement({ type: "media", id: mediaId, angleOffset });
    },
    [mediaElements, onBeginHistory, onSelectElement, zoomScale, getRotationAngle],
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