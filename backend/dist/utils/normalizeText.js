"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeText = normalizeText;
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, '') //to remove every spaces
        .replace(/[\.\-_]/g, '') //to remove dot, hyphon, underscore
        .trim();
}
