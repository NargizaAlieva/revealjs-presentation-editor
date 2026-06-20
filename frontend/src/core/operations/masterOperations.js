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
  const changedKeys = Object.keys(formatting);

  const slides = (presentation.slideset?.slides ?? []).map((slide) => ({
    ...slide,
    contents: {
      ...slide.contents,
      text: (slide.contents?.text ?? []).map((el) => ({
        ...el,
        paragraphs: (el.paragraphs ?? []).map((p) => {
          const f = { ...(p.formatting ?? {}) };
          for (const key of changedKeys) {
            if (f[key] === undefined || f[key] === oldMaster[key]) {
              delete f[key];
            }
          }
          return { ...p, formatting: f };
        }),
      })),
    },
  }));

  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      slides,
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
