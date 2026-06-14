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
            results.push({
              slideIndex,
              elementId: el.id,
              paragraphIdx,
              runIdx,
              start: idx,
              end: idx + query.length,
            });
            start = idx + 1;
          }
        });
      });
    });
  });

  return results;
};

export function useFindReplace(slides, onSlideChange) {
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

  const activeMatch = matches[currentMatch] ?? null;

  return { isOpen, open, close, query, search, matches, currentMatch, next, prev, activeMatch };
}