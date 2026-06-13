import { useState, useRef, useEffect } from "react";
import {
  MdAdd,
  MdDelete,
  MdContentCopy,
  MdVisibilityOff,
  MdVisibility,
  MdArrowUpward,
  MdArrowDownward,
  MdContentPaste,
  MdContentCut,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdPalette,
  MdSearch,
  MdTextFields,
} from "react-icons/md";
import "./HomeTab.css";

const LAYOUTS = [
  { id: "title-content",       label: "Title and Content" },
  { id: "title-content-media", label: "Title, Content and Media" },
  { id: "two-columns",         label: "Two Columns" },
  { id: "title-only",          label: "Title Only" },
  { id: "blank",               label: "Blank" },
];

export default function HomeTab({
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  canDelete,
  canMoveUp,
  canMoveDown,
  onToggleSlideHidden,
  isSlideHidden,
  onApplyLayout,
}) {
  const [showLayouts, setShowLayouts] = useState(false);
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [newSlidePos, setNewSlidePos] = useState({ top: 0, left: 0 });
  const layoutBtnRef = useRef(null);
  const newSlideBtnRef = useRef(null);

  const handleLayoutSelect = (layoutId) => {
    onAddSlide?.(layoutId);
    setShowLayouts(false);
  };

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

  return (
    <>
      <div className="ribbon-group clipboard-group">
        <button className="toolbar-item large" disabled>
          <MdContentPaste />
          <span>Paste</span>
        </button>
        <div className="mini-stack">
          <button className="mini-command" disabled><MdContentCut /></button>
          <button className="mini-command" disabled><MdContentCopy /></button>
        </div>
        <div className="ribbon-group-title">Clipboard</div>
      </div>

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
              {LAYOUTS.map((layout) => (
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
                <div className="layout-apply-title">Apply Layout</div>
                {LAYOUTS.map((layout) => (
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
          <button className="mini-text-command" disabled>Reset</button>
          <button className="mini-text-command" disabled>Section</button>
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

      <div className="ribbon-group font-group">
        <div className="font-row">
          <select className="toolbar-select" disabled><option>Sora</option></select>
          <select className="toolbar-size" disabled><option>28</option></select>
        </div>
        <div className="font-row">
          <button className="small-format" disabled><MdFormatBold /></button>
          <button className="small-format" disabled><MdFormatItalic /></button>
          <button className="small-format" disabled><MdFormatUnderlined /></button>
          <button className="small-format" disabled>A</button>
          <button className="small-format" disabled><MdPalette /></button>
        </div>
        <div className="ribbon-group-title">Font</div>
      </div>

      <div className="ribbon-group paragraph-group">
        <div className="font-row">
          <button className="small-format" disabled><MdFormatListBulleted /></button>
          <button className="small-format" disabled><MdFormatListNumbered /></button>
          <button className="small-format" disabled><MdArrowUpward /></button>
          <button className="small-format" disabled><MdArrowDownward /></button>
        </div>
        <div className="font-row">
          <button className="small-format" disabled><MdFormatAlignLeft /></button>
          <button className="small-format" disabled><MdFormatAlignCenter /></button>
          <button className="small-format" disabled><MdFormatAlignRight /></button>
        </div>
        <div className="ribbon-group-title">Paragraph</div>
      </div>

      <div className="ribbon-group arrange-group">
        <button className="toolbar-item" onClick={onToggleSlideHidden}>
          {isSlideHidden ? <MdVisibility /> : <MdVisibilityOff />}
          <span>{isSlideHidden ? "Show" : "Hide"}</span>
        </button>
        <button
          className="toolbar-item"
          onClick={onMoveSlideUp}
          disabled={!canMoveUp}
        >
          <MdArrowUpward />
          <span>Up</span>
        </button>
        <button
          className="toolbar-item"
          onClick={onMoveSlideDown}
          disabled={!canMoveDown}
        >
          <MdArrowDownward />
          <span>Down</span>
        </button>
        <div className="ribbon-group-title">Arrange</div>
      </div>

      <div className="ribbon-group editing-group">
        <button className="toolbar-item" disabled>
          <MdSearch /><span>Find</span>
        </button>
        <button className="toolbar-item" disabled>
          <MdTextFields /><span>Select</span>
        </button>
        <div className="ribbon-group-title">Editing</div>
      </div>
    </>
  );
}