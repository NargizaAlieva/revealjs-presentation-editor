import { useEffect } from "react";
import {
  isCopyShortcut,
  isCutShortcut,
  isDeleteShortcut,
  isEditableTarget,
  isPasteShortcut,
  isRedoShortcut,
  isSelectAllShortcut,
  isUndoShortcut,
} from "../../../core/events/keyboardShortcuts";
import { findElementInSlide } from "../../../core/operations/elementOperations";

export default function useCanvasKeyboardShortcuts({
  containerRef,
  selectedElementId,
  selectedElementIds,
  textElements,
  mediaElements,
  closeContextMenu,
  onDeleteTextElement,
  onDeleteMedia,
  onDeleteSelection,
  onSelectElement,
  onSelectAll,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onCut,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const inCanvas = containerRef.current?.contains(target);
      const onBody =
        target === document.body || target === document.documentElement;
      if (!inCanvas && !onBody) return;

      const editable = isEditableTarget(target);
      if (event.key === "Escape") closeContextMenu();

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
      if (!isDeleteShortcut(event) || editable || !selectedElementId) return;

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
      } else {
        onDeleteMedia(selectedElementId);
      }
      onSelectElement?.(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    closeContextMenu,
    containerRef,
    mediaElements,
    onCopy,
    onCut,
    onDeleteMedia,
    onDeleteSelection,
    onDeleteTextElement,
    onPaste,
    onRedo,
    onSelectAll,
    onSelectElement,
    onUndo,
    selectedElementId,
    selectedElementIds,
    textElements,
  ]);
}
