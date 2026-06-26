import { MdFileUpload, MdRestartAlt, MdSave } from "react-icons/md";

export default function FileTab({
  onSavePresentation,
  onExportPresentation,
  onResetPresentation,
}) {
  return (
    <div className="ribbon-group">
      <button className="toolbar-item large" onClick={onSavePresentation}>
        <MdSave />
        <span>Save</span>
      </button>

      <button className="toolbar-item large" onClick={onExportPresentation}>
        <MdFileUpload />
        <span>Export</span>
      </button>

      <button className="toolbar-item large" onClick={onResetPresentation}>
        <MdRestartAlt />
        <span>Reset</span>
      </button>

      <div className="ribbon-group-title">File</div>
    </div>
  );
}
