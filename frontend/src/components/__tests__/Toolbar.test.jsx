import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Toolbar from "../Toolbar";

describe("Toolbar", () => {
  it("renders main editor action buttons", () => {
    render(
      <Toolbar
        onAddSlide={vi.fn()}
        onDeleteSlide={vi.fn()}
        onDuplicateSlide={vi.fn()}
        onMoveSlideUp={vi.fn()}
        onMoveSlideDown={vi.fn()}
        onSavePresentation={vi.fn()}
        onOpenPreview={vi.fn()}
        onExportPresentation={vi.fn()}
        onResetPresentation={vi.fn()}
        onImageUpload={vi.fn()}
        canDelete={true}
        canMoveUp={true}
        canMoveDown={true}
      />,
    );

    expect(screen.getByText("New Slide")).toBeInTheDocument();
    expect(screen.getByText("Delete Slide")).toBeInTheDocument();
    expect(screen.getByText("Duplicate Slide")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Export")).toBeInTheDocument();
    expect(screen.getByText("Reset")).toBeInTheDocument();
    expect(screen.getByText("Upload Image")).toBeInTheDocument();
  });
});
