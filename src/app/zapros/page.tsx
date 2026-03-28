"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { BottomNav } from "@/components/BottomNav"; // Підключаємо навігацію

export default function ZaprosKupujacegoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      {/* Головний контейнер (Екран телефону) */}
      <main className="relative w-full max-w-[414px] bg-[#F8F9FA] min-h-screen sm:min-h-[896px] shadow-2xl  overflow-hidden flex flex-col">
        
        {/* Блок контенту з flex-1. Він займає весь вільний простір і виштовхує навігацію вниз */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto hide-scrollbar flex flex-col pb-6">
          
          {/* Header Section */}
          <div className="px-6 pt-14 mb-6">
            <button 
              onClick={() => router.push('/uslugi')} 
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Usługi
            </button>
            
            <h1 className="text-[32px] font-black text-[#1a1e27] tracking-tight leading-tight">
              Zaproś kupującego
            </h1>
          </div>

          {/* Card 1: Success Message */}
          <div className="bg-white rounded-[24px] p-8 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-5 mb-5">
            {/* Green Check Icon */}
            <div className="w-14 h-14 rounded-full bg-[#e6f7ef] flex items-center justify-center text-[#16a34a] mb-5">
              <Check size={32} strokeWidth={2.5} />
            </div>
            
            <h2 className="text-[18px] font-bold text-[#1a1e27] mb-2">
              Dokument utworzony!
            </h2>
            <p className="text-[13px] text-[#9ca3af] font-medium leading-relaxed px-2">
              Teraz zaproś kupującego, aby podpisał umowę
            </p>
          </div>

          {/* Card 2: Document Details */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mx-5 mb-8">
            <h2 className="text-[16px] font-bold text-[#1a1e27] mb-5">Szczegóły dokumentu</h2>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#9ca3af] font-medium">Pojazd</span>
                <span className="text-[14px] font-bold text-[#1a1e27]">WA 8823K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#9ca3af] font-medium">Cena</span>
                <span className="text-[14px] font-bold text-[#1a1e27]">5675 PLN</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[13px] text-[#9ca3af] font-medium">Data</span>
                <span className="text-[14px] font-bold text-[#1a1e27]">28.03.2026</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="px-5 mb-8">
            <button 
              onClick={() => console.log('Następny krok')} 
              className="w-full bg-[#cb2027] text-white font-bold text-[16px] rounded-[16px] py-4 shadow-[0_8px_20px_-6px_rgba(203,32,39,0.5)] hover:bg-[#b91c23] transition-colors active:scale-95"
            >
              Kontynuuj
            </button>
          </div>

        </div>

        {/* Навігація в самому низу екрана телефону */}
        <BottomNav />
        
      </main>
    </div>
  );
}