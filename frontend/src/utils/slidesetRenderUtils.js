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

export function escapeHtml(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}