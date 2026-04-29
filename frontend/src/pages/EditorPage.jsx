import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import "./EditorPage.css";

export default function EditorPage() {
  const [slides] = useState([
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

  return (
    <div className="editor-page">
      <SlideList
        slides={slides}
        selectedSlideId={selectedSlideId}
        onSelectSlide={setSelectedSlideId}
      />

      <div className="editor-main">
        <Toolbar />
        <EditorCanvas slide={selectedSlide} />
      </div>
    </div>
  );
}