import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import PreviewModal from "../components/PreviewModal";
import StatusBar from "../components/StatusBar";
import { useVideoUpload } from "../hooks/useVideoUpload";

import { useEditorState } from "../hooks/useEditorState";
import { useSlides } from "../hooks/useSlides";
import { useEditorActions } from "../hooks/useEditorActions";
import { useEditorViewState } from "../hooks/useEditorViewState";
import { useImageUpload } from "../hooks/useImageUpload";

import { exportToReveal } from "../core/export/exportToReveal";
import { getSlideSize } from "../utils/slidesetRenderUtils";
import "./EditorPage.css";

export default function EditorPage() {
  const { state, eventBus, isLoading } = useEditorState();
  const {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
    selectedElement,
  } = useSlides(state);
  const actions = useEditorActions(eventBus, selectedSlideIndex, slides.length);
  const view = useEditorViewState();
  const { handleImageUpload } = useImageUpload(actions.addMedia);
  const { handleVideoUpload } = useVideoUpload(actions.addMedia);  

  const { width: slideWidth, height: slideHeight } = getSlideSize(presentation);
  const currentTransition = selectedSlide?.contents?.transition ?? "none";
  const currentDuration = selectedSlide?.contents?.transitionDuration ?? 0.75;

  if (isLoading) return <div className="editor-loading">Loading...</div>;

  return (
    <div className="editor-page" onDoubleClick={view.closeUI}>
      {!view.showUI && (
        <div
          className="ui-toggle-strip"
          onClick={(e) => {
            e.stopPropagation();
            view.openUI();
          }}
        />
      )}

      {view.showUI && (
        <div
          className="toolbar-overlay"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <Toolbar
            presentationTitle={presentation?.slideset?.title}
            activeTab={view.activeTab}
            onTabChange={view.setActiveTab}
            onAddSlide={actions.addSlide}
            onApplyLayout={actions.applyLayout}
            onDeleteSlide={actions.deleteSlide}
            onDuplicateSlide={actions.duplicateSlide}
            onMoveSlideUp={actions.moveSlideUp}
            onMoveSlideDown={actions.moveSlideDown}
            onSavePresentation={actions.savePresentation}
            onExportPresentation={() => exportToReveal(presentation)}
            onOpenPreview={view.openPreview}
            canDelete={slides.length > 1}
            canMoveUp={selectedSlideIndex > 0}
            canMoveDown={selectedSlideIndex < slides.length - 1}
            onResetPresentation={actions.resetPresentation}
            onImageUpload={handleImageUpload}
            onToggleSlideHidden={() =>
              actions.toggleSlideHidden(selectedSlideIndex)
            }
            isSlideHidden={selectedSlide?.hidden}
            onTransitionChange={(transition) =>
              actions.updateSlideTransition(transition, currentDuration)
            }
            currentTransition={currentTransition}
            currentDuration={currentDuration}
            onDurationChange={(duration) =>
              actions.updateSlideTransition(currentTransition, duration)
            }
            onApplyTransitionToAll={() =>
              actions.applyTransitionToAll(currentTransition, currentDuration)
            }
            selectedElement={selectedElement}
            animations={selectedSlide?.contents?.animations ?? []}
            onAddAnimation={actions.addAnimation}
            onUpdateAnimation={actions.updateAnimation}
            onDeleteAnimation={actions.deleteAnimation}
            onAnimationPreview={view.triggerAnimationPreview}
            onTransitionPreview={view.triggerTransitionPreview}
            onPreviewEffect={view.setPreviewEffect}
            onVideoUpload={handleVideoUpload}
          />
        </div>
      )}

      <div className="editor-body">
        <SlideList
          slides={slides}
          selectedSlideId={selectedSlideIndex}
          onSelectSlide={actions.setSelectedSlideId}
          slideWidth={slideWidth}
          slideHeight={slideHeight}
        />

        <div className="editor-main">
          {selectedSlide && (
            <EditorCanvas
              slide={selectedSlide}
              presentation={presentation}
              onChangeTextElement={actions.updateTextElementContent}
              onMoveTextElement={actions.updateElementPosition}
              onResizeTextElement={actions.updateElementSize}
              onFormatTextElement={actions.updateTextElementFormatting}
              onMoveMediaElement={actions.updateElementPosition}
              onResizeMediaElement={actions.updateElementSize}
              onDeleteTextElement={actions.deleteElement}
              onDeleteMedia={actions.deleteMedia}
              slideNotes={selectedSlide?.contents?.notes ?? ""}
              onUpdateSlideNotes={actions.updateSlideNotes}
              zoom={view.zoom}
              showNotes={view.showNotes}
              onCanvasZoom={view.handleCanvasZoom}
              selectedElementId={selectedElementId}
              onSelectElement={actions.selectElement}
              onBeginHistory={actions.beginHistory}
              onCommitHistory={actions.commitHistory}
              onCancelHistory={actions.cancelHistory}
              updateElement={actions.updateElement}
              updateMedia={actions.updateMedia}
              previewEffect={view.previewEffect}
              animations={selectedSlide?.contents?.animations ?? []}
              showAnimationBadges={view.activeTab === "Animations"}
              onUndo={actions.undo}
              onRedo={actions.redo}
              onCopy={actions.copyElement}
              onPaste={actions.pasteElement}
            />
          )}
        </div>
      </div>

      {view.showUI && (
        <div
          className="statusbar-overlay"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <StatusBar
            selectedSlideIndex={selectedSlideIndex}
            totalSlides={slides.length}
            zoom={view.zoom}
            onZoomChange={view.setZoom}
            onZoomIn={view.zoomIn}
            onZoomOut={view.zoomOut}
            showNotes={view.showNotes}
            onToggleNotes={view.toggleNotes}
          />
        </div>
      )}

      {view.isPreviewOpen && (
        <PreviewModal
          slides={slides}
          presentation={presentation}
          onClose={view.closePreview}
        />
      )}
    </div>
  );
}