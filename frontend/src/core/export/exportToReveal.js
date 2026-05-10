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
  if (slide?.contents?.text?.length) {
    return slide.contents.text.map((textElement, index) => ({
      text: getTextFromTextElement(textElement),
      isTitle: index === 0,
    }));
  }

  if (slide?.placeholders?.length) {
    return slide.placeholders.map((placeholder, index) => ({
      text: placeholder.content || "",
      isTitle: placeholder.id === "title" || placeholder.role === "title" || index === 0,
    }));
  }

  if (slide?.title) {
    return [
      {
        text: slide.title,
        isTitle: true,
      },
    ];
  }

  return [];
}

export function exportToReveal(presentation) {
  const { width, height } = getSlideSize(presentation);
  const slides = getVisibleSlides(presentation);

  const slideSections = slides
    .map((slide) => {
      const textElements = getExportTextElements(slide);

      const textElementsHtml = textElements
        .map((textElement) => {
          return `
            <div style="
              font-size: ${textElement.isTitle ? "34px" : "26px"};
              font-weight: ${textElement.isTitle ? "bold" : "normal"};
              margin-bottom: 36px;
              line-height: 1.3;
              color: black;
            ">
              ${escapeHtml(textElement.text)}
            </div>
          `;
        })
        .join("");

      return `
        <section
          data-transition="${slide.contents?.transition || "slide"}"
          style="
            background: ${slide.contents?.background || "white"};
          "
        >
          <div style="
            padding: 80px 120px;
            text-align: left;
            color: black;
          ">
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
  <title>${escapeHtml(presentation?.title || "Presentation")}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js/dist/theme/white.css">

  <style>
    .reveal section {
      text-align: left;
    }
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
  link.download = `${presentation?.filename || "presentation"}.html`;
  link.click();

  URL.revokeObjectURL(url);
}