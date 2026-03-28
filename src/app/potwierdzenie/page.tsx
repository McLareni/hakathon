"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function PotwierdzeniePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-103.5 bg-[#f1f2f4] min-h-screen sm:min-h-224 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pb-4">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-[32px] leading-none font-black tracking-[-0.03em] text-[#111827] mt-1">
              Potwierdzenie
            </h1>
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full flex items-center justify-center text-[#111827] active:opacity-60"
              aria-label="Zamknij"
            >
              <X size={30} strokeWidth={2.3} />
            </button>
          </div>

          <section className="rounded-[20px] bg-white p-5 shadow-[0_8px_26px_rgba(17,24,39,0.08)] mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-[#1f3fd6] flex items-center justify-center text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <p className="text-[12px] font-medium text-[#9ca3af]">Sprzedający</p>
                <p className="text-[18px] leading-none font-black tracking-[-0.02em] text-[#111827] mt-1">Jan Kowalski</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f3f4f6] p-4">
              <p className="text-[12px] font-medium text-[#9ca3af] mb-3">Dane pojazdu do sprzedaży</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#9ca3af]">Pojazd:</span>
                  <span className="text-[13px] leading-none font-black tracking-[-0.02em] text-[#111827]">Toyota Corolla 1.8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#9ca3af]">Nr rej.:</span>
                  <span className="text-[13px] leading-none font-black tracking-[-0.02em] text-[#111827]">WA 8823K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#9ca3af]">Rok:</span>
                  <span className="text-[13px] leading-none font-black tracking-[-0.02em] text-[#111827]">2021</span>
                </div>
                <hr className="border-[#e5e7eb] my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-[#9ca3af]">Cena:</span>
                  <span className="text-[13px] leading-none font-black tracking-[-0.02em] text-[#e11d48]">45 000 PLN</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[20px] bg-white p-5">
            <h2 className="text-[16px] leading-none font-black tracking-[-0.02em] text-[#111827] mb-4">Na co potwierdzasz</h2>

            <div className="rounded-2xl border border-[#9cc3ff] bg-[#e8f0ff] p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 12h6M9 16h6M13 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-5-7z" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 2v7h7" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-[14px] font-black text-[#1d4ed8]">Udostępnienie danych osobowych</p>
              </div>
              <p className="text-[13px] text-[#1d4ed8] leading-relaxed">
                Wyrażasz zgodę na przekazanie następujących danych z aplikacji mObywatel sprzedającemu w celu utworzenia umowy kupna-sprzedaży pojazdu:
              </p>
            </div>

            <ul className="space-y-2 text-[15px] text-[#111827] mb-4">
              <li><span className="text-[#e11d48] mr-2">●</span><span className="font-bold">Imię i nazwisko:</span> Anna Nowak</li>
              <li><span className="text-[#e11d48] mr-2">●</span><span className="font-bold">PESEL:</span> 92010512345</li>
              <li><span className="text-[#e11d48] mr-2">●</span><span className="font-bold">Adres:</span> ul. Krakowska 15, 00-001 Warszawa</li>
            </ul>

            <div className="rounded-2xl border border-[#f5d868] bg-[#fff7d6] px-4 py-3">
              <p className="text-[13px] leading-relaxed text-[#92400e]">
                <span className="font-bold">⚠</span> Upewnij się, że znasz i ufasz sprzedającemu. Dane będą wykorzystane wyłącznie do sporządzenia umowy kupna-sprzedaży.
              </p>
            </div>
          </section>
        </div>

        <div className="w-full max-w-103.5 bg-[#f5f5f5] px-5 pt-3 pb-8 flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-[14px] border-2 border-[#9ca3af] bg-white py-3.5 text-[15px] leading-none font-black tracking-[-0.02em] text-[#111827] active:scale-[0.98]"
          >
            Odrzuć
          </button>
          <button
            type="button"
            className="flex-1 rounded-[14px] bg-[#e11d48] py-3.5 text-[15px] leading-none font-black tracking-[-0.02em] text-white active:scale-[0.98]"
          >
            Zatwierdź
          </button>
        </div>
      </main>
    </div>
  );
}
