import { MdChevronRight } from "react-icons/md";

export function ContextMenuItem({
  icon,
  label,
  shortcut,
  disabled,
  submenu,
  onMouseEnter,
  onClick,
}) {
  return (
    <button
      type="button"
      className="canvas-context-menu-item"
      disabled={disabled}
      onMouseEnter={onMouseEnter}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
    >
      <span className="canvas-context-menu-icon">{icon}</span>
      <span className="canvas-context-menu-label">{label}</span>
      {shortcut && (
        <span className="canvas-context-menu-shortcut">{shortcut}</span>
      )}
      {submenu && <MdChevronRight className="canvas-context-menu-chevron" />}
    </button>
  );
}

export function PasteOptionButton({
  icon,
  badge,
  title,
  disabled,
  onClick,
}) {
  return (
    <button
      type="button"
      className="canvas-context-paste-option"
      disabled={disabled}
      title={title}
      aria-label={title}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
    >
      <span className="canvas-context-paste-option-icon">{icon}</span>
      <span className="canvas-context-paste-option-badge">{badge}</span>
    </button>
  );
}
