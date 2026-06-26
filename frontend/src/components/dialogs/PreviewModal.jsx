import { useEffect, useRef, useState, useCallback } from "react";
import { useMediaSrc } from "../../hooks/useMediaSrc";
import "reveal.js/reveal.css";
import "reveal.js/theme/white.css";
import "./PreviewModal.css";
import SlideDecorations from "../canvas/SlideDecorations";
import {
  initRevealDeck,
  buildTextElementStyle,
  buildMediaContainerStyle,
  buildMediaInnerStyle,
  buildVideoAttributes,
  buildSlideContainerStyle,
  buildColorThemeStyle,
  getTextLines,
  getVisibleSlidesForPreview,
  getSlideTextElements,
  getSlideMediaElements,
  getSlideDimensions,
  getSlideTransition,
  buildAdjustedAnimationMap,
  getFragmentProps,
  getPerLineFragments,
} from "../../core/render/revealRenderer";
import { getPlaceholderFormatting } from "../../core/render/slidesetRenderUtils";
import { paragraphsToHTML } from "../../core/text/textFormatting";
import { REFLECTION_PRESETS } from "../../core/model/imageEffects";

function BgFillElement({ fileLink, width, height, settings = {} }) {
  const src = useMediaSrc(fileLink);
  if (!src) return null;
  const scale = settings.fitToCanvas ?? false;
  const ol = scale ? 0 : (settings.offsetLeft ?? 0) / 100;
  const or = scale ? 0 : (settings.offsetRight ?? 0) / 100;
  const ot = scale ? 0 : (settings.offsetTop ?? 0) / 100;
  const ob = scale ? 0 : (settings.offsetBottom ?? 0) / 100;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
      <img
        src={src}
        alt=""
        style={{
          position: "absolute",
          left: ol * width, top: ot * height,
          width: (1 - ol - or) * width,
          height: (1 - ot - ob) * height,
          objectFit: scale ? "fill" : "cover",
          opacity: 1 - (settings.transparency ?? 0) / 100,
        }}
      />
    </div>
  );
}

function BgImageElement({ fileLink, rect }) {
  const src = useMediaSrc(fileLink);
  return src ? (
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        objectFit: "fill",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  ) : null;
}

function PreviewMediaElement({ media, index, fragmentProps }) {
  const src = useMediaSrc(media["file-link"]);
  const isVideo = media["media-type"] === "video";
  const innerStyle = buildMediaInnerStyle(media);
  const videoAttrs = buildVideoAttributes(media);

  const refId = media.effects?.reflectionId;
  const rp = refId && refId !== "none" ? REFLECTION_PRESETS.find((p) => p.id === refId) : null;

  return (
    <>
      <div style={buildMediaContainerStyle(media, index)} {...fragmentProps}>
        {isVideo ? (
          <video src={src} style={innerStyle} controls preload="metadata" {...videoAttrs} />
        ) : (
          <img src={src} alt="" style={innerStyle} />
        )}
      </div>
      {rp && rp.size > 0 && src && (
        <img
          src={src}
          alt=""
          style={{
            position: "absolute",
            left: media.position?.x ?? 0,
            top: (media.position?.y ?? 0) + (media.height ?? 200) + (rp.offset ?? 0),
            width: media.width ?? 200,
            height: Math.round((rp.size / 100) * (media.height ?? 200)),
            objectFit: "cover",
            objectPosition: "top",
            transform: "scaleY(-1)",
            opacity: rp.opacity,
            filter: rp.blur > 0 ? `blur(${rp.blur}px)` : undefined,
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            pointerEvents: "none",
            zIndex: media["z-index"] ?? index + 1,
          }}
        />
      )}
    </>
  );
}

export default function PreviewModal({ slides, presentation, onClose, initialSlide = 0 }) {
  const deckRef = useRef(null);
  const deckInstanceRef = useRef(null);
  const { width, height } = getSlideDimensions(presentation);
  const colorThemeStyle = buildColorThemeStyle(presentation);
  const [showUI, setShowUI] = useState(false);
  const hideTimerRef = useRef(null);

  const handleMouseMove = useCallback(() => {
    setShowUI(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowUI(false), 2000);
  }, []);

  useEffect(() => {
    return () => clearTimeout(hideTimerRef.current);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!deckRef.current) return;
    const deck = initRevealDeck(deckRef.current, width, height, initialSlide);
    deckInstanceRef.current = deck;
    return () => {
      deck.destroy();
      deckInstanceRef.current = null;
    };
  }, [slides, width, height, initialSlide]);

  const handleClick = useCallback((e) => {
    if (e.target.closest(".preview-close")) return;
    if (e.target.closest("video")) return;
    const deck = deckInstanceRef.current;
    if (!deck) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width / 2) {
      deck.next();
    } else {
      deck.prev();
    }
  }, []);

  const visibleSlides = getVisibleSlidesForPreview(slides);
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};

  return (
    <div
      className={`preview-overlay${showUI ? " show-ui" : ""}`}
      style={colorThemeStyle}
      onMouseMove={handleMouseMove}
    >
      <div className="preview-window" onClick={handleClick}>
        <button
          className="preview-close"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          ✕
        </button>

        <div className="reveal" ref={deckRef}>
          <div className="slides">
            {visibleSlides.map((slide, slideIndex) => {
              const textElements = getSlideTextElements(slide);
              const mediaElements = getSlideMediaElements(slide);
              const animationMap = buildAdjustedAnimationMap(slide);
              const bgImageRect = slide?.contents?.["background-image-rect"] ?? { x: 0, y: 0, w: width, h: height };

              return (
                <section
                  key={`slide-${slideIndex}`}
                  data-transition={getSlideTransition(slide)}
                  style={{
                    background:
                      !slide?.contents?.background || slide.contents.background === "#FFFFFFFF"
                        ? "var(--bg-light, white)"
                        : slide.contents.background,
                  }}>
                  <div style={buildSlideContainerStyle(width, height)}>
                    {slide?.contents?.["bg-fill-image"] && (
                      <BgFillElement fileLink={slide.contents["bg-fill-image"]} width={width} height={height} settings={slide.contents["bg-fill-settings"] ?? {}} />
                    )}
                    {slide?.contents?.["background-image"] && (
                      <BgImageElement fileLink={slide.contents["background-image"]} rect={bgImageRect} />
                    )}
                    <SlideDecorations
                      presentation={presentation}
                      width={width}
                      height={height}
                      layoutId={slide?.["layout-id"]}
                      interactive
                    />
                    {textElements.filter((element) => !element.hidden).map((textElement, index) => {
                      const animation = animationMap.get(textElement.id);
                      const placeholderFormatting = getPlaceholderFormatting(presentation, slide, textElement);
                      const baseStyle = buildTextElementStyle(textElement, index, masterFormatting, placeholderFormatting);
                      const lines = getTextLines(textElement);
                      const perLine = getPerLineFragments(textElement, animation, lines);

                      if (perLine) {
                        return (
                          <div key={textElement.id || index} style={baseStyle}>
                            {perLine.map((entry, lineIndex) => (
                              <p key={lineIndex} {...entry.fragmentProps}>
                                {entry.text}
                              </p>
                            ))}
                          </div>
                        );
                      }

                      const fragmentProps = getFragmentProps(animation);
                      return (
                        <div
                          key={textElement.id || index}
                          style={baseStyle}
                          {...fragmentProps}
                          dangerouslySetInnerHTML={{ __html: paragraphsToHTML(textElement.paragraphs, masterFormatting, placeholderFormatting) }}
                        />
                      );
                    })}

                    {mediaElements.filter((element) => !element.hidden).map((media, index) => {
                      const fragmentProps = getFragmentProps(animationMap.get(media.id));
                      return (
                        <PreviewMediaElement
                          key={media.id || index}
                          media={media}
                          index={index}
                          fragmentProps={fragmentProps}
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
