import { describe, test, expect } from "vitest";
import {
  editorReducer,
  createInitialEditorState,
} from "../store/editorStore";
import { EditorEventType } from "../events/editorEvents";

describe("editorReducer", () => {
  test("MEDIA.ADD adds media to selected slide", () => {
    const state = createInitialEditorState();
    const initialMediaCount =
        state.presentation.slideset.slides[0].contents.media.length;

    const result = editorReducer(state, {
        type: EditorEventType.MEDIA.ADD,
        payload: {
        mediaElement: {
            id: "media-1",
            "file-link": "image.png",
            "media-type": "image",
        },
        },
    });

    expect(
        result.presentation.slideset.slides[0].contents.media
    ).toHaveLength(initialMediaCount + 1);

    expect(
        result.presentation.slideset.slides[0].contents.media.some(
        (media) => media.id === "media-1"
        )
    ).toBe(true);

    expect(result.selectedElementId).toBe("media-1");
    });

  test("ELEMENT.SELECT supports multiple and toggle selection", () => {
    const state = createInitialEditorState();
    const selected = editorReducer(state, {
      type: EditorEventType.ELEMENT.SELECT,
      payload: { elementIds: ["text-1", "media-1"] },
    });

    expect(selected.selectedElementIds).toEqual(["text-1", "media-1"]);
    expect(selected.selectedElementId).toBe("media-1");

    const toggled = editorReducer(selected, {
      type: EditorEventType.ELEMENT.SELECT,
      payload: { elementId: "text-1", toggle: true },
    });

    expect(toggled.selectedElementIds).toEqual(["media-1"]);
    expect(toggled.selectedElementId).toBe("media-1");
  });

  test("ELEMENT.COPY and ELEMENT.PASTE handle multiple elements", () => {
    const state = createInitialEditorState();
    const elements = [
      {
        id: "copy-text",
        position: { x: 10, y: 20 },
        paragraphs: [],
      },
      {
        id: "copy-media",
        position: { x: 30, y: 40 },
        "media-type": "image",
      },
    ];

    const copied = editorReducer(state, {
      type: EditorEventType.ELEMENT.COPY,
      payload: { elements },
    });
    const pasted = editorReducer(copied, {
      type: EditorEventType.ELEMENT.PASTE,
      payload: {},
    });

    expect(pasted.selectedElementIds).toHaveLength(2);
    expect(
      pasted.presentation.slideset.slides[0].contents.text.some(
        (element) => element.id === pasted.selectedElementIds[0],
      ),
    ).toBe(true);
    expect(
      pasted.presentation.slideset.slides[0].contents.media.some(
        (element) => element.id === pasted.selectedElementIds[1],
      ),
    ).toBe(true);
  });

  test("ELEMENT.DELETE_SELECTION removes text and media atomically", () => {
    let state = createInitialEditorState();
    state = editorReducer(state, {
      type: EditorEventType.MEDIA.ADD,
      payload: {
        mediaElement: {
          id: "delete-media",
          "media-type": "image",
        },
      },
    });
    const textId =
      state.presentation.slideset.slides[0].contents.text[0].id;

    const result = editorReducer(state, {
      type: EditorEventType.ELEMENT.DELETE_SELECTION,
      payload: { elementIds: [textId, "delete-media"] },
    });

    expect(
      result.presentation.slideset.slides[0].contents.text.some(
        (element) => element.id === textId,
      ),
    ).toBe(false);
    expect(
      result.presentation.slideset.slides[0].contents.media.some(
        (element) => element.id === "delete-media",
      ),
    ).toBe(false);
    expect(result.selectedElementIds).toEqual([]);
  });

  test("ELEMENT.UPDATE_MANY updates visibility in one history entry", () => {
    const state = createInitialEditorState();
    const textIds = state.presentation.slideset.slides[0].contents.text.map(
      (element) => element.id,
    );
    const result = editorReducer(state, {
      type: EditorEventType.ELEMENT.UPDATE_MANY,
      payload: {
        updates: textIds.map((elementId) => ({
          elementId,
          updates: { hidden: true },
        })),
      },
    });

    expect(
      result.presentation.slideset.slides[0].contents.text.every(
        (element) => element.hidden,
      ),
    ).toBe(true);
    expect(result.past).toHaveLength(1);
  });
});
