export const validateSlideset = (presentation) => {
  const errors = [];

  if (!presentation) {
    errors.push("Missing presentation object");
    return errors;
  }

  if (!presentation.slideset) {
    errors.push("Missing slideset wrapper");
    return errors;
  }

  const { slideset } = presentation;

  if (!slideset.filename) {
    errors.push("Missing slideset.filename");
  }

  if (!slideset.master) {
    errors.push("Missing slideset.master");
  } else {
    const dims = slideset.master["slide-dimensions"];
    if (!dims || typeof dims.width !== "number" || typeof dims.height !== "number") {
      errors.push("master.slide-dimensions must have numeric width and height");
    }
    if (!Array.isArray(slideset.master["color-theme"])) {
      errors.push("master.color-theme must be an array");
    }
  }

  if (!Array.isArray(slideset.layouts)) {
  errors.push("slideset.layouts must be an array");
} else {
  slideset.layouts.forEach((layout, index) => {
    if (!layout["layout-id"]) {
      errors.push(`Layout ${index + 1} is missing layout-id`);
    }

    if (!Array.isArray(layout.placeholders)) {
      errors.push(`Layout ${index + 1} is missing placeholders array`);
    } else {
      layout.placeholders.forEach((placeholder, placeholderIndex) => {
        const placeholderNumber = placeholderIndex + 1;

        if (!placeholder["placeholder-id"]) {
          errors.push(
            `Layout ${index + 1} placeholder ${placeholderNumber} is missing placeholder-id`
          );
        }

        if (!placeholder.position) {
          errors.push(
            `Layout ${index + 1} placeholder ${placeholderNumber} is missing position`
          );
        }

        if (typeof placeholder.width !== "number") {
          errors.push(
            `Layout ${index + 1} placeholder ${placeholderNumber} width must be numeric`
          );
        }

        if (typeof placeholder.height !== "number") {
          errors.push(
            `Layout ${index + 1} placeholder ${placeholderNumber} height must be numeric`
          );
        }
      });
    }
  });
}

  if (!Array.isArray(slideset.slides)) {
    errors.push("slideset.slides must be an array");
  } else {
    const layoutIds = new Set(
      (slideset.layouts ?? [])
        .filter((layout) => layout?.["layout-id"])
        .map((layout) => layout["layout-id"]),
    );

    slideset.slides.forEach((slide, index) => {
      const num = index + 1;

      if (!slide.title || typeof slide.title.content !== "string") {
        errors.push(`Slide ${num} title must be an object with a content string`);
      }

      if (!slide["layout-id"]) {
        errors.push(`Slide ${num} is missing layout-id`);
      } else if (!layoutIds.has(slide["layout-id"])) {
        errors.push(`Slide ${num} references unknown layout: ${slide["layout-id"]}`);
      }

      if (!slide.contents) {
        errors.push(`Slide ${num} is missing contents`);
      } else {
        const requiredContentArrays = [
          "text",
          "media",
          "shapes",
          "tables",
          "groups",
          "animations",
        ];

        requiredContentArrays.forEach((key) => {
          if (!Array.isArray(slide.contents[key])) {
            errors.push(`Slide ${num} contents.${key} must be an array`);
          }
        });
      }
    });
  }

  return errors;
};

export const isSlidesetValid = (presentation) => {
  return validateSlideset(presentation).length === 0;
};