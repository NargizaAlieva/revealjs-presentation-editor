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
});