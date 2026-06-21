import { getSlides, setSlides } from "../utils/presentationUtils";

const createParagraphId = () =>
  globalThis.crypto?.randomUUID
    ? `paragraph-${globalThis.crypto.randomUUID()}`
    : `paragraph-${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Keys that belong only to runs (character-level), not to paragraphs
const RUN_ONLY_KEYS = new Set(["super-sub-script"]);
// Keys that belong only to paragraphs, never to runs
const PARAGRAPH_ONLY_KEYS = new Set([
  "align", "vertical-align", "line-spacing", "list-type",
  "list-style", "indent-level", "margin",
]);
// Keys that can exist on both runs and paragraphs (run overrides paragraph)
const SHARED_KEYS = new Set(["weight", "italics", "text-decoration", "color", "size", "font", "highlight"]);

export const addTextElement = (presentation, slideIndex, textElement) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: [...(slide.contents?.text ?? []), textElement],
    },
  };

  return setSlides(presentation, slides);
};

export const updateTextElement = (
  presentation,
  slideIndex,
  textElementId,
  newText,
  userModified,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updatedTextElements = (slide.contents?.text ?? []).map(
    (textElement) => {
      if (textElement.id !== textElementId) return textElement;

      const lines = newText.split("\n");
      const existingParagraphs = textElement.paragraphs ?? [];
      const templateFormatting = existingParagraphs[0]?.formatting ?? {};
      const templateRunFormatting =
        existingParagraphs[0]?.runs?.[0]?.formatting ?? {};

      const updatedParagraphs = lines.map((line, i) => {
        const existing = existingParagraphs[i];
        return {
          id: existing?.id ?? createParagraphId(),
          formatting: existing?.formatting ?? { ...templateFormatting },
          bullets: existing?.bullets ?? "none",
          runs: [
            {
              formatting: existing?.runs?.[0]?.formatting ?? {
                ...templateRunFormatting,
              },
              "super-sub-script":
                existing?.runs?.[0]?.["super-sub-script"] ?? "normal",
              text: line,
              link: existing?.runs?.[0]?.link ?? null,
            },
          ],
        };
      });

      return {
        ...textElement,
        userModified: userModified ?? textElement.userModified,
        paragraphs: updatedParagraphs,
      };
    },
  );

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedTextElements },
  };

  return setSlides(presentation, slides);
};

export const updateTextFormatting = (
  presentation,
  slideIndex,
  textElementId,
  formattingUpdate,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const paragraphUpdate = Object.fromEntries(
    Object.entries(formattingUpdate).filter(([k]) => !RUN_ONLY_KEYS.has(k)),
  );

  const updatedTextElements = (slide.contents?.text ?? []).map(
    (textElement) => {
      if (textElement.id !== textElementId) return textElement;

      // Only run-specific keys (super-sub-script) go to runs
      const runUpdate = Object.fromEntries(
        Object.entries(formattingUpdate).filter(([k]) => RUN_ONLY_KEYS.has(k)),
      );

      // Keys being set at paragraph level that should be stripped from runs
      // so the paragraph-level value applies uniformly to the whole element.
      const sharedKeysBeingSet = Object.keys(paragraphUpdate).filter((k) => SHARED_KEYS.has(k));

      const updatedParagraphs = (textElement.paragraphs ?? []).map(
        (paragraph) => ({
          ...paragraph,
          formatting: { ...(paragraph.formatting ?? {}), ...paragraphUpdate },
          userSetKeys: [...new Set([...(paragraph.userSetKeys ?? []), ...Object.keys(paragraphUpdate)])],
          runs: (paragraph.runs ?? []).map((run) => {
            const runFmt = { ...(run.formatting ?? {}) };
            // Strip shared keys so paragraph-level formatting takes precedence
            for (const k of sharedKeysBeingSet) delete runFmt[k];
            if (Object.keys(runUpdate).length) Object.assign(runFmt, runUpdate);
            return { ...run, formatting: runFmt };
          }),
        }),
      );

      return { ...textElement, paragraphs: updatedParagraphs };
    },
  );

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedTextElements },
  };

  return setSlides(presentation, slides);
};

export const deleteTextElement = (presentation, slideIndex, elementId) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  slides[slideIndex] = {
    ...slide,
    contents: {
      ...slide.contents,
      text: (slide.contents?.text ?? []).filter((el) => el.id !== elementId),
    },
  };

  return setSlides(presentation, slides);
};

export const updateTextElementParagraphs = (
  presentation,
  slideIndex,
  elementId,
  paragraphs,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updatedText = (slide.contents?.text ?? []).map((el) => {
    if (el.id !== elementId) return el;
    return { ...el, paragraphs, userModified: true };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedText },
  };

  return setSlides(presentation, slides);
};

export const updateTextRangeFormatting = (
  presentation,
  slideIndex,
  elementId,
  startParagraphIdx,
  rangeStart,
  endParagraphIdx,
  rangeEnd,
  formatting,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  // Strip "mixed" sentinel values — they are UI-only and must never be stored in run data
  const cleanFormatting = Object.fromEntries(
    Object.entries(formatting).filter(([, v]) => v !== "mixed"),
  );
  if (Object.keys(cleanFormatting).length === 0) return presentation;

  const updatedText = (slide.contents?.text ?? []).map((el) => {
    if (el.id !== elementId) return el;

    const updatedParagraphs = el.paragraphs.map((para, pIdx) => {
      if (pIdx < startParagraphIdx || pIdx > endParagraphIdx) return para;

      const paraLen = para.runs.reduce((a, r) => a + r.text.length, 0);
      const pRangeStart = pIdx === startParagraphIdx ? rangeStart : 0;
      const pRangeEnd = pIdx === endParagraphIdx ? rangeEnd : paraLen;

      // Nothing to format in this paragraph
      if (pRangeStart >= pRangeEnd) return para;

      const newRuns = [];
      let charOffset = 0;

      for (const run of para.runs) {
        const runStart = charOffset;
        const runEnd = charOffset + run.text.length;

        if (runEnd <= pRangeStart || runStart >= pRangeEnd) {
          newRuns.push(run);
        } else {
          if (runStart < pRangeStart) {
            newRuns.push({ ...run, text: run.text.slice(0, pRangeStart - runStart) });
          }
          const selectedStart = Math.max(0, pRangeStart - runStart);
          const selectedEnd = Math.min(run.text.length, pRangeEnd - runStart);
          const selectedText = run.text.slice(selectedStart, selectedEnd);
          if (selectedText.length > 0) {
            newRuns.push({
              ...run,
              text: selectedText,
              formatting: { ...run.formatting, ...cleanFormatting },
            });
          }
          if (runEnd > pRangeEnd) {
            newRuns.push({ ...run, text: run.text.slice(pRangeEnd - runStart) });
          }
        }

        charOffset = runEnd;
      }

      return { ...para, runs: newRuns.length > 0 ? newRuns : para.runs };
    });

    return { ...el, paragraphs: updatedParagraphs };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedText },
  };

  return setSlides(presentation, slides);
};

export const updateRunLink = (
  presentation,
  slideIndex,
  elementId,
  paragraphIdx,
  rangeStart,
  rangeEnd,
  link,
) => {
  const slides = [...getSlides(presentation)];
  const slide = slides[slideIndex];
  if (!slide) return presentation;

  const updatedText = (slide.contents?.text ?? []).map((el) => {
    if (el.id !== elementId) return el;

    const updatedParagraphs = el.paragraphs.map((para, pIdx) => {
      if (pIdx !== paragraphIdx) return para;

      const newRuns = [];
      let charOffset = 0;

      for (const run of para.runs) {
        const runStart = charOffset;
        const runEnd = charOffset + run.text.length;

        if (runEnd <= rangeStart || runStart >= rangeEnd) {
          newRuns.push(run);
        } else {
          if (runStart < rangeStart) {
            newRuns.push({ ...run, text: run.text.slice(0, rangeStart - runStart) });
          }
          const selectedStart = Math.max(0, rangeStart - runStart);
          const selectedEnd = Math.min(run.text.length, rangeEnd - runStart);
          newRuns.push({
            ...run,
            text: run.text.slice(selectedStart, selectedEnd),
            link,
          });
          if (runEnd > rangeEnd) {
            newRuns.push({ ...run, text: run.text.slice(rangeEnd - runStart) });
          }
        }

        charOffset = runEnd;
      }

      return { ...para, runs: newRuns };
    });

    return { ...el, paragraphs: updatedParagraphs };
  });

  slides[slideIndex] = {
    ...slide,
    contents: { ...slide.contents, text: updatedText },
  };

  return setSlides(presentation, slides);
};
