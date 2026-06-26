import { useState } from "react";
import "./CommentsPanel.css";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return <div className="cp-avatar">{initials}</div>;
}

export default function CommentsPanel({
  comments = [],
  authorName = "User",
  onAdd,
  onDelete,
  onClose,
  autoCompose = false,
}) {
  const [composing, setComposing] = useState(autoCompose);
  const [draft, setDraft] = useState("");

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd?.(text, authorName);
    setDraft("");
    setComposing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setDraft("");
      setComposing(false);
    }
  };

  return (
    <aside className="comments-panel">
      <div className="cp-header">
        <span className="cp-title">Comments</span>
        <div className="cp-header-actions">
          <button
            className="cp-new-btn"
            onClick={() => setComposing(true)}
            title="New comment"
          >
            + New
          </button>
          <button className="cp-close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="cp-body">
        {comments.length === 0 && !composing && (
          <p className="cp-empty">No comments on this slide.</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="cp-comment">
            <div className="cp-comment-head">
              <Avatar name={c.author} />
              <div className="cp-comment-meta">
                <span className="cp-comment-author">{c.author}</span>
                <span className="cp-comment-time">
                  {formatTime(c.createdAt)}
                </span>
              </div>
              <button
                className="cp-delete-btn"
                title="Delete comment"
                onClick={() => onDelete?.(c.id)}
              >
                ✕
              </button>
            </div>
            <p className="cp-comment-text">{c.text}</p>
          </div>
        ))}

        {composing && (
          <div className="cp-compose">
            <div className="cp-compose-head">
              <Avatar name={authorName} />
              <span className="cp-comment-author">{authorName}</span>
            </div>
            <textarea
              className="cp-textarea"
              placeholder="Start a conversation"
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <p className="cp-tip">Tip: Press Ctrl+Enter to post.</p>
            <div className="cp-compose-actions">
              <button
                className="cp-submit-btn"
                onClick={handleSubmit}
                disabled={!draft.trim()}
                title="Post comment"
              >
                ➤
              </button>
              <button
                className="cp-cancel-btn"
                onClick={() => {
                  setDraft("");
                  setComposing(false);
                }}
                title="Cancel"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
