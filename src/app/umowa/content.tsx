"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Hourglass, FilePenLine, ChevronLeft, AlertCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

type DashboardUser = {
  id: string;
  imie: string;
  nazwisko: string;
};

type ConditionData = {
  id: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  creator: {
    id: string;
    imie: string;
    nazwisko: string;
    city?: string | null;
  };
  participant: {
    id: string;
    imie: string;
    nazwisko: string;
    city?: string | null;
  } | null;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    numerRejestracyjny: string;
    numerVIN: string;
    rok: number;
  } | null;
  salePrice?: number | null;
  mileage?: number | null;
  signatures?: {
    creatorSignedAt?: string | null;
    participantSignedAt?: string | null;
  };
};

export function UmowaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processId = searchParams.get("processId");
  const userIdFromQuery = searchParams.get("userId");

  const [condition, setCondition] = useState<ConditionData | null>(null);
  const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!processId) {
      setError("Brak ID warunku");
      setLoading(false);
      return;
    }

    const loadCondition = async () => {
      try {
        const dashboardRes = await fetch(
          userIdFromQuery
            ? `/api/dashboard?userId=${userIdFromQuery}`
            : "/api/dashboard",
        );

        if (!dashboardRes.ok) {
          throw new Error("Nie udało się pobrać danych użytkownika");
        }

        const dashboardPayload = (await dashboardRes.json()) as {
          user: DashboardUser | null;
        };

        if (!dashboardPayload.user) {
          throw new Error("Użytkownik nie найден");
        }

        setCurrentUser(dashboardPayload.user);

        const res = await fetch(
          `/api/conditions/${processId}?userId=${dashboardPayload.user.id}`,
        );
        if (!res.ok) {
          const payload = (await res.json()) as { error?: string };
          throw new Error(payload.error ?? "Nie znaleziono warunku");
        }

        const data = (await res.json()) as ConditionData;
        setCondition(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Błąd ładowania");
      } finally {
        setLoading(false);
      }
    };

    void loadCondition();
  }, [processId, userIdFromQuery]);

  const handleSign = async () => {
    if (!condition || !currentUser) return;

    setSigning(true);
    setError(null);

    try {
      const res = await fetch(`/api/conditions/${condition.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Nie udało się podpisać umowy");
      }

      const payload = (await res.json()) as {
        status: string;
        signatures: {
          creatorSignedAt?: string;
          participantSignedAt?: string;
        };
      };

      setCondition((prev) =>
        prev
          ? {
              ...prev,
              status: payload.status,
              signatures: {
                creatorSignedAt: payload.signatures.creatorSignedAt ?? null,
                participantSignedAt: payload.signatures.participantSignedAt ?? null,
              },
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się podpisać");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
        <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10 p-6">
            <div className="h-8 w-2/3 rounded bg-gray-200 mb-4" />
            <div className="h-32 w-full rounded-2xl bg-gray-200" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !condition) {
    return (
      <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
        <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10 p-6">
            <div className="bg-white rounded-2xl p-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-1" />
              <div>
                <p className="font-bold text-[#1a1e27]">{error || "Błąd"}</p>
                <button
                  onClick={() => router.push("/")}
                  className="text-[#e31d3b] font-bold text-sm mt-2"
                >
                  Powrót do strony głównej
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatPrice = (value: number | null | undefined) => {
    if (!value && value !== 0) return "—";
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(value);
  };

  const creatorSigned = Boolean(condition.signatures?.creatorSignedAt);
  const participantSigned = Boolean(condition.signatures?.participantSignedAt);
  const isCreator = condition.creator.id === currentUser?.id;
  const isParticipant = condition.participant?.id === currentUser?.id;
  const currentUserSigned =
    (isCreator && creatorSigned) || (isParticipant && participantSigned);
  const canSign =
    Boolean(condition.participant) &&
    (condition.status === "PARTICIPANT_JOINED" ||
      condition.status === "IN_REVIEW" ||
      condition.status === "COMPLETED") &&
    !currentUserSigned &&
    !signing;

  const statusMessage = (() => {
    if (condition.status === "WAITING_PARTICIPANT") {
      return "Oczekiwanie na potwierdzenie danych przez kupującego";
    }
    if (condition.status === "COMPLETED") {
      return "Umowa podpisana przez obie strony";
    }
    if (condition.status === "IN_REVIEW" || condition.status === "PARTICIPANT_JOINED") {
      if (creatorSigned && !participantSigned) return "Sprzedający podpisał. Oczekiwanie na podpis kupującego";
      if (!creatorSigned && participantSigned) return "Kupujący podpisał. Oczekiwanie na podpis sprzedającego";
      return "Dane potwierdzone. Umowa czeka na podpisy obu stron";
    }
    return "Status umowy";
  })();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10">
          {/* Header */}
          <div className="px-6 mb-6">
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Umowy
            </button>
            <h1 className="text-[28px] font-black text-[#1a1e27] tracking-tight leading-tight">
              {condition.title}
            </h1>
          </div>

          {/* Status Box */}
          <div className="mx-6 mb-6 bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-4 flex items-center gap-3">
              <Hourglass size={20} className="text-[#92400e]" />
              <p className="text-[13px] font-bold text-[#92400e] leading-snug">
                {statusMessage}
              </p>
          </div>

          {/* Contract Card */}
          <div className="mx-6 bg-white rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col">
            <h2 className="text-[17px] font-black text-[#1a1e27] text-center mb-8 uppercase tracking-wider leading-relaxed">
              {condition.type === "SALE_PURCHASE" ? "Umowa kupna-sprzedaży\npojazdu" : condition.title}
            </h2>

            {/* Parties Section */}
            <div className="space-y-6 mb-8">
              <div>
                <p className="text-[15px] font-black text-[#1a1e27] mb-1">Sprzedający:</p>
                <p className="text-[15px] text-[#4b5563]">{condition.creator.imie} {condition.creator.nazwisko}</p>
              </div>
              <div>
                <p className="text-[15px] font-black text-[#1a1e27] mb-1">Kupujący:</p>
                <p className={`text-[15px] ${condition.participant ? 'text-[#4b5563]' : 'text-[#9ca3af]'} italic`}>
                  {condition.participant
                    ? `${condition.participant.imie} ${condition.participant.nazwisko}`
                    : "Oczekiwanie na dane..."}
                </p>
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Vehicle Details */}
            {condition.vehicle && (
              <>
                <div className="space-y-4 mb-8">
                  <p className="text-[15px] font-black text-[#1a1e27] mb-3">Dane pojazdu:</p>
                  <DataRow label="Marka:" value={condition.vehicle.brand} />
                  <DataRow label="Model:" value={condition.vehicle.model} />
                  <DataRow label="Rok:" value={String(condition.vehicle.rok)} />
                  <DataRow label="Nr rej.:" value={condition.vehicle.numerRejestracyjny} />
                  <DataRow label="VIN:" value={condition.vehicle.numerVIN} />
                </div>

                <hr className="border-gray-100 mb-6" />
              </>
            )}

            {/* Price Section */}
            {condition.salePrice && (
              <div className="mb-8">
                <p className="text-[15px] font-black text-[#1a1e27] mb-2">Cena sprzedaży:</p>
                <p className="text-[26px] font-black text-[#e32129]">{formatPrice(condition.salePrice)}</p>
              </div>
            )}

            {/* Legal Text */}
            <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-10">
              Strony oświadczają, że zawarły niniejszą umowę po zapoznaniu się z jej treścią, 
              dobrowolnie i bez przymusu. Sprzedający oświadcza, że pojazd jest wolny od 
              wad prawnych i nie jest obciążony prawami osób trzecich.
            </p>

            {/* Agreement Date */}
            <div className="text-center">
              <p className="text-[12px] text-[#9ca3af] font-medium mb-1">Data zawarcia umowy:</p>
              <p className="text-[15px] font-black text-[#1a1e27]">
                {new Date(condition.createdAt).toLocaleDateString("pl-PL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Signature Button */}
          <div className="px-6 mt-8 mb-24">
            <button 
              onClick={handleSign}
              disabled={!canSign}
              className="w-full bg-[#cb2027] text-white font-bold text-[18px] rounded-[18px] py-4.5 flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(203,32,39,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              <FilePenLine size={22} />
              {signing
                ? "Podpisywanie..."
                : currentUserSigned
                  ? "Podpisano"
                  : condition.status === "WAITING_PARTICIPANT"
                    ? "Oczekiwanie na dane"
                    : "Podpisz umowę"}
            </button>
            {(creatorSigned || participantSigned) && (
              <p className="mt-3 text-center text-[12px] text-[#6b7280]">
                Sprzedający: {creatorSigned ? "podpisano" : "brak podpisu"} | Kupujący: {participantSigned ? "podpisano" : "brak podpisu"}
              </p>
            )}
          </div>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start text-[14px]">
      <span className="text-[#9ca3af] font-medium">{label}</span>
      <span className="text-[#1a1e27] font-bold text-right ml-4">{value}</span>
    </div>
  );
}
