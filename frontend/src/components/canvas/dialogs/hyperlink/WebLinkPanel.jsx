import {
  MdDescription,
  MdFolder,
  MdInsertDriveFile,
  MdSearch,
} from "react-icons/md";

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

export default function WebLinkPanel({
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
