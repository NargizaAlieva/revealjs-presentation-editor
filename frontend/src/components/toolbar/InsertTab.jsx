import { useState, useRef, useEffect } from "react";
import { MdAdd, MdImage, MdTextFields, MdVideoLibrary } from "react-icons/md";

const LAYOUTS = [
  { id: "title-content", label: "Title and Content" },
  { id: "title-content-media", label: "Title, Content and Media" },
  { id: "two-columns", label: "Two Columns" },
  { id: "title-only", label: "Title Only" },
  { id: "blank", label: "Blank" },
];

export default function InsertTab({ onImageUpload, onVideoUpload, onAddSlide, onAddTextElement }) {
  const [showLayouts, setShowLayouts] = useState(false);
  const [newSlidePos, setNewSlidePos] = useState({ top: 0, left: 0 });
  const newSlideBtnRef = useRef(null);

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
              {LAYOUTS.map((layout) => (
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
    </>
  );
}