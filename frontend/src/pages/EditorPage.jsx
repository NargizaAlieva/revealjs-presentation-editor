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
import GlobalSettingsPanel from "../components/GlobalSettingsPanel";
import StatusBar from "../components/StatusBar";

export default function EditorPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const [previewEffect, setPreviewEffect] = useState(null);

  const triggerAnimationPreview = (elementId, effect, speed) => {
    setPreviewEffect({ type: "animation", elementId, effect, speed, key: Date.now() });
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

  const [zoom, setZoom] = useState(100);
  const [showNotes, setShowNotes] = useState(true);

  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(25, z - 10));
  const handleCanvasZoom = (delta) => {
    setZoom((currentZoom) => {
      const nextZoom = currentZoom + delta;
      return Math.min(200, Math.max(25, nextZoom));
    });
  };

  const [selectedElementId, setSelectedElementId] = useState(null);

  const selectedElement = (() => {
    if (!selectedElementId) return null;

    const textEl = (selectedSlide?.contents?.text ?? []).find(
      (t) => t.id === selectedElementId,
    );
    if (textEl) {
      return {
        id: textEl.id,
        label: textEl.paragraphs?.[0]?.runs?.[0]?.text || "Text",
      };
    }

    const mediaEl = (selectedSlide?.contents?.media ?? []).find(
      (m) => m.id === selectedElementId,
    );
    if (mediaEl) return { id: mediaEl.id, label: "Image" };

    return null;
  })();

  return (
    <div className="editor-page">
      <Toolbar
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
        currentDuration={selectedSlide?.contents?.transitionDuration ?? 0.75}
        onDurationChange={updateTransitionDuration}
        onApplyTransitionToAll={() =>
          applyTransitionToAll(
            selectedSlide?.contents?.transition ?? "none",
            selectedSlide?.contents?.transitionDuration ?? 0.75
          )
        }
        selectedElement={selectedElement}
        animations={selectedSlide?.contents?.animations ?? []}
        onAddAnimation={addAnimation}
        onUpdateAnimation={updateAnimation}
        onDeleteAnimation={deleteAnimation}
        onAnimationPreview={triggerAnimationPreview}
        onTransitionPreview={triggerTransitionPreview}
      />

      <div className="editor-body">
        <SlideList
          slides={slides}
          selectedSlideId={selectedSlideIndex}
          onSelectSlide={setSelectedSlideId}
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
              previewEffect={previewEffect}
              animations={selectedSlide?.contents?.animations ?? []}
            />
          )}
        </div>

        <GlobalSettingsPanel
          presentation={presentation}
          updateMasterDimensions={updateMasterDimensions}
          updateMasterTheme={updateMasterTheme}
        />
      </div>

      {isPreviewOpen && (
        <PreviewModal
          slides={slides}
          presentation={presentation}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

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
  );
}