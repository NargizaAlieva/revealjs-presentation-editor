import { useEffect, useState } from "react";
import { getAnimationDurationMs } from "../../../core/operations/animationOperations";

export default function useCanvasPreviewPlayback(previewEffect) {
  const [playingElementId, setPlayingElementId] = useState(null);
  const [playingEffect, setPlayingEffect] = useState(null);
  const [playingParagraphIndex, setPlayingParagraphIndex] = useState(null);
  const [playingByParagraph, setPlayingByParagraph] = useState(false);
  const [playingTransition, setPlayingTransition] = useState(null);

  useEffect(() => {
    if (!previewEffect) return undefined;

    let cancelled = false;
    let animationFrameId = null;
    let timer = null;

    Promise.resolve().then(() => {
      if (cancelled) return;

      if (previewEffect.type === "animation") {
        const duration = getAnimationDurationMs(previewEffect.speed);

        if (previewEffect.byParagraph && previewEffect.paragraphCount > 1) {
          setPlayingByParagraph(true);
          setPlayingElementId(previewEffect.elementId);
          setPlayingEffect(previewEffect.effect);
          setPlayingParagraphIndex(null);

          const paragraphCount = previewEffect.paragraphCount;
          const timers = [];
          for (let index = 0; index < paragraphCount; index++) {
            timers.push(
              window.setTimeout(() => {
                if (!cancelled) setPlayingParagraphIndex(index);
              }, 30 + index * (duration + 50)),
            );
          }
          timers.push(
            window.setTimeout(() => {
              if (!cancelled) {
                setPlayingByParagraph(false);
                setPlayingElementId(null);
                setPlayingEffect(null);
                setPlayingParagraphIndex(null);
              }
            }, 30 + paragraphCount * (duration + 50) + 100),
          );
          timer = {
            cancel: () =>
              timers.forEach((timerId) => window.clearTimeout(timerId)),
          };
        } else {
          setPlayingByParagraph(false);
          setPlayingElementId(null);
          setPlayingEffect(null);
          setPlayingParagraphIndex(null);

          animationFrameId = requestAnimationFrame(() => {
            if (!cancelled) {
              setPlayingElementId(previewEffect.elementId);
              setPlayingEffect(previewEffect.effect);
            }
          });
          timer = window.setTimeout(() => {
            setPlayingElementId(null);
            setPlayingEffect(null);
          }, duration + 100);
        }
      }

      if (previewEffect.type === "transition") {
        setPlayingTransition(null);
        animationFrameId = requestAnimationFrame(() => {
          if (!cancelled) setPlayingTransition(previewEffect.effect);
        });
        timer = window.setTimeout(() => setPlayingTransition(null), 900);
      }
    });

    return () => {
      cancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (timer?.cancel) {
        timer.cancel();
        setPlayingByParagraph(false);
        setPlayingParagraphIndex(null);
      } else if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [previewEffect]);

  return {
    playingElementId,
    playingEffect,
    playingParagraphIndex,
    playingByParagraph,
    playingTransition,
  };
}
