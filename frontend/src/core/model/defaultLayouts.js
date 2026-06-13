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
    });

  return [
    {
      "layout-id": "title-content",
      placeholders: [makeTitleTop(), makeBodyFull()],
    },
    {
      "layout-id": "title-content-media",
      placeholders: [makeTitleTop(), makeBodyLeft(), makeMediaRight()],
    },
    {
      "layout-id": "two-columns",
      placeholders: [makeTitleTop(), makeLeftColumn(), makeRightColumn()],
    },
    {
      "layout-id": "title-only",
      placeholders: [makeTitleTop()],
    },
    {
      "layout-id": "blank",
      placeholders: [],
    },

    {
      "layout-id": "content-subtitle-image",
      placeholders: [
        createLayoutPlaceholder({
          placeholderId: "title-placeholder",
          x: 75,
          y: 80,
          width: 820,
          height: 290,
          type: "text",
          role: "title",
          formatting: titleFormatting,
        }),
        createLayoutPlaceholder({
          placeholderId: "body-placeholder",
          x: 75,
          y: 410,
          width: 560,
          height: 160,
          type: "text",
          role: "body",
          padding: "12px",
          formatting: bodyFormatting,
        }),
        createLayoutPlaceholder({
          placeholderId: "media-placeholder",
          x: 920,
          y: 0,
          width: 360,
          height: 720,
          type: "image",
          role: "body",
          padding: "0px",
        }),
      ],
    },
  ];
};