import { MdFileUpload, MdImage, MdVideocam } from "react-icons/md";

export default function PlaceholderActionButtons({
  onImageClick,
  onVideoClick,
}) {
  if (!onImageClick && !onVideoClick) return null;

  return (
    <div
      className="content-placeholder-buttons"
      aria-label="Content placeholder actions"
    >
      {onImageClick && (
        <button
          type="button"
          title="Insert Picture"
          aria-label="Insert Picture"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onImageClick();
          }}
        >
          <MdImage />
          <span className="placeholder-upload-badge">
            <MdFileUpload />
          </span>
        </button>
      )}
      {onVideoClick && (
        <button
          type="button"
          title="Insert Video"
          aria-label="Insert Video"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onVideoClick();
          }}
        >
          <MdVideocam />
          <span className="placeholder-upload-badge">
            <MdFileUpload />
          </span>
        </button>
      )}
    </div>
  );
}
