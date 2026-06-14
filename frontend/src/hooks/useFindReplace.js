import { useState, useCallback } from "react";

const findMatches = (slides, query) => {
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

export function useFindReplace(slides, onSlideChange, onReplaceText) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setMatches([]);
    setCurrentMatch(0);
  }, []);

  const search = useCallback((q) => {
    setQuery(q);
    const found = findMatches(slides, q);
    setMatches(found);
    setCurrentMatch(0);
    if (found.length > 0) onSlideChange(found[0].slideIndex);
  }, [slides, onSlideChange]);

  const next = useCallback(() => {
    if (!matches.length) return;
    const idx = (currentMatch + 1) % matches.length;
    setCurrentMatch(idx);
    onSlideChange(matches[idx].slideIndex);
  }, [matches, currentMatch, onSlideChange]);

  const prev = useCallback(() => {
    if (!matches.length) return;
    const idx = (currentMatch - 1 + matches.length) % matches.length;
    setCurrentMatch(idx);
    onSlideChange(matches[idx].slideIndex);
  }, [matches, currentMatch, onSlideChange]);

  const replace = useCallback((replacement) => {
    const match = matches[currentMatch];
    if (!match) return;

    const slide = slides[match.slideIndex];
    const el = (slide?.contents?.text ?? []).find((e) => e.id === match.elementId);
    if (!el) return;

    const run = el.paragraphs?.[match.paragraphIdx]?.runs?.[match.runIdx];
    if (!run) return;

    const newText = run.text.slice(0, match.start) + replacement + run.text.slice(match.end);
    onReplaceText(match.slideIndex, match.elementId, newText);

    const found = findMatches(slides, query);
    setMatches(found);
    setCurrentMatch(Math.min(currentMatch, Math.max(0, found.length - 1)));
  }, [matches, currentMatch, slides, query, onReplaceText]);

  const replaceAll = useCallback((replacement) => {
    const byElement = new Map();
    matches.forEach((m) => {
      if (!byElement.has(m.elementId)) byElement.set(m.elementId, []);
      byElement.get(m.elementId).push(m);
    });

    byElement.forEach((elementMatches, elementId) => {
      const slide = slides[elementMatches[0].slideIndex];
      const el = (slide?.contents?.text ?? []).find((e) => e.id === elementId);
      if (!el) return;

      const sorted = [...elementMatches].sort((a, b) => b.start - a.start);
      let text = el.paragraphs?.[sorted[0].paragraphIdx]?.runs?.[sorted[0].runIdx]?.text ?? "";
      sorted.forEach((m) => {
        text = text.slice(0, m.start) + replacement + text.slice(m.end);
      });
      onReplaceText(elementMatches[0].slideIndex, elementId, text);
    });

    setMatches([]);
    setCurrentMatch(0);
  }, [matches, slides, onReplaceText]);

  const activeMatch = matches[currentMatch] ?? null;

  return { isOpen, open, close, query, search, matches, currentMatch, next, prev, activeMatch, replace, replaceAll };
}