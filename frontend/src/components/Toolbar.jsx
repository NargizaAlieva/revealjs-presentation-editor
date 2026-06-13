import { useState } from "react";
import "./Toolbar.css";

import FileTab from "./toolbar/FileTab";
import HomeTab from "./toolbar/HomeTab";
import InsertTab from "./toolbar/InsertTab";
import TransitionsTab from "./toolbar/TransitionsTab";
import AnimationsTab from "./toolbar/AnimationsTab";
import SlideShowTab from "./toolbar/SlideShowTab";

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
  onAddSlide,
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
  onVideoUpload,
  onToggleSlideHidden,
  isSlideHidden,

  onTransitionChange,
  currentTransition,
  currentDuration,
  onDurationChange,
  onApplyTransitionToAll,
  onTransitionPreview,

  selectedElement,
  animations,
  onAddAnimation,
  onUpdateAnimation,
  onDeleteAnimation,
  onAnimationPreview,
  activeTab,
  onTabChange,
  presentationTitle,
  onSearch,
}) {
  const [localActiveTab, setLocalActiveTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");

  const currentTab = activeTab ?? localActiveTab;
  const setCurrentTab = onTabChange ?? setLocalActiveTab;

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="toolbar">
      <div className="toolbar-titlebar">
        <div className="toolbar-titlebar-left">
          <span className="toolbar-filename">
            {presentationTitle ?? "Untitled Presentation"}
          </span>
        </div>

        <div className="toolbar-titlebar-center">
          <div className="toolbar-search">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="toolbar-titlebar-right">
          <button className="toolbar-titlebar-btn toolbar-present-btn">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            Present in Teams
          </button>
          <button className="toolbar-titlebar-btn toolbar-share-btn">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────────────── */}
      <nav className="toolbar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`toolbar-tab ${currentTab === tab ? "active" : ""}`}
            onClick={() => setCurrentTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* ── Ribbon ────────────────────────────────────────────── */}
      <div className="toolbar-ribbon">
        {currentTab === "File" && (
          <FileTab
            onSavePresentation={onSavePresentation}
            onExportPresentation={onExportPresentation}
            onResetPresentation={onResetPresentation}
          />
        )}
        {currentTab === "Home" && (
          <HomeTab
            onAddSlide={onAddSlide}
            onDeleteSlide={onDeleteSlide}
            onDuplicateSlide={onDuplicateSlide}
            onMoveSlideUp={onMoveSlideUp}
            onMoveSlideDown={onMoveSlideDown}
            canDelete={canDelete}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onToggleSlideHidden={onToggleSlideHidden}
            isSlideHidden={isSlideHidden}
          />
        )}
        {currentTab === "Insert" && (
          <InsertTab
            onImageUpload={onImageUpload}
            onVideoUpload={onVideoUpload}
          />
        )}
        {currentTab === "Design" && (
          <div className="toolbar-placeholder">
            Use the Presentation Settings panel on the right to change aspect
            ratio and color theme.
          </div>
        )}
        {currentTab === "Transitions" && (
          <TransitionsTab
            currentTransition={currentTransition}
            onTransitionChange={onTransitionChange}
            currentDuration={currentDuration}
            onDurationChange={onDurationChange}
            onApplyToAll={onApplyTransitionToAll}
            onTransitionPreview={onTransitionPreview}
          />
        )}
        {currentTab === "Animations" && (
          <AnimationsTab
            selectedElement={selectedElement}
            animations={animations}
            onAddAnimation={onAddAnimation}
            onUpdateAnimation={onUpdateAnimation}
            onDeleteAnimation={onDeleteAnimation}
            onAnimationPreview={onAnimationPreview}
          />
        )}
        {currentTab === "Slide Show" && (
          <SlideShowTab onOpenPreview={onOpenPreview} />
        )}
        {currentTab === "View" && (
          <div className="toolbar-placeholder">
            Preview mode is available in the Slide Show tab.
          </div>
        )}
      </div>
    </header>
  );
}
