import "./Toolbar.css";

export default function Toolbar({ onAddSlide, onDeleteSlide }) {
  return (
    <header className="toolbar">
      <button onClick={onAddSlide}>New Slide</button>
      <button onClick={onDeleteSlide}>Delete Slide</button>
      <button>Save</button>
      <button>Preview</button>
    </header>
  );
}