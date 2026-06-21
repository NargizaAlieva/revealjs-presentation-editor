import { useCallback } from "react";
import { createTextElementDefaults } from "../core/model/masterDefaults";

export function useAddTextElement(addTextElement) {
  const handleAddTextElement = useCallback(() => {
    addTextElement(createTextElementDefaults(10, ""));
  }, [addTextElement]);

  return { handleAddTextElement };
}
