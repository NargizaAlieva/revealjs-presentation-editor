export const IMAGE_STYLES = [
  { id: "none", label: "No Style", css: {} },

  // Frames
  { id: "simple-white", label: "Simple Frame, White", css: {
    border: "4px solid #ffffff",
    boxShadow: "0 0 0 1px #d1d5db, 2px 2px 6px rgba(0,0,0,0.15)",
  }},
  { id: "simple-gray", label: "Simple Frame, Gray", css: {
    border: "4px solid #9ca3af",
  }},
  { id: "simple-black", label: "Simple Frame, Black", css: {
    border: "4px solid #111827",
  }},
  { id: "thick-black", label: "Thick Black Frame", css: {
    border: "10px solid #111827",
  }},
  { id: "double-border", label: "Double Border", css: {
    border: "3px solid #111827",
    outline: "3px solid #111827",
    outlineOffset: "3px",
  }},
  { id: "white-double", label: "White Double Border", css: {
    border: "3px solid #ffffff",
    outline: "3px solid #ffffff",
    outlineOffset: "3px",
    boxShadow: "0 0 0 6px #9ca3af",
  }},

  // Rounded
  { id: "rounded", label: "Rounded Corners", css: {
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
  }},
  { id: "rounded-white", label: "Rounded White Frame", css: {
    borderRadius: "12px",
    border: "5px solid #ffffff",
    boxShadow: "0 0 0 1px #d1d5db, 0 4px 12px rgba(0,0,0,0.2)",
  }},
  { id: "rounded-shadow", label: "Rounded with Shadow", css: {
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  }},
  { id: "soft-edge", label: "Soft Edge", css: {
    borderRadius: "24px",
  }},
  { id: "oval", label: "Oval", css: {
    borderRadius: "50%",
  }},
  { id: "oval-white", label: "Oval White Frame", css: {
    borderRadius: "50%",
    border: "5px solid #ffffff",
    boxShadow: "0 0 0 1px #9ca3af",
  }},
  { id: "oval-black", label: "Oval Black Frame", css: {
    borderRadius: "50%",
    border: "4px solid #111827",
  }},

  // Shadows
  { id: "drop-shadow", label: "Drop Shadow", css: {
    boxShadow: "5px 5px 14px rgba(0,0,0,0.35)",
  }},
  { id: "offset-shadow", label: "Offset Shadow", css: {
    boxShadow: "8px 8px 0 rgba(0,0,0,0.18)",
  }},
  { id: "perspective-left", label: "Perspective Shadow Left", css: {
    boxShadow: "-8px 8px 0 rgba(0,0,0,0.15)",
  }},
  { id: "glow-blue", label: "Blue Glow", css: {
    boxShadow: "0 0 12px 4px rgba(99,102,241,0.6)",
  }},
  { id: "glow-white", label: "White Glow", css: {
    boxShadow: "0 0 0 3px #ffffff, 0 0 16px 4px rgba(255,255,255,0.7)",
  }},

  // Special
  { id: "tilted-right", label: "Tilted Right", css: {
    transform: "rotate(3deg)",
    boxShadow: "2px 4px 10px rgba(0,0,0,0.25)",
  }},
  { id: "tilted-left", label: "Tilted Left", css: {
    transform: "rotate(-3deg)",
    boxShadow: "-2px 4px 10px rgba(0,0,0,0.25)",
  }},
  { id: "compound", label: "Compound Frame", css: {
    border: "4px solid #1e293b",
    outline: "2px solid #94a3b8",
    outlineOffset: "3px",
  }},
  { id: "metal", label: "Metal Frame", css: {
    border: "6px solid",
    borderColor: "#d1d5db #6b7280 #6b7280 #e5e7eb",
    boxShadow: "1px 1px 4px rgba(0,0,0,0.2)",
  }},
  { id: "inset-shadow", label: "Inset Shadow", css: {
    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15)",
    border: "2px solid #e5e7eb",
  }},
  { id: "gradient-border", label: "Gradient Border", css: {
    border: "4px solid transparent",
    backgroundClip: "padding-box",
    boxShadow: "0 0 0 4px #6366f1, 0 4px 12px rgba(99,102,241,0.3)",
  }},
];

export function getStyleById(id) {
  return IMAGE_STYLES.find((s) => s.id === id) ?? IMAGE_STYLES[0];
}
