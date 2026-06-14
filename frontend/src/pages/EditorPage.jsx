import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useEditorState } from "../hooks/useEditorState";
import { idbSet } from "../core/persistence/autoSaveService";
import { useSlides } from "../hooks/useSlides";
import { useEditorActions } from "../hooks/useEditorActions";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import StatusBar from "../components/StatusBar";
import { getSlideSize } from "../utils/slidesetRenderUtils";
import { usePresentationFonts } from "../hooks/usePresentationFonts";
import { useVideoUpload } from "../hooks/useVideoUpload";
import FileMenu from "../components/FileMenu";
import {
  exportToReveal,
  exportToRevealZip,
} from "../core/export/exportToReveal";
import {
  deletePresentation,
  createPresentation,
  presentationKey,
} from "../core/persistence/presentationsLibrary";

export default function EditorPage() {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewStartSlide, setPreviewStartSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("Home");
  const [previewEffect, setPreviewEffect] = useState(null);
  const [zoom, setZoom] = useState(70);
  const [showNotes, setShowNotes] = useState(true);

  const { state, eventBus, isLoading } = useEditorState(presentationId);
  const {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
  } = useSlides(state);

  usePresentationFonts(presentation);

  const {
    setSelectedSlideId,
    selectElement,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,
    reorderSlide,
    savePresentation,
    resetPresentation,
    updateTextElementContent,
    updateTextElementFormatting,
    updateElementPosition,
    updateElementSize,
    updateElement,
    addMedia,
    updateMedia,
    deleteElement,
    toggleSlideHidden,
    deleteMedia,
    updateSlideNotes,
    updateSlideTransition,
    updateTransitionDuration,
    applyTransitionToAll,
    applyLayout,
    addAnimation,
    updateAnimation,
    deleteAnimation,
    beginHistory,
    commitHistory,
    cancelHistory,
    undo,
    redo,
    copyElement,
    pasteElement,
  } = useEditorActions(
    eventBus,
    selectedSlideIndex,
    slides.length,
    presentationId,
  );

  const { handleVideoUpload } = useVideoUpload(addMedia);

  const exportPresentation = async () => exportToReveal(presentation);

  const triggerAnimationPreview = (elementId, effect, speed) => {
    setPreviewEffect({
      type: "animation",
      elementId,
      effect,
      speed,
      key: Date.now(),
    });
  };

  const triggerTransitionPreview = (effect) => {
    setPreviewEffect({
      type: "transition",
      effect,
      key: Date.now(),
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const mediaId = crypto.randomUUID();
    const key = `media/${mediaId}`;

    await idbSet(key, file);

    addMedia({
      id: mediaId,
      "file-link": `indexeddb://${key}`,
      "media-type": "image",
      position: { x: 60, y: 60 },
      width: 300,
      height: 200,
      rotation: 0,
      "z-index": 1,
      scale: 1,
      crop: [],
      effects: {},
      playback: {},
    });

    event.target.value = "";
  };

  const zoomIn = () => setZoom((z) => Math.min(200, z + 10));
  const zoomOut = () => setZoom((z) => Math.max(25, z - 10));
  const handleCanvasZoom = (delta) =>
    setZoom((z) => Math.min(200, Math.max(25, z + delta)));

  const selectedElement = (() => {
    if (!selectedElementId) return null;

    const textElement = (selectedSlide?.contents?.text ?? []).find(
      (item) => item.id === selectedElementId,
    );
    if (textElement) {
      return {
        id: textElement.id,
        label: textElement.paragraphs?.[0]?.runs?.[0]?.text || "Text",
      };
    }

    const mediaElement = (selectedSlide?.contents?.media ?? []).find(
      (item) => item.id === selectedElementId,
    );
    if (mediaElement) {
      return { id: mediaElement.id, label: "Image" };
    }

    return null;
  })();

  const selectedTextEl = selectedElementId
    ? (selectedSlide?.contents?.text ?? []).find(
      (t) => t.id === selectedElementId,
    )
    : null;

  const currentFormatting = selectedTextEl?.paragraphs?.[0]?.formatting ?? {};

  const handleFormatChange = (updates) => {
    if (!selectedElementId || !selectedTextEl) return;
    updateTextElementFormatting(selectedElementId, updates);
  };

  const { width: slideWidth, height: slideHeight } = getSlideSize(presentation);

  const currentTransition = selectedSlide?.contents?.transition ?? "none";
  const currentDuration = selectedSlide?.contents?.transitionDuration ?? 0.75;

  const presentationTitle =
    presentation?.slideset?.title ??
    presentation?.slideset?.filename ??
    "Untitled Presentation";

  const handleSaveAs = () => {
    const json = JSON.stringify(presentation, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${presentationTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadFile = async (jsonText) => {
    try {
      const data = JSON.parse(jsonText);
      const id = await createPresentation(
        data?.slideset?.title ?? "Imported Presentation",
      );
      idbSet(presentationKey(id), data);
      navigate(`/editor/${id}`);
    } catch (e) {
      console.error("Failed to load file:", e);
    }
  };

  const handleDeleteAndGoHome = async () => {
    if (!presentationId) return;
    const ok = window.confirm(
      "Delete this presentation? This cannot be undone.",
    );
    if (!ok) return;
    await deletePresentation(presentationId);
    navigate("/");
  };

  if (isLoading) {
    return <div className="editor-loading">Loading...</div>;
  }

  if (activeTab === "File") {
    return (
      <FileMenu
        presentationTitle={presentationTitle}
        onClose={() => setActiveTab("Home")}
        onGoHome={() => navigate("/")}
        onSave={savePresentation}
        onSaveAs={handleSaveAs}
        onExport={exportPresentation}
        onExportZip={() => exportToRevealZip(presentation)}
        onLoadFile={handleLoadFile}
        onDelete={handleDeleteAndGoHome}
      />
    );
  }

  return (
    <div className="editor-page">
      <div className="toolbar-overlay">
        <Toolbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
          onMoveSlideUp={moveSlideUp}
          onMoveSlideDown={moveSlideDown}
          onSavePresentation={savePresentation}
          onExportPresentation={exportPresentation}
          onOpenPreviewFromBeginning={() => {
            setPreviewStartSlide(0);
            setIsPreviewOpen(true);
          }}
          onOpenPreviewFromCurrent={() => {
            setPreviewStartSlide(selectedSlideIndex);
            setIsPreviewOpen(true);
          }}
          canDelete={slides.length > 1}
          canMoveUp={selectedSlideIndex > 0}
          canMoveDown={selectedSlideIndex < slides.length - 1}
          onResetPresentation={resetPresentation}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          onToggleSlideHidden={() => toggleSlideHidden(selectedSlideIndex)}
          isSlideHidden={selectedSlide?.hidden}
          onTransitionChange={(transition) => updateSlideTransition(transition)}
          currentTransition={currentTransition}
          currentDuration={currentDuration}
          onDurationChange={(duration) => updateTransitionDuration(duration)}
          onApplyTransitionToAll={() =>
            applyTransitionToAll(currentTransition, currentDuration)
          }
          selectedElement={selectedElement}
          animations={selectedSlide?.contents?.animations ?? []}
          onAddAnimation={addAnimation}
          onUpdateAnimation={updateAnimation}
          onDeleteAnimation={deleteAnimation}
          onAnimationPreview={triggerAnimationPreview}
          onTransitionPreview={triggerTransitionPreview}
          onPreviewEffect={setPreviewEffect}
          currentFormatting={currentFormatting}
          onFormatChange={handleFormatChange}
          isTextSelected={!!selectedTextEl}
          presentation={presentation}
          onApplyLayout={applyLayout}
        />
      </div>

      <div className="editor-body">
        <SlideList
          slides={slides}
          selectedSlideId={selectedSlideIndex}
          onSelectSlide={setSelectedSlideId}
          onReorderSlide={reorderSlide}
          slideWidth={slideWidth}
          slideHeight={slideHeight}
        />

        <div className="editor-main">
          {selectedSlide && (
            <EditorCanvas
              slide={selectedSlide}
              presentation={presentation}
              onChangeTextElement={updateTextElementContent}
              onMoveTextElement={updateElementPosition}
              onResizeTextElement={updateElementSize}
              onFormatTextElement={updateTextElementFormatting}
              onMoveMediaElement={updateElementPosition}
              onResizeMediaElement={updateElementSize}
              onDeleteTextElement={deleteElement}
              onDeleteMedia={deleteMedia}
              slideNotes={selectedSlide?.contents?.notes ?? ""}
              onUpdateSlideNotes={updateSlideNotes}
              zoom={zoom}
              showNotes={showNotes}
              onCanvasZoom={handleCanvasZoom}
              selectedElementId={selectedElementId}
              onSelectElement={selectElement}
              onBeginHistory={beginHistory}
              onCommitHistory={commitHistory}
              onCancelHistory={cancelHistory}
              updateElement={updateElement}
              updateMedia={updateMedia}
              previewEffect={previewEffect}
              animations={selectedSlide?.contents?.animations ?? []}
              showAnimationBadges={activeTab === "Animations"}
              onUndo={undo}
              onRedo={redo}
              onCopy={copyElement}
              onPaste={pasteElement}
            />
          )}
        </div>
      </div>

      <div className="statusbar-overlay">
        <StatusBar
          selectedSlideIndex={selectedSlideIndex}
          totalSlides={slides.length}
          zoom={zoom}
          onZoomChange={setZoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          showNotes={showNotes}
          onToggleNotes={() => setShowNotes((v) => !v)}
        />
      </div>

      {isPreviewOpen && (
        <PreviewModal
          slides={slides}
          presentation={presentation}
          onClose={() => setIsPreviewOpen(false)}
          initialSlide={previewStartSlide}
        />
      )}
    </div>
  );
}
