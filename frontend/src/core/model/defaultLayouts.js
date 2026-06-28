export const createLayoutPlaceholder = ({
  placeholderId,
  x,
  y,
  width,
  height,
  type = "text",
  role = "body",
  padding = "8px",
  background = "#FFFFFF00",
  formatting = {},
  promptText = undefined,
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
  ...(promptText !== undefined ? { promptText } : {}),
});

export const createDefaultLayouts = ({ titleFormatting, bodyFormatting }) => {
  const makeTitleTop = () =>
    createLayoutPlaceholder({
      placeholderId: "title-placeholder",
      x: 120,
      y: 80,
      width: 1040,
      height: 90,
      type: "text",
      role: "title",
      formatting: titleFormatting,
    });

  const makeBodyFull = () =>
    createLayoutPlaceholder({
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

  const makeBodyLeft = () =>
    createLayoutPlaceholder({
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

  const makeMediaRight = () =>
    createLayoutPlaceholder({
      placeholderId: "media-placeholder",
      x: 760,
      y: 220,
      width: 360,
      height: 240,
      type: "image",
      role: "body",
      padding: "0px",
    });

  const makeLeftColumn = () =>
    createLayoutPlaceholder({
      placeholderId: "body-placeholder",
      x: 120,
      y: 220,
      width: 470,
      height: 360,
      type: "text",
      role: "body",
      padding: "12px",
      formatting: bodyFormatting,
    });

  const makeRightColumn = () =>
    createLayoutPlaceholder({
      placeholderId: "right-body-placeholder",
      x: 690,
      y: 220,
      width: 470,
      height: 360,
      type: "text",
      role: "body",
      padding: "12px",
      formatting: bodyFormatting,
      promptText: "Click to edit second column text",
    });

  return [
    {
      "layout-id": "title-content",
      name: "Title and Content",
      placeholders: [makeTitleTop(), makeBodyFull()],
    },
    {
      "layout-id": "title-content-media",
      name: "Title, Content and Media",
      placeholders: [makeTitleTop(), makeBodyLeft(), makeMediaRight()],
    },
    {
      "layout-id": "two-columns",
      name: "Two Columns",
      placeholders: [makeTitleTop(), makeLeftColumn(), makeRightColumn()],
    },
    {
      "layout-id": "title-only",
      name: "Title Only",
      placeholders: [makeTitleTop()],
    },
    {
      "layout-id": "blank",
      name: "Blank",
      placeholders: [],
    },
  ];
};