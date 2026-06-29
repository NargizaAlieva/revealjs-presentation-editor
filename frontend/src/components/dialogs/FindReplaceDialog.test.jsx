import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FindReplaceDialog from "./FindReplaceDialog";

const makeController = (overrides = {}) => ({
  isOpen: true,
  query: "",
  matches: [],
  currentMatch: 0,
  options: { matchCase: false, wholeWords: false },
  search: vi.fn(),
  next: vi.fn(),
  replace: vi.fn(),
  replaceAll: vi.fn(),
  ...overrides,
});

const renderDialog = (props = {}) => {
  const controller = props.controller ?? makeController();
  return render(
    <FindReplaceDialog controller={controller} onClose={vi.fn()} {...props} />,
  );
};

describe("FindReplaceDialog — find mode", () => {
  test("renders Find what input and Find Next / Close buttons", () => {
    renderDialog();
    expect(screen.getByLabelText(/find what/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Find Next" })).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  test("does not render Replace with input in find mode", () => {
    renderDialog({ mode: "find" });
    expect(screen.queryByLabelText(/replace with/i)).not.toBeInTheDocument();
  });

  test("calls controller.search when typing in Find what", () => {
    const controller = makeController();
    renderDialog({ controller });
    fireEvent.change(screen.getByLabelText(/find what/i), {
      target: { value: "hello" },
    });
    expect(controller.search).toHaveBeenCalledWith("hello");
  });

  test("calls controller.next when Enter is pressed in Find what", () => {
    const controller = makeController();
    renderDialog({ controller });
    fireEvent.keyDown(screen.getByLabelText(/find what/i), { key: "Enter" });
    expect(controller.next).toHaveBeenCalled();
  });

  test("Find Next button is disabled when there are no matches", () => {
    renderDialog({ controller: makeController({ matches: [] }) });
    expect(screen.getByRole("button", { name: "Find Next" })).toBeDisabled();
  });

  test("Find Next button is enabled when matches exist", () => {
    renderDialog({ controller: makeController({ matches: [{}] }) });
    expect(screen.getByRole("button", { name: "Find Next" })).not.toBeDisabled();
  });

  test("calls controller.next when Find Next is clicked", () => {
    const controller = makeController({ matches: [{}] });
    renderDialog({ controller });
    fireEvent.click(screen.getByRole("button", { name: "Find Next" }));
    expect(controller.next).toHaveBeenCalled();
  });

  test("shows match count when query is set and matches exist", () => {
    renderDialog({
      controller: makeController({ query: "hi", matches: [{}, {}], currentMatch: 0 }),
    });
    expect(screen.getByText("1 of 2 matches")).toBeInTheDocument();
  });

  test("shows No matches when query is set but no matches", () => {
    renderDialog({
      controller: makeController({ query: "xyz", matches: [] }),
    });
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  test("calls onClose when Close button is clicked", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("calls onClose when × button is clicked", () => {
    const onClose = vi.fn();
    renderDialog({ onClose });
    fireEvent.click(screen.getByText("×"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  test("toggles matchCase option when checkbox is clicked", () => {
    const controller = makeController();
    renderDialog({ controller });
    fireEvent.click(screen.getByLabelText(/match case/i));
    expect(controller.search).toHaveBeenCalledWith(
      controller.query,
      expect.objectContaining({ matchCase: true }),
    );
  });

  test("toggles wholeWords option when checkbox is clicked", () => {
    const controller = makeController();
    renderDialog({ controller });
    fireEvent.click(screen.getByLabelText(/whole words/i));
    expect(controller.search).toHaveBeenCalledWith(
      controller.query,
      expect.objectContaining({ wholeWords: true }),
    );
  });

  test("renders nothing when controller.isOpen is false", () => {
    renderDialog({ controller: makeController({ isOpen: false }) });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("FindReplaceDialog — replace mode", () => {
  test("renders Replace with input in replace mode", () => {
    renderDialog({ mode: "replace" });
    expect(screen.getByLabelText(/replace with/i)).toBeInTheDocument();
  });

  test("Replace and Replace All buttons are present in replace mode", () => {
    renderDialog({ mode: "replace" });
    expect(screen.getByRole("button", { name: "Replace" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Replace All" })).toBeInTheDocument();
  });

  test("Replace button is disabled when no matches", () => {
    renderDialog({ mode: "replace", controller: makeController({ matches: [] }) });
    expect(screen.getByRole("button", { name: "Replace" })).toBeDisabled();
  });

  test("calls controller.replace with replacement text", () => {
    const controller = makeController({ matches: [{}] });
    renderDialog({ mode: "replace", controller });
    fireEvent.change(screen.getByLabelText(/replace with/i), {
      target: { value: "world" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(controller.replace).toHaveBeenCalledWith("world");
  });

  test("calls controller.replaceAll with replacement text", () => {
    const controller = makeController({ matches: [{}] });
    renderDialog({ mode: "replace", controller });
    fireEvent.change(screen.getByLabelText(/replace with/i), {
      target: { value: "world" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Replace All" }));
    expect(controller.replaceAll).toHaveBeenCalledWith("world");
  });
});
