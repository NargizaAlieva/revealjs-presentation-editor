import { useMediaSrc } from "../../hooks/useMediaSrc";
import "./MediaElement.css";

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

export default function MediaElement({
  media,
  isSelected,
  onSelect,
  onStartDrag,
  onStartResize,
  onStartRotate,
  previewClassName,
  animationOrder,
}) {
  const resolvedSrc = useMediaSrc(media["file-link"]);
  const isVideo = media["media-type"] === "video";

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

      {isVideo ? (
        <>
          <video
            src={resolvedSrc}
            className="canvas-media"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            controls={isSelected}
          />
          {!isSelected && (
            <div style={{ position: "absolute", inset: 0, cursor: "move" }} />
          )}
        </>
      ) : (
        <img
          src={resolvedSrc}
          alt=""
          className="canvas-media"
          style={{ width: "100%", height: "100%" }}
        />
      )}

      {isSelected &&
        RESIZE_HANDLES.map(({ dir, cursor }) => (
          <div
            key={dir}
            className={`resize-handle resize-handle-${dir}`}
            style={{ cursor }}
            onMouseDown={(event) => {
              event.stopPropagation();
              onStartResize(event, media.id, dir);
            }}
          />
        ))}

      {isSelected && (
        <button
          type="button"
          className="media-rotate-handle"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onStartRotate(event, media.id);
          }}
          aria-label="Rotate media element"
        />
      )}
    </div>
  );
}