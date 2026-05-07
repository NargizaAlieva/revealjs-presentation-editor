// import { useEffect, useState } from "react";

// const defaultSlides = [
//   {
//     id: 1,
//     title: "Slide 1",
//     layoutId: "title-and-content",
//     placeholders: [
//       {
//         id: "title",
//         type: "text",
//         content: "Slide 1",
//         position: { x: 50, y: 50 }
//       },
//       {
//         id: "body",
//         type: "text",
//         content: "Click here to edit text",
//         position: { x: 50, y: 50 }
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "Slide 2",
//     layoutId: "title-and-content",
//     placeholders: [
//       {
//         id: "title",
//         type: "text",
//         content: "Slide 2",
//         position: { x: 50, y: 50 }
//       },
//       {
//         id: "body",
//         type: "text",
//         content: "Second slide content",
//         position: { x: 50, y: 50 }
//       },
//     ],
//   },
// ];

// const getInitialSlides = () => {
//   const savedSlides = localStorage.getItem("presentation-slides");

//   if (savedSlides) {
//     try {
//       return JSON.parse(savedSlides);
//     } catch {
//       return defaultSlides;
//     }
//   }

//   return defaultSlides;
// };


// export function useSlides() {
//   const initialSlides = getInitialSlides();

//   const [slides, setSlides] = useState(initialSlides);
//   const [selectedSlideId, setSelectedSlideId] = useState(initialSlides[0].id);

//   const selectedSlide = slides.find(
//     (slide) => slide.id === selectedSlideId
//   );

//   // 🔥 Auto-save
//   useEffect(() => {
//     const timer = setInterval(() => {
//       localStorage.setItem("presentation-slides", JSON.stringify(slides));
//     }, 30000);

//     return () => clearInterval(timer);
//   }, [slides]);

//   const updatePlaceholderContent = (placeholderId, newContent) => {
//     setSlides((prevSlides) =>
//       prevSlides.map((slide) =>
//         slide.id === selectedSlideId
//           ? {
//               ...slide,
//               title:
//                 placeholderId === "title"
//                   ? newContent
//                   : slide.title,
//               placeholders: slide.placeholders.map((placeholder) =>
//                 placeholder.id === placeholderId
//                   ? { ...placeholder, content: newContent }
//                   : placeholder
//               ),
//             }
//           : slide
//       )
//     );
//   };

//   const updatePlaceholderPosition = (placeholderId, x, y) => {
//   setSlides((prevSlides) =>
//     prevSlides.map((slide) =>
//       slide.id === selectedSlideId
//         ? {
//             ...slide,
//             placeholders: slide.placeholders.map((p) =>
//               p.id === placeholderId
//                 ? { ...p, position: { x, y } }
//                 : p
//             ),
//           }
//         : slide
//     )
//   );
// };

//   const addSlide = () => {
//     const slideNumber = slides.length + 1;

//     const newSlide = {
//       id: Date.now(),
//       title: `Slide ${slideNumber}`,
//       layoutId: "title-and-content",
//       placeholders: [
//         {
//           id: "title",
//           type: "text",
//           content: `Slide ${slideNumber}`,
//         },
//         {
//           id: "body",
//           type: "text",
//           content: "New slide content",
//         },
//       ],
//     };

//     setSlides([...slides, newSlide]);
//     setSelectedSlideId(newSlide.id);
//   };

//   const deleteSlide = () => {
//     if (slides.length === 1) return;

//     const updatedSlides = slides.filter(
//       (slide) => slide.id !== selectedSlideId
//     );

//     setSlides(updatedSlides);
//     setSelectedSlideId(updatedSlides[0].id);
//   };

//   const duplicateSlide = () => {
//     const currentSlide = slides.find(
//       (slide) => slide.id === selectedSlideId
//     );

//     if (!currentSlide) return;

//     const duplicatedSlide = {
//       ...currentSlide,
//       id: Date.now(),
//       title: `${currentSlide.title} Copy`,
//       placeholders: currentSlide.placeholders.map((placeholder) =>
//         placeholder.id === "title"
//           ? {
//               ...placeholder,
//               content: `${placeholder.content} Copy`,
//             }
//           : placeholder
//       ),
//     };

//     const currentIndex = slides.findIndex(
//       (slide) => slide.id === selectedSlideId
//     );

//     const updatedSlides = [
//       ...slides.slice(0, currentIndex + 1),
//       duplicatedSlide,
//       ...slides.slice(currentIndex + 1),
//     ];

//     setSlides(updatedSlides);
//     setSelectedSlideId(duplicatedSlide.id);
//   };

//   const moveSlideUp = () => {
//     const index = slides.findIndex(
//       (slide) => slide.id === selectedSlideId
//     );

//     if (index <= 0) return;

//     const updated = [...slides];

//     [updated[index - 1], updated[index]] = [
//       updated[index],
//       updated[index - 1],
//     ];

//     setSlides(updated);
//   };

//   const moveSlideDown = () => {
//     const index = slides.findIndex(
//       (slide) => slide.id === selectedSlideId
//     );

//     if (index === -1 || index === slides.length - 1) return;

//     const updated = [...slides];

//     [updated[index], updated[index + 1]] = [
//       updated[index + 1],
//       updated[index],
//     ];

//     setSlides(updated);
//   };

//   const savePresentation = () => {
//     localStorage.setItem("presentation-slides", JSON.stringify(slides));
//   };

//   return {
//     slides,
//     selectedSlide,
//     selectedSlideId,
//     setSelectedSlideId,
//     addSlide,
//     deleteSlide,
//     duplicateSlide,
//     moveSlideUp,
//     moveSlideDown,
//     savePresentation,
//     updatePlaceholderContent,
//     updatePlaceholderPosition,
//   };
// }


import { useEffect, useReducer } from "react";

import {
  createInitialEditorState,
  editorReducer,
  EditorEventType,
  createEditorEvent,
  serializePresentation,
} from "../core";

export function useSlides() {
  const [state, dispatch] = useReducer(
    editorReducer,
    undefined,
    createInitialEditorState
  );

  const slides = state.presentation.slideset.slides;
  const selectedSlideIndex = state.selectedSlideIndex;
  const selectedSlide = slides[selectedSlideIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(
        "presentation",
        serializePresentation(state.presentation)
      );
    }, 30000);

    return () => clearInterval(timer);
  }, [state.presentation]);

  const setSelectedSlideId = (slideIndex) => {
    dispatch(
      createEditorEvent(EditorEventType.SLIDE.SELECT, {
        slideIndex,
      })
    );
  };

  const addSlide = () => {
    dispatch(createEditorEvent(EditorEventType.SLIDE.ADD));
  };

  const deleteSlide = () => {
    dispatch(createEditorEvent(EditorEventType.SLIDE.DELETE));
  };

  const duplicateSlide = () => {
    dispatch(createEditorEvent(EditorEventType.SLIDE.DUPLICATE));
  };

  const moveSlideUp = () => {
    if (selectedSlideIndex <= 0) {
      return;
    }

    dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex - 1,
      })
    );
  };

  const moveSlideDown = () => {
    if (selectedSlideIndex >= slides.length - 1) {
      return;
    }

    dispatch(
      createEditorEvent(EditorEventType.SLIDE.REORDER, {
        fromIndex: selectedSlideIndex,
        toIndex: selectedSlideIndex + 1,
      })
    );
  };

  const updatePlaceholderContent = (textElementId, newText) => {
    dispatch(
      createEditorEvent(EditorEventType.CONTENT.UPDATE_TEXT, {
        textElementId,
        text: newText,
      })
    );
  };

  const updatePlaceholderPosition = (elementId, x, y) => {
    dispatch(
      createEditorEvent(EditorEventType.CONTENT.MOVE_ELEMENT, {
        elementId,
        position: { x, y },
      })
    );
  };

  const savePresentation = () => {
    localStorage.setItem(
      "presentation",
      serializePresentation(state.presentation)
    );
  };

  return {
    presentation: state.presentation,

    slides,
    selectedSlide,
    selectedSlideIndex,

    // kept for compatibility with old UI naming
    selectedSlideId: selectedSlideIndex,
    setSelectedSlideId,

    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,

    savePresentation,
    updatePlaceholderContent,
    updatePlaceholderPosition,
  };
}