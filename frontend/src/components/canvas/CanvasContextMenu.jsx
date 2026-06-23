import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdChevronRight,
  MdContentCopy,
  MdContentCut,
  MdContentPaste,
  MdDeleteOutline,
  MdExitToApp,
  MdFlipToBack,
  MdFlipToFront,
  MdFontDownload,
  MdFormatAlignLeft,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdImage,
  MdRedo,
  MdLink,
  MdRotateRight,
  MdSearch,
  MdSelectAll,
  MdUndo,
  MdVerticalAlignBottom,
  MdVerticalAlignTop,
  MdAddComment,
  MdTextFields,
} from "react-icons/md";
import FontDialog from "./FontDialog";
import ParagraphDialog from "./ParagraphDialog";
import "./CanvasContextMenu.css";

const BULLET_STYLES = [
  { value: null, label: "None" },
  { value: "\u2022", label: "• Filled circle" },
  { value: "\u25cb", label: "○ Open circle" },
  { value: "\u25aa", label: "▪ Square" },
  { value: "\u2756", label: "❖ Diamond" },
  { value: "\u2713", label: "✓ Checkmark" },
];

const NUMBER_STYLES = [
  { value: null, label: "None" },
  { value: "decimal", label: "1. 2. 3." },
  { value: "lower-alpha", label: "a. b. c." },
  { value: "upper-alpha", label: "A. B. C." },
  { value: "lower-roman", label: "i. ii. iii." },
  { value: "upper-roman", label: "I. II. III." },
];

function HyperlinkDialog({ onApply, onClose }) {
  const [href, setHref] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const trimmed = href.trim();
    if (!trimmed) {
      setError("Enter a link address.");
      return;
    }
    const ok = onApply?.(trimmed);
    if (ok === false) {
      setError("Select text in one paragraph before adding a hyperlink.");
    }
  };

  return (
    <div className="text-dialog-backdrop" role="presentation">
      <form
        className="text-context-dialog hyperlink-dialog"
        aria-label="Hyperlink"
        onSubmit={submit}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose?.();
        }}
      >
        <div className="text-context-dialog-header">
          <strong>Insert Hyperlink</strong>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <label className="hyperlink-dialog-field">
          <span>Address:</span>
          <input
            autoFocus
            value={href}
            onChange={(event) => {
              setHref(event.target.value);
              setError("");
            }}
            placeholder="https://example.com"
          />
        </label>
        {error && <div className="text-context-dialog-error">{error}</div>}
        <div className="text-context-dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}

const MenuItem = ({
  icon,
  label,
  shortcut,
  disabled,
  submenu,
  onMouseEnter,
  onClick,
}) => (
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

const PasteOptionButton = ({ icon, badge, title, disabled, onClick }) => (
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

export default function CanvasContextMenu({
  x,
  y,
  hasSelection,
  contextType = "canvas",
  elementId,
  formatting = {},
  presentation,
  canPaste,
  canUndo,
  canRedo,
  onClose,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onPasteText,
  onPastePicture,
  onDelete,
  onSelectAll,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onRotateRight,
  onNewComment,
  onHyperlink,
  onExitEditText,
  onFormatText,
  canHyperlink = false,
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ left: x, top: y });
  const [search, setSearch] = useState("");
  const [submenu, setSubmenu] = useState(null);
  const [dialog, setDialog] = useState(null);
  const isText = contextType === "text";
  const matches = (label) =>
    !search.trim() || label.toLowerCase().includes(search.trim().toLowerCase());

  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const margin = 8;
    const rect = menu.getBoundingClientRect();
    setPosition({
      left: Math.max(
        margin,
        Math.min(x, window.innerWidth - rect.width - margin),
      ),
      top: Math.max(
        margin,
        Math.min(y, window.innerHeight - rect.height - margin),
      ),
    });
  }, [x, y]);

  useLayoutEffect(() => {
    const close = (event) => {
      if (!dialog && !menuRef.current?.contains(event.target)) onClose?.();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("mousedown", close);
    window.addEventListener("blur", onClose);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onClose, true);

    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("blur", onClose);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [dialog, onClose]);

  const run = (action) => {
    action?.();
    onClose?.();
  };

  const applyTextFormatting = (updates) => {
    onFormatText?.(elementId, updates);
  };

  if (dialog === "font") {
    return (
      <FontDialog
        formatting={formatting}
        presentation={presentation}
        onApply={applyTextFormatting}
        onClose={onClose}
      />
    );
  }

  if (dialog === "paragraph") {
    return (
      <ParagraphDialog
        formatting={formatting}
        onApply={applyTextFormatting}
        onClose={onClose}
      />
    );
  }

  if (dialog === "hyperlink") {
    return (
      <HyperlinkDialog
        onApply={(href) => {
          const ok = onHyperlink?.(elementId, href);
          if (ok !== false) onClose?.();
          return ok;
        }}
        onClose={onClose}
      />
    );
  }

  return createPortal(
    <div
      ref={menuRef}
      className="canvas-context-menu"
      style={position}
      role="menu"
      onContextMenu={(event) => event.preventDefault()}
    >
      {isText && (
        <label className="canvas-context-menu-search">
          <MdSearch />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the menus"
          />
        </label>
      )}

      {!isText && (
        <>
          <MenuItem
            icon={<MdUndo />}
            label="Undo"
            shortcut="Ctrl+Z"
            disabled={!canUndo}
            onClick={() => run(onUndo)}
          />
          <MenuItem
            icon={<MdRedo />}
            label="Redo"
            shortcut="Ctrl+Y"
            disabled={!canRedo}
            onClick={() => run(onRedo)}
          />
          <div className="canvas-context-menu-separator" />
        </>
      )}

      {matches("Cut") && (
        <MenuItem
          icon={<MdContentCut />}
          label="Cut"
          shortcut="Ctrl+X"
          disabled={!hasSelection}
          onClick={() => run(onCut)}
        />
      )}
      {matches("Copy") && (
        <MenuItem
          icon={<MdContentCopy />}
          label="Copy"
          shortcut="Ctrl+C"
          disabled={!hasSelection}
          onClick={() => run(onCopy)}
        />
      )}
      {matches("Paste") && (
        <>
          {isText && (
            <div className="canvas-context-menu-heading">Paste Options:</div>
          )}
          {isText ? (
            <div className="canvas-context-paste-options" role="group">
              <PasteOptionButton
                icon={<MdContentPaste />}
                badge="a"
                title="Use Destination Theme"
                onClick={() =>
                  run(() => onPasteText?.(elementId, "destination"))
                }
              />
              <PasteOptionButton
                icon={<MdContentPaste />}
                badge="🎨"
                title="Keep Source Formatting"
                onClick={() =>
                  run(() =>
                    onPasteText?.(elementId, "source") ?? onPaste?.(),
                  )
                }
              />
              <PasteOptionButton
                icon={<MdImage />}
                badge="▣"
                title="Picture"
                onClick={() => run(onPastePicture)}
              />
              <PasteOptionButton
                icon={<MdTextFields />}
                badge="A"
                title="Keep Text Only"
                onClick={() => run(() => onPasteText?.(elementId, "text"))}
              />
            </div>
          ) : (
            <MenuItem
              icon={<MdContentPaste />}
              label="Paste"
              shortcut="Ctrl+V"
              disabled={!canPaste}
              onClick={() => run(onPaste)}
            />
          )}
        </>
      )}

      {isText && (
        <>
          <div className="canvas-context-menu-separator" />
          {matches("Exit Edit Text") && (
            <MenuItem
              icon={<MdExitToApp />}
              label="Exit Edit Text"
              onClick={() => run(() => onExitEditText?.(elementId))}
            />
          )}
          {matches("Font") && (
            <MenuItem
              icon={<MdFontDownload />}
              label="Font..."
              onClick={() => setDialog("font")}
            />
          )}
          {matches("Paragraph") && (
            <MenuItem
              icon={<MdFormatAlignLeft />}
              label="Paragraph..."
              onClick={() => setDialog("paragraph")}
            />
          )}
          {matches("Bullets") && (
            <div
              className="canvas-context-submenu-owner"
              onMouseLeave={() => setSubmenu(null)}
            >
              <MenuItem
                icon={<MdFormatListBulleted />}
                label="Bullets"
                submenu
                onMouseEnter={() => setSubmenu("bullets")}
                onClick={() =>
                  setSubmenu((current) =>
                    current === "bullets" ? null : "bullets",
                  )
                }
              />
              {submenu === "bullets" && (
                <div className="canvas-context-submenu">
                  {BULLET_STYLES.map((style) => (
                    <button
                      type="button"
                      key={style.label}
                      className={
                        formatting["list-type"] === "bullets" &&
                        formatting["list-marker"] === style.value
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        run(() =>
                          applyTextFormatting(
                            style.value === null
                              ? {
                                  "list-type": null,
                                  "list-marker": null,
                                  "indent-level": 0,
                                }
                              : {
                                  "list-type": "bullets",
                                  "list-marker": style.value,
                                  "indent-level":
                                    formatting["indent-level"] ?? 0,
                                },
                          ),
                        )
                      }
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {matches("Numbering") && (
            <div
              className="canvas-context-submenu-owner"
              onMouseLeave={() => setSubmenu(null)}
            >
              <MenuItem
                icon={<MdFormatListNumbered />}
                label="Numbering"
                submenu
                onMouseEnter={() => setSubmenu("numbering")}
                onClick={() =>
                  setSubmenu((current) =>
                    current === "numbering" ? null : "numbering",
                  )
                }
              />
              {submenu === "numbering" && (
                <div className="canvas-context-submenu">
                  {NUMBER_STYLES.map((style) => (
                    <button
                      type="button"
                      key={style.label}
                      className={
                        formatting["list-type"] === "numbered" &&
                        formatting["list-numbered-style"] === style.value
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        run(() =>
                          applyTextFormatting(
                            style.value === null
                              ? {
                                  "list-type": null,
                                  "list-numbered-style": null,
                                  "indent-level": 0,
                                }
                              : {
                                  "list-type": "numbered",
                                  "list-numbered-style": style.value,
                                  "indent-level":
                                    formatting["indent-level"] ?? 0,
                                },
                          ),
                        )
                      }
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {matches("Hyperlink") && (
            <>
              <div className="canvas-context-menu-separator" />
              <MenuItem
                icon={<MdLink />}
                label="Hyperlink..."
                disabled={!canHyperlink}
                onClick={() => setDialog("hyperlink")}
              />
            </>
          )}
          {matches("New Comment") && (
            <>
              <div className="canvas-context-menu-separator" />
              <MenuItem
                icon={<MdAddComment />}
                label="New Comment"
                onClick={() => run(onNewComment)}
              />
            </>
          )}
        </>
      )}

      {hasSelection && !isText && (
        <>
          <div className="canvas-context-menu-separator" />

          <MenuItem
            icon={<MdVerticalAlignTop />}
            label="Bring to Front"
            onClick={() => run(onBringToFront)}
          />
          <MenuItem
            icon={<MdFlipToFront />}
            label="Bring Forward"
            onClick={() => run(onBringForward)}
          />
          <MenuItem
            icon={<MdFlipToBack />}
            label="Send Backward"
            onClick={() => run(onSendBackward)}
          />
          <MenuItem
            icon={<MdVerticalAlignBottom />}
            label="Send to Back"
            onClick={() => run(onSendToBack)}
          />
          <MenuItem
            icon={<MdRotateRight />}
            label="Rotate Right 90°"
            onClick={() => run(onRotateRight)}
          />

          <div className="canvas-context-menu-separator" />

          <MenuItem
            icon={<MdAddComment />}
            label="New Comment"
            onClick={() => run(onNewComment)}
          />
          <MenuItem
            icon={<MdDeleteOutline />}
            label="Delete"
            shortcut="Del"
            onClick={() => run(onDelete)}
          />
        </>
      )}

      {!hasSelection && !isText && (
        <>
          <div className="canvas-context-menu-separator" />
          <MenuItem
            icon={<MdSelectAll />}
            label="Select All"
            shortcut="Ctrl+A"
            onClick={() => run(onSelectAll)}
          />
        </>
      )}
    </div>,
    document.body,
  );
}
