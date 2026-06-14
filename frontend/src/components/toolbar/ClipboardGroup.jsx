import { MdContentPaste, MdContentCut, MdContentCopy } from "react-icons/md";

export default function ClipboardGroup({
  onCut,
  onCopy,
  onPaste,
  hasSelection = false,
  canPaste = false,
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

      <div className="ribbon-group-title">Clipboard</div>
    </div>
  );
}
