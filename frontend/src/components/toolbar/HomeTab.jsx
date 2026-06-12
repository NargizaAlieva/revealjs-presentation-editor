import { useState } from "react";
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdContentCopy,
  MdContentCut,
  MdContentPaste,
  MdDelete,
  MdFormatAlignCenter,
  MdFormatAlignLeft,
  MdFormatAlignRight,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatUnderlined,
  MdPalette,
  MdSearch,
  MdTextFields,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import "./HomeTab.css";

export default function HomeTab({
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  canDelete,
  canMoveUp,
  canMoveDown,
  onToggleSlideHidden,
  isSlideHidden,
}) {
  const [showLayouts, setShowLayouts] = useState(false);

  return (
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
          <button className="mini-text-command" disabled>Layout</button>
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
  );
}
