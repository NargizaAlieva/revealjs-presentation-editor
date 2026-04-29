import { useEffect, useState } from "react";

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

export function useSlides() {
  const initialSlides = getInitialSlides();

  const [slides, setSlides] = useState(initialSlides);
  const [selectedSlideId, setSelectedSlideId] = useState(initialSlides[0].id);

  const selectedSlide = slides.find(
    (slide) => slide.id === selectedSlideId
  );

  // 🔥 Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem("presentation-slides", JSON.stringify(slides));
    }, 30000);

    return () => clearInterval(timer);
  }, [slides]);

  const updatePlaceholderContent = (placeholderId, newContent) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide.id === selectedSlideId
          ? {
              ...slide,
              title:
                placeholderId === "title"
                  ? newContent
                  : slide.title,
              placeholders: slide.placeholders.map((placeholder) =>
                placeholder.id === placeholderId
                  ? { ...placeholder, content: newContent }
                  : placeholder
              ),
            }
          : slide
      )
    );
  };

  const addSlide = () => {
    const slideNumber = slides.length + 1;

    const newSlide = {
      id: Date.now(),
      title: `Slide ${slideNumber}`,
      layoutId: "title-and-content",
      placeholders: [
        {
          id: "title",
          type: "text",
          content: `Slide ${slideNumber}`,
        },
        {
          id: "body",
          type: "text",
          content: "New slide content",
        },
      ],
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

  const duplicateSlide = () => {
    const currentSlide = slides.find(
      (slide) => slide.id === selectedSlideId
    );

    if (!currentSlide) return;

    const duplicatedSlide = {
      ...currentSlide,
      id: Date.now(),
      title: `${currentSlide.title} Copy`,
      placeholders: currentSlide.placeholders.map((placeholder) =>
        placeholder.id === "title"
          ? {
              ...placeholder,
              content: `${placeholder.content} Copy`,
            }
          : placeholder
      ),
    };

    const currentIndex = slides.findIndex(
      (slide) => slide.id === selectedSlideId
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
    const index = slides.findIndex(
      (slide) => slide.id === selectedSlideId
    );

    if (index <= 0) return;

    const updated = [...slides];

    [updated[index - 1], updated[index]] = [
      updated[index],
      updated[index - 1],
    ];

    setSlides(updated);
  };

  const moveSlideDown = () => {
    const index = slides.findIndex(
      (slide) => slide.id === selectedSlideId
    );

    if (index === -1 || index === slides.length - 1) return;

    const updated = [...slides];

    [updated[index], updated[index + 1]] = [
      updated[index + 1],
      updated[index],
    ];

    setSlides(updated);
  };

  const savePresentation = () => {
    localStorage.setItem("presentation-slides", JSON.stringify(slides));
  };

  return {
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
  };
}