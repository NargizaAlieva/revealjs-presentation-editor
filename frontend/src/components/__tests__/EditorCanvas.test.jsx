import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EditorCanvas from "../EditorCanvas";

const slide = {
  title: { content: "Test Slide" },
  contents: {
    text: [
      {
        id: "text-1",
        "placeholder-id": "title-placeholder",
        position: { x: 20, y: 30 },
        width: 300,
        height: 80,
        paragraphs: [
          {
            formatting: {
              size: "24px",
              weight: "normal",
              italics: false,
              align: "left",
            },
            runs: [{ text: "Hello Editor" }],
          },
        ],
      },
    ],
    media: [
      {
        id: "media-1",
        "file-link": "data:image/png;base64,test",
        "media-type": "image",
        position: { x: 10, y: 10 },
        width: 200,
        height: 120,
        rotation: 0,
        "z-index": 1,
      },
    ],
  },
};

describe("EditorCanvas", () => {
  it("renders text element content", () => {
    render(
      <EditorCanvas
        slide={slide}
        onChangeTextElement={vi.fn()}
        onMoveTextElement={vi.fn()}
        onResizeTextElement={vi.fn()}
        onFormatTextElement={vi.fn()}
        onDeleteTextElement={vi.fn()}
        onDeleteMedia={vi.fn()}
        onMoveMediaElement={vi.fn()}
        onResizeMediaElement={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Hello Editor")).toBeInTheDocument();
  });

  it("renders media image", () => {
    render(
      <EditorCanvas
        slide={slide}
        onChangeTextElement={vi.fn()}
        onMoveTextElement={vi.fn()}
        onResizeTextElement={vi.fn()}
        onFormatTextElement={vi.fn()}
        onDeleteTextElement={vi.fn()}
        onDeleteMedia={vi.fn()}
        onMoveMediaElement={vi.fn()}
        onResizeMediaElement={vi.fn()}
      />,
    );

    const image = document.querySelector(".canvas-media");
    expect(image).toBeInTheDocument();
  });

  it("calls onChangeTextElement when text is edited", () => {
    const onChangeTextElement = vi.fn();

    render(
      <EditorCanvas
        slide={slide}
        onChangeTextElement={onChangeTextElement}
        onMoveTextElement={vi.fn()}
        onResizeTextElement={vi.fn()}
        onFormatTextElement={vi.fn()}
        onDeleteTextElement={vi.fn()}
        onDeleteMedia={vi.fn()}
        onMoveMediaElement={vi.fn()}
        onResizeMediaElement={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue("Hello Editor"), {
      target: { value: "Updated Text" },
    });

    expect(onChangeTextElement).toHaveBeenCalledWith("text-1", "Updated Text");
  });
});
