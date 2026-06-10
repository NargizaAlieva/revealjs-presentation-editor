import { useState } from "react";
import "./Toolbar.css";

import {
  MdAdd,
  MdDelete,
  MdContentCopy,
  MdVisibilityOff,
  MdVisibility,
  MdArrowUpward,
  MdArrowDownward,
  MdSave,
  MdPreview,
  MdFileUpload,
  MdRestartAlt,
  MdImage,
} from "react-icons/md";

const TABS = [
  "File",
  "Home",
  "Insert",
  "Design",
  "Transitions",
  "Animations",
  "Slide Show",
  "View",
];

export default function Toolbar({
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  onSavePresentation,
  onOpenPreview,
  canDelete,
  canMoveUp,
  canMoveDown,
  onExportPresentation,
  onResetPresentation,
  onImageUpload,
  onToggleSlideHidden,
  isSlideHidden,
}) {
  const [activeTab, setActiveTab] = useState("Home");
  const [showLayouts, setShowLayouts] = useState(false);

  return (
    <header className="toolbar">
      <nav className="toolbar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`toolbar-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="toolbar-ribbon">
        {activeTab === "File" && (
          <div className="ribbon-group">
            <button className="toolbar-item" onClick={onSavePresentation}>
              <MdSave />
              <span>Save</span>
            </button>

            <button className="toolbar-item" onClick={onExportPresentation}>
              <MdFileUpload />
              <span>Export</span>
            </button>

            <button className="toolbar-item" onClick={onResetPresentation}>
              <MdRestartAlt />
              <span>Reset</span>
            </button>

            <div className="ribbon-group-title">File</div>
          </div>
        )}

        {activeTab === "Home" && (
          <>
            <div className="ribbon-group">
              <div className="toolbar-dropdown-container">
                <button
                  className="toolbar-item"
                  onClick={() => setShowLayouts(!showLayouts)}
                >
                  <MdAdd />
                  <span>New Slide</span>
                </button>

                {showLayouts && <div className="layout-popup">...</div>}
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

            <div className="ribbon-group">
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
          </>
        )}

        {activeTab === "Insert" && (
          <div className="ribbon-group">
            <label className="toolbar-item toolbar-upload">
              <MdImage />
              <span>Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                hidden
              />
            </label>

            <div className="ribbon-group-title">Media</div>
          </div>
        )}

        {activeTab === "Slide Show" && (
          <div className="ribbon-group">
            <button className="toolbar-item" onClick={onOpenPreview}>
              <MdPreview />
              <span>Preview</span>
            </button>

            <div className="ribbon-group-title">Preview</div>
          </div>
        )}

        {["Design", "Transitions", "Animations", "View"].includes(
          activeTab,
        ) && (
          <div className="toolbar-placeholder">
            {activeTab} tools will be added here.
          </div>
        )}
      </div>
    </header>
  );
}