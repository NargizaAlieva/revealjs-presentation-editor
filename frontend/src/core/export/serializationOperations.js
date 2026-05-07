import { validatePresentation } from "../model/presentationValidation";

export const serializePresentation = (presentation) => {
  return JSON.stringify(presentation, null, 2);
};

export const deserializePresentation = (jsonString) => {
  try {
    const parsedPresentation = JSON.parse(jsonString);
    const validationErrors = validatePresentation(parsedPresentation);
    
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join("; "));
    }

    return parsedPresentation;
  } catch (error) {
    throw new Error(
      `Failed to load presentation: ${error.message}`
    );
  }
};

export const downloadPresentationAsJson = (presentation) => {
  const json = serializePresentation(presentation);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download =
    presentation.slideset.filename ??
    "untitled-presentation.json";

  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
};