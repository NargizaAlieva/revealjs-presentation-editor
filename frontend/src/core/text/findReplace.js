const isWordCharacter = (character) =>
  character !== undefined && /[\p{L}\p{N}_]/u.test(character);

export const findMatches = (
  slides,
  query,
  { matchCase = false, wholeWords = false } = {},
) => {
  if (!query.trim()) return [];
  const q = matchCase ? query : query.toLowerCase();
  const results = [];

  slides.forEach((slide, slideIndex) => {
    (slide.contents?.text ?? []).forEach((el) => {
      el.paragraphs?.forEach((para, paragraphIdx) => {
        para.runs?.forEach((run, runIdx) => {
          const originalText = run.text ?? "";
          const text = matchCase ? originalText : originalText.toLowerCase();
          let start = 0;
          while (true) {
            const idx = text.indexOf(q, start);
            if (idx === -1) break;
            const end = idx + query.length;
            const isWholeWord =
              !isWordCharacter(originalText[idx - 1]) &&
              !isWordCharacter(originalText[end]);

            if (!wholeWords || isWholeWord) {
              results.push({
                slideIndex,
                elementId: el.id,
                paragraphIdx,
                runIdx,
                start: idx,
                end,
              });
            }
            start = idx + 1;
          }
        });
      });
    });
  });

  return results;
};

export const applyReplacement = (originalText, match, replacement) =>
  originalText.slice(0, match.start) + replacement + originalText.slice(match.end);

export const applyAllReplacements = (runMatches, originalText, replacement) => {
  const sorted = [...runMatches].sort((a, b) => b.start - a.start);
  let text = originalText;
  sorted.forEach((m) => {
    text = text.slice(0, m.start) + replacement + text.slice(m.end);
  });
  return text;
};

export const batchReplaceAll = (matches, slides, replacement) => {
  const byRun = new Map();
  matches.forEach((m) => {
    const key = `${m.elementId}::${m.paragraphIdx}::${m.runIdx}`;
    if (!byRun.has(key)) byRun.set(key, []);
    byRun.get(key).push(m);
  });

  const operations = [];
  byRun.forEach((runMatches) => {
    const { slideIndex, elementId, paragraphIdx, runIdx } = runMatches[0];
    const slide = slides[slideIndex];
    const el = (slide?.contents?.text ?? []).find((e) => e.id === elementId);
    if (!el) return;
    const originalText = el.paragraphs?.[paragraphIdx]?.runs?.[runIdx]?.text ?? "";
    operations.push({
      slideIndex,
      elementId,
      paragraphIdx,
      runIdx,
      newText: applyAllReplacements(runMatches, originalText, replacement),
    });
  });

  return operations;
};
