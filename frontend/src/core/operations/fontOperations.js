export function addFontEntry(presentation, fontEntry) {
  const existing = presentation.slideset.fonts ?? [];
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
