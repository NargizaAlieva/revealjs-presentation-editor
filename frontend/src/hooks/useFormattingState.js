import { useCallback } from "react";
import {
  computeCurrentFormatting,
  splitFormattingUpdates,
  resolveEffectiveFormatting,
  getSelectionFormatting,
  RUN_LEVEL_KEYS,
} from "../core/text/textFormatting";
import { getPlaceholderFormatting } from "../core/render/slidesetRenderUtils";

export const findMasterTextElement = (presentation, selectedMasterLayoutId, selectedMasterElementId) => {
  if (!selectedMasterElementId) return null;
  const masterEl = (presentation?.slideset?.master?.elements?.text ?? [])
    .find((t) => t.id === selectedMasterElementId);
  if (masterEl) return masterEl;
  if (selectedMasterLayoutId) {
    const layout = (presentation?.slideset?.layouts ?? [])
      .find((l) => l["layout-id"] === selectedMasterLayoutId);
    return (layout?.elements?.text ?? []).find((t) => t.id === selectedMasterElementId) ?? null;
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
        (activeSelectionForFormatting.endParagraphIdx ?? activeSelectionForFormatting.paragraphIdx) &&
      activeSelectionForFormatting.rangeStart === activeSelectionForFormatting.rangeEnd
    );

  const selectionFormatting = hasRealSelection
    ? { ...effectiveFormatting, ...(getSelectionFormatting(activeTextEl, activeSelectionForFormatting) ?? {}) }
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
  setPendingFormatting,
}) =>
  useCallback(
    (elementId, updates) => {
      const { runUpdates, paraUpdates } = splitFormattingUpdates(updates);

      const sel = activeSelectionRef.current;
      const hasRealSel =
        sel &&
        sel.elementId === elementId &&
        !(
          sel.paragraphIdx === (sel.endParagraphIdx ?? sel.paragraphIdx) &&
          sel.rangeStart === sel.rangeEnd
        );

      if (hasRealSel) {
        if (Object.keys(runUpdates).length > 0)
          updateTextRangeFormatting(
            elementId,
            sel.paragraphIdx,
            sel.rangeStart,
            sel.endParagraphIdx ?? sel.paragraphIdx,
            sel.rangeEnd,
            runUpdates,
          );
      } else if (editingTextElementIdRef.current === elementId) {
        if (Object.keys(runUpdates).length > 0) {
          const cursorRunBase = Object.fromEntries(
            Object.entries(currentFormatting).filter(
              ([k, v]) => RUN_LEVEL_KEYS.has(k) && v !== "mixed",
            ),
          );
          setPendingFormatting((prev) => ({ ...cursorRunBase, ...prev, ...runUpdates }));
        }
      } else {
        if (Object.keys(runUpdates).length > 0)
          updateTextElementFormatting(elementId, runUpdates);
      }

      if (Object.keys(paraUpdates).length > 0)
        updateTextElementFormatting(elementId, paraUpdates);
    },
    [currentFormatting, updateTextRangeFormatting, updateTextElementFormatting, setPendingFormatting],
  );
