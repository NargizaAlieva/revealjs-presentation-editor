import { MdImage, MdTextFields, MdVideoLibrary } from "react-icons/md";

export default function InsertTab({ onImageUpload, onVideoUpload }) {
  return (
    <div className="ribbon-group">
      <label className="toolbar-item large toolbar-upload">
        <MdImage />
        <span>Pictures</span>
        <input type="file" accept="image/*" onChange={onImageUpload} hidden />
      </label>

      <label className="toolbar-item large toolbar-upload">
        <MdVideoLibrary />
        <span>Video</span>
        <input type="file" accept="video/*" onChange={onVideoUpload} hidden />
      </label>

      <button className="toolbar-item large" disabled>
        <MdTextFields />
        <span>Text Box</span>
      </button>

      <div className="ribbon-group-title">Insert</div>
    </div>
  );
}
