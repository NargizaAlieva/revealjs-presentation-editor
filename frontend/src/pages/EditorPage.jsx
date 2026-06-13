import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useEditorState } from "../hooks/useEditorState";
import { useSlides } from "../hooks/useSlides";
import { useEditorActions } from "../hooks/useEditorActions";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import { exportToReveal } from "../core/export/exportToReveal";
import StatusBar from "../components/StatusBar";
import { getSlideSize } from "../utils/slidesetRenderUtils";

export default function EditorPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [previewEffect, setPreviewEffect] = useState(null);

  const { state, eventBus } = useEditorState();
  const { presentation, slides, selectedSlide, selectedSlideIndex } =
    useSlides(state);

  const {
    setSelectedSlideId,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,
    savePresentation,
    resetPresentation,
    updateTextElementContent,
    updateElementPosition,
    updateElementSize,
    updateTextElementFormatting,
    addMedia,
    updateElement,
    updateMedia,
    deleteElement,
    toggleSlideHidden,
    deleteMedia,
    updateSlideNotes,
    updateMasterTheme,
    updateMasterDimensions,
    updateSlideTransition,
    updateTransitionDuration,
    applyTransitionToAll,
    addAnimation,
    updateAnimation,
    deleteAnimation,
  } = useEditorActions(eventBus, selectedSlideIndex, slides.length);

  const exportPresentation = () => {
    exportToReveal(presentation);
  };

  const triggerAnimationPreview = (elementId, effect, speed) => {
    setPreviewEffect({
      type: "animation",
      elementId,
      effect,
      speed,
      key: Date.now(),
    });
  };

  const triggerTransitionPreview = (effect) => {
    setPreviewEffect({ type: "transition", effect, key: Date.now() });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      addMedia({
        id: crypto.randomUUID(),
        "file-link": reader.result,
        "media-type": "image",
        position: { x: 60, y: 60 },
        width: 300,
        height: 200,
        rotation: 0,
        "z-index": 1,
        scale: 1,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const [zoom, setZoom] = useState(70);
  const [showNotes, setShowNotes] = useState(true);

  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(25, z - 10));
  const handleCanvasZoom = (delta) => {
    setZoom((currentZoom) => Math.min(200, Math.max(25, currentZoom + delta)));
  };

  const [selectedElementId, setSelectedElementId] = useState(null);

  const selectedElement = (() => {
    if (!selectedElementId) return null;
    const textEl = (selectedSlide?.contents?.text ?? []).find(
      (t) => t.id === selectedElementId,
    );
    if (textEl)
      return {
        id: textEl.id,
        label: textEl.paragraphs?.[0]?.runs?.[0]?.text || "Text",
      };
    const mediaEl = (selectedSlide?.contents?.media ?? []).find(
      (m) => m.id === selectedElementId,
    );
    if (mediaEl) return { id: mediaEl.id, label: "Image" };
    return null;
  })();

  const { width: slideWidth, height: slideHeight } = getSlideSize(presentation);

  return (
    <div className="editor-page" onDoubleClick={() => setShowUI(false)}>
      {!showUI && (
        <div
          className="ui-toggle-strip"
          onClick={(e) => {
            e.stopPropagation();
            setShowUI(true);
          }}
        />
      )}

      {showUI && (
        <div
          className="toolbar-overlay"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <Toolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlide}
            onDuplicateSlide={duplicateSlide}
            onMoveSlideUp={moveSlideUp}
            onMoveSlideDown={moveSlideDown}
            onSavePresentation={savePresentation}
            onExportPresentation={exportPresentation}
            onOpenPreview={() => setIsPreviewOpen(true)}
            canDelete={slides.length > 1}
            canMoveUp={selectedSlideIndex > 0}
            canMoveDown={selectedSlideIndex < slides.length - 1}
            onResetPresentation={resetPresentation}
            onImageUpload={handleImageUpload}
            onToggleSlideHidden={() => toggleSlideHidden(selectedSlideIndex)}
            isSlideHidden={selectedSlide?.hidden}
            onTransitionChange={updateSlideTransition}
            currentTransition={selectedSlide?.contents?.transition ?? "none"}
            currentDuration={
              selectedSlide?.contents?.transitionDuration ?? 0.75
            }
            onDurationChange={updateTransitionDuration}
            onApplyTransitionToAll={() =>
              applyTransitionToAll(
                selectedSlide?.contents?.transition ?? "none",
                selectedSlide?.contents?.transitionDuration ?? 0.75,
              )
            }
            selectedElement={selectedElement}
            animations={selectedSlide?.contents?.animations ?? []}
            onAddAnimation={addAnimation}
            onUpdateAnimation={updateAnimation}
            onDeleteAnimation={deleteAnimation}
            onAnimationPreview={triggerAnimationPreview}
            onTransitionPreview={triggerTransitionPreview}
            onPreviewEffect={setPreviewEffect}
          />
        </div>
      )}

      <div className="editor-body">
        <SlideList
          slides={slides}
          selectedSlideId={selectedSlideIndex}
          onSelectSlide={setSelectedSlideId}
          slideWidth={slideWidth}
          slideHeight={slideHeight}
        />

        <div className="editor-main">
          {selectedSlide && (
            <EditorCanvas
              slide={selectedSlide}
              presentation={presentation}
              onChangeTextElement={updateTextElementContent}
              onMoveTextElement={updateElementPosition}
              onResizeTextElement={updateElementSize}
              onFormatTextElement={updateTextElementFormatting}
              onMoveMediaElement={updateElementPosition}
              onResizeMediaElement={updateElementSize}
              onDeleteTextElement={deleteElement}
              onDeleteMedia={deleteMedia}
              slideNotes={selectedSlide?.contents?.notes ?? ""}
              onUpdateSlideNotes={updateSlideNotes}
              zoom={zoom}
              showNotes={showNotes}
              onCanvasZoom={handleCanvasZoom}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              updateElement={updateElement}
              updateMedia={updateMedia}
              previewEffect={previewEffect}
              animations={selectedSlide?.contents?.animations ?? []}
              showAnimationBadges={activeTab === "Animations"}
            />
          )}
        </div>
      </div>

      {showUI && (
        <div
          className="statusbar-overlay"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <StatusBar
            selectedSlideIndex={selectedSlideIndex}
            totalSlides={slides.length}
            zoom={zoom}
            onZoomChange={setZoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            showNotes={showNotes}
            onToggleNotes={() => setShowNotes((v) => !v)}
          />
        </div>
      )}

      {isPreviewOpen && (
        <PreviewModal
          slides={slides}
          presentation={presentation}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
