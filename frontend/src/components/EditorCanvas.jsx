import "./EditorCanvas.css";

export default function EditorCanvas({ slide }) {
  return (
    <main className="canvas-wrapper">
      <section className="editor-slide">
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
      </section>
    </main>
  );
}