"use client";

import { useRouter } from "next/navigation";
import { 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Shield, 
  CreditCard 
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function GratulacjePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      {/* Головний контейнер (Екран телефону) */}
      <main className="relative w-full max-w-[414px] bg-[#F8F9FA] min-h-screen sm:min-h-[896px] shadow-2xl  overflow-hidden flex flex-col">
        
        {/* Блок контенту, що скролиться */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col p-6 pt-12 pb-10">
          
          {/* Кнопка закриття (X) */}
          <div className="flex justify-end mb-2">
            <button onClick={() => router.push('/')} className="text-[#1a1e27] hover:opacity-60 transition-opacity">
              <X size={32} strokeWidth={2.5} />
            </button>
          </div>

          <h1 className="text-[34px] font-black text-[#1a1e27] tracking-tight mb-6 leading-tight">
            Gratulacje!
          </h1>

          {/* Картка успіху */}
          <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e6f7ef] flex items-center justify-center text-[#16a34a] mb-4">
              <Check size={28} strokeWidth={3} />
            </div>
            <h2 className="text-[17px] font-bold text-[#1a1e27]">
              Dokument został podpisany.
            </h2>
          </div>

          {/* Картка інформації про авто */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
            <h2 className="text-[16px] font-bold text-[#1a1e27] mb-5">Twój nowy pojazd</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#9ca3af] font-medium">Nr rejestracyjny</span>
                <span className="text-[#1a1e27] font-bold">WA 8823K</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#9ca3af] font-medium">Marka i model</span>
                <span className="text-[#1a1e27] font-bold text-right ml-4">Toyota Corolla 1.8</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-[#9ca3af] font-medium">Rok produkcji</span>
                <span className="text-[#1a1e27] font-bold">2021</span>
              </div>
            </div>
          </div>

          {/* Секція "Wymagane działania" */}
          <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-2 text-[#e32129]">
              <AlertCircle size={20} strokeWidth={2.5} />
              <h2 className="text-[16px] font-bold text-[#1a1e27]">Wymagane działania</h2>
            </div>
            <p className="text-[12px] text-[#9ca3af] font-medium mb-6">
              Aby zakończyć proces zakupu, wykonaj następujące kroki:
            </p>

            {/* Список дій */}
            <div className="space-y-6">
              <ActionItem 
                icon={<FileText size={22} />} 
                iconBg="bg-[#fef3c7]" 
                iconColor="text-[#d97706]" 
                title="Zarejestruj pojazd na siebie" 
                desc="Udaj się do Wydziału Komunikacji z dokumentami"
                deadline="Termin: 30 dni od daty zakupu"
              />
              <ActionItem 
                icon={<Shield size={22} />} 
                iconBg="bg-[#fce8e9]" 
                iconColor="text-[#e32129]" 
                title="Dodaj ubezpieczenie OC" 
                desc="Ubezpieczenie OC jest obowiązkowe przed jazdą"
              />
              <ActionItem 
                icon={<CreditCard size={22} />} 
                iconBg="bg-[#fce8e9]" 
                iconColor="text-[#e32129]" 
                title="Zapłać podatek (PCC)" 
                desc="Kwota do zapłaty: 4262 PLN (2% od wartości)"
                deadline="Termin: 14 dni od daty zakupu"
              />
            </div>
          </div>

          {/* Синій інфо-бокс */}
          <div className="bg-[#eff6ff] rounded-[16px] p-4 mb-10">
            <p className="text-[12px] leading-relaxed">
              <span className="font-black text-[#1e40af]">Ważne:</span> <span className="text-[#1e40af] font-medium">Wszystkie powyższe kroki są obowiązkowe. Niezałatwienie ich w terminie może skutkować karami finansowymi.</span>
            </p>
          </div>

          {/* Кнопка переходу */}
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-[#e32129] text-white font-bold text-[16px] rounded-[16px] py-4 shadow-[0_8px_20px_-6px_rgba(227,33,41,0.5)] hover:bg-[#cb2027] transition-colors active:scale-95 mb-6"
          >
            Otwórz ekran samochodu
          </button>

        </div>

        {/* Навігація в самому низу */}
        <BottomNav />
      </main>
    </div>
  );
}

// Допоміжний компонент для пунктів списку дій
function ActionItem({ icon, iconBg, iconColor, title, desc, deadline }: any) {
  return (
    <div className="flex gap-4">
      <div className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[14px] font-bold text-[#1a1e27] leading-tight">{title}</h3>
        <p className="text-[12px] text-[#9ca3af] font-medium leading-tight">{desc}</p>
        {deadline && <p className="text-[11px] text-[#9ca3af] font-bold mt-0.5">{deadline}</p>}
      </div>
    </div>
  );
}