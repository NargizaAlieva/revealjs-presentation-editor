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
    addAnimation,
    updateAnimation,
    deleteAnimation,
  } = useEditorActions(eventBus, selectedSlideIndex, slides.length);

  const exportPresentation = () => {
    exportToReveal(presentation);
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

  const [selectedElementId, setSelectedElementId] = useState(null);

  const selectedElement = (() => {
    if (!selectedElementId) return null;

    const textEl = (selectedSlide?.contents?.text ?? []).find(
      (t) => t.id === selectedElementId
    );
    if (textEl) {
      return {
        id: textEl.id,
        label: textEl.paragraphs?.[0]?.runs?.[0]?.text || "Text",
      };
    }

    const mediaEl = (selectedSlide?.contents?.media ?? []).find(
      (m) => m.id === selectedElementId
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
        selectedElement={selectedElement}
        animations={selectedSlide?.contents?.animations ?? []}
        onAddAnimation={addAnimation}
        onUpdateAnimation={updateAnimation}
        onDeleteAnimation={deleteAnimation}
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
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
            />
          )}
        </div>

        <GlobalSettingsPanel
          presentation={presentation}
          updateMasterDimensions={updateMasterDimensions}
          updateSlideTransition={updateSlideTransition}
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
    </div>
  );
}
