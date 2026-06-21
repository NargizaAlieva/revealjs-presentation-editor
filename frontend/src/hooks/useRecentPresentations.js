import { useEffect, useState } from "react";
import { getIndex } from "../core/persistence/persistenceFacade";

export function useRecentPresentations() {
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getIndex()
      .then(setRecent)
      .catch((err) => {
        console.error("[useRecentPresentations] Failed to load index:", err);
        setError(err);
        setRecent([]);
      });
  }, []);

  return { recent, error };
}
