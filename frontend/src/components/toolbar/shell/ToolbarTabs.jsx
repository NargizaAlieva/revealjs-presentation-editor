import ToolbarQuickActions from "./ToolbarQuickActions";

export default function ToolbarTabs({
  tabs,
  activeTab,
  onTabChange,
  onSavePresentation,
  onOpenPreviewFromBeginning,
}) {
  return (
    <nav className="toolbar-tabs">
      <ToolbarQuickActions
        onSavePresentation={onSavePresentation}
        onOpenPreviewFromBeginning={onOpenPreviewFromBeginning}
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
