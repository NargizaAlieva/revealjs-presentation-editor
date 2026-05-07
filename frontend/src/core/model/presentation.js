const createId = () => crypto.randomUUID();

const createTextFormatting = ({
  font = "Arial",
  size = "28px",
  color = "var(--text-dark)",
  weight = "normal",
  align = "left",
  verticalAlign = "top",
  lineSpacing = "1.4",
} = {}) => ({
  font,
  size,
  color,
  weight,
  italics: false,
  "text-decoration": "none",
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
  zIndex,
  text,
  formatting,
  posType = "placeholder",
}) => ({
  id: createId(),
  "placeholder-id": placeholderId,
  position: {
    x,
    y,
  },
  "pos-type": posType,
  width,
  height,
  rotation: 0,
  overflow: "shrink-on-overflow",
  "z-index": zIndex,
  background: "transparent",
  paragraphs: [
    {
      id: createId(),
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

export const createDefaultPresentation = () => {
  const titleFormatting = createTextFormatting({
    size: "44px",
    weight: "bold",
    align: "center",
    verticalAlign: "middle",
    lineSpacing: "1.2",
  });

  const bodyFormatting = createTextFormatting({
    size: "28px",
    weight: "normal",
    align: "left",
    verticalAlign: "top",
    lineSpacing: "1.4",
  });

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
          {
            "css-variable-name": "bg-light",
            color: "#FFFFFFFF",
          },
          {
            "css-variable-name": "text-dark",
            color: "#111111FF",
          },
          {
            "css-variable-name": "accent1",
            color: "#4F46E5FF",
          },
        ],
      },

      layouts: [
        {
          "layout-id": "title-content",

          placeholders: [
            {
              "placeholder-id": "title-placeholder",

              position: {
                x: 120,
                y: 80,
              },

              width: 1040,
              height: 90,

              padding: {
                css: "8px",
              },

              type: "text",
              role: "title",
              background: "transparent",
              formatting: titleFormatting,
            },
            {
              "placeholder-id": "body-placeholder",

              position: {
                x: 160,
                y: 220,
              },

              width: 960,
              height: 360,

              padding: {
                css: "12px",
              },

              type: "text",
              role: "body",
              background: "transparent",
              formatting: bodyFormatting,
            },
          ],
        },
      ],

      slides: [
        {
          title: {
            content: "First Slide",
          },

          "layout-id": "title-content",

          hidden: false,

          contents: {
            text: [
              createTextElement({
                placeholderId: "title-placeholder",
                x: 120,
                y: 80,
                width: 1040,
                height: 90,
                zIndex: 1,
                text: "My First Slide",
                formatting: titleFormatting,
              }),

              createTextElement({
                placeholderId: "body-placeholder",
                x: 160,
                y: 220,
                width: 960,
                height: 360,
                zIndex: 2,
                text: "Start editing your presentation.",
                formatting: bodyFormatting,
              }),
            ],

            media: [],

            shapes: [],
            tables: [],
            groups: [],

            animations: [],

            background: "var(--bg-light)",

            transition: "slide",

            notes: "",
          },
        },
      ],
    },
  };
};