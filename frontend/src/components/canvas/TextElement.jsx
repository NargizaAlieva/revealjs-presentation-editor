import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import FormatToolbar from "./FormatToolbar";
import "./TextElement.css";
import { getPlaceholderFormatting, getPlaceholderPadding } from "../../core/render/slidesetRenderUtils";
import {
  resolveWeight,
  paragraphsToHTML,
  buildPendingFormattingStyles,
  getSelectionFormatting,
  getFormattingAtCursor,
  resolveTextStyle,
  resolveEffectiveFormatting,
} from "../../core/text/textFormatting";
import { getListMarker, getListIndent } from "../../core/utils/listUtils";
import {
  getCaretOffset,
  setCaretOffset,
  restoreSelectionToDOM,
  getSelectionOffsets,
  getCollapsedCursorOffset,
  domToParagraphs,
} from "../../core/text/domSelectionManager";

const RESIZE_HANDLES = [
  { dir: "nw", cursor: "nwse-resize" },
  { dir: "n", cursor: "ns-resize" },
  { dir: "ne", cursor: "nesw-resize" },
  { dir: "e", cursor: "ew-resize" },
  { dir: "se", cursor: "nwse-resize" },
  { dir: "s", cursor: "ns-resize" },
  { dir: "sw", cursor: "nesw-resize" },
  { dir: "w", cursor: "ew-resize" },
];

const TOOLBAR_WIDTH = 590;

export default function TextElement({
  textElement,
  isSelected,
  isPrimarySelected = isSelected,
  onSelect,
  objectSelectionMode = false,
  onChangeTextElement,
  onChangeParagraphs,
  onSaveSelection,
  onFormatTextElement,
  onStartDrag,
  onStartResize,
  onStartRotate,
  slideHeight,
  onBeginHistory,
  onCommitHistory,
  onNewComment,
  previewClassName,
  animationOrder,
  presentation,
  slide,
  onStartEditing,
  onStopEditing,
  pendingFormatting = {},
  onClearPendingFormatting,
  formatPainterClipboard = null,
  onFormatPainterCopy,
  onFormatPainterPaste,
  onContextMenu,
  clearSelectionSignal = 0,
}) {
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [paragraphTops, setParagraphTops] = useState([]);
  const [editableOffsetTop, setEditableOffsetTop] = useState(0);
  const [savedSelState, setSavedSelState] = useState(null);
  const editableRef = useRef(null);
  const elementRef = useRef(null);
  const lastTypedHTMLRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const lastSyncedParagraphsRef = useRef(null);
  const selectionFrameRef = useRef(null);
  const isDeletingRef = useRef(false);
  const toolbarFormInputActiveRef = useRef(false);

useEffect(() => {
  if (clearSelectionSignal === 0) return;
  savedSelectionRef.current = null;
  setTimeout(() => {
    setSavedSelState(null);
    setIsToolbarOpen(false);
  }, 0);
}, [clearSelectionSignal]);

  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderFormatting = getPlaceholderFormatting(
    presentation,
    slide,
    textElement,
  );
  const placeholderPadding = getPlaceholderPadding(presentation, slide, textElement);

  const verticalAlign = formatting["vertical-align"]
    ?? placeholderFormatting["vertical-align"]
    ?? masterFormatting["vertical-align"]
    ?? "top";
  const justifyContent =
    verticalAlign === "middle" ? "center" :
    verticalAlign === "bottom" ? "flex-end" : "flex-start";

  const effectiveParaFormatting = resolveEffectiveFormatting(
    masterFormatting,
    placeholderFormatting,
    formatting,
  );
  // Popup toolbar formatting — 3 states matching computeCurrentFormatting:
  //   real selection → mixed/run formatting; collapsed cursor → run at cursor + pending; no sel → effective + pending
  // Use savedSelState (React state) so toolbar re-renders when cursor moves without typing.
  const savedSel = savedSelState;
  const isRealSelection =
    savedSel &&
    !(
      savedSel.paragraphIdx ===
        (savedSel.endParagraphIdx ?? savedSel.paragraphIdx) &&
      savedSel.rangeStart === savedSel.rangeEnd
    );
  const toolbarFormatting = savedSel
    ? isRealSelection
      ? {
          ...effectiveParaFormatting,
          ...(getSelectionFormatting(textElement, savedSel) ?? {}),
        }
      : {
          ...effectiveParaFormatting,
          ...getFormattingAtCursor(textElement, savedSel),
          ...pendingFormatting,
        }
    : { ...effectiveParaFormatting, ...pendingFormatting };

  // Per-paragraph list info so markers are scoped to each paragraph individually.
  const paragraphListInfos = (textElement.paragraphs ?? []).map((p) => {
    const pFmt = p.formatting ?? {};
    const firstRunFmt =
      (p.runs ?? []).find((run) => (run.text ?? "").length > 0)?.formatting ??
      p.runs?.[0]?.formatting ??
      {};
    const pListType =
      pFmt["list-type"] && pFmt["list-type"] !== "none"
        ? pFmt["list-type"]
        : null;
    return {
      listType: pListType,
      listLevel: pFmt["indent-level"] ?? 0,
      listMarker: pFmt["list-marker"] ?? "•",
      listNumberedStyle: pFmt["list-numbered-style"] ?? "decimal",
      markerStyle: {
        fontSize: resolveTextStyle(
          firstRunFmt.size,
          pFmt.size ?? placeholderFormatting.size,
          masterFormatting.size,
          "24px",
        ),
        lineHeight: resolveTextStyle(
          pFmt["line-spacing"],
          placeholderFormatting["line-spacing"],
          masterFormatting["line-spacing"],
          1.2,
        ),
        fontFamily: resolveTextStyle(
          firstRunFmt.font,
          pFmt.font ?? placeholderFormatting.font,
          masterFormatting.font,
          "inherit",
        ),
        fontWeight: resolveWeight(
          firstRunFmt.weight ?? pFmt.weight,
          placeholderFormatting.weight,
          masterFormatting.weight,
        ),
        color: resolveTextStyle(
          firstRunFmt.color,
          pFmt.color ?? placeholderFormatting.color,
          masterFormatting.color,
          "var(--text-dark, black)",
        ),
      },
    };
  });
  const anyListPara = paragraphListInfos.find((p) => p.listType) ?? null;
  const listType = anyListPara?.listType ?? null;

  // Save current selection offsets for formatting and selection restoration.
  const saveCurrentSelection = () => {
    const el = editableRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel?.rangeCount) {
      savedSelectionRef.current = null;
      setSavedSelState(null);
      onSaveSelection?.(textElement.id, null);
      return;
    }
    const offsets = sel.isCollapsed
      ? getCollapsedCursorOffset(el)
      : getSelectionOffsets(el);
    savedSelectionRef.current = offsets;
    setSavedSelState(offsets);
    onSaveSelection?.(textElement.id, offsets);
  };

  const innerHTML = paragraphsToHTML(textElement.paragraphs, masterFormatting, placeholderFormatting);

  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (innerHTML === lastTypedHTMLRef.current) return; 
    if (textElement.paragraphs === lastSyncedParagraphsRef.current) return;

    const wasFocused = document.activeElement === el;
    const savedCaret = wasFocused ? getCaretOffset(el) : 0;
    const savedSel = wasFocused ? savedSelectionRef.current : null;

    el.innerHTML = innerHTML;
    lastTypedHTMLRef.current = innerHTML;
    lastSyncedParagraphsRef.current = textElement.paragraphs;

    if (wasFocused) {
      if (savedSel) {
        restoreSelectionToDOM(el, textElement.paragraphs, savedSel);
      } else {
        setCaretOffset(el, savedCaret);
      }
    }
  }, [innerHTML, textElement.paragraphs]);

  useLayoutEffect(() => {
    const editable = editableRef.current;
    if (!editable) return undefined;

    const measureParagraphs = () => {
      const paragraphElements = Array.from(editable.children).filter(
        (child) => child.tagName === "DIV" || child.tagName === "P",
      );
      paragraphElements.forEach((paragraph, index) => {
        const info = paragraphListInfos[index];
        paragraph.style.paddingLeft = info?.listType
          ? `calc(${getListIndent(info.listLevel, info.listType)} + 1.2em)`
          : getListIndent(
              Math.max(0, (info?.listLevel ?? 0) - 1),
              info?.listLevel > 0 ? "indent" : null,
            );
      });
      const nextTops = paragraphElements.map(
        (paragraph) => paragraph.offsetTop,
      );
      setParagraphTops((current) =>
        current.length === nextTops.length &&
        current.every((top, index) => top === nextTops[index])
          ? current
          : nextTops,
      );
      setEditableOffsetTop(editable.offsetTop);
    };

    measureParagraphs();
    const observer = new ResizeObserver(measureParagraphs);
    observer.observe(editable);
    Array.from(editable.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [
    innerHTML,
    textElement.width,
    textElement.paragraphs,
    paragraphListInfos,
  ]);

  const overflowMode = textElement.overflow ?? "auto-fit";

  useLayoutEffect(() => {
    const editable = editableRef.current;
    if (!editable || !onAutoFit || overflowMode !== "auto-fit") return undefined;

    const fitToContent = () => {
      const currentHeight = textElement.height ?? 80;
      const contentHeight = Math.ceil(editable.scrollHeight + 2);
      if (contentHeight <= currentHeight + 1) {
        lastAutoFitHeightRef.current = null;
        return;
      }
      if (lastAutoFitHeightRef.current === contentHeight) return;

      lastAutoFitHeightRef.current = contentHeight;
      const currentY = textElement.position?.y ?? 0;
      const nextY =
        Number.isFinite(slideHeight) && currentY + contentHeight > slideHeight
          ? Math.max(0, slideHeight - contentHeight)
          : currentY;

      onAutoFit(textElement.id, {
        height: contentHeight,
        position: {
          ...(textElement.position ?? { x: 0, y: 0 }),
          y: nextY,
        },
      });
    };

    fitToContent();
    const observer = new ResizeObserver(fitToContent);
    observer.observe(editable);
    Array.from(editable.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [
    innerHTML,
    onAutoFit,
    overflowMode,
    slideHeight,
    textElement.height,
    textElement.id,
    textElement.paragraphs,
    textElement.position,
    textElement.overflow,
    textElement.width,
  ]);

  useLayoutEffect(() => {
    const editable = editableRef.current;
    if (!editable || overflowMode !== "shrink-on-overflow") return;
    const maxH = textElement.height ?? 80;
    const containerW = textElement.width ?? 300;

    editable.style.transform = "";
    editable.style.transformOrigin = "";
    editable.style.width = "";

    if (editable.scrollHeight <= maxH + 1) return;

    let lo = 0.3, hi = 1.0;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      editable.style.transform = `scale(${mid})`;
      editable.style.transformOrigin = "top left";
      editable.style.width = `${containerW / mid}px`;
      if (editable.scrollHeight * mid <= maxH + 1) lo = mid; else hi = mid;
    }
    editable.style.transform = `scale(${lo})`;
    editable.style.transformOrigin = "top left";
    editable.style.width = `${containerW / lo}px`;

    return () => {
      if (editable) {
        editable.style.transform = "";
        editable.style.transformOrigin = "";
        editable.style.width = "";
      }
    };
  }, [innerHTML, overflowMode, textElement.height, textElement.width]);

  const updateToolbarPosition = (anchorPoint = null) => {
    setTimeout(() => {
      const editableEl = editableRef.current;
      const wrapperEl = elementRef.current;
      const selection = window.getSelection();
      let rect = null;
      if (anchorPoint) {
        rect = {
          top: anchorPoint.y,
          bottom: anchorPoint.y,
          left: anchorPoint.x,
        };
      }
      if (editableEl && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!rect && editableEl.contains(range.startContainer)) {
          const r = range.getBoundingClientRect();
          if (r && !(r.top === 0 && r.left === 0)) rect = r;
        }
      }
      if (!rect && wrapperEl) rect = wrapperEl.getBoundingClientRect();
      if (!rect) return;
      const toolbarHeight = 80;
      const topAbove = rect.top - toolbarHeight - 8;
      const topBelow = rect.bottom + 8;
      const top = topAbove > 0 ? topAbove : topBelow;
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - TOOLBAR_WIDTH - 8),
      );
      setToolbarPos({ top, left });
    }, 0);
  };

  // Sync live selection to parent before delegating — parent's applyFormatting reads
  // activeSelectionRef.current (a ref, updated synchronously) to decide run vs range formatting.
  const handleFormat = (id, updates) => {
    const el = editableRef.current;
    const liveOffsets =
      el && document.activeElement === el ? getSelectionOffsets(el) : null;
    const offsets = liveOffsets ?? savedSelectionRef.current;
    if (offsets) {
      savedSelectionRef.current = offsets;
      onSaveSelection?.(id, offsets);
    }
    onFormatTextElement(id, updates);
  };

  const openToolbar = (anchorPoint = null) => {
    onSelect(textElement.id);
    setIsToolbarOpen(true);
    updateToolbarPosition(anchorPoint);
  };

  const syncSelectionToolbar = () => {
    const el = editableRef.current;
    if (!el) return;
    // If focus is inside the FormatToolbar (e.g. size input), don't close the toolbar
    const activeEl = document.activeElement;
    if (activeEl && activeEl.closest?.(".format-toolbar")) return;
    const selection = window.getSelection();
    const hasTextSelection =
      selection &&
      !selection.isCollapsed &&
      selection.rangeCount > 0 &&
      el.contains(selection.getRangeAt(0).startContainer) &&
      el.contains(selection.getRangeAt(0).endContainer);

    if (!hasTextSelection) {
      setIsToolbarOpen(false);
      return;
    }

    const offsets = getSelectionOffsets(el);
    if (!offsets) return;
    savedSelectionRef.current = offsets;
    setSavedSelState(offsets);
    onSaveSelection?.(textElement.id, offsets);
    openToolbar();
  };

  useEffect(() => {
    if (isPrimarySelected && isToolbarOpen) updateToolbarPosition();
  }, [isPrimarySelected, isToolbarOpen]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (selectionFrameRef.current)
        cancelAnimationFrame(selectionFrameRef.current);
      selectionFrameRef.current = requestAnimationFrame(() => {
        selectionFrameRef.current = null;
        syncSelectionToolbar();
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      if (selectionFrameRef.current)
        cancelAnimationFrame(selectionFrameRef.current);
    };
  });

  return (
    <div
      ref={elementRef}
      data-element-id={textElement.id}
      className={["draggable", isSelected ? "selected" : "", previewClassName]
        .filter(Boolean)
        .join(" ")}
      style={{
        left: `${textElement.position?.x ?? 0}px`,
        top: `${textElement.position?.y ?? 0}px`,
        width: `${textElement.width ?? 300}px`,
        minHeight: `${textElement.height ?? 80}px`,
        background: textElement.background ?? "transparent",
        zIndex: textElement["z-index"] ?? 1,
        transform: `rotate(${textElement.rotation ?? 0}deg)`,
        transformOrigin: "center center",
        display: "flex",
        flexDirection: "column",
        justifyContent,
        ...(placeholderPadding ? { padding: placeholderPadding } : {}),
      }}
      onMouseDown={(event) => {
        if (
          event.button === 0 &&
          (!isSelected ||
            objectSelectionMode ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey)
        ) {
          event.preventDefault();
        }
        onSelect(textElement.id, event);
      }}
    >
      {animationOrder != null && (
        <span className="animation-order-badge">{animationOrder}</span>
      )}

      {isPrimarySelected &&
        ["top", "right", "bottom", "left"].map((side) => (
          <div
            key={side}
            className={`drag-border drag-border-${side}`}
            onMouseDown={(event) => onStartDrag(event, textElement.id)}
          />
        ))}

      {isPrimarySelected &&
        isToolbarOpen &&
        createPortal(
          <FormatToolbar
            elementId={textElement.id}
            formatting={toolbarFormatting}
            onFormatTextElement={handleFormat}
            onNewComment={onNewComment}
            presentation={presentation}
            hasSelection={savedSelState !== null}
            formatPainterClipboard={formatPainterClipboard}
            onFormatPainterCopy={onFormatPainterCopy}
            onFormatPainterPaste={onFormatPainterPaste}
            onFormInputMouseDown={() => { toolbarFormInputActiveRef.current = true; }}
            style={{
              position: "fixed",
              top: toolbarPos.top,
              left: toolbarPos.left,
              zIndex: 9999,
            }}
          />,
          document.body,
        )}

      {anyListPara && (
        <div
          className="list-markers-overlay"
          style={{
            left: 0,
            top: editableOffsetTop,
            width: "100%",
            fontSize: resolveTextStyle(
              formatting.size,
              placeholderFormatting.size,
              masterFormatting.size,
              "24px",
            ),
            lineHeight: resolveTextStyle(
              formatting["line-spacing"],
              placeholderFormatting["line-spacing"],
              masterFormatting["line-spacing"],
              1.2,
            ),
            color: resolveTextStyle(
              formatting.color,
              placeholderFormatting.color,
              masterFormatting.color,
              "var(--text-dark, black)",
            ),
            fontFamily: resolveTextStyle(
              formatting.font,
              placeholderFormatting.font,
              masterFormatting.font,
              "inherit",
            ),
            fontWeight: resolveWeight(
              formatting.weight,
              placeholderFormatting.weight,
              masterFormatting.weight,
            ),
          }}
        >
          {(() => {
            let numberedCounter = 0;
            return paragraphListInfos.map((info, i) => {
              if (info.listType === "numbered") numberedCounter++;
              return (
                <span
                  key={i}
                  className="list-marker-line"
                  style={{
                    top: `${paragraphTops[i] ?? 0}px`,
                    width: `calc(${getListIndent(info.listLevel, info.listType)} + 1.2em)`,
                    ...info.markerStyle,
                  }}
                >
                  {info.listType
                    ? getListMarker(
                        info.listType === "numbered" ? numberedCounter - 1 : i,
                        info.listType,
                        info.listMarker,
                        info.listNumberedStyle,
                      )
                    : null}
                </span>
              );
            });
          })()}
        </div>
      )}

      <div
        ref={editableRef}
        contentEditable={isPrimarySelected && !objectSelectionMode}
        suppressContentEditableWarning
        spellCheck={false}
        className="text-editable"
        data-placeholder="Click to edit text"
        onFocus={() => {
          isDeletingRef.current = false;
          onStartEditing?.(textElement.id);
          savedSelectionRef.current = null;
          setSavedSelState(null);
        }}
        onMouseUp={() => {
          saveCurrentSelection();
          syncSelectionToolbar();
        }}
        onTouchEnd={() => {
          window.setTimeout(syncSelectionToolbar, 0);
        }}
        onContextMenu={(event) => {
          saveCurrentSelection();
          if (onContextMenu) {
            event.preventDefault();
            event.stopPropagation();
            setIsToolbarOpen(false);
            onContextMenu(event, textElement.id, "text");
          } else {
            openToolbar({ x: event.clientX, y: event.clientY });
          }
        }}
        onKeyUp={() => {
          saveCurrentSelection();
          syncSelectionToolbar();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsToolbarOpen(false);
            window.getSelection()?.removeAllRanges();
            return;
          }
          if (
            e.key.length === 1 ||
            e.key === "Backspace" ||
            e.key === "Delete" ||
            e.key === "Enter"
          ) {
            setIsToolbarOpen(false);
          }
          const isDeleteKey = e.key === "Backspace" || e.key === "Delete";
          if (isDeleteKey) {
            if (!isDeletingRef.current) {
              isDeletingRef.current = true;
              onBeginHistory?.();
            }
          } else if (e.key.length === 1 || e.key === "Enter") {
            if (isDeletingRef.current) {
              isDeletingRef.current = false;
              onCommitHistory?.();
            }
          }
          if (e.key !== "Tab") return;
          const el = editableRef.current;
          if (!el) return;
          const offset = getCollapsedCursorOffset(el);
          if (!offset) return;
          const para = textElement.paragraphs?.[offset.paragraphIdx];
          const paraFmt = para?.formatting ?? {};
          if (!paraFmt["list-type"] || paraFmt["list-type"] === "none") return;
          e.preventDefault();
          const currentLevel = paraFmt["indent-level"] ?? 0;
          const MAX_LIST_INDENT_LEVEL = 4;
          const newLevel = e.shiftKey
            ? Math.max(0, currentLevel - 1)
            : Math.min(MAX_LIST_INDENT_LEVEL, currentLevel + 1);
          if (newLevel === currentLevel) return;
          // Sync cursor to ref before formatting so applyFormatting targets the right paragraph.
          onSaveSelection?.(textElement.id, offset);
          onFormatTextElement?.(textElement.id, { "indent-level": newLevel });
        }}
        onBeforeInput={(e) => {
          if (!e.data || Object.keys(pendingFormatting).length === 0) return;
          e.preventDefault();
          const sel = window.getSelection();
          if (!sel || !sel.rangeCount) return;
          const range = sel.getRangeAt(0);
          range.deleteContents();

          const el = editableRef.current;
          let insertRange = range.cloneRange();
          const container = range.startContainer;
          const parentSpan =
            container.nodeType === Node.TEXT_NODE
              ? container.parentElement?.closest?.("span")
              : null;
          if (parentSpan && el?.contains(parentSpan) && parentSpan !== el) {
            const atEnd =
              range.startOffset === (container.textContent?.length ?? 0);
            const atStart = range.startOffset === 0;
            if (atEnd) {
              insertRange = document.createRange();
              insertRange.setStartAfter(parentSpan);
              insertRange.collapse(true);
            } else if (atStart) {
              insertRange = document.createRange();
              insertRange.setStartBefore(parentSpan);
              insertRange.collapse(true);
            }
          }

          const span = document.createElement("span");
          const styles = buildPendingFormattingStyles(pendingFormatting);
          if (styles) span.setAttribute("style", styles);
          span.textContent = e.data;
          insertRange.insertNode(span);
          const newRange = document.createRange();
          newRange.setStart(span.firstChild ?? span, span.textContent.length);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          if (onChangeParagraphs) {
            const newParagraphs = domToParagraphs(el, textElement.paragraphs);
            lastTypedHTMLRef.current = paragraphsToHTML(newParagraphs, masterFormatting, placeholderFormatting);
            onChangeParagraphs(textElement.id, newParagraphs);
          } else {
            onChangeTextElement(textElement.id, el.innerText);
          }
          saveCurrentSelection();
          onClearPendingFormatting?.();
        }}
        onInput={(event) => {
          setIsToolbarOpen(false);
          const el = event.currentTarget;
          if (el.innerHTML === "<br>" || el.innerHTML === "<br/>") {
            el.innerHTML = "";
          }
          const grouped = isDeletingRef.current;
          if (onChangeParagraphs) {
            const paragraphs = domToParagraphs(el, textElement.paragraphs);
            lastTypedHTMLRef.current = paragraphsToHTML(paragraphs, masterFormatting, placeholderFormatting);
            onChangeParagraphs(textElement.id, paragraphs, grouped);
          } else {
            onChangeTextElement(textElement.id, el.innerText, grouped);
          }
          updateToolbarPosition();
        }}
        onBlur={(e) => {
          const relatedTarget = e.relatedTarget;
          const goingToToolbar =
            toolbarFormInputActiveRef.current ||
            (relatedTarget &&
            (relatedTarget.closest?.(".format-toolbar") ||
              relatedTarget.closest?.(".toolbar") ||
              relatedTarget.closest?.(".toolbar-ribbon") ||
              relatedTarget.closest?.(".bg-palette-popup")));
          toolbarFormInputActiveRef.current = false;
          const domSel = window.getSelection();
          const hasRealSelection =
            domSel && !domSel.isCollapsed && domSel.rangeCount > 0;
          if (goingToToolbar) {
            if (!hasRealSelection) {
              const el = editableRef.current;
              const collapsed = el ? getCollapsedCursorOffset(el) : null;
              savedSelectionRef.current = collapsed;
              onSaveSelection?.(textElement.id, null);
              const tag = relatedTarget?.tagName;
              const isFormInput =
                tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA";
              if (collapsed && !isFormInput) {
                const savedParas = textElement.paragraphs;
                setTimeout(() => {
                  const editable = editableRef.current;
                  if (!editable) return;
                  editable.focus();
                  restoreSelectionToDOM(editable, savedParas, collapsed);
                }, 0);
              }
            }
          } else {
            savedSelectionRef.current = null;
            setSavedSelState(null);
            setIsToolbarOpen(false);
            onSaveSelection?.(textElement.id, null);
            isDeletingRef.current = false;
            onCommitHistory?.();
            onStopEditing?.(textElement.id);
          }
        }}
        style={{
          fontSize: resolveTextStyle(
            formatting.size,
            placeholderFormatting.size,
            masterFormatting.size,
            "24px",
          ),
          fontWeight: resolveTextStyle(
            formatting.weight,
            placeholderFormatting.weight,
            masterFormatting.weight,
            "normal",
          ),
          fontStyle: resolveTextStyle(
            formatting.italics,
            placeholderFormatting.italics,
            masterFormatting.italics,
            false,
          )
            ? "italic"
            : "normal",
          textDecoration: resolveTextStyle(
            formatting["text-decoration"],
            placeholderFormatting["text-decoration"],
            masterFormatting["text-decoration"],
            "none",
          ),
          textAlign: resolveTextStyle(
            formatting.align,
            placeholderFormatting.align,
            masterFormatting.align,
            "left",
          ),
          textAlignLast:
            resolveTextStyle(
              formatting.align,
              placeholderFormatting.align,
              masterFormatting.align,
              "left",
            ) === "justify"
              ? "left"
              : undefined,
          lineHeight: resolveTextStyle(
            formatting["line-spacing"],
            placeholderFormatting["line-spacing"],
            masterFormatting["line-spacing"],
            1.2,
          ),
          color: resolveTextStyle(
            formatting.color,
            placeholderFormatting.color,
            masterFormatting.color,
            "var(--text-dark, black)",
          ),
          fontFamily: resolveTextStyle(
            formatting.font,
            placeholderFormatting.font,
            masterFormatting.font,
            "inherit",
          ),
          position: "relative",
          wordBreak: "break-all",
          overflowWrap: "anywhere",
        }}
        data-list-type={listType ?? undefined}
        data-list-marker={
          anyListPara?.listType === "bullets"
            ? anyListPara.listMarker
            : undefined
        }
        data-list-numbered-style={
          anyListPara?.listType === "numbered"
            ? anyListPara.listNumberedStyle
            : undefined
        }
      />

      {isPrimarySelected &&
        RESIZE_HANDLES.map(({ dir, cursor }) => (
          <div
            key={dir}
            className={`resize-handle resize-handle-${dir}`}
            style={{ cursor }}
            onMouseDown={(event) => {
              event.stopPropagation();
              onStartResize(event, textElement.id, dir);
            }}
          />
        ))}

      {isPrimarySelected && (
        <button
          type="button"
          className="text-rotate-handle"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onStartRotate(event, textElement.id);
          }}
          aria-label="Rotate text element"
        />
      )}
    </div>
  );
}
