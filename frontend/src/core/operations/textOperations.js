import { getSlides, setSlides } from "../../utils/presentationUtils";

const createParagraphId = () =>
  globalThis.crypto?.randomUUID
    ? `paragraph-${globalThis.crypto.randomUUID()}`
    : `paragraph-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const RUN_ONLY_KEYS = new Set(["super-sub-script"]);

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

      const updatedParagraphs = (textElement.paragraphs ?? []).map(
        (paragraph) => ({
          ...paragraph,
          formatting: { ...(paragraph.formatting ?? {}), ...paragraphUpdate },
          runs: (paragraph.runs ?? []).map((run) => ({
            ...run,
            formatting: { ...(run.formatting ?? {}), ...formattingUpdate },
          })),
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
  paragraphIdx,
  rangeStart,
  rangeEnd,
  formatting,
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
            formatting: { ...run.formatting, ...formatting },
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
