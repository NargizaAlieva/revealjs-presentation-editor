import { createPresentation, savePresentation } from "./persistenceFacade";
import { DEFAULT_PRESENTATION_TITLE } from "../utils/presentationUtils";

export const importPresentationFromJson = async (jsonText) => {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error("Invalid JSON file — could not parse.");
  }

  if (!data?.slideset) {
    throw new Error("File does not appear to be a valid presentation (missing slideset).");
  }

  const title = data.slideset.title ?? data.slideset.filename ?? DEFAULT_PRESENTATION_TITLE;
  const id = await createPresentation(title);
  await savePresentation(id, data);
  return id;
};
