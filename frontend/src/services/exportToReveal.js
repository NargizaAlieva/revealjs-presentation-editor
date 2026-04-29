export function exportToReveal(slides) {
  const slideSections = slides
    .map((slide) => {
      const title = escapeHtml(
        slide.placeholders.find((p) => p.id === "title")?.content,
      );

      const body = escapeHtml(
        slide.placeholders.find((p) => p.id === "body")?.content,
      );

      return `
        <section>
          <h2>${title}</h2>
          <p>${body}</p>
        </section>
      `;
    })
    .join("");

  const escapeHtml = (value = "") => {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  };

  const htmlContent = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Presentation</title>
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
      center: true
    });
  </script>
</body>
</html>
`;

  const blob = new Blob([htmlContent], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "presentation.html";
  link.click();

  URL.revokeObjectURL(url);
}
