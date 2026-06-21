export const DEFAULT_PRESENTATION_TITLE = "Untitled Presentation";

export const getPresentationTitle = (presentation) =>
  presentation?.slideset?.title ??
  presentation?.slideset?.filename ??
  DEFAULT_PRESENTATION_TITLE;
