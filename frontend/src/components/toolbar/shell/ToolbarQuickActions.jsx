import { MdPlayArrow, MdSave } from "react-icons/md";

export default function ToolbarQuickActions({
  onSavePresentation,
  onOpenPreviewFromBeginning,
}) {
  return (
    <div className="toolbar-quick-actions" aria-label="Quick actions">
      <button
        type="button"
        className="toolbar-quick-action"
        onClick={onSavePresentation}
        title="Save"
      >
        <MdSave />
        <span>Save</span>
      </button>
      <button
        type="button"
        className="toolbar-quick-action"
        onClick={onOpenPreviewFromBeginning}
        title="Start the show from the first slide"
      >
        <MdPlayArrow />
        <span>Start</span>
      </button>
    </div>
  );
}
