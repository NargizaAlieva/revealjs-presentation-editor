import { useRef, useState, useEffect } from "react";
import "./SlideList.css";
import SlideThumbnail from "./slides/SlideThumbnail";

export default function SlideList({
  slides,
  selectedSlideId,
  onSelectSlide,
  onReorderSlide,
  slideWidth,
  slideHeight,
}) {
  // commentCounts[i] = number of comments on slide i
  const commentCounts = (slides ?? []).map(
    (s) => (s.contents?.comments ?? []).length,
  );
  const listRef = useRef(null);
  const itemRefs = useRef([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const lastScrollTime = useRef(0);
  const accumulated = useRef(0);

  // Скролл колёсиком — плавно меняет выбранный слайд
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const total = slides?.length ?? 0;
      if (total === 0) return;

      accumulated.current += e.deltaY;

      const now = Date.now();
      if (now - lastScrollTime.current < 250) return;
      lastScrollTime.current = now;

      const delta = accumulated.current;
      accumulated.current = 0;

      if (delta > 0 && selectedSlideId < total - 1) {
        onSelectSlide(selectedSlideId + 1);
      } else if (delta < 0 && selectedSlideId > 0) {
        onSelectSlide(selectedSlideId - 1);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [slides, selectedSlideId, onSelectSlide]);

  // Автоскролл к активной карточке при смене слайда
  useEffect(() => {
    const el = itemRefs.current[selectedSlideId];
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedSlideId]);

  // Drag & Drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== dragOverIndex) setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderSlide?.(draggedIndex, index);
      onSelectSlide(index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <aside className="slide-list" ref={listRef}>
      {(slides ?? []).map((slide, index) => {
        const slideTitle = slide.title?.content ?? `Slide ${index + 1}`;
        const isHidden = slide.hidden ?? false;
        const isActive = selectedSlideId === index;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index && draggedIndex !== index;

        return (
          <div
            key={`slide-${index}`}
            className="slide-list-row"
            ref={(el) => (itemRefs.current[index] = el)}
          >
            <span className="slide-number">{index + 1}</span>

            <div
              className={[
                "slide-list-item",
                isActive ? "active" : "",
                isHidden ? "hidden-slide" : "",
                isDragging ? "dragging" : "",
                isDragOver ? "drag-over" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              draggable
              onClick={() => onSelectSlide(index)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              title={isHidden ? `${slideTitle} (hidden)` : slideTitle}
            >
              <SlideThumbnail
                slide={slide}
                commentCount={commentCounts[index]}
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
