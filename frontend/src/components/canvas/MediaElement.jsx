import "./MediaElement.css";

export default function MediaElement({
  media,
  isSelected,
  onSelect,
  onStartDrag,
  onDeleteMedia,
  onStartResize,
  onStartRotate,
  previewClassName,
  animationOrder,
}) {
  return (
    <div
      className={[
        "canvas-media-wrapper",
        isSelected ? "selected" : "",
        previewClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        position: "absolute",
        left: `${media.position?.x ?? 0}px`,
        top: `${media.position?.y ?? 0}px`,
        width: `${media.width ?? 300}px`,
        height: `${media.height ?? 200}px`,
        zIndex: media["z-index"] ?? 1,
        transform: `rotate(${media.rotation ?? 0}deg)`,
        transformOrigin: "center center",
      }}
      onMouseDown={(event) => {
        onSelect(media.id);
        onStartDrag(event, media.id);
      }}
    >
      {animationOrder != null && (
        <span className="animation-order-badge">{animationOrder}</span>
      )}

      <img
        src={media["file-link"]}
        alt=""
        className="canvas-media"
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {isSelected && (
        <button
          type="button"
          className="media-delete-button"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDeleteMedia(media.id);
          }}
        >
          Delete
        </button>
      )}

      {isSelected && (
        <div
          className="media-resize-handle"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onStartResize(event, media.id);
          }}
        />
      )}

      {isSelected && (
        <div
          className="media-rotate-handle"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onStartRotate(event, media.id);
          }}
        />
      )}
    </div>
  );
}