import { useState, useCallback } from "react";
import { findMatches, applyReplacement, batchReplaceAll } from "../core/text/findReplace";

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

    onReplaceText(
      match.slideIndex,
      match.elementId,
      match.paragraphIdx,
      match.runIdx,
      applyReplacement(run.text, match, replacement),
    );

    const lengthDiff = replacement.length - (match.end - match.start);
    const newMatches = matches
      .filter((_, i) => i !== currentMatch)
      .map((m) => {
        if (
          m.elementId === match.elementId &&
          m.paragraphIdx === match.paragraphIdx &&
          m.runIdx === match.runIdx &&
          m.start >= match.end
        ) {
          return { ...m, start: m.start + lengthDiff, end: m.end + lengthDiff };
        }
        return m;
      });

    const nextIdx = Math.min(currentMatch, Math.max(0, newMatches.length - 1));
    setMatches(newMatches);
    setCurrentMatch(nextIdx);
    if (newMatches.length > 0) onSlideChange(newMatches[nextIdx].slideIndex);
  }, [matches, currentMatch, slides, onReplaceText, onSlideChange]);

  const replaceAll = useCallback((replacement) => {
    batchReplaceAll(matches, slides, replacement).forEach(
      ({ slideIndex, elementId, paragraphIdx, runIdx, newText }) => {
        onReplaceText(slideIndex, elementId, paragraphIdx, runIdx, newText);
      },
    );
    setMatches([]);
    setCurrentMatch(0);
  }, [matches, slides, onReplaceText]);

  const activeMatch = matches[currentMatch] ?? null;

  return { isOpen, open, close, query, search, matches, currentMatch, next, prev, activeMatch, replace, replaceAll };
}
