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

  if (!slideset.title) {
    errors.push("Missing slideset.title");
  }

  if (!slideset.master) {
    errors.push("Missing slideset.master");
  } else {
    const dims = slideset.master["slide-dimensions"];
    if (!dims || typeof dims.width !== "number" || typeof dims.height !== "number") {
      errors.push("master.slide-dimensions must have numeric width and height");
    }

    if (!slideset.master["aspect-ratio"]) {
      errors.push("master.aspect-ratio is required");
    }

    if (!slideset.master["dimension-units"]) {
      errors.push("master.dimension-units is required");
    }

    if (!Array.isArray(slideset.master["color-theme"])) {
      errors.push("master.color-theme must be an array");
    }
  }

  if (!Array.isArray(slideset.layouts)) {
    errors.push("slideset.layouts must be an array");
  } else {
    if (slideset.layouts.length === 0) {
      errors.push("Presentation must contain at least one layout");
    }

    slideset.layouts.forEach((layout, index) => {
      const layoutNum = index + 1;

      if (!layout["layout-id"]) {
        errors.push(`Layout ${layoutNum} is missing layout-id`);
      }

      if (!Array.isArray(layout.placeholders)) {
        errors.push(`Layout ${layoutNum} is missing placeholders array`);
      } else {
        layout.placeholders.forEach((placeholder, placeholderIndex) => {
          const placeholderNum = placeholderIndex + 1;

          if (!placeholder["placeholder-id"]) {
            errors.push(
              `Layout ${layoutNum} placeholder ${placeholderNum} is missing placeholder-id`
            );
          }

          if (!placeholder.position) {
            errors.push(
              `Layout ${layoutNum} placeholder ${placeholderNum} is missing position`
            );
          }

          if (typeof placeholder.width !== "number") {
            errors.push(
              `Layout ${layoutNum} placeholder ${placeholderNum} width must be numeric`
            );
          }

          if (typeof placeholder.height !== "number") {
            errors.push(
              `Layout ${layoutNum} placeholder ${placeholderNum} height must be numeric`
            );
          }
        });
      }
    });
  }

  if (!Array.isArray(slideset.slides)) {
    errors.push("slideset.slides must be an array");
  } else {
    if (slideset.slides.length === 0) {
      errors.push("Presentation must contain at least one slide");
    }

    const layoutIds = new Set(
      (slideset.layouts ?? [])
        .filter((layout) => layout?.["layout-id"])
        .map((layout) => layout["layout-id"])
    );

    slideset.slides.forEach((slide, index) => {
      const num = index + 1;

      if (!slide.title || typeof slide.title.content !== "string") {
        errors.push(`Slide ${num} title must be an object with a content string`);
      }

      if (typeof slide.hidden !== "boolean") {
        errors.push(`Slide ${num} hidden must be a boolean`);
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

        if (typeof slide.contents.notes !== "string") {
          errors.push(`Slide ${num} contents.notes must be a string`);
        }

        if (typeof slide.contents.transition !== "string") {
          errors.push(`Slide ${num} contents.transition must be a string`);
        }
      }
    });
  }

  return errors;
};

export const isSlidesetValid = (presentation) => {
  return validateSlideset(presentation).length === 0;
};