export function addFontEntry(presentation, fontEntry) {
  const existing = presentation.slideset.fonts ?? [];
  if (existing.some((f) => f["font-id"] === fontEntry["font-id"])) return presentation;
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      fonts: [...existing, fontEntry],
    },
  };
}

export function removePresentationFont(presentation, fontId) {
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      fonts: (presentation.slideset.fonts ?? []).filter((f) => f["font-id"] !== fontId),
    },
  };
}
