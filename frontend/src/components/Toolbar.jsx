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
  onOpenPreviewFromBeginning,
  onOpenPreviewFromCurrent,
  canDelete,
  canMoveUp,
  canMoveDown,
  onExportPresentation,
  onResetPresentation,
  onImageUpload,
  onVideoUpload,
  onToggleSlideHidden,
  isSlideHidden,
  onApplyLayout,

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

  currentFormatting,
  onFormatChange,
  isTextSelected,
  presentation,
  onNewPresentation,
  onOpenPresentation,
  onCut,
  onCopy,
  onPaste,
  canPaste,
}) {
  const [localActiveTab, setLocalActiveTab] = useState("Home");
  const currentTab = activeTab ?? localActiveTab;
  const setCurrentTab = onTabChange ?? setLocalActiveTab;

  return (
    <header className="toolbar">
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

      <div className="toolbar-ribbon">
        {currentTab === "File" && (
          <FileTab
            onOpenPresentation={onOpenPresentation}
            onSavePresentation={onSavePresentation}
            onExportPresentation={onExportPresentation}
            onResetPresentation={onResetPresentation}
            onNewPresentation={onNewPresentation}
          />
        )}

        {currentTab === "Home" && (
          <HomeTab
            onAddSlide={onAddSlide}
            onApplyLayout={onApplyLayout}
            onDeleteSlide={onDeleteSlide}
            onDuplicateSlide={onDuplicateSlide}
            onMoveSlideUp={onMoveSlideUp}
            onMoveSlideDown={onMoveSlideDown}
            canDelete={canDelete}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onToggleSlideHidden={onToggleSlideHidden}
            isSlideHidden={isSlideHidden}
            currentFormatting={currentFormatting}
            onFormatChange={onFormatChange}
            isTextSelected={isTextSelected}
            presentation={presentation}
            onCut={onCut}
            onCopy={onCopy}
            onPaste={onPaste}
            hasSelection={!!selectedElement}
            canPaste={canPaste}
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
          <SlideShowTab
            onOpenPreviewFromBeginning={onOpenPreviewFromBeginning}
            onOpenPreviewFromCurrent={onOpenPreviewFromCurrent}
          />
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
