const getSlides = (presentation) => presentation.slideset?.slides ?? [];
const getLayouts = (presentation) => presentation.slideset?.layouts ?? [];

const setSlidesAndLayouts = (presentation, slides, layouts) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
    layouts,
  },
});

export const applyLayoutToSlide = (presentation, slideIndex, layoutId) => {
  const slides = [...getSlides(presentation)];

  const layoutExists = getLayouts(presentation).some(
    (layout) => layout["layout-id"] === layoutId,
  );

  if (!layoutExists || !slides[slideIndex]) {
    return presentation;
  }

  slides[slideIndex] = {
    ...slides[slideIndex],
    "layout-id": layoutId,
  };

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      slides,
    },
  };
};

export const propagateLayoutChanges = (
  presentation,
  layoutId,
  updatedPlaceholders,
) => {
  const slides = getSlides(presentation).map((slide) => {
    if (slide["layout-id"] !== layoutId) return slide;

    const updatedText = (slide.contents?.text ?? []).map((textElement) => {
      const matchingPlaceholder = updatedPlaceholders.find(
        (placeholder) =>
          placeholder["placeholder-id"] === textElement["placeholder-id"],
      );

      if (!matchingPlaceholder) return textElement;

      return {
        ...textElement,
        position: { ...matchingPlaceholder.position },
        width: matchingPlaceholder.width,
        height: matchingPlaceholder.height,
      };
    });

    return {
      ...slide,
      contents: {
        ...slide.contents,
        text: updatedText,
      },
    };
  });

  const updatedLayouts = getLayouts(presentation).map((layout) =>
    layout["layout-id"] === layoutId
      ? { ...layout, placeholders: updatedPlaceholders }
      : layout,
  );

  return setSlidesAndLayouts(presentation, slides, updatedLayouts);
};