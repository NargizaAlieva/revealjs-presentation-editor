import { useState, useRef, useEffect } from "react";
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
  previewClassName,
  animationOrder,
  presentation,
}) {
  const [isFormatting, setIsFormatting] = useState(false);
  const editableRef = useRef(null);

  if (!isSelected && isFormatting) setIsFormatting(false);

  const text = (textElement.paragraphs ?? [])
    .map((p) => p.runs?.[0]?.text ?? "")
    .join("\n");
  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};

  const listType = (formatting["list-type"] && formatting["list-type"] !== "none")
  ? formatting["list-type"]
  : null;
  const listLevel = formatting["list-level"] ?? 0;
  const listMarker = formatting["list-marker"] ?? "•";
  const listNumberedStyle = formatting["list-numbered-style"] ?? "decimal";
  const listIndent = listType ? `${(listLevel + 1) * 24}px` : "0px";

  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerText !== text) {
      el.innerText = text;
    }
  }, [text]);

  return (
    <div
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
      onDoubleClick={() => setIsFormatting(true)}
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

      {isSelected && isFormatting && (
        <FormatToolbar
          elementId={textElement.id}
          formatting={formatting}
          onFormatTextElement={onFormatTextElement}
          presentation={presentation}
        />
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
          onChangeTextElement(textElement.id, event.currentTarget.innerText)
        }}
        onBlur={() => onCommitHistory?.()}
        style={{
          fontSize: formatting.size ?? "24px",
          fontWeight: formatting.weight ?? "normal",
          fontStyle: formatting.italics ? "italic" : "normal",
          textDecoration: formatting["text-decoration"] ?? "none",
          textAlign: formatting.align ?? "left",
          lineHeight: formatting["line-spacing"] ?? 1.2,
          color: formatting.color ?? "var(--text-dark, black)",
          fontFamily: formatting.font ?? "inherit",
          backgroundColor: formatting.highlight ?? "transparent",
          paddingLeft: listType ? `calc(${listIndent} + 1.2em)` : undefined,
          position: "relative",
        }}
        data-list-type={listType ?? undefined}
        data-list-level={listType ? listLevel : undefined}
        data-list-marker={listType === "bullet" ? listMarker : undefined}
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
