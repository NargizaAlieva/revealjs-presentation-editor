export const updateMasterTheme = (presentation, colorTheme, decorations) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      "color-theme": colorTheme,
      ...(decorations !== undefined ? { decorations } : {}),
    },
  },
});

export const updateMasterDimensions = (
  presentation,
  slideDimensions,
  aspectRatio,
  dimensionUnits,
) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      "slide-dimensions": slideDimensions,
      "aspect-ratio": aspectRatio,
      "dimension-units": dimensionUnits,
    },
  },
});

export const updateMasterFormatting = (presentation, formatting) => {
  // When font changes, propagate it to every text element's paragraph formatting
  const slides = presentation?.slideset?.slides ?? [];
  const updatedSlides = formatting.font
    ? slides.map((slide) => ({
      ...slide,
      contents: {
        ...slide.contents,
        text: (slide.contents?.text ?? []).map((textEl) => ({
          ...textEl,
          paragraphs: (textEl.paragraphs ?? []).map((para) => ({
            ...para,
            formatting: {
              ...(para.formatting ?? {}),
              font: formatting.font,
            },
          })),
        })),
      },
    }))
    : slides;

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: {
        ...presentation.slideset.master,
        formatting: {
          ...(presentation.slideset.master?.formatting ?? {}),
          ...formatting,
        },
      },
      slides: updatedSlides,
    },
  };
};

export const addMasterElement = (presentation, type, element) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      elements: {
        ...(presentation.slideset.master.elements ?? {}),
        [type]: [
          ...(presentation.slideset.master.elements?.[type] ?? []),
          element,
        ],
      },
    },
  },
});

export const updateMasterElement = (presentation, type, elementId, updates) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      elements: {
        ...(presentation.slideset.master.elements ?? {}),
        [type]: (presentation.slideset.master.elements?.[type] ?? []).map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      },
    },
  },
});

export const deleteMasterElement = (presentation, type, elementId) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      elements: {
        ...(presentation.slideset.master.elements ?? {}),
        [type]: (presentation.slideset.master.elements?.[type] ?? []).filter(
          (el) => el.id !== elementId
        ),
      },
    },
  },
});