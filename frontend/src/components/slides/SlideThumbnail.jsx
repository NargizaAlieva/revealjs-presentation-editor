import "./SlideThumbnail.css";

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;
const THUMBNAIL_WIDTH = 160;
const THUMBNAIL_HEIGHT = 90;
const SCALE_X = THUMBNAIL_WIDTH / SLIDE_WIDTH;
const SCALE_Y = THUMBNAIL_HEIGHT / SLIDE_HEIGHT;

// Flatten all paragraphs/runs into a single string (consistent with TextElement.jsx)
const getElementText = (textElement) =>
  (textElement?.paragraphs ?? [])
    .map((p) => (p.runs ?? []).map((r) => r.text ?? "").join(""))
    .join(" ");

export default function SlideThumbnail({ slide }) {
  const textElements = slide?.contents?.text ?? [];
  const mediaElements = slide?.contents?.media ?? [];

  return (
    <div className="slide-thumbnail">
      {textElements.map((textElement) => {
        const formatting = textElement.paragraphs?.[0]?.formatting ?? {};
        const fontSize = parseInt(formatting.size ?? "16", 10);

        return (
          <div
            key={textElement.id}
            className="slide-thumbnail-element"
            style={{
              position: "absolute",
              left: `${(textElement.position?.x ?? 0) * SCALE_X}px`,
              top: `${(textElement.position?.y ?? 0) * SCALE_Y}px`,
              width: `${(textElement.width ?? 300) * SCALE_X}px`,
              height: `${(textElement.height ?? 80) * SCALE_Y}px`,
              fontSize: `${fontSize * SCALE_Y}px`,
              fontWeight: formatting.weight ?? "normal",
              textAlign: formatting.align ?? "left",
              lineHeight: 1,
              overflow: "hidden",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
              margin: 0,
              padding: 0,
            }}
          >
            {getElementText(textElement)}
          </div>
        );
      })}

      {mediaElements.map((media) => (
        <img
          key={media.id}
          src={media["file-link"]}
          alt=""
          className="slide-thumbnail-media"
          style={{
            position: "absolute",
            left: `${(media.position?.x ?? 0) * SCALE_X}px`,
            top: `${(media.position?.y ?? 0) * SCALE_Y}px`,
            width: `${(media.width ?? 300) * SCALE_X}px`,
            height: `${(media.height ?? 200) * SCALE_Y}px`,
            objectFit: "contain",
          }}
        />
      ))}
    </div>
  );
}
