export const applyLayoutToSlide = (
  presentation,
  slideIndex,
  layoutId
) => {
  const slides = [...presentation.slideset.slides];

  const layoutExists = presentation.slideset.layouts.some(
    (layout) => layout["layout-id"] === layoutId
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
  updatedPlaceholders
) => {
  const slides = presentation.slideset.slides.map((slide) => {
    if (slide["layout-id"] !== layoutId) {
      return slide;
    }

    const updatedText = (slide.contents.text ?? []).map((textElement) => {
      const matchingPlaceholder = updatedPlaceholders.find(
        (placeholder) =>
          placeholder["placeholder-id"] === textElement["placeholder-id"]
      );

      if (!matchingPlaceholder) {
        return textElement;
      }

      return {
        ...textElement,
        position: {
          ...matchingPlaceholder.position,
        },
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

  const updatedLayouts = presentation.slideset.layouts.map((layout) =>
    layout["layout-id"] === layoutId
      ? {
          ...layout,
          placeholders: updatedPlaceholders,
        }
      : layout
  );

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      layouts: updatedLayouts,
      slides,
    },
  };
};