import "./HomeTab.css";
import { DEFAULT_FONTS } from "./homeTabConstants";
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
  const presentationFonts = (presentation?.slideset?.fonts ?? [])
    .map((f) => f["font-id"])
    .filter(Boolean);
  const fonts =
    presentationFonts.length > 0 ? presentationFonts : DEFAULT_FONTS;

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