import { getSlideSize, getVisibleSlides, escapeHtml } from "../../utils/slidesetRenderUtils";

function getTextFromTextElement(textElement) {
  return (
    textElement?.paragraphs
      ?.map((paragraph) =>
        paragraph?.runs?.map((run) => run?.text || "").join("")
      )
      .join("\n") || ""
  );
}

function getExportTextElements(slide) {
  return (slide?.contents?.text ?? []).map((textElement, index) => ({
    text: getTextFromTextElement(textElement),
    isTitle: textElement["placeholder-id"]?.includes("title") ?? index === 0,
  }));
}

export function exportToReveal(presentation) {
  const { width, height } = getSlideSize(presentation);
  const slides = getVisibleSlides(presentation);

  const slideSections = slides
    .map((slide) => {
      const textElements = getExportTextElements(slide);

      const textElementsHtml = textElements
        .map((textElement) => `
          <div style="
            font-size: ${textElement.isTitle ? "34px" : "26px"};
            font-weight: ${textElement.isTitle ? "bold" : "normal"};
            margin-bottom: 36px;
            line-height: 1.3;
            color: black;
          ">
            ${escapeHtml(textElement.text)}
          </div>
        `)
        .join("");

      return `
        <section
          data-transition="${slide.contents?.transition || "slide"}"
          style="background: ${slide.contents?.background || "white"};"
        >
          <div style="padding: 80px 120px; text-align: left; color: black;">
            ${textElementsHtml}
          </div>
        </section>
      `;
    })
    .join("");

  const htmlContent = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(presentation?.slideset?.title || "Presentation")}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/white.css">
  <style>
    .reveal section { text-align: left; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slideSections}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      controls: true,
      progress: true,
      center: false,
      width: ${width},
      height: ${height}
    });
  </script>
</body>
</html>
`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${presentation?.slideset?.filename || "presentation"}.html`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}