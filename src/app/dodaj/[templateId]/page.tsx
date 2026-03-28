"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react";

type DashboardPayload = {
  user: {
    id: string;
  } | null;
};

type CreateConditionResponse = {
  error?: string;
  token?: string;
  processId?: string;
};

type TemplateDetail = {
  id: string;
  name: string;
  type: string;
  source: "SYSTEM" | "USER_SCAN";
  content: string;
  originalFileName: string | null;
  analysisSchema: {
    fields: string[];
    labels: Record<string, string>;
    engine: string | null;
    layout: unknown;
    stylePreserved: boolean;
  };
  requirements?: {
    peopleCount?: number;
    requiresSecondParty?: boolean;
    inferredBy?: "ai";
    validFields?: string[];
    parties?: Array<{
      key: string;
      label: string;
      fields: string[];
    }>;
  };
};

type TemplatePayload = {
  template: TemplateDetail;
};

type FieldGroup = {
  title: string;
  fields: string[];
};

function prettifyFieldName(field: string) {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function getInputType(field: string) {
  const normalized = field.toLowerCase();

  const isDateField = /date|registration|confirmedat/.test(normalized);

  if (isDateField) {
    return "date";
  }

  const isNumberField = /price|mileage|rok|licznik/.test(normalized);

  if (isNumberField) {
    return "number";
  }

  if (normalized.includes("phone")) {
    return "tel";
  }

  return "text";
}

function extractFieldsFromContent(content: string) {
  return Array.from(content.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g)).map((match) => match[1]);
}

function groupFields(fields: string[]) {
  const groups: FieldGroup[] = [
    {
      title: "Dane transakcji",
      fields: fields.filter((field) =>
        ["sale", "price", "payment", "date", "confirmed"].some((token) =>
          field.toLowerCase().includes(token),
        ),
      ),
    },
    {
      title: "Sprzedający",
      fields: fields.filter((field) => field.toLowerCase().startsWith("seller")),
    },
    {
      title: "Kupujący",
      fields: fields.filter((field) => field.toLowerCase().startsWith("buyer")),
    },
    {
      title: "Pojazd",
      fields: fields.filter((field) =>
        [
          "brand",
          "model",
          "vin",
          "numer",
          "rok",
          "stan",
          "registration",
        ].some((token) => field.toLowerCase().includes(token)),
      ),
    },
  ];

  const assigned = new Set(groups.flatMap((group) => group.fields));
  const remaining = fields.filter((field) => !assigned.has(field));

  if (remaining.length > 0) {
    groups.push({ title: "Pozostałe dane", fields: remaining });
  }

  return groups.filter((group) => group.fields.length > 0);
}

function dedupeFieldsByLabel(fields: string[], labels: Record<string, string>) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const field of fields) {
    const label = (labels[field] ?? prettifyFieldName(field))
      .toLowerCase()
      .replace(/[^a-z0-9ąćęłńóśźż\s]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!label || seen.has(label)) {
      continue;
    }

    seen.add(label);
    result.push(field);
  }

  return result;
}

function isPodpisField(field: string, labels: Record<string, string>) {
  const keyValue = field.toLowerCase();
  if (keyValue.includes("podpis")) {
    return true;
  }

  const labelValue = (labels[field] ?? "").toLowerCase();
  return labelValue.includes("podpis");
}

export default function TemplateFillPage() {
  const router = useRouter();
  const { templateId } = useParams<{ templateId: string }>();
  const officeOptions = [
    "Urząd Miasta Warszawa",
    "Urząd Miasta Kraków",
    "Urząd Miasta Wrocław",
    "Urząd Miasta Poznań",
    "Urząd Miasta Gdańsk",
  ];

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [participantPhone, setParticipantPhone] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"office" | "signature">("signature");
  const [selectedOffice, setSelectedOffice] = useState(officeOptions[0]);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        const dashboardRes = await fetch("/api/dashboard", { cache: "no-store" });
        if (!dashboardRes.ok) {
          throw new Error("Nie udało się pobrać użytkownika");
        }

        const dashboardPayload = (await dashboardRes.json()) as DashboardPayload;
        const userId = dashboardPayload.user?.id;
        setCurrentUserId(userId ?? null);

        const templateRes = await fetch(
          userId
            ? `/api/document-templates/${templateId}?userId=${userId}`
            : `/api/document-templates/${templateId}`,
          { cache: "no-store" },
        );

        if (!templateRes.ok) {
          const payload = (await templateRes.json()) as { error?: string };
          throw new Error(payload.error ?? "Nie udało się pobrać szablonu");
        }

        const templatePayload = (await templateRes.json()) as TemplatePayload;
        setTemplate(templatePayload.template);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nie udało się pobrać szablonu",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTemplate();
  }, [templateId]);

  const fields = useMemo(() => {
    if (!template) {
      return [];
    }

    // Prefer AI-validated fields; fall back to schema fields then content placeholders.
    const validFields = template.requirements?.validFields;
    if (Array.isArray(validFields) && validFields.length > 0) {
      const uniqueFields = [...new Set(validFields)];
      return uniqueFields;
    }

    const schemaFields = template.analysisSchema.fields;
    const fallbackFields = extractFieldsFromContent(template.content);
    const fields = [...schemaFields, ...fallbackFields];
    const uniqueFields = [...new Set(fields)];
    return uniqueFields;
  }, [template]);

  const hiddenSecondPartyFields = useMemo(() => {
    const parties = template?.requirements?.parties ?? [];
    if (parties.length < 2) {
      return new Set<string>();
    }

    const secondaryParties = parties.slice(1);
    return new Set(
      secondaryParties.flatMap((party) =>
        Array.isArray(party.fields) ? party.fields : [],
      ),
    );
  }, [template]);

  const editableFields = useMemo(() => {
    const labels = template?.analysisSchema.labels ?? {};

    return fields.filter(
      (field) =>
        !hiddenSecondPartyFields.has(field) &&
        !isPodpisField(field, labels),
    );
  }, [fields, hiddenSecondPartyFields, template?.analysisSchema.labels]);

  const uniqueEditableFields = useMemo(() => {
    const labels = template?.analysisSchema.labels ?? {};
    return dedupeFieldsByLabel(editableFields, labels);
  }, [editableFields, template?.analysisSchema.labels]);

  const missingFields = useMemo(
    () => uniqueEditableFields.filter((field) => !(values[field] ?? "").trim()),
    [uniqueEditableFields, values],
  );

  const missingFieldSet = useMemo(() => new Set(missingFields), [missingFields]);

  const groups = useMemo(() => groupFields(uniqueEditableFields), [uniqueEditableFields]);
  const requiresSecondParty = Boolean(template?.requirements?.requiresSecondParty);

  const handleSend = async () => {
    setSubmitAttempted(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    if (missingFields.length > 0) {
      const labels = template?.analysisSchema.labels ?? {};
      const topMissing = missingFields
        .slice(0, 3)
        .map((field) => labels[field] ?? prettifyFieldName(field));
      const suffix = missingFields.length > 3 ? ` (+${missingFields.length - 3})` : "";
      setSubmitError(`Uzupełnij wszystkie wymagane pola: ${topMissing.join(", ")}${suffix}.`);
      return;
    }

    if (!requiresSecondParty) {
      setSending(true);
      router.push("/");
      return;
    }

    if (deliveryMode === "office") {
      setSubmitSuccess(`Wybrano wysyłkę do urzędu: ${selectedOffice}.`);
      return;
    }

    const normalizedPhone = participantPhone.replace(/\s+/g, "");
    if (!normalizedPhone) {
      setSubmitError("Podaj numer telefonu uczestnika.");
      return;
    }

    if (!/^\+?[0-9]{9,15}$/.test(normalizedPhone)) {
      setSubmitError("Numer telefonu ma nieprawidłowy format.");
      return;
    }

    if (!currentUserId) {
      setSubmitError("Nie udało się ustalić użytkownika. Odśwież stronę.");
      return;
    }

    setSending(true);

    try {
      const requestedFields = Array.from(hiddenSecondPartyFields);

      const response = await fetch("/api/conditions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: currentUserId,
          templateId,
          participantPhone: normalizedPhone,
          title: `Prośba o dane do dokumentu: ${template?.name ?? "Dokument"}`,
          description:
            "Uzupełnij i potwierdź swoje dane. Po potwierdzeniu dokument będzie gotowy do dalszego procesu.",
          filledValues: values,
          requestedFields: requestedFields.length > 0 ? requestedFields : ["imie", "nazwisko", "pesel"],
          type: "OTHER",
        }),
      });

      const result = (await response.json()) as CreateConditionResponse;
      if (!response.ok || !result.processId) {
        throw new Error(result.error ?? "Nie udało się utworzyć zapytania.");
      }

      setSubmitSuccess("Zapytanie zostało wysłane. Druga osoba otrzyma SMS i musi potwierdzić dane.");
      router.push("/");
    } catch (submitError) {
      setSubmitError(
        submitError instanceof Error
          ? submitError.message
          : "Nie udało się wysłać zapytania do drugiej osoby.",
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
        <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#e32129]" />
          <p className="text-[14px] font-medium text-[#6b7280]">Ładowanie szablonu...</p>
        </main>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
        <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col p-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
            Wróć
          </button>
          <div className="bg-[#fff1f2] rounded-3xl p-5 flex items-start gap-3 border border-[#fecdd3] text-[#9f1239]">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium leading-relaxed">{error ?? "Nie znaleziono szablonu"}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-8">
          <div className="px-6 pt-5 mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Szablony
            </button>
            <h1 className="text-[30px] font-black text-[#1a1e27] tracking-tight leading-tight">
              {template.name}
            </h1>
            <p className="text-[14px] font-medium text-[#6b7280] mt-2">
              Uzupełnij wszystkie dane dokumentu.
            </p>
          </div>

          <div className="mx-6 mb-6 bg-[#f0f5ff] rounded-2xl p-5 border border-[#dbeafe]">
            <p className="text-[13px] text-[#1C398E] font-medium leading-relaxed">
              Źródło: {template.source === "SYSTEM" ? "szablon systemowy" : "szablon własny"}
              {template.originalFileName ? ` • plik: ${template.originalFileName}` : ""}
            </p>
          </div>

          <div className="mx-6 space-y-5 mb-6">
            {groups.map((group) => (
              <section
                key={group.title}
                className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100"
              >
                <h2 className="text-[16px] font-black text-[#1a1e27] mb-4">{group.title}</h2>
                <div className="space-y-4">
                  {group.fields.map((field) => {
                    const label = template.analysisSchema.labels[field] ?? prettifyFieldName(field);
                    const inputType = getInputType(field);

                    return (
                      <label key={field} className="block">
                        <span className="block text-[13px] font-bold text-[#1a1e27] mb-2">
                          {label}
                        </span>
                        <input
                          type={inputType}
                          value={values[field] ?? ""}
                          onChange={(event) =>
                            setValues((current) => ({
                              ...current,
                              [field]: event.target.value,
                            }))
                          }
                          placeholder={label}
                          className={`w-full bg-[#f9fafb] border rounded-2xl px-4 py-3.5 text-[14px] text-[#1a1e27] font-medium placeholder:text-[#9ca3af] outline-none focus:border-[#e32129] transition-colors ${
                            submitAttempted && missingFieldSet.has(field)
                              ? "border-[#e32129]"
                              : "border-gray-200"
                          }`}
                        />
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}

            {requiresSecondParty ? (
              <section className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <h2 className="text-[16px] font-black text-[#1a1e27] mb-2">Co dalej z dokumentem?</h2>
                <p className="text-[13px] font-medium text-[#6b7280] leading-relaxed mb-4">
                  Ten szablon wymaga danych drugiej strony ({template?.requirements?.peopleCount ?? 2} osoby). Wybierz sposób wysyłki dokumentu.
                </p>

                <div className="grid grid-cols-1 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("office")}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition-colors ${
                      deliveryMode === "office"
                        ? "border-[#e32129] bg-[#fff1f2]"
                        : "border-gray-200 bg-[#f9fafb]"
                    }`}
                  >
                    <span className="block text-[13px] font-bold text-[#1a1e27]">Wyślij do urzędu</span>
                    <span className="block text-[12px] text-[#6b7280] mt-1">Wybierzesz urząd z listy.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode("signature")}
                    className={`w-full text-left rounded-2xl px-4 py-3 border transition-colors ${
                      deliveryMode === "signature"
                        ? "border-[#e32129] bg-[#fff1f2]"
                        : "border-gray-200 bg-[#f9fafb]"
                    }`}
                  >
                    <span className="block text-[13px] font-bold text-[#1a1e27]">Wyślij człowiekowi do podpisu</span>
                    <span className="block text-[12px] text-[#6b7280] mt-1">Podasz numer telefonu uczestnika.</span>
                  </button>
                </div>

                {deliveryMode === "office" ? (
                  <label className="block">
                    <span className="block text-[13px] font-bold text-[#1a1e27] mb-2">Wybierz urząd</span>
                    <select
                      value={selectedOffice}
                      onChange={(event) => setSelectedOffice(event.target.value)}
                      className="w-full bg-[#f9fafb] border border-gray-200 rounded-2xl px-4 py-3.5 text-[14px] text-[#1a1e27] font-medium outline-none focus:border-[#e32129] transition-colors"
                    >
                      {officeOptions.map((office) => (
                        <option key={office} value={office}>
                          {office}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="block">
                    <span className="block text-[13px] font-bold text-[#1a1e27] mb-2">Numer telefonu uczestnika</span>
                    <input
                      type="tel"
                      value={participantPhone}
                      onChange={(event) => setParticipantPhone(event.target.value)}
                      placeholder="np. 600123456"
                      className={`w-full bg-[#f9fafb] border rounded-2xl px-4 py-3.5 text-[14px] text-[#1a1e27] font-medium placeholder:text-[#9ca3af] outline-none focus:border-[#e32129] transition-colors ${
                        submitAttempted && !participantPhone.trim()
                          ? "border-[#e32129]"
                          : "border-gray-200"
                      }`}
                    />
                  </label>
                )}
              </section>
            ) : null}

            {submitError ? (
              <div className="bg-[#fff1f2] rounded-2xl p-4 border border-[#fecdd3] text-[#9f1239]">
                <p className="text-[13px] font-medium leading-relaxed">{submitError}</p>
              </div>
            ) : null}

            {submitSuccess ? (
              <div className="bg-[#ecfdf3] rounded-2xl p-4 border border-[#bbf7d0] text-[#166534]">
                <p className="text-[13px] font-medium leading-relaxed">{submitSuccess}</p>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="w-full bg-[#e32129] text-white rounded-2xl px-5 py-4 text-[15px] font-black tracking-wide hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {sending ? "Wysyłanie..." : "Wyślij"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
