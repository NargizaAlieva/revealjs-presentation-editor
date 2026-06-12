import "./MediaElement.css";

export default function MediaElement({
  media,
  isSelected,
  onStartDrag,
  onDeleteMedia,
  onStartResize,
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
      }}
      onMouseDown={(event) => onStartDrag(event, media.id)}
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
          transform: `rotate(${media.rotation ?? 0}deg)`,
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
          className="resize-handle"
          onMouseDown={(event) => {
            event.stopPropagation();
            onStartResize(media.id);
          }}
        />
      )}
    </div>
  );
}