import { useMemo } from "react";

export function useSlides(state) {
  const presentation = state.presentation;
  const slides = presentation?.slideset?.slides ?? [];
  const selectedSlideIndex = state.selectedSlideIndex ?? 0;
  const selectedSlide = slides[selectedSlideIndex] ?? null;
  const selectedElementId = state.selectedElementId ?? null;

    const selectedElement = useMemo(() => {
      if (!selectedElementId) return null;
      const text = (selectedSlide?.contents?.text ?? []).find(
        (e) => e.id === selectedElementId,
      );
      if (text)
        return {
          id: text.id,
          label: text.paragraphs?.[0]?.runs?.[0]?.text || "Text",
        };
      const media = (selectedSlide?.contents?.media ?? []).find(
        (e) => e.id === selectedElementId,
      );
      if (media) return { id: media.id, label: "Image" };
      return null;
    }, [selectedSlide, selectedElementId]);

  return {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
    selectedElement,
  };
}