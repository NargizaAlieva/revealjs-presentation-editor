export const validatePresentation = (presentation) => {
  const errors = [];

  if (!presentation?.slideset) {
    errors.push("Missing slideset root object");

    return errors;
  }

  const { slideset } = presentation;

  if (!slideset.filename) {
    errors.push("Missing filename");
  }

  if (!slideset.master) {
    errors.push("Missing master configuration");
  }

  if (!Array.isArray(slideset.layouts)) {
    errors.push("Layouts must be an array");
  }

  if (!Array.isArray(slideset.slides)) {
    errors.push("Slides must be an array");
  }

  const layoutIds = new Set(
    (slideset.layouts ?? [])
      .filter((layout) => layout?.["layout-id"])
      .map((layout) => layout["layout-id"])
  );

  (slideset.slides ?? []).forEach((slide, index) => {
    if (!slide["layout-id"]) {
      errors.push(
        `Slide ${index + 1} is missing layout-id`
      );
    }

    if (
      slide["layout-id"] &&
      !layoutIds.has(slide["layout-id"])
    ) {
      errors.push(
        `Slide ${index + 1} references unknown layout: ${slide["layout-id"]}`
      );
    }

    if (!slide.contents) {
      errors.push(
        `Slide ${index + 1} is missing contents`
      );
    }
  });

  return errors;
};

export const isPresentationValid = (
  presentation
) => {
  return (
    validatePresentation(presentation).length === 0
  );
};