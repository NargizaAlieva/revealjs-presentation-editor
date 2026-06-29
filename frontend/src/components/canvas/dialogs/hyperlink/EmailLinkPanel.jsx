export default function EmailLinkPanel({
  emailAddress,
  emailSubject,
  onAddressChange,
  onSubjectChange,
}) {
  return (
    <div className="insert-hyperlink-email-panel">
      <label>
        <span>E-mail address:</span>
        <input
          value={emailAddress}
          onChange={(event) => onAddressChange(event.target.value)}
        />
      </label>
      <label>
        <span>Subject:</span>
        <input
          value={emailSubject}
          onChange={(event) => onSubjectChange(event.target.value)}
        />
      </label>
      <span>Recently used e-mail addresses:</span>
      <div className="insert-hyperlink-recent-emails" />
    </div>
  );
}
