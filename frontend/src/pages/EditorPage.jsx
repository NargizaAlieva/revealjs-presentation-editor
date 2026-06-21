import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { usePresentationFonts } from "../hooks/usePresentationFonts";
import "./EditorPage.css";
import PreviewModal from "../components/PreviewModal";
import StatusBar from "../components/StatusBar";
import CommentsPanel from "../components/CommentsPanel";
import SlideSorterView from "../components/SlideSorterView";
import OutlineView from "../components/OutlineView";
import { getSlideSize, getPlaceholderFormatting } from "../core/render/slidesetRenderUtils";
import { computeCurrentFormatting, splitFormattingUpdates, resolveEffectiveFormatting, getSelectionFormatting, RUN_LEVEL_KEYS } from "../core/text/textFormatting";
import { getSlideElement } from "../core/operations/slideOperations";
import { getElementLabel } from "../core/operations/elementOperations";
import { getPresentationTitle } from "../core/operations/presentationOperations";
import { getSlideTransition } from "../core/model/transitionDefaults";
import { importPresentationFromJson } from "../core/persistence/importPresentation";
import { createTextElementDefaults } from "../core/model/masterDefaults";
import { updateThemeBackground } from "../core/model/designThemes";
import { clampSlideDimension } from "../core/model/slideSizes";
import { toHex9 } from "../core/utils/colorUtils";
import { getLayoutDisplayList } from "../core/operations/layoutOperations";
import FileMenu from "../components/FileMenu";
import {
  exportToReveal,
  exportToRevealZip,
} from "../core/export/exportToReveal";
import {
  deletePresentation,
  createPresentation,
  savePresentation,
  downloadPresentationAsJson,
} from "../core/persistence/persistenceFacade";
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

  const [masterActiveSelection, setMasterActiveSelection] = useState(null);

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
  const [activeSelection, setActiveSelection] = useState(null);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);

  const { state, eventBus, isLoading } = useEditorState(presentationId);
  const {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
  } = useSlides(state);

  // When selectedElementId changes, clear any stale selection/editing state
  // that may have survived (e.g. going editing → HomeTab → canvas skips onBlur).
  useEffect(() => {
    if (activeSelectionRef.current && activeSelectionRef.current.elementId !== selectedElementId) {
      activeSelectionRef.current = null;
      setActiveSelection(null);
    }
  }, [selectedElementId]);

  // Global mousedown: clear stale saved selection when the user clicks outside
  // the active text element and outside any toolbar. Covers the gap where
  // contentEditable already lost focus on a toolbar click, so a subsequent
  // canvas click never triggers another onBlur to clean up.
  useEffect(() => {
    if (!selectedElementId) return;
    const handler = (e) => {
      if (!activeSelectionRef.current) return;
      const inToolbar =
        e.target.closest?.(".format-toolbar") ||
        e.target.closest?.(".toolbar-ribbon") ||
        e.target.closest?.(".toolbar") ||
        e.target.closest?.(".bg-palette-popup") ||
        e.target.closest?.(".sz-dropdown");
      const inElement = e.target.closest?.(`[data-element-id="${selectedElementId}"]`);
      if (!inElement && !inToolbar) {
        activeSelectionRef.current = null;
        setActiveSelection(null);
        setClearSelectionSignal((n) => n + 1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [selectedElementId]);

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
    toggleTitle,
    toggleFooters,
    formatPainterCopy,
    formatPainterPaste,
    addAnimation,
    addAnimationForElement,
    updateAnimation,
    reorderAnimations,
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

  // Derived layout list — computed here so InsertTab stays pure
  const layouts = getLayoutDisplayList(presentation);

  // Master background: EditorPage owns the data + action, SlideMasterRibbon just passes hex
  const handleApplyBackground = useCallback((hex) => {
    const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
    const decorations = presentation?.slideset?.master?.decorations;
    updateMasterTheme(updateThemeBackground(colorTheme, toHex9(hex)), decorations);
  }, [presentation, updateMasterTheme]);

  // Clamped dimensions: validation happens here, not in UI widgets
  const handleUpdateDimensions = useCallback((dimensions, aspectRatio, units) => {
    const w = clampSlideDimension(dimensions.width, 1280);
    const h = clampSlideDimension(dimensions.height, 720);
    updateMasterDimensions({ width: w, height: h }, aspectRatio, units);
  }, [updateMasterDimensions]);

  const { handleImageUpload } = useImageUpload(addMedia);
  const { handleVideoUpload } = useVideoUpload(addMedia);
  const handleAddTextElement = useCallback(
    () => addTextElement(createTextElementDefaults(10, "")),
    [addTextElement],
  );

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

  const masterSelectedTextEl = isSlideMasterOpen && selectedMasterElementId
    ? (() => {
        // Element may be in master elements OR in the selected layout's elements
        const masterEl = (presentation?.slideset?.master?.elements?.text ?? [])
          .find((t) => t.id === selectedMasterElementId);
        if (masterEl) return masterEl;
        if (selectedMasterLayoutId) {
          const layout = (presentation?.slideset?.layouts ?? [])
            .find((l) => l["layout-id"] === selectedMasterLayoutId);
          return (layout?.elements?.text ?? []).find((t) => t.id === selectedMasterElementId) ?? null;
        }
        return null;
      })()
    : null;

  const activeTextEl = isSlideMasterOpen ? masterSelectedTextEl : selectedTextEl;
  const activeElementId = isSlideMasterOpen ? selectedMasterElementId : selectedElementId;
  const activeSelectionForFormatting = isSlideMasterOpen ? masterActiveSelection : activeSelection;

  const paragraphFormatting = activeTextEl?.paragraphs?.[0]?.formatting ?? {};
  const masterFormatting = presentation?.slideset?.master?.formatting ?? {};
  const placeholderFormatting = activeTextEl && !isSlideMasterOpen
    ? getPlaceholderFormatting(presentation, selectedSlide, activeTextEl)
    : {};
  const effectiveFormatting = resolveEffectiveFormatting(masterFormatting, placeholderFormatting, paragraphFormatting);

  const isEditingSelected = isSlideMasterOpen
    ? !!masterActiveSelection
    : editingTextElementId === selectedElementId;
  const hasRealSelection =
    activeSelectionForFormatting &&
    activeSelectionForFormatting.elementId === activeElementId &&
    !(activeSelectionForFormatting.paragraphIdx === (activeSelectionForFormatting.endParagraphIdx ?? activeSelectionForFormatting.paragraphIdx) &&
      activeSelectionForFormatting.rangeStart === activeSelectionForFormatting.rangeEnd);
  const selectionFormatting = hasRealSelection
    ? { ...effectiveFormatting, ...(getSelectionFormatting(activeTextEl, activeSelectionForFormatting) ?? {}) }
    : null;
  const currentFormatting = selectionFormatting
    ? { ...selectionFormatting, ...pendingFormatting }
    : computeCurrentFormatting({
        isEditing: isEditingSelected,
        activeSelection: activeSelectionForFormatting,
        selectedElementId: activeElementId,
        selectedTextEl: activeTextEl,
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
      if (Object.keys(runUpdates).length > 0) {
        // Base: run-level keys from currentFormatting (cursor position), excluding "mixed" values.
        // This preserves bold when user adds italic (and vice-versa) without bringing in
        // paragraph-level or "mixed" values that would corrupt buildPendingFormattingStyles.
        const cursorRunBase = Object.fromEntries(
          Object.entries(currentFormatting).filter(([k, v]) => RUN_LEVEL_KEYS.has(k) && v !== "mixed")
        );
        setPendingFormatting((prev) => ({ ...cursorRunBase, ...prev, ...runUpdates }));
      }
    } else {
      if (Object.keys(runUpdates).length > 0) updateTextElementFormatting(elementId, runUpdates);
    }

    if (Object.keys(paraUpdates).length > 0) updateTextElementFormatting(elementId, paraUpdates);
  };

  const handleFormatChange = (updates) => {
    if (!activeElementId || !activeTextEl) return;

    if (isSlideMasterOpen) {
      // Master mode: no range formatting at store level, always update whole element.
      if (selectedMasterLayoutId) {
        // Layout element — mirror what the popup does via handlePlaceholderUpdate
        updateLayoutElement(selectedMasterLayoutId, "text", activeElementId, { formatting: updates });
      } else {
        // Master element — uses its own operation that correctly strips run-level keys
        updateMasterTextFormatting(activeElementId, updates);
      }
      return;
    }

    applyFormatting(selectedElementId, updates);
  };

  const handleStartEditing = useCallback((id) => {
    // Only reset pending when switching to a different element.
    // Refocusing the same element (e.g. after font/size change from toolbar) must keep pending
    // so the format applies to the next typed character.
    if (editingTextElementIdRef.current !== id) {
      setPendingFormatting({});
    }
    editingTextElementIdRef.current = id;
    setEditingTextElementId(id);
  }, []);

  const handleStopEditing = useCallback((id) => {
    editingTextElementIdRef.current = null;
    setEditingTextElementId((prev) => (prev === id ? null : prev));
    setPendingFormatting({});
  }, []);

  const { width: slideWidth, height: slideHeight } = useMemo(
    () => getSlideSize(presentation),
    [presentation],
  );

  const { transition: currentTransition, duration: currentDuration } = useMemo(
    () => getSlideTransition(selectedSlide),
    [selectedSlide],
  );

  const presentationTitle = useMemo(
    () => getPresentationTitle(presentation),
    [presentation],
  );

  const handleSaveAs = () => downloadPresentationAsJson(presentation);

  const handleNew = async () => {
    const id = await createPresentation(getPresentationTitle(null));
    navigate(`/editor/${id}`);
  };

  const handleLoadFile = async (jsonText) => {
    try {
      const id = await importPresentationFromJson(jsonText);
      navigate(`/editor/${id}`);
    } catch (e) {
      console.error("[EditorPage] Failed to import file:", e);
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
  const selectedElement = useMemo(
    () => selectedElementRaw
      ? { id: selectedElementRaw.id, label: getElementLabel(selectedElementRaw) }
      : null,
    [selectedElementRaw],
  );

  if (isLoading) {
    return <div className="editor-loading">Loading...</div>;
  }

  if (activeTab === "File") {
    return (
      <FileMenu
        presentationTitle={presentationTitle}
        onClose={() => setActiveTab("Home")}
        onGoHome={() => navigate("/")}
        onNew={handleNew}
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
          onAddAnimationForElement={addAnimationForElement}
          onUpdateAnimation={updateAnimation}
          onReorderAnimation={reorderAnimations}
          onDeleteAnimation={deleteAnimation}
          onAnimationPreview={triggerAnimationPreview}
          onTransitionPreview={triggerTransitionPreview}
          onPreviewEffect={setPreviewEffect}
          onApplyLayout={applyLayout}
          onResetLayout={resetLayout}
          currentFormatting={currentFormatting}
          onFormatChange={handleFormatChange}
          isTextSelected={!!(isSlideMasterOpen ? masterSelectedTextEl : selectedTextEl)}
          presentation={presentation}
          onCut={handleCut}
          onCopy={handleCopy}
          onPaste={handlePaste}
          canPaste={!!state.clipboard}
          onApplyTheme={updateMasterTheme}
          onApplyFont={updateMasterFormatting}
          onApplyLayoutFont={applyLayoutFont}
          onUpdateDimensions={handleUpdateDimensions}
          onApplyBackground={handleApplyBackground}
          layouts={layouts}
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
          onToggleTitle={toggleTitle}
          onToggleFooters={toggleFooters}
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
            onUpdateDimensions={handleUpdateDimensions}
            onUpdateLayout={updateLayout}
            masterName={masterName}
            selectedMasterElementId={selectedMasterElementId}
            onSelectMasterElement={setSelectedMasterElementId}
            onSaveSelection={(elementId, offsets) => {
              setMasterActiveSelection(offsets ? { elementId, ...offsets } : null);
            }}
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
            onToggleTitle={toggleTitle}
            onToggleFooters={toggleFooters}
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
                  clearSelectionSignal={clearSelectionSignal}
                  onSaveSelection={(elementId, offsets) => {
                    const sel = offsets ? { elementId, ...offsets } : null;
                    activeSelectionRef.current = sel;
                    setActiveSelection(sel);
                    // Clear pending only on real (non-collapsed) selection — collapsed cursor
                    // should keep pending so the next typed character uses the chosen format.
                    const isRealSel = offsets &&
                      !(offsets.paragraphIdx === (offsets.endParagraphIdx ?? offsets.paragraphIdx) &&
                        offsets.rangeStart === offsets.rangeEnd);
                    if (isRealSel) setPendingFormatting({});
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
                  formatPainterClipboard={state.formatPainterClipboard}
                  onFormatPainterCopy={formatPainterCopy}
                  onFormatPainterPaste={formatPainterPaste}
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