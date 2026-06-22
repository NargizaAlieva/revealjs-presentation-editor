import { useCallback } from "react";
import {
  computeCurrentFormatting,
  splitFormattingUpdates,
  resolveEffectiveFormatting,
  getSelectionFormatting,
  RUN_LEVEL_KEYS,
} from "../core/text/textFormatting";
import { getPlaceholderFormatting } from "../core/render/slidesetRenderUtils";

export const findMasterTextElement = (
  presentation,
  selectedMasterLayoutId,
  selectedMasterElementId,
) => {
  if (!selectedMasterElementId) return null;
  const masterEl = (presentation?.slideset?.master?.elements?.text ?? []).find(
    (t) => t.id === selectedMasterElementId,
  );
  if (masterEl) return masterEl;
  if (selectedMasterLayoutId) {
    const layout = (presentation?.slideset?.layouts ?? []).find(
      (l) => l["layout-id"] === selectedMasterLayoutId,
    );
    return (
      (layout?.elements?.text ?? []).find(
        (t) => t.id === selectedMasterElementId,
      ) ?? null
    );
  }
  return null;
};

export const computeFormattingState = ({
  presentation,
  selectedSlide,
  activeTextEl,
  activeElementId,
  activeSelectionForFormatting,
  isSlideMasterOpen,
  isEditingSelected,
  pendingFormatting,
}) => {
  const paragraphFormatting = activeTextEl?.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderFormatting =
    activeTextEl && !isSlideMasterOpen
      ? getPlaceholderFormatting(presentation, selectedSlide, activeTextEl)
      : {};
  const effectiveFormatting = resolveEffectiveFormatting(
    masterFormatting,
    placeholderFormatting,
    paragraphFormatting,
  );

  const hasRealSelection =
    activeSelectionForFormatting &&
    activeSelectionForFormatting.elementId === activeElementId &&
    !(
      activeSelectionForFormatting.paragraphIdx ===
        (activeSelectionForFormatting.endParagraphIdx ??
          activeSelectionForFormatting.paragraphIdx) &&
      activeSelectionForFormatting.rangeStart ===
        activeSelectionForFormatting.rangeEnd
    );

  const selectionFormatting = hasRealSelection
    ? {
        ...effectiveFormatting,
        ...(getSelectionFormatting(
          activeTextEl,
          activeSelectionForFormatting,
        ) ?? {}),
      }
    : null;

  const currentFormatting = selectionFormatting
    ? { ...selectionFormatting, ...pendingFormatting }
    : computeCurrentFormatting({
        isEditing: isEditingSelected,
        activeSelection: activeSelectionForFormatting,
        selectedElementId: activeElementId,
        selectedTextEl: activeTextEl,
        effectiveFormatting,
        pendingFormatting,
      });

  return { currentFormatting, hasRealSelection, effectiveFormatting };
};

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
      const hasRealSel =
        sel &&
        sel.elementId === elementId &&
        !(
          sel.paragraphIdx === (sel.endParagraphIdx ?? sel.paragraphIdx) &&
          sel.rangeStart === sel.rangeEnd
        );
      const fontSizeDelta = Number(updates["font-size-delta"] ?? 0);
      const normalizedUpdates =
        fontSizeDelta &&
        !hasRealSel &&
        editingTextElementIdRef.current === elementId
          ? {
              ...updates,
              "font-size-delta": undefined,
              size: `${Math.max(
                6,
                Math.min(
                  120,
                  (parseFloat(currentFormatting.size) || 24) + fontSizeDelta,
                ),
              )}px`,
            }
          : updates;
      if (normalizedUpdates["font-size-delta"] === undefined) {
        delete normalizedUpdates["font-size-delta"];
      }
      const { runUpdates, paraUpdates } =
        splitFormattingUpdates(normalizedUpdates);

      if (hasRealSel) {
        // Pass all updates (run + para) to updateTextRangeFormatting so paragraph-level
        // keys (list-type, align, indent-level) apply only to selected paragraphs.
        const allUpdates = { ...runUpdates, ...paraUpdates };
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
              ([k, v]) => RUN_LEVEL_KEYS.has(k) && v !== "mixed",
            ),
          );
          setPendingFormatting((prev) => ({
            ...cursorRunBase,
            ...prev,
            ...runUpdates,
          }));
        }
        if (Object.keys(paraUpdates).length > 0) {
          // Cursor (no selection): apply paragraph-level formatting to the current paragraph only.
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
        if (Object.keys(runUpdates).length > 0)
          updateTextElementFormatting(elementId, runUpdates);
        if (Object.keys(paraUpdates).length > 0)
          updateTextElementFormatting(elementId, paraUpdates);
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
