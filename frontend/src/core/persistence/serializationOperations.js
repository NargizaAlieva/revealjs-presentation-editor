import { validateSlideset } from "../model/slidesetValidation";

export const serializePresentation = (presentation) => {
  return JSON.stringify(presentation, null, 2);
};

export const deserializePresentation = (jsonString) => {
  try {
    const parsedPresentation = JSON.parse(jsonString);
    const validationErrors = validateSlideset(parsedPresentation);

    if (validationErrors.length > 0) {
      console.warn("Presentation validation errors:", validationErrors);
      return { data: parsedPresentation, errors: validationErrors };
    }

    return { data: parsedPresentation, errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to load presentation:", message);
    return null;
  }
};

export const downloadPresentationAsJson = (presentation) => {
  const json = serializePresentation(presentation);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = presentation.slideset?.filename ?? "untitled-presentation.json";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};