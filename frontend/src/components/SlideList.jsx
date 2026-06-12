import "./SlideList.css";
import SlideThumbnail from "./slides/SlideThumbnail";

export default function SlideList({ slides, selectedSlideId, onSelectSlide }) {
  return (
    <aside className="slide-list">
      {(slides ?? []).map((slide, index) => {
        const slideTitle = slide.title?.content ?? `Slide ${index + 1}`;
        const isHidden = slide.hidden ?? false;
        const isActive = selectedSlideId === index;

        return (
          <div
            key={`slide-${index}`}
            className={[
              "slide-list-item",
              isActive ? "active" : "",
              isHidden ? "hidden-slide" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelectSlide(index)}
            title={isHidden ? `${slideTitle} (hidden)` : slideTitle}
          >
            <div className="slide-number">
              {index + 1}. {slideTitle}
              {isHidden && <span className="hidden-badge">hidden</span>}
            </div>

            <SlideThumbnail slide={slide} />
          </div>
        );
      })}
    </aside>
  );
}
