export const toHex6 = (color) => {
  if (typeof color === "string" && color.length === 9) return color.slice(0, 7);
  return color ?? "#ffffff";
};

export const toHex9 = (hex) => {
  if (!hex || typeof hex !== "string") return "#000000FF";
  if (hex.length === 9) return hex;
  return (hex.length === 7 ? hex : hex.slice(0, 7)) + "FF";
};

export const normalizeColorTheme = (colorTheme) =>
  (colorTheme ?? []).map((entry) => ({ ...entry, color: toHex6(entry.color) }));
