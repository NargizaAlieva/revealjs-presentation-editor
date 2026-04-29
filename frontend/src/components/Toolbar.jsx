export default function Toolbar({
  onAddSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  onSavePresentation,
}) {
  return (
    <header className="toolbar">
      <button onClick={onAddSlide}>New Slide</button>
      <button onClick={onDeleteSlide}>Delete Slide</button>
      <button onClick={onDuplicateSlide}>Duplicate Slide</button>
      <button onClick={onMoveSlideUp}>↑</button>
      <button onClick={onMoveSlideDown}>↓</button>
      <button onClick={onSavePresentation}>Save</button>
      <button>Preview</button>
    </header>
  );
}
