"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export default function UslugiPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
      
      {/* ГОЛОВНИЙ КОНТЕЙНЕР (Екран телефону) - додано overflow-hidden та заокруглені кути */}
      <main className="relative w-full max-w-[414px] bg-[#F8F9FA] min-h-screen sm:min-h-[896px] overflow-hidden flex flex-col">
        
        {/* БЛОК КОНТЕНТУ (Він скролиться, а навігація стоїть на місці) */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-6">

          <div className="px-5 mb-6">
            <div className="flex items-center bg-[#EBEBEC] rounded-[10px] px-3 py-2.5">
              <svg className="w-5 h-5 text-[#8e8e93] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input 
                type="text" 
                placeholder="Szukaj" 
                className="bg-transparent outline-none w-full text-[17px] font-medium placeholder-[#8e8e93] text-[#111827]" 
              />
            </div>
          </div>

          {/* Categories */}
          <div className="px-5 space-y-7 flex-grow">
            <div>
              <h2 className="text-[15px] font-bold text-[#111827] mb-3 ml-1 tracking-tight">Kierowcy i pojazdy</h2>
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100/50 flex flex-col">
                <ServiceListItem icon={<SteeringWheelIcon />} label="Kwalifikacje kierowcy" iconColor="text-[#1C4ED8]" />
                <ServiceListItem icon={<CarIcon />} label="Historia pojazdu" iconColor="text-[#1C4ED8]" />
                <ServiceListItem 
                icon={<MoneyIcon />} 
                label="Sprzedaż pojazdu" 
                iconColor="text-[#1C4ED8]" 
                isLast={true} 
                // ЗМІНЕНО: тепер веде на сторінку /sprzedaz
                onClick={() => router.push('/sprzedaz')} 
              />
              </div>
            </div>

            <div className="pb-8">
              <h2 className="text-[15px] font-bold text-[#111827] mb-3 ml-1 tracking-tight">Nieruchomość</h2>
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100/50 flex flex-col">
                <ServiceListItem icon={<HouseIcon />} label="Umowa najmu mieszkania" iconColor="text-[#22C55E]" />
                <ServiceListItem icon={<HouseHeartIcon />} label="Umowa najmu okazjonalnego" iconColor="text-[#22C55E]" />
                <ServiceListItem icon={<DocumentIcon />} label="Umowa użyczenia lokalu" iconColor="text-[#22C55E]" />
                <ServiceListItem icon={<HouseCheckIcon />} label="Protokół zdawczo-odbiorczy" iconColor="text-[#22C55E]" isLast={true} />
              </div>
            </div>
          </div>
        </div>

        {/* НАВІГАЦІЯ тепер знаходиться всередині main і ідеально обрізається його кутами */}
        <BottomNav />
      </main>
    </div>
  );
}

// Компонент списку
function ServiceListItem({ icon, label, iconColor, isLast, onClick }: any) {
  return (
    <div 
      onClick={onClick} 
      className="flex items-center pl-5 pr-4 py-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors relative"
    >
      <div className="flex items-center w-full">
        <div className={`${iconColor} mr-4 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 flex items-center justify-between h-full">
          <span className="text-[15px] font-bold text-[#111827]">{label}</span>
          <svg className="w-5 h-5 text-[#D1D5DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      {!isLast && (
        <div className="absolute bottom-0 left-[60px] right-5 h-[1px] bg-gray-100"></div>
      )}
    </div>
  );
}

// SVG Іконки
const SteeringWheelIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 12L7 20m5-8l5 8M12 12V3" /></svg>
);
const CarIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z" /></svg>
);
const MoneyIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const HouseIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
);
const HouseHeartIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>
);
const DocumentIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
);
const HouseCheckIcon = () => (
  <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm-1.17 14.17L7.34 13.68l1.41-1.41 2.08 2.08 4.67-4.67 1.41 1.41-6.08 6.08z" /></svg>
);