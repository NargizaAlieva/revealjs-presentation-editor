export const validatePresentation = (presentation) => {
  const errors = [];

  if (!presentation) {
    errors.push("Missing presentation object");
    return errors;
  }

  if (!presentation.filename) {
    errors.push("Missing filename");
  }

  if (!presentation.master) {
    errors.push("Missing master object");
  }

  if (!Array.isArray(presentation.layouts)) {
    errors.push("Layouts must be an array");
  }

  if (!Array.isArray(presentation.slides)) {
    errors.push("Slides must be an array");
  }

  const layoutIds = new Set(
    (presentation.layouts ?? [])
      .filter((layout) => layout?.["layout-id"])
      .map((layout) => layout["layout-id"]),
  );

  (presentation.slides ?? []).forEach((slide, index) => {
    if (!slide["layout-id"]) {
      errors.push(`Slide ${index + 1} is missing layout-id`);
    }

    if (slide["layout-id"] && !layoutIds.has(slide["layout-id"])) {
      errors.push(
        `Slide ${index + 1} references unknown layout: ${slide["layout-id"]}`,
      );
    }

    if (!slide.contents) {
      errors.push(`Slide ${index + 1} is missing contents`);
    }
  });

  return errors;
};

export const isPresentationValid = (presentation) => {
  return validatePresentation(presentation).length === 0;
};