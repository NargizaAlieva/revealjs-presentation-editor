import { useLayoutEffect, useRef } from "react";

function resetScale(editable) {
  editable.style.transform = "";
  editable.style.transformOrigin = "";
  editable.style.width = "";
}

export default function useTextOverflow({
  editableRef,
  innerHTML,
  textElement,
  slideHeight,
  onAutoFit,
}) {
  const lastAutoFitHeightRef = useRef(null);
  const overflowMode = textElement.overflow ?? "auto-fit";

  useLayoutEffect(() => {
    const editable = editableRef.current;
    if (!editable || !onAutoFit || overflowMode !== "auto-fit") {
      return undefined;
    }

    const fitToContent = () => {
      const currentHeight = textElement.height ?? 80;
      const contentHeight = Math.ceil(editable.scrollHeight + 2);
      if (contentHeight <= currentHeight + 1) {
        lastAutoFitHeightRef.current = null;
        return;
      }
      if (lastAutoFitHeightRef.current === contentHeight) return;

      lastAutoFitHeightRef.current = contentHeight;
      const currentY = textElement.position?.y ?? 0;
      const nextY =
        Number.isFinite(slideHeight) && currentY + contentHeight > slideHeight
          ? Math.max(0, slideHeight - contentHeight)
          : currentY;

      onAutoFit(textElement.id, {
        height: contentHeight,
        position: {
          ...(textElement.position ?? { x: 0, y: 0 }),
          y: nextY,
        },
      });
    };

    fitToContent();
    const observer = new ResizeObserver(fitToContent);
    observer.observe(editable);
    Array.from(editable.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [
    editableRef,
    innerHTML,
    onAutoFit,
    overflowMode,
    slideHeight,
    textElement.height,
    textElement.id,
    textElement.paragraphs,
    textElement.position,
    textElement.width,
  ]);

  useLayoutEffect(() => {
    const editable = editableRef.current;
    if (!editable || overflowMode !== "shrink-on-overflow") return undefined;

    const maxHeight = textElement.height ?? 80;
    const containerWidth = textElement.width ?? 300;
    resetScale(editable);

    if (editable.scrollHeight <= maxHeight + 1) return undefined;

    let low = 0.3;
    let high = 1;
    for (let index = 0; index < 14; index++) {
      const scale = (low + high) / 2;
      editable.style.transform = `scale(${scale})`;
      editable.style.transformOrigin = "top left";
      editable.style.width = `${containerWidth / scale}px`;
      if (editable.scrollHeight * scale <= maxHeight + 1) low = scale;
      else high = scale;
    }
    editable.style.transform = `scale(${low})`;
    editable.style.transformOrigin = "top left";
    editable.style.width = `${containerWidth / low}px`;

    return () => resetScale(editable);
  }, [
    editableRef,
    innerHTML,
    overflowMode,
    textElement.height,
    textElement.width,
  ]);
}
