import { useEffect, useRef, useState } from "react";
import ToolbarContent from "../toolbar/shell/ToolbarContent";
import ToolbarTabs from "../toolbar/shell/ToolbarTabs";
import "./Toolbar.css";

const BASE_TABS = [
  "File",
  "Home",
  "Insert",
  "Design",
  "Transitions",
  "Animations",
  "Slide Show",
  "View",
];

const MASTER_TABS = [
  "File",
  "Slide Master",
  "Home",
  "Insert",
  "Transitions",
  "Animations",
  "View",
];

function getToolbarTabs(isSlideMasterOpen, hasPictureFormat) {
  const tabs = isSlideMasterOpen ? MASTER_TABS : BASE_TABS;
  return hasPictureFormat ? [...tabs, "Picture Format"] : tabs;
}

export default function Toolbar(props) {
  const {
    activeTab,
    isSlideMasterOpen,
    onOpenPreviewFromBeginning,
    onSavePresentation,
    onTabChange,
    selectedMediaElement,
  } = props;
  const [localActiveTab, setLocalActiveTab] = useState("Home");
  const [masterActiveTab, setMasterActiveTab] = useState("Slide Master");
  const prevMasterOpen = useRef(false);

  useEffect(() => {
    if (isSlideMasterOpen && !prevMasterOpen.current) {
      setMasterActiveTab("Slide Master");
    }
    prevMasterOpen.current = isSlideMasterOpen;
  }, [isSlideMasterOpen]);

  const currentTab = isSlideMasterOpen
    ? masterActiveTab
    : (activeTab ?? localActiveTab);

  const setCurrentTab = (tab) => {
    if (isSlideMasterOpen) {
      setMasterActiveTab(tab);
      return;
    }
    if (onTabChange) onTabChange(tab);
    else setLocalActiveTab(tab);
  };

  const tabs = getToolbarTabs(
    isSlideMasterOpen,
    Boolean(selectedMediaElement),
  );

  return (
    <header className="toolbar">
      <ToolbarTabs
        tabs={tabs}
        activeTab={currentTab}
        onTabChange={setCurrentTab}
        onSavePresentation={onSavePresentation}
        onOpenPreviewFromBeginning={onOpenPreviewFromBeginning}
      />
      <ToolbarContent {...props} currentTab={currentTab} />
    </header>
  );
}
