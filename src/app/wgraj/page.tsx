"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, FileText, TriangleAlert } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function WgrajDokumentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      <main className="relative w-full max-w-[414px] bg-[#F5f5f5] min-h-screen sm:min-h-[896px] shadow-2xl   overflow-hidden flex flex-col">
        
        {/* Контентна область */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col  pb-10">
          
          {/* Header */}
          <div className="px-6 pt-5 mb-6">
            <button 
              onClick={() => router.push('/dodaj')} // Повернення на сторінку "Dodaj dokument"
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Dodaj dokument
            </button>
            <h1 className="text-[32px] font-black text-[#1a1e27] tracking-tight leading-tight">
              Wgraj dokument
            </h1>
          </div>

          {/* Інформаційний синій блок */}
          <div className="mx-6 mb-6 bg-[#f0f5ff] rounded-[16px] p-5">
            <p className="text-[13px] text-[#1C398E] font-medium leading-relaxed">
              Wgraj plik PDF z umową kupna-sprzedaży pojazdu. System automatycznie wydobędzie wszystkie ważne informacje.
            </p>
          </div>

          {/* Зона завантаження файлу */}
          <div className="mx-6 mb-6 bg-white border-2 border-dashed border-[#d1d5db] rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-[72px] h-[72px] bg-[#1d4ed8] rounded-full flex items-center justify-center text-white mb-5 shadow-[0_8px_16px_rgba(29,78,216,0.3)]">
              <Upload size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-[17px] font-bold text-[#1a1e27] mb-2">Wybierz plik PDF</h3>
            <p className="text-[13px] text-[#9ca3af] font-medium mb-6 px-2 leading-relaxed">
              Kliknij tutaj aby wybrać dokument z Twojego urządzenia
            </p>
            <button className="bg-[#f3f4f6] text-[#1a1e27] font-bold text-[14px] px-6 py-3.5 rounded-[12px] hover:bg-gray-200 transition-colors active:scale-95">
              Przeglądaj pliki
            </button>
          </div>

          {/* Список акцептованих документів */}
          <div className="mx-6 mb-6 bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100">
            <p className="text-[13px] text-[#9ca3af] font-medium mb-4">Akceptowane dokumenty:</p>
            <div className="space-y-3.5">
              <DocListItem text="Umowa kupna-sprzedaży pojazdu (PDF)" />
              <DocListItem text="Dowód rejestracyjny (PDF)" />
              <DocListItem text="Polisa ubezpieczeniowa (PDF)" />
            </div>
          </div>

          {/* Жовте попередження */}
          <div className="mx-6 mb-8 bg-[#fffbeb] rounded-[16px] p-5 flex items-start gap-3">
            <TriangleAlert size={18} className="text-[#92400e] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#92400e] font-medium leading-relaxed">
              <span className="font-light">Maksymalny rozmiar pliku: 10 MB.</span> Upewnij się, że dokument jest czytelny i zawiera wszystkie wymagane informacje.
            </p>
          </div>

        </div>

        {/* Нижня навігація */}
        <BottomNav />
      </main>
    </div>
  );
}

// Допоміжний компонент для списку документів
function DocListItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <FileText size={18} strokeWidth={2.5} className="text-[#e32129] flex-shrink-0" />
      <span className="text-[13px] font-bold text-[#1a1e27]">{text}</span>
    </div>
  );
}