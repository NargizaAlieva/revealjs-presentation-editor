import { useState, useRef, useEffect } from "react";
import { MdAdd, MdDelete, MdContentCopy } from "react-icons/md";
import { LAYOUTS } from "./homeTabConstants";
import "./SlidesGroup.css";

export default function SlidesGroup({
  onAddSlide,
  onApplyLayout,
  onDeleteSlide,
  onResetLayout,
  presentation,
  onDuplicateSlide,
  canDelete,
}) {
  const [showLayouts, setShowLayouts] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [newSlidePos, setNewSlidePos] = useState({ top: 0, left: 0 });
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  const presentationLayouts = presentation?.slideset?.layouts ?? [];
  const layouts = presentationLayouts.length > 0
    ? presentationLayouts.map((l) => ({ id: l["layout-id"], label: l.name ?? l["layout-id"] }))
    : LAYOUTS;

  const newSlideBtnRef = useRef(null);
  const layoutBtnRef = useRef(null);

  const handleNewSlideToggle = () => {
    if (!showLayouts && newSlideBtnRef.current) {
      const rect = newSlideBtnRef.current.getBoundingClientRect();
      setNewSlidePos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowLayouts((v) => !v);
  };

  const handleLayoutPanelToggle = () => {
    if (!showLayoutPanel && layoutBtnRef.current) {
      const rect = layoutBtnRef.current.getBoundingClientRect();
      setPopupPos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowLayoutPanel((v) => !v);
  };

  const handleLayoutSelect = (layoutId) => {
    onAddSlide?.(layoutId);
    setShowLayouts(false);
  };

  useEffect(() => {
    if (!showLayouts) return;
    const handler = (e) => {
      if (
        newSlideBtnRef.current &&
        !newSlideBtnRef.current
          .closest(".toolbar-dropdown-container")
          .contains(e.target)
      ) {
        setShowLayouts(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLayouts]);

  useEffect(() => {
    if (!showLayoutPanel) return;
    const handler = (e) => {
      if (
        layoutBtnRef.current &&
        !layoutBtnRef.current
          .closest(".layout-apply-container")
          .contains(e.target)
      ) {
        setShowLayoutPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showLayoutPanel]);

  return (
    <div className="ribbon-group slides-group">
      <div className="toolbar-dropdown-container">
        <button
          ref={newSlideBtnRef}
          className="toolbar-item large"
          onClick={handleNewSlideToggle}
        >
          <MdAdd />
          <span>New Slide</span>
        </button>

        {showLayouts && (
          <div
            className="layout-popup"
            style={{ top: newSlidePos.top, left: newSlidePos.left }}
          >
            <h4>Layouts</h4>
            {layouts.map((layout) => (
              <button
                key={layout.id}
                className="layout-option"
                onClick={() => handleLayoutSelect(layout.id)}
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

      <div className="mini-stack text-stack">
        <div className="layout-apply-container">
          <button
            ref={layoutBtnRef}
            className="mini-text-command layout-apply-btn"
            onClick={handleLayoutPanelToggle}
          >
            Layout
          </button>
          {showLayoutPanel && (
            <div
              className="layout-apply-popup"
              style={{ top: popupPos.top, left: popupPos.left }}
            >
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  className="layout-apply-option"
                  onClick={() => {
                    onApplyLayout?.(layout.id);
                    setShowLayoutPanel(false);
                  }}
                >
                  <div
                    className={`layout-thumb layout-thumb--${layout.id} layout-thumb--small`}
                  >
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
        <button className="mini-text-command" onClick={onResetLayout}>
          Reset
        </button>
        <button className="mini-text-command" disabled>
          Section
        </button>
      </div>

      <button
        className="toolbar-item"
        onClick={onDeleteSlide}
        disabled={!canDelete}
      >
        <MdDelete />
        <span>Delete</span>
      </button>

      <button className="toolbar-item" onClick={onDuplicateSlide}>
        <MdContentCopy />
        <span>Duplicate</span>
      </button>

      <div className="ribbon-group-title">Slides</div>
    </div>
  );
}