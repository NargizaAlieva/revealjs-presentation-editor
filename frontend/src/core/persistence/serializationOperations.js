import { validateSlideset } from "../model/slidesetValidation";
import { migrateParagraphFormatting } from "../render/slidesetRenderUtils";

// Collect all unique font names used across the presentation and populate slideset.fonts[]
const collectUsedFonts = (presentation) => {
  const fontNames = new Set();

  const scanFormatting = (fmt) => {
    if (fmt?.font) fontNames.add(fmt.font);
  };

  const slideset = presentation?.slideset;
  if (!slideset) return presentation;

  // master formatting
  scanFormatting(slideset.master?.formatting);

  // layout placeholder formatting
  for (const layout of slideset.layouts ?? []) {
    for (const ph of layout.placeholders ?? []) {
      scanFormatting(ph.formatting);
    }
  }

  // master elements
  for (const el of slideset.master?.elements?.text ?? []) {
    for (const para of el.paragraphs ?? []) {
      scanFormatting(para.formatting);
      for (const run of para.runs ?? []) scanFormatting(run.formatting);
    }
  }

  // slides text elements
  for (const slide of slideset.slides ?? []) {
    for (const el of slide.contents?.text ?? []) {
      for (const para of el.paragraphs ?? []) {
        scanFormatting(para.formatting);
        for (const run of para.runs ?? []) scanFormatting(run.formatting);
      }
    }
  }

  // Build fonts array: keep existing entries (preserve font-file paths), add new ones
  const existingFonts = slideset.fonts ?? [];
  const existingIds = new Set(existingFonts.map((f) => f["font-id"]));
  const merged = [
    ...existingFonts,
    ...[...fontNames]
      .filter((name) => !existingIds.has(name))
      .map((name) => ({ "font-id": name, "font-file": "" })),
  ].filter((f) => fontNames.has(f["font-id"])); // remove fonts no longer in use

  return {
    ...presentation,
    slideset: { ...slideset, fonts: merged },
  };
};

const INTERNAL_FIELDS = new Set(["userSetKeys", "userModified", "isPlaceholder"]);

const stripInternalFields = (obj) => {
  if (Array.isArray(obj)) return obj.map(stripInternalFields);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([k]) => !INTERNAL_FIELDS.has(k))
        .map(([k, v]) => [k, stripInternalFields(v)]),
    );
  }
  return obj;
};

const migratePresentation = (presentation) => {
  const layouts = presentation?.slideset?.layouts ?? [];
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderMap = new Map();
  for (const layout of layouts) {
    for (const ph of layout.placeholders ?? []) {
      placeholderMap.set(ph["placeholder-id"], ph.formatting ?? {});
    }
  }

  const slides = (presentation?.slideset?.slides ?? []).map((slide) => ({
    ...slide,
    contents: {
      ...slide.contents,
      text: (slide.contents?.text ?? []).map((el) => {
        const phFormatting = placeholderMap.get(el["placeholder-id"]) ?? {};
        return {
          ...el,
          paragraphs: migrateParagraphFormatting(el.paragraphs, phFormatting, masterFormatting),
        };
      }),
    },
  }));

  return { ...presentation, slideset: { ...presentation.slideset, slides } };
};

export const serializePresentation = (presentation) => {
  const withFonts = collectUsedFonts(presentation);
  return JSON.stringify(stripInternalFields(withFonts), null, 2);
};

export const deserializePresentation = (jsonString) => {
  try {
    const parsedPresentation = JSON.parse(jsonString);
    const validationErrors = validateSlideset(parsedPresentation);

    if (validationErrors.length > 0) {
      console.warn("[Serialization] Validation errors:", validationErrors);
      return { data: migratePresentation(parsedPresentation), errors: validationErrors };
    }

    return { data: migratePresentation(parsedPresentation), errors: [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Serialization] Failed to parse:", message);
    return { data: null, errors: [message] };
  }
};

export const downloadPresentationAsJson = (presentation) => {
  const json = serializePresentation(presentation);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const filename = presentation.slideset?.filename ?? "untitled-presentation";

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".json") ? filename : `${filename}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 0);
};