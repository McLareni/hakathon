"use client";

import { useRouter } from "next/navigation";

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
  const router = useRouter();

  return (
    <section className="pt-8 pb-32 w-full">
      <div className="px-5 mb-4">
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#a7a7b0]">
          Mój pojazd
        </p>
      </div>

      <div className="flex overflow-x-auto gap-4 px-5 pb-4 snap-x snap-mandatory hide-scrollbar">
        {error ? (
          <p className="rounded-xl bg-[#ffe8e8] px-4 py-3 text-sm font-medium text-[#b51a1a] w-full shrink-0">
            {error}
          </p>
        ) : loading ? (
          <div className="w-[85vw] max-w-[320px] shrink-0 snap-center rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="h-6 w-48 rounded bg-[#e2e3e7] mb-2" />
            <div className="h-32 rounded bg-[#f4f4f6]" />
          </div>
        ) : vehicles.length > 0 ? (
          <>
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="w-[85vw] max-w-[320px] shrink-0 snap-center rounded-[28px] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col gap-5"
              >
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 shrink-0 rounded-[16px] bg-[#f2f2f4]" />
                  <div className="flex flex-col items-start gap-1 min-w-0">
                    <p className="text-[17px] font-extrabold leading-none text-[#1b1b1f] truncate w-full">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <span className="inline-flex rounded-lg bg-[#f4f4f6] px-2.5 py-1 text-[12px] font-bold tracking-wider text-[#3f4047]">
                      {vehicle.numerRejestracyjny}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4 px-1 text-sm">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#9c9ca3] mb-0.5">Marka</p>
                    <p className="font-bold text-[#202127] text-[14px] truncate">{vehicle.brand}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#9c9ca3] mb-0.5">Model</p>
                    <p className="font-bold text-[#202127] text-[14px] truncate">{vehicle.model}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#9c9ca3] mb-0.5">Rok</p>
                    <p className="font-bold text-[#202127] text-[14px] truncate">{vehicle.rok}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#9c9ca3] mb-0.5">Kolor</p>
                    <p className="font-bold text-[#202127] text-[14px] truncate">Srebrny</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#9c9ca3] mb-0.5">VIN</p>
                    <p className="font-bold text-[#202127] text-[14px] truncate" title={vehicle.numerVIN}>
                      {vehicle.numerVIN}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[#9c9ca3] mb-0.5">OC/AC</p>
                    <p className="font-bold text-[#202127] text-[14px] truncate">Aktywne</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/vehicles/sell/${vehicle.id}`)}
                  className="mt-1 w-full rounded-2xl bg-[#e32129] py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.98] shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Sprzedaj pojazd
                </button>
              </div>
            ))}
            <div className="w-1 shrink-0"></div>
          </>
        ) : (
          <p className="rounded-xl bg-white p-5 text-sm font-medium text-[#5f6069] w-full text-center shadow-sm shrink-0">
            Brak pojazdów
          </p>
        )}
      </div>
    </section>
  );
};