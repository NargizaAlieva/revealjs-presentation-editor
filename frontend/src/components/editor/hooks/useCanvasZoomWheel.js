import { useEffect } from "react";

export default function useCanvasZoomWheel({ workspaceRef, onCanvasZoom }) {
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return undefined;

    const handleWheel = (event) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      onCanvasZoom?.(-(event.deltaY * 0.3));
    };

    workspace.addEventListener("wheel", handleWheel, { passive: false });
    return () => workspace.removeEventListener("wheel", handleWheel);
  }, [onCanvasZoom, workspaceRef]);
}
