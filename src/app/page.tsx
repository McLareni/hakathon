"use client";

import { useEffect, useMemo, useState } from "react";

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

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName && !lastName) {
    return "--";
  }
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export default function Home() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("API request failed");
        }

        const payload = (await response.json()) as DashboardResponse;
        setData(payload);
      } catch {
        setError("Не вдалося завантажити дані.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const fullName = useMemo(() => {
    if (!data?.user) {
      return "Користувач";
    }
    return `${data.user.imie} ${data.user.nazwisko}`;
  }, [data]);

  const initials = useMemo(
    () => getInitials(data?.user?.imie, data?.user?.nazwisko),
    [data?.user?.imie, data?.user?.nazwisko],
  );

  return (
    <div className="flex min-h-screen items-start justify-center bg-[#d9d9dc] px-2 py-0 sm:py-6">
      <main className="relative flex min-h-screen w-full max-w-[390px] flex-col overflow-hidden border border-[#3f3f42] bg-[#ececee] sm:min-h-[844px] sm:rounded-[10px]">
        <section className="h-12 border-b border-[#6a6a70] bg-[#e2e2e4] px-4 pt-2 text-[#1f1f22]">
          <div className="flex items-center justify-between text-[18px] font-semibold">
            <span>14:32</span>
            <span className="h-[10px] w-[18px] rounded-[3px] bg-[#101014]" />
          </div>
        </section>

        <section className="px-4 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="h-6 w-6 rounded-md bg-[#e32129]" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e32129] text-xs font-bold text-white">
              {initials}
            </div>
          </div>

          <p className="text-[28px] font-semibold leading-none text-[#18181b]">
            {loading ? "..." : fullName}
          </p>
          <p className="mt-1 text-sm text-[#8d8d97]">День добрий,</p>
        </section>

        <section className="px-4 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#a7a7b0]">
            Szybkie akcje
          </p>
          <div className="grid grid-cols-3 gap-3">
            {["Dowod osobisty", "Dokumenty", "Platnosci"].map((label) => (
              <div key={label} className="rounded-2xl bg-[#f5f5f7] px-3 py-4 text-center shadow-[0_2px_0_rgba(0,0,0,0.03)]">
                <div className="mx-auto mb-2 h-9 w-9 rounded-xl bg-[#e5e5e8]" />
                <p className="text-[11px] font-medium text-[#44454d]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 pb-24 pt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#a7a7b0]">
            Moj pojazd
          </p>

          <div className="rounded-2xl bg-[#f7f7f9] p-3 shadow-[0_4px_12px_rgba(35,35,45,0.08)]">
            {error ? (
              <p className="rounded-xl bg-[#ffe8e8] px-3 py-2 text-sm font-medium text-[#b51a1a]">
                {error}
              </p>
            ) : loading ? (
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-[#e2e3e7]" />
                <div className="h-5 w-24 rounded bg-[#e2e3e7]" />
                <div className="h-24 rounded bg-[#ececf0]" />
              </div>
            ) : data?.vehicle ? (
              <>
                <div className="mb-2 flex gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-[#e5e6ea]" />
                  <div>
                    <p className="text-[29px] font-extrabold leading-none text-[#1b1b1f]">
                      {data.vehicle.brand} {data.vehicle.model}
                    </p>
                    <p className="mt-1 inline-flex rounded-md bg-[#dfe0e5] px-2 py-1 text-xs font-bold tracking-wide text-[#3f4047]">
                      {data.vehicle.numerRejestracyjny}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-1 py-2 text-sm">
                  <div>
                    <p className="text-[#9c9ca3]">Marka</p>
                    <p className="font-semibold text-[#202127]">{data.vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-[#9c9ca3]">Model</p>
                    <p className="font-semibold text-[#202127]">{data.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-[#9c9ca3]">Rok</p>
                    <p className="font-semibold text-[#202127]">{data.vehicle.rok}</p>
                  </div>
                  <div>
                    <p className="text-[#9c9ca3]">Kolor</p>
                    <p className="font-semibold text-[#202127]">Srebrny</p>
                  </div>
                  <div>
                    <p className="text-[#9c9ca3]">VIN</p>
                    <p className="font-semibold text-[#202127]">{data.vehicle.numerVIN.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-[#9c9ca3]">Stan</p>
                    <p className="font-semibold text-[#202127]">
                      {data.vehicle.stanLicznika ? `${data.vehicle.stanLicznika} km` : "N/A"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-2 w-full rounded-xl bg-[#e32129] py-3 text-base font-bold text-white transition-transform active:scale-[0.99]"
                >
                  Sprzedaj pojazd
                </button>
              </>
            ) : (
              <p className="rounded-xl bg-[#ececf2] px-3 py-2 text-sm font-medium text-[#5f6069]">
                Немає авто для відображення.
              </p>
            )}
          </div>
        </section>

        <nav className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-[#d8d8df] bg-[#f4f4f6] px-6 py-2">
          {[
            { title: "Glowna", active: true },
            { title: "Dokumenty", active: false },
            { title: "Powiadom.", active: false },
            { title: "Profil", active: false },
          ].map((item) => (
            <button
              key={item.title}
              type="button"
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`h-5 w-5 rounded ${
                  item.active ? "bg-[#e32129]" : "bg-[#aeb2bc]"
                }`}
              />
              <span
                className={`text-[10px] ${
                  item.active ? "font-semibold text-[#e32129]" : "text-[#989ca8]"
                }`}
              >
                {item.title}
              </span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
