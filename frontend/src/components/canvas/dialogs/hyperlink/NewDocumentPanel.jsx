export default function NewDocumentPanel({
  documentName,
  editNow,
  onDocumentNameChange,
  onEditNowChange,
}) {
  return (
    <div className="insert-hyperlink-new-panel">
      <label>
        <span>Name of new document:</span>
        <input
          value={documentName}
          onChange={(event) => onDocumentNameChange(event.target.value)}
        />
      </label>
      <div className="insert-hyperlink-full-path-row">
        <span>Full path:</span>
        <button type="button">Change...</button>
        <strong>C:\Users\user\Downloads\</strong>
      </div>
      <fieldset className="insert-hyperlink-edit-options">
        <legend>When to edit:</legend>
        <label>
          <input
            type="radio"
            name="edit-new-document"
            checked={!editNow}
            onChange={() => onEditNowChange(false)}
          />
          <span>Edit the new document later</span>
        </label>
        <label>
          <input
            type="radio"
            name="edit-new-document"
            checked={editNow}
            onChange={() => onEditNowChange(true)}
          />
          <span>Edit the new document now</span>
        </label>
      </fieldset>
    </div>
  );
}
