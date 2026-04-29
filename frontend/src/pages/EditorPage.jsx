import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useSlides } from "../hooks/useSlides";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";

export default function EditorPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
    slides,
    selectedSlide,
    selectedSlideId,
    setSelectedSlideId,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,
    savePresentation,
    updatePlaceholderContent,
    updatePlaceholderPosition,
  } = useSlides();

  const selectedSlideIndex = slides.findIndex(
    (slide) => slide.id === selectedSlideId,
  );

  return (
    <div className="editor-page">
      <SlideList
        slides={slides}
        selectedSlideId={selectedSlideId}
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
          onOpenPreview={() => setIsPreviewOpen(true)}
          canDelete={slides.length > 1}
          canMoveUp={selectedSlideIndex > 0}
          canMoveDown={selectedSlideIndex < slides.length - 1}
        />

        <EditorCanvas
          slide={selectedSlide}
          onChangePlaceholder={updatePlaceholderContent}
          onMovePlaceholder={updatePlaceholderPosition}
        />
      </div>

      {isPreviewOpen && selectedSlide && (
        <PreviewModal
          slide={selectedSlide}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
