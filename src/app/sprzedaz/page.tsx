"use client";

import { useRouter } from "next/navigation";

export default function SprzedazPojazduPage() {
  const router = useRouter();

  return (
    // 1. Повертаємо темний фон і центрування для імітації мобільного пристрою
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      {/* 2. Додаємо обмеження ширини (max-w-[414px]), круглі кути та тінь */}
      <main className="relative w-full max-w-[414px] bg-[#F8F9FA] min-h-screen sm:min-h-[896px] shadow-2xl  overflow-x-hidden overflow-y-auto hide-scrollbar flex flex-col pb-10">
        
        {/* Header Section */}
        <div className="px-6 pt-14 mb-6">
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

        {/* Card 1: Pojazd do sprzedaży */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-5 mb-5">
          <h2 className="text-[17px] font-bold text-[#1a1e27] mb-5">Pojazd do sprzedaży</h2>
          
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9ca3af] font-medium">Numer rejestracyjny</span>
              <span className="text-[14px] font-bold text-[#1a1e27]">WA 8823K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9ca3af] font-medium">Marka i model</span>
              <span className="text-[14px] font-bold text-[#1a1e27]">Toyota Corolla 1.8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#9ca3af] font-medium">Rok produkcji</span>
              <span className="text-[14px] font-bold text-[#1a1e27]">2021</span>
            </div>
          </div>
        </div>

        {/* Card 2: Dane sprzedaży */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-5 mb-6">
          <h2 className="text-[17px] font-bold text-[#1a1e27] mb-5">Dane sprzedaży</h2>
          
          <div className="space-y-4">
            <InputField 
              label="Cena sprzedaży (PLN) *" 
              placeholder="np. 45000" 
            />
            <InputField 
              label="Numer telefonu klienta *" 
              placeholder="np. 45000" 
            />
            <InputField 
              label="Stan licznika *" 
              placeholder="np. 45000" 
            />
          </div>

          <p className="text-[12px] text-[#9ca3af] font-medium mt-5 mb-5 leading-relaxed pr-4">
            Po utworzeniu dokumentu będziesz mógł zaprosić kupującego przez link
          </p>

          <button className="w-full bg-[#cb2027] text-white font-bold text-[16px] rounded-[16px] py-4 shadow-[0_8px_20px_-6px_rgba(203,32,39,0.5)] hover:bg-[#b91c23] transition-colors active:scale-95">
            Utwórz dokument
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-[#f0f5ff] rounded-[16px] p-5 mx-5 mb-8">
          <p className="text-[13px] text-[#2563eb] font-medium leading-relaxed">
            Umowa zostanie wygenerowana automatycznie na podstawie danych z rejestru CEPiK i Twoich danych.
          </p>
        </div>

      </main>
    </div>
  );
}

// Перевикористовуваний компонент поля вводу
function InputField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-[13px] text-[#9ca3af] font-bold mb-1.5 ml-1">
        {label}
      </label>
      <input 
        type="text" 
        placeholder={placeholder} 
        className="w-full bg-[#F5F5F5] rounded-[12px] px-4 py-3.5 text-[15px] font-medium text-[#1a1e27] outline-none focus:ring-2 focus:ring-[#e32129]/20 transition-all placeholder-[#a1a1aa]" 
      />
    </div>
  );
}