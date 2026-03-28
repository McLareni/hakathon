"use client";

import { useEffect, useMemo, useState } from "react";
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

  const fullName = useMemo(() => 
    data?.user ? `${data.user.imie} ${data.user.nazwisko}` : "Użytkownik", 
  [data]);

  const initials = useMemo(() => {
    if (!data?.user) return "--";
    return `${data.user.imie[0]}${data.user.nazwisko[0]}`.toUpperCase();
  }, [data]);

  const vehiclesList = data?.vehicle ? [data.vehicle] : [];

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans">
      <main className="relative w-full max-w-[400px] bg-[#F8F9FA] min-h-screen pb-24 shadow-2xl sm:border-x sm:border-gray-300 overflow-x-hidden">
        
        <Header fullName={fullName} initials={initials} loading={loading} />
        <QuickActions />
        <VehicleCarousel vehicles={vehiclesList} loading={loading} error={error} />

        <BottomNav />
      </main>
    </div>
  );
}