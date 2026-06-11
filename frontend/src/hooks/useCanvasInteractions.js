import { useState } from "react";

/**
 * Manages drag and resize interactions for the editor canvas.
 * Coordinates are stored in real slide units, not scaled screen pixels.
 */
export function useCanvasInteractions({
  textElements,
  mediaElements,
  slideWidth,
  slideHeight,
  zoom,
  onMoveTextElement,
  onResizeTextElement,
  onMoveMediaElement,
  onResizeMediaElement,
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingElementId, setResizingElementId] = useState(null);
  const [draggingMediaId, setDraggingMediaId] = useState(null);
  const [resizingMediaId, setResizingMediaId] = useState(null);

  const scale = zoom / 100;

  const getSlidePoint = (event, canvasRect) => ({
    x: (event.clientX - canvasRect.left) / scale,
    y: (event.clientY - canvasRect.top) / scale,
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const handleMouseMove = (event) => {
    const canvasRect = event.currentTarget.getBoundingClientRect();
    const point = getSlidePoint(event, canvasRect);

    if (draggingMediaId) {
      const media = mediaElements.find((item) => item.id === draggingMediaId);
      if (!media) return;

      const mediaWidth = media.width ?? 300;
      const mediaHeight = media.height ?? 200;

      const newX = point.x - dragOffset.x;
      const newY = point.y - dragOffset.y;

      onMoveMediaElement(
        draggingMediaId,
        clamp(newX, 0, slideWidth - mediaWidth),
        clamp(newY, 0, slideHeight - mediaHeight),
      );

      return;
    }

    if (resizingMediaId) {
      const media = mediaElements.find((item) => item.id === resizingMediaId);
      if (!media) return;

      const mediaX = media.position?.x ?? 0;
      const mediaY = media.position?.y ?? 0;

      const newWidth = point.x - mediaX;
      const newHeight = point.y - mediaY;

      onResizeMediaElement(
        resizingMediaId,
        clamp(newWidth, 80, slideWidth - mediaX),
        clamp(newHeight, 60, slideHeight - mediaY),
      );

      return;
    }

    if (resizingElementId) {
      const element = textElements.find((item) => item.id === resizingElementId);
      if (!element) return;

      const elementX = element.position?.x ?? 0;
      const elementY = element.position?.y ?? 0;

      const newWidth = point.x - elementX;
      const newHeight = point.y - elementY;

      onResizeTextElement(
        resizingElementId,
        clamp(newWidth, 100, slideWidth - elementX),
        clamp(newHeight, 40, slideHeight - elementY),
      );

      return;
    }

    if (draggingElementId) {
      const element = textElements.find((item) => item.id === draggingElementId);
      if (!element) return;

      const elementWidth = element.width ?? 300;
      const elementHeight = element.height ?? 80;

      const newX = point.x - dragOffset.x;
      const newY = point.y - dragOffset.y;

      onMoveTextElement(
        draggingElementId,
        clamp(newX, 0, slideWidth - elementWidth),
        clamp(newY, 0, slideHeight - elementHeight),
      );
    }
  };

  const stopInteraction = () => {
    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingElementId(null);
    setResizingMediaId(null);
  };

  const startTextDrag = (event, elementId) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.parentElement.getBoundingClientRect();

    setDraggingElementId(elementId);
    setDragOffset({
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    });
  };

  const startMediaDrag = (event, mediaId) => {
    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();

    setDraggingMediaId(mediaId);
    setDragOffset({
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale,
    });
  };

  return {
    handleMouseMove,
    stopInteraction,
    startTextDrag,
    startMediaDrag,
    setResizingElementId,
    setResizingMediaId,
  };
}