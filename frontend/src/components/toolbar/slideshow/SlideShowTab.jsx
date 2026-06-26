import { MdPlayArrow, MdSkipNext } from "react-icons/md";
import "./SlideShowTab.css";

export default function SlideShowTab({
  onOpenPreviewFromBeginning,
  onOpenPreviewFromCurrent,
}) {
  return (
    <div className="ribbon-group slideshow-group">
      <button
        className="slideshow-btn"
        onClick={onOpenPreviewFromBeginning}
        title="Start from the beginning"
      >
        <MdPlayArrow className="slideshow-btn-icon" />
        <span>{"From\nBeginning"}</span>
      </button>

      <button
        className="slideshow-btn"
        onClick={onOpenPreviewFromCurrent}
        title="Start from the current slide"
      >
        <MdSkipNext className="slideshow-btn-icon" />
        <span>{"From\nCurrent Slide"}</span>
      </button>

      <div className="ribbon-group-title">Start Slide Show</div>
    </div>
  );
}