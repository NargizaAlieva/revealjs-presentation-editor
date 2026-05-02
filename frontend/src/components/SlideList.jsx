import "./SlideList.css";

export default function SlideList({ slides, selectedSlideId, onSelectSlide }) {
  return (
    <aside className="slide-list">
      <h3>Slides</h3>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={
            slide.id === selectedSlideId
              ? "slide-list-item active"
              : "slide-list-item"
          }
          onClick={() => onSelectSlide(slide.id)}
        >
          <div className="slide-number">Slide {index + 1}</div>

          <div className="slide-thumbnail">
            <strong>{slide.title}</strong>
            <p>{slide.text}</p>
          </div>
        </div>
      ))}
    </aside>
  );
}
