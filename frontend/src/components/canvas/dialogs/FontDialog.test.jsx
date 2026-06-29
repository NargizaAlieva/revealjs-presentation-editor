import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FontDialog from "./FontDialog";

const renderDialog = (props = {}) =>
  render(<FontDialog onApply={vi.fn()} onClose={vi.fn()} {...props} />);

describe("FontDialog", () => {
  test("renders Font label, Size input, OK and Cancel buttons", () => {
    renderDialog();
    expect(screen.getByRole("dialog", { name: "Font" })).toBeInTheDocument();
    expect(screen.getByLabelText(/size/i)).toBeInTheDocument();
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

  test("pre-fills size from formatting prop", () => {
    renderDialog({ formatting: { size: "36px" } });
    expect(screen.getByLabelText(/size/i).value).toBe("36");
  });

  test("pre-fills Bold checkbox from formatting.weight", () => {
    renderDialog({ formatting: { weight: "bold" } });
    expect(screen.getByLabelText(/bold/i)).toBeChecked();
  });

  test("pre-fills Italic checkbox from formatting.italics", () => {
    renderDialog({ formatting: { italics: true } });
    expect(screen.getByLabelText(/italic/i)).toBeChecked();
  });

  test("pre-fills Underline checkbox from formatting.text-decoration", () => {
    renderDialog({ formatting: { "text-decoration": "underline" } });
    expect(screen.getByLabelText(/underline/i)).toBeChecked();
  });

  test("onApply receives bold:true when Bold checkbox toggled on", () => {
    const onApply = vi.fn();
    renderDialog({ onApply, formatting: { weight: "normal" } });
    fireEvent.click(screen.getByLabelText(/bold/i));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ weight: "bold" }),
    );
  });

  test("onApply receives size with px suffix from input", () => {
    const onApply = vi.fn();
    renderDialog({ onApply });
    fireEvent.change(screen.getByLabelText(/size/i), { target: { value: "32" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ size: "32px" }),
    );
  });
});
