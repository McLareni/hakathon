import { DocumentProcessType, DocumentTemplateSource, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeScanText } from "@/lib/template-analysis";
import { extractTextFromScan } from "@/lib/scan-ocr";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function parseType(raw: string | null): DocumentProcessType {
  if (!raw) {
    return DocumentProcessType.OTHER;
  }

  if (raw in DocumentProcessType) {
    return raw as DocumentProcessType;
  }

  return DocumentProcessType.OTHER;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const creatorId = formData.get("creatorId")?.toString();
    const name = formData.get("name")?.toString();
    const type = parseType(formData.get("type")?.toString() ?? null);
    const file = formData.get("file");

    if (!creatorId || !name || !(file instanceof File)) {
      return NextResponse.json(
        { error: "creatorId, name and file are required" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Max size is 10MB" },
        { status: 400 },
      );
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: { id: true },
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const ocrResult = await extractTextFromScan(file);
    const analysis = analyzeScanText(ocrResult.text);

    // If OCR extracted no text (scanned image PDF) and type is CAR_SALE,
    // fall back to the system template content stored in DB.
    let templateContent = ocrResult.styledHtml || analysis.generatedContent;
    if (!ocrResult.text && type === DocumentProcessType.CAR_SALE) {
      const systemTemplate = await prisma.documentTemplate.findFirst({
        where: { source: DocumentTemplateSource.SYSTEM, type: DocumentProcessType.CAR_SALE },
        select: { content: true },
      });
      if (systemTemplate) templateContent = systemTemplate.content;
    }

    const template = await prisma.documentTemplate.create({
      data: {
        creatorId,
        name,
        type,
        source: DocumentTemplateSource.USER_SCAN,
        content: templateContent,
        originalFileName: file.name,
        originalMimeType: file.type || null,
        originalScanText: analysis.extractedText || null,
        analysisSchema: {
          fields: analysis.fields,
          labels: analysis.labels,
          engine: ocrResult.engine,
          layout: ocrResult.layout ?? null,
          stylePreserved: Boolean(ocrResult.styledHtml),
        } as Prisma.InputJsonObject,
      },
      select: {
        id: true,
        name: true,
        type: true,
        source: true,
        originalFileName: true,
        analysisSchema: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        template,
        ocrEngine: ocrResult.engine,
        message:
          "Scan analyzed and template created. Review the detected fields before production use.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[upload-scan] error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze uploaded scan";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}