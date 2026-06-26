import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useMediaSrc } from "../../../hooks/useMediaSrc";
import {
  buildMediaContainerStyle,
  buildMediaInnerStyle,
  buildMediaFilterStyle,
  buildBevelOverlayStyle,
} from "../../../core/render/revealRenderer";
import { REFLECTION_PRESETS } from "../../../core/model/imageEffects";
import { getStyleById } from "../../../core/model/imageStyles";
import MediaElementHandles from "./media/MediaElementHandles";
import MediaElementMenus from "./media/MediaElementMenus";
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
  onOpenPictureFormat,
  onContextMenu,
  previewClassName,
  animationOrder,
  cropSignal,
  previewEffects,
  externalPreviewStyleId,
}) {
  const resolvedSrc = useMediaSrc(media["file-link"]);
  const effectiveMedia = previewEffects
    ? { ...media, effects: { ...(media.effects ?? {}), ...previewEffects } }
    : media;
  const isVideo = media["media-type"] === "video";

  const [contextMenu, setContextMenu] = useState(null);
  const [stylePicker, setStylePicker] = useState(null);
  const [previewStyleId, setPreviewStyleId] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [localCrop, setLocalCrop] = useState([0, 0, 0, 0]);
  const [cropOrigin, setCropOrigin] = useState(null);
  const [cropPortalRect, setCropPortalRect] = useState(null);

  const wrapperRef = useRef(null);
  const cropDragRef = useRef(null);
  const localCropRef = useRef(localCrop);
  const cropOriginRef = useRef(cropOrigin);

  useEffect(() => {
    localCropRef.current = localCrop;
  }, [localCrop]);

  useEffect(() => {
    cropOriginRef.current = cropOrigin;
  }, [cropOrigin]);

  useLayoutEffect(() => {
    if (isCropping && cropOrigin && wrapperRef.current) {
      const r = wrapperRef.current.getBoundingClientRect();
      setCropPortalRect((prev) => {
        if (
          prev &&
          prev.left === r.left &&
          prev.top === r.top &&
          prev.width === r.width &&
          prev.height === r.height
        ) return prev; // bail out — same position, no extra render
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      });
    } else if (!isCropping) {
      setCropPortalRect(null);
    }
  }, [isCropping, cropOrigin]);

  const mediaCrop = media.crop;
  const mediaWidth = media.width;
  const mediaHeight = media.height;
  const mediaX = media.position?.x;
  const mediaY = media.position?.y;
  const sourceWidth = media["source-width"];
  const sourceHeight = media["source-height"];

  const enterCropMode = useCallback(() => {
    const [ct = 0, cr = 0, cb = 0, cl = 0] =
      mediaCrop?.length === 4 ? mediaCrop : [0, 0, 0, 0];
    const W = mediaWidth ?? 300;
    const H = mediaHeight ?? 200;
    const srcW =
      sourceWidth ?? W / Math.max(0.01, 1 - cl / 100 - cr / 100);
    const srcH =
      sourceHeight ?? H / Math.max(0.01, 1 - ct / 100 - cb / 100);
    const fullX = (mediaX ?? 0) - (cl / 100) * srcW;
    const fullY = (mediaY ?? 0) - (ct / 100) * srcH;
    setCropOrigin({ fullX, fullY, srcW, srcH });
    setLocalCrop([ct, cr, cb, cl]);
    setIsCropping(true);
  }, [
    mediaCrop,
    mediaWidth,
    mediaHeight,
    mediaX,
    mediaY,
    sourceWidth,
    sourceHeight,
  ]);

  const handledCropSignalRef = useRef(cropSignal ?? 0);
  useEffect(() => {
    if (cropSignal && cropSignal !== handledCropSignalRef.current && isPrimarySelected && !isCropping) {
      handledCropSignalRef.current = cropSignal;
      enterCropMode();
    }
  }, [cropSignal, enterCropMode, isCropping, isPrimarySelected]);

  const applyCrop = useCallback(() => {
    let [ct, cr, cb, cl] = localCropRef.current;
    const { fullX, fullY, srcW, srcH } = cropOriginRef.current;
    const x1n = (cl / 100) * srcW, x2n = srcW - (cr / 100) * srcW;
    const y1n = (ct / 100) * srcH, y2n = srcH - (cb / 100) * srcH;
    const winX1 = Math.min(x1n, x2n), winX2 = Math.max(x1n, x2n);
    const winY1 = Math.min(y1n, y2n), winY2 = Math.max(y1n, y2n);
    cl = winX1 / srcW * 100;
    cr = (srcW - winX2) / srcW * 100;
    ct = winY1 / srcH * 100;
    cb = (srcH - winY2) / srcH * 100;
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
    const rect = wrapperRef.current?.getBoundingClientRect();
    const { srcW, srcH } = cropOriginRef.current ?? {};
    cropDragRef.current = {
      edges,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: [...localCropRef.current],
      screenW: rect?.width  ?? srcW ?? 200,
      screenH: rect?.height ?? srcH ?? 120,
    };

    const onMove = (mv) => {
      const { edges: ed, startX, startY, startCrop, screenW, screenH } = cropDragRef.current;
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      const next = [...startCrop];
      if (ed.includes("n")) next[0] = startCrop[0] + (dy / screenH) * 100;
      if (ed.includes("e")) next[1] = startCrop[1] - (dx / screenW) * 100;
      if (ed.includes("s")) next[2] = startCrop[2] - (dy / screenH) * 100;
      if (ed.includes("w")) next[3] = startCrop[3] + (dx / screenW) * 100;
      setLocalCrop(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const startImagePan = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = [...localCropRef.current];
    const startOrigin = { ...cropOriginRef.current };
    const rect = wrapperRef.current?.getBoundingClientRect();
    const screenW = rect?.width  ?? startOrigin.srcW;
    const screenH = rect?.height ?? startOrigin.srcH;

    const onMove = (mv) => {
      const dx = mv.clientX - startX;
      const dy = mv.clientY - startY;
      const [ct, cr, cb, cl] = startCrop;
      const dxPct = (dx / screenW) * 100;
      const dyPct = (dy / screenH) * 100;
      const newCl = cl - dxPct;
      const newCr = cr + dxPct;
      const newCt = ct - dyPct;
      const newCb = cb + dyPct;
      const actualDx = (cl - newCl) / 100 * startOrigin.srcW;
      const actualDy = (ct - newCt) / 100 * startOrigin.srcH;
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

  const startCropElementDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startOrigin = { ...cropOriginRef.current };
    const rect = wrapperRef.current?.getBoundingClientRect();
    // screenScale: how many screen pixels equal one canvas pixel at current zoom
    const screenScale = (rect && startOrigin.srcW) ? rect.width / startOrigin.srcW : 1;

    const onMove = (mv) => {
      const dx = (mv.clientX - startX) / screenScale;
      const dy = (mv.clientY - startY) / screenScale;
      setCropOrigin({ ...startOrigin, fullX: startOrigin.fullX + dx, fullY: startOrigin.fullY + dy });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const startCropImageResize = useCallback((e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startOrigin = { ...cropOriginRef.current };
    const [ct0, cr0, cb0, cl0] = localCropRef.current;
    const { srcW: sw0, srcH: sh0 } = startOrigin;
    const rect = wrapperRef.current?.getBoundingClientRect();
    const screenScale = (rect && sw0) ? rect.width / sw0 : 1;

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
      // Convert screen-pixel delta → canvas-pixel delta
      const dx = (mv.clientX - startX) / screenScale;
      const dy = (mv.clientY - startY) / screenScale;
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

  // ── Styles ──────────────────────────────────────────────────────────────

  const activeStyleId = previewStyleId ?? externalPreviewStyleId ?? media.effects?.["style-id"];
  const activeStyleCss = activeStyleId ? getStyleById(activeStyleId).css : {};
  const baseContainerStyle = buildMediaContainerStyle(effectiveMedia, 0);
  const combinedTransform = [
    baseContainerStyle.transform ?? null,
    activeStyleCss.transform ?? null,
  ].filter(Boolean).join(" ");

  const { maskImage, WebkitMaskImage, ...baseContainerWithoutMask } = baseContainerStyle;
  const softEdgeMaskStyle = maskImage ? { maskImage, WebkitMaskImage } : {};

  const containerStyle = isCropping && cropOrigin
    ? {
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${cropOrigin.fullX}px, ${cropOrigin.fullY}px)`,
        width: `${cropOrigin.srcW}px`,
        height: `${cropOrigin.srcH}px`,
        zIndex: media["z-index"] ?? 1,
        overflow: "hidden",
        willChange: "transform",
      }
    : {
        ...baseContainerWithoutMask,
        ...activeStyleCss,
        ...(combinedTransform ? { transform: combinedTransform } : {}),
        overflow: "visible",
        willChange: "transform",
      };

  const innerStyle = isCropping
    ? { width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "auto" }
    : buildMediaInnerStyle(media);

  const mediaFilter = buildMediaFilterStyle(effectiveMedia);
  const filteredInnerStyle = mediaFilter ? { ...innerStyle, filter: mediaFilter } : innerStyle;
  const bevelOverlayStyle = buildBevelOverlayStyle(effectiveMedia);

  // ── Crop geometry (canvas-space) ─────────────────────────────────────────

  const W = isCropping && cropOrigin ? cropOrigin.srcW : (media.width ?? 300);
  const H = isCropping && cropOrigin ? cropOrigin.srcH : (media.height ?? 200);
  const [ct, cr, cb, cl] = localCrop;
  const x1raw = (cl / 100) * W;
  const x2raw = W - (cr / 100) * W;
  const y1raw = (ct / 100) * H;
  const y2raw = H - (cb / 100) * H;
  const x1 = Math.min(x1raw, x2raw);
  const x2 = Math.max(x1raw, x2raw);
  const y1 = Math.min(y1raw, y2raw);
  const y2 = Math.max(y1raw, y2raw);
  const tPx = Math.max(0, y1);
  const bPx = Math.max(0, H - y2);
  const lPx = Math.max(0, x1);
  const rPx = Math.max(0, W - x2);

  const getCropHandlePos = (id) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return {
      nw: { left: x1, top: y1 }, n: { left: midX, top: y1 }, ne: { left: x2, top: y1 },
      e:  { left: x2, top: midY },
      se: { left: x2, top: y2 }, s: { left: midX, top: y2 }, sw: { left: x1, top: y2 },
      w:  { left: x1, top: midY },
    }[id];
  };

  // ── Portal crop overlay ──────────────────────────────────────────────────

  const pScale = cropPortalRect ? cropPortalRect.width / W : 1;
  const pL = cropPortalRect?.left ?? 0;
  const pT = cropPortalRect?.top  ?? 0;
  const toSX = (cx) => pL + cx * pScale;
  const toSY = (cy) => pT + cy * pScale;

  const cropPortal = (isCropping && cropPortalRect)
    ? createPortal(
        <>
          {/* Crop boundary outline */}
          <div style={{
            position: "fixed",
            left: toSX(x1), top: toSY(y1),
            width: (x2 - x1) * pScale, height: (y2 - y1) * pScale,
            outline: "1.5px solid #ffffff",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            pointerEvents: "none",
            zIndex: 9901,
            boxSizing: "border-box",
          }} />

          {/* Rule-of-thirds grid */}
          <div style={{
            position: "fixed",
            left: toSX(x1), top: toSY(y1),
            width: (x2 - x1) * pScale, height: (y2 - y1) * pScale,
            pointerEvents: "none",
            zIndex: 9902,
            overflow: "hidden",
          }}>
            <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.35)" }} />
            <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.35)" }} />
          </div>

          {/* Crop edge/corner handles */}
          {CROP_HANDLES.map(({ id, edges, cursor }) => {
            const { left, top } = getCropHandlePos(id);
            const isCornerH = ["nw","ne","se","sw"].includes(id);
            const hSize = isCornerH ? 12 : 10;
            return (
              <div
                key={id}
                style={{
                  position: "fixed",
                  left: toSX(left), top: toSY(top),
                  width: hSize, height: hSize,
                  background: "#ffffff",
                  border: "1.5px solid rgba(0,0,0,0.5)",
                  zIndex: 9910,
                  transform: "translate(-50%, -50%)",
                  cursor,
                  pointerEvents: "auto",
                  boxSizing: "border-box",
                }}
                onMouseDown={(e) => startCropDrag(e, edges)}
              />
            );
          })}

          {/* Source-image resize handles */}
          {RESIZE_HANDLES.map(({ dir, cursor }) => {
            const rx = dir.includes("w") ? cropPortalRect.left
                     : dir.includes("e") ? cropPortalRect.right
                     : cropPortalRect.left + cropPortalRect.width / 2;
            const ry = dir.includes("n") ? cropPortalRect.top
                     : dir.includes("s") ? cropPortalRect.bottom
                     : cropPortalRect.top + cropPortalRect.height / 2;
            return (
              <div
                key={`cir-${dir}`}
                style={{
                  position: "fixed",
                  left: rx, top: ry,
                  width: 10, height: 10,
                  background: "#fff",
                  border: "1.5px solid #888",
                  borderRadius: "50%",
                  zIndex: 9910,
                  transform: "translate(-50%, -50%)",
                  cursor,
                  pointerEvents: "auto",
                  boxSizing: "border-box",
                }}
                onMouseDown={(e) => { e.stopPropagation(); startCropImageResize(e, dir); }}
              />
            );
          })}

          {/* Apply / Cancel buttons */}
          <div style={{
            position: "fixed",
            left: toSX(Math.max(0, x1)),
            top: toSY(Math.min(y2, H)) + 4,
            zIndex: 9910,
            display: "flex",
            gap: 6,
            pointerEvents: "auto",
          }}>
            <button
              className="crop-actions__btn crop-actions__btn--cancel"
              onMouseDown={(e) => { e.stopPropagation(); cancelCrop(); }}
            >
              Cancel
            </button>
            <button
              className="crop-actions__btn crop-actions__btn--apply"
              onMouseDown={(e) => { e.stopPropagation(); applyCrop(); }}
            >
              ✓ Apply
            </button>
          </div>
        </>,
        document.body,
      )
    : null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={wrapperRef}
      data-element-id={media.id}
      className={[
        "canvas-media-wrapper",
        isSelected && !isCropping ? "selected" : "",
        isCropping ? "cropping" : "",
        previewClassName,
      ].filter(Boolean).join(" ")}
      style={containerStyle}
      onDoubleClick={(event) => {
        if (isCropping) return;
        event.stopPropagation();
        onOpenPictureFormat?.(media.id);
      }}
      onMouseDown={(event) => {
        if (isCropping) { startCropElementDrag(event); return; }
        onSelect(media.id, {
          nativeEvent: event,
          preserveIfSelected: isSelected && !event.ctrlKey && !event.metaKey && !event.shiftKey,
        });
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
          onStartDrag(event, media.id);
        }
      }}
      onContextMenu={(event) => {
        if (isCropping) return;
        event.preventDefault();
        event.stopPropagation();
        if (onContextMenu) {
          onContextMenu(event, media.id, "media");
        } else {
          setContextMenu({ x: event.clientX, y: event.clientY });
        }
      }}
    >
      {animationOrder != null && !isCropping && (
        <span className="animation-order-badge">{animationOrder}</span>
      )}

      {/* Content layer — always overflow:hidden to clip the image */}
      {isCropping ? (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {isVideo ? (
            <>
              <video src={resolvedSrc} className="canvas-media" style={innerStyle} preload="metadata" onLoadedMetadata={(e) => { e.target.currentTime = 0; }} />
              <div style={{ position: "absolute", inset: 0, cursor: "default" }} />
            </>
          ) : (
            <img
              src={resolvedSrc} alt="" className="canvas-media"
              style={{ ...innerStyle, cursor: "grab" }}
              onMouseDown={startImagePan}
            />
          )}
          {/* Dark shade strips outside the crop window */}
          <div className="crop-shade" style={{ top: 0,    left: 0, right: 0,  height: tPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
          <div className="crop-shade" style={{ bottom: 0, left: 0, right: 0,  height: bPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
          <div className="crop-shade" style={{ top: tPx, bottom: bPx, left: 0,  width: lPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
          <div className="crop-shade" style={{ top: tPx, bottom: bPx, right: 0, width: rPx, cursor: "move" }} onMouseDown={startCropElementDrag} />
        </div>
      ) : (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", ...softEdgeMaskStyle }}>
          {isVideo ? (
            <>
              <video
                src={resolvedSrc} className="canvas-media" style={innerStyle}
                preload="metadata"
                onLoadedMetadata={(e) => { e.target.currentTime = 0; }}
              />
              <div style={{ position: "absolute", inset: 0, cursor: "move", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  pointerEvents: "none",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </>
          ) : (
            <img src={resolvedSrc} alt={media.decorative ? "" : (media.alt ?? "")} className="canvas-media" style={filteredInnerStyle} />
          )}
        </div>
      )}

      {/* Bevel overlay — rendered above image so inset shadow is visible */}
      {!isCropping && bevelOverlayStyle && (
        <div style={bevelOverlayStyle} />
      )}

      {/* Reflection overlay — positioned below the element, outside overflow:hidden */}
      {(() => {
        const refId = effectiveMedia.effects?.reflectionId;
        if (!refId || refId === "none") return null;
        const rp = REFLECTION_PRESETS.find((p) => p.id === refId);
        if (!rp || rp.size === 0) return null;
        const elH = media.height ?? 200;
        const refH = Math.round((rp.size / 100) * elH);
        return (
          <img
            src={resolvedSrc} alt="" aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: elH + (rp.offset ?? 0),
              width: "100%",
              height: refH,
              objectFit: "cover",
              objectPosition: "top",
              transform: "scaleY(-1)",
              opacity: rp.opacity,
              filter: rp.blur > 0 ? `blur(${rp.blur}px)` : undefined,
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        );
      })()}

      {isPrimarySelected && !isCropping && (
        <MediaElementHandles
          mediaId={media.id}
          onStartResize={onStartResize}
          onStartRotate={onStartRotate}
        />
      )}

      <MediaElementMenus
        media={media}
        contextMenu={contextMenu}
        stylePicker={stylePicker}
        onEnterCropMode={enterCropMode}
        onNewComment={onNewComment}
        onCloseContextMenu={() => setContextMenu(null)}
        onOpenStylePicker={() => {
          setStylePicker(contextMenu);
          setContextMenu(null);
        }}
        onPreviewStyle={setPreviewStyleId}
        onSelectStyle={(styleId) => {
          setPreviewStyleId(null);
          onUpdateMedia?.(media.id, { effects: { ...media.effects, "style-id": styleId } });
        }}
        onCloseStylePicker={() => {
          setPreviewStyleId(null);
          setStylePicker(null);
        }}
      />

      {/* Crop overlay portal — rendered to document.body, position:fixed */}
      {cropPortal}
    </div>
  );
}
