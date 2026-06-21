import { createPlaceholderPseudoElement } from "./layoutOperations";
import { TITLE_PLACEHOLDER, FOOTER_PLACEHOLDERS, createMasterTextElement } from "../model/masterDefaults";

export const buildMasterPseudoSlide = (masterElements) => ({
  contents: {
    text: masterElements.text ?? [],
    media: masterElements.media ?? [],
    background: "#FFFFFFFF",
  },
});

export const buildLayoutPseudoSlide = (layout, masterFormatting) => ({
  contents: {
    text: [
      ...(layout.placeholders ?? [])
        .filter((p) => p.type === "text")
        .map((p) => createPlaceholderPseudoElement(p, masterFormatting)),
      ...(layout.elements?.text ?? []),
    ],
    media: [
      ...(layout.placeholders ?? [])
        .filter((p) => p.type === "image" || p.type === "video")
        .map((p) => createPlaceholderPseudoElement(p, masterFormatting)),
      ...(layout.elements?.media ?? []),
    ],
    background: "#FFFFFFFF",
  },
});

export const toggleMasterTitle = (presentation, layoutId) => {
  if (layoutId) {
    const layouts = presentation?.slideset?.layouts ?? [];
    const layout = layouts.find((l) => l["layout-id"] === layoutId);
    const hasTitle = (layout?.placeholders ?? []).some((p) => p.role === "title");
    const updatedPlaceholders = hasTitle
      ? (layout.placeholders ?? []).filter((p) => p["placeholder-id"] !== "title-placeholder")
      : [...(layout.placeholders ?? []), TITLE_PLACEHOLDER];
    return {
      ...presentation,
      slideset: {
        ...presentation.slideset,
        layouts: layouts.map((l) =>
          l["layout-id"] === layoutId ? { ...l, placeholders: updatedPlaceholders } : l
        ),
      },
    };
  }
  const elements = presentation?.slideset?.master?.elements ?? {};
  const hasTitle = (elements.text ?? []).some((el) => el.id === "master-title");
  const newText = hasTitle
    ? (elements.text ?? []).filter((el) => el.id !== "master-title")
    : [
        ...(elements.text ?? []),
        createMasterTextElement("master-title", { x: 120, y: 60 }, 1040, 110,
          "Click to edit Master title style", { size: "36px", weight: "bold", align: "center" }),
      ];
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: { ...presentation.slideset.master, elements: { ...elements, text: newText } },
    },
  };
};

export const toggleMasterFooters = (presentation, layoutId) => {
  if (layoutId) {
    const layouts = presentation?.slideset?.layouts ?? [];
    const layout = layouts.find((l) => l["layout-id"] === layoutId);
    const hasFooters = (layout?.placeholders ?? []).some((p) => p["placeholder-id"]?.startsWith("footer-"));
    const updatedPlaceholders = hasFooters
      ? (layout.placeholders ?? []).filter((p) => !p["placeholder-id"]?.startsWith("footer-"))
      : [...(layout.placeholders ?? []), ...FOOTER_PLACEHOLDERS];
    return {
      ...presentation,
      slideset: {
        ...presentation.slideset,
        layouts: layouts.map((l) =>
          l["layout-id"] === layoutId ? { ...l, placeholders: updatedPlaceholders } : l
        ),
      },
    };
  }
  const FOOTER_IDS = ["master-footer-date", "master-footer-center", "master-footer-page"];
  const elements = presentation?.slideset?.master?.elements ?? {};
  const hasFooters = (elements.text ?? []).some((el) => FOOTER_IDS.includes(el.id));
  const fmt = { size: "20px", align: "center" };
  const newText = hasFooters
    ? (elements.text ?? []).filter((el) => !FOOTER_IDS.includes(el.id))
    : [
        ...(elements.text ?? []),
        createMasterTextElement("master-footer-date",   { x: 60,  y: 640 }, 260, 40, "Date",   fmt),
        createMasterTextElement("master-footer-center", { x: 380, y: 640 }, 520, 40, "Footer", fmt),
        createMasterTextElement("master-footer-page",   { x: 960, y: 640 }, 260, 40, "#",      fmt),
      ];
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: { ...presentation.slideset.master, elements: { ...elements, text: newText } },
    },
  };
};

export const updateMasterTheme = (presentation, colorTheme, decorations) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      "color-theme": colorTheme,
      ...(decorations !== undefined ? { decorations } : {}),
    },
  },
});

export const updateMasterDimensions = (
  presentation,
  slideDimensions,
  aspectRatio,
  dimensionUnits,
) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      "slide-dimensions": slideDimensions,
      "aspect-ratio": aspectRatio,
      "dimension-units": dimensionUnits,
    },
  },
});

export const updateMasterFormatting = (presentation, formatting) => {
  const oldMaster = presentation.slideset?.master?.formatting ?? {};

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: {
        ...presentation.slideset.master,
        formatting: { ...oldMaster, ...formatting },
      },
    },
  };
};

export const addMasterElement = (presentation, type, element) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      elements: {
        ...(presentation.slideset.master.elements ?? {}),
        [type]: [
          ...(presentation.slideset.master.elements?.[type] ?? []),
          element,
        ],
      },
    },
  },
});

export const updateMasterElement = (presentation, type, elementId, updates) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      elements: {
        ...(presentation.slideset.master.elements ?? {}),
        [type]: (presentation.slideset.master.elements?.[type] ?? []).map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        ),
      },
    },
  },
});

export const deleteMasterElement = (presentation, type, elementId) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    master: {
      ...presentation.slideset.master,
      elements: {
        ...(presentation.slideset.master.elements ?? {}),
        [type]: (presentation.slideset.master.elements?.[type] ?? []).filter(
          (el) => el.id !== elementId
        ),
      },
    },
  },
});

const createParagraphId = () => crypto.randomUUID?.() ?? `p-${Date.now()}`;

const RUN_ONLY_KEYS = new Set(["super-sub-script"]);

export const updateMasterTextFormatting = (presentation, elementId, formattingUpdate) => {
  const elements = presentation?.slideset?.master?.elements?.text ?? [];

  const paragraphUpdate = Object.fromEntries(
    Object.entries(formattingUpdate).filter(([k]) => !RUN_ONLY_KEYS.has(k)),
  );

  const updatedText = elements.map((el) => {
    if (el.id !== elementId) return el;
    return {
      ...el,
      paragraphs: (el.paragraphs ?? []).map((paragraph) => ({
        ...paragraph,
        formatting: { ...(paragraph.formatting ?? {}), ...paragraphUpdate },
        runs: (paragraph.runs ?? []).map((run) => ({
          ...run,
          formatting: { ...(run.formatting ?? {}), ...formattingUpdate },
        })),
      })),
    };
  });

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: {
        ...presentation.slideset.master,
        elements: {
          ...(presentation.slideset.master.elements ?? {}),
          text: updatedText,
        },
      },
    },
  };
};

export const updateMasterTextContent = (presentation, elementId, newText) => {
  const elements = presentation?.slideset?.master?.elements?.text ?? [];
  const updatedText = elements.map((el) => {
    if (el.id !== elementId) return el;
    const lines = newText.split("\n");
    const existingParagraphs = el.paragraphs ?? [];
    const templateFormatting = existingParagraphs[0]?.formatting ?? {};
    const templateRunFormatting = existingParagraphs[0]?.runs?.[0]?.formatting ?? {};
    const updatedParagraphs = lines.map((line, i) => {
      const existing = existingParagraphs[i];
      return {
        id: existing?.id ?? createParagraphId(),
        formatting: existing?.formatting ?? { ...templateFormatting },
        bullets: existing?.bullets ?? "none",
        runs: [{
          formatting: existing?.runs?.[0]?.formatting ?? { ...templateRunFormatting },
          "super-sub-script": existing?.runs?.[0]?.["super-sub-script"] ?? "normal",
          text: line,
          link: existing?.runs?.[0]?.link ?? null,
        }],
      };
    });
    return { ...el, userModified: true, paragraphs: updatedParagraphs };
  });
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: {
        ...presentation.slideset.master,
        elements: {
          ...(presentation.slideset.master.elements ?? {}),
          text: updatedText,
        },
      },
    },
  };
};

// Update the bg-light entry in the master color-theme with a new hex color.
export const applyBackgroundColor = (presentation, hex) => {
  const newColor = (hex.length === 7 ? hex : hex.slice(0, 7)) + "FF";
  const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
  const updated = colorTheme.map((e) =>
    e["css-variable-name"] === "bg-light" ? { ...e, color: newColor } : e,
  );
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: { ...presentation.slideset.master, "color-theme": updated },
    },
  };
};
