import {
  getSlideSize,
  getVisibleSlides,
  getTextElements,
  getTextFromTextElement,
  getMediaElements,
  escapeHtml,
} from "../../utils/slidesetRenderUtils";

export function exportToReveal(presentation) {
  const { width, height } = getSlideSize(presentation);
  const slides = getVisibleSlides(presentation);

  const slideSections = slides
    .map((slide) => {
      const textElementsHtml = getTextElements(slide)
        .map((textElement) => {
          const text = escapeHtml(getTextFromTextElement(textElement));

          return `
            <div style="
              position: absolute;
              left: ${textElement.position?.x || 0}px;
              top: ${textElement.position?.y || 0}px;
              width: ${textElement.width || 300}px;
              height: ${textElement.height || 80}px;
              background: ${textElement.background || "transparent"};
              overflow: ${textElement.overflow || "hidden"};
              z-index: ${textElement["z-index"] || textElement.zindex || 1};
              transform: rotate(${textElement.rotation || 0}deg);
            ">
              ${text}
            </div>
          `;
        })
        .join("");

      const mediaElementsHtml = getMediaElements(slide)
        .map((media) => {
          return `
            <img
              src="${escapeHtml(media["file-link"] || "")}"
              alt=""
              style="
                position: absolute;
                left: ${media.position?.x || 0}px;
                top: ${media.position?.y || 0}px;
                width: ${media.width || 200}px;
                height: ${media.height || 120}px;
                object-fit: contain;
                z-index: ${media["z-index"] || media.zindex || 1};
                transform: rotate(${media.rotation || 0}deg);
              "
            />
          `;
        })
        .join("");

      return `
        <section
          data-transition="${slide.contents?.transition || "slide"}"
          style="
            position: relative;
            width: ${width}px;
            height: ${height}px;
            background: ${slide.contents?.background || "white"};
          "
        >
          ${textElementsHtml}
          ${mediaElementsHtml}
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