import "./OutlineView.css";

export default function OutlineView({ slides, selectedSlideIndex, onSelectSlide }) {
    return (
        <div className="outline-panel">
            {slides.map((slide, slideIndex) => {
                const textElements = slide?.contents?.text ?? [];
                const isSelected = slideIndex === selectedSlideIndex;

                return (
                    <div
                        key={slide.id ?? slideIndex}
                        className={`outline-slide${isSelected ? " selected" : ""}`}
                        onClick={() => onSelectSlide(slideIndex)}
                    >
                        <div className="outline-slide-number">{slideIndex + 1}</div>
                        <div className="outline-slide-content">
                            {textElements.length === 0 ? (
                                <span className="outline-empty">Click to add text</span>
                            ) : (
                                textElements.map((el, elIndex) => {
                                    const text = (el.paragraphs ?? [])
                                        .map(p => p.runs?.map(r => r.text).join("") ?? "")
                                        .join("\n");
                                    const isTitle = elIndex === 0;
                                    return (
                                        <div
                                            key={el.id ?? elIndex}
                                            className={`outline-text-element${isTitle ? " outline-title" : " outline-body"}`}
                                        >
                                            {text || (
                                                <span className="outline-empty">
                                                    {isTitle ? "Click to add title" : "Click to add text"}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}