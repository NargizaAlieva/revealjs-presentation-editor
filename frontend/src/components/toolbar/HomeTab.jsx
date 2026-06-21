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
  onMoveSlideUp,
  onMoveSlideDown,
  canDelete,
  canMoveUp,
  canMoveDown,
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
        onToggleSlideHidden={onToggleSlideHidden}
        isSlideHidden={isSlideHidden}
        onMoveSlideUp={onMoveSlideUp}
        onMoveSlideDown={onMoveSlideDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
    </>
  );
}
