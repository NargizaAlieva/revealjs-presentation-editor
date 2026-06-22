export const findMatches = (slides, query) => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results = [];

  slides.forEach((slide, slideIndex) => {
    (slide.contents?.text ?? []).forEach((el) => {
      el.paragraphs?.forEach((para, paragraphIdx) => {
        para.runs?.forEach((run, runIdx) => {
          const text = run.text ?? "";
          let start = 0;
          while (true) {
            const idx = text.toLowerCase().indexOf(q, start);
            if (idx === -1) break;
            results.push({ slideIndex, elementId: el.id, paragraphIdx, runIdx, start: idx, end: idx + query.length });
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
