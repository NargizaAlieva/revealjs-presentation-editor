import { useState } from "react";
import FormatToolbar from "./FormatToolbar";
import "./TextElement.css";

export default function TextElement({
  textElement,
  isSelected,
  onSelect,
  onChangeTextElement,
  onFormatTextElement,
  onStartDrag,
  onStartResize,
  onStartRotate,
}) {
  const [isFormatting, setIsFormatting] = useState(false);

  // Сбрасываем режим форматирования когда элемент теряет выделение
  if (!isSelected && isFormatting) setIsFormatting(false);

  const text = (textElement.paragraphs ?? [])
    .map((p) => p.runs?.[0]?.text ?? "")
    .join("\n");
  const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
  const isTitle = textElement["placeholder-id"]?.includes("title");

  return (
    <div
      className={isSelected ? "draggable selected" : "draggable"}
      style={{
        position: "absolute",
        left: `${textElement.position?.x ?? 0}px`,
        top: `${textElement.position?.y ?? 0}px`,
        width: `${textElement.width ?? 300}px`,
        height: `${textElement.height ?? 80}px`,
        background: textElement.background ?? "transparent",
        zIndex: textElement["z-index"] ?? 1,

        transform: `rotate(${textElement.rotation ?? 0}deg)`,
        transformOrigin: "center center",
      }}
      onMouseDown={() => onSelect(textElement.id)}
      onDoubleClick={() => setIsFormatting(true)}
    >
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
        />
      )}

      {isTitle ? (
        <input
          value={text}
          onChange={(event) =>
            onChangeTextElement(textElement.id, event.target.value)
          }
          style={{
            fontSize: formatting.size ?? "24px",
            fontWeight: formatting.weight ?? "normal",
            fontStyle: formatting.italics ? "italic" : "normal",
            textDecoration: formatting["text-decoration"] ?? "none",
            textAlign: formatting.align ?? "left",
            color: formatting.color ?? "var(--text-dark, black)",
            fontFamily: formatting.font ?? "inherit",
            backgroundColor: formatting.highlight ?? "transparent",
          }}
        />
      ) : (
        <textarea
          value={text}
          onChange={(event) =>
            onChangeTextElement(textElement.id, event.target.value)
          }
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
          }}
        />
      )}

      {isSelected && (
        <div
          className="text-resize-handle"
          onMouseDown={(event) => {
            event.stopPropagation();
            onStartResize(event, textElement.id);
          }}
        />
      )}
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
