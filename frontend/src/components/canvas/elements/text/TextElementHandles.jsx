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

export function TextSelectionBorders({ elementId, onStartDrag }) {
  return ["top", "right", "bottom", "left"].map((side) => (
    <div
      key={side}
      className={`drag-border drag-border-${side}`}
      onMouseDown={(event) => onStartDrag(event, elementId)}
    />
  ));
}

export default function TextElementHandles({
  elementId,
  onStartResize,
  onStartRotate,
}) {
  return (
    <>
      {RESIZE_HANDLES.map(({ dir, cursor }) => (
        <div
          key={dir}
          className={`resize-handle resize-handle-${dir}`}
          style={{ cursor }}
          onMouseDown={(event) => {
            event.stopPropagation();
            onStartResize(event, elementId, dir);
          }}
        />
      ))}
      <button
        type="button"
        className="text-rotate-handle"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onStartRotate(event, elementId);
        }}
        aria-label="Rotate text element"
      />
    </>
  );
}
