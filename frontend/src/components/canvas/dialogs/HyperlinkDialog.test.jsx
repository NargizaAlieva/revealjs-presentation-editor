import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HyperlinkDialog from "./HyperlinkDialog";

const renderDialog = (props = {}) =>
  render(
    <HyperlinkDialog
      selectedText=""
      onApply={vi.fn()}
      onClose={vi.fn()}
      {...props}
    />,
  );

const clickOK = () =>
  fireEvent.click(screen.getByRole("button", { name: "OK" }));

const fillAddress = (value) =>
  fireEvent.change(screen.getByPlaceholderText("https://example.com"), {
    target: { value },
  });

describe("HyperlinkDialog", () => {
  test("renders address input and OK/Cancel buttons", () => {
    renderDialog();
    expect(screen.getByPlaceholderText("https://example.com")).toBeInTheDocument();
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

  test("shows error when submitting with empty address", () => {
    renderDialog();
    clickOK();
    expect(screen.getByText("Enter a link address.")).toBeInTheDocument();
  });

  test("calls onApply with href and selected text", () => {
    const onApply = vi.fn(() => true);
    renderDialog({ onApply, selectedText: "click here" });
    fillAddress("https://example.com");
    clickOK();
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        href: "https://example.com",
        text: "click here",
        type: "web",
      }),
    );
  });

  test("pre-fills address from existingLink", () => {
    renderDialog({
      existingLink: { href: "https://existing.com", screenTip: "", type: "web" },
    });
    expect(screen.getByPlaceholderText("https://example.com").value).toBe(
      "https://existing.com",
    );
  });

  test("shows error when onApply returns false", () => {
    const onApply = vi.fn(() => false);
    renderDialog({ onApply });
    fillAddress("https://example.com");
    clickOK();
    expect(
      screen.getByText("Select text in one paragraph before adding a hyperlink."),
    ).toBeInTheDocument();
  });

  test("clears error when address field changes after failed submit", () => {
    const onApply = vi.fn(() => false);
    renderDialog({ onApply });
    fillAddress("https://example.com");
    clickOK();
    expect(screen.getByText(/select text/i)).toBeInTheDocument();

    fillAddress("https://other.com");
    expect(screen.queryByText(/select text/i)).not.toBeInTheDocument();
  });

  test("shows email error when email panel is empty on submit", () => {
    renderDialog();
    fireEvent.click(screen.getByRole("button", { name: /e-mail address/i }));
    clickOK();
    expect(screen.getByText("Enter an e-mail address.")).toBeInTheDocument();
  });

  test("renders slide titles in Place in Document panel", () => {
    const presentation = {
      slideset: {
        slides: [
          { title: { content: "Intro" } },
          { title: { content: "Methods" } },
        ],
      },
    };
    renderDialog({ presentation });
    fireEvent.click(screen.getByRole("button", { name: /place in this document/i }));
    expect(screen.getByText("1. Intro")).toBeInTheDocument();
    expect(screen.getByText("2. Methods")).toBeInTheDocument();
  });
});
