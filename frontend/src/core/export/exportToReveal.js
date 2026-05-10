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
      const textElementsHtml = `
        <div style="
          padding: 80px 120px;
          color: black;
          text-align: left;
        ">
          ${getTextElements(slide)
          .map((textElement, index) => {
            const text = escapeHtml(getTextFromTextElement(textElement));

            return `
                <div style="
                  font-size: ${index === 0 ? "34px" : "26px"};
                  font-weight: ${index === 0 ? "bold" : "normal"};
                  margin-bottom: 40px;
                  line-height: 1.3;
                ">
                  ${text}
                </div>
              `;
          })
          .join("")}
        </div>
      `;

      const mediaElementsHtml = getMediaElements(slide)
        .map((media) => {
          return `
            <img
              src="${escapeHtml(media["file-link"] || "")}"
              alt=""
              style="
                max-width: 80%;
                max-height: 60%;
                object-fit: contain;
                display: block;
                margin: 20px auto;
              "
            />
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