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

export { RESIZE_HANDLES };

export default function MediaElementHandles({
  mediaId,
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
            onStartResize(event, mediaId, dir);
          }}
        />
      ))}
      <button
        type="button"
        className="media-rotate-handle"
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onStartRotate(event, mediaId);
        }}
        aria-label="Rotate media element"
      />
    </>
  );
}
