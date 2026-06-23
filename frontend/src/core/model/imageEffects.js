export const SHARPEN_PRESETS = [
  { id: "soften-50",  label: "Soften: 50%",   filter: "blur(2.5px)" },
  { id: "soften-25",  label: "Soften: 25%",   filter: "blur(1px)" },
  { id: "none",       label: "0% (Original)", filter: null },
  { id: "sharpen-25", label: "Sharpen: 25%",  filter: "contrast(1.3) brightness(1.03)" },
  { id: "sharpen-50", label: "Sharpen: 50%",  filter: "contrast(1.6) brightness(1.06)" },
];

export const COLOR_SATURATION = [
  { id: "sat-0",   label: "Saturation: 0%",   filter: "saturate(0)" },
  { id: "sat-33",  label: "Saturation: 33%",  filter: "saturate(0.33)" },
  { id: "sat-67",  label: "Saturation: 67%",  filter: "saturate(0.67)" },
  { id: "sat-100", label: "Saturation: 100%", filter: null },
  { id: "sat-167", label: "Saturation: 167%", filter: "saturate(1.67)" },
  { id: "sat-200", label: "Saturation: 200%", filter: "saturate(2)" },
  { id: "sat-300", label: "Saturation: 300%", filter: "saturate(3)" },
];

export const COLOR_TONE = [
  { id: "tone-4700",  label: "Temperature: 4700 K",  filter: "brightness(0.85) sepia(0.5) hue-rotate(190deg) saturate(2)" },
  { id: "tone-5300",  label: "Temperature: 5300 K",  filter: "brightness(0.9) sepia(0.3) hue-rotate(175deg) saturate(1.5)" },
  { id: "tone-6500",  label: "Temperature: 6500 K",  filter: "sepia(0.15) hue-rotate(165deg) saturate(1.2)" },
  { id: "tone-7200",  label: "Temperature: 7200 K",  filter: null },
  { id: "tone-8200",  label: "Temperature: 8200 K",  filter: "sepia(0.15) saturate(1.1)" },
  { id: "tone-9600",  label: "Temperature: 9600 K",  filter: "sepia(0.35) saturate(1.2) brightness(1.05)" },
  { id: "tone-11200", label: "Temperature: 11200 K", filter: "sepia(0.6) saturate(1.3) hue-rotate(-5deg) brightness(1.1)" },
];

export const RECOLOR_PRESETS = [
  { id: "none",        label: "No Recolor",  filter: null },
  { id: "grayscale",   label: "Grayscale",   filter: "grayscale(100%)" },
  { id: "sepia",       label: "Sepia",       filter: "sepia(80%)" },
  { id: "dark-gray",   label: "Dark Gray",   filter: "grayscale(100%) brightness(0.5) contrast(1.2)" },
  { id: "dark-blue",   label: "Dark Blue",   filter: "sepia(100%) hue-rotate(185deg) saturate(4) brightness(0.5)" },
  { id: "dark-gold",   label: "Dark Gold",   filter: "sepia(100%) saturate(2.5) brightness(0.6)" },
  { id: "dark-gray2",  label: "Dark Gray 2", filter: "grayscale(100%) brightness(0.45) contrast(0.85)" },
  { id: "dark-olive",  label: "Dark Olive",  filter: "sepia(100%) hue-rotate(55deg) saturate(3) brightness(0.5)" },
  { id: "dark-red",    label: "Dark Red",    filter: "sepia(100%) hue-rotate(315deg) saturate(5) brightness(0.45)" },
  { id: "dark-green",  label: "Dark Green",  filter: "sepia(100%) hue-rotate(85deg) saturate(4) brightness(0.45)" },
  { id: "light-gray",  label: "Light Gray",  filter: "grayscale(100%) brightness(1.5) contrast(0.75)" },
  { id: "light-blue",  label: "Light Blue",  filter: "sepia(100%) hue-rotate(185deg) saturate(1.5) brightness(1.5)" },
  { id: "light-gold",  label: "Light Gold",  filter: "sepia(60%) saturate(1.5) brightness(1.4)" },
  { id: "light-gray2", label: "Light Gray 2",filter: "grayscale(100%) brightness(1.35) contrast(0.65)" },
  { id: "light-olive", label: "Light Olive", filter: "sepia(100%) hue-rotate(55deg) saturate(2) brightness(1.4)" },
  { id: "light-red",   label: "Light Pink",  filter: "sepia(100%) hue-rotate(315deg) saturate(3) brightness(1.45)" },
  { id: "light-green", label: "Light Green", filter: "sepia(100%) hue-rotate(85deg) saturate(2) brightness(1.5)" },
];

export const ARTISTIC_EFFECTS = [
  { id: "none",           label: "None",            filter: null },
  { id: "marker",         label: "Marker",          filter: "saturate(0.6) contrast(1.4) brightness(1.05)" },
  { id: "pencil-bw",      label: "Pencil Grayscale",filter: "grayscale(100%) contrast(1.9) brightness(1.15)" },
  { id: "pencil-sketch",  label: "Pencil Sketch",   filter: "grayscale(90%) contrast(2.2) brightness(1.2) blur(0.3px)" },
  { id: "line-drawing",   label: "Line Drawing",    filter: "grayscale(100%) contrast(3.5) brightness(1.35) invert(8%)" },
  { id: "chalk",          label: "Chalk Sketch",    filter: "grayscale(100%) contrast(1.4) brightness(1.5) blur(0.4px)" },
  { id: "cement",         label: "Cement",          filter: "grayscale(100%) brightness(0.55) contrast(1.9) blur(0.5px)" },
  { id: "mosaic",         label: "Mosaic Bubbles",  filter: "blur(2.5px) saturate(2) contrast(1.6) brightness(1.05)" },
  { id: "watercolor",     label: "Watercolor",      filter: "saturate(2) brightness(1.1) blur(0.7px) contrast(0.85)" },
  { id: "sponge",         label: "Sponge",          filter: "saturate(1.6) blur(1.8px) contrast(1.25) brightness(1.1)" },
  { id: "paint-brush",    label: "Paint Brush",     filter: "contrast(1.5) saturate(1.7) blur(0.6px) brightness(0.95)" },
  { id: "paint-strokes",  label: "Paint Strokes",   filter: "contrast(1.8) saturate(1.4) blur(0.4px) hue-rotate(5deg)" },
  { id: "light-screen",   label: "Light Screen",    filter: "brightness(1.7) contrast(0.55) saturate(0.4)" },
  { id: "blur",           label: "Blur",            filter: "blur(4px)" },
  { id: "soft-blur",      label: "Soft Blur",       filter: "blur(2px) brightness(1.08)" },
  { id: "glow",           label: "Glow Diffused",   filter: "brightness(1.35) saturate(1.5) blur(0.6px)" },
  { id: "vivid",          label: "Vivid",           filter: "contrast(1.6) saturate(1.4)" },
  { id: "film",           label: "Film Grain",      filter: "contrast(1.3) saturate(0.75) brightness(0.93)" },
  { id: "photocopy",      label: "Photocopy",       filter: "grayscale(100%) contrast(2.8) brightness(0.75) blur(0.3px)" },
  { id: "cutout",         label: "Cutout",          filter: "contrast(5) saturate(2) brightness(0.85)" },
];

// ── Picture Presets (combinations of shadow + bevel + 3D) ─────────

export const PICTURE_PRESETS = [
  { id: "none", label: "No Preset", effects: {} },
  // Row 1 — flat bevel presets
  { id: "p1",  label: "Preset 1",  effects: { bevelId: "relaxed" } },
  { id: "p2",  label: "Preset 2",  effects: { bevelId: "relaxed",   shadowId: "out-br" } },
  { id: "p3",  label: "Preset 3",  effects: { bevelId: "circle",    shadowId: "out-b"  } },
  { id: "p4",  label: "Preset 4",  effects: { bevelId: "cross",     shadowId: "out-bl" } },
  // Row 2 — inset / hard bevel
  { id: "p5",  label: "Preset 5",  effects: { bevelId: "hard-edge", shadowId: "in-c"  } },
  { id: "p6",  label: "Preset 6",  effects: { bevelId: "cool-slant",shadowId: "out-br" } },
  { id: "p7",  label: "Preset 7",  effects: { bevelId: "convex",    shadowId: "in-c"  } },
  { id: "p8",  label: "Preset 8",  effects: { bevelId: "art-deco",  shadowId: "out-br" } },
  // Row 3 — 3D / perspective
  { id: "p9",  label: "Preset 9",  effects: { rotation3dId: "iso-left-up",  shadowId: "persp-b" } },
  { id: "p10", label: "Preset 10", effects: { rotation3dId: "iso-right-up", shadowId: "persp-b" } },
  { id: "p11", label: "Preset 11", effects: { rotation3dId: "flat-left",    shadowId: "out-b"   } },
  { id: "p12", label: "Preset 12", effects: { rotation3dId: "flat-right",   shadowId: "out-b"   } },
];

// ── Picture Effects ────────────────────────────────────────────────

export const SHADOW_PRESETS = [
  { id: "none",     label: "No Shadow",                   section: "none",        shadow: null },
  // Outer — 3×3
  { id: "out-br",   label: "Offset Diagonal Bottom Right",section: "outer",       shadow: "4px 4px 8px 0 rgba(0,0,0,0.45)" },
  { id: "out-b",    label: "Offset Bottom",               section: "outer",       shadow: "0 6px 8px 0 rgba(0,0,0,0.4)" },
  { id: "out-bl",   label: "Offset Diagonal Bottom Left", section: "outer",       shadow: "-4px 4px 8px 0 rgba(0,0,0,0.45)" },
  { id: "out-r",    label: "Offset Right",                section: "outer",       shadow: "6px 0 8px 0 rgba(0,0,0,0.4)" },
  { id: "out-c",    label: "Outside Center",              section: "outer",       shadow: "0 0 10px 3px rgba(0,0,0,0.4)" },
  { id: "out-l",    label: "Offset Left",                 section: "outer",       shadow: "-6px 0 8px 0 rgba(0,0,0,0.4)" },
  { id: "out-tr",   label: "Offset Diagonal Top Right",   section: "outer",       shadow: "4px -4px 8px 0 rgba(0,0,0,0.4)" },
  { id: "out-t",    label: "Offset Top",                  section: "outer",       shadow: "0 -6px 8px 0 rgba(0,0,0,0.4)" },
  { id: "out-tl",   label: "Offset Diagonal Top Left",    section: "outer",       shadow: "-4px -4px 8px 0 rgba(0,0,0,0.4)" },
  // Inner — 3×3
  { id: "in-tl",   label: "Inside Top Left",              section: "inner",       shadow: "inset 4px 4px 8px rgba(0,0,0,0.5)" },
  { id: "in-t",    label: "Inside Top",                   section: "inner",       shadow: "inset 0 6px 8px rgba(0,0,0,0.5)" },
  { id: "in-tr",   label: "Inside Top Right",             section: "inner",       shadow: "inset -4px 4px 8px rgba(0,0,0,0.5)" },
  { id: "in-l",    label: "Inside Left",                  section: "inner",       shadow: "inset 6px 0 8px rgba(0,0,0,0.5)" },
  { id: "in-c",    label: "Inside Center",                section: "inner",       shadow: "inset 0 0 12px 4px rgba(0,0,0,0.5)" },
  { id: "in-r",    label: "Inside Right",                 section: "inner",       shadow: "inset -6px 0 8px rgba(0,0,0,0.5)" },
  { id: "in-bl",   label: "Inside Bottom Left",           section: "inner",       shadow: "inset 4px -4px 8px rgba(0,0,0,0.5)" },
  { id: "in-b",    label: "Inside Bottom",                section: "inner",       shadow: "inset 0 -6px 8px rgba(0,0,0,0.5)" },
  { id: "in-br",   label: "Inside Bottom Right",          section: "inner",       shadow: "inset -4px -4px 8px rgba(0,0,0,0.5)" },
  // Perspective — 3+2
  { id: "persp-b",  label: "Perspective Below",           section: "perspective", shadow: "0 24px 20px -8px rgba(0,0,0,0.5)" },
  { id: "persp-bl", label: "Perspective Lower Left",      section: "perspective", shadow: "-12px 20px 16px -4px rgba(0,0,0,0.45)" },
  { id: "persp-br", label: "Perspective Lower Right",     section: "perspective", shadow: "12px 20px 16px -4px rgba(0,0,0,0.45)" },
  { id: "persp-ul", label: "Perspective Upper Left",      section: "perspective", shadow: "-8px -8px 16px rgba(0,0,0,0.4)" },
  { id: "persp-ur", label: "Perspective Upper Right",     section: "perspective", shadow: "8px -8px 16px rgba(0,0,0,0.4)" },
];

// opacity: reflected image opacity  blur: px blur on reflection  size: % of original height shown  offset: gap px
export const REFLECTION_PRESETS = [
  { id: "none",       label: "No Reflection",          section: "none",      opacity: 0,    blur: 0, size: 0,   offset: 0 },
  // Row 1 — no offset
  { id: "tight",      label: "Tight Reflection, touching", section: "variations", opacity: 0.5, blur: 0,   size: 30,  offset: 0 },
  { id: "half",       label: "Half Reflection, touching",  section: "variations", opacity: 0.45,blur: 1.5, size: 50,  offset: 0 },
  { id: "full",       label: "Full Reflection, touching",  section: "variations", opacity: 0.4, blur: 3,   size: 100, offset: 0 },
  // Row 2 — 4pt offset
  { id: "tight-4",    label: "Tight Reflection, 4pt",  section: "variations", opacity: 0.45, blur: 0,   size: 30,  offset: 4 },
  { id: "half-4",     label: "Half Reflection, 4pt",   section: "variations", opacity: 0.4,  blur: 1.5, size: 50,  offset: 4 },
  { id: "full-4",     label: "Full Reflection, 4pt",   section: "variations", opacity: 0.35, blur: 3,   size: 100, offset: 4 },
  // Row 3 — 8pt offset
  { id: "tight-8",    label: "Tight Reflection, 8pt",  section: "variations", opacity: 0.4,  blur: 0,   size: 30,  offset: 8 },
  { id: "half-8",     label: "Half Reflection, 8pt",   section: "variations", opacity: 0.35, blur: 1.5, size: 50,  offset: 8 },
  { id: "full-8",     label: "Full Reflection, 8pt",   section: "variations", opacity: 0.3,  blur: 3,   size: 100, offset: 8 },
];

// 6 colors × 4 sizes — stored as { color, spread } so we can build shadow dynamically
export const GLOW_COLORS = [
  { key: "blue",   hex: "#4472C4", rgb: "68,114,196"  },
  { key: "orange", hex: "#ED7D31", rgb: "237,125,49"  },
  { key: "ltblue", hex: "#5B9BD5", rgb: "91,155,213"  },
  { key: "yellow", hex: "#FFC000", rgb: "255,192,0"   },
  { key: "red",    hex: "#FF0000", rgb: "255,0,0"     },
  { key: "green",  hex: "#70AD47", rgb: "112,173,71"  },
];
export const GLOW_SIZES = [
  { pt: 5,  blur: 8,  spread: 3,  opacity: 0.85 },
  { pt: 8,  blur: 14, spread: 5,  opacity: 0.80 },
  { pt: 11, blur: 20, spread: 7,  opacity: 0.75 },
  { pt: 18, blur: 28, spread: 10, opacity: 0.70 },
];

export function buildGlowShadow(hex, sizeIndex = 0) {
  const s = GLOW_SIZES[sizeIndex] ?? GLOW_SIZES[0];
  return `0 0 ${s.blur}px ${s.spread}px ${hex}${Math.round(s.opacity * 255).toString(16).padStart(2, "0")}`;
}

export const GLOW_PRESETS = [
  { id: "none", label: "No Glow", shadow: null },
  // generated: colorKey-sizeIndex
  ...GLOW_COLORS.flatMap((c) =>
    GLOW_SIZES.map((s, si) => ({
      id:     `${c.key}-${si}`,
      label:  `${c.key}, ${s.pt}pt`,
      color:  c.hex,
      shadow: buildGlowShadow(c.hex, si),
    }))
  ),
];

export const SOFT_EDGES_PRESETS = [
  { id: "none",   label: "No Soft Edges",  stop: null },
  { id: "1pt",    label: "1 pt",           stop: 92   },
  { id: "2.5pt",  label: "2.5 pt",         stop: 85   },
  { id: "5pt",    label: "5 pt",           stop: 75   },
  { id: "10pt",   label: "10 pt",          stop: 60   },
  { id: "25pt",   label: "25 pt",          stop: 40   },
  { id: "50pt",   label: "50 pt",          stop: 10   },
];

export const BEVEL_PRESETS = [
  { id: "none",        label: "No Bevel",       bevel: null },
  // Row 1 — classic raised/inset
  { id: "circle",      label: "Circle",         bevel: "inset 3px 3px 6px rgba(255,255,255,0.55), inset -3px -3px 6px rgba(0,0,0,0.35)" },
  { id: "relaxed",     label: "Relaxed Inset",  bevel: "inset 2px 2px 4px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.25)" },
  { id: "cross",       label: "Cross",          bevel: "inset 4px 4px 0 rgba(255,255,255,0.5), inset -4px -4px 0 rgba(0,0,0,0.3)" },
  { id: "cool-slant",  label: "Cool Slant",     bevel: "inset 6px 6px 8px rgba(255,255,255,0.4), inset -2px -2px 4px rgba(0,0,0,0.4)" },
  // Row 2 — convex / hard
  { id: "convex",      label: "Convex",         bevel: "inset 0 0 16px rgba(255,255,255,0.45), inset 0 0 4px rgba(0,0,0,0.2)" },
  { id: "hard-edge",   label: "Hard Edge",      bevel: "inset 4px 4px 0 rgba(255,255,255,0.6), inset -4px -4px 0 rgba(0,0,0,0.5)" },
  { id: "art-deco",    label: "Art Deco",       bevel: "inset 2px 2px 0 rgba(255,255,255,0.8), inset -2px -2px 0 rgba(0,0,0,0.6), inset 5px 5px 0 rgba(255,255,255,0.3)" },
  { id: "angle",       label: "Angle",          bevel: "inset 8px 8px 0 rgba(255,255,255,0.35), inset -8px -8px 0 rgba(0,0,0,0.35)" },
  // Row 3 — soft / decorative
  { id: "soft-round",  label: "Soft Round",     bevel: "inset 0 0 10px rgba(255,255,255,0.6), inset 0 0 3px rgba(0,0,0,0.15)" },
  { id: "slope",       label: "Slope",          bevel: "inset 3px 3px 0 rgba(255,255,255,0.5), inset -3px -3px 0 rgba(0,0,0,0.4), inset 6px 6px 6px rgba(255,255,255,0.15)" },
  { id: "divot",       label: "Divot",          bevel: "inset 0 0 3px 2px rgba(0,0,0,0.4), inset 0 0 1px 1px rgba(255,255,255,0.3)" },
  { id: "riblet",      label: "Riblet",         bevel: "inset 2px 0 0 rgba(255,255,255,0.5), inset -2px 0 0 rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.3)" },
];

export const ROTATION3D_PRESETS = [
  { id: "none",         label: "No Rotation",              section: "none",        transform: null },
  // Parallel — 10
  { id: "par-iso-lu",   label: "Isometric Left Up",        section: "parallel",    transform: "perspective(none) rotateY(-35deg) rotateX(20deg)" },
  { id: "par-iso-ru",   label: "Isometric Right Up",       section: "parallel",    transform: "perspective(none) rotateY(35deg) rotateX(20deg)" },
  { id: "par-iso-ld",   label: "Isometric Left Down",      section: "parallel",    transform: "perspective(none) rotateY(-35deg) rotateX(-20deg)" },
  { id: "par-iso-rd",   label: "Isometric Right Down",     section: "parallel",    transform: "perspective(none) rotateY(35deg) rotateX(-20deg)" },
  { id: "par-off-l1",   label: "Off Axis 1 Left",          section: "parallel",    transform: "perspective(none) rotateX(20deg) rotateY(-10deg)" },
  { id: "par-off-r1",   label: "Off Axis 1 Right",         section: "parallel",    transform: "perspective(none) rotateX(20deg) rotateY(10deg)" },
  { id: "par-off-t1",   label: "Off Axis 1 Top",           section: "parallel",    transform: "perspective(none) rotateX(10deg) rotateY(-20deg)" },
  { id: "par-off-l2",   label: "Off Axis 2 Left",          section: "parallel",    transform: "perspective(none) rotateX(-20deg) rotateY(-10deg)" },
  { id: "par-off-r2",   label: "Off Axis 2 Right",         section: "parallel",    transform: "perspective(none) rotateX(-20deg) rotateY(10deg)" },
  { id: "par-off-t2",   label: "Off Axis 2 Top",           section: "parallel",    transform: "perspective(none) rotateX(-10deg) rotateY(20deg)" },
  // Perspective — 12
  { id: "per-front",    label: "Perspective Front",        section: "perspective", transform: "perspective(600px) rotateX(6deg)" },
  { id: "per-heroic",   label: "Perspective Heroic Ext.",  section: "perspective", transform: "perspective(400px) rotateX(12deg)" },
  { id: "per-l-above",  label: "Perspective Left Facing",  section: "perspective", transform: "perspective(500px) rotateY(-20deg) rotateX(4deg)" },
  { id: "per-r-above",  label: "Perspective Right Facing", section: "perspective", transform: "perspective(500px) rotateY(20deg) rotateX(4deg)" },
  { id: "per-below-l",  label: "Perspective Below Left",   section: "perspective", transform: "perspective(500px) rotateY(-15deg) rotateX(-10deg)" },
  { id: "per-below-r",  label: "Perspective Below Right",  section: "perspective", transform: "perspective(500px) rotateY(15deg) rotateX(-10deg)" },
  { id: "per-contr-l",  label: "Contrasting Left",         section: "perspective", transform: "perspective(400px) rotateY(-35deg) rotateX(8deg)" },
  { id: "per-contr-r",  label: "Contrasting Right",        section: "perspective", transform: "perspective(400px) rotateY(35deg) rotateX(8deg)" },
  { id: "per-mod-l",    label: "Moderate Left",            section: "perspective", transform: "perspective(700px) rotateY(-15deg) rotateX(5deg)" },
  { id: "per-mod-r",    label: "Moderate Right",           section: "perspective", transform: "perspective(700px) rotateY(15deg) rotateX(5deg)" },
  { id: "per-relax-l",  label: "Relaxed Moderate Left",    section: "perspective", transform: "perspective(900px) rotateY(-10deg) rotateX(3deg)" },
  { id: "per-relax-r",  label: "Relaxed Moderate Right",   section: "perspective", transform: "perspective(900px) rotateY(10deg) rotateX(3deg)" },
  // Oblique — 4
  { id: "obl-tl",       label: "Oblique Top Left",         section: "oblique",     transform: "rotateX(-10deg) rotateY(15deg) skewX(-3deg)" },
  { id: "obl-tr",       label: "Oblique Top Right",        section: "oblique",     transform: "rotateX(-10deg) rotateY(-15deg) skewX(3deg)" },
  { id: "obl-bl",       label: "Oblique Bottom Left",      section: "oblique",     transform: "rotateX(10deg) rotateY(15deg) skewX(-3deg)" },
  { id: "obl-br",       label: "Oblique Bottom Right",     section: "oblique",     transform: "rotateX(10deg) rotateY(-15deg) skewX(3deg)" },
];

const ALL_PRESETS = [
  ...SHARPEN_PRESETS,
  ...COLOR_SATURATION,
  ...COLOR_TONE,
  ...RECOLOR_PRESETS,
  ...ARTISTIC_EFFECTS,
];

const PRESET_MAP = new Map(ALL_PRESETS.map((p) => [p.id, p.filter]));

export function getEffectFilter(id) {
  if (!id || id === "none") return null;
  return PRESET_MAP.get(id) ?? null;
}
