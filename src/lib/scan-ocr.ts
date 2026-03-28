import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { createWorker } from "tesseract.js";

type OcrResult = {
  text: string;
  engine: "pdf-parse" | "tesseract" | "plain-text";
  styledHtml?: string;
  layout?: {
    width: number;
    height: number;
    words: number;
  };
};

type OcrWord = {
  text: string;
  confidence: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildStyledHtml(words: OcrWord[]) {
  if (words.length === 0) {
    return {
      styledHtml: "",
      width: 800,
      height: 1200,
    };
  }

  const maxX = Math.max(...words.map((word) => word.left + word.width), 800);
  const maxY = Math.max(...words.map((word) => word.top + word.height), 1200);

  const wordNodes = words
    .map((word) => {
      const fontSize = Math.max(10, Math.round(word.height * 0.82));
      const safeText = escapeHtml(word.text);

      return `<span data-confidence="${Math.round(word.confidence)}" style="position:absolute;left:${word.left}px;top:${word.top}px;font-size:${fontSize}px;line-height:1.05;white-space:pre;color:#101018;font-family:'Times New Roman',serif;">${safeText}</span>`;
    })
    .join("\n");

  const styledHtml = `<section style="position:relative;width:${Math.ceil(maxX + 20)}px;height:${Math.ceil(maxY + 20)}px;background:#fff;border:1px solid #d8d8df;overflow:hidden;">\n${wordNodes}\n</section>`;

  return {
    styledHtml,
    width: Math.ceil(maxX + 20),
    height: Math.ceil(maxY + 20),
  };
}

async function extractWithTesseract(buffer: Buffer) {
  const worker = await createWorker("pol+eng");

  try {
    const result = await worker.recognize(buffer);
    const ocrData = result.data as unknown as {
      text?: string;
      words?: Array<{
        text?: string;
        confidence?: number;
        bbox?: { x0?: number; y0?: number; x1?: number; y1?: number };
      }>;
    };

    const rawWords = Array.isArray(ocrData.words) ? ocrData.words : [];

    const words = rawWords
      .map((word) => ({
        text: String(word.text ?? "").trim(),
        confidence: Number(word.confidence ?? 0),
        left: Number(word.bbox?.x0 ?? 0),
        top: Number(word.bbox?.y0 ?? 0),
        width: Math.max(1, Number((word.bbox?.x1 ?? 0) - (word.bbox?.x0 ?? 0))),
        height: Math.max(1, Number((word.bbox?.y1 ?? 0) - (word.bbox?.y0 ?? 0))),
      }))
      .filter((word) => word.text.length > 0);

    const styled = buildStyledHtml(words);

    return {
      text: normalizeText(ocrData.text || ""),
      styledHtml: styled.styledHtml,
      layout: {
        width: styled.width,
        height: styled.height,
        words: words.length,
      },
    };
  } finally {
    await worker.terminate();
  }
}

export async function extractTextFromScan(file: File): Promise<OcrResult> {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const mime = (file.type || "").toLowerCase();
  const fileName = file.name.toLowerCase();

  if (mime.startsWith("text/") || fileName.endsWith(".txt")) {
    const raw = await file.text();

    return {
      text: normalizeText(raw),
      engine: "plain-text",
    };
  }

  if (mime === "text/html" || fileName.endsWith(".html") || fileName.endsWith(".htm")) {
    const html = await file.text();

    return {
      text: normalizeText(html),
      engine: "plain-text",
      styledHtml: html,
    };
  }

  if (mime === "application/pdf" || fileName.endsWith(".pdf")) {
    const parsed = await pdfParse(fileBuffer);
    const parsedText = normalizeText(parsed.text || "");

    if (parsedText.length > 20) {
      return {
        text: parsedText,
        engine: "pdf-parse",
      };
    }

    const ocrResult = await extractWithTesseract(fileBuffer);
    return {
      text: ocrResult.text,
      engine: "tesseract",
      styledHtml: ocrResult.styledHtml,
      layout: ocrResult.layout,
    };
  }

  const ocrResult = await extractWithTesseract(fileBuffer);
  return {
    text: ocrResult.text,
    engine: "tesseract",
    styledHtml: ocrResult.styledHtml,
    layout: ocrResult.layout,
  };
}