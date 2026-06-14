export const BULLET_STYLES = [
  { marker: null, label: "None" },
  { marker: "•", label: "Filled circle" },
  { marker: "○", label: "Open circle" },
  { marker: "▪", label: "Small square" },
  { marker: "□", label: "Open square" },
  { marker: "❖", label: "Diamond" },
  { marker: "➢", label: "Arrow" },
  { marker: "✓", label: "Checkmark" },
];

export const NUMBERED_STYLES = [
  { style: null, label: "None" },
  { style: "decimal", label: "1. 2. 3." },
  { style: "lower-alpha", label: "a. b. c." },
  { style: "upper-alpha", label: "A. B. C." },
  { style: "lower-roman", label: "i. ii. iii." },
  { style: "upper-roman", label: "I. II. III." },
];

export const LAYOUTS = [
  { id: "title-content", label: "Title and Content" },
  { id: "title-content-media", label: "Title, Content and Media" },
  { id: "two-columns", label: "Two Columns" },
  { id: "title-only", label: "Title Only" },
  { id: "blank", label: "Blank" },
];

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
