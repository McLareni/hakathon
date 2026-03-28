"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type InviteProcess = {
  id: string;
  type: string;
  title: string;
  status: string;
  requestedFields: string[];
  creator: { id: string; imie: string; nazwisko: string };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    numerRejestracyjny: string;
    rok: number;
    price: string | null;
  } | null;
};

type CurrentUser = {
  id: string;
  imie: string;
  nazwisko: string;
  pesel: string;
  address: string | null;
  postCode: string;
  city: string;
};

export default function InviteConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [process, setProcess] = useState<InviteProcess | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        const [inviteRes, dashRes] = await Promise.all([
          fetch(`/api/conditions/invite/${token}`),
          fetch("/api/dashboard"),
        ]);
        if (!inviteRes.ok) {
          const { error: msg } = await inviteRes.json() as { error: string };
          throw new Error(msg ?? "Nie znaleziono zaproszenia");
        }
        const inviteData = (await inviteRes.json()) as InviteProcess;
        const dashData = (await dashRes.json()) as { user: CurrentUser | null };
        setProcess(inviteData);
        setUser(dashData.user);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Błąd ładowania");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [token]);

  const handleConfirm = async () => {
    if (!user || !process) return;
    setSubmitting(true);
    try {
      const fullAddress = [user.address, user.postCode, user.city]
        .filter(Boolean)
        .join(", ");
      const res = await fetch(`/api/conditions/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
          participantData: {
            imie: user.imie,
            nazwisko: user.nazwisko,
            pesel: user.pesel,
            address: fullAddress,
          },
        }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json() as { error: string };
        throw new Error(msg ?? "Błąd potwierdzenia");
      }

      router.push(`/umowa?processId=${process.id}&userId=${user.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd potwierdzenia");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!user || !process) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/conditions/invite/${token}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: user.id }),
      });

      if (!res.ok) {
        const { error: msg } = (await res.json()) as { error: string };
        throw new Error(msg ?? "Błąd odrzucenia");
      }

      router.push("/powiadomienia");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Błąd odrzucenia");
    } finally {
      setSubmitting(false);
    }
  };

  const sellerName = process
    ? `${process.creator.imie} ${process.creator.nazwisko}`
    : "—";
  const isVehicleDocument =
    process?.type === "CAR_SALE" ||
    process?.type === "SALE_PURCHASE" ||
    Boolean(process?.vehicle);
  const firstPartyLabel = isVehicleDocument ? "Sprzedający" : "Strona 1";
  const secondPartyLabel = isVehicleDocument ? "Kupujący" : "Strona 2";
  const vehicleName = process?.vehicle
    ? `${process.vehicle.brand} ${process.vehicle.model}`
    : "—";
  const plate = process?.vehicle?.numerRejestracyjny ?? "—";
  const rok = process?.vehicle?.rok?.toString() ?? "—";
  const price = process?.vehicle?.price
    ? `${Number(process.vehicle.price).toLocaleString("pl-PL")} PLN`
    : null;
  const buyerName = user ? `${user.imie} ${user.nazwisko}` : "—";
  const buyerPesel = user?.pesel ?? "—";
  const buyerAddress = user
    ? [user.address, user.postCode, user.city].filter(Boolean).join(", ")
    : "—";

  return (
    <div className="min-h-screen sm:flex sm:justify-center">
      <main className="relative w-full max-w-107.5 min-h-screen bg-[#F5F5F5] overflow-x-hidden flex flex-col sm:shadow-[0_20px_70px_rgba(15,23,42,0.15)]">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <h1 className="text-[32px] font-black tracking-[-0.02em] text-[#1a1f2e]">
            Potwierdzenie
          </h1>
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebebeb] text-[#1a1f2e] active:opacity-60"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#1a1f2e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-4 mb-2 rounded-xl bg-[#fee2e2] px-4 py-3 text-[13px] font-medium text-[#b91c1c]">
            {error}
          </div>
        )}

        <div className="flex-1 px-4 flex flex-col gap-4 pb-4">

          {/* ── SELLER CARD ── */}
          <div className="rounded-[18px] bg-white px-5 py-5 shadow-sm">
            {/* Seller */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1a3c7c]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide mb-0.5">{firstPartyLabel}</p>
                {loading ? (
                  <div className="h-5 w-32 rounded bg-[#eceef1] animate-pulse" />
                ) : (
                  <p className="text-[17px] font-black text-[#1a1f2e]">{sellerName}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            {isVehicleDocument ? (
              <>
                <div className="h-px bg-[#f0f1f3] mb-4" />

                {/* Vehicle info */}
                <p className="text-[11px] font-medium text-[#9ca3af] uppercase tracking-wide mb-3">
                  Dane pojazdu do sprzedaży
                </p>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6b7280]">Pojazd:</span>
                    {loading ? <div className="h-4 w-32 rounded bg-[#eceef1] animate-pulse" /> : <span className="text-[13px] font-bold text-[#1a1f2e]">{vehicleName}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6b7280]">Nr rej.:</span>
                    {loading ? <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" /> : <span className="text-[13px] font-bold text-[#1a1f2e]">{plate}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-[#6b7280]">Rok:</span>
                    {loading ? <div className="h-4 w-16 rounded bg-[#eceef1] animate-pulse" /> : <span className="text-[13px] font-bold text-[#1a1f2e]">{rok}</span>}
                  </div>
                  {(loading || price) && (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#6b7280]">Cena:</span>
                      {loading ? <div className="h-5 w-28 rounded bg-[#eceef1] animate-pulse" /> : <span className="text-[15px] font-black text-[#e31d3b]">{price}</span>}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>

          {/* ── NA CO POTWIERDZASZ ── */}
          <div>
            <h2 className="text-[17px] font-black text-[#1a1f2e] mb-3 px-1">
              Na co potwierdzasz
            </h2>

            {/* Data sharing card */}
            <div className="rounded-[18px] bg-white px-5 py-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6M9 16h6M13 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-5-7z" stroke="#e31d3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 2v7h7" stroke="#e31d3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[14px] font-bold text-[#1a1f2e]">Udostępnienie danych osobowych</p>
              </div>

              <p className="text-[13px] text-[#6b7280] leading-relaxed mb-4">
                {isVehicleDocument
                  ? "Wyrażasz zgodę na przekazanie następujących danych z aplikacji mObywatel sprzedającemu w celu utworzenia umowy kupna-sprzedaży pojazdu:"
                  : "Wyrażasz zgodę na przekazanie następujących danych z aplikacji mObywatel drugiej stronie w celu utworzenia dokumentu:"}
              </p>

              <div className="rounded-xl bg-[#eef3ff] px-4 py-4 mb-4 flex flex-col gap-2.5">
                <div className="flex items-start gap-2">
                  <span className="text-[#1a3c7c] text-[10px] mt-1">●</span>
                  <p className="text-[13px] text-[#1a1f2e]">
                    <span className="font-bold">Imię i nazwisko:</span>{" "}
                    {loading ? <span className="inline-block h-3.5 w-28 rounded bg-[#d1d9f0] align-middle animate-pulse" /> : buyerName}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#1a3c7c] text-[10px] mt-1">●</span>
                  <p className="text-[13px] text-[#1a1f2e]">
                    <span className="font-bold">PESEL:</span>{" "}
                    {loading ? <span className="inline-block h-3.5 w-24 rounded bg-[#d1d9f0] align-middle animate-pulse" /> : buyerPesel}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#1a3c7c] text-[10px] mt-1">●</span>
                  <p className="text-[13px] text-[#1a1f2e]">
                    <span className="font-bold">Adres:</span>{" "}
                    {loading ? <span className="inline-block h-3.5 w-40 rounded bg-[#d1d9f0] align-middle animate-pulse" /> : buyerAddress}
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-xl bg-[#fffbeb] border border-[#fde68a] px-4 py-3 flex gap-2 items-start">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                  <path d="M10.3 3.5L2 18.5h20L13.7 3.5a2 2 0 00-3.4 0z" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 10v4M12 17h.01" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
                <p className="text-[12px] text-[#92400e] leading-relaxed">
                  {isVehicleDocument
                    ? "Upewnij się, że znasz i ufasz sprzedającemu. Dane będą wykorzystane wyłącznie do sporządzenia umowy kupna-sprzedaży."
                    : "Upewnij się, że znasz i ufasz drugiej stronie. Dane będą wykorzystane wyłącznie do sporządzenia dokumentu."}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ── BOTTOM BUTTONS ── */}
        <div className="w-full max-w-107.5 bg-[#f5f5f5] px-4 pt-3 pb-8 border-t border-[#f0f1f3] flex gap-3 sm:border-x sm:border-gray-200 z-50">
          <button
            onClick={handleReject}
            className="flex-1 rounded-[14px] border border-[#d1d5db] bg-white py-4 text-[15px] font-bold text-[#1a1f2e] active:bg-[#f5f5f5] disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? "Trwa..." : "Odrzuć"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || submitting || !user || !process}
            className="flex-1 rounded-[14px] bg-[#e31d3b] py-4 text-[15px] font-bold text-white shadow-sm active:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Wysyłanie…" : "Zatwierdź"}
          </button>
        </div>

      </main>
    </div>
  );
}
