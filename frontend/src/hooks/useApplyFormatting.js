import { useCallback } from "react";
import {
  splitFormattingUpdates,
  RUN_LEVEL_KEYS,
} from "../core/text/textFormatting";

export const useApplyFormatting = ({
  activeSelectionRef,
  editingTextElementIdRef,
  currentFormatting,
  updateTextRangeFormatting,
  updateTextElementFormatting,
  updateParagraphFormatting,
  setPendingFormatting,
}) =>
  useCallback(
    (elementId, updates) => {
      const sel = activeSelectionRef.current;
      const isCurrentlyEditing = editingTextElementIdRef.current === elementId;
      const hasRealSel =
        isCurrentlyEditing &&
        sel &&
        sel.elementId === elementId &&
        !(
          sel.paragraphIdx === (sel.endParagraphIdx ?? sel.paragraphIdx) &&
          sel.rangeStart === sel.rangeEnd
        );
      const fontSizeDelta = Number(updates["font-size-delta"] ?? 0);
      const { "font-size-delta": _delta, ...updatesWithoutDelta } = updates;
      const normalizedUpdates =
        fontSizeDelta && !hasRealSel
          ? {
              ...updatesWithoutDelta,
              size: `${Math.max(
                6,
                Math.min(
                  120,
                  (parseFloat(currentFormatting.size) || 24) + fontSizeDelta,
                ),
              )}px`,
            }
          : updatesWithoutDelta;
      const { runUpdates, paraUpdates } =
        splitFormattingUpdates(normalizedUpdates);

      if (hasRealSel) {
        const allUpdates = { ...runUpdates, ...paraUpdates };
        if (fontSizeDelta) allUpdates["font-size-delta"] = fontSizeDelta;
        if (Object.keys(allUpdates).length > 0)
          updateTextRangeFormatting(
            elementId,
            sel.paragraphIdx,
            sel.rangeStart,
            sel.endParagraphIdx ?? sel.paragraphIdx,
            sel.rangeEnd,
            allUpdates,
          );
      } else if (editingTextElementIdRef.current === elementId) {
        if (Object.keys(runUpdates).length > 0) {
          const cursorRunBase = Object.fromEntries(
            Object.entries(currentFormatting).filter(
              ([k, v]) => RUN_LEVEL_KEYS.has(k) && v != null && v !== "mixed",
            ),
          );
          setPendingFormatting((prev) => ({
            ...cursorRunBase,
            ...prev,
            ...runUpdates,
          }));
        }
        if (Object.keys(paraUpdates).length > 0) {
          const cursorParagraphIdx =
            sel?.elementId === elementId ? sel.paragraphIdx : undefined;
          if (cursorParagraphIdx !== undefined) {
            updateParagraphFormatting(
              elementId,
              cursorParagraphIdx,
              paraUpdates,
            );
          } else {
            updateTextElementFormatting(elementId, paraUpdates);
          }
        }
      } else {
        const allUpdates = { ...runUpdates, ...paraUpdates };
        if (Object.keys(allUpdates).length > 0)
          updateTextElementFormatting(elementId, allUpdates);
      }
    },
    [
      currentFormatting,
      updateTextRangeFormatting,
      updateTextElementFormatting,
      updateParagraphFormatting,
      setPendingFormatting,
    ],
  );
