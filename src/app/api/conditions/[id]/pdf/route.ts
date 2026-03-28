import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentTemplateSource, Prisma } from "@prisma/client";

type MetadataShape = {
  salePrice?: number | null;
  mileage?: number | null;
  templateId?: string | null;
  participantData?: Record<string, string>;
  filledValues?: Record<string, string>;
  signatures?: {
    creatorSignedAt?: string | null;
    participantSignedAt?: string | null;
  };
};

function parseMetadata(value: Prisma.JsonValue | null): MetadataShape {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as MetadataShape;
}

function intToWords(n: number): string {
  const ones = ["", "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć",
    "dziesięć", "jedenaście", "dwanaście", "trzynaście", "czternaście", "piętnaście",
    "szesnaście", "siedemnaście", "osiemnaście", "dziewiętnaście"];
  const tens = ["", "", "dwadzieścia", "trzydzieści", "czterdzieści", "pięćdziesiąt",
    "sześćdziesiąt", "siedemdziesiąt", "osiemdziesiąt", "dziewięćdziesiąt"];
  const hundreds = ["", "sto", "dwieście", "trzysta", "czterysta", "pięćset",
    "sześćset", "siedemset", "osiemset", "dziewięćset"];

  if (n <= 0) return "";
  let result = "";
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    const milSuffix = millions === 1 ? "milion" : millions <= 4 ? "miliony" : "milionów";
    result += `${intToWords(millions)} ${milSuffix} `;
  }
  if (n >= 1000) {
    const thousands = Math.floor((n % 1000000) / 1000);
    if (thousands > 0) {
      const thuSuffix = thousands === 1 ? "tysiąc" : thousands % 100 >= 5 && thousands % 100 <= 21 ? "tysięcy" : (thousands % 10 >= 2 && thousands % 10 <= 4) ? "tysiące" : "tysięcy";
      result += `${thousands === 1 ? "" : intToWords(thousands) + " "}${thuSuffix} `;
    }
  }
  const rem = n % 1000;
  if (rem >= 100) result += hundreds[Math.floor(rem / 100)] + " ";
  const rem2 = rem % 100;
  if (rem2 > 0) {
    if (rem2 < 20) {
      result += ones[rem2];
    } else {
      result += tens[Math.floor(rem2 / 10)];
      if (rem2 % 10 > 0) result += " " + ones[rem2 % 10];
    }
  }
  return result.trim();
}

function numberToWords(n: number): string {
  if (n <= 0) return "zero złotych 00/100";
  const intPart = Math.floor(n);
  const decPart = Math.round((n - intPart) * 100);
  const cents = decPart > 0 ? String(decPart).padStart(2, "0") + "/100" : "00/100";
  return `${intToWords(intPart)} złotych ${cents}`;
}

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const POLISH_ASCII_MAP: Record<string, string> = {
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

function normalizeLookupKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => POLISH_ASCII_MAP[ch] ?? ch)
    .replace(/[^a-z0-9]/g, "");
}

function renderTemplateHtml(content: string, values: Record<string, string>) {
  const directValues = Object.fromEntries(
    Object.entries(values).map(([key, val]) => [key.toLowerCase(), val]),
  );

  const normalizedValues = Object.fromEntries(
    Object.entries(values).map(([key, val]) => [normalizeLookupKey(key), val]),
  );

  const replaced = content.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_full, rawKey: string) => {
    const raw = String(rawKey ?? "");
    const key = raw.toLowerCase();
    const normalizedKey = normalizeLookupKey(raw);
    const value = directValues[key] ?? normalizedValues[normalizedKey] ?? "—";
    return escapeHtml(value);
  });

  const body = /<\/?[a-z][\s\S]*>/i.test(replaced)
    ? replaced
    : `<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:12px;line-height:1.55;">${escapeHtml(replaced)}</pre>`;

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dokument</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      color: #111;
      background: #fff;
      padding: 28px 32px;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.5;
    }
    @media print {
      body { padding: 12px 16px; }
    }
  </style>
</head>
<body>
${body}
<script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return new NextResponse("userId query parameter is required", { status: 400 });
  }

  const process = await prisma.documentProcess.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      title: true,
      status: true,
      createdAt: true,
      metadata: true,
      creatorId: true,
      participantId: true,
      creator: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
          pesel: true,
          nip: true,
          id_document: true,
          address: true,
          city: true,
          postCode: true,
        },
      },
      participant: {
        select: {
          id: true,
          imie: true,
          nazwisko: true,
          pesel: true,
          nip: true,
          id_document: true,
          address: true,
          city: true,
          postCode: true,
        },
      },
      vehicle: {
        select: {
          brand: true,
          model: true,
          numerRejestracyjny: true,
          numerVIN: true,
          rok: true,
          stanLicznika: true,
          pierwszaRejestracja: true,
        },
      },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          generatedContent: true,
          template: {
            select: {
              content: true,
            },
          },
        },
      },
    },
  });

  if (!process) {
    return new NextResponse("Umowa nie znaleziona", { status: 404 });
  }

  if (process.creator.id !== userId && process.participant?.id !== userId) {
    return new NextResponse("Brak dostępu", { status: 403 });
  }

  const meta = parseMetadata(process.metadata);
  const price = meta.salePrice ?? 0;
  const mileage = meta.mileage ?? process.vehicle?.stanLicznika ?? 0;
  const saleDate = formatDate(process.createdAt);
  const saleCity = process.creator.city ?? "—";

  const s = process.creator;
  const b = process.participant;
  const v = process.vehicle;
  const isVehicleProcess = process.type === "CAR_SALE";

  const participantData = meta.participantData ?? {};
  const filledValues = meta.filledValues ?? {};

  let templateContent: string | null =
    process.documents[0]?.generatedContent ??
    process.documents[0]?.template?.content ??
    null;

  if (!templateContent && meta.templateId) {
    const linkedTemplate = await prisma.documentTemplate.findUnique({
      where: { id: meta.templateId },
      select: { content: true },
    });

    templateContent = linkedTemplate?.content ?? null;
  }

  if (!templateContent) {
    const fallbackTemplate = await prisma.documentTemplate.findFirst({
      where: {
        type: process.type,
        source: DocumentTemplateSource.SYSTEM,
      },
      orderBy: { createdAt: "desc" },
      select: { content: true },
    });

    templateContent = fallbackTemplate?.content ?? null;
  }

  if (templateContent) {
    const values: Record<string, string> = {
      ...filledValues,
      imie: b?.imie ?? participantData.imie ?? "",
      nazwisko: b?.nazwisko ?? participantData.nazwisko ?? "",
      pesel: b?.pesel ?? participantData.pesel ?? "",
      address: b?.address ?? participantData.address ?? "",
      city: b?.city ?? participantData.city ?? "",
      buyer_name: b ? `${b.imie} ${b.nazwisko}` : "",
      buyer_full_name: b ? `${b.imie} ${b.nazwisko}` : "",
      seller_name: `${s.imie} ${s.nazwisko}`,
      seller_full_name: `${s.imie} ${s.nazwisko}`,
      seller_city: s.city ?? "",
      seller_pesel: s.pesel ?? "",
      seller_address: s.address ?? "",
      sale_date: saleDate,
      date: saleDate,
      sale_city: saleCity,
      price: price ? String(price) : "",
      sale_price: price ? String(price) : "",
      sale_price_words: price > 0 ? numberToWords(price) : "",
      mileage: mileage ? String(mileage) : "",
      vehicle_brand: v?.brand ?? "",
      vehicle_model: v?.model ?? "",
      vehicle_vin: v?.numerVIN ?? "",
      vehicle_registration: v?.numerRejestracyjny ?? "",
      vehicle_year: v?.rok ? String(v.rok) : "",
      numer_vin: v?.numerVIN ?? "",
      numer_rejestracyjny: v?.numerRejestracyjny ?? "",
      marka: v?.brand ?? "",
      model: v?.model ?? "",
      rok: v?.rok ? String(v.rok) : "",
    };

    const rendered = renderTemplateHtml(templateContent, values);
    return new NextResponse(rendered, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  if (!isVehicleProcess) {
    const genericHtml = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(process.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; color:#111; background:#fff; padding:28px 32px; max-width:900px; margin:0 auto; line-height:1.5; }
    h1 { font-size: 20px; margin-bottom: 12px; }
    .meta { color:#555; margin-bottom: 18px; }
    .row { margin-bottom: 8px; }
    .label { font-weight: bold; }
  </style>
</head>
<body>
  <h1>${escapeHtml(process.title)}</h1>
  <p class="meta">Data: ${escapeHtml(saleDate)}</p>
  <div class="row"><span class="label">Strona 1:</span> ${escapeHtml(`${s.imie} ${s.nazwisko}`)}</div>
  <div class="row"><span class="label">Strona 2:</span> ${escapeHtml(b ? `${b.imie} ${b.nazwisko}` : "—")}</div>
  <div class="row"><span class="label">Kwota:</span> ${escapeHtml(
    price
      ? price.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " PLN"
      : "—",
  )}</div>
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

    return new NextResponse(genericHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Umowa kupna-sprzedaży – ${v?.brand ?? ""} ${v?.model ?? ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.55;
      color: #111;
      background: #fff;
      padding: 30px 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 15px; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .sub { text-align: center; font-size: 12px; margin-bottom: 24px; }
    h2 { font-size: 12px; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 3px; margin: 18px 0 8px; }
    .parties { display: table; width: 100%; }
    .party { display: table-cell; width: 50%; vertical-align: top; padding-right: 14px; }
    .party + .party { padding-right: 0; padding-left: 14px; border-left: 1px solid #ccc; }
    .party p { margin: 2px 0; }
    .party .label { font-weight: bold; }
    table.vehicle { width: 100%; border-collapse: collapse; }
    table.vehicle tr:nth-child(odd) { background: #f7f7f7; }
    table.vehicle td { padding: 4px 8px; }
    table.vehicle td:first-child { font-weight: bold; width: 44%; }
    ol { padding-left: 16px; margin: 6px 0; }
    ol li { margin-bottom: 4px; }
    .signatures { display: table; width: 100%; margin-top: 52px; }
    .sig-cell { display: table-cell; width: 45%; text-align: center; border-top: 1px solid #333; padding-top: 6px; font-size: 11px; }
    .sig-gap { display: table-cell; width: 10%; }
    @media print {
      body { padding: 15px 20px; }
    }
  </style>
</head>
<body>

  <h1>Umowa kupna-sprzedaży pojazdu</h1>
  <p class="sub">Zawarta dnia <strong>${saleDate}</strong> w <strong>${saleCity}</strong></p>

  <h2>§1 Strony umowy</h2>
  <div class="parties">
    <div class="party">
      <p class="label">SPRZEDAJĄCY:</p>
      <p>Imię i nazwisko: <strong>${s.imie} ${s.nazwisko}</strong></p>
      <p>Adres: ${s.address ?? "—"}</p>
      <p>Kod / Miasto: ${s.postCode ?? "—"} ${s.city}</p>
      <p>PESEL: ${s.pesel}</p>
      <p>NIP: ${s.nip ?? "—"}</p>
      <p>Nr dowodu: ${s.id_document ?? "—"}</p>
    </div>
    <div class="party">
      <p class="label">KUPUJĄCY:</p>
      ${b ? `
      <p>Imię i nazwisko: <strong>${b.imie} ${b.nazwisko}</strong></p>
      <p>Adres: ${b.address ?? "—"}</p>
      <p>Kod / Miasto: ${b.postCode ?? "—"} ${b.city}</p>
      <p>PESEL: ${b.pesel}</p>
      <p>NIP: ${b.nip ?? "—"}</p>
      <p>Nr dowodu: ${b.id_document ?? "—"}</p>
      ` : `<p><em>Dane kupującego niedostępne</em></p>`}
    </div>
  </div>

  <h2>§2 Przedmiot umowy</h2>
  <p>Sprzedający oświadcza, że jest właścicielem niżej opisanego pojazdu i zobowiązuje się go sprzedać Kupującemu:</p>
  <table class="vehicle" style="margin-top:8px;">
    <tr><td>Marka</td><td>${v?.brand ?? "—"}</td></tr>
    <tr><td>Model</td><td>${v?.model ?? "—"}</td></tr>
    <tr><td>Rok produkcji</td><td>${v?.rok ?? "—"}</td></tr>
    <tr><td>Nr rejestracyjny</td><td>${v?.numerRejestracyjny ?? "—"}</td></tr>
    <tr><td>Nr VIN / nadwozia</td><td>${v?.numerVIN ?? "—"}</td></tr>
    <tr><td>Stan licznika</td><td>${mileage ? `${mileage.toLocaleString("pl-PL")} km` : "—"}</td></tr>
    <tr><td>Data pierwszej rejestracji</td><td>${formatDate(v?.pierwszaRejestracja ?? null)}</td></tr>
  </table>

  <h2>§3 Cena i warunki zapłaty</h2>
  <p>Strony ustaliły cenę sprzedaży na kwotę: <strong>${price.toLocaleString("pl-PL", { minimumFractionDigits: 2 })} zł</strong>
  ${price > 0 ? `(słownie: <em>${numberToWords(price)}</em>)` : ""}.
  </p>

  <h2>§4 Oświadczenia stron</h2>
  <ol>
    <li>Sprzedający oświadcza, że pojazd stanowi jego wyłączną własność, jest wolny od wad prawnych oraz praw osób trzecich, nie toczy się żadne postępowanie, którego przedmiotem jest ten pojazd, nie stanowi on również przedmiotu zabezpieczenia.</li>
    <li>Kupujący oświadcza, że stan techniczny pojazdu jest mu znany i przyjmuje pojazd w tym stanie.</li>
    <li>Wydanie pojazdu wraz z dokumentami nastąpiło w dniu podpisania niniejszej umowy.</li>
    <li>Kupujący jest zobowiązany do zarejestrowania pojazdu w terminie 30 dni od daty zawarcia niniejszej umowy.</li>
  </ol>

  <h2>§5 Postanowienia końcowe</h2>
  <p>W sprawach nieuregulowanych niniejszą umową mają zastosowanie przepisy Kodeksu Cywilnego.</p>
  <p style="margin-top:4px;">Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze stron.</p>

  <div class="signatures">
    <div class="sig-cell">
      <p style="font-weight:bold; margin-bottom:2px;">${s.imie} ${s.nazwisko}</p>
      <p style="color:#555;">Podpis Sprzedającego</p>
    </div>
    <div class="sig-gap"></div>
    <div class="sig-cell">
      <p style="font-weight:bold; margin-bottom:2px;">${b ? `${b.imie} ${b.nazwisko}` : ""}</p>
      <p style="color:#555;">Podpis Kupującego</p>
    </div>
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
