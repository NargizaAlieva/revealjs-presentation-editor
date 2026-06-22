import { useEffect, useRef, useState } from "react";
import {
  MdAlignHorizontalLeft,
  MdArrowDownward,
  MdArrowUpward,
  MdChevronRight,
  MdGroupWork,
  MdLayers,
  MdRotateRight,
  MdViewList,
} from "react-icons/md";
import "./ArrangeGroup.css";

export default function ArrangeGroup({
  hasSelection,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onRotateRight,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const toggleMenu = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPopupPosition({ top: rect.bottom + 3, left: rect.left });
    }
    setOpen((value) => !value);
  };

  const run = (callback) => {
    callback?.();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="ribbon-group arrange-group" ref={containerRef}>
      <button
        ref={buttonRef}
        className={`toolbar-item large arrange-main-button${open ? " active" : ""}`}
        onClick={toggleMenu}
        title="Arrange objects"
      >
        <MdLayers />
        <span>Arrange</span>
        <span className="arrange-button-arrow">▾</span>
      </button>

      {open && (
        <div
          className="arrange-menu"
          style={{ top: popupPosition.top, left: popupPosition.left }}
        >
          <div className="arrange-menu-heading">Order Objects</div>

          <button disabled={!hasSelection} onClick={() => run(onBringToFront)}>
            <MdArrowUpward />
            <span>Bring to Front</span>
          </button>
          <button disabled={!hasSelection} onClick={() => run(onSendToBack)}>
            <MdArrowDownward />
            <span>Send to Back</span>
          </button>
          <button disabled={!hasSelection} onClick={() => run(onBringForward)}>
            <MdArrowUpward />
            <span>Bring Forward</span>
          </button>
          <button disabled={!hasSelection} onClick={() => run(onSendBackward)}>
            <MdArrowDownward />
            <span>Send Backward</span>
          </button>

          <div className="arrange-menu-separator" />
          <div className="arrange-menu-heading">Group Objects</div>

          <button disabled>
            <MdGroupWork />
            <span>Group</span>
          </button>
          <button disabled>
            <MdGroupWork />
            <span>Ungroup</span>
          </button>
          <button disabled>
            <MdGroupWork />
            <span>Regroup</span>
          </button>

          <div className="arrange-menu-separator" />
          <div className="arrange-menu-heading">Position Objects</div>

          <button disabled>
            <MdAlignHorizontalLeft />
            <span>Align</span>
            <MdChevronRight className="arrange-submenu-arrow" />
          </button>
          <button disabled={!hasSelection} onClick={() => run(onRotateRight)}>
            <MdRotateRight />
            <span>Rotate Right 90°</span>
          </button>

          <div className="arrange-menu-separator" />

          <button disabled>
            <MdViewList />
            <span>Selection Pane...</span>
          </button>
        </div>
      )}

      <div className="ribbon-group-title">Arrange</div>
    </div>
  );
}
