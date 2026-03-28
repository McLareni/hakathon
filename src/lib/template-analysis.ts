const MAX_FIELDS = 80;

const POLISH_MAP: Record<string, string> = {
  ą: "a",
  ć: "c",
  ę: "e",
  ł: "l",
  ń: "n",
  ó: "o",
  ś: "s",
  ź: "z",
  ż: "z",
};

const LABEL_STOPWORDS = new Set([
  "dane",
  "strona",
  "strony",
  "sekcja",
  "umowa",
  "dokument",
  "podpis",
  "miejsce",
  "data",
]);

export type TemplateAnalysisResult = {
  extractedText: string;
  fields: string[];
  labels: Record<string, string>;
  generatedContent: string;
};

function normalizePolish(value: string) {
  return value.replace(/[ąćęłńóśźż]/g, (ch) => POLISH_MAP[ch] ?? ch);
}

function cleanupLabel(raw: string) {
  return raw
    .replace(/^\s*\d+[.)-]?\s*/, "")
    .replace(/[._]{3,}\s*$/g, "")
    .replace(/^[-–•*\s]+/, "")
    .replace(/[,:;\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function labelToKey(label: string) {
  const normalized = normalizePolish(label.toLowerCase()).replace(/[^a-z0-9\s]/g, " ");
  const words = normalized
    .split(/\s+/)
    .filter((word) => word.length > 1 && !LABEL_STOPWORDS.has(word))
    .slice(0, 5);

  if (words.length === 0) {
    return "field";
  }

  let key = words.join("_");
  if (!/^[a-z]/.test(key)) {
    key = `field_${key}`;
  }

  return key;
}

function toComparableLabel(label: string) {
  return normalizePolish(label.toLowerCase()).replace(/[^a-z0-9]/g, "");
}

function extractCandidateLabels(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 600);

  const candidates: string[] = [];

  for (const line of lines) {
    if (line.length < 3 || line.length > 140) continue;

    const colonMatch = line.match(/^(.{2,100}?)\s*:\s*$/) ?? line.match(/^(.{2,100}?)\s*:/);
    if (colonMatch) {
      const cleaned = cleanupLabel(colonMatch[1]);
      if (cleaned.length >= 3) candidates.push(cleaned);
    }

    const dottedMatch = line.match(/^(.{2,100}?)\s*[._]{3,}\s*$/);
    if (dottedMatch) {
      const cleaned = cleanupLabel(dottedMatch[1]);
      if (cleaned.length >= 3) candidates.push(cleaned);
    }

    const bracketMatch = line.match(/^(.{2,100}?)\s*\[[^\]]+\]\s*$/);
    if (bracketMatch) {
      const cleaned = cleanupLabel(bracketMatch[1]);
      if (cleaned.length >= 3) candidates.push(cleaned);
    }
  }

  // Also capture inline labels in OCR text like: "Imie: Jan Nazwisko: Kowalski VIN: ..."
  const inlineLabelRegex = /([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9\s]{2,60})\s*:/g;
  for (const match of rawText.matchAll(inlineLabelRegex)) {
    const cleaned = cleanupLabel(match[1] ?? "");
    if (cleaned.length >= 3) {
      candidates.push(cleaned);
    }
  }

  return candidates;
}

function buildDynamicFields(rawText: string) {
  const labels: Record<string, string> = {};
  const fields: string[] = [];
  const keyCounts = new Map<string, number>();
  const seenLabelForms = new Set<string>();

  for (const label of extractCandidateLabels(rawText)) {
    const comparable = toComparableLabel(label);
    if (!comparable || seenLabelForms.has(comparable)) {
      continue;
    }
    seenLabelForms.add(comparable);

    const baseKey = labelToKey(label);
    const count = (keyCounts.get(baseKey) ?? 0) + 1;
    keyCounts.set(baseKey, count);

    const key = count === 1 ? baseKey : `${baseKey}_${count}`;
    if (fields.includes(key)) continue;

    fields.push(key);
    labels[key] = label;

    if (fields.length >= MAX_FIELDS) break;
  }

  return { fields, labels };
}

function buildGenericFallbackFields() {
  const fields = ["pole_1", "pole_2", "pole_3", "pole_4", "pole_5"];
  const labels: Record<string, string> = {
    pole_1: "Pole 1",
    pole_2: "Pole 2",
    pole_3: "Pole 3",
    pole_4: "Pole 4",
    pole_5: "Pole 5",
  };

  return { fields, labels };
}

function buildTemplateContent(fields: string[], labels: Record<string, string>) {
  const rows = fields
    .map((field) => {
      const label = labels[field] ?? field;
      return `<p><strong>${label}:</strong> {{${field}}}</p>`;
    })
    .join("\n");

  return `<section>\n<h2>Dane dokumentu</h2>\n${rows}\n</section>`;
}

export function analyzeScanText(rawText: string): TemplateAnalysisResult {
  const normalized = rawText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  const dynamic = buildDynamicFields(rawText);
  const genericFallback = buildGenericFallbackFields();

  const fields = dynamic.fields.length > 0 ? dynamic.fields : genericFallback.fields;

  const labels: Record<string, string> =
    dynamic.fields.length > 0 ? dynamic.labels : genericFallback.labels;

  return {
    extractedText: normalized,
    fields,
    labels,
    generatedContent: buildTemplateContent(fields, labels),
  };
}