import { useCallback } from "react";

export function useAddTextElement(addTextElement) {
  const handleAddTextElement = useCallback(() => {
    addTextElement({
      id: crypto.randomUUID(),
      "placeholder-id": null,
      position: { x: 100, y: 100 },
      width: 300,
      height: 80,
      rotation: 0,
      "z-index": 10,
      background: "transparent",
      userModified: true,
      paragraphs: [{
        id: crypto.randomUUID(),
        formatting: { font: "Arial", size: "24px", color: "var(--text-dark)", align: "left" },
        bullets: "none",
        runs: [{ formatting: {}, "super-sub-script": "normal", text: "", link: null }],
      }],
    });
  }, [addTextElement]);

  return { handleAddTextElement };
}