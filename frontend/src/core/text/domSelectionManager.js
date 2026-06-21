// DOM selection utilities — require browser environment (Range, Selection APIs).

// Parse a DOM element's inline style into a run formatting object
export const parseSpanStyle = (style) => {
  const f = {};
  // Store weight even when "normal" — needed so an explicit normal span correctly
  // overrides a bold ancestor when the spans are nested by onBeforeInput insertion.
  if (style.fontWeight)
    f.weight = (style.fontWeight === "400") ? "normal" : style.fontWeight;
  if (style.fontStyle === "italic") f.italics = true;
  if (style.color) f.color = style.color;
  if (style.fontSize) f.size = style.fontSize;
  // Browser normalises multi-word names: Times New Roman → "Times New Roman" (with quotes).
  // Strip surrounding CSS quotes so the stored value matches the SELECT option values.
  if (style.fontFamily) f.font = style.fontFamily.replace(/^["']|["']$/g, "").trim();
  if (style.textDecoration && style.textDecoration !== "none")
    f["text-decoration"] = style.textDecoration;
  if (style.backgroundColor && style.backgroundColor !== "transparent")
    f.highlight = style.backgroundColor;
  return f;
};

// Walk contentEditable DOM and convert it back to the paragraphs data model
export const domToParagraphs = (el, existingParagraphs) => {
  const paragraphs = [[]];

  const addText = (text, fmt) => {
    if (!text) return;
    const lastPara = paragraphs[paragraphs.length - 1];
    const last = lastPara[lastPara.length - 1];
    if (last && JSON.stringify(last.formatting) === JSON.stringify(fmt)) {
      last.text += text;
    } else {
      lastPara.push({ text, formatting: fmt, "super-sub-script": "normal", link: null });
    }
  };

  const walk = (node, fmt = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
      addText(node.textContent, fmt);
    } else if (node.nodeName === "BR") {
      paragraphs.push([]);
    } else if (node.nodeName === "SPAN") {
      const merged = { ...fmt, ...parseSpanStyle(node.style) };
      node.childNodes.forEach((c) => walk(c, merged));
    } else if (node.nodeName === "DIV" || node.nodeName === "P") {
      if (paragraphs[paragraphs.length - 1].length > 0) paragraphs.push([]);
      node.childNodes.forEach((c) => walk(c, fmt));
    } else {
      node.childNodes.forEach((c) => walk(c, fmt));
    }
  };

  el.childNodes.forEach((n) => walk(n));

  return paragraphs.map((runs, pIdx) => {
    const existing = (existingParagraphs ?? [])[pIdx] ?? {};
    return {
      id: existing.id ?? `p-${Date.now()}-${pIdx}`,
      formatting: existing.formatting ?? {},
      userSetKeys: existing.userSetKeys ?? [],
      bullets: existing.bullets ?? "none",
      runs: runs.length
        ? runs
        : [{ text: "", formatting: {}, "super-sub-script": "normal", link: null }],
    };
  });
};

// Get the caret position as a global character offset within contentEditable
export const getCaretOffset = (el) => {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return 0;
  const range = sel.getRangeAt(0);
  const pre = document.createRange();
  pre.selectNodeContents(el);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
};

// Find the text node and local offset for a given global character offset
export const getNodeAtOffset = (el, targetOffset) => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let chars = 0;
  let node;
  let last = null;
  while ((node = walker.nextNode())) {
    last = node;
    const len = node.textContent.length;
    if (chars + len >= targetOffset) return { node, offset: targetOffset - chars };
    chars += len;
  }
  return last ? { node: last, offset: last.textContent.length } : null;
};

// Move the caret to a global character offset
export const setCaretOffset = (el, offset) => {
  const pos = getNodeAtOffset(el, offset);
  if (!pos) return;
  const range = document.createRange();
  range.setStart(pos.node, pos.offset);
  range.collapse(true);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};

// Convert { paragraphIdx, charOffset } to global char offset across paragraphs
export const paragraphToGlobal = (paragraphs, pIdx, charOffset) => {
  let global = charOffset;
  for (let i = 0; i < pIdx; i++) {
    global += (paragraphs[i]?.runs ?? []).reduce((a, r) => a + r.text.length, 0);
  }
  return global;
};

// Restore a saved selection (paragraphIdx / rangeStart / endParagraphIdx / rangeEnd)
// back into the DOM after innerHTML re-render
export const restoreSelectionToDOM = (el, paragraphs, sel) => {
  if (!sel) return;
  const { paragraphIdx, rangeStart, endParagraphIdx, rangeEnd } = sel;
  const ep = endParagraphIdx ?? paragraphIdx;
  const startGlobal = paragraphToGlobal(paragraphs, paragraphIdx, rangeStart);
  const endGlobal = paragraphToGlobal(paragraphs, ep, rangeEnd);
  const startPos = getNodeAtOffset(el, startGlobal);
  const endPos = getNodeAtOffset(el, endGlobal);
  if (!startPos || !endPos) return;
  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  const domSel = window.getSelection();
  domSel?.removeAllRanges();
  domSel?.addRange(range);
};

// Get cursor position as { paragraphIdx, rangeStart, rangeEnd } for a collapsed selection.
// Returns null when selection is non-collapsed or outside the given element.
//
// Mirrors domToParagraphs paragraph-boundary logic:
//   - <br>       → always starts a new paragraph
//   - <div>/<p>  → starts a new paragraph only when the current one already has content
//                  (matches Chrome's behaviour of wrapping lines in <div> after Enter)
export const getCollapsedCursorOffset = (el) => {
  const sel = window.getSelection();
  if (!sel?.rangeCount || !sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return null;

  let paragraphIdx = 0;
  let rangeStart = 0;
  let found = false;
  let currentParaHasContent = false;

  // Count text/paragraph boundaries inside a node without checking for the cursor.
  const countContent = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      rangeStart += node.textContent.length;
      if (node.textContent.length > 0) currentParaHasContent = true;
    } else if (node.nodeName === "BR") {
      paragraphIdx++;
      rangeStart = 0;
      currentParaHasContent = false;
    } else if (node.nodeName === "DIV" || node.nodeName === "P") {
      if (currentParaHasContent) { paragraphIdx++; rangeStart = 0; currentParaHasContent = false; }
      node.childNodes.forEach(countContent);
    } else {
      node.childNodes.forEach(countContent);
    }
  };

  const walk = (node) => {
    if (found) return;

    // Block elements (DIV/P) create a paragraph boundary if current paragraph has content.
    // This increment must happen BEFORE we check whether this node is the startContainer,
    // so that a cursor at the start of a new <div> gets the correct paragraphIdx.
    const isBlock = node.nodeName === "DIV" || node.nodeName === "P";
    if (isBlock && currentParaHasContent) {
      paragraphIdx++;
      rangeStart = 0;
      currentParaHasContent = false;
    }

    if (node === range.startContainer) {
      if (node.nodeType === Node.TEXT_NODE) {
        rangeStart += range.startOffset;
      } else {
        // Element node: range.startOffset is a child-node index, not a char offset.
        // Count the content of the first <startOffset> children to get the char position.
        for (let i = 0; i < range.startOffset; i++) countContent(node.childNodes[i]);
      }
      found = true;
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      rangeStart += node.textContent.length;
      if (node.textContent.length > 0) currentParaHasContent = true;
    } else if (node.nodeName === "BR") {
      paragraphIdx++;
      rangeStart = 0;
      currentParaHasContent = false;
    } else {
      node.childNodes.forEach(walk);
    }
  };

  // Special case: cursor is directly inside the root element (startContainer === el).
  // range.startOffset is a child-node index, not a character offset.
  // Count content of the first <startOffset> children to get the correct position.
  if (el === range.startContainer) {
    for (let i = 0; i < range.startOffset; i++) countContent(el.childNodes[i]);
    return { paragraphIdx, rangeStart, rangeEnd: rangeStart };
  }

  el.childNodes.forEach(walk);

  // If walk completed without finding startContainer, return the accumulated position.
  // This handles edge cases where the cursor sits logically at the end of all content.
  return { paragraphIdx, rangeStart, rangeEnd: rangeStart };
};

// Get current DOM selection as { paragraphIdx, rangeStart, endParagraphIdx, rangeEnd }
// Returns null when selection is collapsed or outside the given element
export const getSelectionOffsets = (el) => {
  const sel = window.getSelection();
  if (!sel?.rangeCount || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return null;

  let paragraphIdx = 0;
  let rangeStart = 0;
  let startFound = false;

  const walkForStart = (node) => {
    if (startFound) return;
    if (node === range.startContainer) {
      rangeStart += range.startOffset;
      startFound = true;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      rangeStart += node.textContent.length;
    } else if (node.nodeName === "BR") {
      paragraphIdx++;
      rangeStart = 0;
    } else {
      node.childNodes.forEach(walkForStart);
    }
  };
  el.childNodes.forEach(walkForStart);

  let endParagraphIdx = 0;
  let rangeEnd = 0;
  let endFound = false;

  const walkForEnd = (node) => {
    if (endFound) return;
    if (node === range.endContainer) {
      rangeEnd += range.endOffset;
      endFound = true;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      rangeEnd += node.textContent.length;
    } else if (node.nodeName === "BR") {
      endParagraphIdx++;
      rangeEnd = 0;
    } else {
      node.childNodes.forEach(walkForEnd);
    }
  };
  el.childNodes.forEach(walkForEnd);

  return { paragraphIdx, rangeStart, endParagraphIdx, rangeEnd };
};
