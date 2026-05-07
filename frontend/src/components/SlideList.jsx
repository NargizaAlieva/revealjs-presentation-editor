// import "./SlideList.css";

// export default function SlideList({ slides, selectedSlideId, onSelectSlide }) {
//   return (
//     <aside className="slide-list">
//       <h3>Slides</h3>

//       {slides.map((slide, index) => (
//         <div
//           key={slide.id}
//           className={
//             slide.id === selectedSlideId
//               ? "slide-list-item active"
//               : "slide-list-item"
//           }
//           onClick={() => onSelectSlide(slide.id)}
//         >
//           <div className="slide-number">Slide {index + 1}</div>

//           <div className="slide-thumbnail">
//             <strong>{slide.title}</strong>
//             <p>{slide.text}</p>
//           </div>
//         </div>
//       ))}
//     </aside>
//   );
// }


import "./SlideList.css";

export default function SlideList({
  slides,
  selectedSlideId,
  onSelectSlide,
}) {
  return (
    <aside className="slide-list">
      <h3>Slides</h3>

      {slides.map((slide, index) => {
        const title =
          slide.title?.content ?? `Slide ${index + 1}`;

        const bodyText =
          slide.contents?.text?.[1]?.paragraphs?.[0]?.runs?.[0]
            ?.text ?? "";

        return (
          <div
            key={`slide-${index}`}
            className={
              selectedSlideId === index
                ? "slide-list-item active"
                : "slide-list-item"
            }
            onClick={() => onSelectSlide(index)}
          >
            <div className="slide-number">
              Slide {index + 1}
            </div>

            <div className="slide-thumbnail">
              <strong>{title}</strong>

              <p>{bodyText}</p>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
