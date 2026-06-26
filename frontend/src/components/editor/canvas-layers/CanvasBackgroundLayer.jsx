const BG_RESIZE_HANDLES = [
  { dir: "nw", cursor: "nwse-resize" },
  { dir: "n", cursor: "ns-resize" },
  { dir: "ne", cursor: "nesw-resize" },
  { dir: "e", cursor: "ew-resize" },
  { dir: "se", cursor: "nwse-resize" },
  { dir: "s", cursor: "ns-resize" },
  { dir: "sw", cursor: "nesw-resize" },
  { dir: "w", cursor: "ew-resize" },
];

function BackgroundFillImage({ src, settings, width, height }) {
  if (!src) return null;

  const scale = settings.fitToCanvas ?? false;
  const offsetLeft = scale ? 0 : (settings.offsetLeft ?? 0) / 100;
  const offsetRight = scale ? 0 : (settings.offsetRight ?? 0) / 100;
  const offsetTop = scale ? 0 : (settings.offsetTop ?? 0) / 100;
  const offsetBottom = scale ? 0 : (settings.offsetBottom ?? 0) / 100;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          left: offsetLeft * width,
          top: offsetTop * height,
          width: (1 - offsetLeft - offsetRight) * width,
          height: (1 - offsetTop - offsetBottom) * height,
          objectFit: scale ? "fill" : "cover",
          opacity: 1 - (settings.transparency ?? 0) / 100,
        }}
      />
    </div>
  );
}

function BackgroundImage({
  src,
  rect,
  isSelected,
  onStartMove,
  onStartResize,
  onSelect,
}) {
  if (!src) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        zIndex: 0,
        outline: isSelected ? "2px solid #4f46e5" : "none",
        boxSizing: "border-box",
        cursor: isSelected ? "move" : "default",
      }}
      onMouseDown={isSelected ? onStartMove : undefined}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <img
        src={src}
        alt=""
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "fill",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      {isSelected && BG_RESIZE_HANDLES.map(({ dir, cursor }) => (
        <div
          key={dir}
          className={`resize-handle resize-handle-${dir}`}
          style={{ cursor, zIndex: 10 }}
          onMouseDown={(event) => onStartResize(event, dir)}
        />
      ))}
    </div>
  );
}

export default function CanvasBackgroundLayer({
  width,
  height,
  fillImageSrc,
  fillSettings,
  imageSrc,
  imageRect,
  isImageSelected,
  onStartImageMove,
  onStartImageResize,
  onSelectImage,
}) {
  return (
    <>
      <BackgroundFillImage
        src={fillImageSrc}
        settings={fillSettings}
        width={width}
        height={height}
      />
      <BackgroundImage
        src={imageSrc}
        rect={imageRect}
        isSelected={isImageSelected}
        onStartMove={onStartImageMove}
        onStartResize={onStartImageResize}
        onSelect={onSelectImage}
      />
    </>
  );
}
