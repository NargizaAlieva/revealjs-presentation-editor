import { useState, useRef, useEffect, useCallback } from "react";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import {
  buildMediaContainerStyle,
  buildMediaInnerStyle,
  buildVideoAttributes,
} from "../../core/render/revealRenderer";
import MediaContextMenu from "./MediaContextMenu";
import "./MediaElement.css";

const RESIZE_HANDLES = [
  { dir: "nw", cursor: "nwse-resize" },
  { dir: "n",  cursor: "ns-resize"   },
  { dir: "ne", cursor: "nesw-resize" },
  { dir: "e",  cursor: "ew-resize"   },
  { dir: "se", cursor: "nwse-resize" },
  { dir: "s",  cursor: "ns-resize"   },
  { dir: "sw", cursor: "nesw-resize" },
  { dir: "w",  cursor: "ew-resize"   },
];

const CROP_HANDLES = [
  { id: "nw", edges: ["n","w"], cursor: "nwse-resize" },
  { id: "n",  edges: ["n"],     cursor: "ns-resize"   },
  { id: "ne", edges: ["n","e"], cursor: "nesw-resize" },
  { id: "e",  edges: ["e"],     cursor: "ew-resize"   },
  { id: "se", edges: ["s","e"], cursor: "nwse-resize" },
  { id: "s",  edges: ["s"],     cursor: "ns-resize"   },
  { id: "sw", edges: ["s","w"], cursor: "nesw-resize" },
  { id: "w",  edges: ["w"],     cursor: "ew-resize"   },
];

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export default function MediaElement({
  media,
  isSelected,
  isPrimarySelected = isSelected,
  onSelect,
  onStartDrag,
  onStartResize,
  onStartRotate,
  onUpdateMedia,
  onNewComment,
  previewClassName,
  animationOrder,
}) {
  const resolvedSrc = useMediaSrc(media["file-link"]);
  const isVideo = media["media-type"] === "video";

  const [contextMenu, setContextMenu] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [localCrop, setLocalCrop] = useState([0, 0, 0, 0]);
  // full image origin/size while in crop mode
  const [cropOrigin, setCropOrigin] = useState(null);

  const cropDragRef = useRef(null);
  const cropImageDragRef = useRef(null);
  const localCropRef = useRef(localCrop);
  localCropRef.current = localCrop;
  const cropOriginRef = useRef(cropOrigin);
  cropOriginRef.current = cropOrigin;

  const enterCropMode = useCallback(() => {
    const [ct = 0, cr = 0, cb = 0, cl = 0] = media.crop?.length === 4 ? media.crop : [0, 0, 0, 0];
    const W = media.width ?? 300;
    const H = media.height ?? 200;
    // recover full image dimensions — prefer stored source, fall back to computing from crop
    const srcW = media["source-width"] ?? W / Math.max(0.01, 1 - cl / 100 - cr / 100);
    const srcH = media["source-height"] ?? H / Math.max(0.01, 1 - ct / 100 - cb / 100);
    const fullX = (media.position?.x ?? 0) - (cl / 100) * srcW;
    const fullY = (media.position?.y ?? 0) - (ct / 100) * srcH;
    setCropOrigin({ fullX, fullY, srcW, srcH });
    setLocalCrop([ct, cr, cb, cl]);
    setIsCropping(true);
  }, [media.crop, media.width, media.height, media.position, media["source-width"], media["source-height"]]);

  const applyCrop = useCallback(() => {
    let [ct, cr, cb, cl] = localCropRef.current;
    const { fullX, fullY, srcW, srcH } = cropOriginRef.current;
    // Normalize flipped crop values (when handles crossed)
    const x1n = (cl / 100) * srcW, x2n = srcW - (cr / 100) * srcW;
    const y1n = (ct / 100) * srcH, y2n = srcH - (cb / 100) * srcH;
    const winX1 = Math.min(x1n, x2n), winX2 = Math.max(x1n, x2n);
    const winY1 = Math.min(y1n, y2n), winY2 = Math.max(y1n, y2n);
    cl = winX1 / srcW * 100;
    cr = (srcW - winX2) / srcW * 100;
    ct = winY1 / srcH * 100;
    cb = (srcH - winY2) / srcH * 100;
    // Placeholder always matches crop window (may include empty space outside image)
    onUpdateMedia?.(media.id, {
      crop: [ct, cr, cb, cl],
      position: { x: fullX + winX1, y: fullY + winY1 },
      width: Math.max(1, winX2 - winX1),
      height: Math.max(1, winY2 - winY1),
      "source-width": srcW,
      "source-height": srcH,
    });
    setIsCropping(false);
  }, [media.id, onUpdateMedia]);

  const cancelCrop = useCallback(() => setIsCropping(false), []);

  useEffect(() => {
    if (!isCropping) return;
    const onKey = (e) => {
      if (e.key === "Escape") cancelCrop();
      if (e.key === "Enter") applyCrop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCropping, applyCrop, cancelCrop]);

  const startCropDrag = useCallback((e, edges) => {
    e.preventDefault();
    e.stopPropagation();
    cropDragRef.current = {
      edges,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: [...localCropRef.current],
    };

    const onMove = (mv) => {
      const { edges: ed, startX, startY, startCrop } = cropDragRef.current;
      const { srcW, srcH } = cropOriginRef.current;
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      const next = [...startCrop];
      if (ed.includes("n")) next[0] = startCrop[0] + (dy / srcH) * 100;
      if (ed.includes("e")) next[1] = startCrop[1] - (dx / srcW) * 100;
      if (ed.includes("s")) next[2] = startCrop[2] - (dy / srcH) * 100;
      if (ed.includes("w")) next[3] = startCrop[3] + (dx / srcW) * 100;
      setLocalCrop(next);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Pan image inside the crop frame: image moves, crop window stays fixed on slide
  const startImagePan = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = [...localCropRef.current];
    const startOrigin = { ...cropOriginRef.current };

    const onMove = (mv) => {
      const { srcW, srcH } = startOrigin;
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      const [ct, cr, cb, cl] = startCrop;
      const dxPct = (dx / srcW) * 100;
      const dyPct = (dy / srcH) * 100;
      const newCl = cl - dxPct;
      const newCr = cr + dxPct;
      const newCt = ct - dyPct;
      const newCb = cb + dyPct;
      const actualDx = (cl - newCl) / 100 * srcW;
      const actualDy = (ct - newCt) / 100 * srcH;
      setCropOrigin({ ...startOrigin, fullX: startOrigin.fullX + actualDx, fullY: startOrigin.fullY + actualDy });
      setLocalCrop([newCt, newCr, newCb, newCl]);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Drag from shaded area — moves entire element (crop window + image) together
  const startCropElementDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startOrigin = { ...cropOriginRef.current };

    const onMove = (mv) => {
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      setCropOrigin({ ...startOrigin, fullX: startOrigin.fullX + dx, fullY: startOrigin.fullY + dy });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  // Resize full image in crop mode — crop window absolute position/size stays fixed
  const startCropImageResize = useCallback((e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startOrigin = { ...cropOriginRef.current };
    const [ct0, cr0, cb0, cl0] = localCropRef.current;
    // Normalize in case crop handles were crossed before starting image resize
    const { srcW: sw0, srcH: sh0 } = startOrigin;
    const wx1 = Math.min((cl0 / 100) * sw0, sw0 - (cr0 / 100) * sw0);
    const wx2 = Math.max((cl0 / 100) * sw0, sw0 - (cr0 / 100) * sw0);
    const wy1 = Math.min((ct0 / 100) * sh0, sh0 - (cb0 / 100) * sh0);
    const wy2 = Math.max((ct0 / 100) * sh0, sh0 - (cb0 / 100) * sh0);
    const winX = startOrigin.fullX + wx1;
    const winY = startOrigin.fullY + wy1;
    const winW = wx2 - wx1;
    const winH = wy2 - wy1;

    const isCorner = (dir.includes("n") || dir.includes("s")) && (dir.includes("e") || dir.includes("w"));
    const aspectRatio = startOrigin.srcW / startOrigin.srcH;

    const onMove = (mv) => {
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      let { fullX, fullY, srcW, srcH } = startOrigin;
      if (dir.includes("e")) srcW = Math.max(10, srcW + dx);
      if (dir.includes("s")) srcH = Math.max(10, srcH + dy);
      if (dir.includes("w")) { srcW = Math.max(10, srcW - dx); fullX = startOrigin.fullX + startOrigin.srcW - srcW; }
      if (dir.includes("n")) { srcH = Math.max(10, srcH - dy); fullY = startOrigin.fullY + startOrigin.srcH - srcH; }
      if (isCorner) {
        if (srcW / aspectRatio > srcH) { srcH = srcW / aspectRatio; } else { srcW = srcH * aspectRatio; }
        if (dir.includes("w")) fullX = startOrigin.fullX + startOrigin.srcW - srcW;
        if (dir.includes("n")) fullY = startOrigin.fullY + startOrigin.srcH - srcH;
      }
      // Recalculate crop% so the crop window stays at the same absolute position/size
      // Values can be negative when image edge passes inside the crop window (empty space)
      const newCl = (winX - fullX) / srcW * 100;
      const newCt = (winY - fullY) / srcH * 100;
      const newCr = (fullX + srcW - winX - winW) / srcW * 100;
      const newCb = (fullY + srcH - winY - winH) / srcH * 100;
      setCropOrigin({ fullX, fullY, srcW, srcH });
      setLocalCrop([newCt, newCr, newCb, newCl]);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const containerStyle = isCropping && cropOrigin
    ? {
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${cropOrigin.fullX}px, ${cropOrigin.fullY}px)`,
        width: `${cropOrigin.srcW}px`,
        height: `${cropOrigin.srcH}px`,
        zIndex: media["z-index"] ?? 1,
        overflow: "visible",
      }
    : buildMediaContainerStyle(media, 0);

  const innerStyle = isCropping
    ? { width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "auto" }
    : buildMediaInnerStyle(media);

  const videoAttrs = buildVideoAttributes(media);

  const W = isCropping && cropOrigin ? cropOrigin.srcW : (media.width ?? 300);
  const H = isCropping && cropOrigin ? cropOrigin.srcH : (media.height ?? 200);
  const [ct, cr, cb, cl] = localCrop;
  // Raw positions (can cross when crop flips)
  const x1raw = (cl / 100) * W;
  const x2raw = W - (cr / 100) * W;
  const y1raw = (ct / 100) * H;
  const y2raw = H - (cb / 100) * H;
  // Normalized so x1 <= x2, y1 <= y2 (handles flip)
  const x1 = Math.min(x1raw, x2raw);
  const x2 = Math.max(x1raw, x2raw);
  const y1 = Math.min(y1raw, y2raw);
  const y2 = Math.max(y1raw, y2raw);
  // Clamped values only for shade divs (can't render negative-size elements)
  const tPx = Math.max(0, y1);
  const bPx = Math.max(0, H - y2);
  const lPx = Math.max(0, x1);
  const rPx = Math.max(0, W - x2);

  const getCropHandlePos = (id) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const pos = {
      nw: { left: x1, top: y1 }, n: { left: midX, top: y1 }, ne: { left: x2, top: y1 },
      e:  { left: x2, top: midY },
      se: { left: x2, top: y2 }, s: { left: midX, top: y2 }, sw: { left: x1, top: y2 },
      w:  { left: x1, top: midY },
    };
    return pos[id];
  };

  return (
    <div
      className={[
        "canvas-media-wrapper",
        isSelected && !isCropping ? "selected" : "",
        isCropping ? "cropping" : "",
        previewClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={containerStyle}
      onMouseDown={(event) => {
        if (isCropping) { startCropElementDrag(event); return; }
        onSelect(media.id, {
          nativeEvent: event,
          preserveIfSelected:
            isSelected && !event.ctrlKey && !event.metaKey && !event.shiftKey,
        });
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
          onStartDrag(event, media.id);
        }
      }}
      onContextMenu={(event) => {
        if (isCropping) return;
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({ x: event.clientX, y: event.clientY });
      }}
    >
      {animationOrder != null && !isCropping && (
        <span className="animation-order-badge">{animationOrder}</span>
      )}

      {/* In crop mode wrap image+shades in overflow:hidden so image is clipped to its bounds */}
      {isCropping ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {isVideo ? (
            <>
              <video src={resolvedSrc} className="canvas-media" style={innerStyle} {...videoAttrs} />
              <div style={{ position: "absolute", inset: 0, cursor: "default" }} />
            </>
          ) : (
            <img
              src={resolvedSrc} alt="" className="canvas-media"
              style={{ ...innerStyle, cursor: "grab" }}
              onMouseDown={startImagePan}
            />
          )}
          {/* dark shades outside crop boundary */}
          <div className="crop-shade" style={{ top: 0, left: 0, right: 0, height: tPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
          <div className="crop-shade" style={{ bottom: 0, left: 0, right: 0, height: bPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
          <div className="crop-shade" style={{ top: tPx, bottom: bPx, left: 0, width: lPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
          <div className="crop-shade" style={{ top: tPx, bottom: bPx, right: 0, width: rPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
        </div>
      ) : isVideo ? (
        <>
          <video
            src={resolvedSrc} className="canvas-media" style={innerStyle}
            controls={isPrimarySelected}
            {...videoAttrs}
          />
          {!isPrimarySelected && (
            <div style={{ position: "absolute", inset: 0, cursor: "move" }} />
          )}
        </>
      ) : (
        <img src={resolvedSrc} alt="" className="canvas-media" style={innerStyle} />
      )}

      {/* ── Crop mode overlay (outside overflow:hidden) ───── */}
      {isCropping && (
        <>
          {/* crop boundary border */}
          <div className="crop-border" style={{ left: x1, top: y1, width: x2 - x1, height: y2 - y1 }} />

          {/* rule-of-thirds grid */}
          <div className="crop-grid" style={{ left: x1, top: y1, width: x2 - x1, height: y2 - y1 }}>
            <div className="crop-grid-line crop-grid-line--v" style={{ left: "33.33%" }} />
            <div className="crop-grid-line crop-grid-line--v" style={{ left: "66.66%" }} />
            <div className="crop-grid-line crop-grid-line--h" style={{ top: "33.33%" }} />
            <div className="crop-grid-line crop-grid-line--h" style={{ top: "66.66%" }} />
          </div>

          {/* crop handles */}
          {CROP_HANDLES.map(({ id, edges, cursor }) => {
            const { left, top } = getCropHandlePos(id);
            return (
              <div
                key={id}
                className={`crop-handle crop-handle--${id}`}
                style={{ left, top, cursor }}
                onMouseDown={(e) => startCropDrag(e, edges)}
              />
            );
          })}

          {/* Apply / Cancel buttons — below crop window, clamped inside image */}
          <div className="crop-actions" style={{ left: Math.max(0, x1), top: Math.min(y2, H) }}>
            <button className="crop-actions__btn crop-actions__btn--cancel" onMouseDown={(e) => { e.stopPropagation(); cancelCrop(); }}>
              Cancel
            </button>
            <button className="crop-actions__btn crop-actions__btn--apply" onMouseDown={(e) => { e.stopPropagation(); applyCrop(); }}>
              ✓ Apply
            </button>
          </div>

          {/* image resize handles */}
          {RESIZE_HANDLES.map(({ dir, cursor }) => (
            <div
              key={`crop-img-resize-${dir}`}
              className={`resize-handle resize-handle-${dir}`}
              style={{ cursor, zIndex: 25, background: "#fff", borderColor: "#888" }}
              onMouseDown={(e) => { e.stopPropagation(); startCropImageResize(e, dir); }}
            />
          ))}
        </>
      )}

      {/* ── Normal mode controls ───────────────────────────── */}
      {isPrimarySelected && !isCropping &&
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

      {isPrimarySelected && !isCropping && (
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

      {contextMenu && (
        <MediaContextMenu
          position={contextMenu}
          onCrop={enterCropMode}
          onStyle={() => {}}
          onNewComment={onNewComment}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
