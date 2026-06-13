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
import FileMenu from "../components/FileMenu";
import { exportToReveal, exportToRevealZip } from "../core/export/exportToReveal";
import {
  deletePresentation,
  createPresentation,
} from "../core/persistence/presentationsLibrary";

export default function EditorPage() {
  const { presentationId } = useParams();
  const navigate = useNavigate();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewStartSlide, setPreviewStartSlide] = useState(0);
  const [showUI, setShowUI] = useState(false);
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

  const {
    setSelectedSlideId,
    selectElement,
    addSlide,
    deleteSlide,
    duplicateSlide,
    moveSlideUp,
    moveSlideDown,
    savePresentation,
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
    applyTransitionToAll,
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
  } = useEditorActions(eventBus, selectedSlideIndex, slides.length);

  const exportPresentation = async () => exportToReveal(presentation);

  const saveAsPresentation = () => {
    const json = JSON.stringify(presentation, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = presentation?.slideset?.filename ?? "presentation";
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadPresentation = async (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText);
      const id = await createPresentation(
        parsed?.slideset?.title ?? "Imported",
      );
      const { idbSet: set } =
        await import("../core/persistence/autoSaveService");
      const { presentationKey } =
        await import("../core/persistence/presentationsLibrary");
      await set(presentationKey(id), parsed);
      navigate(`/editor/${id}`);
    } catch {
      alert("Failed to load file: invalid JSON.");
    }
  };

  const handleDeleteAndGoHome = async () => {
    if (!confirm("Delete this presentation?")) return;
    await deletePresentation(presentationId);
    navigate("/");
  };

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
    setPreviewEffect({ type: "transition", effect, key: Date.now() });
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

  const handleVideoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    const mediaId = crypto.randomUUID();
    const key = `media/${mediaId}`;
    await idbSet(key, file);
    addMedia({
      id: mediaId,
      "file-link": `indexeddb://${key}`,
      "media-type": "video",
      position: { x: 60, y: 60 },
      width: 480,
      height: 270,
      rotation: 0,
      "z-index": 1,
      scale: 1,
      crop: [],
      effects: {},
      playback: { autoplay: false, loop: false, muted: false },
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

  const { width: slideWidth, height: slideHeight } = getSlideSize(presentation);
  const currentTransition = selectedSlide?.contents?.transition ?? "none";
  const currentDuration = selectedSlide?.contents?.transitionDuration ?? 0.75;
  const presentationTitle =
    presentation?.slideset?.title ??
    presentation?.slideset?.filename ??
    "Untitled";

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
        onSaveAs={saveAsPresentation}
        onExport={exportPresentation}
        onExportZip={() => exportToRevealZip(presentation)}
        onLoadFile={loadPresentation}
        onDelete={handleDeleteAndGoHome}
      />
    );
  }

  return (
    <div className="editor-page" onDoubleClick={() => setShowUI(false)}>
      {!showUI && (
        <div
          className="ui-toggle-strip"
          onClick={(event) => {
            event.stopPropagation();
            setShowUI(true);
          }}
        />
      )}

      {showUI && (
        <div
          className="toolbar-overlay"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
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
            onImageUpload={handleImageUpload}
            onVideoUpload={handleVideoUpload}
            onToggleSlideHidden={() => toggleSlideHidden(selectedSlideIndex)}
            isSlideHidden={selectedSlide?.hidden}
            onTransitionChange={(transition) =>
              updateSlideTransition(transition, currentDuration)
            }
            currentTransition={currentTransition}
            currentDuration={currentDuration}
            onDurationChange={(duration) =>
              updateSlideTransition(currentTransition, duration)
            }
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
          />
        </div>
      )}

      <div className="editor-body">
        <SlideList
          slides={slides}
          selectedSlideId={selectedSlideIndex}
          onSelectSlide={setSelectedSlideId}
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

      {showUI && (
        <div
          className="statusbar-overlay"
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
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
      )}

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