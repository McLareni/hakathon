"use client";

import { useRouter } from "next/navigation";
import { Hourglass, FilePenLine, ChevronLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function UmowaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
      
      <main className="relative w-full max-w-[414px] bg-[#F8F9FA] min-h-screen sm:min-h-[896px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Область контенту, що скролиться */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10">
          
          {/* Header (Заголовок та кнопка назад) */}
          <div className="px-6 pt-14 mb-6">
            <button 
              onClick={() => router.push('/uslugi')} 
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Usługi
            </button>
            <h1 className="text-[28px] font-black text-[#1a1e27] tracking-tight leading-tight">
              Umowa kupna-sprzedaży
            </h1>
          </div>

          {/* Status Box (Жовтий блок очікування) */}
          <div className="mx-6 mb-6 bg-[#fffbeb] border border-[#fef3c7] rounded-[16px] p-4 flex items-center gap-3">
            <Hourglass size={20} className="text-[#92400e]" />
            <p className="text-[13px] font-bold text-[#92400e] leading-snug">
              Oczekiwanie na potwierdzenie danych przez kupującego
            </p>
          </div>

          {/* The Contract Card (Основний документ) */}
          <div className="mx-6 bg-white rounded-[24px] shadow-[0_4px_30px_rgba(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col">
            
            <h2 className="text-[17px] font-black text-[#1a1e27] text-center mb-8 uppercase tracking-wider leading-relaxed">
              Umowa kupna-sprzedaży<br/>pojazdu
            </h2>

            {/* Parties Section (Сторони договору) */}
            <div className="space-y-6 mb-8">
              <div>
                <p className="text-[15px] font-black text-[#1a1e27] mb-1">Sprzedający:</p>
                <p className="text-[15px] text-[#4b5563]">Jan Kowalski</p>
              </div>
              <div>
                <p className="text-[15px] font-black text-[#1a1e27] mb-1">Kupujący:</p>
                <p className="text-[15px] text-[#9ca3af] italic">Oczekiwanie na dane...</p>
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Vehicle Details Section (Дані авто) */}
            <div className="space-y-4 mb-8">
              <p className="text-[15px] font-black text-[#1a1e27] mb-3">Dane pojazdu:</p>
              <DataRow label="Marka:" value="Toyota" />
              <DataRow label="Model:" value="Corolla 1.8" />
              <DataRow label="Rok:" value="2021" />
              <DataRow label="Nr rej.:" value="WA 8823K" />
              <DataRow label="VIN:" value="SB1KC56E30F007834" />
              <DataRow label="Kolor:" value="Srebrny" />
            </div>

            <hr className="border-gray-100 mb-6" />

            {/* Price Section (Ціна) */}
            <div className="mb-8">
              <p className="text-[15px] font-black text-[#1a1e27] mb-2">Cena sprzedaży:</p>
              <p className="text-[26px] font-black text-[#e32129]">213123 PLN</p>
            </div>

            {/* Legal Text (Юридичний текст) */}
            <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-10">
              Strony oświadczają, że zawarły niniejszą umowę po zapoznaniu się z jej treścią, 
              dobrowolnie i bez przymusu. Sprzedający oświadcza, że pojazd jest wolny od 
              wad prawnych i nie jest obciążony prawami osób trzecich.
            </p>

            {/* Agreement Date (Дата) */}
            <div className="text-center">
              <p className="text-[12px] text-[#9ca3af] font-medium mb-1">Data zawarcia umowy:</p>
              <p className="text-[15px] font-black text-[#1a1e27]">28.03.2026</p>
            </div>
          </div>

          {/* Кнопка Підпис */}
          <div className="px-6 mt-8 mb-24">
            <button 
              onClick={() => router.push('/gratulacje')} // Додано перехід на сторінку успіху
              className="w-full bg-[#cb2027] text-white font-bold text-[18px] rounded-[18px] py-4.5 flex items-center justify-center gap-2 shadow-[0_10px_25px_-5px_rgba(203,32,39,0.4)] active:scale-95 transition-all"
            >
              <FilePenLine size={22} />
              Podpis
            </button>
          </div>

        </div>

        {/* Нижня навігація */}
        <BottomNav />
      </main>
    </div>
  );
}

// Допоміжний компонент для виведення рядків з даними
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start text-[14px]">
      <span className="text-[#9ca3af] font-medium">{label}</span>
      <span className="text-[#1a1e27] font-bold text-right ml-4">{value}</span>
    </div>
  );
}