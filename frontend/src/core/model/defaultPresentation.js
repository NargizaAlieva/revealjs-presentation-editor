import { createDefaultLayouts } from "./defaultLayouts";
import { DESIGN_THEMES } from "./designThemes";

const createId = (prefix = "id") => `${prefix}-${crypto.randomUUID()}`;

const createTextFormatting = ({
  size = "28px",
  color = "var(--text-dark)",
  weight = "normal",
  italics = false,
  textDecoration = "none",
  align = "left",
  verticalAlign = "top",
  lineSpacing = "1.4em",
} = {}) => ({
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
  overflow: "auto-fit",
  "z-index": zIndex,
  background: "transparent",
  userModified: false,
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
  comments = [],
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
  comments,
});

const createMediaElement = (placeholder) => ({
  id: createId("media"),
  "file-link": "",
  "media-type": placeholder.type === "video" ? "video" : "image",
  position: { ...placeholder.position },
  width: placeholder.width,
  height: placeholder.height,
  rotation: 0,
  "z-index": 1,
  scale: 1,
  crop: [],
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
    (layout) => layout["layout-id"] === "title-content-media",
  );

  if (!defaultLayout) {
    throw new Error(
      "Default layout 'title-content-media' not found in createDefaultLayouts",
    );
  }

  const titlePlaceholder = defaultLayout.placeholders.find(
    (p) => p["placeholder-id"] === "title-placeholder",
  );

  const bodyPlaceholder = defaultLayout.placeholders.find(
    (p) => p["placeholder-id"] === "body-placeholder",
  );

  const mediaPlaceholder = defaultLayout.placeholders.find(
    (p) => p["placeholder-id"] === "media-placeholder",
  );

  return {
    slideset: {
      filename: "untitled-presentation.json",
      title: "Untitled Presentation",
      author: "",
      "creation-date": new Date().toISOString().split("T")[0],

      fonts: [],

      master: {
        formatting: {
          font: "Arial",
          color: "var(--text-dark)",
          size: "24px",
          weight: "normal",
          italics: false,
          "text-decoration": "none",
          "line-spacing": "1.4em",
          align: "left",
          "vertical-align": "top",
        },
        "aspect-ratio": "16:9",
        "slide-dimensions": {
          width: 1280,
          height: 720,
        },
        "dimension-units": "px",
        "color-theme": DESIGN_THEMES.find((t) => t.id === "default").colorTheme,
        elements: {
          text: [],
          shapes: [],
          media: [],
        },
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
                formatting: {},
              }),
              createTextElement({
                placeholderId: "body-placeholder",
                x: bodyPlaceholder.position.x,
                y: bodyPlaceholder.position.y,
                width: bodyPlaceholder.width,
                height: bodyPlaceholder.height,
                zIndex: 2,
                text: "Start editing your presentation.",
                formatting: {},
              }),
            ],
            media: [createMediaElement(mediaPlaceholder)],
          }),
        },
      ],
    },
  };
};
