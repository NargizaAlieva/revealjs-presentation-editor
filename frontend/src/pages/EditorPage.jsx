import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import "./EditorPage.css";

export default function EditorPage() {
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: "Slide 1",
      text: "Click here to edit text",
    },
    {
      id: 2,
      title: "Slide 2",
      text: "Second slide content",
    },
  ]);

  const [selectedSlideId, setSelectedSlideId] = useState(1);

  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId);

  const updateSlideText = (newText) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === selectedSlideId
          ? { ...slide, text: newText }
          : slide
      )
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
        (slide) => slide.id !== selectedSlideId
    );

    setSlides(updatedSlides);
    setSelectedSlideId(updatedSlides[0].id);
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
        />
        <EditorCanvas
          slide={selectedSlide}
          onChangeText={updateSlideText}
        />
      </div>
    </div>
  );
}