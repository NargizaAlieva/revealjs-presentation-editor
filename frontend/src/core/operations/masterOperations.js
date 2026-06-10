export const updateMasterTheme = (presentation, colorTheme) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      "color-theme": colorTheme,
    },
  },
});

export const updateMasterDimensions = (
  presentation,
  slideDimensions,
  aspectRatio,
) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      "aspect-ratio": aspectRatio,
      "slide-dimensions": slideDimensions,
    },
  },
});

export const updateMasterFormatting = (presentation, formatting) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      formatting: {
        ...presentation.slideset.master.formatting,
        ...formatting,
      },
    },
  },
});