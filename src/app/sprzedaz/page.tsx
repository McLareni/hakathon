"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardUser = {
  id: string;
  imie: string;
  nazwisko: string;
};

type DashboardVehicle = {
  id: string;
  brand: string;
  model: string;
  numerRejestracyjny: string;
  rok: number;
};

type DashboardResponse = {
  user: DashboardUser | null;
  vehicle: DashboardVehicle | null;
};

export default function SprzedazPojazduPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [mileage, setMileage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) throw new Error("Nie udało się załadować danych.");
        const payload = (await response.json()) as DashboardResponse;
        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Błąd ładowania danych.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const handleCreateDocument = async () => {
    if (!data?.user?.id || !data?.vehicle?.id) {
      setError("Brak danych użytkownika lub pojazdu.");
      return;
    }

    if (!price.trim() || !phone.trim() || !mileage.trim()) {
      setError("Uzupełnij wszystkie wymagane pola.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/conditions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: data.user.id,
          participantPhone: phone,
          title: "Udostępnienie danych do umowy sprzedaży pojazdu",
          description: "Wniosek o przekazanie danych kupującego do przygotowania umowy sprzedaży pojazdu.",
          requestedFields: ["imie", "nazwisko", "pesel", "address", "city"],
          vehicleId: data.vehicle.id,
          type: "CAR_SALE",
          salePrice: Number(price),
          mileage: Number(mileage),
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        token?: string;
        processId?: string;
      };

      if (!response.ok || !result.token || !result.processId) {
        throw new Error(result.error ?? "Nie udało się utworzyć zaproszenia.");
      }

      router.push(`/umowa?processId=${result.processId}&userId=${data.user.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nie udało się wysłać zapytania.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // 1. Повертаємо темний фон і центрування для імітації мобільного пристрою
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      {/* 2. Додаємо обмеження ширини (max-w-[414px]), круглі кути та тінь */}
      <main className="relative w-full  bg-[#f5f5f5] min-h-screen sm:min-h-224  overflow-x-hidden overflow-y-auto hide-scrollbar flex flex-col pb-10">
        
        {/* Header Section */}
        <div className="px-6 mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Usługi
          </button>
          
          <h1 className="text-[32px] font-black text-[#1a1e27] tracking-tight leading-tight">
            Sprzedaż pojazdu
          </h1>
        </div>

        {error ? (
          <div className="mx-5 mb-5 rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[13px] font-medium text-[#b91c1c]">
            {error}
          </div>
        ) : null}

        {/* Card 1: Pojazd do sprzedaży */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-5 mb-5">
          <h2 className="text-[17px] font-bold text-[#1a1e27] mb-5">Pojazd do sprzedaży</h2>
          
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9ca3af] font-medium">Numer rejestracyjny</span>
              {loading ? (
                <div className="h-4 w-20 rounded bg-[#eceef1] animate-pulse" />
              ) : (
                <span className="text-[14px] font-bold text-[#1a1e27]">{data?.vehicle?.numerRejestracyjny ?? "-"}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9ca3af] font-medium">Marka i model</span>
              {loading ? (
                <div className="h-4 w-32 rounded bg-[#eceef1] animate-pulse" />
              ) : (
                <span className="text-[14px] font-bold text-[#1a1e27]">{data?.vehicle ? `${data.vehicle.brand} ${data.vehicle.model}` : "-"}</span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9ca3af] font-medium">Rok produkcji</span>
              {loading ? (
                <div className="h-4 w-12 rounded bg-[#eceef1] animate-pulse" />
              ) : (
                <span className="text-[14px] font-bold text-[#1a1e27]">{data?.vehicle?.rok ?? "-"}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Dane sprzedaży */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-5 mb-6">
          <h2 className="text-[17px] font-bold text-[#1a1e27] mb-5">Dane sprzedaży</h2>
          
          <div className="space-y-4">
            <InputField 
              label="Cena sprzedaży (PLN) *" 
              placeholder="np. 45000"
              value={price}
              onChange={setPrice}
              inputMode="numeric"
            />
            <InputField 
              label="Numer telefonu klienta *" 
              placeholder="np. 600123456"
              value={phone}
              onChange={setPhone}
              inputMode="tel"
            />
            <InputField 
              label="Stan licznika *" 
              placeholder="np. 45230"
              value={mileage}
              onChange={setMileage}
              inputMode="numeric"
            />
          </div>

          <p className="text-[12px] text-[#9ca3af] font-medium mt-5 mb-5 leading-relaxed pr-4">
            Po utworzeniu dokumentu będziesz mógł zaprosić kupującego przez link
          </p>

          <button
            type="button"
            onClick={handleCreateDocument}
            disabled={loading || submitting}
            className="w-full bg-[#cb2027] text-white font-bold text-[16px] rounded-2xl py-4 shadow-[0_8px_20px_-6px_rgba(203,32,39,0.5)] hover:bg-[#b91c23] transition-colors active:scale-95 disabled:opacity-60 disabled:hover:bg-[#cb2027]"
          >
            {submitting ? "Wysyłanie..." : "Utwórz dokument"}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f5ff] rounded-2xl p-5 mx-5 mb-8">
          <p className="text-[13px] text-[#2563eb] font-medium leading-relaxed">
            Umowa zostanie wygenerowana automatycznie na podstawie danych z rejestru CEPiK i Twoich danych.
          </p>
        </div>

      </main>
    </div>
  );
}

// Перевикористовуваний компонент поля вводу
function InputField({
  label,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "text" | "numeric" | "tel";
}) {
  return (
    <div>
      <label className="block text-[13px] text-[#9ca3af] font-bold mb-1.5 ml-1">
        {label}
      </label>
      <input 
        type="text" 
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder} 
        className="w-full bg-[#F5F5F5] rounded-xl px-4 py-3.5 text-[15px] font-medium text-[#1a1e27] outline-none focus:ring-2 focus:ring-[#e32129]/20 transition-all placeholder-[#a1a1aa]" 
      />
    </div>
  );
}