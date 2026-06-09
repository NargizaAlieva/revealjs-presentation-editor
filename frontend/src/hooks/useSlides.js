export function useSlides(state) {
  const slides = state.presentation?.slideset?.slides ?? [];
  const selectedSlideIndex = state.selectedSlideIndex ?? 0;
  const selectedSlide = slides[selectedSlideIndex] ?? null;

  return {
    presentation: state.presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
  };
}