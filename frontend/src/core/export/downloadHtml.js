import { downloadBackend } from "./downloadBackend";

export function downloadHtml(htmlContent, filename = "presentation.html") {
  downloadBackend.saveText(htmlContent, filename, "text/html");
}