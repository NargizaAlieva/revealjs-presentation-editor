import { useEffect } from "react";
export function usePresentationFonts(presentation) {
  useEffect(() => {
    const fonts = presentation?.slideset?.fonts ?? [];
    if (fonts.length === 0) return;

    const rules = fonts
      .filter((f) => f["font-id"] && f["font-file"])
      .map(
        (f) =>
          `@font-face {\n` +
          `  font-family: "${f["font-id"]}";\n` +
          `  src: url("${f["font-file"]}") format("woff");\n` +
          `  font-weight: normal;\n` +
          `  font-style: normal;\n` +
          `}`,
      )
      .join("\n");

    if (!rules) return;

    const style = document.createElement("style");
    style.setAttribute("data-presentation-fonts", "true");
    style.textContent = rules;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [presentation?.slideset?.fonts]);
}
