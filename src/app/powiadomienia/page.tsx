"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Bell, Info, FileText, CheckCircle2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export default function PowiadomieniaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      <main className="relative w-full max-w-[414px] bg-[#F8F9FA] min-h-screen sm:min-h-[896px] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Контентна область */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10">
          
          {/* Header Section */}
          <div className="px-5 pt-14 mb-6">
            {/* Кнопка тепер веде строго на головну / */}
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-6 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Strona główna
            </button>
            
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-[34px] font-black text-[#1a1e27] tracking-tight">
                Powiadomienia
              </h1>
              {/* Badge */}
              <div className="bg-[#e32129] text-white text-[15px] font-black w-7 h-7 rounded-full flex items-center justify-center">
                3
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              <button className="bg-[#e32129] text-white font-bold px-6 py-3 rounded-[12px] shadow-[0_4px_12px_rgba(227,33,41,0.2)] transition-all">
                Wszystkie (7)
              </button>
              <button className="bg-white text-[#8e8e93] font-bold px-5 py-3 rounded-[12px] border border-gray-100 shadow-sm hover:bg-gray-50 transition-all">
                Nieprzeczytane (3)
              </button>
            </div>
          </div>

         </div>

        <BottomNav />
      </main>
    </div>
  );
}

// Допоміжний компонент сповіщення
function NotificationItem({ icon, title, desc, time, isUnread }: any) {
  return (
    <div className={`relative bg-white p-4 rounded-[20px] shadow-sm border ${isUnread ? 'border-blue-50' : 'border-gray-50'} flex gap-4 transition-all active:scale-[0.98]`}>
      {isUnread && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-[#e32129] rounded-full" />
      )}
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className={`text-[15px] ${isUnread ? 'font-black' : 'font-bold'} text-[#1a1e27]`}>
          {title}
        </h3>
        <p className="text-[13px] text-[#9ca3af] font-medium leading-snug pr-4">
          {desc}
        </p>
        <span className="text-[11px] text-[#d1d5db] font-bold mt-1">
          {time}
        </span>
      </div>
    </div>
  );
}