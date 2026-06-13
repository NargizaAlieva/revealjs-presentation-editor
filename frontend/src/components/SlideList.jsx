import "./SlideList.css";
import SlideThumbnail from "./slides/SlideThumbnail";

export default function SlideList({
  slides,
  selectedSlideId,
  onSelectSlide,
  slideWidth,
  slideHeight,
}) {
  return (
    <aside className="slide-list">
      {(slides ?? []).map((slide, index) => {
        const slideTitle = slide.title?.content ?? `Slide ${index + 1}`;
        const isHidden = slide.hidden ?? false;
        const isActive = selectedSlideId === index;

        return (
          <div key={`slide-${index}`} className="slide-list-row">
            <span className="slide-number">{index + 1}</span>

            <div
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
              <SlideThumbnail
                slide={slide}
                slideWidth={slideWidth}
                slideHeight={slideHeight}
              />
            </div>
          </div>
        );
      })}
    </aside>
  );
}
