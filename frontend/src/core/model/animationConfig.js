import {
  MdBlock, MdCloseFullscreen, MdNorth, MdOpacity, MdSouth, MdWest, MdEast,
  MdZoomOutMap, MdStrikethroughS,
} from "react-icons/md";

export const ANIMATION_EFFECTS = [
  { value: "none",       label: "None",       icon: MdBlock },
  { value: "fade-in",   label: "Fade",        icon: MdOpacity },
  { value: "fade-up",   label: "Fade Up",     icon: MdNorth },
  { value: "fade-down", label: "Fade Down",   icon: MdSouth },
  { value: "fade-left", label: "Fade Left",   icon: MdWest },
  { value: "fade-right",label: "Fade Right",  icon: MdEast },
  { value: "grow",      label: "Grow",        icon: MdZoomOutMap },
  { value: "shrink",    label: "Shrink",      icon: MdCloseFullscreen },
  { value: "strike",    label: "Strike",      icon: MdStrikethroughS },
];
