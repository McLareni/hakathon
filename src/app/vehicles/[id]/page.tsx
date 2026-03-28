"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

type VehicleDetail = {
  id: string;
  brand: string;
  model: string;
  numerRejestracyjny: string;
  rok: number;
  stanLicznika: number | null;
  numerVIN: string;
  formaWlasnosci: string;
  ubezpieczenie: string | null;
  badanieTechniczne: string | null;
  pierwszaRejestracja: string | null;
  dataNabyciaPraw: string | null;
  purchasePrice: number | null;
};

type Owner = {
  id: string;
  imie: string;
  nazwisko: string;
  city: string;
};

type VehicleResponse = {
  vehicle: VehicleDetail | null;
  user: Owner | null;
};

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<VehicleResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [officeDataReceived, setOfficeDataReceived] = useState(false);
  const [plateChoice, setPlateChoice] = useState<"keep" | "new" | null>(null);
  const [generatedPlate, setGeneratedPlate] = useState<string | null>(null);
  const [registrationRequestState, setRegistrationRequestState] = useState<"idle" | "pending" | "approved">("idle");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"blik" | "apple-pay" | "card">("blik");
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "paid">("idle");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [vehicleRes, dashboardRes, actionsRes] = await Promise.all([
          fetch(`/api/vehicles?id=${id}`),
          fetch("/api/dashboard"),
          fetch(`/api/vehicles/${id}/required-actions`),
        ]);

        if (!vehicleRes.ok) throw new Error("failed");

        const payload = (await vehicleRes.json()) as VehicleResponse;
        setData(payload);

        if (dashboardRes.ok) {
          const dashboardPayload = (await dashboardRes.json()) as {
            user: { id: string } | null;
          };
          setCurrentUserId(dashboardPayload.user?.id ?? null);
        } else {
          setCurrentUserId(null);
        }

        // Load persisted state from database
        if (actionsRes.ok) {
          const actionsPayload = (await actionsRes.json()) as {
            state: {
              officeDataReceived?: boolean;
              plateChoice?: "keep" | "new" | null;
              generatedPlate?: string | null;
              registrationRequestState?: "idle" | "pending" | "approved";
              paymentState?: "idle" | "processing" | "paid";
              paymentMethod?: "blik" | "apple-pay" | "card";
              isPaymentModalOpen?: boolean;
            };
          };
          const state = actionsPayload.state;
          if (state.officeDataReceived) setOfficeDataReceived(state.officeDataReceived);
          if (state.plateChoice) setPlateChoice(state.plateChoice);
          if (state.generatedPlate) setGeneratedPlate(state.generatedPlate);
          if (state.registrationRequestState)
            setRegistrationRequestState(state.registrationRequestState);
          if (state.paymentState) setPaymentState(state.paymentState);
          if (state.paymentMethod) setPaymentMethod(state.paymentMethod);
          if (state.isPaymentModalOpen) setIsPaymentModalOpen(state.isPaymentModalOpen);
        }
      } catch {
        setData(null);
        setCurrentUserId(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const v = data?.vehicle;
  const u = data?.user;
  const pccRate = 0.02;
  const pccAmount =
    typeof v?.purchasePrice === "number" && Number.isFinite(v.purchasePrice)
      ? Math.round(v.purchasePrice * pccRate * 100) / 100
      : null;
  const formatMoney = (value: number | null) =>
    typeof value === "number"
      ? `${value.toLocaleString("pl-PL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} PLN`
      : "—";

  const vehicleName = v ? `${v.brand} ${v.model}` : "—";
  const plate = plateChoice === "new" && generatedPlate ? generatedPlate : (v?.numerRejestracyjny ?? "—");
  const ownerName = u ? `${u.imie} ${u.nazwisko}` : "—";
  const mileage = v?.stanLicznika ? `${v.stanLicznika.toLocaleString("pl-PL")} km` : null;

  const fmtDate = (iso: string | null | undefined): string | null =>
    iso ? new Date(iso).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }) : null;

  const now = new Date();
  const insuranceDate = v?.ubezpieczenie ? new Date(v.ubezpieczenie) : null;
  const insuranceActive = insuranceDate ? insuranceDate > now : false;
  const insuranceSoonExpiring = insuranceActive && insuranceDate
    ? (insuranceDate.getTime() - now.getTime()) < 30 * 24 * 60 * 60 * 1000
    : false;

  const inspectionDate = v?.badanieTechniczne ? new Date(v.badanieTechniczne) : null;
  const inspectionValid = inspectionDate ? inspectionDate > now : false;

  const acquisitionDate = v?.dataNabyciaPraw ? new Date(v.dataNabyciaPraw) : null;
  const isMyVehicle = Boolean(currentUserId && u?.id && currentUserId === u.id);
  const recentlyBought = acquisitionDate
    ? now.getTime() - acquisitionDate.getTime() <= 60 * 24 * 60 * 60 * 1000
    : false;
  const showRequiredActions = isMyVehicle && recentlyBought;
  const sellVehicleId = v?.id ?? id;

  const generateRandomPlate = (): string => {
    const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
    const randomLetters = () => letters[Math.floor(Math.random() * letters.length)];
    const digits = Math.floor(100 + Math.random() * 900);
    const prefix = [randomLetters(), randomLetters()].join("");
    const suffix = [randomLetters(), randomLetters()].join("");
    return `${prefix} ${digits}${suffix}`;
  };

  useEffect(() => {
    if (!showRequiredActions) {
      setOfficeDataReceived(false);
      setPlateChoice(null);
      setGeneratedPlate(null);
      setRegistrationRequestState("idle");
      setIsPaymentModalOpen(false);
      setPaymentMethod("blik");
      setPaymentState("idle");
      return;
    }

    // Mock backend flow: office data arrives automatically after a short wait.
    const timeout = window.setTimeout(() => {
      setOfficeDataReceived(true);
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [showRequiredActions, id]);

  const saveActionsState = async (newState: {
    officeDataReceived?: boolean;
    plateChoice?: "keep" | "new" | null;
    generatedPlate?: string | null;
    registrationRequestState?: "idle" | "pending" | "approved";
    paymentState?: "idle" | "processing" | "paid";
    paymentMethod?: "blik" | "apple-pay" | "card";
    isPaymentModalOpen?: boolean;
  }) => {
    if (!id) return;
    try {
      await fetch(`/api/vehicles/${id}/required-actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newState),
      });
    } catch (error) {
      console.error("Failed to save actions state:", error);
    }
  };

  const handleSelectPlateChoice = (choice: "keep" | "new") => {
    setPlateChoice(choice);
    if (choice === "new") {
      setGeneratedPlate((prev) => prev ?? generateRandomPlate());
    } else if (choice === "keep") {
      setGeneratedPlate(null);
    }
    if (registrationRequestState !== "idle") {
      setRegistrationRequestState("idle");
    }
    saveActionsState({ 
      plateChoice: choice,
      ...(choice === "keep" ? { generatedPlate: null } : {})
    });
  };

  const handleSendRegistrationRequest = () => {
    if (!officeDataReceived || !plateChoice || registrationRequestState === "pending") return;

    setRegistrationRequestState("pending");
    saveActionsState({ registrationRequestState: "pending" });

    // Mock backend response from the office.
    window.setTimeout(() => {
      setRegistrationRequestState("approved");
      saveActionsState({ registrationRequestState: "approved" });
    }, 4000);
  };

  const handleOpenPaymentModal = () => {
    if (paymentState === "paid") return;
    setIsPaymentModalOpen(true);
    saveActionsState({ isPaymentModalOpen: true });
  };

  const handleConfirmPayment = () => {
    if (paymentState === "processing" || paymentState === "paid") return;
    setPaymentState("processing");
    saveActionsState({ paymentState: "processing" });

    // Mock successful payment processing.
    window.setTimeout(() => {
      setPaymentState("paid");
      setIsPaymentModalOpen(false);
      saveActionsState({ paymentState: "paid", isPaymentModalOpen: false });
    }, 4000);
  };

  return (
    <div className="min-h-screen sm:flex sm:justify-center">
      <main className="relative w-full max-w-107.5 min-h-screen bg-[#F5F5F5] overflow-x-hidden pb-28 sm:shadow-[0_20px_70px_rgba(15,23,42,0.15)]">

        {/* ── HEADER ── */}
        <div className="sticky top-0 z-40 bg-[#F5F5F5] px-5 pb-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[#e31d3b] font-semibold text-[15px]"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
              <path d="M8 1L1 8L8 15" stroke="#e31d3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Strona główna
          </button>
        </div>

        <div className="px-4 flex flex-col gap-4">

          {/* ── BLUE LICENSE CARD ── */}
          <div className="rounded-[22px] bg-[#1a3c7c] px-6 py-5 shadow-md">
            <p className="text-center text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70 mb-1">
              Numer rejestracyjny
            </p>
            {loading ? (
              <div className="h-10 w-40 mx-auto rounded-lg bg-white/20 animate-pulse mb-2" />
            ) : (
              <p className="text-center text-[38px] font-black tracking-[0.08em] text-white leading-tight mb-1">
                {plate}
              </p>
            )}
            {loading ? (
              <div className="h-5 w-32 mx-auto rounded bg-white/20 animate-pulse" />
            ) : (
              <p className="text-center text-[15px] font-medium text-white/80">{vehicleName}</p>
            )}
          </div>

          {/* ── WYMAGANE DZIAŁANIA ── */}
          {showRequiredActions && (
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#e31d3b] shrink-0">
                <circle cx="12" cy="12" r="10" stroke="#e31d3b" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="#e31d3b" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <h2 className="text-[15px] font-bold text-[#1a1f2e]">Wymagane działania</h2>
            </div>
            <p className="text-[12px] text-[#6b7280] mb-4">
              Aby zakończyć proces zakupu, wykonaj poniższe kroki
            </p>

            {/* Action 1 */}
            <div className={`mb-3 rounded-[14px] border p-4 ${
              officeDataReceived
                ? "border-[#dcfce7] bg-[#f0fdf4]"
                : "border-[#fff0df] bg-[#fffbf5]"
            }`}>
              <div className="flex gap-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  officeDataReceived ? "bg-[#dcfce7]" : "bg-[#fff0df]"
                }`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4M7.8 4H16.2C17.8 4 19 5.2 19 6.8V20l-7-3-7 3V6.8C5 5.2 6.2 4 7.8 4z" stroke={officeDataReceived ? "#16a34a" : "#f59e0b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-bold text-[#1a1f2e]">Wyrejestrowanie pojazdu</p>
                    {officeDataReceived ? (
                      <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                        Otrzymane
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#fff0df] px-2 py-0.5 text-[10px] font-semibold text-[#f59e0b]">
                        Oczekiwanie
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {officeDataReceived
                      ? "Auto zostało zdjęte z rejestracji poprzedniego właściciela. Możesz przejść do przerejestrowania na nową osobę."
                      : "Czekamy na potwierdzenie wyrejestrowania pojazdu przez urząd. Ten krok zakończy się automatycznie."}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-[#f59e0b]">
                    Termin: 30 dni od daty zakupu
                  </p>
                </div>
              </div>
            </div>

            {/* Action 2 */}
            <div className={`mb-3 rounded-[14px] border p-4 transition-opacity ${
              registrationRequestState === "approved"
                ? "border-[#dcfce7] bg-[#f0fdf4]"
                : officeDataReceived
                ? "border-[#fff0df] bg-[#fffbf5]"
                : "border-[#f3f4f6] bg-[#fafafa] opacity-60"
            }`}>
              <div className="flex gap-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  registrationRequestState === "approved"
                    ? "bg-[#dcfce7]"
                    : officeDataReceived ? "bg-[#fff0df]" : "bg-[#f3f4f6]"
                }`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4M7.8 4H16.2C17.8 4 19 5.2 19 6.8V20l-7-3-7 3V6.8C5 5.2 6.2 4 7.8 4z" stroke={registrationRequestState === "approved" ? "#16a34a" : officeDataReceived ? "#f59e0b" : "#9ca3af"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-[#1a1f2e]">Rejestracja na nowego właściciela</p>
                    {registrationRequestState === "approved" ? (
                      <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                        Zaakceptowano
                      </span>
                    ) : registrationRequestState === "pending" ? (
                      <span className="rounded-full bg-[#fff0df] px-2 py-0.5 text-[10px] font-semibold text-[#f59e0b]">
                        Wysłano
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    {officeDataReceived
                      ? "Możesz teraz rozpocząć rejestrację pojazdu na inną osobę (kupującego)."
                      : "Ten krok odblokuje się po wyrejestrowaniu pojazdu przez urząd."}
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-[#f59e0b]">
                    Termin: 30 dni od daty zakupu
                  </p>

                  {officeDataReceived && (
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectPlateChoice("keep")}
                        disabled={registrationRequestState === "approved"}
                        className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
                          registrationRequestState === "approved"
                            ? "border-[#dcfce7] bg-[#f0fdf4] text-[#16a34a] cursor-not-allowed"
                            : plateChoice === "keep"
                            ? "border-[#e31d3b] bg-[#fff1f2] text-[#e31d3b]"
                            : "border-[#e5e7eb] bg-white text-[#1a1f2e]"
                        }`}
                      >
                        Zostawiam obecny numer: {v?.numerRejestracyjny ?? "—"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectPlateChoice("new")}
                        disabled={registrationRequestState === "approved"}
                        className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
                          registrationRequestState === "approved"
                            ? "border-[#dcfce7] bg-[#f0fdf4] text-[#16a34a] cursor-not-allowed"
                            : plateChoice === "new"
                            ? "border-[#e31d3b] bg-[#fff1f2] text-[#e31d3b]"
                            : "border-[#e5e7eb] bg-white text-[#1a1f2e]"
                        }`}
                      >
                        Weź nowy losowy numer
                        {generatedPlate ? `: ${generatedPlate}` : ""}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSendRegistrationRequest}
                disabled={!officeDataReceived || !plateChoice || registrationRequestState === "pending" || registrationRequestState === "approved"}
                className="mt-3 w-full rounded-[10px] bg-[#e31d3b] py-2.5 text-[13px] font-bold text-white disabled:bg-[#d1d5db] disabled:text-[#6b7280]"
              >
                {registrationRequestState === "pending"
                  ? "Wysyłanie do urzędu..."
                  : registrationRequestState === "approved"
                    ? "Zatwierdzone przez urząd"
                    : "Zarejestruj na kupującego"}
              </button>
            </div>

            {/* Action 3 */}
            <div className="mb-3 rounded-[14px] border border-[#fee2e2] bg-[#fff8f8] p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fee2e2]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C12 22 3 18 3 11V5L12 2L21 5V11C21 18 12 22 12 22Z" stroke="#e31d3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#1a1f2e]">Ubezpieczenie OC</p>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    Ubezpieczenie OC jest obowiązkowe po zakupie pojazdu. Trzeba zgłosić się do ubezpieczalni, aby dopełnić formalności.
                  </p>
                  <p className="mt-2 text-[11px] font-medium text-[#e31d3b]">
                    Przypomnienie: na dopełnienie formalności masz tylko 1 miesiąc od daty zakupu.
                  </p>
                </div>
              </div>
            </div>

            {/* Action 4 */}
            <div className={`rounded-[14px] border p-4 ${paymentState === "paid" ? "border-[#dcfce7] bg-[#f0fdf4]" : "border-[#fee2e2] bg-[#fff8f8]"}`}>
              <div className="flex gap-3 mb-3">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${paymentState === "paid" ? "bg-[#dcfce7]" : "bg-[#fee2e2]"}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 8.5h20M2 15.5h20M7 3L5 21M12 3l-1 18M17 3l-2 18" stroke={paymentState === "paid" ? "#16a34a" : "#e31d3b"} strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-[#1a1f2e]">Zapłać podatek od czynności cywilnoprawnych (PCC)</p>
                    {paymentState === "paid" ? (
                      <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-semibold text-[#16a34a]">
                        Opłacone
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    Kwota do zapłaty: {formatMoney(pccAmount)} (2% od wartości pojazdu)
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-[#e31d3b]">
                    Termin: 14 dni od daty zakupu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenPaymentModal}
                disabled={paymentState === "paid"}
                className="w-full rounded-[10px] bg-[#e31d3b] py-2.5 text-[13px] font-bold text-white disabled:bg-[#d1d5db] disabled:text-[#6b7280]"
              >
                {paymentState === "paid" ? "Podatek opłacony" : "Zapłać teraz"}
              </button>
            </div>
          </section>
          )}

          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 sm:items-center">
              <div className="w-full max-w-md rounded-[20px] bg-white p-5 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-[#1a1f2e]">Opłać podatek PCC</h3>
                  <button
                    type="button"
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="rounded-md px-2 py-1 text-[12px] font-semibold text-[#6b7280]"
                  >
                    Zamknij
                  </button>
                </div>

                <p className="text-[13px] text-[#6b7280]">
                  Kwota: <span className="font-bold text-[#1a1f2e]">{formatMoney(pccAmount)}</span>
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("blik")}
                    className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-semibold ${
                      paymentMethod === "blik"
                        ? "border-[#e31d3b] bg-[#fff1f2] text-[#e31d3b]"
                        : "border-[#e5e7eb] bg-white text-[#1a1f2e]"
                    }`}
                  >
                    BLIK
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("apple-pay")}
                    className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-semibold ${
                      paymentMethod === "apple-pay"
                        ? "border-[#e31d3b] bg-[#fff1f2] text-[#e31d3b]"
                        : "border-[#e5e7eb] bg-white text-[#1a1f2e]"
                    }`}
                  >
                    Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-semibold ${
                      paymentMethod === "card"
                        ? "border-[#e31d3b] bg-[#fff1f2] text-[#e31d3b]"
                        : "border-[#e5e7eb] bg-white text-[#1a1f2e]"
                    }`}
                  >
                    Karta płatnicza
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-[#f8fafc] px-3 py-2 text-[11px] text-[#64748b]">
                  Metoda demonstracyjna: {paymentMethod === "blik" ? "BLIK" : paymentMethod === "apple-pay" ? "Apple Pay" : "Karta płatnicza"}
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={paymentState === "processing"}
                  className="mt-4 w-full rounded-[10px] bg-[#e31d3b] py-2.5 text-[13px] font-bold text-white disabled:bg-[#d1d5db] disabled:text-[#6b7280]"
                >
                  {paymentState === "processing" ? "Przetwarzanie płatności..." : "Potwierdź i zapłać"}
                </button>
              </div>
            </div>
          )}

          {/* ── DANE PODSTAWOWE ── */}
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1f2e] mb-4">Dane podstawowe</h2>
            <div className="flex flex-col gap-3.5">
              <InfoRow label="Marka" value={v?.brand} loading={loading} />
              <InfoRow label="Model" value={v?.model} loading={loading} />
              <InfoRow label="Rok produkcji" value={v?.rok?.toString()} loading={loading} />
              <InfoRow label="VIN" value={v?.numerVIN} loading={loading} mono />
            </div>
          </section>

          {/* ── UBEZPIECZENIE ── */}
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1f2e] mb-1">Ubezpieczenie</h2>
            {!insuranceActive && !loading && (
              <p className="text-[12px] text-[#9ca3af] mb-4">
                Proszę zaktualizować informacje o swoim ubezpieczeniu samochodowym w firmie ubezpieczeniowej.
              </p>
            )}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b7280]">Status</span>
                {loading ? (
                  <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" />
                ) : insuranceActive ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#1a1f2e]">Aktywne</span>
                    {insuranceSoonExpiring && (
                      <span className="flex items-center gap-1 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-medium text-[#f59e0b]">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path d="M12 9v4M12 17h.01M10.3 3.5L2 18.5h20L13.7 3.5a2 2 0 00-3.4 0z" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Wkrótce wygasa
                      </span>
                    )}
                    {!insuranceSoonExpiring && (
                      <span className="flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[11px] font-medium text-[#22c55e]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Aktualne
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#e31d3b]">{insuranceDate ? "Wygasłe" : "Brak"}</span>
                    <span className="flex items-center gap-1 rounded-full bg-[#fee2e2] px-2 py-0.5 text-[11px] font-medium text-[#e31d3b]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v4M12 17h.01M10.3 3.5L2 18.5h20L13.7 3.5a2 2 0 00-3.4 0z" stroke="#e31d3b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ostrzeżenie
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b7280]">Data ważności</span>
                {loading ? (
                  <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" />
                ) : (
                  <span className="text-[13px] font-semibold text-[#1a1f2e]">{fmtDate(v?.ubezpieczenie) ?? "—"}</span>
                )}
              </div>
            </div>
            <button className="w-full rounded-[10px] bg-[#e31d3b] py-2.5 text-[13px] font-bold text-white">
              Zaktualizować
            </button>
          </section>

          {/* ── PRZEGLĄD TECHNICZNY ── */}
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1f2e] mb-4">Przegląd techniczny</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b7280]">Status</span>
                {loading ? (
                  <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" />
                ) : inspectionValid ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#1a1f2e]">Aktualne</span>
                    <span className="flex items-center gap-1 rounded-full bg-[#f0fdf4] px-2 py-0.5 text-[11px] font-medium text-[#22c55e]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Aktualne
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#e31d3b]">{inspectionDate ? "Nieważne" : "Brak"}</span>
                    <span className="flex items-center gap-1 rounded-full bg-[#fee2e2] px-2 py-0.5 text-[11px] font-medium text-[#e31d3b]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v4M12 17h.01M10.3 3.5L2 18.5h20L13.7 3.5a2 2 0 00-3.4 0z" stroke="#e31d3b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ostrzeżenie
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b7280]">Data następnego przeglądu</span>
                {loading ? (
                  <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" />
                ) : (
                  <span className="text-[13px] font-semibold text-[#1a1f2e]">{fmtDate(v?.badanieTechniczne) ?? "—"}</span>
                )}
              </div>
            </div>
          </section>

          {/* ── WŁASNOŚĆ ── */}
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1f2e] mb-4">Własność</h2>
            <div className="flex flex-col gap-3">
              <InfoRow label="Forma własności" value={v?.formaWlasnosci} loading={loading} />
              <InfoRow label="Właściciel" value={ownerName} loading={loading} />
            </div>
          </section>

          {/* ── PRZEBIEG ── */}
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1f2e] mb-4">Przebieg</h2>
            <InfoRow label="Stan licznika" value={mileage ?? undefined} loading={loading} />
          </section>

          {/* ── INFORMACJE O REJESTRACJI ── */}
          <section className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
            <h2 className="text-[15px] font-bold text-[#1a1f2e] mb-1">Informacje o rejestracji</h2>
            <p className="text-[12px] text-[#9ca3af] mb-4">
              Proszę zaktualizować informacje o swoim ubezpieczeniu samochodowym w firmie ubezpieczeniowej.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b7280]">Pierwsza rejestracja</span>
                {loading ? (
                  <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" />
                ) : fmtDate(v?.pierwszaRejestracja) ? (
                  <span className="text-[13px] font-semibold text-[#1a1f2e]">{fmtDate(v?.pierwszaRejestracja)}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#9ca3af]">Brak danych</span>
                    <span className="flex items-center gap-1 rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-medium text-[#f59e0b]">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path d="M12 9v4M12 17h.01M10.3 3.5L2 18.5h20L13.7 3.5a2 2 0 00-3.4 0z" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Ostrzeżenie
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b7280]">Data nabycia praw</span>
                {loading ? (
                  <div className="h-4 w-24 rounded bg-[#eceef1] animate-pulse" />
                ) : (
                  <span className="text-[13px] font-semibold text-[#1a1f2e]">{fmtDate(v?.dataNabyciaPraw) ?? "Brak danych"}</span>
                )}
              </div>
            </div>
          </section>

          {/* ── AKCJE ── */}
          <section className="flex flex-col gap-3 pb-2">
            <button
              onClick={() => router.push(sellVehicleId ? `/sprzedaz?vehicleId=${encodeURIComponent(sellVehicleId)}` : "/sprzedaz")}
              className="flex items-center justify-center gap-2 w-full rounded-[14px] bg-[#e31d3b] py-4 text-[14px] font-bold text-white shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white"/>
              </svg>
              Sprzedaj pojazd
            </button>
          </section>

        </div>

        <BottomNav />
      </main>
    </div>
  );
}

/* ── helper component ── */
function InfoRow({
  label,
  value,
  loading,
  mono,
}: {
  label: string;
  value?: string | null;
  loading: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[13px] text-[#6b7280] shrink-0">{label}</span>
      {loading ? (
        <div className="h-4 w-28 rounded bg-[#eceef1] animate-pulse" />
      ) : (
        <span className={`text-[13px] font-semibold text-[#1a1f2e] text-right ${mono ? "font-mono tracking-tight text-[12px]" : ""}`}>
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}
