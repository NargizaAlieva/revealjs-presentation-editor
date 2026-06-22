import { useState } from "react";
import "./FindReplaceDialog.css";

export default function FindReplaceDialog({
  mode = "find",
  controller,
  onClose,
}) {
  const [replacement, setReplacement] = useState("");

  if (!controller.isOpen) return null;

  const count = controller.matches.length;
  const setSearchOption = (name, value) => {
    controller.search(controller.query, {
      ...controller.options,
      [name]: value,
    });
  };

  return (
    <div
      className={`find-replace-dialog ${
        mode === "replace" ? "replace-dialog" : "find-dialog"
      }`}
      role="dialog"
      aria-label="Find and replace"
    >
      <div className="find-replace-header">
        <span>{mode === "replace" ? "Replace" : "Find"}</span>
        <span className="find-replace-help">?</span>
        <button onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="find-replace-content">
        <div className="find-replace-fields">
          <label>
            <span>Find what:</span>
            <input
              autoFocus
              value={controller.query}
              onChange={(event) => controller.search(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") controller.next();
              }}
            />
          </label>

          {mode === "replace" && (
            <label>
              <span>Replace with:</span>
              <input
                value={replacement}
                onChange={(event) => setReplacement(event.target.value)}
              />
            </label>
          )}

          <label className="find-replace-option">
            <input
              type="checkbox"
              checked={controller.options.matchCase}
              onChange={(event) =>
                setSearchOption("matchCase", event.target.checked)
              }
            />
            <span>Match case</span>
          </label>

          <label className="find-replace-option">
            <input
              type="checkbox"
              checked={controller.options.wholeWords}
              onChange={(event) =>
                setSearchOption("wholeWords", event.target.checked)
              }
            />
            <span>Find whole words only</span>
          </label>

          <div className="find-replace-status">
            {controller.query &&
              (count > 0
                ? `${controller.currentMatch + 1} of ${count} matches`
                : "No matches")}
          </div>
        </div>

        <div className="find-replace-actions">
          <button disabled={!count} onClick={controller.next}>Find Next</button>
          <button onClick={onClose}>Close</button>
          {mode === "replace" && (
            <>
              <button
                disabled={!count}
                onClick={() => controller.replace(replacement)}
              >
                Replace
              </button>
              <button
                disabled={!count}
                onClick={() => controller.replaceAll(replacement)}
              >
                Replace All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
