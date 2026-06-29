import { useCallback, useState } from "react";

export default function useCanvasContextMenu({
  selectedElementIds,
  onSelectElement,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  const openContextMenu = useCallback(
    (
      event,
      elementId = null,
      contextType = "canvas",
      textSelection = null,
    ) => {
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
        textSelection,
      });
    },
    [onSelectElement, selectedElementIds],
  );

  return { contextMenu, openContextMenu, closeContextMenu };
}
