import { useState, useRef, useEffect } from "react";
import {
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { BULLET_STYLES, NUMBERED_STYLES } from "./homeTabConstants";
import "./ParagraphGroup.css";

export default function ParagraphGroup({
  currentFormatting = {},
  isTextSelected = false,
  onFormatChange,
}) {
  const [showBulletPicker, setShowBulletPicker] = useState(false);
  const [showNumberedPicker, setShowNumberedPicker] = useState(false);
  const bulletPickerRef = useRef(null);
  const numberedPickerRef = useRef(null);

  const fmt = (updates) => {
    if (!isTextSelected || !onFormatChange) return;
    onFormatChange(updates);
  };

  const currentAlign = currentFormatting.align ?? "left";
  const currentListType = currentFormatting["list-type"] ?? null;
  const currentListLevel = currentFormatting["indent-level"] ?? 0;

  useEffect(() => {
    if (!showBulletPicker && !showNumberedPicker) return;
    const handleClick = (e) => {
      if (
        bulletPickerRef.current &&
        !bulletPickerRef.current.contains(e.target)
      )
        setShowBulletPicker(false);
      if (
        numberedPickerRef.current &&
        !numberedPickerRef.current.contains(e.target)
      )
        setShowNumberedPicker(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showBulletPicker, showNumberedPicker]);

  return (
    <div className="ribbon-group paragraph-group">
      <div className="font-row">
        {/* Bullets split-button */}
        <div className="list-split-btn" ref={bulletPickerRef}>
          <button
            className={`small-format${currentListType === "bullet" ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Bulleted list"
            onClick={() =>
              fmt({
                "list-type": currentListType === "bullet" ? null : "bullet",
                "list-marker":
                  currentListType === "bullet"
                    ? null
                    : (currentFormatting["list-marker"] ?? "•"),
                "indent-level": 0,
              })
            }
          >
            <MdFormatListBulleted />
          </button>
          <button
            className="list-split-arrow"
            disabled={!isTextSelected}
            title="Bullet styles"
            onClick={() => {
              setShowBulletPicker((v) => !v);
              setShowNumberedPicker(false);
            }}
          >
            ▾
          </button>
          {showBulletPicker && (
            <div className="list-picker-popup">
              <div className="list-picker-grid">
                {BULLET_STYLES.map(({ marker, label }) => (
                  <button
                    key={label}
                    className={`list-picker-cell${
                      (currentFormatting["list-marker"] ?? "•") === marker &&
                      currentListType === "bullet"
                        ? " selected"
                        : ""
                    }`}
                    title={label}
                    onClick={() => {
                      fmt(
                        marker === null
                          ? {
                              "list-type": null,
                              "list-marker": null,
                              "indent-level": 0,
                            }
                          : {
                              "list-type": "bullet",
                              "list-marker": marker,
                              "indent-level": currentListLevel,
                            },
                      );
                      setShowBulletPicker(false);
                    }}
                  >
                    {marker === null ? (
                      <span className="list-picker-none">None</span>
                    ) : (
                      <span className="list-picker-preview">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="list-picker-row">
                            <span className="list-picker-marker">{marker}</span>
                            <span className="list-picker-line" />
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="list-split-btn" ref={numberedPickerRef}>
          <button
            className={`small-format${currentListType === "numbered" ? " active" : ""}`}
            disabled={!isTextSelected}
            title="Numbered list"
            onClick={() =>
              fmt({
                "list-type": currentListType === "numbered" ? null : "numbered",
                "list-numbered-style":
                  currentListType === "numbered"
                    ? null
                    : (currentFormatting["list-numbered-style"] ?? "decimal"),
                "indent-level": 0,
              })
            }
          >
            <MdFormatListNumbered />
          </button>
          <button
            className="list-split-arrow"
            disabled={!isTextSelected}
            title="Numbering styles"
            onClick={() => {
              setShowNumberedPicker((v) => !v);
              setShowBulletPicker(false);
            }}
          >
            ▾
          </button>
          {showNumberedPicker && (
            <div className="list-picker-popup">
              <div className="list-picker-grid list-picker-grid--numbered">
                {NUMBERED_STYLES.map(({ style, label }) => (
                  <button
                    key={label}
                    className={`list-picker-cell${
                      (currentFormatting["list-numbered-style"] ??
                        "decimal") === style && currentListType === "numbered"
                        ? " selected"
                        : ""
                    }`}
                    title={label}
                    onClick={() => {
                      fmt(
                        style === null
                          ? {
                              "list-type": null,
                              "list-numbered-style": null,
                              "indent-level": 0,
                            }
                          : {
                              "list-type": "numbered",
                              "list-numbered-style": style,
                              "indent-level": currentListLevel,
                            },
                      );
                      setShowNumberedPicker(false);
                    }}
                  >
                    {style === null ? (
                      <span className="list-picker-none">None</span>
                    ) : (
                      <span className="list-picker-preview">
                        {["1", "2", "3"].map((n, i) => (
                          <span key={i} className="list-picker-row">
                            <span
                              className="list-picker-marker"
                              style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                              {style === "decimal"
                                ? `${n}.`
                                : style === "lower-alpha"
                                  ? `${String.fromCharCode(96 + Number(n))}.`
                                  : style === "upper-alpha"
                                    ? `${String.fromCharCode(64 + Number(n))}.`
                                    : style === "lower-roman"
                                      ? ["i.", "ii.", "iii."][i]
                                      : ["I.", "II.", "III."][i]}
                            </span>
                            <span className="list-picker-line" />
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          className="small-format"
          disabled={!isTextSelected || currentListLevel <= 0}
          title="Decrease list level"
          onClick={() =>
            fmt({ "indent-level": Math.max(0, currentListLevel - 1) })
          }
        >
          <MdArrowUpward />
        </button>
        <button
          className="small-format"
          disabled={!isTextSelected || !currentListType}
          title="Increase list level"
          onClick={() =>
            fmt({ "indent-level": Math.min(4, currentListLevel + 1) })
          }
        >
          <MdArrowDownward />
        </button>
      </div>

      <div className="font-row">
        {["left", "center", "right", "justify"].map((align) => (
          <button
            key={align}
            className={`small-format${currentAlign === align ? " active" : ""}`}
            disabled={!isTextSelected}
            title={`Align ${align}`}
            onClick={() => fmt({ align })}
          >
            {align === "left" && <MdFormatAlignLeft />}
            {align === "center" && <MdFormatAlignCenter />}
            {align === "right" && <MdFormatAlignRight />}
            {align === "justify" && <MdFormatAlignJustify />}
          </button>
        ))}
      </div>

      <div className="ribbon-group-title">Paragraph</div>
    </div>
  );
}
