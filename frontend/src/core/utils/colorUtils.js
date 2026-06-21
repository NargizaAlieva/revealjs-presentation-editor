// Color normalization utilities.

// Strip alpha channel from a 9-char RRGGBBFF color string → 6-char #RRGGBB
export const toHex6 = (color) => {
  if (typeof color === "string" && color.length === 9) return color.slice(0, 7);
  return color ?? "#ffffff";
};

// Ensure a hex color has an opaque alpha suffix (RRGGBBFF format)
export const toHex9 = (hex) =>
  (hex.length === 7 ? hex : hex.slice(0, 7)) + "FF";
