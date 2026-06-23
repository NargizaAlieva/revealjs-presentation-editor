import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdInfoOutline } from "react-icons/md";
import "./AltTextPanel.css";

export default function AltTextPanel({ media, onUpdate, onClose }) {
  const [altText, setAltText] = useState(media?.alt ?? "");
  const [decorative, setDecorative] = useState(media?.decorative ?? false);

  useEffect(() => {
    setAltText(media?.alt ?? "");
    setDecorative(media?.decorative ?? false);
  }, [media?.id]);

  const commit = () => {
    onUpdate({ alt: decorative ? "" : altText, decorative });
  };

  return createPortal(
    <div className="alt-panel">
      <div className="alt-panel-header">
        <span className="alt-panel-title">Alt Text</span>
        <button className="alt-panel-close" onClick={onClose}><MdClose /></button>
      </div>

      <div className="alt-panel-body">
        <p className="alt-panel-desc">
          How would you describe this object and its context to someone who is blind or low vision?
        </p>
        <ul className="alt-panel-hints">
          <li>The subject(s) in detail</li>
          <li>The setting</li>
          <li>The actions or interactions</li>
          <li>Other relevant information</li>
        </ul>
        <p className="alt-panel-hint-note">
          <em>(1–2 detailed sentences recommended)</em>
        </p>

        <textarea
          className="alt-panel-textarea"
          value={decorative ? "" : altText}
          disabled={decorative}
          placeholder="Enter a description…"
          onChange={(e) => setAltText(e.target.value)}
          onBlur={commit}
        />

        <label className="alt-panel-decorative">
          <input
            type="checkbox"
            checked={decorative}
            onChange={(e) => {
              setDecorative(e.target.checked);
              onUpdate({ decorative: e.target.checked, alt: e.target.checked ? "" : altText });
            }}
          />
          <span>Mark as decorative</span>
          <span className="alt-panel-decorative-info" title="Decorative images are ignored by screen readers">
            <MdInfoOutline />
          </span>
        </label>
      </div>
    </div>,
    document.body,
  );
}
