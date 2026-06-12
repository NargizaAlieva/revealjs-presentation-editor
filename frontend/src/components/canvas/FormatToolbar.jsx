import "./FormatToolbar.css";

export default function FormatToolbar({
  elementId,
  formatting,
  onFormatTextElement,
}) {
  return (
    <div className="format-toolbar">
      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onFormatTextElement(elementId, {
            weight: formatting.weight === "bold" ? "normal" : "bold",
          });
        }}
      >
        B
      </button>

      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onFormatTextElement(elementId, {
            italics: !formatting.italics,
          });
        }}
      >
        I
      </button>

      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onFormatTextElement(elementId, { align: "left" });
        }}
      >
        L
      </button>

      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onFormatTextElement(elementId, { align: "center" });
        }}
      >
        C
      </button>

      <button
        type="button"
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onFormatTextElement(elementId, { align: "right" });
        }}
      >
        R
      </button>

      <input
        type="number"
        min={8}
        max={96}
        value={parseInt(formatting.size ?? "24", 10)}
        onMouseDown={(event) => event.stopPropagation()}
        onChange={(event) =>
          onFormatTextElement(elementId, {
            size: `${event.target.value}px`,
          })
        }
      />

      <label className="line-spacing-control">
        LS
        <select
          value={formatting["line-spacing"] ?? 1.15}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) =>
            onFormatTextElement(elementId, {
              "line-spacing": Number(event.target.value),
            })
          }
        >
          <option value={1}>1.0</option>
          <option value={1.15}>1.15</option>
          <option value={1.5}>1.5</option>
          <option value={2}>2.0</option>
          <option value={2.5}>2.5</option>
          <option value={3}>3.0</option>
        </select>
      </label>
    </div>
  );
}
