import { useEffect, useRef, useState } from "react";
import {
  MdDescription,
  MdFolder,
  MdInsertDriveFile,
  MdMailOutline,
  MdSearch,
  MdWeb,
} from "react-icons/md";
import "./TextContextDialogs.css";

const LINK_TYPES = [
  { value: "web", label: "Existing File or Web Page", icon: <MdWeb /> },
  { value: "place", label: "Place in This Document", icon: <MdDescription /> },
  { value: "new", label: "Create New Document", icon: <MdDescription /> },
  { value: "email", label: "E-mail Address", icon: <MdMailOutline /> },
];

const WEB_FOLDERS = ["Current Folder", "Browsed Pages", "Recent Files"];
const CURRENT_FILES = [
  "9.641j-spring-2005",
  "conference-latex-template",
  "eCommerce-React-main",
  "Example",
  "fashion-images",
  "films-main",
  "generative_ai_acm",
];
const BROWSED_PAGES = [
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
const RECENT_FILES = [
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

function BrowseButton({ title, icon, active, onClick }) {
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

function BrowseButtons({ activeButton, onBrowse, onChooseFile }) {
  return (
    <>
      <BrowseButton
        title="Browse the Web"
        icon={<MdSearch />}
        active={activeButton === "web"}
        onClick={() => onBrowse("web")}
      />
      <BrowseButton
        title="Browse for File"
        icon={<MdDescription />}
        active={activeButton === "file"}
        onClick={() => {
          onBrowse("file");
          onChooseFile();
        }}
      />
      <BrowseButton
        title="Browse for Folder"
        icon={<MdFolder />}
        active={activeButton === "folder"}
        onClick={() => {
          onBrowse("folder");
          onChooseFile();
        }}
      />
    </>
  );
}

function WebLinkPanel({
  activeButton,
  fileInputRef,
  selectedFile,
  webFolder,
  onBrowse,
  onChooseFile,
  onFileChange,
  onFolderChange,
  onHrefChange,
}) {
  const isCurrentFolder = webFolder === "Current Folder";
  const items =
    webFolder === "Browsed Pages"
      ? BROWSED_PAGES
      : webFolder === "Recent Files"
        ? RECENT_FILES
        : CURRENT_FILES;

  return (
    <>
      {isCurrentFolder ? (
        <div className="insert-hyperlink-lookin-row">
          <span>Look in:</span>
          <select defaultValue="Downloads">
            <option>Downloads</option>
            <option>Documents</option>
            <option>Desktop</option>
          </select>
          <BrowseButtons
            activeButton={activeButton}
            onBrowse={onBrowse}
            onChooseFile={onChooseFile}
          />
        </div>
      ) : (
        <div className="insert-hyperlink-history-toolbar">
          <BrowseButtons
            activeButton={activeButton}
            onBrowse={onBrowse}
            onChooseFile={onChooseFile}
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
          {WEB_FOLDERS.map((folder) => (
            <button
              type="button"
              key={folder}
              className={webFolder === folder ? "active" : ""}
              onClick={() => onFolderChange(folder)}
            >
              {folder}
            </button>
          ))}
        </nav>
        <div
          className={[
            "insert-hyperlink-file-list",
            !isCurrentFolder ? "insert-hyperlink-file-list--history" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isCurrentFolder && selectedFile && (
            <button
              type="button"
              className="selected"
              onClick={() => onHrefChange(selectedFile.href)}
            >
              <MdInsertDriveFile />
              <span>{selectedFile.name}</span>
            </button>
          )}
          {items.map((file) => (
            <button
              type="button"
              key={file}
              onClick={() => onHrefChange(file)}
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
            onClick={onChooseFile}
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
        onChange={onFileChange}
      />
    </>
  );
}

function PlaceLinkPanel({
  slideTitles,
  selectedSlideIndex,
  showAndReturn,
  onSlideSelect,
  onShowAndReturnChange,
}) {
  return (
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
                className={selectedSlideIndex === index ? "selected" : ""}
                onClick={() => onSlideSelect(index)}
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
            onChange={(event) => onShowAndReturnChange(event.target.checked)}
          />
          <span>Show and return</span>
        </label>
      </div>
    </div>
  );
}

function NewDocumentPanel({
  documentName,
  editNow,
  onDocumentNameChange,
  onEditNowChange,
}) {
  return (
    <div className="insert-hyperlink-new-panel">
      <label>
        <span>Name of new document:</span>
        <input
          value={documentName}
          onChange={(event) => onDocumentNameChange(event.target.value)}
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
            checked={!editNow}
            onChange={() => onEditNowChange(false)}
          />
          <span>Edit the new document later</span>
        </label>
        <label>
          <input
            type="radio"
            name="edit-new-document"
            checked={editNow}
            onChange={() => onEditNowChange(true)}
          />
          <span>Edit the new document now</span>
        </label>
      </fieldset>
    </div>
  );
}

function EmailLinkPanel({
  emailAddress,
  emailSubject,
  onAddressChange,
  onSubjectChange,
}) {
  return (
    <div className="insert-hyperlink-email-panel">
      <label>
        <span>E-mail address:</span>
        <input
          value={emailAddress}
          onChange={(event) => onAddressChange(event.target.value)}
        />
      </label>
      <label>
        <span>Subject:</span>
        <input
          value={emailSubject}
          onChange={(event) => onSubjectChange(event.target.value)}
        />
      </label>
      <span>Recently used e-mail addresses:</span>
      <div className="insert-hyperlink-recent-emails" />
    </div>
  );
}

export default function HyperlinkDialog({
  selectedText = "",
  existingLink = null,
  presentation,
  onApply,
  onRemove,
  onClose,
}) {
  const [href, setHref] = useState(existingLink?.href ?? "");
  const [displayText, setDisplayText] = useState(selectedText);
  const [screenTip, setScreenTip] = useState(existingLink?.screenTip ?? "");
  const [linkType, setLinkType] = useState(existingLink?.type ?? "web");
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

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const clearError = () => setError("");
  const changeHref = (value) => {
    setHref(value);
    clearError();
  };
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
    clearError();
  };

  const submit = (event) => {
    event.preventDefault();
    const value =
      linkType === "place"
        ? `#slide-${selectedSlideIndex + 1}`
        : linkType === "new"
          ? newDocumentName.trim()
          : linkType === "email"
            ? emailAddress.trim()
            : href.trim();
    if (!value) {
      const messages = {
        place: "Select a place in this document.",
        new: "Enter a new document name.",
        email: "Enter an e-mail address.",
        web: "Enter a link address.",
      };
      setError(messages[linkType]);
      return;
    }

    const finalHref =
      linkType === "email" && emailSubject.trim()
        ? `${value}?subject=${encodeURIComponent(emailSubject.trim())}`
        : value;
    const ok = onApply?.({
      href: finalHref,
      text: displayText.trim(),
      screenTip: screenTip.trim(),
      type: linkType,
      showAndReturn,
      editNewDocumentNow,
    });
    if (ok === false) {
      setError("Select text in one paragraph before adding a hyperlink.");
    } else if (objectUrlRef.current === finalHref) {
      // The applied hyperlink now owns this object URL. Revoking it while the
      // dialog unmounts would immediately make the selected local file invalid.
      objectUrlRef.current = "";
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
            {LINK_TYPES.map((item) => (
              <button
                type="button"
                key={item.value}
                className={linkType === item.value ? "active" : ""}
                onClick={() => {
                  setLinkType(item.value);
                  clearError();
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </aside>
          <section className="insert-hyperlink-main">
            {linkType === "web" && (
              <WebLinkPanel
                activeButton={activeBrowseButton}
                fileInputRef={fileInputRef}
                selectedFile={selectedFile}
                webFolder={webFolder}
                onBrowse={setActiveBrowseButton}
                onChooseFile={() => fileInputRef.current?.click()}
                onFileChange={chooseLocalFile}
                onFolderChange={(folder) => {
                  setWebFolder(folder);
                  clearError();
                }}
                onHrefChange={changeHref}
              />
            )}
            {linkType === "place" && (
              <PlaceLinkPanel
                slideTitles={slideTitles}
                selectedSlideIndex={selectedSlideIndex}
                showAndReturn={showAndReturn}
                onSlideSelect={(index) => {
                  setSelectedSlideIndex(index);
                  changeHref(`#slide-${index + 1}`);
                }}
                onShowAndReturnChange={setShowAndReturn}
              />
            )}
            {linkType === "new" && (
              <NewDocumentPanel
                documentName={newDocumentName}
                editNow={editNewDocumentNow}
                onDocumentNameChange={(value) => {
                  setNewDocumentName(value);
                  changeHref(value);
                }}
                onEditNowChange={setEditNewDocumentNow}
              />
            )}
            {linkType === "email" && (
              <EmailLinkPanel
                emailAddress={emailAddress}
                emailSubject={emailSubject}
                onAddressChange={(value) => {
                  setEmailAddress(value);
                  changeHref(value);
                }}
                onSubjectChange={setEmailSubject}
              />
            )}
          </section>
        </div>
        {linkType === "web" && (
          <label className="hyperlink-dialog-field insert-hyperlink-address-row">
            <span>Address:</span>
            <input
              autoFocus
              value={href}
              onChange={(event) => changeHref(event.target.value)}
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
