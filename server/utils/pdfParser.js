const fs = require('fs/promises');
const pdfParse = require('pdf-parse');

function firstNonEmptyLine(lines) {
  return lines.find((line) => line.trim().length > 6) || '';
}

async function extractMetadata(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  const lines = data.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = firstNonEmptyLine(lines);
  const abstractIndex = lines.findIndex((line) => /^abstract\b/i.test(line));
  const abstract = abstractIndex >= 0
    ? lines.slice(abstractIndex, abstractIndex + 8).join(' ').replace(/^abstract[:\s-]*/i, '')
    : '';
  const authors = lines[1] && !/^abstract\b/i.test(lines[1]) ? [lines[1]] : [];

  return { title, authors, abstract };
}

module.exports = { extractMetadata };
