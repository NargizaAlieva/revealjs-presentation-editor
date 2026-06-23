import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MdCrop, MdStyle, MdAddComment } from "react-icons/md";
import "./MediaContextMenu.css";

export default function MediaContextMenu({ position, onCrop, onStyle, onNewComment, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handle = (fn) => (e) => {
    e.stopPropagation();
    fn?.();
    onClose();
  };

  return createPortal(
    <div
      ref={menuRef}
      className="media-context-menu"
      style={{ top: position.y, left: position.x }}
    >
      <button className="media-context-menu__item" onMouseDown={handle(onStyle)}>
        <MdStyle className="media-context-menu__icon" />
        <span>Style</span>
      </button>
      <button className="media-context-menu__item" onMouseDown={handle(onCrop)}>
        <MdCrop className="media-context-menu__icon" />
        <span>Crop</span>
      </button>
      <div className="media-context-menu__divider" />
      <button className="media-context-menu__item" onMouseDown={handle(onNewComment)}>
        <MdAddComment className="media-context-menu__icon" />
        <span>New Comment</span>
      </button>
    </div>,
    document.body,
  );
}
