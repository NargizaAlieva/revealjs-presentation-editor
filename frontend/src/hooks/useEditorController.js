import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditorState } from "./useEditorState";
import { useSlides } from "./useSlides";
import { useEditorActions } from "./useEditorActions";
import { useEditorViewState } from "./useEditorViewState";
import { useImageUpload } from "./useImageUpload";
import { useVideoUpload } from "./useVideoUpload";
import { usePresentationFonts } from "./usePresentationFonts";
import { useFindReplace } from "./useFindReplace";
import {
  findMasterTextElement,
  computeFormattingState,
  useApplyFormatting,
} from "./useFormattingState";
import { getSlideSize } from "../core/render/slidesetRenderUtils";
import { getSlideElement } from "../core/operations/slideOperations";
import { getElementLabel } from "../core/operations/elementOperations";
import { getPresentationTitle } from "../core/utils/presentationUtils";
import { getSlideTransition } from "../core/model/transitionDefaults";
import { importPresentationFromJson } from "../core/persistence/importPresentation";
import { createTextElementDefaults } from "../core/model/masterDefaults";
import { updateThemeBackground } from "../core/model/designThemes";
import { clampSlideDimension } from "../core/model/slideSizes";
import { toHex9 } from "../core/utils/colorUtils";
import { getLayoutDisplayList } from "../core/operations/layoutOperations";
import {
  exportToReveal,
  exportToRevealZip,
} from "../core/export/exportToReveal";
import {
  deletePresentation,
  createPresentation,
  downloadPresentationAsJson,
} from "../core/persistence/persistenceFacade";

export function useEditorController() {
  const { presentationId } = useParams();
  const navigate = useNavigate();

  // ── UI-only state ──────────────────────────────────────────────────────────
  const [previewStartSlide, setPreviewStartSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [composeSession, setComposeSession] = useState(0);
  const [isSlideMasterOpen, setIsSlideMasterOpen] = useState(false);
  const [masterName, setMasterName] = useState("Office Theme");
  const [selectedMasterElementId, setSelectedMasterElementId] = useState(null);
  const [selectedMasterLayoutId, setSelectedMasterLayoutId] = useState(null);
  const [masterActiveSelection, setMasterActiveSelection] = useState(null);
  const [editingTextElementId, setEditingTextElementId] = useState(null);
  const editingTextElementIdRef = useRef(null);
  const [pendingFormatting, setPendingFormatting] = useState({});
  const activeSelectionRef = useRef(null);
  const [activeSelection, setActiveSelection] = useState(null);
  const [clearSelectionSignal, setClearSelectionSignal] = useState(0);
  const [findReplaceMode, setFindReplaceMode] = useState("find");
  const [showSelectionPane, setShowSelectionPane] = useState(false);
  const [objectSelectionMode, setObjectSelectionMode] = useState(false);

  // ── Core hooks ─────────────────────────────────────────────────────────────
  const viewState = useEditorViewState();
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
  } = viewState;

  const { state, eventBus, isLoading } = useEditorState(presentationId);
  const {
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
    selectedElementIds,
  } = useSlides(state);

  const actions = useEditorActions(
    eventBus,
    selectedSlideIndex,
    slides.length,
    presentationId,
  );
  const {
    setSelectedSlideId,
    selectElement,
    selectElements,
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
    updateParagraphFormatting,
    updateTextElementParagraphs,
    updateTextRangeFormatting,
    updateRunLink,
    updateElementPosition,
    updateElementSize,
    updateElement,
    updateElements,
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
    updateLayoutItem,
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
    deleteSelectedElements,
    addComment,
    deleteComment,
  } = actions;

  const handleFindNavigate = useCallback(
    (slideIndex, elementId) => {
      setSelectedSlideId(slideIndex);
      selectElement(elementId);
    },
    [setSelectedSlideId, selectElement],
  );

  const handleReplaceText = useCallback(
    (slideIndex, elementId, paragraphIdx, runIdx, newText) => {
      const element = (slides[slideIndex]?.contents?.text ?? []).find(
        (item) => item.id === elementId,
      );
      if (!element) return;
      const paragraphs = structuredClone(element.paragraphs ?? []);
      const run = paragraphs[paragraphIdx]?.runs?.[runIdx];
      if (!run) return;
      run.text = newText;
      updateTextElementParagraphs(slideIndex, elementId, paragraphs);
    },
    [slides, updateTextElementParagraphs],
  );

  const handleReplaceAllText = useCallback(
    (operations) => {
      const grouped = new Map();
      operations.forEach((operation) => {
        const key = `${operation.slideIndex}:${operation.elementId}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(operation);
      });

      grouped.forEach((elementOperations) => {
        const { slideIndex, elementId } = elementOperations[0];
        const element = (slides[slideIndex]?.contents?.text ?? []).find(
          (item) => item.id === elementId,
        );
        if (!element) return;
        const paragraphs = structuredClone(element.paragraphs ?? []);
        elementOperations.forEach(({ paragraphIdx, runIdx, newText }) => {
          const run = paragraphs[paragraphIdx]?.runs?.[runIdx];
          if (run) run.text = newText;
        });
        updateTextElementParagraphs(slideIndex, elementId, paragraphs);
      });
    },
    [slides, updateTextElementParagraphs],
  );

  const findReplace = useFindReplace(
    slides,
    handleFindNavigate,
    handleReplaceText,
    handleReplaceAllText,
  );
  const openFindReplace = findReplace.open;

  usePresentationFonts(presentation);

  // ── Selection side-effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (
      activeSelectionRef.current &&
      activeSelectionRef.current.elementId !== selectedElementId
    ) {
      activeSelectionRef.current = null;
      setActiveSelection(null);
    }
  }, [selectedElementId]);

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
      const inElement = e.target.closest?.(
        `[data-element-id="${selectedElementId}"]`,
      );
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
    setTimeout(() => {
      setPreviewStartSlide(selectedSlideIndex);
      openPreview();
      setCurrentView("normal");
    }, 0);
  }
}, [currentView]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const layouts = getLayoutDisplayList(presentation);

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

  const selectedTextEl = selectedElementId
    ? (selectedSlide?.contents?.text ?? []).find(
        (t) => t.id === selectedElementId,
      )
    : null;

  const masterSelectedTextEl = isSlideMasterOpen
    ? findMasterTextElement(
        presentation,
        selectedMasterLayoutId,
        selectedMasterElementId,
      )
    : null;

  const activeTextEl = isSlideMasterOpen
    ? masterSelectedTextEl
    : selectedTextEl;
  const activeElementId = isSlideMasterOpen
    ? selectedMasterElementId
    : selectedElementId;
  const activeSelectionForFormatting = isSlideMasterOpen
    ? masterActiveSelection
    : activeSelection;
  const isEditingSelected = isSlideMasterOpen
    ? !!masterActiveSelection
    : editingTextElementId === selectedElementId;

  const { currentFormatting, hasRealSelection } = computeFormattingState({
    presentation,
    selectedSlide,
    activeTextEl,
    activeElementId,
    activeSelectionForFormatting,
    isSlideMasterOpen,
    isEditingSelected,
    pendingFormatting,
  });

  const applyFormatting = useApplyFormatting({
    activeSelectionRef,
    editingTextElementIdRef,
    currentFormatting,
    updateTextRangeFormatting,
    updateTextElementFormatting,
    updateParagraphFormatting,
    setPendingFormatting,
  });

  const selectedElementRaw = getSlideElement(selectedSlide, selectedElementId);
  const selectedElementsRaw = useMemo(
    () =>
      selectedElementIds
        .map((id) => getSlideElement(selectedSlide, id))
        .filter(Boolean),
    [selectedSlide, selectedElementIds],
  );
  const selectedElement = useMemo(
    () =>
      selectedElementRaw
        ? {
            id: selectedElementRaw.id,
            label: getElementLabel(selectedElementRaw),
          }
        : null,
    [selectedElementRaw],
  );

  const arrangeSelectedElement = useCallback(
    (mode) => {
      if (selectedElementsRaw.length === 0 || !selectedSlide) return;
      const elements = [
        ...(selectedSlide.contents?.text ?? []),
        ...(selectedSlide.contents?.media ?? []),
      ];
      const zIndexes = elements.map((element) =>
        Number(element["z-index"] ?? 1),
      );
      selectedElementsRaw.forEach((element, index) => {
        const currentZ = Number(element["z-index"] ?? 1);
        let nextZ = currentZ;
        if (mode === "front") nextZ = Math.max(...zIndexes, currentZ) + 1 + index;
        if (mode === "back") nextZ = Math.min(...zIndexes, currentZ) - selectedElementsRaw.length + index;
        if (mode === "forward") nextZ = currentZ + 1;
        if (mode === "backward") nextZ = currentZ - 1;
        updateElement(element.id, { "z-index": nextZ });
      });
    },
    [selectedElementsRaw, selectedSlide, updateElement],
  );

  const handleBringToFront = useCallback(
    () => arrangeSelectedElement("front"),
    [arrangeSelectedElement],
  );
  const handleSendToBack = useCallback(
    () => arrangeSelectedElement("back"),
    [arrangeSelectedElement],
  );
  const handleBringForward = useCallback(
    () => arrangeSelectedElement("forward"),
    [arrangeSelectedElement],
  );
  const handleSendBackward = useCallback(
    () => arrangeSelectedElement("backward"),
    [arrangeSelectedElement],
  );
  const handleRotateRight = useCallback(() => {
    selectedElementsRaw.forEach((element) => {
      updateElement(element.id, {
        rotation: (Number(element.rotation ?? 0) + 90) % 360,
      });
    });
  }, [selectedElementsRaw, updateElement]);

  const handleElementSelect = useCallback(
    (elementId, options = {}) => {
      const event = options?.nativeEvent ?? options;
      const toggle = Boolean(
        options?.toggle || event?.ctrlKey || event?.metaKey || event?.shiftKey,
      );
      selectElement(elementId, {
        toggle,
        preserveIfSelected: options?.preserveIfSelected,
      });
    },
    [selectElement],
  );

  const handleMoveElement = useCallback(
    (elementId, x, y) => {
      const element = getSlideElement(selectedSlide, elementId);
      if (!element) return;
      const isGroupMove =
        selectedElementIds.length > 1 && selectedElementIds.includes(elementId);
      if (!isGroupMove) {
        updateElementPosition(elementId, x, y);
        return;
      }
      const deltaX = x - (element.position?.x ?? 0);
      const deltaY = y - (element.position?.y ?? 0);
      selectedElementsRaw.forEach((selected) => {
        updateElementPosition(
          selected.id,
          (selected.position?.x ?? 0) + deltaX,
          (selected.position?.y ?? 0) + deltaY,
        );
      });
    },
    [
      selectedSlide,
      selectedElementIds,
      selectedElementsRaw,
      updateElementPosition,
    ],
  );

  const handleSetElementsVisibility = useCallback(
    (elementIds, hidden) => {
      updateElements(
        elementIds.map((elementId) => ({
          elementId,
          updates: { hidden },
        })),
      );
    },
    [updateElements],
  );

  const handleMoveSelectionLayer = useCallback(
    (direction) => {
      if (selectedElementIds.length === 0) return;
      const allElements = [
        ...(selectedSlide?.contents?.text ?? []),
        ...(selectedSlide?.contents?.media ?? []),
      ].sort(
        (a, b) => Number(b["z-index"] ?? 1) - Number(a["z-index"] ?? 1),
      );
      const selectedSet = new Set(selectedElementIds);
      const index = allElements.findIndex((element) => selectedSet.has(element.id));
      const swapIndex = index + direction;
      if (index < 0 || swapIndex < 0 || swapIndex >= allElements.length) return;
      const current = allElements[index];
      const target = allElements[swapIndex];
      updateElements([
        {
          elementId: current.id,
          updates: { "z-index": Number(target["z-index"] ?? 1) },
        },
        {
          elementId: target.id,
          updates: { "z-index": Number(current["z-index"] ?? 1) },
        },
      ]);
    },
    [selectedElementIds, selectedSlide, updateElements],
  );

  const activePendingFormatting =
    editingTextElementId === selectedElementId ? pendingFormatting : {};

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleApplyBackground = useCallback(
    (hex) => {
      const colorTheme = presentation?.slideset?.master?.["color-theme"] ?? [];
      const decorations = presentation?.slideset?.master?.decorations;
      updateMasterTheme(
        updateThemeBackground(colorTheme, toHex9(hex)),
        decorations,
      );
    },
    [presentation, updateMasterTheme],
  );

  const handleUpdateDimensions = useCallback(
    (dimensions, aspectRatio, units) => {
      const w = clampSlideDimension(dimensions.width, 1280);
      const h = clampSlideDimension(dimensions.height, 720);
      updateMasterDimensions({ width: w, height: h }, aspectRatio, units);
    },
    [updateMasterDimensions],
  );

  const { handleImageUpload } = useImageUpload(addMedia);
  const { handleVideoUpload } = useVideoUpload(addMedia);

  const handleAddTextElement = useCallback(
    () => addTextElement(createTextElementDefaults(10, "")),
    [addTextElement],
  );

  const { handleImageUpload: handleMasterImageUpload } = useImageUpload(
    useCallback(
      (mediaElement) => {
        if (selectedMasterLayoutId) {
          addLayoutElement(selectedMasterLayoutId, "media", mediaElement);
        } else {
          addMasterElement("media", mediaElement);
        }
      },
      [selectedMasterLayoutId, addLayoutElement, addMasterElement],
    ),
  );

  const { handleVideoUpload: handleMasterVideoUpload } = useVideoUpload(
    useCallback(
      (mediaElement) => {
        if (selectedMasterLayoutId) {
          addLayoutElement(selectedMasterLayoutId, "media", mediaElement);
        } else {
          addMasterElement("media", mediaElement);
        }
      },
      [selectedMasterLayoutId, addLayoutElement, addMasterElement],
    ),
  );

  const handleAddMasterTextElement = useCallback(() => {
    if (selectedMasterLayoutId) {
      addLayoutElement(
        selectedMasterLayoutId,
        "text",
        createTextElementDefaults(4, "Layout text"),
      );
    } else {
      addMasterElement("text", createTextElementDefaults(10, "Master text"));
    }
  }, [selectedMasterLayoutId, addLayoutElement, addMasterElement]);

  // Context-aware upload/add handlers routed by isSlideMasterOpen
  const activeImageUpload = isSlideMasterOpen
    ? handleMasterImageUpload
    : handleImageUpload;
  const activeVideoUpload = isSlideMasterOpen
    ? handleMasterVideoUpload
    : handleVideoUpload;
  const activeAddTextElement = isSlideMasterOpen
    ? handleAddMasterTextElement
    : handleAddTextElement;

  const exportPresentation = useCallback(
    () => exportToReveal(presentation),
    [presentation],
  );
  const handleExportZip = useCallback(
    () => exportToRevealZip(presentation),
    [presentation],
  );

  const handleCopy = useCallback(
    (elementOrEvent) => {
      if (selectedElementsRaw.length > 1 && !elementOrEvent?.id) {
        copyElement(selectedElementsRaw);
        return;
      }
      const element = elementOrEvent?.id
        ? elementOrEvent
        : getSlideElement(selectedSlide, selectedElementId);
      if (element) copyElement(element);
    },
    [
      selectedSlide,
      selectedElementId,
      selectedElementsRaw,
      copyElement,
    ],
  );

  const handleCut = useCallback(
    (elementOrEvent) => {
      if (selectedElementsRaw.length > 1 && !elementOrEvent?.id) {
        cutElement(selectedElementsRaw);
        return;
      }
      const element = elementOrEvent?.id
        ? elementOrEvent
        : getSlideElement(selectedSlide, selectedElementId);
      if (element) cutElement(element);
    },
    [selectedSlide, selectedElementId, selectedElementsRaw, cutElement],
  );

  const handlePaste = useCallback(() => pasteElement(), [pasteElement]);

  const handleDeleteSelection = useCallback(() => {
    deleteSelectedElements(selectedElementIds);
  }, [deleteSelectedElements, selectedElementIds]);

  const handleNewComment = useCallback(() => {
    setShowComments(true);
    setComposeSession((s) => s + 1);
  }, []);

  const handleSaveAs = useCallback(
    () => downloadPresentationAsJson(presentation),
    [presentation],
  );

  const handleNew = useCallback(async () => {
    const id = await createPresentation(getPresentationTitle(null));
    navigate(`/editor/${id}`);
  }, [navigate]);

  const handleLoadFile = useCallback(
    async (jsonText) => {
      try {
        const id = await importPresentationFromJson(jsonText);
        navigate(`/editor/${id}`);
      } catch (e) {
        console.error("[EditorPage] Failed to import file:", e);
      }
    },
    [navigate],
  );

  const handleDeleteAndGoHome = useCallback(async () => {
    if (!presentationId) return;
    const ok = window.confirm(
      "Delete this presentation? This cannot be undone.",
    );
    if (!ok) return;
    await deletePresentation(presentationId);
    navigate("/");
  }, [presentationId, navigate]);

  const handleFormatChange = useCallback(
    (updates) => {
      if (!activeElementId || !activeTextEl) return;
      if (isSlideMasterOpen) {
        if (selectedMasterLayoutId) {
          updateLayoutElement(selectedMasterLayoutId, "text", activeElementId, {
            formatting: updates,
          });
        } else {
          updateMasterTextFormatting(activeElementId, updates);
        }
        return;
      }
      applyFormatting(selectedElementId, updates);
    },
    [
      activeElementId,
      activeTextEl,
      isSlideMasterOpen,
      selectedMasterLayoutId,
      updateLayoutElement,
      updateMasterTextFormatting,
      applyFormatting,
      selectedElementId,
    ],
  );

  const handleChangeCase = useCallback(
    (mode) => {
      if (!selectedTextEl) return;

      const transform = (text) => {
        if (mode === "lower") return text.toLocaleLowerCase();
        if (mode === "upper") return text.toLocaleUpperCase();
        if (mode === "toggle") {
          return [...text]
            .map((character) =>
              character === character.toLocaleUpperCase()
                ? character.toLocaleLowerCase()
                : character.toLocaleUpperCase(),
            )
            .join("");
        }
        if (mode === "title") {
          return text.replace(
            /(^|[\s([{'"“‘-])(\p{L})/gu,
            (_, prefix, letter) => prefix + letter.toLocaleUpperCase(),
          );
        }
        if (mode === "sentence") {
          return text
            .toLocaleLowerCase()
            .replace(
              /(^|[.!?]\s+)(\p{L})/gu,
              (_, prefix, letter) => prefix + letter.toLocaleUpperCase(),
            );
        }
        return text;
      };

      const selection = activeSelectionRef.current;
      const hasSelection =
        selection?.elementId === selectedTextEl.id &&
        !(
          selection.paragraphIdx ===
            (selection.endParagraphIdx ?? selection.paragraphIdx) &&
          selection.rangeStart === selection.rangeEnd
        );
      const paragraphs = structuredClone(selectedTextEl.paragraphs ?? []);

      paragraphs.forEach((paragraph, paragraphIndex) => {
        if (
          hasSelection &&
          (paragraphIndex < selection.paragraphIdx ||
            paragraphIndex >
              (selection.endParagraphIdx ?? selection.paragraphIdx))
        ) {
          return;
        }

        const paragraphLength = (paragraph.runs ?? []).reduce(
          (total, run) => total + (run.text?.length ?? 0),
          0,
        );
        const start =
          hasSelection && paragraphIndex === selection.paragraphIdx
            ? selection.rangeStart
            : 0;
        const end =
          hasSelection &&
          paragraphIndex ===
            (selection.endParagraphIdx ?? selection.paragraphIdx)
            ? selection.rangeEnd
            : paragraphLength;

        let offset = 0;
        paragraph.runs = (paragraph.runs ?? []).map((run) => {
          const runText = run.text ?? "";
          const runStart = offset;
          const runEnd = runStart + runText.length;
          offset = runEnd;
          const overlapStart = Math.max(start, runStart);
          const overlapEnd = Math.min(end, runEnd);
          if (overlapStart >= overlapEnd) return run;
          const localStart = overlapStart - runStart;
          const localEnd = overlapEnd - runStart;
          return {
            ...run,
            text:
              runText.slice(0, localStart) +
              transform(runText.slice(localStart, localEnd)) +
              runText.slice(localEnd),
          };
        });
      });

      updateTextElementParagraphs(
        selectedSlideIndex,
        selectedTextEl.id,
        paragraphs,
      );
    },
    [
      selectedTextEl,
      selectedSlideIndex,
      updateTextElementParagraphs,
    ],
  );

  const handleStartEditing = useCallback((id) => {
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

  const handleSaveSelection = useCallback((elementId, offsets) => {
    const sel = offsets ? { elementId, ...offsets } : null;
    activeSelectionRef.current = sel;
    setActiveSelection(sel);
    const isRealSel =
      offsets &&
      !(
        offsets.paragraphIdx ===
          (offsets.endParagraphIdx ?? offsets.paragraphIdx) &&
        offsets.rangeStart === offsets.rangeEnd
      );
    if (isRealSel) setPendingFormatting({});
  }, []);

  const handleMasterSaveSelection = useCallback((elementId, offsets) => {
    setMasterActiveSelection(offsets ? { elementId, ...offsets } : null);
  }, []);

  const handleOpenPreviewFromBeginning = useCallback(() => {
    setPreviewStartSlide(0);
    openPreview();
  }, [openPreview]);

  const openFind = useCallback(() => {
    setFindReplaceMode("find");
    openFindReplace();
  }, [openFindReplace]);

  const openReplace = useCallback(() => {
    setFindReplaceMode("replace");
    openFindReplace();
  }, [openFindReplace]);

  const handleSelectAll = useCallback(() => {
    if (selectedTextEl && editingTextElementId === selectedTextEl.id) {
      const editable = document.querySelector(
        `[data-element-id="${selectedTextEl.id}"] [contenteditable="true"]`,
      );
      if (editable) {
        const range = document.createRange();
        range.selectNodeContents(editable);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        editable.focus();
        return;
      }
    }

    const elementIds = [
      ...(selectedSlide?.contents?.text ?? []),
      ...(selectedSlide?.contents?.media ?? []),
    ].map((element) => element.id);
    selectElements(elementIds);
  }, [
    selectedTextEl,
    editingTextElementId,
    selectedSlide,
    selectElements,
  ]);

  const handleSelectObjects = useCallback(() => {
    setObjectSelectionMode((active) => !active);
  }, []);

  const handleOpenPreviewFromCurrent = useCallback(() => {
    setPreviewStartSlide(selectedSlideIndex);
    openPreview();
  }, [openPreview, selectedSlideIndex]);

  const handleToggleSlideHidden = useCallback(
    () => toggleSlideHidden(selectedSlideIndex),
    [toggleSlideHidden, selectedSlideIndex],
  );

  const handleApplyTransitionToAll = useCallback(
    () => applyTransitionToAll(currentTransition, currentDuration),
    [applyTransitionToAll, currentTransition, currentDuration],
  );

  const handleChangeParagraphs = useCallback(
    (elementId, paragraphs) =>
      updateTextElementParagraphs(selectedSlideIndex, elementId, paragraphs),
    [updateTextElementParagraphs, selectedSlideIndex],
  );

  const handleCloseSlideMasterView = useCallback(() => {
    setIsSlideMasterOpen(false);
    setSelectedMasterLayoutId(null);
  }, []);

  const handleUpdateMasterElementPosition = useCallback(
    (id, x, y) => {
      updateMasterElement("text", id, { position: { x, y } });
      updateMasterElement("media", id, { position: { x, y } });
    },
    [updateMasterElement],
  );

  const handleUpdateMasterElementSize = useCallback(
    (id, w, h) => {
      updateMasterElement("text", id, { width: w, height: h });
      updateMasterElement("media", id, { width: w, height: h });
    },
    [updateMasterElement],
  );

  return {
    // Loading
    isLoading,

    // Presentation data
    state,
    presentation,
    slides,
    selectedSlide,
    selectedSlideIndex,
    selectedElementId,
    selectedElementIds,
    selectedElementsRaw,
    layouts,
    slideWidth,
    slideHeight,
    currentTransition,
    currentDuration,
    presentationTitle,
    selectedTextEl,
    masterSelectedTextEl,
    selectedElement,
    currentFormatting,
    hasRealSelection,
    activePendingFormatting,

    // View state
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
    closePreview,
    previewEffect,
    setPreviewEffect,
    triggerAnimationPreview,
    triggerTransitionPreview,
    previewStartSlide,

    // UI state
    showComments,
    setShowComments,
    composeSession,
    isSlideMasterOpen,
    setIsSlideMasterOpen,
    masterName,
    setMasterName,
    selectedMasterElementId,
    setSelectedMasterElementId,
    selectedMasterLayoutId,
    setSelectedMasterLayoutId,
    clearSelectionSignal,
    editingTextElementId,
    findReplaceMode,
    findReplace,
    showSelectionPane,
    setShowSelectionPane,
    objectSelectionMode,

    // Handlers
    handleApplyBackground,
    handleUpdateDimensions,
    activeImageUpload,
    activeVideoUpload,
    activeAddTextElement,
    handleAddMasterTextElement,
    exportPresentation,
    handleExportZip,
    handleCopy,
    handleCut,
    handlePaste,
    handleDeleteSelection,
    handleNewComment,
    handleSaveAs,
    handleNew,
    handleLoadFile,
    handleDeleteAndGoHome,
    handleFormatChange,
    handleChangeCase,
    handleStartEditing,
    handleStopEditing,
    handleSaveSelection,
    handleMasterSaveSelection,
    handleOpenPreviewFromBeginning,
    handleOpenPreviewFromCurrent,
    openFind,
    openReplace,
    handleSelectAll,
    handleSelectObjects,
    handleElementSelect,
    handleMoveElement,
    handleSetElementsVisibility,
    handleMoveSelectionLayer,
    handleToggleSlideHidden,
    handleApplyTransitionToAll,
    handleChangeParagraphs,
    handleCloseSlideMasterView,
    handleUpdateMasterElementPosition,
    handleUpdateMasterElementSize,
    handleBringToFront,
    handleSendToBack,
    handleBringForward,
    handleSendBackward,
    handleRotateRight,
    applyFormatting,

    // Actions (passed through)
    setSelectedSlideId,
    selectElement,
    selectElements,
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
    updateTextRangeFormatting,
    updateRunLink,
    updateElementPosition,
    updateElementSize,
    updateElement,
    updateElements,
    addMedia,
    updateMedia,
    deleteElement,
    deleteMedia,
    updateSlideNotes,
    updateSlideTransition,
    updateTransitionDuration,
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
    updateLayoutItem,
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
    addComment,
    deleteComment,
    setPendingFormatting,
  };
}
