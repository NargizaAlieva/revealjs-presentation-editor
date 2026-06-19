import { useState, useRef } from "react";
import "./Toolbar.css";
import FileTab from "./toolbar/FileTab";
import HomeTab from "./toolbar/HomeTab";
import InsertTab from "./toolbar/InsertTab";
import TransitionsTab from "./toolbar/TransitionsTab";
import AnimationsTab from "./toolbar/AnimationsTab";
import SlideShowTab from "./toolbar/SlideShowTab";
import DesignTab from "./toolbar/DesignTab";
import ViewTab from "./toolbar/ViewTab";
import { SlideMasterRibbon } from "./SlideMasterView";

const BASE_TABS = [
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
  onResetLayout,

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

  onAddTextElement,
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
  onApplyTheme,
  onApplyFont,
  onUpdateDimensions,
  currentView,
  onChangeView,
  showNotes,
  onToggleNotes,
  onOpenSlideMaster,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomChange,

  isSlideMasterOpen,
  onCloseSlideMaster,
  masterName,
  onRenameMaster,
  selectedMasterLayoutId,
  onRenameLayout,
  onDeleteLayout,
  onAddLayoutPlaceholder,
  onRemoveLayoutPlaceholder,
  onAddMasterElement,
  onDeleteMasterElement,
}) {
  const [localActiveTab, setLocalActiveTab] = useState("Home");
  const [masterActiveTab, setMasterActiveTab] = useState("Slide Master");
  const prevMasterOpen = useRef(false);

  if (isSlideMasterOpen && !prevMasterOpen.current) {
    setMasterActiveTab("Slide Master");
  }
  prevMasterOpen.current = isSlideMasterOpen;

  const currentTab = isSlideMasterOpen ? masterActiveTab : (activeTab ?? localActiveTab);

  const setCurrentTab = (tab) => {
    if (isSlideMasterOpen) {
      setMasterActiveTab(tab);
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalActiveTab(tab);
  };

  const TABS = isSlideMasterOpen
    ? ["File", "Slide Master", "Home", "Insert", "Transitions", "Animations", "View"]
    : BASE_TABS;

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

        {currentTab === "Slide Master" && (
          <SlideMasterRibbon
            onClose={onCloseSlideMaster}
            presentation={presentation}
            onApplyTheme={onApplyTheme}
            onApplyFont={onApplyFont}
            onUpdateDimensions={onUpdateDimensions}
            masterName={masterName}
            onRenameMaster={onRenameMaster}
            selectedMasterLayoutId={selectedMasterLayoutId}
            onRenameLayout={onRenameLayout}
            onDeleteLayout={onDeleteLayout}
            onAddLayoutPlaceholder={onAddLayoutPlaceholder}
            onRemoveLayoutPlaceholder={onRemoveLayoutPlaceholder}
            onAddMasterElement={onAddMasterElement}
            onDeleteMasterElement={onDeleteMasterElement}
            onAddTextElement={onAddTextElement}
            onImageUpload={onImageUpload}
            onVideoUpload={onVideoUpload}
          />
        )}

        {currentTab === "Home" && (
          <HomeTab
            onAddSlide={onAddSlide}
            onApplyLayout={onApplyLayout}
            onResetLayout={onResetLayout}
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
            onAddSlide={onAddSlide}
            onAddTextElement={onAddTextElement}
            presentation={presentation}
          />
        )}

        {currentTab === "Design" && (
          <DesignTab
            presentation={presentation}
            onApplyTheme={onApplyTheme}
            onApplyFont={onApplyFont}
            onUpdateDimensions={onUpdateDimensions}
          />
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
          <ViewTab
            currentView={currentView}
            onChangeView={(view) => {
              if (isSlideMasterOpen) onCloseSlideMaster?.();
              onChangeView(view);
            }}
            showNotes={showNotes}
            onToggleNotes={onToggleNotes}
            onOpenSlideMaster={onOpenSlideMaster}
            isSlideMasterOpen={isSlideMasterOpen}
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onZoomChange={onZoomChange}
          />
        )}
      </div>
    </header>
  );
}