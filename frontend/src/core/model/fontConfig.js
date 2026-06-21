export const DEFAULT_FONTS = [
  "Sora",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Roboto",
  "Source Sans Pro",
  "Impact",
  "Comic Sans MS",
];

export const FONT_SIZES = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 54, 60, 72,
];

// Merge presentation-specific fonts with the default font list,
// keeping presentation fonts first and deduplicating.
export const getAvailableFonts = (presentation) => {
  const presentationFonts = (presentation?.slideset?.fonts ?? [])
    .map((f) => f["font-id"])
    .filter(Boolean);
  return [
    ...presentationFonts,
    ...DEFAULT_FONTS.filter((f) => !presentationFonts.includes(f)),
  ];
};
