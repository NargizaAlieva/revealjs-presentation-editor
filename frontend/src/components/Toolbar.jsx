import "./Toolbar.css";

export default function Toolbar({
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  onSavePresentation,
  onOpenPreview,
  canDelete,
  canMoveUp,
  canMoveDown,
  onExportPresentation,
}) {
  return (
    <header className="toolbar">
      <button onClick={onAddSlide}>New Slide</button>

      <button onClick={onDeleteSlide} disabled={!canDelete}>
        Delete Slide
      </button>

      <button onClick={onDuplicateSlide}>Duplicate Slide</button>

      <button onClick={onMoveSlideUp} disabled={!canMoveUp}>
        ↑
      </button>

      <button onClick={onMoveSlideDown} disabled={!canMoveDown}>
        ↓
      </button>

      <button onClick={onSavePresentation}>Save</button>
      <button onClick={onOpenPreview}>Preview</button>
      <button onClick={onExportPresentation}>Export</button>
    </header>
  );
}
