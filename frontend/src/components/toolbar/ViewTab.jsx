import "./ViewTab.css";

const PRESENTATION_VIEWS = [
  {
    id: "normal",
    label: "Normal",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="1" y="1" width="34" height="28" rx="2" stroke="#4472c4" strokeWidth="0.7" fill="none"/>
        <rect x="3" y="3" width="19" height="15" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="3" y="20" width="30" height="6" rx="0.5" fill="#f0f0f0" stroke="#bbb" strokeWidth="0.5"/>
        <rect x="24" y="3" width="9" height="15" rx="0.5" fill="#f0f0f0" stroke="#bbb" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    id: "outline",
    label: "Outline View",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="1" y="1" width="34" height="28" rx="2" stroke="#4472c4" strokeWidth="0.7" fill="none"/>
        <rect x="3" y="3" width="9" height="24" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <line x1="15" y1="8"  x2="33" y2="8"  stroke="#666" strokeWidth="0.7" strokeLinecap="round"/>
        <line x1="15" y1="13" x2="29" y2="13" stroke="#aaa" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="15" y1="18" x2="31" y2="18" stroke="#aaa" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="15" y1="23" x2="27" y2="23" stroke="#aaa" strokeWidth="0.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "slide-sorter",
    label: "Slide Sorter",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="1"  y="1"  width="15" height="11" rx="1" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="20" y="1"  width="15" height="11" rx="1" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="1"  y="17" width="15" height="11" rx="1" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="20" y="17" width="15" height="11" rx="1" fill="#f0f0f0" stroke="#ccc"    strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    id: "notes-page",
    label: "Notes Page",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="3" y="1"  width="30" height="13" rx="1" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="3" y="17" width="30" height="12" rx="1" fill="none"    stroke="#ccc"    strokeWidth="0.5"/>
        <line x1="6" y1="20" x2="30" y2="20" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="6" y1="23" x2="26" y2="23" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="6" y1="26" x2="28" y2="26" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "reading",
    label: "Reading View",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="1" y="1" width="34" height="28" rx="2" stroke="#4472c4" strokeWidth="0.7" fill="none"/>
        <rect x="3" y="3" width="30" height="19" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="1" y="23" width="34" height="6" rx="0" fill="#ebebeb" stroke="none"/>
        <circle cx="18" cy="26" r="1" fill="#4472c4"/>
        <circle cx="13" cy="26" r="1" fill="#ccc"/>
        <circle cx="23" cy="26" r="1" fill="#ccc"/>
      </svg>
    ),
  },
];

const MASTER_VIEWS = [
  {
    id: "slide-master",
    label: "Slide\nMaster",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="1" y="1" width="34" height="28" rx="2" stroke="#4472c4" strokeWidth="0.7" fill="none"/>
        <rect x="3" y="3" width="30" height="17" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <line x1="3" y1="20" x2="33" y2="20" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="3"  y="22" width="13" height="5" rx="0.5" fill="#f0f0f0" stroke="#ccc" strokeWidth="0.5"/>
        <rect x="18" y="22" width="15" height="5" rx="0.5" fill="#f0f0f0" stroke="#ccc" strokeWidth="0.5"/>
      </svg>
    ),
  },
  {
    id: "handout-master",
    label: "Handout\nMaster",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="1" y="1" width="34" height="28" rx="2" stroke="#4472c4" strokeWidth="0.7" fill="none"/>
        <rect x="3"  y="3"  width="14" height="9" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="19" y="3"  width="14" height="9" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="3"  y="14" width="14" height="9" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="19" y="14" width="14" height="9" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <line x1="3" y1="26" x2="20" y2="26" stroke="#ccc" strokeWidth="0.6"/>
      </svg>
    ),
  },
  {
    id: "notes-master",
    label: "Notes\nMaster",
    icon: (
      <svg width="30" height="25" viewBox="0 0 36 30" fill="none">
        <rect x="3" y="1"  width="30" height="11" rx="0.5" fill="#dce6f4" stroke="#4472c4" strokeWidth="0.5"/>
        <rect x="3" y="14" width="30" height="15" rx="0.5" fill="none" stroke="#ccc" strokeWidth="0.5"/>
        <line x1="6" y1="17" x2="30" y2="17" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="6" y1="20" x2="27" y2="20" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="6" y1="23" x2="28" y2="23" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
        <line x1="6" y1="26" x2="25" y2="26" stroke="#ccc" strokeWidth="0.6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function ViewTab({
  currentView,
  onChangeView,
  showNotes,
  onToggleNotes,
  onOpenSlideMaster,
  isSlideMasterOpen,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomChange,
}) {
  return (
    <div className="view-tab-wrapper">
      <div className="ribbon-group view-group">
        <div className="view-buttons-row">
          {PRESENTATION_VIEWS.map((view) => (
            <button
              key={view.id}
              className={`view-btn${!isSlideMasterOpen && currentView === view.id ? " active" : ""}`}
              onClick={() => onChangeView(view.id)}
              title={view.label}
            >
              <span className="view-btn-icon">{view.icon}</span>
              <span className="view-btn-label">{view.label}</span>
            </button>
          ))}
        </div>
        <span className="ribbon-group-title">Presentation Views</span>
      </div>

      <div className="ribbon-group view-group">
        <div className="view-buttons-row">
          {MASTER_VIEWS.map((view) => (
            <button
              key={view.id}
              className={`view-btn${isSlideMasterOpen && view.id === "slide-master" ? " active" : ""}`}
              onClick={view.id === "slide-master" ? onOpenSlideMaster : undefined}
              title={view.label.replace("\n", " ")}
              style={{
                opacity: view.id !== "slide-master" ? 0.45 : 1,
                cursor: view.id !== "slide-master" ? "default" : "pointer",
              }}
            >
              <span className="view-btn-icon">{view.icon}</span>
              <span className="view-btn-label">{view.label}</span>
            </button>
          ))}
        </div>
        <span className="ribbon-group-title">Master Views</span>
      </div>

      <div className="ribbon-group view-show-group">
        <div className="view-show-options">
          <label className="view-checkbox-row">
            <input type="checkbox" checked={showNotes} onChange={onToggleNotes} />
            <span>Notes</span>
          </label>
        </div>
        <span className="ribbon-group-title">Show</span>
      </div>
    </div>
  );
}