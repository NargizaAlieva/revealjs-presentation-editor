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
            onClick={() => {
              setActiveTab(tab);
              setShowLayouts(false);
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="toolbar-ribbon">
        {activeTab === "File" && (
          <>
            <div className="ribbon-group">
              <button
                className="toolbar-item large"
                onClick={onSavePresentation}
              >
                <MdSave />
                <span>Save</span>
              </button>

              <button
                className="toolbar-item large"
                onClick={onExportPresentation}
              >
                <MdFileUpload />
                <span>Export</span>
              </button>

              <button
                className="toolbar-item large"
                onClick={onResetPresentation}
              >
                <MdRestartAlt />
                <span>Reset</span>
              </button>

              <div className="ribbon-group-title">File</div>
            </div>
          </>
        )}

        {activeTab === "Home" && (
          <>
            <div className="ribbon-group clipboard-group">
              <button className="toolbar-item large" disabled>
                <MdContentPaste />
                <span>Paste</span>
              </button>

              <div className="mini-stack">
                <button className="mini-command" disabled>
                  <MdContentCut />
                </button>
                <button className="mini-command" disabled>
                  <MdContentCopy />
                </button>
              </div>

              <div className="ribbon-group-title">Clipboard</div>
            </div>

            <div className="ribbon-group slides-group">
              <div className="toolbar-dropdown-container">
                <button
                  className="toolbar-item large"
                  onClick={() => setShowLayouts(!showLayouts)}
                >
                  <MdAdd />
                  <span>New Slide</span>
                </button>

                {showLayouts && (
                  <div className="layout-popup">
                    <h4>Layouts</h4>

                    <button className="layout-option">
                      <div className="layout-thumb title-layout" />
                      <span>Title Slide</span>
                    </button>

                    <button className="layout-option">
                      <div className="layout-thumb title-content-layout" />
                      <span>Title and Content</span>
                    </button>

                    <button className="layout-option">
                      <div className="layout-thumb two-content-layout" />
                      <span>Two Content</span>
                    </button>

                    <button className="layout-option">
                      <div className="layout-thumb blank-layout" />
                      <span>Blank</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mini-stack text-stack">
                <button className="mini-text-command" disabled>
                  Layout
                </button>
                <button className="mini-text-command" disabled>
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

            <div className="ribbon-group font-group">
              <div className="font-row">
                <select className="toolbar-select" disabled>
                  <option>Sora</option>
                  <option>Arial</option>
                  <option>Calibri</option>
                </select>

                <select className="toolbar-size" disabled>
                  <option>28</option>
                  <option>24</option>
                  <option>18</option>
                </select>
              </div>

              <div className="font-row">
                <button className="small-format" disabled>
                  <MdFormatBold />
                </button>
                <button className="small-format" disabled>
                  <MdFormatItalic />
                </button>
                <button className="small-format" disabled>
                  <MdFormatUnderlined />
                </button>
                <button className="small-format" disabled>
                  A
                </button>
                <button className="small-format" disabled>
                  <MdPalette />
                </button>
              </div>

              <div className="ribbon-group-title">Font</div>
            </div>

            <div className="ribbon-group paragraph-group">
              <div className="font-row">
                <button className="small-format" disabled>
                  <MdFormatListBulleted />
                </button>
                <button className="small-format" disabled>
                  <MdFormatListNumbered />
                </button>
                <button className="small-format" disabled>
                  <MdArrowUpward />
                </button>
                <button className="small-format" disabled>
                  <MdArrowDownward />
                </button>
              </div>

              <div className="font-row">
                <button className="small-format" disabled>
                  <MdFormatAlignLeft />
                </button>
                <button className="small-format" disabled>
                  <MdFormatAlignCenter />
                </button>
                <button className="small-format" disabled>
                  <MdFormatAlignRight />
                </button>
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
                <MdSearch />
                <span>Find</span>
              </button>

              <button className="toolbar-item" disabled>
                <MdTextFields />
                <span>Select</span>
              </button>

              <div className="ribbon-group-title">Editing</div>
            </div>
          </>
        )}

        {activeTab === "Insert" && (
          <>
            <div className="ribbon-group">
              <label className="toolbar-item large toolbar-upload">
                <MdImage />
                <span>Pictures</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  hidden
                />
              </label>

              <button className="toolbar-item large" disabled>
                <MdTextFields />
                <span>Text Box</span>
              </button>

              <div className="ribbon-group-title">Insert</div>
            </div>
          </>
        )}

        {activeTab === "Design" && (
          <div className="toolbar-placeholder">
            Use the Presentation Settings panel on the right to change aspect
            ratio, transition, and color theme.
          </div>
        )}

        {activeTab === "Transitions" && (
          <div className="toolbar-placeholder">
            Slide transitions can be changed in the Presentation Settings panel.
          </div>
        )}

        {activeTab === "Animations" && (
          <div className="toolbar-placeholder">
            Animation tools are not implemented in this version.
          </div>
        )}

        {activeTab === "Slide Show" && (
          <div className="ribbon-group">
            <button className="toolbar-item large" onClick={onOpenPreview}>
              <MdPreview />
              <span>Preview</span>
            </button>

            <div className="ribbon-group-title">Slide Show</div>
          </div>
        )}

        {activeTab === "View" && (
          <div className="toolbar-placeholder">
            Preview mode is available in the Slide Show tab.
          </div>
        )}
      </div>
    </header>
  );
}
