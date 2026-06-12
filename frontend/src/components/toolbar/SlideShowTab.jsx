import { MdPreview } from "react-icons/md";

export default function SlideShowTab({ onOpenPreview }) {
  return (
    <div className="ribbon-group">
      <button className="toolbar-item large" onClick={onOpenPreview}>
        <MdPreview />
        <span>Preview</span>
      </button>

      <div className="ribbon-group-title">Slide Show</div>
    </div>
  );
}
