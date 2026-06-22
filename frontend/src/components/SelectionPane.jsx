import {
  MdClose,
  MdExpandMore,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { getElementLabel } from "../core/operations/elementOperations";
import "./SelectionPane.css";

const getSelectionLabel = (element, index) => {
  const placeholder = element["placeholder-id"];
  const role = element.role;
  if (role === "title" || placeholder === "title") return `Title ${index + 1}`;
  if (role === "slide-number" || placeholder?.includes("slide-number")) {
    return `Slide Number Placeholder ${index + 1}`;
  }
  if (role === "footer" || placeholder?.includes("footer")) {
    return `Footer Placeholder ${index + 1}`;
  }
  if (element.paragraphs) {
    const text = getElementLabel(element);
    return text && text !== "Text" ? text : `Text Placeholder ${index + 1}`;
  }
  return `${element["media-type"] === "video" ? "Video" : "Graphic"} ${index + 1}`;
};

export default function SelectionPane({
  slide,
  selectedElementIds = [],
  onSelectElement,
  onClose,
  onSetVisibility,
  onMoveLayer,
}) {
  const elements = [
    ...(slide?.contents?.text ?? []),
    ...(slide?.contents?.media ?? []),
  ]
    .sort((a, b) => Number(b["z-index"] ?? 1) - Number(a["z-index"] ?? 1))
    .map((element, index) => ({
      ...element,
      selectionLabel: getSelectionLabel(element, index),
    }));

  const allIds = elements.map((element) => element.id);

  return (
    <aside className="selection-pane">
      <div className="selection-pane-header">
        <strong>Selection</strong>
        <div className="selection-pane-header-actions">
          <button title="Collapse pane">
            <MdExpandMore />
          </button>
          <button onClick={onClose} title="Close">
            <MdClose />
          </button>
        </div>
      </div>

      <div className="selection-pane-toolbar">
        <button onClick={() => onSetVisibility(allIds, false)}>Show All</button>
        <button onClick={() => onSetVisibility(allIds, true)}>Hide All</button>
        <span />
        <button
          className="selection-pane-arrow"
          disabled={selectedElementIds.length === 0}
          onClick={() => onMoveLayer(-1)}
          title="Move forward"
        >
          <MdKeyboardArrowUp />
        </button>
        <button
          className="selection-pane-arrow"
          disabled={selectedElementIds.length === 0}
          onClick={() => onMoveLayer(1)}
          title="Move backward"
        >
          <MdKeyboardArrowDown />
        </button>
      </div>

      <div className="selection-pane-list">
        {elements.length === 0 && (
          <span className="selection-pane-empty">No objects</span>
        )}
        {elements.map((element) => {
          const selected = selectedElementIds.includes(element.id);
          const hidden = element.hidden === true;
          return (
            <div
              key={element.id}
              className={`selection-pane-row ${selected ? "selected" : ""}`}
              onClick={(event) =>
                onSelectElement(element.id, {
                  toggle: event.ctrlKey || event.metaKey || event.shiftKey,
                })
              }
            >
              <span className="selection-pane-label">
                {element.selectionLabel}
              </span>
              <button
                className="selection-pane-eye"
                onClick={(event) => {
                  event.stopPropagation();
                  onSetVisibility([element.id], !hidden);
                }}
                title={hidden ? "Show object" : "Hide object"}
              >
                {hidden ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
