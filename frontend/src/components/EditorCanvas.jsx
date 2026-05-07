// import "./EditorCanvas.css";

// export default function EditorCanvas({
//   slide,
//   onChangePlaceholder,
//   onMovePlaceholder,
// }) {
//   return (
//     <main className="canvas-wrapper">
//       <section className="editor-slide">
//         {slide.placeholders.map((p) => (
//           <div
//             key={p.id}
//             className="draggable"
//             style={{
//               position: "absolute",
//               left: p.position?.x || 0,
//               top: p.position?.y || 0,
//             }}
//             draggable
//             onDragEnd={(e) =>
//               onMovePlaceholder(p.id, e.clientX - 300, e.clientY - 100)
//             }
//           >
//             {p.id === "title" ? (
//               <input
//                 value={p.content}
//                 onChange={(e) => onChangePlaceholder(p.id, e.target.value)}
//               />
//             ) : (
//               <textarea
//                 value={p.content}
//                 onChange={(e) => onChangePlaceholder(p.id, e.target.value)}
//               />
//             )}
//           </div>
//         ))}
//       </section>
//     </main>
//   );
// }


import { useState } from "react";
import "./EditorCanvas.css";

export default function EditorCanvas({
  slide,
  onChangePlaceholder,
  onMovePlaceholder,
}) {
  const [draggingElementId, setDraggingElementId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  if (!slide) {
    return (
      <main className="canvas-wrapper">
        <section className="editor-slide">No slide selected</section>
      </main>
    );
  }

  const textElements = slide.contents?.text ?? [];

  const handleMouseMove = (e) => {
    if (!draggingElementId) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    onMovePlaceholder(draggingElementId, newX, newY);
  };

  const stopDragging = () => {
    setDraggingElementId(null);
  };

  return (
    <main className="canvas-wrapper">
      <section
        className="editor-slide"
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
      >
        {textElements.map((textElement) => {
          const text =
            textElement.paragraphs?.[0]?.runs?.[0]?.text ?? "";

          const isTitle =
            textElement["placeholder-id"] === "title-placeholder";

          return (
            <div
              key={textElement.id}
              className="draggable"
              style={{
                position: "absolute",
                left: `${textElement.position?.x ?? 0}px`,
                top: `${textElement.position?.y ?? 0}px`,
              }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();

                setDraggingElementId(textElement.id);
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              {isTitle ? (
                <input
                  value={text}
                  onChange={(e) =>
                    onChangePlaceholder(textElement.id, e.target.value)
                  }
                />
              ) : (
                <textarea
                  value={text}
                  onChange={(e) =>
                    onChangePlaceholder(textElement.id, e.target.value)
                  }
                />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
