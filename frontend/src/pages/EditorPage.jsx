import { useState, useEffect, useRef, useCallback } from "react";
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
import { getSlideSize, getPlaceholderFormatting } from "../utils/slidesetRenderUtils";
import { computeCurrentFormatting, splitFormattingUpdates, resolveEffectiveFormatting } from "../core/text/textFormatting";
import { getSlideElement } from "../core/operations/slideOperations";
import { createTextElementDefaults } from "../core/model/masterDefaults";
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

  const [editingTextElementId, setEditingTextElementId] = useState(null);
  const editingTextElementIdRef = useRef(null);
  const [pendingFormatting, setPendingFormatting] = useState({});

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

  const activeSelectionRef = useRef(null); // { elementId, paragraphIdx, rangeStart, rangeEnd }

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
    applyLayoutFont,
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
      addLayoutElement(selectedMasterLayoutId, "text", createTextElementDefaults(4, "Layout text"));
    } else {
      addMasterElement("text", createTextElementDefaults(10, "Master text"));
    }
  };

  const exportPresentation = async () => exportToReveal(presentation);

  const handleCopy = (elementOrEvent) => {
    const element = elementOrEvent?.id ? elementOrEvent : getSlideElement(selectedSlide, selectedElementId);
    if (!element) return;
    copyElement(element);
  };

  const handleCut = (elementOrEvent) => {
    const element = elementOrEvent?.id ? elementOrEvent : getSlideElement(selectedSlide, selectedElementId);
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

  const paragraphFormatting = selectedTextEl?.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderFormatting = selectedTextEl
    ? getPlaceholderFormatting(presentation, selectedSlide, selectedTextEl)
    : {};
  const effectiveFormatting = resolveEffectiveFormatting(masterFormatting, placeholderFormatting, paragraphFormatting);

  const currentFormatting = computeCurrentFormatting({
    isEditing: editingTextElementId === selectedElementId,
    activeSelection: activeSelectionRef.current,
    selectedElementId,
    selectedTextEl,
    effectiveFormatting,
    pendingFormatting,
  });

  const applyFormatting = (elementId, updates) => {
    const { runUpdates, paraUpdates } = splitFormattingUpdates(updates);

    const sel = activeSelectionRef.current;
    const hasRealSelection =
      sel && sel.elementId === elementId &&
      !(sel.paragraphIdx === (sel.endParagraphIdx ?? sel.paragraphIdx) && sel.rangeStart === sel.rangeEnd);

    if (hasRealSelection) {
      if (Object.keys(runUpdates).length > 0)
        updateTextRangeFormatting(elementId, sel.paragraphIdx, sel.rangeStart, sel.endParagraphIdx ?? sel.paragraphIdx, sel.rangeEnd, runUpdates);
    } else if (editingTextElementIdRef.current === elementId) {
      if (Object.keys(runUpdates).length > 0)
        setPendingFormatting((prev) => ({ ...prev, ...runUpdates }));
    } else {
      if (Object.keys(runUpdates).length > 0) updateTextElementFormatting(elementId, runUpdates);
    }

    if (Object.keys(paraUpdates).length > 0) updateTextElementFormatting(elementId, paraUpdates);
  };

  const handleFormatChange = (updates) => {
    if (!selectedElementId || !selectedTextEl) return;
    applyFormatting(selectedElementId, updates);
  };

  const handleStartEditing = useCallback((id) => {
    editingTextElementIdRef.current = id;
    setEditingTextElementId(id);
    setPendingFormatting({});
  }, []);

  const handleStopEditing = useCallback((id) => {
    editingTextElementIdRef.current = null;
    setEditingTextElementId((prev) => (prev === id ? null : prev));
    setPendingFormatting({});
  }, []);

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

  const selectedElementRaw = getSlideElement(selectedSlide, selectedElementId);
  const selectedElement = selectedElementRaw
    ? {
        id: selectedElementRaw.id,
        label: selectedElementRaw.paragraphs
          ? (selectedElementRaw.paragraphs?.[0]?.runs?.[0]?.text || "Text")
          : "Image",
      }
    : null;

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
          onApplyLayoutFont={applyLayoutFont}
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
          onAddMasterElement={addMasterElement}
          onDeleteMasterElement={deleteMasterElement}
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
                  onChangeParagraphs={(elementId, paragraphs) =>
                    updateTextElementParagraphs(selectedSlideIndex, elementId, paragraphs)
                  }
                  onMoveTextElement={updateElementPosition}
                  onResizeTextElement={updateElementSize}
                  onFormatTextElement={applyFormatting}
                  onFormatTextRangeElement={(elementId, paragraphIdx, rangeStart, endParagraphIdx, rangeEnd, formatting) =>
                    updateTextRangeFormatting(elementId, paragraphIdx, rangeStart, endParagraphIdx, rangeEnd, formatting)
                  }
                  onSaveSelection={(elementId, offsets) => {
                    activeSelectionRef.current = offsets ? { elementId, ...offsets } : null;
                    if (offsets) setPendingFormatting({});
                  }}
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
                  onStartEditing={handleStartEditing}
                  onStopEditing={handleStopEditing}
                  pendingFormatting={editingTextElementId === selectedElementId ? pendingFormatting : {}}
                  onClearPendingFormatting={() => setPendingFormatting({})}
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