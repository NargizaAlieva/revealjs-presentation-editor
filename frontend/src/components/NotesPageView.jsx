import "./NotesPageView.css";
import { buildColorThemeStyle } from "../core/render/revealRenderer";
import SlideDecorations from "./canvas/SlideDecorations";

export default function NotesPageView({
    slide,
    presentation,
    slideNotes,
    onUpdateSlideNotes,
    onBeginHistory,
    onCommitHistory,
}) {
    const colorThemeStyle = buildColorThemeStyle(presentation);
    const dims = presentation?.slideset?.master?.["slide-dimensions"];
    const width = dims?.width ?? 1280;
    const height = dims?.height ?? 720;

    const PREVIEW_W = 600;
    const scale = PREVIEW_W / width;
    const previewH = height * scale;

    const bgColor =
        !slide?.contents?.background || slide.contents.background === "#FFFFFFFF"
            ? "var(--bg-light, white)"
            : slide.contents.background;

    const textElements = slide?.contents?.text ?? [];

    return (
        <div className="notes-page-view" style={colorThemeStyle}>
            {/* Slide preview */}
            <div className="notes-page-slide-wrap">
                <div
                    className="notes-page-slide-frame"
                    style={{ width: PREVIEW_W, height: previewH }}
                >
                    <div
                        style={{
                            position: "relative",
                            width,
                            height,
                            transform: `scale(${scale})`,
                            transformOrigin: "top left",
                            background: bgColor,
                            overflow: "hidden",
                        }}
                    >
                        <SlideDecorations
                            presentation={presentation}
                            width={width}
                            height={height}
                        />
                        {textElements.map((el, i) => {
                            const text = (el.paragraphs ?? [])
                                .map((p) => p.runs?.map((r) => r.text).join("") ?? "")
                                .join("\n");
                            const fmt = el.paragraphs?.[0]?.formatting ?? {};
                            return (
                                <div
                                    key={el.id ?? i}
                                    style={{
                                        position: "absolute",
                                        left: el.position?.x ?? 0,
                                        top: el.position?.y ?? 0,
                                        width: el.width ?? 300,
                                        height: el.height ?? 80,
                                        fontSize: fmt.size ?? (i === 0 ? "44px" : "28px"),
                                        fontWeight: fmt.weight ?? (i === 0 ? "bold" : "normal"),
                                        color: fmt.color ?? "var(--text-dark, black)",
                                        fontFamily: fmt.font ?? "inherit",
                                        overflow: "hidden",
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {text}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Notes area */}
            <div className="notes-page-notes-wrap">
                <div className="notes-page-notes-label">Notes</div>
                <textarea
                    className="notes-page-textarea"
                    value={slideNotes}
                    onFocus={() => onBeginHistory?.()}
                    onChange={(e) => onUpdateSlideNotes(e.target.value)}
                    onBlur={() => onCommitHistory?.()}
                    placeholder="Click to add notes"
                />
            </div>
        </div>
    );
}