import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useSlides } from "../hooks/useSlides";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import { exportToReveal } from "../core/export/exportToReveal";

export default function EditorPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    setSelectedSlideId,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,
    savePresentation,
    resetPresentation,
    updateTextElementContent,
    updateTextElementPosition,
    updateTextElementSize,
    updateTextElementFormatting,
    addMedia,
  } = useSlides();

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
        position: { x: 10, y: 10 },
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

  return (
    <div className="editor-page">
      <SlideList
        slides={slides}
        selectedSlideId={selectedSlideIndex}
        onSelectSlide={setSelectedSlideId}
      />

      <div className="editor-main">
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
        />

        {selectedSlide && (
          <EditorCanvas
            slide={selectedSlide}
            onChangeTextElement={updateTextElementContent}
            onMoveTextElement={updateTextElementPosition}
            onResizeTextElement={updateTextElementSize}
            onFormatTextElement={updateTextElementFormatting}
          />
        )}
      </div>

      {isPreviewOpen && (
        <PreviewModal slides={slides} presentation={presentation} onClose={() => setIsPreviewOpen(false)} />
      )}
    </div>
  );
}
