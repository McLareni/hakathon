"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { QuickActions } from "@/components/QuickActions";
import { VehicleCarousel } from "@/components/VehicleCarousel";
import { BottomNav } from "@/components/BottomNav";

type DashboardUser = {
  id: string; imie: string; nazwisko: string; city: string;
};

type DashboardVehicle = {
  id: string; brand: string; model: string; numerRejestracyjny: string;
  rok: number; stanLicznika: number | null; numerVIN: string;
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
        <div className="">
          <Header/>
        </div>
        <div className="mt-3">
          <QuickActions />
        </div>
        <div className="mt-3">
          <VehicleCarousel vehicles={vehiclesList} loading={loading} error={error} />
        </div>
        <BottomNav />
      </main>
    </div>
  );
}