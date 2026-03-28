"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

type SellVehicleUser = {
  id: string;
  imie: string;
  nazwisko: string;
};

type SellVehicleData = {
  id: string;
  brand: string;
  model: string;
  numerRejestracyjny: string;
  rok: number;
};

type SellVehicleResponse = {
  user: SellVehicleUser | null;
  vehicle: SellVehicleData | null;
};

export default function SellVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<SellVehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState("");

  useEffect(() => {
    const loadSellDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/vehicles?id=${id}`);
        if (!response.ok) throw new Error("Nie udało się załadować danych.");
        const payload = (await response.json()) as SellVehicleResponse;
        setData(payload);
      } catch (err: any) {
        setError(err.message || "Błąd ładowania.");
      } finally {
        setLoading(false);
      }
    };

    if (id) void loadSellDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
      <p className="text-gray-400 animate-pulse font-medium">Ładowanie...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-[400px] bg-[#F8F9FA] min-h-screen pb-32 shadow-2xl sm:border-x sm:border-gray-300 overflow-y-auto hide-scrollbar flex flex-col">
        
        {/* Header / Status Bar Spacing */}
        <div className="px-6 pt-10 pb-4">
          <button 
            onClick={() => router.push('/uslugi')}
            className="flex items-center text-[#e32129] font-bold text-[17px] active:opacity-60 transition-opacity"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Usługi
          </button>
          
          <h1 className="text-[34px] font-black tracking-tight mt-6 leading-tight">
            Sprzedaż pojazdu
          </h1>
        </div>

        <div className="px-5 space-y-6">
          
          {/* КАРТКА 1: Pojazd do sprzedaży */}
          <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
            <h2 className="text-[17px] font-extrabold mb-5">Pojazd do sprzedaży</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[#8d8d97] text-[14px] font-medium">Numer rejestracyjny</span>
                <span className="text-[14px] font-bold text-right">{data?.vehicle?.numerRejestracyjny}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[#8d8d97] text-[14px] font-medium">Marka i model</span>
                <span className="text-[14px] font-bold text-right">{data?.vehicle?.brand} {data?.vehicle?.model}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[#8d8d97] text-[14px] font-medium">Rok produkcji</span>
                <span className="text-[14px] font-bold text-right">{data?.vehicle?.rok}</span>
              </div>
            </div>
          </section>

          {/* КАРТКА 2: Dane sprzedaży */}
          <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-50">
            <h2 className="text-[17px] font-extrabold mb-5">Dane sprzedaży</h2>
            
            <div className="mb-6">
              <label className="text-[12px] font-bold text-[#8d8d97] uppercase tracking-wide block mb-2">
                Cena sprzedaży (PLN) *
              </label>
              <input 
                type="number" 
                placeholder="np. 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#f2f2f4] rounded-xl px-4 py-4 text-[17px] font-bold outline-none border-2 border-transparent focus:border-[#e32129]/10 transition-all placeholder:text-[#a7a7b0]"
              />
            </div>

            <p className="text-[12px] text-[#8d8d97] leading-relaxed font-medium mb-6">
              Po utworzeniu dokumentu będziesz mógł zaprosić kupującego przez link
            </p>

            <button 
              className="w-full bg-[#e32129] text-white py-4 rounded-2xl text-[17px] font-bold shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              disabled={!price}
            >
              Utwórz dokument
            </button>
          </section>

          {/* Синя плашка інфо */}
          <div className="bg-[#eef5ff] rounded-2xl p-4 border border-[#d6e4ff] mb-4">
            <p className="text-[#1a56db] text-[13px] leading-snug font-medium">
              Umowa zostanie wygenerowana automatycznie na podstawie danych z rejestru CEPiK i Twoich даних.
            </p>
          </div>
        </div>

        {/* Глобальна навігація */}
        <BottomNav />
      </main>
    </div>
  );
}