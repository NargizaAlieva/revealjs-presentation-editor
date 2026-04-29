import "./EditorCanvas.css";

export default function EditorCanvas({ slide, onChangeText }) {
  return (
    <main className="canvas-wrapper">
      <section className="editor-slide">
        <h2>{slide.title}</h2>

        <textarea
          value={slide.text}
          onChange={(e) => onChangeText(e.target.value)}
          className="text-editor"
        />
      </section>
    </main>
  );
}