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
  resolveTextStyle,
  resolveEffectiveFormatting,
} from "../../core/text/textFormatting";
import { getListMarker } from "../../core/utils/listUtils";
import {
  getCaretOffset,
  setCaretOffset,
  restoreSelectionToDOM,
  getSelectionOffsets,
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


// --- Component ---

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
}) {
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const editableRef = useRef(null);
  const elementRef = useRef(null);
  const lastTypedHTMLRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const lastSyncedParagraphsRef = useRef(null);

  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderFormatting = getPlaceholderFormatting(presentation, slide, textElement);

  const effectiveParaFormatting = resolveEffectiveFormatting(masterFormatting, placeholderFormatting, formatting);
  // Toolbar shows run-level formatting for selected range; merges pendingFormatting when collapsed
  const hasSavedSel = savedSelectionRef.current !== null;
  const toolbarFormatting = hasSavedSel
    ? { ...effectiveParaFormatting, ...(getSelectionFormatting(textElement, savedSelectionRef.current) ?? {}) }
    : { ...effectiveParaFormatting, ...pendingFormatting };

  const listType =
    formatting["list-type"] && formatting["list-type"] !== "none"
      ? formatting["list-type"]
      : null;
  const listLevel = formatting["indent-level"] ?? 0;
  const listMarker = formatting["list-marker"] ?? "•";
  const listNumberedStyle = formatting["list-numbered-style"] ?? "decimal";
  const listIndent = listType ? `${(listLevel + 1) * 24}px` : "0px";

  // Save current selection offsets (called from onMouseUp / onKeyUp inside contentEditable).
  // Using these events (not selectionchange) avoids false triggers from toolbar clicks.
  const saveCurrentSelection = () => {
    const el = editableRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel?.rangeCount || sel.isCollapsed) {
      savedSelectionRef.current = null;
      onSaveSelection?.(textElement.id, null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer)) return;
    const offsets = getSelectionOffsets(el);
    savedSelectionRef.current = offsets;
    onSaveSelection?.(textElement.id, offsets);
  };

  const innerHTML = paragraphsToHTML(textElement.paragraphs);

  // Sync state → DOM. Skip only when the new HTML matches what the user just typed
  // (to avoid disrupting the cursor mid-typing). For external changes (formatting,
  // undo, master change) the new innerHTML differs, so we always update.
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (innerHTML === lastTypedHTMLRef.current) return; // change came from typing
    if (textElement.paragraphs === lastSyncedParagraphsRef.current) return; // paragraphs unchanged — don't disturb selection

    const wasFocused = document.activeElement === el;
    const savedCaret = wasFocused ? getCaretOffset(el) : 0;
    const savedSel = wasFocused ? savedSelectionRef.current : null;

    el.innerHTML = innerHTML;
    lastTypedHTMLRef.current = innerHTML;
    lastSyncedParagraphsRef.current = textElement.paragraphs;

    if (wasFocused) {
      if (savedSel) {
        // Restore the visual selection so it stays visible after formatting (like PowerPoint)
        restoreSelectionToDOM(el, textElement.paragraphs, savedSel);
      } else {
        setCaretOffset(el, savedCaret);
      }
    }
  }, [innerHTML]);

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


  // Sync live selection to parent before delegating — parent's applyFormatting reads
  // activeSelectionRef.current (a ref, updated synchronously) to decide run vs range formatting.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  const text = (textElement.paragraphs ?? []).map((p) => p.runs?.[0]?.text ?? "").join("\n");

  return (
    <div
      ref={elementRef}
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
          const span = document.createElement("span");
          const styles = buildPendingFormattingStyles(pendingFormatting);
          if (styles) span.setAttribute("style", styles);
          span.textContent = e.data;
          range.insertNode(span);
          const newRange = document.createRange();
          newRange.setStartAfter(span);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
          const el = editableRef.current;
          lastTypedHTMLRef.current = el.innerHTML;
          if (onChangeParagraphs) {
            onChangeParagraphs(textElement.id, domToParagraphs(el, textElement.paragraphs));
          } else {
            onChangeTextElement(textElement.id, el.innerText);
          }
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
          if (goingToToolbar) {
            // Keep savedSelectionRef only if there is an actual (non-collapsed) DOM selection.
            const domSel = window.getSelection();
            const hasRealSelection = domSel && !domSel.isCollapsed && domSel.rangeCount > 0;
            if (!hasRealSelection) {
              savedSelectionRef.current = null;
              onSaveSelection?.(textElement.id, null);
            }
            // Stay in editing mode — toolbar action should still use editing state
          } else {
            savedSelectionRef.current = null;
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
