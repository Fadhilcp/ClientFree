export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '') //to remove every spaces
    .replace(/[\.\-_]/g, '') //to remove dot, hyphon, underscore
    .trim();
}