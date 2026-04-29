import "./EditorCanvas.css";

export default function EditorCanvas({ slide, onChangeTitle, onChangeText }) {
  return (
    <main className="canvas-wrapper">
      <section className="editor-slide">
        <input
          value={slide.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="title-editor"
        />

        <textarea
          value={slide.text}
          onChange={(e) => onChangeText(e.target.value)}
          className="text-editor"
        />
      </section>
    </main>
  );
}
