export const preparePresentationForExport = (presentation) => {
  if (!presentation?.slideset) {
    throw new Error("Invalid presentation: missing slideset");
  }

  const { slideset } = presentation;

  return {
    metadata: {
      filename: slideset.filename ?? "untitled-presentation.json",
      title: slideset.title ?? "Untitled Presentation",
      author: slideset.author ?? "",
      creationDate: slideset["creation-date"] ?? "",
    },

    master: {
      aspectRatio: slideset.master?.["aspect-ratio"] ?? "16:9",
      slideDimensions: slideset.master?.["slide-dimensions"] ?? {
        width: 1280,
        height: 720,
      },
      dimensionUnits: slideset.master?.["dimension-units"] ?? "px",
      colorTheme: slideset.master?.["color-theme"] ?? [],
      formatting: slideset.master?.formatting ?? {},
    },

    layouts: slideset.layouts ?? [],

    slides: (slideset.slides ?? [])
      .filter((slide) => !slide.hidden)
      .map((slide, slideIndex) => ({
        index: slideIndex,
        title: slide.title?.content ?? `Slide ${slideIndex + 1}`,
        layoutId: slide["layout-id"],
        background: slide.contents?.background ?? "var(--bg-light)",
        transition: slide.contents?.transition ?? "slide",
        notes: slide.contents?.notes ?? "",

        textElements: slide.contents?.text ?? [],
        mediaElements: slide.contents?.media ?? [],

        animations: slide.contents?.animations ?? [],

        unsupportedElements: {
          shapes: slide.contents?.shapes ?? [],
          tables: slide.contents?.tables ?? [],
          groups: slide.contents?.groups ?? [],
        },
      })),
  };
};