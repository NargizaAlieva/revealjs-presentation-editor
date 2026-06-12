import { useRef, useState } from "react";

export function useCanvasInteractions({
  width,
  height,
  zoom,
  textElements,
  mediaElements,
  onMoveTextElement,
  onResizeTextElement,
  onMoveMediaElement,
  onResizeMediaElement,
  createBeforeSnapshot,
  onCommitMoveElement,
  onCommitResizeElement,
}) {
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [draggingMediaId, setDraggingMediaId] = useState(null);
  const [resizingElementId, setResizingElementId] = useState(null);
  const [resizingMediaId, setResizingMediaId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const interactionSnapshot = useRef(null);
  const zoomScale = zoom / 100;

  const stopInteraction = () => {
    if (interactionSnapshot.current) {
      if (draggingElementId || draggingMediaId) {
        onCommitMoveElement(interactionSnapshot.current);
      }

      if (resizingElementId || resizingMediaId) {
        onCommitResizeElement(interactionSnapshot.current);
      }

      interactionSnapshot.current = null;
    }

    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingElementId(null);
    setResizingMediaId(null);
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    if (draggingElementId) {
      const element = textElements.find((item) => item.id === draggingElementId);
      if (!element) return;

      const newX = (event.clientX - rect.left) / zoomScale - dragOffset.x;
      const newY = (event.clientY - rect.top) / zoomScale - dragOffset.y;

      onMoveTextElement(
        draggingElementId,
        Math.max(0, Math.min(width - (element.width ?? 300), newX)),
        Math.max(0, Math.min(height - (element.height ?? 80), newY))
      );
    }

    if (draggingMediaId) {
      const media = mediaElements.find((item) => item.id === draggingMediaId);
      if (!media) return;

      const newX = (event.clientX - rect.left) / zoomScale - dragOffset.x;
      const newY = (event.clientY - rect.top) / zoomScale - dragOffset.y;

      onMoveMediaElement(
        draggingMediaId,
        Math.max(0, Math.min(width - (media.width ?? 300), newX)),
        Math.max(0, Math.min(height - (media.height ?? 200), newY))
      );
    }

    if (resizingElementId) {
      const element = textElements.find((item) => item.id === resizingElementId);
      if (!element) return;

      const x = element.position?.x ?? 0;
      const y = element.position?.y ?? 0;

      const newWidth = (event.clientX - rect.left) / zoomScale - x;
      const newHeight = (event.clientY - rect.top) / zoomScale - y;

      onResizeTextElement(
        resizingElementId,
        Math.max(100, Math.min(width - x, newWidth)),
        Math.max(40, Math.min(height - y, newHeight))
      );
    }

    if (resizingMediaId) {
      const media = mediaElements.find((item) => item.id === resizingMediaId);
      if (!media) return;

      const x = media.position?.x ?? 0;
      const y = media.position?.y ?? 0;

      const newWidth = (event.clientX - rect.left) / zoomScale - x;
      const newHeight = (event.clientY - rect.top) / zoomScale - y;

      onResizeMediaElement(
        resizingMediaId,
        Math.max(80, Math.min(width - x, newWidth)),
        Math.max(60, Math.min(height - y, newHeight))
      );
    }
  };

  const startDraggingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    interactionSnapshot.current = createBeforeSnapshot();

    const rect = event.currentTarget.parentElement.getBoundingClientRect();

    setDraggingElementId(textElementId);
    setDragOffset({
      x: (event.clientX - rect.left) / zoomScale,
      y: (event.clientY - rect.top) / zoomScale,
    });
  };

  const startDraggingMedia = (event, mediaId) => {
    event.stopPropagation();

    interactionSnapshot.current = createBeforeSnapshot();

    const rect = event.currentTarget.getBoundingClientRect();

    setSelectedElementId(mediaId);
    setDraggingMediaId(mediaId);
    setDragOffset({
      x: (event.clientX - rect.left) / zoomScale,
      y: (event.clientY - rect.top) / zoomScale,
    });
  };

  const startResizingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    interactionSnapshot.current = createBeforeSnapshot();
    setResizingElementId(textElementId);
  };

  const startResizingMedia = (event, mediaId) => {
    event.preventDefault();
    event.stopPropagation();

    interactionSnapshot.current = createBeforeSnapshot();
    setResizingMediaId(mediaId);
  };

  return {
    selectedElementId,
    setSelectedElementId,
    handleMouseMove,
    stopInteraction,
    startDraggingText,
    startDraggingMedia,
    startResizingText,
    startResizingMedia,
  };
}