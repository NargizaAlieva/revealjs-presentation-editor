
import { createDefaultLayouts } from "./defaultLayouts";

const createId = (prefix = "id") => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createTextFormatting = ({
  font = "Arial",
  size = "28px",
  color = "var(--text-dark)",
  weight = "normal",
  italics = false,
  textDecoration = "none",
  align = "left",
  verticalAlign = "top",
  lineSpacing = "1.4em",
} = {}) => ({
  font,
  size,
  color,
  weight,
  italics,
  "text-decoration": textDecoration,
  "line-spacing": lineSpacing,
  "list-type": "none",
  "list-style": {},
  "indent-level": 0,
  margin: "0",
  align,
  "vertical-align": verticalAlign,
});

const createTextElement = ({
  placeholderId,
  x,
  y,
  width,
  height,
  zIndex = 1,
  text = "",
  formatting,
  posType = "relative-to-placeholder",
}) => ({
  id: createId("text"),
  "placeholder-id": placeholderId,
  position: { x, y },
  "pos-type": posType,
  width,
  height,
  rotation: 0,
  overflow: "shrink-on-overflow",
  "z-index": zIndex,
  background: "transparent",
  paragraphs: [
    {
      id: createId("paragraph"),
      formatting,
      bullets: "none",
      runs: [
        {
          formatting: {},
          "super-sub-script": "normal",
          text,
          link: null,
        },
      ],
    },
  ],
});

const createDefaultSlideContents = ({
  text = [],
  media = [],
  background = "var(--bg-light)",
  transition = "slide",
  notes = "",
} = {}) => ({
  text,
  shapes: [],
  media,
  tables: [],
  groups: [],
  animations: [],
  background,
  transition,
  notes,
});

const createMediaElement = (placeholder) => ({
  id: createId("media"),
  "placeholder-id": placeholder["placeholder-id"],
  "file-link": "",
  "media-type": placeholder.type === "video" ? "video" : "image",
  position: { ...placeholder.position },
  width: placeholder.width,
  height: placeholder.height,
  rotation: 0,
  "z-index": 1,
  scale: 1,
  crop: null,
  effects: {},
  playback: {},
});

export const createDefaultPresentation = () => {
  const titleFormatting = createTextFormatting({
    size: "44px",
    weight: "bold",
    align: "center",
    verticalAlign: "middle",
    lineSpacing: "1.2em",
  });

  const bodyFormatting = createTextFormatting({
    size: "28px",
    weight: "normal",
    align: "left",
    verticalAlign: "top",
    lineSpacing: "1.4em",
  });

  const layouts = createDefaultLayouts({
    titleFormatting,
    bodyFormatting,
  });

  const defaultLayout = layouts.find(
    (layout) => layout["layout-id"] === "title-content-media"
  );

  const titlePlaceholder = defaultLayout.placeholders.find(
    (p) => p["placeholder-id"] === "title-placeholder"
  );

  const bodyPlaceholder = defaultLayout.placeholders.find(
    (p) => p["placeholder-id"] === "body-placeholder"
  );

  const mediaPlaceholder = defaultLayout.placeholders.find(
    (p) => p["placeholder-id"] === "media-placeholder"
  );

  return {
    slideset: {
      filename: "untitled-presentation.json",
      title: "Untitled Presentation",
      author: "",
      "creation-date": new Date().toISOString().split("T")[0],

      fonts: [],

      master: {
        formatting: {},
        "aspect-ratio": "16:9",
        "slide-dimensions": {
          width: 1280,
          height: 720,
        },
        "dimension-units": "px",
        "color-theme": [
          { "css-variable-name": "bg-light", color: "#FFFFFFFF" },
          { "css-variable-name": "bg-dark", color: "#1E1E2EFF" },
          { "css-variable-name": "text-dark", color: "#111111FF" },
          { "css-variable-name": "text-light", color: "#F8F8F8FF" },
          { "css-variable-name": "accent1", color: "#4F46E5FF" },
          { "css-variable-name": "accent2", color: "#7C3AEDFF" },
          { "css-variable-name": "accent3", color: "#06B6D4FF" },
          { "css-variable-name": "accent4", color: "#10B981FF" },
          { "css-variable-name": "accent5", color: "#F59E0BFF" },
          { "css-variable-name": "accent6", color: "#EF4444FF" },
          { "css-variable-name": "link", color: "#2563EBFF" },
          { "css-variable-name": "link-visited", color: "#7C3AEDFF" },
        ],
      },

      layouts,

      slides: [
        {
          title: {
            content: "First Slide",
          },
          "layout-id": "title-content-media",
          hidden: false,
          contents: createDefaultSlideContents({
            text: [
              createTextElement({
                placeholderId: "title-placeholder",
                x: titlePlaceholder.position.x,
                y: titlePlaceholder.position.y,
                width: titlePlaceholder.width,
                height: titlePlaceholder.height,
                zIndex: 1,
                text: "My First Slide",
                formatting: titleFormatting,
              }),
              createTextElement({
                placeholderId: "body-placeholder",
                x: bodyPlaceholder.position.x,
                y: bodyPlaceholder.position.y,
                width: bodyPlaceholder.width,
                height: bodyPlaceholder.height,
                zIndex: 2,
                text: "Start editing your presentation.",
                formatting: bodyFormatting,
              }),
            ],
            media: [createMediaElement(mediaPlaceholder)],
          }),
        },
      ],
    },
  };
};