import { useState } from "react";

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
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [draggingMediaId, setDraggingMediaId] = useState(null);
  const [resizingElementId, setResizingElementId] = useState(null);
  const [resizingMediaId, setResizingMediaId] = useState(null);
  const [rotatingElement, setRotatingElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const zoomScale = zoom / 100;

  const stopInteraction = () => {
    setDraggingElementId(null);
    setDraggingMediaId(null);
    setResizingElementId(null);
    setResizingMediaId(null);
    setRotatingElement(null);
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

      const newWidth = mouse.x - x;
      const newHeight = mouse.y - y;

      onResizeTextElement(
        resizingElementId,
        Math.max(100, Math.min(width - x, newWidth)),
        Math.max(40, Math.min(height - y, newHeight)),
      );
    }

    if (resizingMediaId) {
      const media = mediaElements.find((item) => item.id === resizingMediaId);
      if (!media) return;

      const x = media.position?.x ?? 0;
      const y = media.position?.y ?? 0;

      const newWidth = mouse.x - x;
      const newHeight = mouse.y - y;

      onResizeMediaElement(
        resizingMediaId,
        Math.max(80, Math.min(width - x, newWidth)),
        Math.max(60, Math.min(height - y, newHeight)),
      );
    }

    if (rotatingElement?.type === "text") {
      const element = textElements.find(
        (item) => item.id === rotatingElement.id,
      );
      if (!element) return;

      const angle = getRotationAngle(mouse.x, mouse.y, element);
      onRotateTextElement?.(rotatingElement.id, angle);
    }

    if (rotatingElement?.type === "media") {
      const media = mediaElements.find(
        (item) => item.id === rotatingElement.id,
      );
      if (!media) return;

      const angle = getRotationAngle(mouse.x, mouse.y, media);
      onRotateMediaElement?.(rotatingElement.id, angle);
    }
  };

  const startDraggingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    const element = textElements.find((item) => item.id === textElementId);
    if (!element) return;

    const rect = event.currentTarget.parentElement.getBoundingClientRect();

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

    const rect = event.currentTarget.parentElement.getBoundingClientRect();

    setDraggingMediaId(mediaId);
    setDragOffset({
      x: (event.clientX - rect.left) / zoomScale - (media.position?.x ?? 0),
      y: (event.clientY - rect.top) / zoomScale - (media.position?.y ?? 0),
    });
  };

  const startRotatingText = (event, textElementId) => {
    event.preventDefault();
    event.stopPropagation();

    // setSelectedElementId(textElementId);
    setRotatingElement({
      type: "text",
      id: textElementId,
    });
  };

  const startRotatingMedia = (event, mediaId) => {
    event.preventDefault();
    event.stopPropagation();

    // setSelectedElementId(mediaId);
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
    startRotatingText,
    startRotatingMedia,
    setResizingElementId,
    setResizingMediaId,
  };
}
