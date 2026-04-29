import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useSlides } from "../hooks/useSlides";
import "./EditorPage.css";

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

  const titlePlaceholder = selectedSlide?.placeholders.find(
    (placeholder) => placeholder.id === "title",
  );

  const bodyPlaceholder = selectedSlide?.placeholders.find(
    (placeholder) => placeholder.id === "body",
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
        <div className="preview-overlay">
          <div className="preview-window">
            <button onClick={() => setIsPreviewOpen(false)}>Close</button>

            <h2>{titlePlaceholder?.content}</h2>
            <p>{bodyPlaceholder?.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
