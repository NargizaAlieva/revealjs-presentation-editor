export const createLayoutPlaceholder = ({
  placeholderId,
  x,
  y,
  width,
  height,
  type = "text",
  role = "body",
  padding = "8px",
  background = "transparent",
  formatting = {},
}) => ({
  "placeholder-id": placeholderId,
  position: { x, y },
  width,
  height,
  padding: { css: padding },
  type,
  role,
  background,
  formatting,
});

export const createDefaultLayouts = ({ titleFormatting, bodyFormatting }) => {
  const titleTop = createLayoutPlaceholder({
    placeholderId: "title-placeholder",
    x: 120,
    y: 80,
    width: 1040,
    height: 90,
    type: "text",
    role: "title",
    formatting: titleFormatting,
  });

  const bodyFull = createLayoutPlaceholder({
    placeholderId: "body-placeholder",
    x: 120,
    y: 220,
    width: 1040,
    height: 360,
    type: "text",
    role: "body",
    padding: "12px",
    formatting: bodyFormatting,
  });

  const bodyLeft = createLayoutPlaceholder({
    placeholderId: "body-placeholder",
    x: 120,
    y: 220,
    width: 560,
    height: 360,
    type: "text",
    role: "body",
    padding: "12px",
    formatting: bodyFormatting,
  });

  const mediaRight = createLayoutPlaceholder({
    placeholderId: "media-placeholder",
    x: 760,
    y: 220,
    width: 360,
    height: 240,
    type: "image",
    role: "body",
    padding: "0px",
  });

  const leftColumn = createLayoutPlaceholder({
    placeholderId: "left-body-placeholder",
    x: 120,
    y: 220,
    width: 470,
    height: 360,
    type: "text",
    role: "body",
    padding: "12px",
    formatting: bodyFormatting,
  });

  const rightColumn = createLayoutPlaceholder({
    placeholderId: "right-body-placeholder",
    x: 690,
    y: 220,
    width: 470,
    height: 360,
    type: "text",
    role: "body",
    padding: "12px",
    formatting: bodyFormatting,
  });

  return [
    {
      "layout-id": "title-content",
      placeholders: [titleTop, bodyFull],
    },
    {
      "layout-id": "title-content-media",
      placeholders: [titleTop, bodyLeft, mediaRight],
    },
    {
      "layout-id": "two-columns",
      placeholders: [titleTop, leftColumn, rightColumn],
    },
    {
      "layout-id": "title-only",
      placeholders: [titleTop],
    },
    {
      "layout-id": "blank",
      placeholders: [],
    },
  ];
};