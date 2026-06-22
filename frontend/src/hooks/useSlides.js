import { useMemo } from "react";
import { findElementInSlide, getElementLabel } from "../core/operations/elementOperations";

export function useSlides(state) {
  const presentation = state.presentation;
  const slides = presentation?.slideset?.slides ?? [];
  const selectedSlideIndex = state.selectedSlideIndex ?? 0;
  const selectedSlide = slides[selectedSlideIndex] ?? null;
  const selectedElementId = state.selectedElementId ?? null;
  const selectedElementIds = state.selectedElementIds ?? (
    selectedElementId ? [selectedElementId] : []
  );

  const selectedElement = useMemo(() => {
    if (!selectedElementId) return null;
    const found = findElementInSlide(
      selectedSlide?.contents?.text ?? [],
      selectedSlide?.contents?.media ?? [],
      selectedElementId,
    );
    if (!found) return null;
    return { id: found.element.id, label: getElementLabel(found.element) };
  }, [selectedSlide, selectedElementId]);

  return {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
    selectedElementIds,
    selectedElement,
  };
}
