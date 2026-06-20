export function getSlideSize(presentation) {
    const dimensions = presentation?.slideset?.master?.["slide-dimensions"];

    return {
        width: dimensions?.width || 960,
        height: dimensions?.height || 540,
    };
}

export function getVisibleSlides(presentation) {
    return presentation?.slideset?.slides?.filter((slide) => !slide.hidden) || [];
}

export function getTextElements(slide) {
    if (slide?.contents?.text?.length) {
        return slide.contents.text;
    }

    if (slide?.placeholders?.length) {
        return slide.placeholders.map((placeholder, index) => {
            const isTitle = placeholder.id === "title" || placeholder.role === "title";

            return {
                id: placeholder.id || `placeholder-${index}`,
                position: placeholder.position || {
                    x: isTitle ? 80 : 80,
                    y: isTitle ? 80 : 180,
                },
                width: placeholder.width || 800,
                height: placeholder.height || (isTitle ? 80 : 200),
                rotation: 0,
                overflow: "hidden",
                background: "transparent",
                paragraphs: [
                    {
                        id: `${placeholder.id || index}-paragraph`,
                        runs: [
                            {
                                text: placeholder.content || "",
                            },
                        ],
                    },
                ],
                "z-index": index + 1,
                formatting: {
                    size: isTitle ? 36 : 24,
                    weight: isTitle ? "bold" : "normal",
                },
            };
        });
    }

    if (slide?.title) {
        return [
            {
                id: "fallback-title",
                position: { x: 80, y: 80 },
                width: 800,
                height: 80,
                rotation: 0,
                overflow: "hidden",
                background: "transparent",
                paragraphs: [
                    {
                        id: "fallback-title-paragraph",
                        runs: [{ text: slide.title?.content ?? "" }],
                    },
                ],
                "z-index": 1,
                formatting: {
                    size: 36,
                    weight: "bold",
                },
            },
        ];
    }

    return [];
}

export function getMediaElements(slide) {
    return slide?.contents?.media || [];
}

export function getTextFromTextElement(textElement) {
    return (
        textElement?.paragraphs
            ?.map((paragraph) =>
                paragraph?.runs?.map((run) => run?.text || "").join("")
            )
            .join("\n") || ""
    );
}

export function getPlaceholderFormatting(presentation, slide, textElement) {
  const layoutId = slide?.["layout-id"];
  const placeholderId = textElement?.["placeholder-id"];
  if (!layoutId || !placeholderId) return {};
  const layout = (presentation?.slideset?.layouts ?? []).find(
    (l) => l["layout-id"] === layoutId,
  );
  const placeholder = (layout?.placeholders ?? []).find(
    (ph) => ph["placeholder-id"] === placeholderId,
  );
  return placeholder?.formatting ?? {};
}

// Keys that are truly run-level (character-level overrides)
const RUN_LEVEL_KEYS = new Set(["super-sub-script"]);

export function migrateParagraphFormatting(paragraphs, placeholderFormatting, masterFormatting = {}) {
  if (!paragraphs) return paragraphs;
  return paragraphs.map((p) => {
    const userSetKeys = new Set(p.userSetKeys ?? []);

    // Clean paragraph.formatting: remove keys that match placeholder or master (inherited values)
    const f = { ...(p.formatting ?? {}) };
    for (const key of Object.keys(f)) {
      if (userSetKeys.has(key)) continue;
      if (key in placeholderFormatting) {
        if (f[key] === placeholderFormatting[key]) delete f[key];
      } else if (key in masterFormatting) {
        if (f[key] === masterFormatting[key]) delete f[key];
      }
    }

    // Clean run.formatting: remove keys that are identical to paragraph.formatting
    // (they were copied there, not user-set per-run overrides)
    // Keep keys that differ from paragraph — those are real per-word overrides
    const runs = (p.runs ?? []).map((run) => {
      const rf = Object.fromEntries(
        Object.entries(run.formatting ?? {}).filter(([k, v]) => {
          if (RUN_LEVEL_KEYS.has(k)) return true; // always keep run-only keys
          return v !== f[k]; // keep only if it differs from paragraph
        }),
      );
      return { ...run, formatting: rf };
    });

    return { ...p, formatting: f, runs };
  });
}

export function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}