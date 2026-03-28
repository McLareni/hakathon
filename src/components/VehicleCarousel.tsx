"use client";

import Link from "next/link";

type DashboardVehicle = {
  id: string;
  brand: string;
  model: string;
  numerRejestracyjny: string;
  rok: number;
  stanLicznika: number | null;
  numerVIN: string;
};

export const VehicleCarousel = ({
  vehicles,
  loading,
  error,
}: {
  vehicles: DashboardVehicle[];
  loading: boolean;
  error: string | null;
}) => {
  return (
    <section className="w-full px-5 pb-32 pt-5">
      {error ? (
        <p className="w-full rounded-xl bg-[#ffe8e8] px-4 py-3 text-sm font-medium text-[#b51a1a]">
          {error}
        </p>
      ) : loading ? (
        <div className="rounded-[20px] bg-white p-5">
          <div className="mb-5 h-6 w-32 rounded-md bg-[#eceef1]" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="mb-1.5 h-3 w-14 rounded bg-[#f0f1f3]" />
                <div className="h-5 w-24 rounded bg-[#eceef1]" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-16 rounded-[14px] bg-[#f3f4f6]" />
        </div>
      ) : vehicles.length > 0 ? (
        vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="rounded-[20px] bg-white px-5 pb-5 pt-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-[#1a1f2e]">Pojazd</h2>
              <Link
                href={`/vehicles/${vehicle.id}`}
                className="text-[12px] font-semibold text-[#e31d3b] flex items-center gap-1"
              >
                Szczegóły
                <svg width="7" height="12" viewBox="0 0 9 16" fill="none">
                  <path d="M1 1l7 7-7 7" stroke="#e31d3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <p className="text-[13px] font-medium uppercase tracking-wide text-[#a5aab6]">Marka</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#1a1f2e]">{vehicle.brand}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[13px] font-medium uppercase tracking-wide text-[#a5aab6]">Model</p>
                <p className="mt-0.5 text-[15px] font-bold text-[#1a1f2e]">{vehicle.model}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[13px] font-medium uppercase tracking-wide text-[#a5aab6]">Rok</p>
                <p className="mt-0.5 text-[15px] font-bold text-[#1a1f2e]">{vehicle.rok}</p>
              </div>
              <div className="flex justify-between" >
                <p className="text-[13px] font-medium uppercase tracking-wide text-[#a5aab6]">VIN</p>
                <p className="mt-0.5 break-all text-[14px] font-bold text-[#1a1f2e]">{vehicle.numerVIN}</p>
              </div>
              <div className="flex justify-between" >
                <p className="text-[13px] font-medium uppercase tracking-wide text-[#a5aab6]">OC/AC</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#1a1f2e]">Aktywne</p>
              </div>
              <div className="flex justify-between">
                <p className="text-[13px] font-medium uppercase tracking-wide text-[#a5aab6]">Kolor</p>
                <p className="mt-0.5 text-[14px] font-bold text-[#1a1f2e]">Srebrny</p>
              </div>
            </div>

            <div className="mt-5 rounded-[14px] py-4">
              <p className="mt-1.5 text-[36px] font-black tracking-[0.06em] text-[#0c0f18]">
                {vehicle.numerRejestracyjny}
              </p>
            </div>
          </article>
        ))
      ) : (
        <p className="w-full rounded-xl bg-white p-5 text-center text-sm font-medium text-[#5f6069]">
          Brak pojazdów
        </p>
      )}
    </section>
  );
};