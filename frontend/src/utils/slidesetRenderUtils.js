export function getSlideSize(presentation) {
  const dimensions = presentation?.master?.["slide-dimensions"];

  return {
    width: dimensions?.width || 960,
    height: dimensions?.height || 540,
  };
}

export function getVisibleSlides(presentation) {
  return presentation?.slides?.filter((slide) => !slide.hidden) || [];
}

export function getTextElements(slide) {
  return slide?.contents?.text || [];
}

export function getMediaElements(slide) {
  return slide?.contents?.media || [];
}

export function getTextFromTextElement(textElement) {
  return (
    textElement?.paragraphs
      ?.map((paragraph) =>
        paragraph?.runs
          ?.map((run) => run?.text || "")
          .join("")
      )
      .join("\n") || ""
  );
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}