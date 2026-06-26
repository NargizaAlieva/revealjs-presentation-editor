import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { isUndoShortcut, isRedoShortcut } from "../core/events/keyboardShortcuts";
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
import { EditorEventType, createEditorEvent } from "../core/events/editorEvents";
import { getSlideSize } from "../core/render/slidesetRenderUtils";
import { getSlideElement } from "../core/operations/slideOperations";
import { getElementLabel } from "../core/operations/elementOperations";
import {
  createImageMediaElement,
  createVideoMediaElement,
} from "../core/operations/mediaOperations";
import { getPresentationTitle } from "../core/utils/presentationUtils";
import { getSlideTransition } from "../core/model/transitionDefaults";
import { importPresentationFromJson } from "../core/persistence/importPresentation";
import { createTextElementDefaults } from "../core/model/masterDefaults";
import { updateThemeBackground } from "../core/model/designThemes";
import { clampSlideDimension } from "../core/model/slideSizes";
import { toHex9 } from "../core/utils/colorUtils";
import { getLayoutDisplayList } from "../core/operations/layoutOperations";
import { buildMasterPseudoSlide, buildLayoutPseudoSlide } from "../core/operations/masterOperations";
import {
  exportToReveal,
  exportToRevealZip,
} from "../core/export/exportToReveal";
import {
  deletePresentation,
  createPresentation,
  downloadPresentationAsJson,
  storeMediaFile,
} from "../core/persistence/persistenceFacade";

const PASTE_RUN_KEYS = new Set([
  "weight",
  "italics",
  "text-decoration",
  "color",
  "size",
  "font",
  "super-sub-script",
  "highlight",
]);

const paragraphTextLength = (paragraph) =>
  (paragraph?.runs ?? []).reduce((sum, run) => sum + (run.text?.length ?? 0), 0);

const paragraphText = (paragraph) =>
  (paragraph?.runs ?? []).map((run) => run.text ?? "").join("");

const getSelectedPlainText = (textElement, selection) => {
  if (!textElement || !selection) return "";
  const startParagraphIdx = Math.min(
    selection.paragraphIdx,
    selection.endParagraphIdx ?? selection.paragraphIdx,
  );
  const endParagraphIdx = Math.max(
    selection.paragraphIdx,
    selection.endParagraphIdx ?? selection.paragraphIdx,
  );
  const lines = [];
  for (let pIdx = startParagraphIdx; pIdx <= endParagraphIdx; pIdx++) {
    const text = paragraphText(textElement.paragraphs?.[pIdx]);
    const start = pIdx === selection.paragraphIdx ? selection.rangeStart : 0;
    const end =
      pIdx === (selection.endParagraphIdx ?? selection.paragraphIdx)
        ? selection.rangeEnd
        : text.length;
    lines.push(text.slice(Math.min(start, end), Math.max(start, end)));
  }
  return lines.join("\n");
};

const sliceRuns = (runs = [], start, end) => {
  const result = [];
  let offset = 0;
  for (const run of runs) {
    const text = run.text ?? "";
    const runStart = offset;
    const runEnd = offset + text.length;
    const from = Math.max(start, runStart);
    const to = Math.min(end, runEnd);
    if (to > from) {
      result.push({
        ...run,
        text: text.slice(from - runStart, to - runStart),
      });
    }
    offset = runEnd;
  }
  return result;
};

const mergeRuns = (runs) => {
  const merged = [];
  for (const run of runs.filter(Boolean)) {
    if (run.text === "" && runs.length > 1) continue;
    const previous = merged.at(-1);
    if (
      previous &&
      JSON.stringify(previous.formatting ?? {}) ===
        JSON.stringify(run.formatting ?? {}) &&
      JSON.stringify(previous.link ?? null) === JSON.stringify(run.link ?? null) &&
      previous["super-sub-script"] === run["super-sub-script"]
    ) {
      previous.text += run.text ?? "";
    } else {
      merged.push(run);
    }
  }
  return merged.length
    ? merged
    : [{ text: "", formatting: {}, "super-sub-script": "normal", link: null }];
};

const buildPasteRun = (text, formatting = {}) => {
  const runFormatting = Object.fromEntries(
    Object.entries(formatting).filter(
      ([key, value]) => PASTE_RUN_KEYS.has(key) && value !== "mixed",
    ),
  );
  const superSubScript = runFormatting["super-sub-script"] ?? "normal";
  delete runFormatting["super-sub-script"];
  return {
    text,
    formatting: runFormatting,
    "super-sub-script": superSubScript,
    link: null,
  };
};

const readImageDimensionsFromFile = (file) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve({ width: 300, height: 200 });
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });

const fitImageToSlide = (width, height, slideWidth, slideHeight) => {
  const maxW = slideWidth * 0.35;
  const maxH = slideHeight * 0.35;
  if (width <= maxW && height <= maxH) return { width, height };
  const scale = Math.min(maxW / width, maxH / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const insertPlainTextIntoParagraphs = (
  paragraphs,
  selection,
  text,
  formatting,
) => {
  const sourceParagraphs = structuredClone(paragraphs ?? []);
  if (!sourceParagraphs.length || !selection || !text) return null;

  const startParagraphIdx = Math.min(
    selection.paragraphIdx,
    selection.endParagraphIdx ?? selection.paragraphIdx,
  );
  const endParagraphIdx = Math.max(
    selection.paragraphIdx,
    selection.endParagraphIdx ?? selection.paragraphIdx,
  );
  const startOffset =
    startParagraphIdx === selection.paragraphIdx
      ? selection.rangeStart
      : selection.rangeEnd;
  const endOffset =
    endParagraphIdx === (selection.endParagraphIdx ?? selection.paragraphIdx)
      ? selection.rangeEnd
      : selection.rangeStart;

  const startParagraph = sourceParagraphs[startParagraphIdx];
  const endParagraph = sourceParagraphs[endParagraphIdx];
  if (!startParagraph || !endParagraph) return null;

  const safeStartOffset = Math.max(
    0,
    Math.min(startOffset, paragraphTextLength(startParagraph)),
  );
  const safeEndOffset = Math.max(
    0,
    Math.min(endOffset, paragraphTextLength(endParagraph)),
  );
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const beforeRuns = sliceRuns(
    startParagraph.runs,
    0,
    Math.min(safeStartOffset, paragraphTextLength(startParagraph)),
  );
  const afterRuns = sliceRuns(
    endParagraph.runs,
    Math.max(safeEndOffset, 0),
    paragraphTextLength(endParagraph),
  );

  const makeInsertedRuns = (line) =>
    line ? [buildPasteRun(line, formatting)] : [];

  const replacementParagraphs =
    lines.length === 1
      ? [
          {
            ...startParagraph,
            runs: mergeRuns([
              ...beforeRuns,
              ...makeInsertedRuns(lines[0]),
              ...afterRuns,
            ]),
          },
        ]
      : lines.map((line, index) => {
          if (index === 0) {
            return {
              ...startParagraph,
              runs: mergeRuns([...beforeRuns, ...makeInsertedRuns(line)]),
            };
          }
          if (index === lines.length - 1) {
            return {
              ...endParagraph,
              id: crypto.randomUUID?.() ?? `p-${Date.now()}-${index}`,
              formatting: { ...(startParagraph.formatting ?? {}) },
              userSetKeys: [...(startParagraph.userSetKeys ?? [])],
              runs: mergeRuns([...makeInsertedRuns(line), ...afterRuns]),
            };
          }
          return {
            ...startParagraph,
            id: crypto.randomUUID?.() ?? `p-${Date.now()}-${index}`,
            runs: mergeRuns(makeInsertedRuns(line)),
          };
        });

  const nextParagraphs = [
    ...sourceParagraphs.slice(0, startParagraphIdx),
    ...replacementParagraphs,
    ...sourceParagraphs.slice(endParagraphIdx + 1),
  ];
  const cursorParagraphIdx = startParagraphIdx + lines.length - 1;
  const cursorOffset =
    lines.length === 1
      ? safeStartOffset + lines[0].length
      : lines.at(-1).length;

  return {
    paragraphs: nextParagraphs,
    selection: {
      paragraphIdx: cursorParagraphIdx,
      rangeStart: cursorOffset,
      endParagraphIdx: cursorParagraphIdx,
      rangeEnd: cursorOffset,
    },
  };
};

export function useEditorController() {
  const { presentationId } = useParams();
  const navigate = useNavigate();

  const [previewStartSlide, setPreviewStartSlide] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [ctrl_cropSignal, setCtrlCropSignal] = useState(0);
  const [previewMediaEffects, setPreviewMediaEffects] = useState(null);
  const [previewMediaStyleId, setPreviewMediaStyleId] = useState(null);
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
    updateElementSilent,
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
    addLayout,
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
    updateLayoutTextFormattingAction,
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

      beginHistory();
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
        updateTextElementParagraphs(slideIndex, elementId, paragraphs, true);
      });
      commitHistory();
    },
    [slides, updateTextElementParagraphs, beginHistory, commitHistory],
  );

  const findReplace = useFindReplace(
    slides,
    handleFindNavigate,
    handleReplaceText,
    handleReplaceAllText,
  );
  const openFindReplace = findReplace.open;

  usePresentationFonts(presentation);

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
  const selectedHyperlinkText = useMemo(
    () =>
      hasRealSelection
        ? getSelectedPlainText(activeTextEl, activeSelectionForFormatting)
        : "",
    [activeTextEl, activeSelectionForFormatting, hasRealSelection],
  );

  const applyFormatting = useApplyFormatting({
    activeSelectionRef,
    editingTextElementIdRef,
    currentFormatting,
    updateTextRangeFormatting,
    updateTextElementFormatting,
    updateParagraphFormatting,
    setPendingFormatting,
  });

  const selectedElementRaw = isSlideMasterOpen
    ? (() => {
        const master = presentation?.slideset?.master;
        const mediaEl = (master?.elements?.media ?? []).find((m) => m.id === selectedMasterElementId);
        if (mediaEl) return mediaEl;
        if (selectedMasterLayoutId) {
          const layout = (presentation?.slideset?.layouts ?? []).find((l) => l["layout-id"] === selectedMasterLayoutId);
          return (layout?.elements?.media ?? []).find((m) => m.id === selectedMasterElementId) ?? null;
        }
        return null;
      })()
    : getSlideElement(selectedSlide, selectedElementId);

  useEffect(() => {
    if (activeTab !== "Picture Format") return;
    const isMedia = selectedElementRaw && !selectedElementRaw.paragraphs;
    if (!isMedia) setActiveTab("Home");
  }, [selectedElementRaw, activeTab, setActiveTab]);

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
        if (mode === "backward") nextZ = Math.max(1, currentZ - 1);
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

  const handleChangePicture = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const el = selectedElementRaw;
      if (!el?.id) return;

      const objectUrl = URL.createObjectURL(file);
      const naturalDims = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(objectUrl); };
        img.onerror = () => { resolve({ w: 300, h: 200 }); URL.revokeObjectURL(objectUrl); };
        img.src = objectUrl;
      });

      const maxW = slideWidth * 0.3;
      const maxH = slideHeight * 0.3;
      const scale = Math.min(1, maxW / naturalDims.w, maxH / naturalDims.h);
      const displayW = Math.round(naturalDims.w * scale);
      const displayH = Math.round(naturalDims.h * scale);

      const { key } = await storeMediaFile(file);
      updateMedia(el.id, {
        "file-link": `indexeddb://${key}`,
        width: displayW,
        height: displayH,
        "source-width": naturalDims.w,
        "source-height": naturalDims.h,
        crop: null,
      });
    },
    [selectedElementRaw, updateMedia, slideWidth, slideHeight],
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

  const handleApplyBackgroundToAll = useCallback(
    (payload) => {
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.APPLY_BACKGROUND_TO_ALL, payload),
      );
    },
    [eventBus],
  );

  const handleUpdateBgFillSettings = useCallback(
    (settings) => {
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_BG_FILL_SETTINGS, { settings }),
      );
    },
    [eventBus],
  );

  const handleApplyBgFillImage = useCallback(
    async (file) => {
      if (!file || !file.type.startsWith("image/")) return;
      const { key } = await storeMediaFile(file);
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_BG_FILL_IMAGE, { fileLink: `indexeddb://${key}` }),
      );
    },
    [eventBus],
  );

  const handleRemoveBgFillImage = useCallback(() => {
    eventBus.dispatch(
      createEditorEvent(EditorEventType.SLIDE.UPDATE_BG_FILL_IMAGE, { fileLink: null }),
    );
  }, [eventBus]);

  const handleApplySlideBackground = useCallback(
    (color) => {
      eventBus.dispatch(
        createEditorEvent(EditorEventType.SLIDE.UPDATE_BACKGROUND, { color }),
      );
    },
    [eventBus],
  );


  const handleUpdateDimensions = useCallback(
    (dimensions, aspectRatio, units) => {
      const w = clampSlideDimension(dimensions.width, 1280);
      const h = clampSlideDimension(dimensions.height, 720);
      updateMasterDimensions({ width: w, height: h }, aspectRatio, units);
    },
    [updateMasterDimensions],
  );

  const { handleImageUpload } = useImageUpload(addMedia, slideWidth, slideHeight);
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
    slideWidth,
    slideHeight,
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

  const handlePasteText = useCallback(
    async (elementId, mode = "destination") => {
      const targetId = elementId ?? selectedElementId;
      const textElement =
        targetId === selectedTextEl?.id
          ? selectedTextEl
          : (selectedSlide?.contents?.text ?? []).find((el) => el.id === targetId);
      const selection = activeSelectionRef.current;
      if (!targetId || !textElement || selection?.elementId !== targetId) {
        pasteElement();
        return false;
      }

      let clipboardText = "";
      try {
        clipboardText = await navigator.clipboard?.readText?.();
      } catch (error) {
        console.warn("[EditorPage] Clipboard text paste failed:", error);
      }

      if (!clipboardText) {
        pasteElement();
        return false;
      }

      const result = insertPlainTextIntoParagraphs(
        textElement.paragraphs,
        selection,
        clipboardText,
        mode === "text" ? {} : currentFormatting,
      );
      if (!result) return false;

      updateTextElementParagraphs(
        selectedSlideIndex,
        targetId,
        result.paragraphs,
        true,
      );
      const nextSelection = { elementId: targetId, ...result.selection };
      activeSelectionRef.current = nextSelection;
      setActiveSelection(nextSelection);
      setPendingFormatting({});
      return true;
    },
    [
      selectedElementId,
      selectedTextEl,
      selectedSlide,
      currentFormatting,
      updateTextElementParagraphs,
      selectedSlideIndex,
      pasteElement,
    ],
  );

  const handlePastePicture = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard?.read?.();
      const imageItem = clipboardItems?.find((item) =>
        item.types.some((type) => type.startsWith("image/")),
      );
      const imageType = imageItem?.types.find((type) =>
        type.startsWith("image/"),
      );
      if (!imageItem || !imageType) return false;

      const blob = await imageItem.getType(imageType);
      const file = new File([blob], `clipboard-image.${imageType.split("/")[1] ?? "png"}`, {
        type: imageType,
      });
      const [{ mediaId, key }, naturalSize] = await Promise.all([
        storeMediaFile(file),
        readImageDimensionsFromFile(file),
      ]);
      const displaySize = fitImageToSlide(
        naturalSize.width,
        naturalSize.height,
        slideWidth,
        slideHeight,
      );
      addMedia(createImageMediaElement(mediaId, key, displaySize));
      return true;
    } catch (error) {
      console.warn("[EditorPage] Clipboard picture paste failed:", error);
      return false;
    }
  }, [addMedia, slideWidth, slideHeight]);

  const handlePlaceholderImageUpload = useCallback(
    async (placeholderElement, file) => {
      if (!placeholderElement || !file?.type?.startsWith("image/")) return;
      const [{ mediaId, key }, naturalSize] = await Promise.all([
        storeMediaFile(file),
        readImageDimensionsFromFile(file),
      ]);
      addMedia({
        ...createImageMediaElement(mediaId, key, {
          width: placeholderElement.width ?? naturalSize.width,
          height: placeholderElement.height ?? naturalSize.height,
        }),
        "placeholder-id": placeholderElement["placeholder-id"],
        position: { ...(placeholderElement.position ?? { x: 60, y: 60 }) },
        width: placeholderElement.width ?? naturalSize.width,
        height: placeholderElement.height ?? naturalSize.height,
        "source-width": naturalSize.width,
        "source-height": naturalSize.height,
        "z-index": placeholderElement["z-index"] ?? 1,
      });
      updateElement(placeholderElement.id, { hidden: true });
    },
    [addMedia, updateElement],
  );

  const handlePlaceholderVideoUpload = useCallback(
    async (placeholderElement, file) => {
      if (!placeholderElement || !file?.type?.startsWith("video/")) return;
      const { mediaId, key } = await storeMediaFile(file);
      addMedia({
        ...createVideoMediaElement(mediaId, key),
        "placeholder-id": placeholderElement["placeholder-id"],
        position: { ...(placeholderElement.position ?? { x: 60, y: 60 }) },
        width: placeholderElement.width ?? 480,
        height: placeholderElement.height ?? 270,
        "z-index": placeholderElement["z-index"] ?? 1,
      });
      updateElement(placeholderElement.id, { hidden: true });
    },
    [addMedia, updateElement],
  );

  const handleDeleteSelection = useCallback(() => {
    deleteSelectedElements(selectedElementIds);
  }, [deleteSelectedElements, selectedElementIds]);

  const handleNewComment = useCallback(() => {
    setShowComments(true);
    setComposeSession((s) => s + 1);
  }, []);

  const handleHyperlink = useCallback(
    (elementId, hyperlink) => {
      const selection = activeSelectionRef.current;
      const targetId = elementId ?? selectedElementId;
      const rawHref =
        typeof hyperlink === "string" ? hyperlink : hyperlink?.href;
      const linkType =
        typeof hyperlink === "string" ? "web" : (hyperlink?.type ?? "web");
      const trimmedHref = rawHref?.trim() ?? "";
      const normalizedHref =
        linkType === "email" && !trimmedHref.startsWith("mailto:")
          ? `mailto:${trimmedHref}`
          : linkType === "web" &&
              trimmedHref &&
              !/^(https?:|mailto:|blob:|file:|indexeddb:|#|\/)/i.test(trimmedHref)
            ? `https://${trimmedHref}`
            : trimmedHref;
      if (
        !targetId ||
        !normalizedHref ||
        selection?.elementId !== targetId ||
        selection.paragraphIdx !==
          (selection.endParagraphIdx ?? selection.paragraphIdx) ||
        selection.rangeStart === selection.rangeEnd
      ) {
        return false;
      }

      updateRunLink(
        targetId,
        selection.paragraphIdx,
        Math.min(selection.rangeStart, selection.rangeEnd),
        Math.max(selection.rangeStart, selection.rangeEnd),
        {
          href: normalizedHref,
          target: "_blank",
          screenTip:
            typeof hyperlink === "string" ? "" : (hyperlink?.screenTip ?? ""),
          type: linkType,
        },
      );
      return true;
    },
    [selectedElementId, updateRunLink],
  );

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

  const masterTextIds = useMemo(
    () => new Set((presentation?.slideset?.master?.elements?.text ?? []).map((el) => el.id)),
    [presentation?.slideset?.master?.elements?.text],
  );
  const masterMediaIds = useMemo(
    () => new Set((presentation?.slideset?.master?.elements?.media ?? []).map((el) => el.id)),
    [presentation?.slideset?.master?.elements?.media],
  );
  const selectedMasterLayout = useMemo(
    () =>
      selectedMasterLayoutId
        ? (presentation?.slideset?.layouts ?? []).find(
            (l) => l["layout-id"] === selectedMasterLayoutId,
          ) ?? null
        : null,
    [presentation?.slideset?.layouts, selectedMasterLayoutId],
  );
  const masterElements = presentation?.slideset?.master?.elements;
  const masterFormatting = presentation?.slideset?.master?.formatting;
  const masterColorTheme = presentation?.slideset?.master?.["color-theme"];
  const activeMasterSlide = useMemo(() => {
    return selectedMasterLayout
      ? buildLayoutPseudoSlide(
          selectedMasterLayout,
          masterFormatting ?? {},
          masterColorTheme ?? [],
        )
      : buildMasterPseudoSlide(masterElements ?? {});
  }, [selectedMasterLayout, masterElements, masterFormatting, masterColorTheme]);

  const masterViewChangeText = useCallback(
    (id, text) => {
      if (selectedMasterLayoutId && !masterTextIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, { promptText: text });
      } else {
        updateMasterTextContent(id, text);
      }
    },
    [selectedMasterLayoutId, masterTextIds, updateLayoutItem, updateMasterTextContent],
  );

  const masterViewChangeParagraphs = useCallback(
    (id, paragraphs) => {
      if (selectedMasterLayoutId && !masterTextIds.has(id)) {
        const layout = (presentation?.slideset?.layouts ?? []).find(
          (l) => l["layout-id"] === selectedMasterLayoutId,
        );
        const isPlaceholder = (layout?.placeholders ?? []).some(
          (p) => p["placeholder-id"] === id,
        );
        if (isPlaceholder) {
          const text = paragraphs.map((p) => p.runs.map((r) => r.text).join("")).join("\n");
          updateLayoutItem(selectedMasterLayoutId, id, { promptText: text });
        } else {
          const paragraphsWithKeys = paragraphs.map((p) => ({
            ...p,
            userSetKeys: p.userSetKeys?.length
              ? p.userSetKeys
              : Object.keys(p.formatting ?? {}),
          }));
          updateLayoutItem(selectedMasterLayoutId, id, { paragraphs: paragraphsWithKeys, userModified: true });
        }
      } else {
        const paragraphsWithKeys = paragraphs.map((p) => ({
          ...p,
          userSetKeys: p.userSetKeys?.length
            ? p.userSetKeys
            : Object.keys(p.formatting ?? {}),
        }));
        updateMasterElement("text", id, { paragraphs: paragraphsWithKeys, userModified: true });
      }
    },
    [selectedMasterLayoutId, masterTextIds, presentation, updateLayoutItem, updateMasterElement],
  );

  const masterViewFormatText = useCallback(
    (id, rawFmt) => {
      const delta = Number(rawFmt["font-size-delta"] ?? 0);
      let fmt = rawFmt;
      if (delta) {
        const el = findMasterTextElement(presentation, selectedMasterLayoutId, id);
        const currentSize = parseFloat(el?.paragraphs?.[0]?.formatting?.size ?? masterFormatting?.size ?? "24") || 24;
        const newSize = Math.max(6, Math.min(120, currentSize + delta));
        fmt = { ...rawFmt, "font-size-delta": undefined, size: `${newSize}px` };
        delete fmt["font-size-delta"];
      }
      if (selectedMasterLayoutId && !masterTextIds.has(id)) {
        const layout = (presentation?.slideset?.layouts ?? []).find(
          (l) => l["layout-id"] === selectedMasterLayoutId,
        );
        const isPlaceholder = (layout?.placeholders ?? []).some(
          (p) => p["placeholder-id"] === id,
        );
        if (isPlaceholder) {
          updateLayoutItem(selectedMasterLayoutId, id, { formatting: fmt });
        } else {
          updateLayoutTextFormattingAction(selectedMasterLayoutId, id, fmt);
        }
      } else {
        updateMasterTextFormatting(id, fmt);
      }
    },
    [selectedMasterLayoutId, masterTextIds, presentation, masterFormatting, updateLayoutItem, updateLayoutTextFormattingAction, updateMasterTextFormatting],
  );

  const masterViewMoveText = useCallback(
    (id, x, y) => {
      if (selectedMasterLayoutId && !masterTextIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, { position: { x, y } });
      } else {
        updateMasterElement("text", id, { position: { x, y } });
      }
    },
    [selectedMasterLayoutId, masterTextIds, updateLayoutItem, updateMasterElement],
  );

  const masterViewResizeText = useCallback(
    (id, w, h) => {
      if (selectedMasterLayoutId && !masterTextIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, { width: w, height: h });
      } else {
        updateMasterElement("text", id, { width: w, height: h });
      }
    },
    [selectedMasterLayoutId, masterTextIds, updateLayoutItem, updateMasterElement],
  );

  const masterViewMoveMedia = useCallback(
    (id, x, y) => {
      if (selectedMasterLayoutId && !masterMediaIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, { position: { x, y } });
      } else {
        updateMasterElement("media", id, { position: { x, y } });
      }
    },
    [selectedMasterLayoutId, masterMediaIds, updateLayoutItem, updateMasterElement],
  );

  const masterViewResizeMedia = useCallback(
    (id, w, h) => {
      const allMedia = presentation?.slideset?.master?.elements?.media ?? [];
      const el = allMedia.find((m) => m.id === id);
      const updates = { width: w, height: h };
      if (el && "source-width" in el) {
        const hasCrop = (el.crop ?? []).some((v) => v !== 0);
        if (hasCrop) {
          const scaleX = el.width > 0 ? w / el.width : 1;
          const scaleY = el.height > 0 ? h / el.height : 1;
          updates["source-width"] = (el["source-width"] ?? el.width) * scaleX;
          updates["source-height"] = (el["source-height"] ?? el.height) * scaleY;
        } else {
          updates["source-width"] = w;
          updates["source-height"] = h;
          updates.crop = [];
        }
      }
      if (selectedMasterLayoutId && !masterMediaIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, { width: w, height: h });
      } else {
        updateMasterElement("media", id, updates);
      }
    },
    [selectedMasterLayoutId, masterMediaIds, updateLayoutItem, updateMasterElement, presentation],
  );

  const masterViewAutoFitText = useCallback(
    (id, updates) => {
      if (selectedMasterLayoutId && !masterTextIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, updates);
      } else {
        updateMasterElement("text", id, updates);
      }
    },
    [selectedMasterLayoutId, masterTextIds, updateLayoutItem, updateMasterElement],
  );

  const masterViewAutoFitMedia = useCallback(
    (id, updates) => {
      if (selectedMasterLayoutId && !masterMediaIds.has(id)) {
        updateLayoutItem(selectedMasterLayoutId, id, updates);
      } else {
        updateMasterElement("media", id, updates);
      }
    },
    [selectedMasterLayoutId, masterMediaIds, updateLayoutItem, updateMasterElement],
  );

  const masterViewDeleteText = useCallback(
    (id) => {
      if (masterTextIds.has(id)) {
        deleteMasterElement("text", id);
      } else if (selectedMasterLayoutId) {
        const isPlaceholder = (selectedMasterLayout?.placeholders ?? []).some(
          (p) => p["placeholder-id"] === id,
        );
        if (isPlaceholder) {
          removeLayoutPlaceholder(selectedMasterLayoutId, id);
        } else {
          deleteLayoutElement(selectedMasterLayoutId, "text", id);
        }
      }
    },
    [selectedMasterLayoutId, selectedMasterLayout, masterTextIds, removeLayoutPlaceholder, deleteLayoutElement, deleteMasterElement],
  );

  const masterViewDeleteMedia = useCallback(
    (id) => {
      if (selectedMasterLayoutId && !masterMediaIds.has(id)) {
        deleteLayoutElement(selectedMasterLayoutId, "media", id);
      } else {
        deleteMasterElement("media", id);
      }
    },
    [selectedMasterLayoutId, masterMediaIds, deleteLayoutElement, deleteMasterElement],
  );

  const handleFormatChange = useCallback(
    (updates) => {
      if (!activeElementId || !activeTextEl) return;
      if (isSlideMasterOpen) {
        const delta = Number(updates["font-size-delta"] ?? 0);
        const resolved = delta
          ? {
              ...updates,
              "font-size-delta": undefined,
              size: `${Math.max(6, Math.min(120, (parseFloat(currentFormatting.size) || 24) + delta))}px`,
            }
          : updates;
        if (resolved["font-size-delta"] === undefined) delete resolved["font-size-delta"];
        masterViewFormatText(activeElementId, resolved);
        return;
      }
      applyFormatting(selectedElementId, updates);
    },
    [
      activeElementId,
      activeTextEl,
      isSlideMasterOpen,
      currentFormatting,
      masterViewFormatText,
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
    (elementId, paragraphs, grouped = false) =>
      updateTextElementParagraphs(selectedSlideIndex, elementId, paragraphs, grouped),
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isNativeInput =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (isNativeInput) return;
      if (isUndoShortcut(event)) {
        event.preventDefault();
        undo();
      } else if (isRedoShortcut(event)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  return {
    isLoading,

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
    selectedMediaElement: selectedElementRaw?.paragraphs ? null : selectedElementRaw ?? null,
    handleChangePicture,
    cropSignal: ctrl_cropSignal,
    triggerCrop: () => setCtrlCropSignal((n) => n + 1),
    previewMediaEffects,
    setPreviewMediaEffects,
    previewMediaStyleId,
    setPreviewMediaStyleId,
    currentFormatting,
    selectedHyperlinkText,
    hasRealSelection,
    activePendingFormatting,

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

    handleApplyBackground,
    handleApplyBackgroundToAll,
    handleUpdateBgFillSettings,
    handleApplyBgFillImage,
    handleRemoveBgFillImage,
    handleApplySlideBackground,
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
    handlePasteText,
    handlePastePicture,
    handlePlaceholderImageUpload,
    handlePlaceholderVideoUpload,
    handleDeleteSelection,
    handleNewComment,
    handleHyperlink,
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
    activeMasterSlide,
    masterViewChangeText,
    masterViewChangeParagraphs,
    masterViewFormatText,
    masterViewMoveText,
    masterViewResizeText,
    masterViewMoveMedia,
    masterViewResizeMedia,
    masterViewAutoFitText,
    masterViewAutoFitMedia,
    masterViewDeleteText,
    masterViewDeleteMedia,
    handleBringToFront,
    handleSendToBack,
    handleBringForward,
    handleSendBackward,
    handleRotateRight,
    applyFormatting,

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
    updateElementSilent,
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
    addLayout: () => addLayout(selectedMasterLayoutId),
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
    updateLayoutTextFormattingAction,
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
