import { forwardRef } from "react";

const TextEditableSurface = forwardRef(function TextEditableSurface({
  isEditable,
  isTextBoxEmpty,
  isTextBoxPrompt,
  editableStyle,
  listType,
  listMarker,
  listNumberedStyle,
  onFocus,
  onMouseUp,
  onTouchEnd,
  onContextMenu,
  onKeyUp,
  onKeyDown,
  onBeforeInput,
  onInput,
  onBlur,
}, ref) {
  return (
    <div
      ref={ref}
      contentEditable={isEditable}
      suppressContentEditableWarning
      spellCheck={false}
      className="text-editable"
      data-placeholder="Click to edit text"
      data-empty={isTextBoxEmpty ? "true" : undefined}
      data-prompt-text={isTextBoxPrompt ? "true" : undefined}
      data-list-type={listType ?? undefined}
      data-list-marker={listMarker}
      data-list-numbered-style={listNumberedStyle}
      style={editableStyle}
      onFocus={onFocus}
      onMouseUp={onMouseUp}
      onTouchEnd={onTouchEnd}
      onContextMenu={onContextMenu}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      onBeforeInput={onBeforeInput}
      onInput={onInput}
      onBlur={onBlur}
    />
  );
});

export default TextEditableSurface;
