import { useNavigate } from "react-router-dom";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import CommentsPanel from "../components/CommentsPanel";
import SlideSorterView from "../components/SlideSorterView";
import OutlineView from "../components/OutlineView";
import FileMenu from "../components/FileMenu";
import NotesPageView from "../components/NotesPageView";
import SlideMasterView from "../components/SlideMasterView";
import StatusBar from "../components/StatusBar";
import FindReplaceDialog from "../components/FindReplaceDialog";
import SelectionPane from "../components/SelectionPane";
import { useEditorController } from "../hooks/useEditorController";

export default function EditorPage() {
  const navigate = useNavigate();
  const ctrl = useEditorController();

  if (ctrl.isLoading) {
    return <div className="editor-loading">Loading...</div>;
  }

  if (ctrl.activeTab === "File") {
    return (
      <FileMenu
        presentationTitle={ctrl.presentationTitle}
        onClose={() => ctrl.setActiveTab("Home")}
        onGoHome={() => navigate("/")}
        onNew={ctrl.handleNew}
        onSave={ctrl.savePresentation}
        onSaveAs={ctrl.handleSaveAs}
        onExport={ctrl.exportPresentation}
        onExportZip={ctrl.handleExportZip}
        onLoadFile={ctrl.handleLoadFile}
        onDelete={ctrl.handleDeleteAndGoHome}
      />
    );
  }

  return (
    <div className="editor-page">
      <div className="toolbar-overlay">
        <Toolbar
          activeTab={ctrl.activeTab}
          onTabChange={ctrl.setActiveTab}
          onAddSlide={ctrl.addSlide}
          onDeleteSlide={ctrl.deleteSlide}
          onDuplicateSlide={ctrl.duplicateSlide}
          onMoveSlideUp={ctrl.moveSlideUp}
          onMoveSlideDown={ctrl.moveSlideDown}
          onSavePresentation={ctrl.savePresentation}
          onExportPresentation={ctrl.exportPresentation}
          onOpenPreviewFromBeginning={ctrl.handleOpenPreviewFromBeginning}
          onOpenPreviewFromCurrent={ctrl.handleOpenPreviewFromCurrent}
          canDelete={ctrl.slides.length > 1}
          canMoveUp={ctrl.selectedSlideIndex > 0}
          canMoveDown={ctrl.selectedSlideIndex < ctrl.slides.length - 1}
          onResetPresentation={ctrl.resetPresentation}
          onImageUpload={ctrl.activeImageUpload}
          onVideoUpload={ctrl.activeVideoUpload}
          onAddTextElement={ctrl.activeAddTextElement}
          onToggleSlideHidden={ctrl.handleToggleSlideHidden}
          isSlideHidden={ctrl.selectedSlide?.hidden}
          onTransitionChange={ctrl.updateSlideTransition}
          currentTransition={ctrl.currentTransition}
          currentDuration={ctrl.currentDuration}
          onDurationChange={ctrl.updateTransitionDuration}
          onApplyTransitionToAll={ctrl.handleApplyTransitionToAll}
          selectedElement={ctrl.selectedElement}
          animations={ctrl.selectedSlide?.contents?.animations ?? []}
          onAddAnimationForElement={ctrl.addAnimationForElement}
          onUpdateAnimation={ctrl.updateAnimation}
          onReorderAnimation={ctrl.reorderAnimations}
          onDeleteAnimation={ctrl.deleteAnimation}
          onAnimationPreview={ctrl.triggerAnimationPreview}
          onTransitionPreview={ctrl.triggerTransitionPreview}
          onPreviewEffect={ctrl.setPreviewEffect}
          onApplyLayout={ctrl.applyLayout}
          onResetLayout={ctrl.resetLayout}
          currentFormatting={ctrl.currentFormatting}
          onFormatChange={ctrl.handleFormatChange}
          onChangeCase={ctrl.handleChangeCase}
          onTextOverflowChange={ctrl.handleTextOverflowChange}
          selectedTextOverflow={ctrl.selectedTextEl?.overflow ?? ctrl.masterSelectedTextEl?.overflow ?? "auto-fit"}
          isTextSelected={
            !!(ctrl.isSlideMasterOpen
              ? ctrl.masterSelectedTextEl
              : ctrl.selectedTextEl)
          }
          presentation={ctrl.presentation}
          onCut={ctrl.handleCut}
          onCopy={ctrl.handleCopy}
          onPaste={ctrl.handlePaste}
          onUndo={ctrl.undo}
          onRedo={ctrl.redo}
          canPaste={!!ctrl.state.clipboard}
          canUndo={ctrl.state.past.length > 0}
          canRedo={ctrl.state.future.length > 0}
          onFind={ctrl.openFind}
          onReplace={ctrl.openReplace}
          onSelectAll={ctrl.handleSelectAll}
          onSelectObjects={ctrl.handleSelectObjects}
          onOpenSelectionPane={() => ctrl.setShowSelectionPane(true)}
          objectSelectionMode={ctrl.objectSelectionMode}
          onApplyTheme={ctrl.updateMasterTheme}
          onApplyFont={ctrl.updateMasterFormatting}
          onApplyLayoutFont={ctrl.applyLayoutFont}
          onUpdateDimensions={ctrl.handleUpdateDimensions}
          onApplyBackground={ctrl.handleApplyBackground}
          onApplyBackgroundImage={ctrl.handleApplyBackgroundImage}
          onRemoveBackgroundImage={ctrl.handleRemoveBackgroundImage}
          onUpdateBackgroundImagePosition={ctrl.handleUpdateBackgroundImagePosition}
          onUpdateBackgroundImageScale={ctrl.handleUpdateBackgroundImageScale}
          selectedSlide={ctrl.selectedSlide}
          layouts={ctrl.layouts}
          currentView={ctrl.currentView}
          onChangeView={ctrl.setCurrentView}
          showNotes={ctrl.showNotes}
          onToggleNotes={ctrl.toggleNotes}
          zoom={ctrl.zoom}
          onZoomIn={ctrl.zoomIn}
          onZoomOut={ctrl.zoomOut}
          onZoomChange={ctrl.setZoom}
          onOpenSlideMaster={() => ctrl.setIsSlideMasterOpen(true)}
          isSlideMasterOpen={ctrl.isSlideMasterOpen}
          onCloseSlideMaster={() => ctrl.setIsSlideMasterOpen(false)}
          masterName={ctrl.masterName}
          onRenameMaster={ctrl.setMasterName}
          selectedMasterLayoutId={ctrl.selectedMasterLayoutId}
          onInsertLayout={ctrl.addLayout}
          onRenameLayout={ctrl.renameLayout}
          onDeleteLayout={ctrl.deleteLayout}
          onAddLayoutPlaceholder={ctrl.addLayoutPlaceholder}
          onRemoveLayoutPlaceholder={ctrl.removeLayoutPlaceholder}
          onAddMasterElement={ctrl.addMasterElement}
          onDeleteMasterElement={ctrl.deleteMasterElement}
          onToggleTitle={ctrl.toggleTitle}
          onToggleFooters={ctrl.toggleFooters}
          selectedMediaElement={ctrl.selectedMediaElement}
          onUpdateSelectedMedia={(updates) =>
            ctrl.selectedMediaElement && ctrl.updateMedia(ctrl.selectedMediaElement.id, updates)
          }
          onCropSelectedMedia={ctrl.triggerCrop}
          onBringForward={ctrl.handleBringForward}
          onSendBackward={ctrl.handleSendBackward}
          onChangePicture={ctrl.handleChangePicture}
          onPreviewMediaEffects={ctrl.setPreviewMediaEffects}
          onPreviewMediaStyle={ctrl.setPreviewMediaStyleId}
        />
      </div>

      <div className="editor-body">
        {ctrl.isSlideMasterOpen ? (
          <SlideMasterView
            presentation={ctrl.presentation}
            activeMasterSlide={ctrl.activeMasterSlide}
            selectedMasterLayoutId={ctrl.selectedMasterLayoutId}
            onSelectedLayoutChange={ctrl.setSelectedMasterLayoutId}
            selectedMasterElementId={ctrl.selectedMasterElementId}
            onSelectMasterElement={ctrl.setSelectedMasterElementId}
            onSaveSelection={ctrl.handleMasterSaveSelection}
            onMasterViewChangeText={ctrl.masterViewChangeText}
            onMasterViewChangeParagraphs={ctrl.masterViewChangeParagraphs}
            onMasterViewFormatText={ctrl.masterViewFormatText}
            onMasterViewMoveText={ctrl.masterViewMoveText}
            onMasterViewResizeText={ctrl.masterViewResizeText}
            onMasterViewMoveMedia={ctrl.masterViewMoveMedia}
            onMasterViewResizeMedia={ctrl.masterViewResizeMedia}
            onMasterViewAutoFitText={ctrl.masterViewAutoFitText}
            onMasterViewAutoFitMedia={ctrl.masterViewAutoFitMedia}
            onMasterViewDeleteText={ctrl.masterViewDeleteText}
            onMasterViewDeleteMedia={ctrl.masterViewDeleteMedia}
            onBeginHistory={ctrl.beginHistory}
            onCommitHistory={ctrl.commitHistory}
            onCancelHistory={ctrl.cancelHistory}
            onUndo={ctrl.undo}
            onRedo={ctrl.redo}
          />
        ) : ctrl.currentView === "slide-sorter" ? (
          <SlideSorterView
            slides={ctrl.slides}
            selectedSlideIndex={ctrl.selectedSlideIndex}
            onSelectSlide={ctrl.setSelectedSlideId}
            presentation={ctrl.presentation}
          />
        ) : ctrl.currentView === "notes-page" ? (
          <NotesPageView
            slide={ctrl.selectedSlide}
            presentation={ctrl.presentation}
            slideNotes={ctrl.selectedSlide?.contents?.notes ?? ""}
            onUpdateSlideNotes={ctrl.updateSlideNotes}
            onBeginHistory={ctrl.beginHistory}
            onCommitHistory={ctrl.commitHistory}
          />
        ) : (
          <>
            {ctrl.currentView === "outline" ? (
              <OutlineView
                slides={ctrl.slides}
                selectedSlideIndex={ctrl.selectedSlideIndex}
                onSelectSlide={ctrl.setSelectedSlideId}
              />
            ) : (
              <SlideList
                slides={ctrl.slides}
                selectedSlideId={ctrl.selectedSlideIndex}
                onSelectSlide={ctrl.setSelectedSlideId}
                onReorderSlide={ctrl.reorderSlide}
                slideWidth={ctrl.slideWidth}
                slideHeight={ctrl.slideHeight}
                presentation={ctrl.presentation}
              />
            )}

            <div className="editor-main">
              {ctrl.selectedSlide && (
                <EditorCanvas
                  slide={ctrl.selectedSlide}
                  presentation={ctrl.presentation}
                  onChangeTextElement={ctrl.updateTextElementContent}
                  onChangeParagraphs={ctrl.handleChangeParagraphs}
                  onMoveTextElement={ctrl.handleMoveElement}
                  onResizeTextElement={ctrl.updateElementSize}
                  onFormatTextElement={ctrl.applyFormatting}
                  currentFormatting={ctrl.currentFormatting}
                  onFormatTextRangeElement={ctrl.updateTextRangeFormatting}
                  clearSelectionSignal={ctrl.clearSelectionSignal}
                  onSaveSelection={ctrl.handleSaveSelection}
                  onMoveMediaElement={ctrl.handleMoveElement}
                  onResizeMediaElement={ctrl.updateElementSize}
                  onDeleteTextElement={ctrl.deleteElement}
                  onDeleteMedia={ctrl.deleteMedia}
                  slideNotes={ctrl.selectedSlide?.contents?.notes ?? ""}
                  onUpdateSlideNotes={ctrl.updateSlideNotes}
                  zoom={ctrl.zoom}
                  showNotes={ctrl.showNotes}
                  onCanvasZoom={ctrl.handleCanvasZoom}
                  selectedElementId={ctrl.selectedElementId}
                  selectedElementIds={ctrl.selectedElementIds}
                  onSelectElement={ctrl.handleElementSelect}
                  onDeleteSelection={ctrl.handleDeleteSelection}
                  onSelectAll={ctrl.handleSelectAll}
                  objectSelectionMode={ctrl.objectSelectionMode}
                  onBeginHistory={ctrl.beginHistory}
                  onCommitHistory={ctrl.commitHistory}
                  onCancelHistory={ctrl.cancelHistory}
                  updateElement={ctrl.updateElement}
                  updateMedia={ctrl.updateMedia}
                  previewEffect={ctrl.previewEffect}
                  animations={ctrl.selectedSlide?.contents?.animations ?? []}
                  showAnimationBadges={ctrl.activeTab === "Animations"}
                  onUndo={ctrl.undo}
                  onRedo={ctrl.redo}
                  onCopy={ctrl.handleCopy}
                  onPaste={ctrl.handlePaste}
                  onPasteText={ctrl.handlePasteText}
                  onPastePicture={ctrl.handlePastePicture}
                  onCut={ctrl.handleCut}
                  onHyperlink={ctrl.handleHyperlink}
                  canHyperlink={ctrl.hasRealSelection}
                  canPaste={!!ctrl.state.clipboard}
                  canUndo={ctrl.state.past.length > 0}
                  canRedo={ctrl.state.future.length > 0}
                  onBringToFront={ctrl.handleBringToFront}
                  onBringForward={ctrl.handleBringForward}
                  onSendBackward={ctrl.handleSendBackward}
                  onSendToBack={ctrl.handleSendToBack}
                  onRotateRight={ctrl.handleRotateRight}
                  onNewComment={ctrl.handleNewComment}
                  onOpenPictureFormat={() => ctrl.setActiveTab("Picture Format")}
                  onUpdateBackgroundImagePosition={ctrl.handleUpdateBackgroundImagePosition}
                  cropSignal={ctrl.cropSignal}
                  previewMediaEffects={ctrl.previewMediaEffects}
                  previewMediaStyleId={ctrl.previewMediaStyleId}
                  onStartEditing={ctrl.handleStartEditing}
                  onStopEditing={ctrl.handleStopEditing}
                  pendingFormatting={ctrl.activePendingFormatting}
                  onClearPendingFormatting={() => ctrl.setPendingFormatting({})}
                  formatPainterClipboard={ctrl.state.formatPainterClipboard}
                  onFormatPainterCopy={ctrl.formatPainterCopy}
                  onFormatPainterPaste={ctrl.formatPainterPaste}
                />
              )}
            </div>

            {ctrl.showComments && (
              <CommentsPanel
                key={ctrl.composeSession}
                comments={ctrl.selectedSlide?.contents?.comments ?? []}
                authorName="User"
                onAdd={ctrl.addComment}
                onDelete={ctrl.deleteComment}
                onClose={() => ctrl.setShowComments(false)}
                autoCompose={ctrl.composeSession > 0}
              />
            )}

            {ctrl.showSelectionPane && (
              <SelectionPane
                slide={ctrl.selectedSlide}
                selectedElementId={ctrl.selectedElementId}
                selectedElementIds={ctrl.selectedElementIds}
                onSelectElement={ctrl.handleElementSelect}
                onSetVisibility={ctrl.handleSetElementsVisibility}
                onMoveLayer={ctrl.handleMoveSelectionLayer}
                onClose={() => ctrl.setShowSelectionPane(false)}
              />
            )}
          </>
        )}
      </div>

      <FindReplaceDialog
        mode={ctrl.findReplaceMode}
        controller={ctrl.findReplace}
        onClose={ctrl.findReplace.close}
      />

      <div className="statusbar-overlay">
        <StatusBar
          selectedSlideIndex={ctrl.selectedSlideIndex}
          totalSlides={ctrl.slides.length}
          zoom={ctrl.zoom}
          onZoomChange={ctrl.setZoom}
          onZoomIn={ctrl.zoomIn}
          onZoomOut={ctrl.zoomOut}
          showNotes={ctrl.showNotes}
          onToggleNotes={ctrl.toggleNotes}
          showComments={ctrl.showComments}
          onToggleComments={() => ctrl.setShowComments((visible) => !visible)}
          commentCount={ctrl.selectedSlide?.contents?.comments?.length ?? 0}
        />
      </div>

      {ctrl.isPreviewOpen && (
        <PreviewModal
          slides={ctrl.slides}
          presentation={ctrl.presentation}
          onClose={ctrl.closePreview}
          initialSlide={ctrl.previewStartSlide}
        />
      )}
    </div>
  );
}
