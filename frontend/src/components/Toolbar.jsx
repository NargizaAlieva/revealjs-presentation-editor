import { useState } from "react";
import "./Toolbar.css";

import {
  MdAdd,
  MdDelete,
  MdContentCopy,
  MdVisibilityOff,
  MdVisibility,
  MdArrowUpward,
  MdArrowDownward,
  MdSave,
  MdPreview,
  MdFileUpload,
  MdRestartAlt,
  MdImage,
  MdContentPaste,
  MdContentCut,
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdPalette,
  MdSearch,
  MdTextFields,
  MdBlock,
  MdOpacity,
  MdNorth,
  MdSouth,
  MdWest,
  MdEast,
  MdZoomOutMap,
  MdCloseFullscreen,
  MdStrikethroughS,
  MdSpeed,
} from "react-icons/md";

const TABS = [
  "File",
  "Home",
  "Insert",
  "Design",
  "Transitions",
  "Animations",
  "Slide Show",
  "View",
];

const TRANSITIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide", label: "Slide" },
  { value: "convex", label: "Convex" },
  { value: "concave", label: "Concave" },
  { value: "zoom", label: "Zoom" },
];

const ANIMATION_EFFECTS = [
  { value: "none", label: "None", icon: MdBlock },
  { value: "fade-in", label: "Fade", icon: MdOpacity },
  { value: "fade-up", label: "Fade Up", icon: MdNorth },
  { value: "fade-down", label: "Fade Down", icon: MdSouth },
  { value: "fade-left", label: "Fade Left", icon: MdWest },
  { value: "fade-right", label: "Fade Right", icon: MdEast },
  { value: "grow", label: "Grow", icon: MdZoomOutMap },
  { value: "shrink", label: "Shrink", icon: MdCloseFullscreen },
  { value: "strike", label: "Strike", icon: MdStrikethroughS },
];

export default function Toolbar({
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  onSavePresentation,
  onOpenPreview,
  canDelete,
  canMoveUp,
  canMoveDown,
  onExportPresentation,
  onResetPresentation,
  onImageUpload,
  onToggleSlideHidden,
  isSlideHidden,
  onTransitionChange,
  currentTransition,
  selectedElement,
  animations,
  onAddAnimation,
  onUpdateAnimation,
  onDeleteAnimation,
}) {
  const [activeTab, setActiveTab] = useState("Home");
  const [showLayouts, setShowLayouts] = useState(false);

  return (
    <header className="toolbar">
      <nav className="toolbar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`toolbar-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab);
              setShowLayouts(false);
            }}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="toolbar-ribbon">
        {activeTab === "File" && (
          <div className="ribbon-group">
            <button
              className="toolbar-item large"
              onClick={onSavePresentation}
            >
              <MdSave />
              <span>Save</span>
            </button>

            <button
              className="toolbar-item large"
              onClick={onExportPresentation}
            >
              <MdFileUpload />
              <span>Export</span>
            </button>

            <button
              className="toolbar-item large"
              onClick={onResetPresentation}
            >
              <MdRestartAlt />
              <span>Reset</span>
            </button>

            <div className="ribbon-group-title">File</div>
          </div>
        )}

        {activeTab === "Home" && (
          <>
            <div className="ribbon-group clipboard-group">
              <button className="toolbar-item large" disabled>
                <MdContentPaste />
                <span>Paste</span>
              </button>

              <div className="mini-stack">
                <button className="mini-command" disabled>
                  <MdContentCut />
                </button>
                <button className="mini-command" disabled>
                  <MdContentCopy />
                </button>
              </div>

              <div className="ribbon-group-title">Clipboard</div>
            </div>

            <div className="ribbon-group slides-group">
              <div className="toolbar-dropdown-container">
                <button
                  className="toolbar-item large"
                  onClick={() => setShowLayouts(!showLayouts)}
                >
                  <MdAdd />
                  <span>New Slide</span>
                </button>

                {showLayouts && (
                  <div className="layout-popup">
                    <h4>Layouts</h4>

                    <button className="layout-option">
                      <div className="layout-thumb title-layout" />
                      <span>Title Slide</span>
                    </button>

                    <button className="layout-option">
                      <div className="layout-thumb title-content-layout" />
                      <span>Title and Content</span>
                    </button>

                    <button className="layout-option">
                      <div className="layout-thumb two-content-layout" />
                      <span>Two Content</span>
                    </button>

                    <button className="layout-option">
                      <div className="layout-thumb blank-layout" />
                      <span>Blank</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mini-stack text-stack">
                <button className="mini-text-command" disabled>
                  Layout
                </button>
                <button className="mini-text-command" disabled>
                  Reset
                </button>
                <button className="mini-text-command" disabled>
                  Section
                </button>
              </div>

              <button
                className="toolbar-item"
                onClick={onDeleteSlide}
                disabled={!canDelete}
              >
                <MdDelete />
                <span>Delete</span>
              </button>

              <button className="toolbar-item" onClick={onDuplicateSlide}>
                <MdContentCopy />
                <span>Duplicate</span>
              </button>

              <div className="ribbon-group-title">Slides</div>
            </div>

            <div className="ribbon-group font-group">
              <div className="font-row">
                <select className="toolbar-select" disabled>
                  <option>Sora</option>
                  <option>Arial</option>
                  <option>Calibri</option>
                </select>

                <select className="toolbar-size" disabled>
                  <option>28</option>
                  <option>24</option>
                  <option>18</option>
                </select>
              </div>

              <div className="font-row">
                <button className="small-format" disabled>
                  <MdFormatBold />
                </button>
                <button className="small-format" disabled>
                  <MdFormatItalic />
                </button>
                <button className="small-format" disabled>
                  <MdFormatUnderlined />
                </button>
                <button className="small-format" disabled>
                  A
                </button>
                <button className="small-format" disabled>
                  <MdPalette />
                </button>
              </div>

              <div className="ribbon-group-title">Font</div>
            </div>

            <div className="ribbon-group paragraph-group">
              <div className="font-row">
                <button className="small-format" disabled>
                  <MdFormatListBulleted />
                </button>
                <button className="small-format" disabled>
                  <MdFormatListNumbered />
                </button>
                <button className="small-format" disabled>
                  <MdArrowUpward />
                </button>
                <button className="small-format" disabled>
                  <MdArrowDownward />
                </button>
              </div>

              <div className="font-row">
                <button className="small-format" disabled>
                  <MdFormatAlignLeft />
                </button>
                <button className="small-format" disabled>
                  <MdFormatAlignCenter />
                </button>
                <button className="small-format" disabled>
                  <MdFormatAlignRight />
                </button>
              </div>

              <div className="ribbon-group-title">Paragraph</div>
            </div>

            <div className="ribbon-group arrange-group">
              <button className="toolbar-item" onClick={onToggleSlideHidden}>
                {isSlideHidden ? <MdVisibility /> : <MdVisibilityOff />}
                <span>{isSlideHidden ? "Show" : "Hide"}</span>
              </button>

              <button
                className="toolbar-item"
                onClick={onMoveSlideUp}
                disabled={!canMoveUp}
              >
                <MdArrowUpward />
                <span>Up</span>
              </button>

              <button
                className="toolbar-item"
                onClick={onMoveSlideDown}
                disabled={!canMoveDown}
              >
                <MdArrowDownward />
                <span>Down</span>
              </button>

              <div className="ribbon-group-title">Arrange</div>
            </div>

            <div className="ribbon-group editing-group">
              <button className="toolbar-item" disabled>
                <MdSearch />
                <span>Find</span>
              </button>

              <button className="toolbar-item" disabled>
                <MdTextFields />
                <span>Select</span>
              </button>

              <div className="ribbon-group-title">Editing</div>
            </div>
          </>
        )}

        {activeTab === "Insert" && (
          <div className="ribbon-group">
            <label className="toolbar-item large toolbar-upload">
              <MdImage />
              <span>Pictures</span>
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                hidden
              />
            </label>

            <button className="toolbar-item large" disabled>
              <MdTextFields />
              <span>Text Box</span>
            </button>

            <div className="ribbon-group-title">Insert</div>
          </div>
        )}

        {activeTab === "Design" && (
          <div className="toolbar-placeholder">
            Use the Presentation Settings panel on the right to change aspect
            ratio and color theme.
          </div>
        )}

        {activeTab === "Transitions" && (
          <>
            <div className="ribbon-group transitions-preview-group">
              <button className="toolbar-item large" onClick={onOpenPreview}>
                <MdPreview />
                <span>Preview</span>
              </button>
              <div className="ribbon-group-title">Preview</div>
            </div>

            <div className="ribbon-group ribbon-group--transitions">
              {TRANSITIONS.map((t) => (
                <button
                  key={t.value}
                  className={`transition-card ${currentTransition === t.value ? "active" : ""}`}
                  onClick={() => onTransitionChange?.(t.value)}
                  title={t.label}
                >
                  <div className={`transition-preview transition-preview--${t.value}`}>
                    <span className="preview-square preview-square--a" />
                    <span className="preview-square preview-square--b" />
                  </div>
                  <span className="transition-card-label">{t.label}</span>
                </button>
              ))}
              <div className="ribbon-group-title">Transition to This Slide</div>
            </div>
          </>
        )}

        {activeTab === "Animations" && (() => {
          const animation = selectedElement
            ? (animations ?? []).find((a) => a.id === selectedElement.id)
            : null;
          const currentEffect = animation?.effect ?? "none";

          const handleEffectClick = (effectValue) => {
            if (!selectedElement) return;

            if (effectValue === "none") {
              if (animation) onDeleteAnimation?.(animation.id);
              return;
            }
            if (animation) {
              onUpdateAnimation?.(animation.id, { effect: effectValue });
            } else {
              onAddAnimation?.({
                id: selectedElement.id,
                sequence: (animations?.length ?? 0) + 1,
                effect: effectValue,
                speed: 1,
                "effect-options": {},
              });
            }
          };

          return (
            <>
              <div className="ribbon-group transitions-preview-group">
                <button className="toolbar-item large" onClick={onOpenPreview}>
                  <MdPreview />
                  <span>Preview</span>
                </button>
                <div className="ribbon-group-title">Preview</div>
              </div>

              <div className={`ribbon-group ribbon-group--animations ${!selectedElement ? "is-disabled" : ""}`}>
                {ANIMATION_EFFECTS.map((fx) => {
                  const Icon = fx.icon;
                  return (
                    <button
                      key={fx.value}
                      className={`effect-card ${currentEffect === fx.value ? "active" : ""}`}
                      onClick={() => handleEffectClick(fx.value)}
                      disabled={!selectedElement}
                      title={fx.label}
                    >
                      <Icon className="effect-card-icon" />
                      <span className="effect-card-label">{fx.label}</span>
                    </button>
                  );
                })}
                <div className="ribbon-group-title">
                  {selectedElement
                    ? `${selectedElement.label} — Animation`
                    : "Select an element on the slide"}
                </div>
              </div>

              {animation && (
                <div className="ribbon-group ribbon-group--timing">
                  <div className="timing-button timing-button--order">
                    <MdFormatListNumbered className="timing-icon" />
                    <span className="timing-label">Order</span>
                    <div className="timing-stepper">
                      <button
                        type="button"
                        className="timing-step-btn"
                        onClick={() =>
                          onUpdateAnimation?.(animation.id, {
                            sequence: Math.max(1, (animation.sequence ?? 1) - 1),
                          })
                        }
                      >
                        −
                      </button>
                      <span className="timing-value">{animation.sequence ?? 1}</span>
                      <button
                        type="button"
                        className="timing-step-btn"
                        onClick={() =>
                          onUpdateAnimation?.(animation.id, {
                            sequence: (animation.sequence ?? 1) + 1,
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="timing-button">
                    <MdSpeed className="timing-icon" />
                    <span className="timing-label">Speed</span>
                    <span className="timing-value">
                      {animation.speed === 0.5 ? "Fast" : animation.speed === 2 ? "Slow" : "Medium"}
                    </span>
                    <select
                      className="timing-control"
                      value={animation.speed ?? 1}
                      onChange={(e) =>
                        onUpdateAnimation?.(animation.id, {
                          speed: Number(e.target.value),
                        })
                      }
                    >
                      <option value={0.5}>Fast</option>
                      <option value={1}>Medium</option>
                      <option value={2}>Slow</option>
                    </select>
                  </div>

                  <div className="ribbon-group-title">Timing</div>
                </div>
              )}
            </>
          );
        })()}

        {activeTab === "Slide Show" && (
          <div className="ribbon-group">
            <button className="toolbar-item large" onClick={onOpenPreview}>
              <MdPreview />
              <span>Preview</span>
            </button>

            <div className="ribbon-group-title">Slide Show</div>
          </div>
        )}

        {activeTab === "View" && (
          <div className="toolbar-placeholder">
            Preview mode is available in the Slide Show tab.
          </div>
        )}
      </div>
    </header>
  );
}