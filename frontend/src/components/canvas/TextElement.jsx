import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import FormatToolbar from "./FormatToolbar";
import "./TextElement.css";
import { getPlaceholderFormatting } from "../../core/render/slidesetRenderUtils";
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

const TOOLBAR_WIDTH = 600;

export default function TextElement({
  textElement,
  isSelected,
  onSelect,
  onChangeTextElement,
  onChangeParagraphs,
  onSaveSelection,
  onFormatTextElement,
  onStartDrag,
  onStartResize,
  onStartRotate,
  onBeginHistory,
  onCommitHistory,
  onCancelHistory,
  onNewComment,
  previewClassName,
  activeParagraphIndex,
  activeEffect,
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
  clearSelectionSignal = 0,
}) {
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const [savedSelState, setSavedSelState] = useState(null);
  const editableRef = useRef(null);
  const elementRef = useRef(null);
  const lastTypedHTMLRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const lastSyncedParagraphsRef = useRef(null);

  useEffect(() => {
    if (clearSelectionSignal === 0) return;
    savedSelectionRef.current = null;
    setSavedSelState(null);
  }, [clearSelectionSignal]);

  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderFormatting = getPlaceholderFormatting(presentation, slide, textElement);

  const effectiveParaFormatting = resolveEffectiveFormatting(masterFormatting, placeholderFormatting, formatting);
  const savedSel = savedSelState;
  const isRealSelection = savedSel &&
    !(savedSel.paragraphIdx === (savedSel.endParagraphIdx ?? savedSel.paragraphIdx) && savedSel.rangeStart === savedSel.rangeEnd);
  const toolbarFormatting = savedSel
    ? isRealSelection
      ? { ...effectiveParaFormatting, ...(getSelectionFormatting(textElement, savedSel) ?? {}) }
      : { ...effectiveParaFormatting, ...getFormattingAtCursor(textElement, savedSel), ...pendingFormatting }
    : { ...effectiveParaFormatting, ...pendingFormatting };

  const listType =
    formatting["list-type"] && formatting["list-type"] !== "none"
      ? formatting["list-type"]
      : null;
  const listLevel = formatting["indent-level"] ?? 0;
  const listMarker = formatting["list-marker"] ?? "•";
  const listNumberedStyle = formatting["list-numbered-style"] ?? "decimal";
  const listIndent = getListIndent(listLevel, listType);

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

  const innerHTML = paragraphsToHTML(textElement.paragraphs);

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
  }, [innerHTML]);

  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;

    if (activeParagraphIndex == null) {
      el.querySelectorAll("[data-para]").forEach((s) => {
        [...s.classList].filter((c) => c.startsWith("play-")).forEach((c) => s.classList.remove(c));
        s.style.opacity = "";
      });
      return;
    }

    if (activeParagraphIndex === 0) {
      el.querySelectorAll("[data-para]").forEach((s) => {
        s.style.opacity = "0";
      });
    }

    const target = el.querySelector(`[data-para="${activeParagraphIndex}"]`);
    if (target) {
      target.style.opacity = "";
      target.classList.remove("play-effect", `play-${activeEffect}`);
      void target.offsetWidth; 
      target.classList.add("play-effect", `play-${activeEffect}`);
    }
  }, [activeParagraphIndex, activeEffect]);

  const updateToolbarPosition = () => {
    setTimeout(() => {
      const editableEl = editableRef.current;
      const wrapperEl = elementRef.current;
      const selection = window.getSelection();
      let rect = null;
      if (editableEl && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editableEl.contains(range.startContainer)) {
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
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - TOOLBAR_WIDTH - 8));
      setToolbarPos({ top, left });
    }, 0);
  };

  const handleFormat = (id, updates) => {
    const el = editableRef.current;
    const liveOffsets = (el && document.activeElement === el) ? getSelectionOffsets(el) : null;
    const offsets = liveOffsets ?? savedSelectionRef.current;
    if (offsets) {
      savedSelectionRef.current = offsets;
      onSaveSelection?.(id, offsets);
    }
    onFormatTextElement(id, updates);
  };

  useEffect(() => {
    if (isSelected) updateToolbarPosition();
  }, [isSelected]);

  const text = (textElement.paragraphs ?? []).map((p) => p.runs?.[0]?.text ?? "").join("\n");

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
      }}
      onMouseDown={() => onSelect(textElement.id)}
    >
      {animationOrder != null && (
        <span className="animation-order-badge">{animationOrder}</span>
      )}

      {isSelected &&
        ["top", "right", "bottom", "left"].map((side) => (
          <div
            key={side}
            className={`drag-border drag-border-${side}`}
            onMouseDown={(event) => onStartDrag(event, textElement.id)}
          />
        ))}

      {isSelected &&
        createPortal(
          <FormatToolbar
            elementId={textElement.id}
            formatting={toolbarFormatting}
            onFormatTextElement={handleFormat}
            onNewComment={onNewComment}
            presentation={presentation}
            hasSelection={savedSelectionRef.current !== null}
            formatPainterClipboard={formatPainterClipboard}
            onFormatPainterCopy={onFormatPainterCopy}
            onFormatPainterPaste={onFormatPainterPaste}
            style={{
              position: "fixed",
              top: toolbarPos.top,
              left: toolbarPos.left,
              zIndex: 9999,
            }}
          />,
          document.body,
        )}

      {listType && (
        <div
          className="list-markers-overlay"
          style={{
            left: 0,
            width: `calc(${listIndent} + 1.2em)`,
            fontSize: resolveTextStyle(formatting.size, placeholderFormatting.size, masterFormatting.size, "24px"),
            lineHeight: resolveTextStyle(formatting["line-spacing"], placeholderFormatting["line-spacing"], masterFormatting["line-spacing"], 1.2),
            color: resolveTextStyle(formatting.color, placeholderFormatting.color, masterFormatting.color, "var(--text-dark, black)"),
            fontFamily: resolveTextStyle(formatting.font, placeholderFormatting.font, masterFormatting.font, "inherit"),
            fontWeight: resolveWeight(formatting.weight, placeholderFormatting.weight, masterFormatting.weight),
          }}
        >
          {text.split("\n").map((_, i) => (
            <span key={i} className="list-marker-line">
              {getListMarker(i, listType, listMarker, listNumberedStyle)}
            </span>
          ))}
        </div>
      )}

      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        className="text-editable"
        data-placeholder="Click to edit text"
        onFocus={() => {
          onBeginHistory?.();
          onStartEditing?.(textElement.id);
          savedSelectionRef.current = null;
          setSavedSelState(null);
        }}
        onMouseUp={saveCurrentSelection}
        onKeyUp={saveCurrentSelection}
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
          const parentSpan = container.nodeType === Node.TEXT_NODE
            ? container.parentElement?.closest?.("span")
            : null;
          if (parentSpan && el?.contains(parentSpan) && parentSpan !== el) {
            const atEnd = range.startOffset === (container.textContent?.length ?? 0);
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
            lastTypedHTMLRef.current = paragraphsToHTML(newParagraphs);
            onChangeParagraphs(textElement.id, newParagraphs);
          } else {
            onChangeTextElement(textElement.id, el.innerText);
          }
          saveCurrentSelection();
          onClearPendingFormatting?.();
        }}
        onInput={(event) => {
          const el = event.currentTarget;
          if (el.innerHTML === "<br>" || el.innerHTML === "<br/>") {
            el.innerHTML = "";
          }
          if (onChangeParagraphs) {
            const paragraphs = domToParagraphs(el, textElement.paragraphs);
            lastTypedHTMLRef.current = paragraphsToHTML(paragraphs);
            onChangeParagraphs(textElement.id, paragraphs);
          } else {
            onChangeTextElement(textElement.id, el.innerText);
          }
          updateToolbarPosition();
        }}
        onBlur={(e) => {
          const relatedTarget = e.relatedTarget;
          const goingToToolbar =
            relatedTarget &&
            (relatedTarget.closest?.(".format-toolbar") ||
              relatedTarget.closest?.(".toolbar") ||
              relatedTarget.closest?.(".toolbar-ribbon") ||
              relatedTarget.closest?.(".bg-palette-popup"));
          const domSel = window.getSelection();
          const hasRealSelection = domSel && !domSel.isCollapsed && domSel.rangeCount > 0;
          if (goingToToolbar) {
            if (!hasRealSelection) {
              const el = editableRef.current;
              const collapsed = el ? getCollapsedCursorOffset(el) : null;
              savedSelectionRef.current = collapsed;
              onSaveSelection?.(textElement.id, null);
              const tag = relatedTarget?.tagName;
              const isFormInput = tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA";
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
            onSaveSelection?.(textElement.id, null);
            onCommitHistory?.();
            onStopEditing?.(textElement.id);
          }
        }}
        style={{
          fontSize: resolveTextStyle(formatting.size, placeholderFormatting.size, masterFormatting.size, "24px"),
          fontWeight: resolveTextStyle(formatting.weight, placeholderFormatting.weight, masterFormatting.weight, "normal"),
          fontStyle: resolveTextStyle(formatting.italics, placeholderFormatting.italics, masterFormatting.italics, false) ? "italic" : "normal",
          textDecoration: resolveTextStyle(formatting["text-decoration"], placeholderFormatting["text-decoration"], masterFormatting["text-decoration"], "none"),
          textAlign: resolveTextStyle(formatting.align, placeholderFormatting.align, masterFormatting.align, "left"),
          textAlignLast: resolveTextStyle(formatting.align, placeholderFormatting.align, masterFormatting.align, "left") === "justify" ? "left" : undefined,
          lineHeight: resolveTextStyle(formatting["line-spacing"], placeholderFormatting["line-spacing"], masterFormatting["line-spacing"], 1.2),
          color: resolveTextStyle(formatting.color, placeholderFormatting.color, masterFormatting.color, "var(--text-dark, black)"),
          fontFamily: resolveTextStyle(formatting.font, placeholderFormatting.font, masterFormatting.font, "inherit"),
          paddingLeft: listType ? `calc(${listIndent} + 1.2em)` : undefined,
          position: "relative",
        }}
        data-list-type={listType ?? undefined}
        data-indent-level={listType ? listLevel : undefined}
        data-list-marker={listType === "bullets" ? listMarker : undefined}
        data-list-numbered-style={listType === "numbered" ? listNumberedStyle : undefined}
      />

      {isSelected &&
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

      {isSelected && (
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