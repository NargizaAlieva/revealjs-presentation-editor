const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const clampCrop = (crop, minimumVisiblePercent = 0.1) => {
  const values = Array.from({ length: 4 }, (_, index) => {
    const value = Number(crop?.[index]);
    return Number.isFinite(value) ? clamp(value, 0, 100) : 0;
  });
  const maxCombined = 100 - clamp(minimumVisiblePercent, 0.001, 100);
  const clampPair = (firstIndex, secondIndex) => {
    values[firstIndex] = Math.min(values[firstIndex], maxCombined);
    values[secondIndex] = Math.min(values[secondIndex], maxCombined - values[firstIndex]);
  };
  clampPair(0, 2);
  clampPair(3, 1);
  return values;
};

export const clampCropEdges = (crop, edges, minimumVisiblePercent = 0.1) => {
  const values = Array.from({ length: 4 }, (_, index) => {
    const value = Number(crop?.[index]);
    return Number.isFinite(value) ? clamp(value, 0, 100) : 0;
  });
  const maxCombined = 100 - clamp(minimumVisiblePercent, 0.001, 100);
  if (edges.includes("n")) values[0] = Math.min(values[0], maxCombined - values[2]);
  if (edges.includes("s")) values[2] = Math.min(values[2], maxCombined - values[0]);
  if (edges.includes("w")) values[3] = Math.min(values[3], maxCombined - values[1]);
  if (edges.includes("e")) values[1] = Math.min(values[1], maxCombined - values[3]);
  return values;
};

export const clampCropPan = (crop, minimumVisiblePercent = 0.1) => {
  const maxCombined = 100 - clamp(minimumVisiblePercent, 0.001, 100);
  const normalizePair = (first, second) => {
    const sum = clamp(
      (Number.isFinite(first) ? first : 0) + (Number.isFinite(second) ? second : 0),
      0,
      maxCombined,
    );
    const normalizedFirst = clamp(Number.isFinite(first) ? first : 0, 0, sum);
    return [normalizedFirst, sum - normalizedFirst];
  };
  const [top, bottom] = normalizePair(Number(crop?.[0]), Number(crop?.[2]));
  const [left, right] = normalizePair(Number(crop?.[3]), Number(crop?.[1]));
  return [top, right, bottom, left];
};

export const getCroppedMediaGeometry = (media) => {
  const [top, right, bottom, left] = clampCrop(media.crop);
  const scale = Math.max(0.001, Number(media.scale) || 1);
  const width = Math.max(1, Number(media.width) || 200);
  const height = Math.max(1, Number(media.height) || 120);
  const widthFraction = Math.max(0.001, 1 - left / 100 - right / 100);
  const heightFraction = Math.max(0.001, 1 - top / 100 - bottom / 100);
  let sourceWidth = Math.max(1, Number(media["source-width"]) || width / widthFraction);
  let sourceHeight = Math.max(1, Number(media["source-height"]) || height / heightFraction);
  let renderedSourceWidth = sourceWidth * scale;
  let renderedSourceHeight = sourceHeight * scale;

  const coverFactor = Math.max(
    1,
    width / Math.max(0.001, renderedSourceWidth * widthFraction),
    height / Math.max(0.001, renderedSourceHeight * heightFraction),
  );
  renderedSourceWidth *= coverFactor;
  renderedSourceHeight *= coverFactor;
  sourceWidth *= coverFactor;
  sourceHeight *= coverFactor;

  return {
    crop: [top, right, bottom, left],
    scale,
    sourceWidth,
    sourceHeight,
    renderedSourceWidth,
    renderedSourceHeight,
  };
};
