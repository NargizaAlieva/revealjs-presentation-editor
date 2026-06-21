// Pure formatting functions — no DOM dependency.

// Keys that apply at run level (character-level); all others are paragraph-level.
export const RUN_LEVEL_KEYS = new Set([
  "weight", "italics", "text-decoration", "color", "size", "font",
  "super-sub-script", "highlight",
]);

// Split a formatting update object into run-level and paragraph-level parts.
export const splitFormattingUpdates = (updates) => {
  const runUpdates = {};
  const paraUpdates = {};
  for (const [k, v] of Object.entries(updates)) {
    if (RUN_LEVEL_KEYS.has(k)) runUpdates[k] = v;
    else paraUpdates[k] = v;
  }
  return { runUpdates, paraUpdates };
};

// Return the effective formatting of the run that contains the cursor position.
// Falls back to the last run if cursor is at the end, or paragraph formatting if no runs.
export const getFormattingAtCursor = (textElement, selection) => {
  if (!selection) return {};
  const paragraphs = textElement?.paragraphs ?? [];
  const para = paragraphs[selection.paragraphIdx];
  if (!para) return {};
  const paraFmt = para.formatting ?? {};
  const runs = para.runs ?? [];

  // If cursor is at the very start of a non-first paragraph (i.e. just after Enter),
  // inherit the formatting of the last character of the previous paragraph.
  if (selection.rangeStart === 0 && selection.paragraphIdx > 0) {
    const prevPara = paragraphs[selection.paragraphIdx - 1];
    if (prevPara) {
      const prevRuns = prevPara.runs ?? [];
      const prevParaFmt = prevPara.formatting ?? {};
      if (prevRuns.length) {
        return { ...prevParaFmt, ...(prevRuns[prevRuns.length - 1].formatting ?? {}) };
      }
      return prevParaFmt;
    }
  }

  if (!runs.length) return paraFmt;
  // Look at the character to the LEFT of the cursor (PowerPoint behavior).
  const lookupPos = Math.max(0, selection.rangeStart - 1);
  let offset = 0;
  for (const run of runs) {
    const start = offset;
    const end = offset + run.text.length;
    if (lookupPos >= start && lookupPos < end) {
      return { ...paraFmt, ...(run.formatting ?? {}) };
    }
    offset = end;
  }
  return { ...paraFmt, ...(runs[runs.length - 1].formatting ?? {}) };
};

// Compute the effective formatting shown in the toolbar for the three editing states:
// State 1 (not editing): element-level paragraph formatting merged with master/placeholder
// State 2 (editing + real selection): run-level formatting of selected range ("mixed" when runs disagree)
// State 3 (editing + collapsed cursor): run formatting at cursor merged with pendingFormatting
export const computeCurrentFormatting = ({
  isEditing,
  activeSelection,
  selectedElementId,
  selectedTextEl,
  effectiveFormatting,
  pendingFormatting,
}) => {
  if (!isEditing) return effectiveFormatting;

  const sel = activeSelection;
  const hasRealSelection =
    sel && sel.elementId === selectedElementId &&
    !(sel.paragraphIdx === (sel.endParagraphIdx ?? sel.paragraphIdx) && sel.rangeStart === sel.rangeEnd);

  if (hasRealSelection) {
    const paragraphs = selectedTextEl?.paragraphs ?? [];
    const paraFmt = paragraphs[sel.paragraphIdx]?.formatting ?? {};
    const epIdx = sel.endParagraphIdx ?? sel.paragraphIdx;
    const overlapping = [];
    for (let pIdx = sel.paragraphIdx; pIdx <= epIdx; pIdx++) {
      const para = paragraphs[pIdx];
      if (!para) continue;
      const pStart = pIdx === sel.paragraphIdx ? sel.rangeStart : 0;
      const pEnd = pIdx === epIdx ? sel.rangeEnd : Infinity;
      let offset = 0;
      for (const run of para.runs ?? []) {
        const start = offset;
        const end = offset + run.text.length;
        if (end > pStart && start < pEnd) overlapping.push(run.formatting ?? {});
        offset = end;
      }
    }
    if (!overlapping.length) return paraFmt;
    const allKeys = new Set([...Object.keys(paraFmt), ...overlapping.flatMap((f) => Object.keys(f))]);
    const result = { ...paraFmt };
    for (const key of allKeys) {
      const vals = overlapping.map((f) => f[key] ?? paraFmt[key]);
      result[key] = vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
    }
    return result;
  }

  // State 3: collapsed cursor — show formatting of the run at cursor position
  if (sel && sel.elementId === selectedElementId && selectedTextEl) {
    const cursorFmt = getFormattingAtCursor(selectedTextEl, sel);
    return { ...effectiveFormatting, ...cursorFmt, ...pendingFormatting };
  }

  return { ...effectiveFormatting, ...pendingFormatting };
};

export const escapeHTML = (str) =>
  (str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Normalize bold value from boolean or string to valid CSS font-weight
export const resolveWeight = (elemValue, phValue, masterValue) => {
  const v = elemValue ?? phValue ?? masterValue;
  if (v === true || v === "bold") return "bold";
  if (v === false || v === "normal") return "normal";
  return v ?? "normal";
};

// Merge master → placeholder → paragraph formatting layers
export const resolveEffectiveFormatting = (masterFormatting = {}, placeholderFormatting = {}, paragraphFormatting = {}) => ({
  ...masterFormatting,
  ...placeholderFormatting,
  ...paragraphFormatting,
});

// Build inline CSS string for a single run's formatting
export const buildRunStyles = (runFormatting = {}) => {
  const styles = [];
  if (runFormatting.weight != null) {
    const w = runFormatting.weight === true ? "bold" : runFormatting.weight === false ? "normal" : runFormatting.weight;
    styles.push(`font-weight:${w}`);
  }
  if (runFormatting.italics != null)
    styles.push(`font-style:${runFormatting.italics === true || runFormatting.italics === "italic" ? "italic" : "normal"}`);
  if (runFormatting.color) styles.push(`color:${runFormatting.color}`);
  if (runFormatting.size) styles.push(`font-size:${runFormatting.size}`);
  if (runFormatting.font) styles.push(`font-family:${runFormatting.font}`);
  if (runFormatting["text-decoration"] && runFormatting["text-decoration"] !== "none")
    styles.push(`text-decoration:${runFormatting["text-decoration"]}`);
  if (runFormatting.highlight && runFormatting.highlight !== "transparent")
    styles.push(`background-color:${runFormatting.highlight}`);
  return styles.join(";");
};

// Render runs array to HTML string
export const runsToHTML = (runs) =>
  (runs ?? []).map((run) => {
    const styles = buildRunStyles(run.formatting ?? {});
    const text = escapeHTML(run.text ?? "");
    return styles ? `<span style="${styles}">${text}</span>` : text;
  }).join("");

// Render paragraphs array to HTML string
export const paragraphsToHTML = (paragraphs) =>
  (paragraphs ?? []).map((p) => runsToHTML(p.runs)).join("<br>");

// Build inline CSS string for pendingFormatting (used in onBeforeInput span)
export const buildPendingFormattingStyles = (pendingFormatting = {}) => {
  const styleMap = {
    weight: (v) => `font-weight:${v === true || v === "bold" ? "bold" : "normal"}`,
    italics: (v) => `font-style:${v === true || v === "italic" ? "italic" : "normal"}`,
    "text-decoration": (v) => `text-decoration:${v}`,
    color: (v) => `color:${v}`,
    size: (v) => `font-size:${v}`,
    font: (v) => `font-family:${v}`,
    highlight: (v) => `background-color:${v}`,
  };
  return Object.entries(pendingFormatting)
    .map(([k, v]) => styleMap[k]?.(v))
    .filter(Boolean)
    .join(";");
};

export const resolveTextStyle = (elemValue, placeholderValue, masterValue, fallback) =>
  elemValue ?? placeholderValue ?? masterValue ?? fallback;

export const extractPlainTextFromParagraphs = (paragraphs = [], separator = "\n") =>
  paragraphs
    .map((p) => (p.runs ?? []).map((r) => r.text ?? "").join(""))
    .join(separator);

// Compute formatting of the currently selected runs.
// Returns "mixed" for keys where selected runs disagree.
export const getSelectionFormatting = (textElement, selection) => {
  if (!selection) return null;
  const { paragraphIdx, rangeStart, endParagraphIdx, rangeEnd } = selection;
  const epIdx = endParagraphIdx ?? paragraphIdx;
  const paragraphs = textElement?.paragraphs ?? [];
  const paraFmt = paragraphs[paragraphIdx]?.formatting ?? {};

  const overlapping = [];
  for (let pIdx = paragraphIdx; pIdx <= epIdx; pIdx++) {
    const para = paragraphs[pIdx];
    if (!para) continue;
    const thisParaFmt = para.formatting ?? {};
    const pStart = pIdx === paragraphIdx ? rangeStart : 0;
    const pEnd = pIdx === epIdx ? rangeEnd : Infinity;
    let offset = 0;
    for (const run of para.runs ?? []) {
      const start = offset;
      const end = offset + run.text.length;
      if (end > pStart && start < pEnd) overlapping.push({ runFmt: run.formatting ?? {}, paraFmt: thisParaFmt });
      offset = end;
    }
  }
  if (!overlapping.length) return paraFmt;

  const allKeys = new Set([
    ...Object.keys(paraFmt),
    ...overlapping.flatMap(({ runFmt, paraFmt: pf }) => [...Object.keys(runFmt), ...Object.keys(pf)]),
  ]);
  const result = { ...paraFmt };
  for (const key of allKeys) {
    const vals = overlapping.map(({ runFmt, paraFmt: pf }) => runFmt[key] ?? pf[key]);
    result[key] = vals.every((v) => v === vals[0]) ? vals[0] : "mixed";
  }
  return result;
};
