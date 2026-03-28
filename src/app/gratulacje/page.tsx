"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Shield, 
  CreditCard 
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

type DashboardPayload = {
  user: {
    id: string;
  } | null;
};

type ConditionData = {
  id: string;
  type: string;
  title: string;
  status: string;
  createdAt: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    numerRejestracyjny: string;
    rok: number;
  } | null;
  salePrice?: number | null;
};

export default function GratulacjePage() {
  const router = useRouter();
  const [processId, setProcessId] = useState<string | null>(null);

  const [condition, setCondition] = useState<ConditionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProcessId(params.get("processId"));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!processId) {
        setLoading(false);
        return;
      }

      try {
        const dashboardRes = await fetch("/api/dashboard", { cache: "no-store" });
        if (!dashboardRes.ok) {
          throw new Error("Nie udało się pobrać użytkownika");
        }

        const dashboard = (await dashboardRes.json()) as DashboardPayload;
        const userId = dashboard.user?.id;
        if (!userId) {
          throw new Error("Brak użytkownika");
        }

        const conditionRes = await fetch(
          `/api/conditions/${processId}?userId=${userId}`,
          { cache: "no-store" },
        );
        if (!conditionRes.ok) {
          throw new Error("Nie udało się pobrać dokumentu");
        }

        const payload = (await conditionRes.json()) as ConditionData;
        setCondition(payload);
      } catch {
        setCondition(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [processId]);

  const isVehicleDocument =
    condition?.type === "CAR_SALE" || condition?.type === "SALE_PURCHASE";
  const vehicleLabel = condition?.vehicle
    ? `${condition.vehicle.brand} ${condition.vehicle.model}`
    : "—";
  const vehiclePlate = condition?.vehicle?.numerRejestracyjny ?? "—";
  const vehicleYear = condition?.vehicle?.rok ? String(condition.vehicle.rok) : "—";
  const salePrice =
    typeof condition?.salePrice === "number" && Number.isFinite(condition.salePrice)
      ? condition.salePrice
      : null;
  const pccAmount = salePrice != null ? Math.round(salePrice * 0.02 * 100) / 100 : null;
  const formatMoney = (value: number | null) =>
    typeof value === "number"
      ? `${value.toLocaleString("pl-PL", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} PLN`
      : "—";

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      {/* Головний контейнер (Екран телефону) */}
      <main className="relative w-full bg-[#f5f5f5] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col">
        
        {/* Блок контенту, що скролиться */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col p-6 pt-0 pb-10">
          
          {/* Кнопка закриття (X) */}
          <div className="flex justify-end mb-2">
            <button onClick={() => router.push('/')} className="text-[#1a1e27] hover:opacity-60 transition-opacity">
              <X size={32} strokeWidth={2.5} />
            </button>
          </div>

          <h1 className="text-[34px] font-black text-[#1a1e27] tracking-tight mb-6 leading-tight">
            Gratulacje!
          </h1>

          {/* Картка успіху */}
          <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e6f7ef] flex items-center justify-center text-[#16a34a] mb-4">
              <Check size={28} strokeWidth={3} />
            </div>
            <h2 className="text-[17px] font-bold text-[#1a1e27]">
              {loading ? "Ładowanie danych..." : "Dokument został podpisany."}
            </h2>
          </div>

          {/* Картка informacji o dokumencie */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
            <h2 className="text-[16px] font-bold text-[#1a1e27] mb-5">
              {isVehicleDocument ? "Twój nowy pojazd" : "Szczegóły dokumentu"}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#9ca3af] font-medium">
                  {isVehicleDocument ? "Nr rejestracyjny" : "ID dokumentu"}
                </span>
                <span className="text-[#1a1e27] font-bold">
                  {loading ? "—" : isVehicleDocument ? vehiclePlate : (condition?.id ?? "—")}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#9ca3af] font-medium">
                  {isVehicleDocument ? "Marka i model" : "Tytuł"}
                </span>
                <span className="text-[#1a1e27] font-bold text-right ml-4">
                  {loading ? "—" : isVehicleDocument ? vehicleLabel : (condition?.title ?? "—")}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#9ca3af] font-medium">
                  {isVehicleDocument ? "Rok produkcji" : "Status"}
                </span>
                <span className="text-[#1a1e27] font-bold">
                  {loading ? "—" : isVehicleDocument ? vehicleYear : (condition?.status ?? "—")}
                </span>
              </div>
            </div>
          </div>

          {/* Секція "Wymagane działania" */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-2 text-[#e32129]">
              <AlertCircle size={20} strokeWidth={2.5} />
              <h2 className="text-[16px] font-bold text-[#1a1e27]">Wymagane działania</h2>
            </div>
            <p className="text-[12px] text-[#9ca3af] font-medium mb-6">
              Aby zakończyć proces zakupu, wykonaj następujące kroki:
            </p>

            {/* Список дій */}
            <div className="space-y-6">
              <ActionItem 
                icon={<FileText size={22} />} 
                iconBg="bg-[#fef3c7]" 
                iconColor="text-[#d97706]" 
                title="Zarejestruj pojazd na siebie" 
                desc="Udaj się do Wydziału Komunikacji z dokumentami"
                deadline="Termin: 30 dni od daty zakupu"
              />
              <ActionItem 
                icon={<Shield size={22} />} 
                iconBg="bg-[#fce8e9]" 
                iconColor="text-[#e32129]" 
                title="Dodaj ubezpieczenie OC" 
                desc="Ubezpieczenie OC jest obowiązkowe przed jazdą"
              />
              <ActionItem 
                icon={<CreditCard size={22} />} 
                iconBg="bg-[#fce8e9]" 
                iconColor="text-[#e32129]" 
                title="Zapłać podatek (PCC)" 
                desc={`Kwota do zapłaty: ${formatMoney(pccAmount)} (2% od wartości)`}
                deadline="Termin: 14 dni od daty zakupu"
              />
            </div>
          </div>

          {/* Синій інфо-бокс */}
          <div className="bg-[#eff6ff] rounded-[16px] p-4 mb-10">
            <p className="text-[12px] leading-relaxed">
              <span className="font-black text-[#1e40af]">Ważne:</span> <span className="text-[#1e40af] font-medium">Wszystkie powyższe kroki są obowiązkowe. Niezałatwienie ich w terminie może skutkować karami finansowymi.</span>
            </p>
          </div>

          {/* Кнопка переходу */}
          <button 
            onClick={() =>
              router.push(condition?.vehicle?.id ? `/vehicles/${condition.vehicle.id}` : "/")
            }
            className="w-full bg-[#e32129] text-white font-bold text-[16px] rounded-[16px] py-4 shadow-[0_8px_20px_-6px_rgba(227,33,41,0.5)] hover:bg-[#cb2027] transition-colors active:scale-95 mb-6"
          >
            {condition?.vehicle?.id ? "Otwórz ekran samochodu" : "Wróć do strony głównej"}
          </button>

        </div>

        {/* Навігація в самому низу */}
        <BottomNav />
      </main>
    </div>
  );
}

// Допоміжний компонент для пунктів списку дій
function ActionItem({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  deadline,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  deadline?: string;
}) {
  return (
    <div className="flex gap-4">
      <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] font-bold text-[#1a1e27] leading-tight">{title}</h3>
        <p className="text-[12px] text-[#9ca3af] font-medium leading-tight">{desc}</p>
        {deadline && <p className="text-[11px] text-[#9ca3af] font-bold mt-0.5">{deadline}</p>}
      </div>
    </div>
  );
}