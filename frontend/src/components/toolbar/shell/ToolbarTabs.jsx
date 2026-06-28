import ToolbarQuickActions from "./ToolbarQuickActions";

export default function ToolbarTabs({
  tabs,
  activeTab,
  onTabChange,
  onSavePresentation,
  onOpenPreviewFromBeginning,
  autosaveEnabled,
  onToggleAutosave,
}) {
  return (
    <nav className="toolbar-tabs">
      <ToolbarQuickActions
        onSavePresentation={onSavePresentation}
        onOpenPreviewFromBeginning={onOpenPreviewFromBeginning}
        autosaveEnabled={autosaveEnabled}
        onToggleAutosave={onToggleAutosave}
      />
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab}
          className={[
            "toolbar-tab",
            activeTab === tab ? "active" : "",
            tab === "Picture Format" ? "toolbar-tab--contextual" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}
