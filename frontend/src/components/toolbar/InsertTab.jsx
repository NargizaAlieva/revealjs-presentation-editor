import { MdImage, MdTextFields } from "react-icons/md";

export default function InsertTab({ onImageUpload }) {
  return (
    <div className="ribbon-group">
      <label className="toolbar-item large toolbar-upload">
        <MdImage />
        <span>Pictures</span>
        <input type="file" accept="image/*" onChange={onImageUpload} hidden />
      </label>

      <button className="toolbar-item large" disabled>
        <MdTextFields />
        <span>Text Box</span>
      </button>

      <div className="ribbon-group-title">Insert</div>
    </div>
  );
}
