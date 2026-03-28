const KNOWN_FIELDS: Array<{ key: string; pattern: RegExp; label: string }> = [
  { key: "imie", pattern: /\b(imie|imię|name)\b/i, label: "Imie" },
  {
    key: "nazwisko",
    pattern: /\b(nazwisko|surname|last\s*name)\b/i,
    label: "Nazwisko",
  },
  { key: "pesel", pattern: /\bpesel\b/i, label: "PESEL" },
  { key: "nip", pattern: /\bnip\b/i, label: "NIP" },
  { key: "address", pattern: /\b(adres|address)\b/i, label: "Adres" },
  { key: "city", pattern: /\b(miasto|city)\b/i, label: "Miasto" },
  {
    key: "postCode",
    pattern: /\b(kod\s*pocztowy|postcode|zip)\b/i,
    label: "Kod pocztowy",
  },
  { key: "numerVIN", pattern: /\bvin\b/i, label: "Numer VIN" },
  {
    key: "numerRejestracyjny",
    pattern: /\b(rejestracyjny|nr\s*rej|tablica)\b/i,
    label: "Numer rejestracyjny",
  },
  { key: "price", pattern: /\b(cena|price|kwota)\b/i, label: "Cena" },
  {
    key: "date",
    pattern: /\b(data|date|dnia)\b/i,
    label: "Data",
  },
];

export type TemplateAnalysisResult = {
  extractedText: string;
  fields: string[];
  labels: Record<string, string>;
  generatedContent: string;
};

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
  const normalized = rawText.replace(/\s+/g, " ").trim();
  const labels: Record<string, string> = {};

  const detected = KNOWN_FIELDS.filter((entry) => entry.pattern.test(normalized));

  const fields =
    detected.length > 0
      ? detected.map((entry) => {
          labels[entry.key] = entry.label;
          return entry.key;
        })
      : ["imie", "nazwisko", "pesel", "address", "city"];

  if (detected.length === 0) {
    labels.imie = "Imie";
    labels.nazwisko = "Nazwisko";
    labels.pesel = "PESEL";
    labels.address = "Adres";
    labels.city = "Miasto";
  }

  return {
    extractedText: normalized,
    fields,
    labels,
    generatedContent: buildTemplateContent(fields, labels),
  };
}