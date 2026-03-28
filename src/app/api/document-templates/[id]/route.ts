import { DocumentTemplateSource, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AnalysisSchema = {
  fields?: string[];
  labels?: Record<string, string>;
  engine?: string;
  layout?: Prisma.JsonValue;
  stylePreserved?: boolean;
};

type PartyGroup = {
  key: string;
  label: string;
  fields: string[];
};

type TemplateRequirements = {
  peopleCount: number;
  requiresSecondParty: boolean;
  parties: PartyGroup[];
  validFields: string[];
  inferredBy: "ai";
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
];
const GEMINI_API_VERSIONS = ["v1", "v1beta"];

type GeminiListModelsResponse = {
  models?: Array<{
    name?: string;
    supportedGenerationMethods?: string[];
  }>;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
};

function buildGeminiRequestBody(prompt: string, includeMimeType: boolean) {
  return JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: includeMimeType
      ? {
          temperature: 0.1,
          responseMimeType: "application/json",
        }
      : {
          temperature: 0.1,
        },
  });
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

async function callGeminiGenerateContent(params: {
  url: string;
  requestBody: string;
}): Promise<
  { ok: true; raw: GeminiGenerateResponse } | { ok: false; status: number; message: string }
> {
  const response = await fetch(params.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY ?? "",
    },
    body: params.requestBody,
  });

  if (response.ok) {
    const raw = (await response.json()) as GeminiGenerateResponse;
    return { ok: true, raw };
  }

  let message = "";
  try {
    const errorPayload = (await response.json()) as {
      error?: { message?: string };
    };
    message = errorPayload.error?.message ?? "";
  } catch {
    message = "";
  }

  return { ok: false, status: response.status, message };
}

async function discoverGeminiModel(apiVersion: string): Promise<string | null> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/${apiVersion}/models`,
    {
      method: "GET",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY ?? "",
      },
    },
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as GeminiListModelsResponse;
  const models = Array.isArray(payload.models) ? payload.models : [];

  const withGenerateContent = models.filter((model) =>
    model.supportedGenerationMethods?.includes("generateContent"),
  );

  const preferred = withGenerateContent.find((model) => {
    const name = model.name ?? "";
    return /gemini-.*flash/i.test(name);
  });

  return preferred?.name ?? withGenerateContent[0]?.name ?? null;
}

function extractPlaceholders(content: string) {
  return Array.from(content.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)).map(
    (match) => match[1],
  );
}

async function inferRequirementsWithGemini(params: {
  templateType: string;
  fields: string[];
  labels: Record<string, string>;
  content: string;
  documentText: string;
}): Promise<TemplateRequirements | null> {
  if (!GEMINI_API_KEY) return null;

  const text = params.documentText;

  const prompt = `
You are a system that converts legal documents into reusable templates.

Your task:
1. Extract ALL variable fields from the document
2. Replace them with {{variable_name}}
3. Return clean template text
4. Return variables as JSON

Rules:
- Use snake_case for variable names
- Use ONLY Polish variable names (ASCII form without diacritics), e.g. sprzedajacy_imie_nazwisko, kupujacy_pesel, cena, data_umowy
- Extract as many variables as possible
- Do NOT skip anything dynamic


Return JSON:
{
  "template": "...",
  "variables": [
    { "name": "sprzedajacy_imie_nazwisko", "example": "Jan Kowalski", "party": "party1" }
  ],
  "peopleCount": 1,
  "requiresSecondParty": false
}
Rules for party:
- party1 = first participant (seller or first side)
- party2 = second participant (buyer or second side)
- If second participant fields exist, include them in variables with party="party2"
- Never skip party2 fields when present

All text and labels in Polish.

Document:
${text}
`;

  const requestBody = buildGeminiRequestBody(prompt, true);
  const compatibilityRequestBody = buildGeminiRequestBody(prompt, false);

  try {
    let raw: GeminiGenerateResponse | null = null;

    for (const apiVersion of GEMINI_API_VERSIONS) {
      for (const model of GEMINI_MODEL_CANDIDATES) {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`;
        let result = await callGeminiGenerateContent({ url, requestBody });

        if (!result.ok && result.status === 400) {
          result = await callGeminiGenerateContent({
            url,
            requestBody: compatibilityRequestBody,
          });
        }

        if (result.ok) {
          raw = result.raw;
          break;
        }

        if (result.status !== 404) {
          console.warn(
            `[Gemini] request failed: status=${result.status} model=${model} apiVersion=${apiVersion} message=${result.message}`,
          );
        }
      }

      if (raw) {
        break;
      }

      const discoveredModel = await discoverGeminiModel(apiVersion);
      if (!discoveredModel) {
        continue;
      }

      const discoveredUrl = `https://generativelanguage.googleapis.com/${apiVersion}/${discoveredModel}:generateContent`;
      let discoveredResult = await callGeminiGenerateContent({
        url: discoveredUrl,
        requestBody,
      });

      if (!discoveredResult.ok && discoveredResult.status === 400) {
        discoveredResult = await callGeminiGenerateContent({
          url: discoveredUrl,
          requestBody: compatibilityRequestBody,
        });
      }

      if (discoveredResult.ok) {
        raw = discoveredResult.raw;
        break;
      }

      if (discoveredResult.status !== 404) {
        console.warn(
          `[Gemini] discovered model request failed: status=${discoveredResult.status} model=${discoveredModel} apiVersion=${apiVersion} message=${discoveredResult.message}`,
        );
      }
    }

    if (!raw) return null;

    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) return null;
    const jsonText = extractJsonObject(text);

    const parsed = JSON.parse(jsonText) as {
      template?: string;
      variables?: Array<{
        name?: string;
        example?: string;
        party?: "party1" | "party2" | string;
      }>;
      peopleCount?: number;
      requiresSecondParty?: boolean;
    };

    const extractedVariables = Array.isArray(parsed.variables)
      ? parsed.variables
          .map((variable) => ({
            name: String(variable?.name ?? "").trim(),
            party: String(variable?.party ?? "party1"),
          }))
          .filter((variable) => Boolean(variable.name))
      : [];

    const validFields = Array.from(
      new Set(extractedVariables.map((variable) => variable.name)),
    );

    const party1Fields = Array.from(
      new Set(
        extractedVariables
          .filter((variable) => variable.party.toLowerCase() !== "party2")
          .map((variable) => variable.name),
      ),
    );

    const party2Fields = Array.from(
      new Set(
        extractedVariables
          .filter((variable) => variable.party.toLowerCase() === "party2")
          .map((variable) => variable.name),
      ),
    );

    const peopleCount = Math.max(
      1,
      Number(
        parsed.peopleCount ??
          (party2Fields.length > 0 || Boolean(parsed.requiresSecondParty) ? 2 : 1),
      ),
    );

    const parties: PartyGroup[] = [
      {
        key: "party1",
        label: "Strona 1",
        fields: party1Fields,
      },
    ];

    if (party2Fields.length > 0 || peopleCount >= 2 || Boolean(parsed.requiresSecondParty)) {
      parties.push({
        key: "party2",
        label: "Strona 2",
        fields: party2Fields,
      });
    }

    const fallbackFields = Array.from(new Set(params.fields));

    return {
      peopleCount,
      requiresSecondParty:
        peopleCount >= 2 || party2Fields.length > 0 || Boolean(parsed.requiresSecondParty),
      validFields: validFields.length > 0 ? validFields : fallbackFields,
      parties,
      inferredBy: "ai",
    };
  } catch (error) {
    console.warn("[Gemini] classification failed", error);
    return null;
  }
}

function parseAnalysisSchema(value: Prisma.JsonValue | null): AnalysisSchema {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as AnalysisSchema;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const userId = request.nextUrl.searchParams.get("userId");

  const template = await prisma.documentTemplate.findUnique({
    where: { id },
    select: {
      id: true,
      creatorId: true,
      name: true,
      type: true,
      source: true,
      content: true,
      originalFileName: true,
      originalMimeType: true,
      originalScanText: true,
      analysisSchema: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const hasAccess =
    template.source === DocumentTemplateSource.SYSTEM ||
    (userId ? template.creatorId === userId : false);

  if (!hasAccess) {
    return NextResponse.json(
      { error: "You do not have access to this template" },
      { status: 403 },
    );
  }

  const analysisSchema = parseAnalysisSchema(template.analysisSchema);
  const fields = Array.isArray(analysisSchema.fields)
    ? analysisSchema.fields
    : [];
  const labels = analysisSchema.labels ?? {};

  const aiRequirements = await inferRequirementsWithGemini({
    templateType: template.type,
    fields,
    labels,
    content: template.content,
    documentText: template.originalScanText ?? template.content,
  });

  const requirements: TemplateRequirements = aiRequirements ?? {
    peopleCount: 1,
    requiresSecondParty: false,
    validFields: fields,
    parties: [],
    inferredBy: "ai",
  };

  return NextResponse.json({
    template: {
      ...template,
      requirements,
      analysisSchema: {
        fields,
        labels,
        engine: analysisSchema.engine ?? null,
        layout: analysisSchema.layout ?? null,
        stylePreserved: Boolean(analysisSchema.stylePreserved),
      },
    },
  });
}
