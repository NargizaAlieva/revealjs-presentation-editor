import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  MdContentCopy,
  MdContentCut,
  MdContentPaste,
  MdDescription,
  MdFolder,
  MdImage,
  MdInsertDriveFile,
  MdMailOutline,
  MdRedo,
  MdSearch,
  MdTextFields,
  MdUndo,
  MdWeb,
} from "react-icons/md";
import FontDialog from "../dialogs/FontDialog";
import ParagraphDialog from "../dialogs/ParagraphDialog";
import CanvasSelectionMenu from "./context-menu/CanvasSelectionMenu";
import {
  ContextMenuItem,
  PasteOptionButton,
} from "./context-menu/ContextMenuItem";
import TextFormattingMenu from "./context-menu/TextFormattingMenu";
import "./CanvasContextMenu.css";

const HYPERLINK_TYPES = [
  { value: "web", label: "Existing File or Web Page", icon: <MdWeb /> },
  { value: "place", label: "Place in This Document", icon: <MdDescription /> },
  { value: "new", label: "Create New Document", icon: <MdDescription /> },
  { value: "email", label: "E-mail Address", icon: <MdMailOutline /> },
];

const HYPERLINK_FOLDERS = ["Current Folder", "Browsed Pages", "Recent Files"];

const HYPERLINK_FILES = [
  "9.641j-spring-2005",
  "conference-latex-template",
  "eCommerce-React-main",
  "Example",
  "fashion-images",
  "films-main",
  "generative_ai_acm",
];

const HYPERLINK_BROWSED_PAGES = [
  "ms-screenclip:///?source=HotKey",
  "file:///C:/Users/user/Pictures/Screenshots/photo_2026-03-24_12-29-21.jpg",
  "file:///C:/Users/user/Pictures/Screenshots/Altynai%20Munduzbaeva.jpg",
  "file:///C:/Users/user/Pictures/Screenshots/photo_2026-02-21_15-19-57.jpg",
  "file:///C:/Users/user/Downloads/MM-AI%20-%20Uebung_02.pptx",
  "file:///C:/Users/user/Desktop/Hof/SWE/final/revealjs-presentation-editor",
  "file:///C:/Users/user/Documents/cloud/20261_group_07",
  "file:///C:/Users/user/Desktop/Hof/Cloud",
  "file:///C:/Users/user/Desktop/Hof/processMining/process/process/Poster.pdf",
  "file:///C:/Users/user/Documents/Inductive%20Miner.pdf",
];

const HYPERLINK_RECENT_FILES = [
  "C:\\Users\\user\\Downloads\\MM-AI - Uebung_02.pptx",
  "https://hochschulehof-my.sharepoint.com/personal/amunduzbaeva_hof-university_de",
  "C:\\Users\\user\\Downloads\\Telegram Desktop\\Review Paper 09.docx",
  "C:\\Users\\user\\Downloads\\Lecture 2 (2).pptx",
  "C:\\Users\\user\\Pictures\\Screenshot 2026-05-10 173944.png",
  "C:\\Users\\user\\Documents\\new.doc",
  "https://d.docs.live.net/f68e3bb0184e891d/Document.odt",
  "C:\\Users\\user\\Downloads\\Telegram Desktop\\A2.1 - Modellprufung neu.docx",
  "C:\\Users\\user\\Downloads\\A2.1 - Modellprufung neu.pdf",
  "C:\\Users\\user\\Documents\\Technical Description of Mobile Robot Platform1.docx",
  "C:\\Users\\user\\Documents\\B Netzwerk neu A2 - Ubungsbuch, Kap. 1.pdf",
];

function HyperlinkBrowseButton({ title, icon, active = false, onClick }) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      title={title}
      aria-label={title}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

export function HyperlinkDialog({
  selectedText = "",
  presentation,
  onApply,
  onClose,
}) {
  const [href, setHref] = useState("");
  const [displayText, setDisplayText] = useState(selectedText);
  const [screenTip, setScreenTip] = useState("");
  const [linkType, setLinkType] = useState("web");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [webFolder, setWebFolder] = useState("Current Folder");
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [showAndReturn, setShowAndReturn] = useState(false);
  const [newDocumentName, setNewDocumentName] = useState("");
  const [editNewDocumentNow, setEditNewDocumentNow] = useState(true);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [activeBrowseButton, setActiveBrowseButton] = useState("");
  const fileInputRef = useRef(null);
  const objectUrlRef = useRef("");
  const slideTitles =
    presentation?.slideset?.slides?.map((slide, index) => {
      const content = slide?.title?.content?.trim();
      return content || `Slide ${index + 1}`;
    }) ?? [];
  const webFolderItems =
    webFolder === "Browsed Pages"
      ? HYPERLINK_BROWSED_PAGES
      : webFolder === "Recent Files"
        ? HYPERLINK_RECENT_FILES
        : HYPERLINK_FILES;
  const isCurrentFolder = webFolder === "Current Folder";

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const chooseLocalFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.type || "file",
      href: objectUrl,
    });
    setHref(objectUrl);
    if (!displayText.trim()) setDisplayText(file.name);
    if (!screenTip.trim()) setScreenTip(file.name);
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    const typedHref = href.trim();
    const trimmed =
      linkType === "place"
        ? `#slide-${selectedSlideIndex + 1}`
        : linkType === "new"
          ? newDocumentName.trim()
          : linkType === "email"
            ? emailAddress.trim()
            : typedHref;
    if (!trimmed) {
      setError(
        linkType === "place"
          ? "Select a place in this document."
          : linkType === "new"
            ? "Enter a new document name."
            : linkType === "email"
              ? "Enter an e-mail address."
              : "Enter a link address.",
      );
      return;
    }
    const emailHref =
      linkType === "email" && emailSubject.trim()
        ? `${trimmed}?subject=${encodeURIComponent(emailSubject.trim())}`
        : trimmed;
    const ok = onApply?.({
      href: linkType === "email" ? emailHref : trimmed,
      text: displayText.trim(),
      screenTip: screenTip.trim(),
      type: linkType,
      showAndReturn,
      editNewDocumentNow,
    });
    if (ok === false) {
      setError("Select text in one paragraph before adding a hyperlink.");
    }
  };

  const askScreenTip = () => {
    const next = window.prompt("ScreenTip text:", screenTip);
    if (next !== null) setScreenTip(next);
  };

  return (
    <div className="text-dialog-backdrop" role="presentation">
      <form
        className="text-context-dialog insert-hyperlink-dialog"
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
        <div className="insert-hyperlink-display-row">
          <span>Text to display:</span>
          <input
            value={displayText}
            onChange={(event) => setDisplayText(event.target.value)}
          />
          <button type="button" onClick={askScreenTip}>
            ScreenTip...
          </button>
        </div>
        <div className="insert-hyperlink-body">
          <aside className="insert-hyperlink-link-types">
            <span className="insert-hyperlink-link-to">Link to:</span>
            {HYPERLINK_TYPES.map((item) => (
              <button
                type="button"
                key={item.value}
                className={linkType === item.value ? "active" : ""}
                onClick={() => {
                  setLinkType(item.value);
                  setError("");
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </aside>
          <section className="insert-hyperlink-main">
            {linkType === "web" ? (
              <>
                {isCurrentFolder ? (
                  <div className="insert-hyperlink-lookin-row">
                    <span>Look in:</span>
                    <select defaultValue="Downloads">
                      <option>Downloads</option>
                      <option>Documents</option>
                      <option>Desktop</option>
                    </select>
                    <HyperlinkBrowseButton
                      title="Browse the Web"
                      icon={<MdSearch />}
                      active={activeBrowseButton === "web"}
                      onClick={() => setActiveBrowseButton("web")}
                    />
                    <HyperlinkBrowseButton
                      title="Browse for File"
                      icon={<MdDescription />}
                      active={activeBrowseButton === "file"}
                      onClick={() => {
                        setActiveBrowseButton("file");
                        fileInputRef.current?.click();
                      }}
                    />
                    <HyperlinkBrowseButton
                      title="Browse for Folder"
                      icon={<MdFolder />}
                      active={activeBrowseButton === "folder"}
                      onClick={() => {
                        setActiveBrowseButton("folder");
                        fileInputRef.current?.click();
                      }}
                    />
                  </div>
                ) : (
                  <div className="insert-hyperlink-history-toolbar">
                    <HyperlinkBrowseButton
                      title="Browse the Web"
                      icon={<MdSearch />}
                      active={activeBrowseButton === "web"}
                      onClick={() => setActiveBrowseButton("web")}
                    />
                    <HyperlinkBrowseButton
                      title="Browse for File"
                      icon={<MdDescription />}
                      active={activeBrowseButton === "file"}
                      onClick={() => {
                        setActiveBrowseButton("file");
                        fileInputRef.current?.click();
                      }}
                    />
                    <HyperlinkBrowseButton
                      title="Browse for Folder"
                      icon={<MdFolder />}
                      active={activeBrowseButton === "folder"}
                      onClick={() => {
                        setActiveBrowseButton("folder");
                        fileInputRef.current?.click();
                      }}
                    />
                  </div>
                )}
                <div
                  className={[
                    "insert-hyperlink-browser",
                    !isCurrentFolder ? "insert-hyperlink-browser--history" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <nav>
                    {HYPERLINK_FOLDERS.map((folder) => (
                      <button
                        type="button"
                        key={folder}
                        className={webFolder === folder ? "active" : ""}
                        onClick={() => {
                          setWebFolder(folder);
                          setError("");
                        }}
                      >
                        {folder}
                      </button>
                    ))}
                  </nav>
                  <div
                    className={[
                      "insert-hyperlink-file-list",
                      !isCurrentFolder
                        ? "insert-hyperlink-file-list--history"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isCurrentFolder && selectedFile && (
                      <button
                        type="button"
                        className="selected"
                        onClick={() => {
                          setHref(selectedFile.href);
                          setError("");
                        }}
                      >
                        <MdInsertDriveFile />
                        <span>{selectedFile.name}</span>
                      </button>
                    )}
                    {webFolderItems.map((file) => (
                      <button
                        type="button"
                        key={file}
                        onClick={() => {
                          setHref(file);
                          setError("");
                        }}
                      >
                        {isCurrentFolder ? <MdFolder /> : null}
                        <span>{file}</span>
                      </button>
                    ))}
                  </div>
                  <div className="insert-hyperlink-side-buttons">
                    <button
                      type="button"
                      title="Choose file from PC"
                      aria-label="Choose file from PC"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse...
                    </button>
                    <button type="button">Bookmark...</button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="insert-hyperlink-file-input"
                  onChange={chooseLocalFile}
                />
              </>
            ) : linkType === "place" ? (
              <div className="insert-hyperlink-place-panel">
                <div className="insert-hyperlink-place-column">
                  <span>Select a place in this document:</span>
                  <div className="insert-hyperlink-slide-tree">
                    <div className="insert-hyperlink-tree-root">
                      <span className="insert-hyperlink-tree-toggle">⊟</span>
                      <span>Slide Titles</span>
                    </div>
                    <div className="insert-hyperlink-tree-items">
                      {slideTitles.map((title, index) => (
                        <button
                          type="button"
                          key={`${title}-${index}`}
                          className={
                            selectedSlideIndex === index ? "selected" : ""
                          }
                          onClick={() => {
                            setSelectedSlideIndex(index);
                            setHref(`#slide-${index + 1}`);
                            setError("");
                          }}
                        >
                          {index + 1}. {title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="insert-hyperlink-preview-column">
                  <span>Slide preview:</span>
                  <div className="insert-hyperlink-slide-preview" />
                  <label className="insert-hyperlink-checkbox">
                    <input
                      type="checkbox"
                      checked={showAndReturn}
                      onChange={(event) =>
                        setShowAndReturn(event.target.checked)
                      }
                    />
                    <span>Show and return</span>
                  </label>
                </div>
              </div>
            ) : linkType === "new" ? (
              <div className="insert-hyperlink-new-panel">
                <label>
                  <span>Name of new document:</span>
                  <input
                    value={newDocumentName}
                    onChange={(event) => {
                      setNewDocumentName(event.target.value);
                      setHref(event.target.value);
                      setError("");
                    }}
                  />
                </label>
                <div className="insert-hyperlink-full-path-row">
                  <span>Full path:</span>
                  <button type="button">Change...</button>
                  <strong>C:\Users\user\Downloads\</strong>
                </div>
                <fieldset className="insert-hyperlink-edit-options">
                  <legend>When to edit:</legend>
                  <label>
                    <input
                      type="radio"
                      name="edit-new-document"
                      checked={!editNewDocumentNow}
                      onChange={() => setEditNewDocumentNow(false)}
                    />
                    <span>Edit the new document later</span>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="edit-new-document"
                      checked={editNewDocumentNow}
                      onChange={() => setEditNewDocumentNow(true)}
                    />
                    <span>Edit the new document now</span>
                  </label>
                </fieldset>
              </div>
            ) : linkType === "email" ? (
              <div className="insert-hyperlink-email-panel">
                <label>
                  <span>E-mail address:</span>
                  <input
                    value={emailAddress}
                    onChange={(event) => {
                      setEmailAddress(event.target.value);
                      setHref(event.target.value);
                      setError("");
                    }}
                  />
                </label>
                <label>
                  <span>Subject:</span>
                  <input
                    value={emailSubject}
                    onChange={(event) => setEmailSubject(event.target.value)}
                  />
                </label>
                <span>Recently used e-mail addresses:</span>
                <div className="insert-hyperlink-recent-emails" />
              </div>
            ) : (
              <div className="insert-hyperlink-placeholder-panel">
                {linkType === "place" &&
                  "Enter a slide bookmark or anchor address below."}
                {linkType === "new" &&
                  "Enter the new document path or web address below."}
                {linkType === "email" &&
                  "Enter an e-mail address below. It will be saved as a mailto link."}
              </div>
            )}
          </section>
        </div>
        {linkType === "web" && (
          <label className="hyperlink-dialog-field insert-hyperlink-address-row">
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
        )}
        {screenTip && (
          <div className="insert-hyperlink-screentip">
            ScreenTip: {screenTip}
          </div>
        )}
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
  hyperlinkText = "",
  onExitEditText,
  onFormatText,
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
        selectedText={hyperlinkText}
        presentation={presentation}
        onApply={(payload) => {
          const ok = onHyperlink?.(elementId, payload);
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
          <ContextMenuItem
            icon={<MdUndo />}
            label="Undo"
            shortcut="Ctrl+Z"
            disabled={!canUndo}
            onClick={() => run(onUndo)}
          />
          <ContextMenuItem
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
        <ContextMenuItem
          icon={<MdContentCut />}
          label="Cut"
          shortcut="Ctrl+X"
          disabled={!hasSelection}
          onClick={() => run(onCut)}
        />
      )}
      {matches("Copy") && (
        <ContextMenuItem
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
                badge="F"
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
            <ContextMenuItem
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
        <TextFormattingMenu
          elementId={elementId}
          formatting={formatting}
          matches={matches}
          submenu={submenu}
          setSubmenu={setSubmenu}
          setDialog={setDialog}
          run={run}
          onExitEditText={onExitEditText}
          onNewComment={onNewComment}
          applyFormatting={applyTextFormatting}
        />
      )}

      {!isText && (
        <CanvasSelectionMenu
          hasSelection={hasSelection}
          run={run}
          onBringToFront={onBringToFront}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onSendToBack={onSendToBack}
          onRotateRight={onRotateRight}
          onNewComment={onNewComment}
          onDelete={onDelete}
          onSelectAll={onSelectAll}
        />
      )}
    </div>,
    document.body,
  );
}
