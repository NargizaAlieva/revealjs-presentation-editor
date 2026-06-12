import { useRef, useState} from "react";

const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];
const SNAP_THRESHOLD = 5; // degrees

function snapAngle(angle) {
  // Normalize to 0–360
  const normalized = ((angle % 360) + 360) % 360;
  for (const snap of SNAP_ANGLES) {
    if (Math.abs(normalized - snap) <= SNAP_THRESHOLD) return snap % 360;
  }
  return normalized;
}

export function useCanvasInteractions({
  width,
  height,
  zoom,
  textElements,
  mediaElements,
  onMoveTextElement,
  onResizeTextElement,
  onRotateTextElement,
  onMoveMediaElement,
  onResizeMediaElement,
  onRotateMediaElement,
  createBeforeSnapshot,
  onCommitMoveElement,
  onCommitResizeElement,
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [draggingMediaId, setDraggingMediaId] = useState(null);
  const [resizingElementId, setResizingElementId] = useState(null);
  const [resizingMediaId, setResizingMediaId] = useState(null);
  const [rotatingElement, setRotatingElement] = useState(null);
  const [snapInfo, setSnapInfo] = useState(null); // { angle, snapped, elementId }
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const interactionSnapshot = useRef(null);
  const zoomScale = zoom / 100;

  const stopInteraction = () => {
    if (interactionSnapshot.current) {
      if (draggingElementId || draggingMediaId) {
        onCommitMoveElement?.(interactionSnapshot.current);
      }

      if (resizingElementId || resizingMediaId) {
        onCommitResizeElement?.(interactionSnapshot.current);
      }

      interactionSnapshot.current = null;
    }

    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingElementId(null);
    setResizingMediaId(null);
    setRotatingElement(null);
    setSnapInfo(null);
  };

  const getMousePosition = (event, rect) => ({
    x: (event.clientX - rect.left) / zoomScale,
    y: (event.clientY - rect.top) / zoomScale,
  });

  const getRotationAngle = (mouseX, mouseY, element) => {
    const x = element.position?.x ?? 0;
    const y = element.position?.y ?? 0;
    const elementWidth = element.width ?? 300;
    const elementHeight = element.height ?? 200;

    const centerX = x + elementWidth / 2;
    const centerY = y + elementHeight / 2;

    return Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const mouse = getMousePosition(event, rect);

    if (draggingElementId) {
      const element = textElements.find(
        (item) => item.id === draggingElementId,
      );
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
      const element = textElements.find(
        (item) => item.id === resizingElementId,
      );
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
      const element = textElements.find(
        (item) => item.id === rotatingElement.id,
      );
      if (!element) return;

      const rawAngle = getRotationAngle(mouse.x, mouse.y, element);
      const snapped = snapAngle(rawAngle);
      const isSnapped = snapped !== ((rawAngle % 360) + 360) % 360;
      setSnapInfo({
        angle: Math.round(snapped),
        snapped: isSnapped,
        elementId: rotatingElement.id,
      });
      onRotateTextElement?.(rotatingElement.id, snapped);
    }

    if (rotatingElement?.type === "media") {
      const media = mediaElements.find(
        (item) => item.id === rotatingElement.id,
      );
      if (!media) return;

      const rawAngle = getRotationAngle(mouse.x, mouse.y, media);
      const snapped = snapAngle(rawAngle);
      const isSnapped = snapped !== ((rawAngle % 360) + 360) % 360;
      setSnapInfo({
        angle: Math.round(snapped),
        snapped: isSnapped,
        elementId: rotatingElement.id,
      });
      onRotateMediaElement?.(rotatingElement.id, snapped);
    }
  };

  const startDraggingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    const element = textElements.find((item) => item.id === textElementId);
    if (!element) return;

    interactionSnapshot.current = createBeforeSnapshot?.();

    // event.currentTarget = drag-border div → parentElement = text wrapper → parentElement = canvas
    const rect =
      event.currentTarget.parentElement.parentElement.getBoundingClientRect();

    setDraggingElementId(textElementId);
    setDragOffset({
      x: (event.clientX - rect.left) / zoomScale - (element.position?.x ?? 0),
      y: (event.clientY - rect.top) / zoomScale - (element.position?.y ?? 0),
    });
  };

  const startDraggingMedia = (event, mediaId) => {
    event.preventDefault();
    event.stopPropagation();

    const media = mediaElements.find((item) => item.id === mediaId);
    if (!media) return;

    interactionSnapshot.current = createBeforeSnapshot?.();

    const rect = event.currentTarget.parentElement.getBoundingClientRect();

    setDraggingMediaId(mediaId);
    setDragOffset({
      x: (event.clientX - rect.left) / zoomScale - (media.position?.x ?? 0),
      y: (event.clientY - rect.top) / zoomScale - (media.position?.y ?? 0),
    });
  };

  const startResizingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    interactionSnapshot.current = createBeforeSnapshot?.();
    setResizingElementId(textElementId);
  };

  const startResizingMedia = (event, mediaId) => {
    event.preventDefault();
    event.stopPropagation();

    interactionSnapshot.current = createBeforeSnapshot?.();
    setResizingMediaId(mediaId);
  };

  const startRotatingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    setRotatingElement({
      type: "text",
      id: textElementId,
    });
  };

  const startRotatingMedia = (event, mediaId) => {
    event.preventDefault();
    event.stopPropagation();

    setRotatingElement({
      type: "media",
      id: mediaId,
    });
  };

  return {
    handleMouseMove,
    stopInteraction,
    startDraggingText,
    startDraggingMedia,
    startResizingText,
    startResizingMedia,
    startRotatingText,
    startRotatingMedia,
    snapInfo,
    isRotating: !!rotatingElement,
  };
}
