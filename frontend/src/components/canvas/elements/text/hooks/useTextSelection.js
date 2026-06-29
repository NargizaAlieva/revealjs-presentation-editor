import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCollapsedCursorOffset,
  getSelectionOffsets,
} from "../../../../../core/text/domSelectionManager";

function isExpandedSelection(selection) {
  return Boolean(
    selection &&
      (selection.paragraphIdx !==
        (selection.endParagraphIdx ?? selection.paragraphIdx) ||
        selection.rangeStart !== selection.rangeEnd),
  );
}

export default function useTextSelection({
  editableRef,
  textElementId,
  clearSelectionSignal,
  onSaveSelection,
}) {
  const [savedSelection, setSavedSelection] = useState(null);
  const savedSelectionRef = useRef(null);
  const contextSelectionRef = useRef(null);

  const rememberSelection = useCallback(
    (selection) => {
      savedSelectionRef.current = selection;
      setSavedSelection(selection);
      onSaveSelection?.(textElementId, selection);
      return selection;
    },
    [onSaveSelection, textElementId],
  );

  const clearSavedSelection = useCallback(
    (notify = true) => {
      savedSelectionRef.current = null;
      contextSelectionRef.current = null;
      setSavedSelection(null);
      if (notify) onSaveSelection?.(textElementId, null);
    },
    [onSaveSelection, textElementId],
  );

  const saveCurrentSelection = useCallback(() => {
    const editable = editableRef.current;
    if (!editable) return null;

    const domSelection = window.getSelection();
    if (!domSelection?.rangeCount) return rememberSelection(null);

    const selection = domSelection.isCollapsed
      ? getCollapsedCursorOffset(editable)
      : getSelectionOffsets(editable);
    return rememberSelection(selection);
  }, [editableRef, rememberSelection]);

  const captureContextSelection = useCallback(() => {
    const liveSelection = editableRef.current
      ? getSelectionOffsets(editableRef.current)
      : null;
    contextSelectionRef.current =
      liveSelection ??
      (isExpandedSelection(savedSelectionRef.current)
        ? savedSelectionRef.current
        : null);
  }, [editableRef]);

  const getContextMenuSelection = useCallback(() => {
    const editable = editableRef.current;
    if (!editable) return null;

    const liveSelection = getSelectionOffsets(editable);
    const selection =
      (isExpandedSelection(liveSelection) ? liveSelection : null) ??
      contextSelectionRef.current ??
      (isExpandedSelection(savedSelectionRef.current)
        ? savedSelectionRef.current
        : null) ??
      liveSelection;

    if (selection) rememberSelection(selection);
    return selection;
  }, [editableRef, rememberSelection]);

  useEffect(() => {
    if (clearSelectionSignal === 0) return undefined;

    const timeoutId = window.setTimeout(
      () => clearSavedSelection(false),
      0,
    );
    return () => window.clearTimeout(timeoutId);
  }, [clearSavedSelection, clearSelectionSignal]);

  return {
    savedSelection,
    savedSelectionRef,
    rememberSelection,
    clearSavedSelection,
    saveCurrentSelection,
    captureContextSelection,
    getContextMenuSelection,
  };
}
