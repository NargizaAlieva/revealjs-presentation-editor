export const browserDownload = {
  saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  },

  saveText(content, filename, mimeType = "text/plain") {
    const blob = new Blob([content], { type: mimeType });
    this.saveBlob(blob, filename);
  },
};
