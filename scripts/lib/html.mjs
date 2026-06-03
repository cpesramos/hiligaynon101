export const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const attr = escapeHtml;

export const compactText = (value = "") => String(value).replace(/\s+/g, " ").trim();

export function jsonLdScript(value) {
  return `<script type="application/ld+json">${JSON.stringify(value).replaceAll("</", "<\\/")}</script>`;
}
