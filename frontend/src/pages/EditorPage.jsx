import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useSlides } from "../hooks/useSlides";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import RevealPreview from "../components/preview/RevealPreview";

const mockPresentation = {
  id: "test-presentation",
  filename: "presentation-1",
  title: "New Presentation",
  author: "unknown",
  master: {
    "slide-dimensions": null,
  },
  slides: [
    {
      title: "Title Slide",
      hidden: false,
      contents: {
        text: [
          {
            id: "text-1",
            position: { x: 80, y: 80 },
            width: 800,
            height: 80,
            rotation: 0,
            overflow: "none",
            background: "transparent",
            paragraphs: [
              {
                id: "paragraph-1",
                formatting: null,
                bullets: null,
                runs: [
                  {
                    formatting: null,
                    text: "Click to add title",
                    link: null,
                    "super-sub-script": null,
                  },
                ],
              },
            ],
            zindex: 1,
            "placeholder-id": null,
            "pos-type": null,
            "z-index": 1,
          },
        ],
        media: [],
        background: null,
        transition: null,
        notes: null,
      },
      "layout-id": null,
    },
  ],
  "creation-date": null,
};

export default function EditorPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const {
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
    updateTextElementContent,
    updateTextElementPosition,
    resetPresentation,
  } = useSlides();

  const exportPresentation = () => {
    console.log("Export is handled by the rendering/export layer.");
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
        />

        {selectedSlide && (
          <EditorCanvas
            slide={selectedSlide}
            onChangeTextElement={updateTextElementContent}
            onMoveTextElement={updateTextElementPosition}
          />
        )}
      </div>
      <div style={{ marginTop: "24px" }}>
        <h3>Presentation Preview</h3>
        <RevealPreview presentation={mockPresentation} />
      </div>

      {isPreviewOpen && (
        <PreviewModal slides={slides} onClose={() => setIsPreviewOpen(false)} />
      )}
    </div>
  );
}
