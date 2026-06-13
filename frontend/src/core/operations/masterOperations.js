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

export const updateMasterFormatting = (presentation, formatting) => ({
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
  },
});