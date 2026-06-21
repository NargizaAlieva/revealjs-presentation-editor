// Pure geometry utilities for canvas element manipulation — no DOM, no React.

export const SNAP_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 360];
export const SNAP_THRESHOLD = 5;

export const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;

export const snapAngle = (angle) => {
  const normalized = normalizeAngle(angle);
  for (const snap of SNAP_ANGLES) {
    if (Math.abs(normalized - snap) <= SNAP_THRESHOLD) return snap % 360;
  }
  return normalized;
};

// Compute new position and size when resizing an element by dragging a handle.
// dir: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
// initial: { x, y, width, height, mouseX, mouseY }
// mouse: { x, y } — current mouse position
// Returns: { newX, newY, newW, newH }
export const computeResize = (dir, initial, mouse, canvasWidth, canvasHeight) => {
  const { x, y, width, height } = initial;
  const dx = mouse.x - initial.mouseX;
  const dy = mouse.y - initial.mouseY;

  let newX = x, newY = y, newW = width, newH = height;

  if (dir === "nw" || dir === "w" || dir === "sw") { newX = x + dx; newW = width - dx; }
  else if (dir === "ne" || dir === "e" || dir === "se") { newW = width + dx; }

  if (dir === "nw" || dir === "n" || dir === "ne") { newY = y + dy; newH = height - dy; }
  else if (dir === "sw" || dir === "s" || dir === "se") { newH = height + dy; }

  const minW = 80, minH = 30;

  if (newW < minW) {
    if (dir === "nw" || dir === "w" || dir === "sw") newX = x + width - minW;
    newW = minW;
  }
  if (newH < minH) {
    if (dir === "nw" || dir === "n" || dir === "ne") newY = y + height - minH;
    newH = minH;
  }

  newX = Math.max(0, newX);
  newY = Math.max(0, newY);
  newW = Math.min(newW, canvasWidth - newX);
  newH = Math.min(newH, canvasHeight - newY);

  return { newX, newY, newW, newH };
};

// Compute rotation angle (degrees) from element center to current mouse position
export const getRotationAngle = (centerX, centerY, mouseX, mouseY) =>
  (Math.atan2(mouseY - centerY, mouseX - centerX) * 180) / Math.PI + 90;

// Compute rotation angle from an element's bounding-box center to the mouse — encapsulates center calculation.
export const getElementRotationAngle = (element, mouseX, mouseY) => {
  const cx = (element.position?.x ?? 0) + (element.width ?? 300) / 2;
  const cy = (element.position?.y ?? 0) + (element.height ?? 200) / 2;
  return (Math.atan2(mouseY - cy, mouseX - cx) * 180) / Math.PI;
};
