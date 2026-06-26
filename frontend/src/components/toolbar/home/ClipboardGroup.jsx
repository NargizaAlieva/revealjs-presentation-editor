import {
  MdContentPaste,
  MdContentCut,
  MdContentCopy,
  MdUndo,
  MdRedo,
} from "react-icons/md";

export default function ClipboardGroup({
  onCut,
  onCopy,
  onPaste,
  onUndo,
  onRedo,
  hasSelection = false,
  canPaste = false,
  canUndo = false,
  canRedo = false,
}) {
  return (
    <div className="ribbon-group clipboard-group">
      <button
        className="toolbar-item large"
        disabled={!canPaste}
        onClick={onPaste}
        title="Paste (Ctrl+V)"
      >
        <MdContentPaste />
        <span>Paste</span>
      </button>

      <div className="mini-stack">
        <button
          className="mini-command"
          disabled={!hasSelection}
          onClick={onCut}
          title="Cut (Ctrl+X)"
        >
          <MdContentCut />
        </button>
        <button
          className="mini-command"
          disabled={!hasSelection}
          onClick={onCopy}
          title="Copy (Ctrl+C)"
        >
          <MdContentCopy />
        </button>
      </div>

      <div className="mini-stack">
        <button
          className="mini-command"
          disabled={!canUndo}
          onClick={onUndo}
          title="Undo (Ctrl+Z)"
        >
          <MdUndo />
        </button>
        <button
          className="mini-command"
          disabled={!canRedo}
          onClick={onRedo}
          title="Redo (Ctrl+Y)"
        >
          <MdRedo />
        </button>
      </div>

      <div className="ribbon-group-title">Clipboard</div>
    </div>
  );
}
