import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SlideList from "../components/SlideList";
import Toolbar from "../components/Toolbar";
import EditorCanvas from "../components/EditorCanvas";
import { useEditorState } from "../hooks/useEditorState";
import { useSlides } from "../hooks/useSlides";
import { useEditorActions } from "../hooks/useEditorActions";
import { useEditorViewState } from "../hooks/useEditorViewState";
import { useImageUpload } from "../hooks/useImageUpload";
import { useVideoUpload } from "../hooks/useVideoUpload";
import { useAddTextElement } from "../hooks/useAddTextElement";
import { usePresentationFonts } from "../hooks/usePresentationFonts";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import StatusBar from "../components/StatusBar";
import CommentsPanel from "../components/CommentsPanel";
import SlideSorterView from "../components/SlideSorterView";
import OutlineView from "../components/OutlineView";
import { getSlideSize } from "../utils/slidesetRenderUtils";
import FileMenu from "../components/FileMenu";
import { idbSet } from "../core/persistence/autoSaveService";
import {
  exportToReveal,
  exportToRevealZip,
} from "../core/export/exportToReveal";
import {
  deletePresentation,
  createPresentation,
  presentationKey,
} from "../core/persistence/presentationsLibrary";
import NotesPageView from "../components/NotesPageView";
import SlideMasterView from "../components/SlideMasterView";

export default function EditorPage() {
  const { presentationId } = useParams();
  const navigate = useNavigate();

  const [previewStartSlide, setPreviewStartSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [composeSession, setComposeSession] = useState(0);
  const [isSlideMasterOpen, setIsSlideMasterOpen] = useState(false);
  const [masterName, setMasterName] = useState("Office Theme");
  const [selectedMasterElementId, setSelectedMasterElementId] = useState(null);
  // null = Master selected, string = layout-id selected
  const [selectedMasterLayoutId, setSelectedMasterLayoutId] = useState(null);

  const {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    handleCanvasZoom,
    activeTab,
    setActiveTab,
    showNotes,
    toggleNotes,
    currentView,
    setCurrentView,
    isPreviewOpen,
    openPreview,
    closePreview,
    previewEffect,
    setPreviewEffect,
    triggerAnimationPreview,
    triggerTransitionPreview,
  } = useEditorViewState();

  const { state, eventBus, isLoading } = useEditorState(presentationId);
  const {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
  } = useSlides(state);

  useEffect(() => {
    if (currentView === "reading") {
      setPreviewStartSlide(selectedSlideIndex);
      openPreview();
      setCurrentView("normal");
    }
  }, [currentView]);

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
    addTextElement,
    updateTextElementContent,
    updateTextElementFormatting,
    updateTextElementParagraphs,
    updateTextRangeFormatting,
    updateRunLink,
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
    resetLayout,
    updateLayout,
    deleteLayout,
    renameLayout,
    addLayoutElement,
    updateLayoutElement,
    updateLayoutElementTextContent,
    deleteLayoutElement,
    addLayoutPlaceholder,
    removeLayoutPlaceholder,
    updateLayoutPlaceholder,
    updateMasterTheme,
    updateMasterFormatting,
    updateMasterDimensions,
    updateMasterTextContent,
    updateMasterTextFormatting,
    addMasterElement,
    updateMasterElement,
    deleteMasterElement,
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
    cutElement,
    addComment,
    deleteComment,
  } = useEditorActions(
    eventBus,
    selectedSlideIndex,
    slides.length,
    presentationId,
  );

  const { handleImageUpload } = useImageUpload(addMedia);
  const { handleVideoUpload } = useVideoUpload(addMedia);
  const { handleAddTextElement } = useAddTextElement(addTextElement);
  const { handleImageUpload: handleMasterImageUpload } = useImageUpload(
    (mediaElement) => {
      if (selectedMasterLayoutId) {
        addLayoutElement(selectedMasterLayoutId, "media", mediaElement);
      } else {
        addMasterElement("media", mediaElement);
      }
    }
  );
  const { handleVideoUpload: handleMasterVideoUpload } = useVideoUpload(
    (mediaElement) => {
      if (selectedMasterLayoutId) {
        addLayoutElement(selectedMasterLayoutId, "media", mediaElement);
      } else {
        addMasterElement("media", mediaElement);
      }
    }
  );
  const handleAddMasterTextElement = () => {
    if (selectedMasterLayoutId) {
      addLayoutElement(selectedMasterLayoutId, "text", {
        id: crypto.randomUUID(),
        "placeholder-id": null,
        position: { x: 100, y: 100 },
        width: 300,
        height: 80,
        rotation: 0,
        "z-index": 4,
        background: "transparent",
        userModified: true,
        paragraphs: [{
          id: crypto.randomUUID(),
          formatting: { font: "Arial", size: "24px", color: "var(--text-dark)", align: "left" },
          bullets: "none",
          runs: [{ formatting: {}, "super-sub-script": "normal", text: "Layout text", link: null }],
        }],
      });
    } else {
      addMasterElement("text", {
        id: crypto.randomUUID(),
        "placeholder-id": null,
        position: { x: 100, y: 100 },
        width: 300,
        height: 80,
        rotation: 0,
        "z-index": 10,
        background: "transparent",
        userModified: true,
        paragraphs: [{
          id: crypto.randomUUID(),
          formatting: { font: "Arial", size: "24px", color: "var(--text-dark)", align: "left" },
          bullets: "none",
          runs: [{ formatting: {}, "super-sub-script": "normal", text: "Master text", link: null }],
        }],
      });
    }
  };

  const exportPresentation = async () => exportToReveal(presentation);

  const getSelectedElement = () => {
    if (!selectedElementId) return null;
    return (
      (selectedSlide?.contents?.text ?? []).find(
        (e) => e.id === selectedElementId,
      ) ||
      (selectedSlide?.contents?.media ?? []).find(
        (e) => e.id === selectedElementId,
      ) ||
      null
    );
  };

  const handleCopy = (elementOrEvent) => {
    const element = elementOrEvent?.id ? elementOrEvent : getSelectedElement();
    if (!element) return;
    copyElement(element);
  };

  const handleCut = (elementOrEvent) => {
    const element = elementOrEvent?.id ? elementOrEvent : getSelectedElement();
    if (!element) return;
    cutElement(element);
  };

  const handlePaste = () => {
    pasteElement();
  };

  const handleNewComment = () => {
    setShowComments(true);
    setComposeSession((s) => s + 1);
  };

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
            openPreview();
          }}
          onOpenPreviewFromCurrent={() => {
            setPreviewStartSlide(selectedSlideIndex);
            openPreview();
          }}
          canDelete={slides.length > 1}
          canMoveUp={selectedSlideIndex > 0}
          canMoveDown={selectedSlideIndex < slides.length - 1}
          onResetPresentation={resetPresentation}
          onImageUpload={isSlideMasterOpen ? handleMasterImageUpload : handleImageUpload}
          onVideoUpload={isSlideMasterOpen ? handleMasterVideoUpload : handleVideoUpload}
          onAddTextElement={isSlideMasterOpen ? handleAddMasterTextElement : handleAddTextElement}
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
          onApplyLayout={applyLayout}
          onResetLayout={resetLayout}
          currentFormatting={currentFormatting}
          onFormatChange={handleFormatChange}
          isTextSelected={!!selectedTextEl}
          presentation={presentation}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          canPaste={!!state.clipboard}
          onApplyTheme={updateMasterTheme}
          onApplyFont={updateMasterFormatting}
          onUpdateDimensions={updateMasterDimensions}
          currentView={currentView}
          onChangeView={setCurrentView}
          showNotes={showNotes}
          onToggleNotes={toggleNotes}
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomChange={setZoom}
          onOpenSlideMaster={() => setIsSlideMasterOpen(true)}
          isSlideMasterOpen={isSlideMasterOpen}
          onCloseSlideMaster={() => setIsSlideMasterOpen(false)}
          masterName={masterName}
          onRenameMaster={setMasterName}
          selectedMasterLayoutId={selectedMasterLayoutId}
          onRenameLayout={renameLayout}
          onDeleteLayout={deleteLayout}
          onAddLayoutPlaceholder={addLayoutPlaceholder}
          onRemoveLayoutPlaceholder={removeLayoutPlaceholder}
        />
      </div>

      <div className="editor-body">
        {isSlideMasterOpen ? (
          <SlideMasterView
            presentation={presentation}
            onClose={() => { setIsSlideMasterOpen(false); setSelectedMasterLayoutId(null); }}
            onSelectedLayoutChange={setSelectedMasterLayoutId}
            onApplyTheme={updateMasterTheme}
            onApplyFont={updateMasterFormatting}
            onUpdateDimensions={updateMasterDimensions}
            onUpdateLayout={updateLayout}
            masterName={masterName}
            selectedMasterElementId={selectedMasterElementId}
            onSelectMasterElement={setSelectedMasterElementId}
            onAddMasterElement={addMasterElement}
            onDeleteMasterElement={deleteMasterElement}
            onUpdateMasterTextContent={(id, text) =>
              updateMasterTextContent(id, text)
            }
            onUpdateMasterTextFormatting={(id, fmt) =>
              updateMasterTextFormatting(id, fmt)
            }
            onUpdateLayoutPlaceholder={updateLayoutPlaceholder}
            onUpdateLayoutElement={(layoutId, type, id, updates) => updateLayoutElement(layoutId, type, id, updates)}
            onUpdateLayoutElementTextContent={(layoutId, id, text) => updateLayoutElementTextContent(layoutId, id, text)}
            onDeleteLayoutElement={(layoutId, type, id) => deleteLayoutElement(layoutId, type, id)}
            onUpdateMasterElementPosition={(id, x, y) => {
              updateMasterElement("text", id, { position: { x, y } });
              updateMasterElement("media", id, { position: { x, y } });
            }}
            onUpdateMasterElementSize={(id, w, h) => {
              updateMasterElement("text", id, { width: w, height: h });
              updateMasterElement("media", id, { width: w, height: h });
            }}
            onUpdateMasterElement={updateMasterElement}
            onBeginHistory={beginHistory}
            onCommitHistory={commitHistory}
            onCancelHistory={cancelHistory}
          />
        ) : currentView === "slide-sorter" ? (
          <SlideSorterView
            slides={slides}
            selectedSlideIndex={selectedSlideIndex}
            onSelectSlide={setSelectedSlideId}
            presentation={presentation}
          />
        ) : currentView === "notes-page" ? (
          <NotesPageView
            slide={selectedSlide}
            presentation={presentation}
            slideNotes={selectedSlide?.contents?.notes ?? ""}
            onUpdateSlideNotes={updateSlideNotes}
            onBeginHistory={beginHistory}
            onCommitHistory={commitHistory}
          />
        ) : (
          <>
            {currentView === "outline" ? (
              <OutlineView
                slides={slides}
                selectedSlideIndex={selectedSlideIndex}
                onSelectSlide={setSelectedSlideId}
              />
            ) : (
              <SlideList
                slides={slides}
                selectedSlideId={selectedSlideIndex}
                onSelectSlide={setSelectedSlideId}
                onReorderSlide={reorderSlide}
                slideWidth={slideWidth}
                slideHeight={slideHeight}
                presentation={presentation}
              />
            )}

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
                  onCopy={handleCopy}
                  onPaste={handlePaste}
                  onCut={handleCut}
                  onNewComment={handleNewComment}
                />
              )}
            </div>

            {showComments && (
              <CommentsPanel
                key={composeSession}
                comments={selectedSlide?.contents?.comments ?? []}
                authorName="User"
                onAdd={addComment}
                onDelete={deleteComment}
                onClose={() => setShowComments(false)}
                autoCompose={composeSession > 0}
              />
            )}
          </>
        )}
      </div>

      {isPreviewOpen && (
        <PreviewModal
          slides={slides}
          presentation={presentation}
          onClose={closePreview}
          initialSlide={previewStartSlide}
        />
      )}
    </div>
  );
}