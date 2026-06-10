const getSlides = (presentation) => presentation?.slideset?.slides ?? [];

const getLayouts = (presentation) =>
  presentation?.slideset?.master?.layouts ??
  presentation?.slideset?.layouts ??
  [];

const setSlides = (presentation, slides) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    slides,
  },
});

const setLayouts = (presentation, layouts) => {
  if (presentation?.slideset?.master?.layouts) {
    return {
      ...presentation,
      slideset: {
        ...presentation.slideset,
        master: {
          ...presentation.slideset.master,
          layouts,
        },
      },
    };
  }

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      layouts,
    },
  };
};

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

  return setSlides(presentation, slides);
};

export const propagateLayoutChanges = (
  presentation,
  layoutId,
  updatedPlaceholders,
) => {
  const updateElementFromPlaceholder = (element) => {
    const matchingPlaceholder = updatedPlaceholders.find(
      (placeholder) =>
        placeholder["placeholder-id"] === element["placeholder-id"],
    );

    if (!matchingPlaceholder) return element;

    return {
      ...element,
      position: { ...matchingPlaceholder.position },
      width: matchingPlaceholder.width,
      height: matchingPlaceholder.height,
    };
  };

  const slides = getSlides(presentation).map((slide) => {
    if (slide["layout-id"] !== layoutId) return slide;

    return {
      ...slide,
      contents: {
        ...slide.contents,
        text: (slide.contents?.text ?? []).map(updateElementFromPlaceholder),
        media: (slide.contents?.media ?? []).map(updateElementFromPlaceholder),
      },
    };
  });

  const updatedLayouts = getLayouts(presentation).map((layout) =>
    layout["layout-id"] === layoutId
      ? { ...layout, placeholders: updatedPlaceholders }
      : layout,
  );

  const presentationWithSlides = setSlides(presentation, slides);

  return setLayouts(presentationWithSlides, updatedLayouts);
};