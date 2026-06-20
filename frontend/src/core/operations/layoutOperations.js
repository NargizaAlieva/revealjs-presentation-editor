import { createId, getSlides, setSlides } from "../../utils/presentationUtils";

const getLayouts = (presentation) =>
  presentation?.slideset?.layouts ?? [];

const setLayouts = (presentation, layouts) => ({
  ...presentation,
  slideset: {
    ...presentation.slideset,
    layouts,
  },
});

const createTextFromPlaceholder = (placeholder, masterFormatting = {}) => ({
  id: createId("text"),
  "placeholder-id": placeholder["placeholder-id"],
  position: { ...placeholder.position },
  "pos-type": "relative-to-placeholder",
  width: placeholder.width,
  height: placeholder.height,
  rotation: 0,
  overflow: "shrink-on-overflow",
  "z-index": 1,
  background: placeholder.background ?? "#FFFFFF00",
  userModified: false,
  paragraphs: [
    {
      id: createId("paragraph"),
      formatting: { ...masterFormatting, ...(placeholder.formatting ?? {}) }, // ← merge
      bullets: "none",
      runs: [{ formatting: {}, "super-sub-script": "normal", text: "", link: null }],
    },
  ],
});

const createMediaFromPlaceholder = (placeholder) => ({
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
  crop: [],
  effects: {},
  playback: {},
});

const updateElementFromPlaceholder = (element, placeholders, isModified) => {
  const match = placeholders.find(
    (p) => p["placeholder-id"] === element["placeholder-id"],
  );

  if (!match) return element;
  if (isModified(element)) return element;

  const updated = {
    ...element,
    position: { ...match.position },
    width: match.width,
    height: match.height,
    rotation: match.rotation ?? element.rotation ?? 0,
    background: match.background ?? element.background,
  };

  if (element.paragraphs) {
    updated.paragraphs = element.paragraphs.map((p, pIdx) => ({
      ...p,
      ...(match.formatting ? { formatting: { ...(p.formatting ?? {}), ...match.formatting } } : {}),
      runs: p.runs.map((r, rIdx) =>
        pIdx === 0 && rIdx === 0 && match.promptText !== undefined
          ? { ...r, text: match.promptText }
          : r,
      ),
    }));
  }

  return updated;
};

// ─── Placeholder pseudo-elements (for editing layouts in Slide Master view) ───

const PLACEHOLDER_PROMPTS = {
  title: "Click to edit Master title style",
  body: "Click to edit Master text styles",
};

const placeholderPromptText = (placeholder) =>
  placeholder.promptText ?? PLACEHOLDER_PROMPTS[placeholder.role] ?? "Click to edit text styles";

export const createPlaceholderPseudoElement = (placeholder, masterFormatting = {}) => {
  if (placeholder.type === "image" || placeholder.type === "video") {
    return {
      id: placeholder["placeholder-id"],
      "placeholder-id": placeholder["placeholder-id"],
      "file-link": "",
      "media-type": placeholder.type === "video" ? "video" : "image",
      position: { ...placeholder.position },
      width: placeholder.width,
      height: placeholder.height,
      rotation: placeholder.rotation ?? 0,
      "z-index": 1,
      scale: 1,
      crop: [],
      effects: {},
      playback: {},
      isPlaceholder: true,
    };
  }

  return {
    id: placeholder["placeholder-id"],
    "placeholder-id": placeholder["placeholder-id"],
    position: { ...placeholder.position },
    "pos-type": "relative-to-placeholder",
    width: placeholder.width,
    height: placeholder.height,
    rotation: placeholder.rotation ?? 0,
    overflow: "shrink-on-overflow",
    "z-index": 1,
    background: placeholder.background ?? "#FFFFFF00",
    userModified: false,
    isPlaceholder: true,
    paragraphs: [
      {
        id: createId("paragraph"),
        formatting: { ...masterFormatting, ...(placeholder.formatting ?? {}) },
        bullets: "none",
        runs: [{
          formatting: {},
          "super-sub-script": "normal",
          text: placeholderPromptText(placeholder),
          link: null,
        }],
      },
    ],
  };
};

export const deleteLayout = (presentation, layoutId) => {
  const layouts = getLayouts(presentation).filter((l) => l["layout-id"] !== layoutId);
  const slides = getSlides(presentation).map((slide) =>
    slide["layout-id"] === layoutId ? { ...slide, "layout-id": layouts[0]?.["layout-id"] ?? null } : slide,
  );
  return setLayouts(setSlides(presentation, slides), layouts);
};

export const renameLayout = (presentation, layoutId, name) => {
  const layouts = getLayouts(presentation);
  const updatedLayouts = layouts.map((l) =>
    l["layout-id"] === layoutId ? { ...l, name } : l,
  );
  return setLayouts(presentation, updatedLayouts);
};

// Add a fixed element (text or media) to a layout — appears read-only on all
// slides that use this layout, similar to how master elements propagate.
export const addLayoutElement = (presentation, layoutId, elementType, element) => {
  const layouts = getLayouts(presentation);
  const updatedLayouts = layouts.map((l) => {
    if (l["layout-id"] !== layoutId) return l;
    const elements = l.elements ?? {};
    const arr = elements[elementType] ?? [];
    return { ...l, elements: { ...elements, [elementType]: [...arr, element] } };
  });
  return setLayouts(presentation, updatedLayouts);
};

// Update the text content (string) of a layout text element — mirrors updateMasterTextContent.
export const updateLayoutElementTextContent = (presentation, layoutId, elementId, text) => {
  const layouts = getLayouts(presentation);
  const updatedLayouts = layouts.map((l) => {
    if (l["layout-id"] !== layoutId) return l;
    const elements = l.elements ?? {};
    const arr = (elements.text ?? []).map((el) => {
      if (el.id !== elementId) return el;
      return {
        ...el,
        paragraphs: (el.paragraphs ?? []).map((paragraph, pIdx) => ({
          ...paragraph,
          runs: (paragraph.runs ?? []).map((run, rIdx) => ({
            ...run,
            text: pIdx === 0 && rIdx === 0 ? text : run.text,
          })),
        })),
      };
    });
    return { ...l, elements: { ...elements, text: arr } };
  });
  return setLayouts(presentation, updatedLayouts);
};

// Update a fixed layout element (position, size, formatting, etc.)
export const updateLayoutElement = (presentation, layoutId, elementType, elementId, updates) => {
  const layouts = getLayouts(presentation);
  const updatedLayouts = layouts.map((l) => {
    if (l["layout-id"] !== layoutId) return l;
    const elements = l.elements ?? {};
    const arr = (elements[elementType] ?? []).map((el) =>
      el.id === elementId ? { ...el, ...updates } : el,
    );
    return { ...l, elements: { ...elements, [elementType]: arr } };
  });
  return setLayouts(presentation, updatedLayouts);
};

// Delete a fixed layout element.
export const deleteLayoutElement = (presentation, layoutId, elementType, elementId) => {
  const layouts = getLayouts(presentation);
  const updatedLayouts = layouts.map((l) => {
    if (l["layout-id"] !== layoutId) return l;
    const elements = l.elements ?? {};
    const arr = (elements[elementType] ?? []).filter((el) => el.id !== elementId);
    return { ...l, elements: { ...elements, [elementType]: arr } };
  });
  return setLayouts(presentation, updatedLayouts);
};

// Add a new placeholder to a layout and create matching empty elements
// on every slide that uses this layout.
export const removeLayoutPlaceholder = (presentation, layoutId, placeholderId) => {
  const layout = getLayouts(presentation).find((l) => l["layout-id"] === layoutId);
  if (!layout) return presentation;
  const updatedPlaceholders = (layout.placeholders ?? []).filter(
    (p) => p["placeholder-id"] !== placeholderId,
  );
  return propagateLayoutChanges(presentation, layoutId, updatedPlaceholders);
};

export const addLayoutPlaceholder = (presentation, layoutId, placeholder) => {
  const layout = getLayouts(presentation).find((l) => l["layout-id"] === layoutId);
  if (!layout) return presentation;
  const updatedPlaceholders = [...(layout.placeholders ?? []), placeholder];
  return propagateLayoutChanges(presentation, layoutId, updatedPlaceholders);
};

// Update a single placeholder's geometry/formatting on a layout and
// propagate the change to every slide that uses this layout.
export const updateLayoutPlaceholder = (presentation, layoutId, placeholderId, updates) => {
  const layout = getLayouts(presentation).find((l) => l["layout-id"] === layoutId);
  if (!layout) return presentation;

  const { formatting: formattingUpdates, ...rest } = updates;

  const updatedPlaceholders = (layout.placeholders ?? []).map((p) => {
    if (p["placeholder-id"] !== placeholderId) return p;
    return {
      ...p,
      ...rest,
      ...(formattingUpdates
        ? { formatting: { ...(p.formatting ?? {}), ...formattingUpdates } }
        : {}),
    };
  });

  return propagateLayoutChanges(presentation, layoutId, updatedPlaceholders);
};

const isTextModified = (el) => el.userModified === true;

const isMediaModified = (el) =>
  !!el["file-link"] && el["file-link"] !== "";

export const applyLayoutToSlide = (presentation, slideIndex, layoutId) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  const masterFormatting = presentation.slideset?.master?.formatting ?? {};
  const layout = getLayouts(presentation).find(
    (l) => l["layout-id"] === layoutId,
  );

  if (!layout || !slide) return presentation;

  const placeholders = layout.placeholders ?? [];
  const placeholderMap = new Map(
    placeholders.map((p) => [p["placeholder-id"], p])
  );

  const processElement = (el, isModified) => {
    const pid = el["placeholder-id"];
    const match = pid ? placeholderMap.get(pid) : null;
    if (match) {
      return { updated: { ...el, position: { ...match.position }, width: match.width, height: match.height, rotation: match.rotation ?? el.rotation ?? 0, background: match.background ?? el.background } };
    }
    if (!pid || isModified(el)) return { kept: el };
    return { remove: true };
  };

  const processedText = [];
  for (const el of (slide.contents?.text ?? [])) {
    const r = processElement(el, isTextModified);
    if (r.updated) processedText.push(r.updated);
    else if (r.kept) processedText.push(r.kept);
  }

  const processedMedia = [];
  for (const el of (slide.contents?.media ?? [])) {
    const r = processElement(el, isMediaModified);
    if (r.updated) processedMedia.push(r.updated);
    else if (r.kept) processedMedia.push(r.kept);
  }

  const handledPids = new Set([
    ...processedText.map((el) => el["placeholder-id"]).filter(Boolean),
    ...processedMedia.map((el) => el["placeholder-id"]).filter(Boolean),
  ]);

  const newText = [];
  const newMedia = [];

  for (const placeholder of placeholders) {
    const pid = placeholder["placeholder-id"];
    if (!pid || handledPids.has(pid)) continue;
    if (placeholder.type === "text") newText.push(createTextFromPlaceholder(placeholder, masterFormatting));
    else if (placeholder.type === "image" || placeholder.type === "video") newMedia.push(createMediaFromPlaceholder(placeholder));
  }

  slides[slideIndex] = {
    ...slide,
    "layout-id": layoutId,
    contents: {
      ...slide.contents,
      text: [...processedText, ...newText],
      media: [...processedMedia, ...newMedia],
    },
  };

  return setSlides(presentation, slides);
};

export const propagateLayoutChanges = (
  presentation,
  layoutId,
  updatedPlaceholders,
) => {
  const slides = getSlides(presentation).map((slide) => {
    if (slide["layout-id"] !== layoutId) return slide;

    const masterFormatting = presentation.slideset?.master?.formatting ?? {}; // ← keep here only

   const updatedText = (slide.contents?.text ?? []).map((el) =>
      updateElementFromPlaceholder(el, updatedPlaceholders, isTextModified),
    );
    const updatedMedia = (slide.contents?.media ?? []).map((el) =>
      updateElementFromPlaceholder(el, updatedPlaceholders, isMediaModified),
    );

    const handledPids = new Set([
      ...updatedText.map((el) => el["placeholder-id"]).filter(Boolean),
      ...updatedMedia.map((el) => el["placeholder-id"]).filter(Boolean),
    ]);

    const newText = [];
    const newMedia = [];

    for (const placeholder of updatedPlaceholders) {
      const pid = placeholder["placeholder-id"];
      if (!pid || handledPids.has(pid)) continue;
      if (placeholder.type === "text") {
        newText.push(createTextFromPlaceholder(placeholder, masterFormatting));
      } else if (placeholder.type === "image" || placeholder.type === "video") {
        newMedia.push(createMediaFromPlaceholder(placeholder));
      }
    }

    return {
      ...slide,
      contents: {
        ...slide.contents,
        text: [...updatedText, ...newText],
        media: [...updatedMedia, ...newMedia],
      },
    };
  });

  const updatedLayouts = getLayouts(presentation).map((layout) =>
    layout["layout-id"] === layoutId
      ? { ...layout, placeholders: updatedPlaceholders }
      : layout,
  );

  return setLayouts(setSlides(presentation, slides), updatedLayouts);
};

export const resetSlideToLayout = (presentation, slideIndex) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const masterFormatting = presentation.slideset?.master?.formatting ?? {};
  const layout = getLayouts(presentation).find(
    (l) => l["layout-id"] === slide["layout-id"],
  );
  if (!layout) return presentation;

  const placeholders = layout.placeholders ?? [];
  const placeholderMap = new Map(
    placeholders.map((p) => [p["placeholder-id"], p])
  );

  const resetText = (slide.contents?.text ?? []).map((el) => {
      const pid = el["placeholder-id"];
      const match = pid ? placeholderMap.get(pid) : null;

      if (!match) return el;
      return {
        ...el,
        position: { ...match.position },
        width: match.width,
        height: match.height,
        background: match.background ?? el.background,
        rotation: 0,
        userModified: false,
      };
    });

    const resetMedia = (slide.contents?.media ?? []).map((el) => {
      const pid = el["placeholder-id"];
      const match = pid ? placeholderMap.get(pid) : null;

      if (!match) return el;
      return {
        ...el,
        position: { ...match.position },
        width: match.width,
        height: match.height,
        rotation: 0,
      };
    });

  const handledPids = new Set([
    ...resetText.map((el) => el["placeholder-id"]).filter(Boolean),
    ...resetMedia.map((el) => el["placeholder-id"]).filter(Boolean),
  ]);

  const newText = [];
  const newMedia = [];

  for (const placeholder of placeholders) {
    const pid = placeholder["placeholder-id"];
    if (!pid || handledPids.has(pid)) continue;
    if (placeholder.type === "text") newText.push(createTextFromPlaceholder(placeholder, masterFormatting));
    else if (placeholder.type === "image" || placeholder.type === "video") newMedia.push(createMediaFromPlaceholder(placeholder));
  }

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: [...resetText, ...newText],
      media: [...resetMedia, ...newMedia],
    },
  };

  return setSlides(presentation, slides);
};