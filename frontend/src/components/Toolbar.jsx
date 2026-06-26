import { useState, useRef,useEffect } from "react";
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
import PictureFormatTab from "./toolbar/PictureFormatTab";
import { MdPlayArrow, MdSave } from "react-icons/md";

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
  onAddAnimationForElement,
  onUpdateAnimation,
  onReorderAnimation,
  onDeleteAnimation,
  onAnimationPreview,
  layouts,
  onApplyBackground,
  onApplySlideBackground,
  onApplyBgFillImage,
  onRemoveBgFillImage,
  onUpdateBgFillSettings,
  onApplyBackgroundToAll,
  activeTab,
  onTabChange,
  onBeginHistory,
  onCommitHistory,

  onAddTextElement,
  currentFormatting,
  onFormatChange,
  onChangeCase,
  isTextSelected,
  presentation,
  onNewPresentation,
  onOpenPresentation,
  onCut,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  canPaste,
  canUndo,
  canRedo,
  onFind,
  onReplace,
  onSelectAll,
  onSelectObjects,
  onOpenSelectionPane,
  objectSelectionMode,
  onApplyTheme,
  onApplyFont,
  onApplyLayoutFont,
  onUpdateDimensions,
  onApplyBackgroundImage,
  onRemoveBackgroundImage,
  onUpdateBackgroundImagePosition,
  onUpdateBackgroundImageScale,
  selectedSlide,
  currentView,
  onChangeView,
  showNotes,
  onToggleNotes,
  onOpenSlideMaster,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomChange,
  selectedHyperlinkText,
  onHyperlink,
  onNewComment,

  selectedMediaElement,
  onUpdateSelectedMedia,
  onCropSelectedMedia,
  onBringForward,
  onSendBackward,
  onChangePicture,
  onPreviewMediaEffects,
  onPreviewMediaStyle,

  isSlideMasterOpen,
  onCloseSlideMaster,
  masterName,
  onRenameMaster,
  selectedMasterLayoutId,
  onInsertLayout,
  onRenameLayout,
  onDeleteLayout,
  onAddLayoutPlaceholder,
  onRemoveLayoutPlaceholder,
  onAddMasterElement,
  onDeleteMasterElement,
  onToggleTitle,
  onToggleFooters,
}) {
  const [localActiveTab, setLocalActiveTab] = useState("Home");
  const [masterActiveTab, setMasterActiveTab] = useState("Slide Master");
  const prevMasterOpen = useRef(false);

useEffect(() => {
  if (isSlideMasterOpen && !prevMasterOpen.current) {
    setMasterActiveTab("Slide Master");
  }
  prevMasterOpen.current = isSlideMasterOpen;
}, [isSlideMasterOpen]);

  const currentTab = isSlideMasterOpen
    ? masterActiveTab
    : (activeTab ?? localActiveTab);

  const setCurrentTab = (tab) => {
    if (isSlideMasterOpen) {
      setMasterActiveTab(tab);
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalActiveTab(tab);
  };

  const hasPictureFormat = !!selectedMediaElement;
  const TABS = isSlideMasterOpen
    ? hasPictureFormat
      ? ["File", "Slide Master", "Home", "Insert", "Transitions", "Animations", "View", "Picture Format"]
      : ["File", "Slide Master", "Home", "Insert", "Transitions", "Animations", "View"]
    : hasPictureFormat
      ? [...BASE_TABS, "Picture Format"]
      : BASE_TABS;

  return (
    <header className="toolbar">
      <nav className="toolbar-tabs">
        <div className="toolbar-quick-actions" aria-label="Quick actions">
          <button
            type="button"
            className="toolbar-quick-action"
            onClick={onSavePresentation}
            title="Save"
          >
            <MdSave />
            <span>Save</span>
          </button>
          <button
            type="button"
            className="toolbar-quick-action"
            onClick={onOpenPreviewFromBeginning}
            title="Start the show from the first slide"
          >
            <MdPlayArrow />
            <span>Start</span>
          </button>
        </div>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={[
              "toolbar-tab",
              currentTab === tab ? "active" : "",
              tab === "Picture Format" ? "toolbar-tab--contextual" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => setCurrentTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div
        className="toolbar-ribbon"
        onMouseDownCapture={(e) => {
          const tag = e.target.tagName;
          if (tag !== "SELECT" && tag !== "INPUT" && tag !== "TEXTAREA")
            e.preventDefault();
        }}
      >
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
            onApplyBackground={onApplyBackground}
            onApplyFont={onApplyFont}
            onApplyLayoutFont={onApplyLayoutFont}
            onUpdateDimensions={onUpdateDimensions}
            masterName={masterName}
            onRenameMaster={onRenameMaster}
            selectedMasterLayoutId={selectedMasterLayoutId}
            onInsertLayout={onInsertLayout}
            onRenameLayout={onRenameLayout}
            onDeleteLayout={onDeleteLayout}
            onAddLayoutPlaceholder={onAddLayoutPlaceholder}
            onRemoveLayoutPlaceholder={onRemoveLayoutPlaceholder}
            onAddMasterElement={onAddMasterElement}
            onDeleteMasterElement={onDeleteMasterElement}
            onToggleTitle={onToggleTitle}
            onToggleFooters={onToggleFooters}
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
            onChangeCase={onChangeCase}
            isTextSelected={isTextSelected}
            presentation={presentation}
            onCut={onCut}
            onCopy={onCopy}
            onPaste={onPaste}
            onUndo={onUndo}
            onRedo={onRedo}
            hasSelection={!!selectedElement}
            canPaste={canPaste}
            canUndo={canUndo}
            canRedo={canRedo}
            onFind={onFind}
            onReplace={onReplace}
            onSelectAll={onSelectAll}
            onSelectObjects={onSelectObjects}
            onOpenSelectionPane={onOpenSelectionPane}
            objectSelectionMode={objectSelectionMode}
          />
        )}

        {currentTab === "Insert" && (
          <InsertTab
            onImageUpload={onImageUpload}
            onVideoUpload={onVideoUpload}
            onAddSlide={onAddSlide}
            onAddTextElement={onAddTextElement}
            layouts={layouts}
            onApplyBackgroundImage={onApplyBackgroundImage}
            onRemoveBackgroundImage={onRemoveBackgroundImage}
            onUpdateBackgroundImagePosition={onUpdateBackgroundImagePosition}
            onUpdateBackgroundImageScale={onUpdateBackgroundImageScale}
            currentBgImage={selectedSlide?.contents?.["background-image"] ?? null}
            currentBgPosition={selectedSlide?.contents?.["background-image-position"] ?? "center center"}
            currentBgScale={selectedSlide?.contents?.["background-image-scale"] ?? 100}
            selectedSlide={selectedSlide}
            presentation={presentation}
            onApplyBackground={onApplyBackground}
            onApplySlideBackground={onApplySlideBackground}
            onApplyBgFillImage={onApplyBgFillImage}
            onRemoveBgFillImage={onRemoveBgFillImage}
            onUpdateBgFillSettings={onUpdateBgFillSettings}
            onApplyBackgroundToAll={onApplyBackgroundToAll}
            isSlideMasterOpen={isSlideMasterOpen}
            selectedElement={selectedElement}
            selectedHyperlinkText={selectedHyperlinkText}
            onHyperlink={onHyperlink}
            onNewComment={onNewComment}
          />
        )}

        {currentTab === "Design" && (
          <DesignTab
            presentation={presentation}
            onApplyTheme={onApplyTheme}
            onApplyFont={onApplyFont}
            onUpdateDimensions={onUpdateDimensions}
            onApplyBackgroundImage={onApplyBackgroundImage}
            onRemoveBackgroundImage={onRemoveBackgroundImage}
            onApplyBackground={onApplyBackground}
            onApplySlideBackground={onApplySlideBackground}
            onApplyBgFillImage={onApplyBgFillImage}
            onRemoveBgFillImage={onRemoveBgFillImage}
            onUpdateBgFillSettings={onUpdateBgFillSettings}
            onApplyBackgroundToAll={onApplyBackgroundToAll}
            selectedSlide={selectedSlide}
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
            onAddAnimationForElement={onAddAnimationForElement}
            onUpdateAnimation={onUpdateAnimation}
            onReorderAnimation={onReorderAnimation}
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

        {currentTab === "Picture Format" && (
          <PictureFormatTab
            media={selectedMediaElement}
            onUpdate={onUpdateSelectedMedia}
            onCrop={onCropSelectedMedia}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            onChangePicture={onChangePicture}
            onPreviewEffects={onPreviewMediaEffects}
            onPreviewStyle={onPreviewMediaStyle}
            onBeginHistory={onBeginHistory}
            onCommitHistory={onCommitHistory}
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
