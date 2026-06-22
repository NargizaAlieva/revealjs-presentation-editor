import "./HomeTab.css";
import { getAvailableFonts } from "../../core/model/fontConfig";
import ClipboardGroup from "./ClipboardGroup";
import SlidesGroup from "./SlidesGroup";
import FontGroup from "./FontGroup";
import ParagraphGroup from "./ParagraphGroup";
import ArrangeGroup from "./ArrangeGroup";

export default function HomeTab({
  onAddSlide,
  onApplyLayout,
  onResetLayout,
  onDeleteSlide,
  onDuplicateSlide,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onRotateRight,
  canDelete,
  onToggleSlideHidden,
  isSlideHidden,
  currentFormatting = {},
  onFormatChange,
  isTextSelected = false,
  presentation,
  onCut,
  onCopy,
  onPaste,
  hasSelection = false,
  canPaste = false,
}) {
  const fonts = getAvailableFonts(presentation);

  return (
    <>
      <ClipboardGroup
        onCut={onCut}
        onCopy={onCopy}
        onPaste={onPaste}
        hasSelection={hasSelection}
        canPaste={canPaste}
      />

      <SlidesGroup
        onAddSlide={onAddSlide}
        onApplyLayout={onApplyLayout}
        onResetLayout={onResetLayout}
        onDeleteSlide={onDeleteSlide}
        onDuplicateSlide={onDuplicateSlide}
        canDelete={canDelete}
        onToggleSlideHidden={onToggleSlideHidden}
        isSlideHidden={isSlideHidden}
        presentation={presentation}
      />

      <FontGroup
        currentFormatting={currentFormatting}
        isTextSelected={isTextSelected}
        fonts={fonts}
        onFormatChange={onFormatChange}
      />

      <ParagraphGroup
        currentFormatting={currentFormatting}
        isTextSelected={isTextSelected}
        onFormatChange={onFormatChange}
      />

      <ArrangeGroup
        hasSelection={hasSelection}
        onBringToFront={onBringToFront}
        onSendToBack={onSendToBack}
        onBringForward={onBringForward}
        onSendBackward={onSendBackward}
        onRotateRight={onRotateRight}
      />
    </>
  );
}
