import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MdCrop, MdAddComment } from "react-icons/md";
import { PiFrameCornersBold } from "react-icons/pi";
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

  const items = [
    { icon: <PiFrameCornersBold />, label: "Style", action: onStyle, close: false },
    { icon: <MdCrop />, label: "Crop", action: onCrop, close: true },
    { icon: <MdAddComment />, label: "New Comment", action: onNewComment, close: true },
  ];

  return createPortal(
    <div ref={menuRef} className="media-context-menu" style={{ top: position.y, left: position.x }}>
      {items.map(({ icon, label, action, close }) => (
        <button
          key={label}
          className="media-context-menu__item"
          onMouseDown={(e) => {
            e.stopPropagation();
            action?.();
            if (close) onClose();
          }}
        >
          <span className="media-context-menu__icon">{icon}</span>
          <span className="media-context-menu__label">{label}</span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
