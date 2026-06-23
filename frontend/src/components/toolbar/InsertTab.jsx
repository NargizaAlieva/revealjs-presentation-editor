import { useState, useRef, useEffect } from "react";
import { MdAdd, MdImage, MdTextFields, MdVideoLibrary } from "react-icons/md";
import { LAYOUTS } from "./homeTabConstants";

function BgFormatPopup({ currentScale, onChangeScale, onClose, anchorRef }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !anchorRef.current?.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", fn, true);
    return () => document.removeEventListener("mousedown", fn, true);
  }, [onClose, anchorRef]);

  return (
    <div ref={ref} style={{
      zIndex: 9999,
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: 6,
      padding: 10,
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      width: 160,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444", marginBottom: 4 }}>
        Scale: <span style={{ color: "#4f46e5" }}>{currentScale}%</span>
      </div>
      <input
        type="range"
        min={50}
        max={300}
        step={5}
        value={currentScale}
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => onChangeScale(Number(e.target.value))}
        style={{ width: "100%", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999" }}>
        <span>50%</span><span>150%</span><span>300%</span>
      </div>
      <div style={{ fontSize: 10, color: "#aaa", marginTop: 8 }}>
        Drag the slide background to reposition
      </div>
    </div>
  );
}

export default function InsertTab({ onImageUpload, onVideoUpload, onAddSlide, onAddTextElement, layouts: propLayouts, onApplyBackgroundImage, onRemoveBackgroundImage, onUpdateBackgroundImagePosition, onUpdateBackgroundImageScale, currentBgImage, currentBgPosition = "center center", currentBgScale = 100 }) {
  const layouts = (propLayouts && propLayouts.length > 0) ? propLayouts : LAYOUTS;
  const [showLayouts, setShowLayouts] = useState(false);
  const [newSlidePos, setNewSlidePos] = useState({ top: 0, left: 0 });
  const newSlideBtnRef = useRef(null);
  const [showBgPosition, setShowBgPosition] = useState(false);
  const [bgPopupPos, setBgPopupPos] = useState({ top: 0, left: 0 });
  const bgPositionBtnRef = useRef(null);

  const handleNewSlideToggle = () => {
    if (!showLayouts && newSlideBtnRef.current) {
      const rect = newSlideBtnRef.current.getBoundingClientRect();
      setNewSlidePos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowLayouts((v) => !v);
  };

  useEffect(() => {
    if (!showLayouts) return;
    const handler = (e) => {
      if (newSlideBtnRef.current && !newSlideBtnRef.current.closest(".insert-new-slide-container").contains(e.target)) {
        setShowLayouts(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLayouts]);

  return (
    <>
      <div className="ribbon-group">
        <div className="insert-new-slide-container">
          <button
            ref={newSlideBtnRef}
            className="toolbar-item large"
            onClick={handleNewSlideToggle}
          >
            <MdAdd />
            <span>New Slide</span>
          </button>

          {showLayouts && (
            <div className="layout-popup" style={{ top: newSlidePos.top, left: newSlidePos.left }}>
              <h4>Layouts</h4>
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  className="layout-option"
                  onClick={() => { onAddSlide?.(layout.id); setShowLayouts(false); }}
                >
                  <div className={`layout-thumb layout-thumb--${layout.id}`}>
                    {layout.id === "title-content-media" && (
                      <div className="layout-thumb-media" />
                    )}
                  </div>
                  <span>{layout.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ribbon-group-title">Slides</div>
      </div>

      <div className="ribbon-group">
        <label className="toolbar-item large toolbar-upload">
          <MdImage />
          <span>Pictures</span>
          <input type="file" accept="image/*" onChange={onImageUpload} hidden />
        </label>

        <label className="toolbar-item large toolbar-upload">
          <MdVideoLibrary />
          <span>Video</span>
          <input type="file" accept="video/*" onChange={onVideoUpload} hidden />
        </label>

        <button className="toolbar-item large" onClick={() => onAddTextElement?.()}>
          <MdTextFields />
          <span>Text Box</span>
        </button>

        <div className="ribbon-group-title">Insert</div>
      </div>

      <div className="ribbon-group">
        <label className="toolbar-item large toolbar-upload">
          <MdImage style={{ color: currentBgImage ? "#4caf50" : undefined }} />
          <span>Background<br/>Image</span>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onApplyBackgroundImage?.(file);
            e.target.value = "";
          }} hidden />
        </label>
        {currentBgImage && (
          <>
            <button
              ref={bgPositionBtnRef}
              className={`toolbar-item large${showBgPosition ? " active" : ""}`}
              title="Format background image"
              onClick={() => {
                if (!showBgPosition && bgPositionBtnRef.current) {
                  const rect = bgPositionBtnRef.current.getBoundingClientRect();
                  setBgPopupPos({ top: rect.bottom + 4, left: rect.left });
                }
                setShowBgPosition(v => !v);
              }}
            >
              <span style={{ fontSize: 16 }}>⊹</span>
              <span>Format</span>
            </button>
            <button className="toolbar-item large" onClick={onRemoveBackgroundImage} title="Remove background image">
              <span style={{ fontSize: 18 }}>✕</span>
              <span>Remove Bg</span>
            </button>
          </>
        )}
        {showBgPosition && currentBgImage && (
          <div style={{ position: "fixed", top: bgPopupPos.top, left: bgPopupPos.left, zIndex: 9999 }}>
            <BgFormatPopup
              currentScale={currentBgScale}
              onChangeScale={(scale) => onUpdateBackgroundImageScale?.(scale)}
              onClose={() => setShowBgPosition(false)}
              anchorRef={bgPositionBtnRef}
            />
          </div>
        )}
        <div className="ribbon-group-title">Background</div>
      </div>
    </>
  );
}
