import { useState } from "react";
import "./SlideSorterView.css";
import { buildColorThemeStyle } from "../core/render/revealRenderer";
import SlideDecorations from "./canvas/SlideDecorations";
import { extractPlainTextFromParagraphs } from "../core/text/textFormatting";

function SlideMiniature({ slide, index, isSelected, onClick, presentation }) {
    const colorThemeStyle = buildColorThemeStyle(presentation);
    const { width = 1280, height = 720 } = presentation?.slideset?.master?.["slide-dimensions"] ?? {};
    const THUMB_W = 200;
    const scale = THUMB_W / width;
    const thumbH = height * scale;

    const bgColor = !slide?.contents?.background || slide.contents.background === "#FFFFFFFF"
        ? "var(--bg-light, white)"
        : slide.contents.background;

    const textElements = slide?.contents?.text ?? [];

    return (
        <div
            className={`sorter-slide${isSelected ? " selected" : ""}${slide.hidden ? " hidden" : ""}`}
            onClick={() => onClick(index)}
        >
            <div className="sorter-slide-number">{index + 1}</div>
            <div className="sorter-slide-thumb" style={{ ...colorThemeStyle, width: THUMB_W, height: thumbH }}>
                <div style={{
                    position: "relative",
                    width,
                    height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    background: bgColor,
                    overflow: "hidden",
                }}>
                    <SlideDecorations presentation={presentation} width={width} height={height} />
                    {textElements.map((el, i) => {
                        const text = extractPlainTextFromParagraphs(el.paragraphs, " ");
                        const fmt = el.paragraphs?.[0]?.formatting ?? {};
                        return (
                            <div key={i} style={{
                                position: "absolute",
                                left: el.position?.x ?? 0,
                                top: el.position?.y ?? 0,
                                width: el.width ?? 300,
                                height: el.height ?? 80,
                                fontSize: fmt.size ?? (i === 0 ? "44px" : "28px"),
                                fontWeight: fmt.weight ?? (i === 0 ? "bold" : "normal"),
                                color: fmt.color ?? "var(--text-dark, black)",
                                fontFamily: fmt.font ?? "inherit",
                                overflow: "hidden",
                            }}>
                                {text}
                            </div>
                        );
                    })}
                </div>
            </div>
            {slide.hidden && <div className="sorter-hidden-badge">Hidden</div>}
        </div>
    );
}

export default function SlideSorterView({ slides, selectedSlideIndex, onSelectSlide, presentation }) {
    return (
        <div className="slide-sorter-view">
            {slides.map((slide, index) => (
                <SlideMiniature
                    key={slide.id ?? index}
                    slide={slide}
                    index={index}
                    isSelected={index === selectedSlideIndex}
                    onClick={onSelectSlide}
                    presentation={presentation}
                />
            ))}
        </div>
    );
}