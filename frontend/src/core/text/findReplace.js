// Pure text search and replace operations over the presentation data model.

// Find all occurrences of query across all slides → paragraphs → runs.
// Returns array of match descriptors with location and character offsets.
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

// Apply a single replacement at the given match offset within a run's text.
export const applyReplacement = (originalText, match, replacement) =>
  originalText.slice(0, match.start) + replacement + originalText.slice(match.end);

// Apply all replacements for a single element, processing in reverse order
// to avoid offset drift when replacement length differs from match length.
export const applyAllReplacements = (elementMatches, originalText, replacement) => {
  const sorted = [...elementMatches].sort((a, b) => b.start - a.start);
  let text = originalText;
  sorted.forEach((m) => {
    text = text.slice(0, m.start) + replacement + text.slice(m.end);
  });
  return text;
};

// Group all matches by element and compute the replacement text for each.
// Returns an array of { slideIndex, elementId, newText } ready for dispatch.
export const batchReplaceAll = (matches, slides, replacement) => {
  const byElement = new Map();
  matches.forEach((m) => {
    if (!byElement.has(m.elementId)) byElement.set(m.elementId, []);
    byElement.get(m.elementId).push(m);
  });

  const operations = [];
  byElement.forEach((elementMatches, elementId) => {
    const slide = slides[elementMatches[0].slideIndex];
    const el = (slide?.contents?.text ?? []).find((e) => e.id === elementId);
    if (!el) return;
    const originalText = el.paragraphs?.[elementMatches[0].paragraphIdx]?.runs?.[elementMatches[0].runIdx]?.text ?? "";
    operations.push({
      slideIndex: elementMatches[0].slideIndex,
      elementId,
      newText: applyAllReplacements(elementMatches, originalText, replacement),
    });
  });

  return operations;
};
