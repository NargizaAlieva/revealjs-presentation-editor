export const TITLE_PLACEHOLDER = {
  "placeholder-id": "title-placeholder",
  position: { x: 120, y: 60 },
  width: 1040,
  height: 110,
  type: "text",
  role: "title",
  padding: { css: "8px" },
  background: "#FFFFFF00",
  formatting: { size: "36px", weight: "bold", align: "center" },
};

export const FOOTER_PLACEHOLDERS = [
  { "placeholder-id": "footer-date",   position: { x: 60,  y: 640 }, width: 260, height: 40, type: "text", role: "footer", padding: { css: "4px" }, background: "#FFFFFF00", formatting: { size: "20px", align: "center" }, promptText: "Date" },
  { "placeholder-id": "footer-center", position: { x: 380, y: 640 }, width: 520, height: 40, type: "text", role: "footer", padding: { css: "4px" }, background: "#FFFFFF00", formatting: { size: "20px", align: "center" }, promptText: "Footer" },
  { "placeholder-id": "footer-page",   position: { x: 960, y: 640 }, width: 260, height: 40, type: "text", role: "footer", padding: { css: "4px" }, background: "#FFFFFF00", formatting: { size: "20px", align: "center" }, promptText: "#" },
];

export const createMasterTextElement = (id, position, width, height, text, formatting) => ({
  id,
  "placeholder-id": null,
  position,
  width,
  height,
  rotation: 0,
  overflow: "shrink-on-overflow",
  "z-index": 5,
  background: "#FFFFFF00",
  userModified: true,
  paragraphs: [{
    id: `${id}-p`,
    formatting,
    bullets: "none",
    runs: [{ formatting: {}, "super-sub-script": "normal", text, link: null }],
  }],
});

export const createTextElementDefaults = (zIndex = 4, labelText = "Text") => ({
  id: crypto.randomUUID(),
  "placeholder-id": null,
  position: { x: 100, y: 100 },
  width: 300,
  height: 80,
  rotation: 0,
  "z-index": zIndex,
  background: "transparent",
  userModified: true,
  paragraphs: [{
    id: crypto.randomUUID(),
    formatting: { size: "24px", color: "var(--text-dark)", align: "left" },
    bullets: "none",
    runs: [{ formatting: {}, "super-sub-script": "normal", text: labelText, link: null }],
  }],
});
