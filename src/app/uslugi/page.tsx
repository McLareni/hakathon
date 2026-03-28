"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export default function UslugiPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-200 flex justify-center font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-[400px] bg-white min-h-screen pb-24 shadow-2xl sm:border-x sm:border-gray-300 overflow-y-auto hide-scrollbar flex flex-col">
        
        {/* Status Bar */}
        <div className="px-6 pt-4 flex justify-between items-center text-[14px] font-bold">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <div className="h-2.5 w-5 border border-black rounded-[2px] relative">
              <div className="absolute top-0.5 left-0.5 bottom-0.5 bg-black w-[80%] rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Title Section */}
        <div className="px-6 mt-6">
          <div className="w-[36px] h-[36px] bg-[#e32129] rounded-[8px] flex items-center justify-center mb-5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Coat_of_arms_of_Poland.svg" alt="PL" className="w-6 h-6 invert brightness-0" />
          </div>
          <h1 className="text-[36px] font-black tracking-tight mb-5">Usługi</h1>
        </div>

        {/* Search */}
        <div className="px-6 mb-8">
          <div className="flex items-center bg-[#efeff0] rounded-xl px-4 py-2.5">
            <svg className="w-5 h-5 text-[#8e8e93] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Szukaj" className="bg-transparent outline-none w-full text-[17px] font-medium placeholder-[#8e8e93]" />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 space-y-8 flex-grow">
          <div>
            <h2 className="text-[15px] font-extrabold mb-4 opacity-90">Kierowcy i pojazdy</h2>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.06)] overflow-hidden">
              <ServiceListItem icon={<SteeringWheelIcon />} label="Kwalifikacje kierowcy" iconColor="text-[#1a56db]" />
              <ServiceListItem icon={<CarIcon />} label="Historia pojazdu" iconColor="text-[#1a56db]" />
              <ServiceListItem icon={<MoneyIcon />} label="Sprzedaż pojazdu" iconColor="text-[#1a56db]" isLast={true} onClick={() => router.push('/')} />
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-[15px] font-extrabold mb-4 opacity-90">Nieruchomość</h2>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.06)] overflow-hidden">
              <ServiceListItem icon={<HouseIcon />} label="Umowa najmu mieszkania" iconColor="text-[#16a34a]" />
              <ServiceListItem icon={<HouseHeartIcon />} label="Umowa najmu okazjonalnego" iconColor="text-[#16a34a]" />
              <ServiceListItem icon={<BuildingIcon />} label="Umowa użyczenia lokalu" iconColor="text-[#16a34a]" isLast={true} />
            </div>
          </div>
        </div>

        <BottomNav />
      </main>
    </div>
  );
}

function ServiceListItem({ icon, label, iconColor, isLast, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between px-5 py-4.5 cursor-pointer active:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={iconColor}>{icon}</div>
        <span className="text-[16px] font-bold text-[#1b1b1f]">{label}</span>
      </div>
      <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M9 5l7 7-7 7" /></svg>
    </div>
  );
}

// Icons
const SteeringWheelIcon = () => (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 12l3-9M12 12l-3-9M12 12v9" /></svg>);
const CarIcon = () => (<svg className="w-7 h-7" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z" /></svg>);
const MoneyIcon = () => (<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>);
const HouseIcon = () => (<svg className="w-7 h-7" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>);
const HouseHeartIcon = () => (<svg className="w-7 h-7" fill="currentColor"><path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" /></svg>);
const BuildingIcon = () => (<svg className="w-7 h-7" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2z" /></svg>);