import { useEffect, useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import "./EditorPage.css";

const defaultSlides = [
  {
    id: 1,
    title: "Slide 1",
    layoutId: "title-and-content",
    placeholders: [
      {
        id: "title",
        type: "text",
        content: "Slide 1",
      },
      {
        id: "body",
        type: "text",
        content: "Click here to edit text",
      },
    ],
  },
  {
    id: 2,
    title: "Slide 2",
    layoutId: "title-and-content",
    placeholders: [
      {
        id: "title",
        type: "text",
        content: "Slide 2",
      },
      {
        id: "body",
        type: "text",
        content: "Second slide content",
      },
    ],
  },
];

const getInitialSlides = () => {
  const savedSlides = localStorage.getItem("presentation-slides");

  if (savedSlides) {
    try {
      return JSON.parse(savedSlides);
    } catch {
      return defaultSlides;
    }
  }

  return defaultSlides;
};

export default function EditorPage() {
  const initialSlides = getInitialSlides();

  const [slides, setSlides] = useState(initialSlides);
  const [selectedSlideId, setSelectedSlideId] = useState(initialSlides[0].id);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId);

  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      localStorage.setItem("presentation-slides", JSON.stringify(slides));
      console.log("Presentation auto-saved.");
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [slides]);

  const updateSlideText = (newText) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === selectedSlideId ? { ...slide, text: newText } : slide,
      ),
    );
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      title: `Slide ${slides.length + 1}`,
      text: "New slide content",
    };

    setSlides([...slides, newSlide]);
    setSelectedSlideId(newSlide.id);
  };

  const deleteSlide = () => {
    if (slides.length === 1) return;

    const updatedSlides = slides.filter(
      (slide) => slide.id !== selectedSlideId,
    );

    setSlides(updatedSlides);
    setSelectedSlideId(updatedSlides[0].id);
  };

  const duplicateSlide = () => {
    const currentSlide = slides.find((slide) => slide.id === selectedSlideId);

    if (!currentSlide) return;

    const duplicatedSlide = {
      ...currentSlide,
      id: Date.now(),
      title: `${currentSlide.title} Copy`,
    };

    const currentIndex = slides.findIndex(
      (slide) => slide.id === selectedSlideId,
    );

    const updatedSlides = [
      ...slides.slice(0, currentIndex + 1),
      duplicatedSlide,
      ...slides.slice(currentIndex + 1),
    ];

    setSlides(updatedSlides);
    setSelectedSlideId(duplicatedSlide.id);
  };

  const moveSlideUp = () => {
    const currentIndex = slides.findIndex(
      (slide) => slide.id === selectedSlideId,
    );

    if (currentIndex <= 0) return;

    const updatedSlides = [...slides];

    [updatedSlides[currentIndex - 1], updatedSlides[currentIndex]] = [
      updatedSlides[currentIndex],
      updatedSlides[currentIndex - 1],
    ];

    setSlides(updatedSlides);
  };

  const moveSlideDown = () => {
    const currentIndex = slides.findIndex(
      (slide) => slide.id === selectedSlideId,
    );

    if (currentIndex === -1 || currentIndex === slides.length - 1) return;

    const updatedSlides = [...slides];

    [updatedSlides[currentIndex], updatedSlides[currentIndex + 1]] = [
      updatedSlides[currentIndex + 1],
      updatedSlides[currentIndex],
    ];

    setSlides(updatedSlides);
  };

  const savePresentation = () => {
    localStorage.setItem("presentation-slides", JSON.stringify(slides));
    alert("Presentation saved successfully.");
  };

  const updatePlaceholderContent = (placeholderId, newContent) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === selectedSlideId
          ? {
              ...slide,
              title: placeholderId === "title" ? newContent : slide.title,
              placeholders: slide.placeholders.map((placeholder) =>
                placeholder.id === placeholderId
                  ? { ...placeholder, content: newContent }
                  : placeholder,
              ),
            }
          : slide,
      ),
    );
  };

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
          canMoveUp={
            slides.findIndex((slide) => slide.id === selectedSlideId) > 0
          }
          canMoveDown={
            slides.findIndex((slide) => slide.id === selectedSlideId) <
            slides.length - 1
          }
        />
        <EditorCanvas
          slide={selectedSlide}
          onChangePlaceholder={updatePlaceholderContent}
        />
      </div>

      {isPreviewOpen && (
        <div className="preview-overlay">
          <div className="preview-window">
            <button onClick={() => setIsPreviewOpen(false)}>Close</button>
            <h2>
              {
                selectedSlide.placeholders.find(
                  (placeholder) => placeholder.id === "title",
                )?.content
              }
            </h2>

            <p>
              {
                selectedSlide.placeholders.find(
                  (placeholder) => placeholder.id === "body",
                )?.content
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
