"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { VehicleCarousel } from "@/components/VehicleCarousel";
import { BottomNav } from "@/components/BottomNav";

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

export default function Home() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const vehiclesList = data?.vehicle ? [data.vehicle] : [];

  return (
    <div className="min-h-screen sm:flex sm:justify-center">
      <main className="relative w-full max-w-107.5 min-h-screen bg-[#F5F5F5] overflow-x-hidden pb-24 sm:min-h-230 sm:shadow-[0_20px_70px_rgba(15,23,42,0.15)]">
        <div className="flex flex-col p-5 py-0">
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
          </div>
        </div>
        <div className="mt-3">
          <QuickActions />
        </div>
        <div className="mt-3">
          <VehicleCarousel
            vehicles={vehiclesList}
            loading={loading}
            error={error}
          />
        </div>
        <BottomNav />
      </main>
    </div>
  );
}

// Перевикористовуваний компонент картки
function TemplateCard({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button className="bg-white rounded-[24px] p-5 flex flex-col items-start justify-start min-h-[145px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:bg-gray-50 active:scale-[0.98] transition-all text-left">
      <div className="w-[42px] h-[42px] rounded-[12px] bg-[#fce8e9] flex items-center justify-center text-[#e32129] mb-4">
        {icon}
      </div>
      <span className="text-[15px] font-bold text-[#1a1e27] leading-[1.3] pr-2">
        {title}
      </span>
    </button>
  );
}
