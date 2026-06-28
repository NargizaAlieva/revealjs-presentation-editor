import { DESIGN_THEMES } from "../model/designThemes.js";

export const generateCSSVariables = (colorTheme) => {
  const variables = {};
  (colorTheme ?? []).forEach((entry) => {
    variables[`--${entry["css-variable-name"]}`] = entry.color;
  });
  return variables;
};

export const cssVariablesToString = (variables) => {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
};

export const applyThemeToPresentation = (presentation, themeId) => {
  const theme = DESIGN_THEMES.find((t) => t.id === themeId);
  if (!theme) return presentation;
  return {
    ...presentation,
    slideset: {
      ...presentation.slideset,
      master: { ...presentation.slideset.master, "color-theme": [...theme.colorTheme] },
    },
  };
};

export const getAvailableThemes = () =>
  DESIGN_THEMES.map((theme) => ({ id: theme.id, name: theme.name, preview: theme.preview }));
