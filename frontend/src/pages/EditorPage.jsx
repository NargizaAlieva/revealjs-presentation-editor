import { useState } from "react";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useEditorState } from "../hooks/useEditorState";
import { useSlides } from "../hooks/useSlides";
import { useEditorActions } from "../hooks/useEditorActions";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import { exportToReveal } from "../core/export/exportToReveal";
// import GlobalSettingsPanel from "../components/GlobalSettingsPanel";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image file"));

    reader.readAsDataURL(file);
  });

const createMediaElement = (base64, file) => ({
  id: crypto.randomUUID(),
  "file-link": base64,
  "media-type": "image",
  position: { x: 60, y: 60 },
  width: 300,
  height: 200,
  rotation: 0,
  "z-index": 1,
  scale: 1,
  name: file.name,
});

export default function EditorPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { state, eventBus } = useEditorState();
  const { presentation, slides, selectedSlide, selectedSlideIndex } =
    useSlides(state);
  const actions = useEditorActions(eventBus, selectedSlideIndex, slides.length);

  const exportPresentation = () => {
    exportToReveal(presentation);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      const mediaElement = createMediaElement(base64, file);
      actions.addMedia(mediaElement);
    } catch (error) {
      console.error("Image upload failed:", error.message);
    }

    event.target.value = "";
  };

  return (
    <div className="editor-page">
      <SlideList
        slides={slides}
        selectedSlideId={selectedSlideIndex}
        onSelectSlide={actions.setSelectedSlideId}
      />

      <div className="editor-main" style={{ display: "flex", flex: 1 }}>
        <Toolbar
          onAddSlide={actions.addSlide}
          onDeleteSlide={actions.deleteSlide}
          onDuplicateSlide={actions.duplicateSlide}
          onMoveSlideUp={actions.moveSlideUp}
          onMoveSlideDown={actions.moveSlideDown}
          onSavePresentation={actions.savePresentation}
          onExportPresentation={exportPresentation}
          onOpenPreview={() => setIsPreviewOpen(true)}
          canDelete={slides.length > 1}
          canMoveUp={selectedSlideIndex > 0}
          canMoveDown={selectedSlideIndex < slides.length - 1}
          onResetPresentation={actions.resetPresentation}
          onImageUpload={handleImageUpload}
          onToggleSlideHidden={() =>
            actions.toggleSlideHidden(selectedSlideIndex)
          }
          isSlideHidden={selectedSlide?.hidden}
        />

        {selectedSlide && (
          <EditorCanvas
            slide={selectedSlide}
            onChangeTextElement={actions.updateTextElementContent}
            onMoveTextElement={actions.updateTextElementPosition}
            onResizeTextElement={actions.updateTextElementSize}
            onFormatTextElement={actions.updateTextElementFormatting}
            onMoveMediaElement={actions.updateTextElementPosition}
            onResizeMediaElement={actions.updateTextElementSize}
            onDeleteTextElement={actions.deleteElement}
            onDeleteMedia={actions.deleteMedia}
          />
        )}

        {/* <GlobalSettingsPanel
          presentation={presentation}
          updateMasterDimensions={actions.updateMasterDimensions}
          updateSlideTransition={actions.updateSlideTransition}
        /> */}
      </div>

      {isPreviewOpen && (
        <PreviewModal
          slides={slides}
          presentation={presentation}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
