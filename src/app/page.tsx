"use client";
import { FileText } from "lucide-react";

import { useEffect, useState } from "react";
import { QuickActions } from "@/components/QuickActions";
import { VehicleCarousel } from "@/components/VehicleCarousel";
import Link from "next/link";

type DashboardUser = {
  id: string;
  imie: string;
  nazwisko: string;
  city: string;
};

type DashboardVehicle = {
  id: string;
  brand: string;
  model: string;
  numerRejestracyjny: string;
  rok: number;
  stanLicznika: number | null;
  numerVIN: string;
};

type DashboardResponse = {
  user: DashboardUser | null;
  vehicle: DashboardVehicle | null;
};

type ConditionVehicle = {
  brand: string;
  model: string;
  numerRejestracyjny: string;
  numerVIN: string;
  rok: number;
};

type Condition = {
  id: string;
  type: string;
  status: string;
  title: string;
  createdAt: string;
  creatorId: string;
  participantId: string | null;
  metadata: Record<string, unknown> | null;
  creator: { id: string; imie: string; nazwisko: string } | null;
  participant: { id: string; imie: string; nazwisko: string } | null;
  vehicle: ConditionVehicle | null;
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return { label: "Podpisana", cls: "bg-[#d7f2e1] text-[#168a47]" };
    case "WAITING_PARTICIPANT":
    case "PARTICIPANT_JOINED":
    case "IN_REVIEW":
      return { label: "Oczekuje", cls: "bg-[#dce8ff] text-[#1f3fd6]" };
    case "CANCELLED":
      return { label: "Anulowana", cls: "bg-[#ffe0e0] text-[#c0392b]" };
    case "EXPIRED":
      return { label: "Wygasła", cls: "bg-[#f3f4f7] text-[#8e8e93]" };
    default:
      return { label: "Szkic", cls: "bg-[#f3f4f7] text-[#8e8e93]" };
  }
}

export default function Home() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Dokumenty" | "Umowy">(
    "Dokumenty",
  );
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [conditionsLoading, setConditionsLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) throw new Error("API failed");
        const payload = await response.json();
        setData(payload);
      } catch {
        setError("Błąd ładowania danych.");
      } finally {
        setLoading(false);
      }
    };
    void loadDashboard();
  }, []);

  useEffect(() => {
    if (!data?.user?.id) return;
    const loadConditions = async () => {
      setConditionsLoading(true);
      try {
        const res = await fetch(`/api/conditions?userId=${data.user!.id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("failed");
        const payload = await res.json();
        setConditions(payload.conditions ?? []);
      } catch {
        // silent — empty list shown
      } finally {
        setConditionsLoading(false);
      }
    };
    void loadConditions();
  }, [data?.user?.id]);  // eslint-disable-line react-hooks/exhaustive-deps

  const vehiclesList = data?.vehicle ? [data.vehicle] : [];

  return (
    <div className="min-h-screen sm:flex sm:justify-center">
      <main className="relative w-full max-w-107.5 min-h-screen bg-[#F5F5F5] overflow-x-hidden pb-24 sm:min-h-230 sm:shadow-[0_20px_70px_rgba(15,23,42,0.15)]">
        <div className="flex flex-col p-5 pt-0">
          <h1 className="text-[26px] font-black tracking-[-0.03em] text-[#1a1f2e]">
            Strona główna
          </h1>

          <div className="flex justify-end gap-4 text-[#e31d3b] mt-4">
            <button
              type="button"
              className="flex items-center gap-1.5 text-[12px] font-semibold"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.2 5.2l3.6 3.6M5 19l3.7-.5L18 9.2l-3.7-3.7-9.3 9.3L5 19z"
                />
              </svg>
              Dostosuj
            </button>
            <Link href="/dodaj">
              <button
                type="button"
                className="flex items-center gap-1.5 text-[12px] font-semibold"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                Dodaj
              </button>
            </Link>
          </div>
        </div>
        <div className="mt-3">
          <QuickActions activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        {activeTab === "Dokumenty" ? (
          <div className="mt-3">
            <VehicleCarousel
              vehicles={vehiclesList}
              loading={loading}
              error={error}
            />
          </div>
        ) : (
          <div className="px-5 pt-4 pb-24 flex flex-col gap-4">
            {conditionsLoading ? (
              <div className="rounded-[22px] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)] animate-pulse">
                <div className="h-6 w-2/3 rounded-xl bg-gray-100 mb-3" />
                <div className="h-4 w-1/3 rounded-xl bg-gray-100 mb-5" />
                <div className="h-20 rounded-2xl bg-gray-100" />
              </div>
            ) : conditions.length === 0 ? (
              <div className="rounded-[22px] bg-white p-8 shadow-[0_8px_28px_rgba(15,23,42,0.08)] text-center">
                <p className="text-[15px] font-medium text-[#98a1b3]">
                  Brak umów
                </p>
              </div>
            ) : (
              conditions.map((cond) => {
                const badge = statusBadge(cond.status);
                const sellerName = cond.creator
                  ? `${cond.creator.imie} ${cond.creator.nazwisko}`
                  : "—";
                const buyerName = cond.participant
                  ? `${cond.participant.imie} ${cond.participant.nazwisko}`
                  : "—";
                return (
                  <article
                    key={cond.id}
                    className="rounded-[22px] border border-[#e9ebf0] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.08)]"
                  >
                    <div className="mb-3.5 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[#1f3fd6] text-white">
                          <FileText className="h-6 w-6 text-white" strokeWidth={1.7} />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-black leading-[1.15] tracking-[-0.01em] text-[#1a1f2e]">
                            {cond.title}
                          </h3>
                          <p className="mt-1 text-[13px] font-medium text-[#98a1b3]">
                            {fmtDate(cond.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-4 py-1.5 text-[14px] font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    {cond.vehicle && (
                      <div className="mt-4 rounded-2xl bg-[#f3f4f7] p-4">
                        <p className="flex items-center gap-2 text-[14px] font-semibold text-[#98a1b3]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#e31d3b]">
                            <path d="M5 12l1.4-3.4A2 2 0 018.2 7h7.6a2 2 0 011.8 1.6L19 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <rect x="3" y="12" width="18" height="5" rx="2" stroke="currentColor" strokeWidth="1.8" />
                            <circle cx="7.5" cy="17.5" r="1.3" fill="currentColor" />
                            <circle cx="16.5" cy="17.5" r="1.3" fill="currentColor" />
                          </svg>
                          Pojazd
                        </p>
                        <div className="mt-2 flex flex-col gap-3">
                          <div className="flex justify-between">
                            <p className="text-[14px] font-black leading-tight text-[#1a1f2e]">
                              {cond.vehicle.brand} {cond.vehicle.model}
                            </p>
                            <p className="text-[18px] font-black leading-none tracking-[-0.02em] text-[#1a1f2e]">
                              {cond.vehicle.numerRejestracyjny}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-[14px] text-[#98a1b3]">{cond.vehicle.rok}</p>
                            <p className="text-[14px] text-[#98a1b3]">
                              VIN: {cond.vehicle.numerVIN.slice(-6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-6 border-b border-[#eceef1] pb-4">
                      <div>
                        <p className="text-[14px] font-medium text-[#98a1b3]">Sprzedający</p>
                        <p className="mt-1 text-[16px] font-black leading-tight text-[#1a1f2e]">
                          {sellerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#98a1b3]">Kupujący</p>
                        <p className="mt-1 text-[16px] font-black leading-tight text-[#1a1f2e]">
                          {buyerName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-[14px] font-medium text-[#98a1b3]">
                        {fmtDate(cond.createdAt)}
                      </p>
                      <Link
                        href={`/umowa?processId=${cond.id}`}
                        className="text-[13px] font-black text-[#e31d3b]"
                      >
                        Zobacz szczegóły →
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
