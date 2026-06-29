import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ParagraphDialog from "./ParagraphDialog";

const renderDialog = (props = {}) =>
  render(<ParagraphDialog onApply={vi.fn()} onClose={vi.fn()} {...props} />);

describe("ParagraphDialog", () => {
  test("renders dialog with alignment select and OK/Cancel buttons", () => {
    renderDialog();
    expect(screen.getByRole("dialog", { name: "Paragraph" })).toBeInTheDocument();
    expect(screen.getByLabelText(/alignment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  test("calls onClose when Cancel is clicked", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("calls onClose when × button is clicked", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("calls onApply and onClose when OK is clicked", () => {
    const onApply = vi.fn();
    const onClose = vi.fn();
    renderDialog({ onApply, onClose });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onApply).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("pre-fills alignment from formatting.align", () => {
    renderDialog({ formatting: { align: "center" } });
    expect(screen.getByLabelText(/alignment/i).value).toBe("center");
  });

  test("onApply receives selected alignment", () => {
    const onApply = vi.fn();
    renderDialog({ onApply, formatting: { align: "left" } });
    fireEvent.change(screen.getByLabelText(/alignment/i), {
      target: { value: "right" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ align: "right" }),
    );
  });

  test("onApply receives margin string from Before/After inputs", () => {
    const onApply = vi.fn();
    renderDialog({ onApply });
    // spinbuttons order: [0] indent "Before text", [1] disabled "By", [2] spacing "Before", [3] "After", [4] "At"
    const beforeInput = screen.getAllByRole("spinbutton")[2];
    fireEvent.change(beforeInput, { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ margin: expect.stringContaining("12px") }),
    );
  });

  test("onApply receives line-spacing as string", () => {
    const onApply = vi.fn();
    renderDialog({ onApply, formatting: { "line-spacing": "1.5" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ "line-spacing": "1.5" }),
    );
  });
});
