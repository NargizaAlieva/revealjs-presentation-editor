import { MdPlayArrow, MdSave } from "react-icons/md";

export default function ToolbarQuickActions({
  onSavePresentation,
  onOpenPreviewFromBeginning,
  autosaveEnabled = true,
  onToggleAutosave,
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
      <button
        type="button"
        className="toolbar-autosave"
        role="switch"
        aria-checked={autosaveEnabled}
        onClick={onToggleAutosave}
        title={`Turn AutoSave ${autosaveEnabled ? "off" : "on"}`}
      >
        <span>AutoSave</span>
        <span
          className={`toolbar-autosave-switch${
            autosaveEnabled ? " is-on" : ""
          }`}
          aria-hidden="true"
        >
          <span />
        </span>
      </button>
    </div>
  );
}
