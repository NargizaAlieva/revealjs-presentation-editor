import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import FormatToolbar from "./FormatToolbar";
import "./TextElement.css";

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

// Конвертация числа в римские цифры
const toRoman = (n) => {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  let result = "";
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) {
      result += syms[i];
      n -= vals[i];
    }
  }
  return result;
};

// Маркер для конкретной строки
const getMarker = (index, listType, listMarker, listNumberedStyle) => {
  if (listType === "bulletы") return listMarker ?? "•";
  const n = index + 1;
  switch (listNumberedStyle) {
    case "lower-alpha":
      return `${String.fromCharCode(96 + n)}.`;
    case "upper-alpha":
      return `${String.fromCharCode(64 + n)}.`;
    case "lower-roman":
      return `${toRoman(n).toLowerCase()}.`;
    case "upper-roman":
      return `${toRoman(n)}.`;
    default:
      return `${n}.`;
  }
};

export default function TextElement({
  textElement,
  isSelected,
  onSelect,
  onChangeTextElement,
  onFormatTextElement,
  onStartDrag,
  onStartResize,
  onStartRotate,
  onBeginHistory,
  onCommitHistory,
  onNewComment,
  previewClassName,
  animationOrder,
  presentation,
}) {
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });
  const editableRef = useRef(null);
  const elementRef = useRef(null);

  const text = (textElement.paragraphs ?? [])
    .map((p) => p.runs?.[0]?.text ?? "")
    .join("\n");
  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const resolveStyle = (elemValue, masterValue, fallback) =>
    elemValue ?? masterValue ?? fallback;

  const listType =
    formatting["list-type"] && formatting["list-type"] !== "none"
      ? formatting["list-type"]
      : null;

  const listLevel = formatting["indent-level"] ?? 0;
  const listMarker = formatting["list-marker"] ?? "•";
  const listNumberedStyle = formatting["list-numbered-style"] ?? "decimal";
  const listIndent = listType ? `${(listLevel + 1) * 24}px` : "0px";

  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (document.activeElement === el) return;

    if (el.innerText !== text) el.innerText = text;
  }, [text, textElement.htmlContent]);

  // Позиционируем тулбар над элементом или над курсором (если есть выделение)
  const updateToolbarPosition = () => {
    setTimeout(() => {
      const editableEl = editableRef.current;
      const wrapperEl = elementRef.current;
      const selection = window.getSelection();

      let rect = null;

      // Пробуем взять позицию из выделения
      if (editableEl && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editableEl.contains(range.startContainer)) {
          const r = range.getBoundingClientRect();
          if (r && !(r.top === 0 && r.left === 0)) {
            rect = r;
          }
        }
      }

      // Фолбэк: позиция самого элемента
      if (!rect && wrapperEl) {
        rect = wrapperEl.getBoundingClientRect();
      }

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

  // Highlight только на выделение — через execCommand, не через formatting
  const handleHighlight = (color) => {
    const el = editableRef.current;
    if (!el) return;

    const sel = window.getSelection();
    const hasSelection =
      sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      el.contains(sel.getRangeAt(0).startContainer);

    if (!hasSelection) return; // ничего не выделено — ничего не делаем

    el.focus();
    // 'backColor' красит фон выделенного текста
    document.execCommand(
      "backColor",
      false,
      color === "transparent" ? "inherit" : color,
    );
    // Сохраняем HTML чтобы подсветка пережила ре-рендер
    onChangeTextElement(textElement.id, el.innerText);
  };

  // Обновляем позицию при выборе элемента
  useEffect(() => {
    if (isSelected) {
      updateToolbarPosition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

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

      {/* Тулбар показывается всегда когда элемент выбран */}
      {isSelected &&
        createPortal(
          <FormatToolbar
            elementId={textElement.id}
            formatting={formatting}
            onFormatTextElement={onFormatTextElement}
            onHighlight={handleHighlight}
            onNewComment={onNewComment}
            presentation={presentation}
            style={{
              position: "fixed",
              top: toolbarPos.top,
              left: toolbarPos.left,
              zIndex: 9999,
            }}
          />,
          document.body,
        )}

      {/* Маркеры списка — абсолютно позиционированный overlay слева от текста */}
      {listType && (
        <div
          className="list-markers-overlay"
          style={{
            left: 0,
            width: `calc(${listIndent} + 1.2em)`,
            fontSize: resolveStyle(formatting.size, masterFormatting.size, "24px"),
            lineHeight: resolveStyle(formatting["line-spacing"], masterFormatting["line-spacing"], 1.2),
            color: resolveStyle(formatting.color, masterFormatting.color, "var(--text-dark, black)"),
            fontFamily: resolveStyle(formatting.font, masterFormatting.font, "inherit"),
            fontWeight: resolveStyle(formatting.weight, masterFormatting.weight, "normal"),
          }}
        >
          {text.split("\n").map((_, i) => (
            <span key={i} className="list-marker-line">
              {getMarker(i, listType, listMarker, listNumberedStyle)}
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
        onFocus={() => onBeginHistory?.()}
        onInput={(event) => {
          const el = event.currentTarget;
          if (el.innerHTML === "<br>" || el.innerHTML === "<br/>") {
            el.innerHTML = "";
          }

          onChangeTextElement(textElement.id, el.innerText);
          updateToolbarPosition();
        }}
        onBlur={() => onCommitHistory?.()}
        style={{
          fontSize: resolveStyle(formatting.size, masterFormatting.size, "24px"),
          fontWeight: resolveStyle(formatting.weight, masterFormatting.weight, "normal"),
          fontStyle: resolveStyle(formatting.italics, masterFormatting.italics, false) ? "italic" : "normal",
          textDecoration: resolveStyle(formatting["text-decoration"], masterFormatting["text-decoration"], "none"),
          textAlign: resolveStyle(formatting.align, masterFormatting.align, "left"),
          textAlignLast: resolveStyle(formatting.align, masterFormatting.align, "left") === "justify" ? "left" : undefined,
          lineHeight: resolveStyle(formatting["line-spacing"], masterFormatting["line-spacing"], 1.2),
          color: resolveStyle(formatting.color, masterFormatting.color, "var(--text-dark, black)"),
          fontFamily: resolveStyle(formatting.font, masterFormatting.font, "inherit"),
          paddingLeft: listType ? `calc(${listIndent} + 1.2em)` : undefined,
          position: "relative",
        }}
        data-list-type={listType ?? undefined}
        data-indent-level={listType ? listLevel : undefined}
        data-list-marker={listType === "bulletы" ? listMarker : undefined}
        data-list-numbered-style={
          listType === "numbered" ? listNumberedStyle : undefined
        }
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