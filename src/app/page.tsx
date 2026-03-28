"use client";

import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav"; // Підключаємо вашу навігацію
import { 
  ScanLine, 
  Shield, 
  FileText, 
  Wrench, 
  FolderOpen, 
  Receipt, 
  File 
} from "lucide-react";

export default function DodajDokumentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start sm:py-10 font-sans">
      {/* Збільшено pb-32, щоб контент не перекривався BottomNav */}
      <main className="relative w-full max-w-[414px] bg-[#F5F6F8] min-h-[896px] pb-32 shadow-2xl overflow-y-auto hide-scrollbar sm:rounded-[40px]">
        
        {/* Header Section */}
        <div className="px-6 pt-14 mb-8">
          {/* Back Button */}
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 flex items-center justify-start text-[#e32129] mb-4 hover:opacity-70 transition-opacity"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h1 className="text-[34px] font-black text-[#1a1e27] tracking-tight mb-2 leading-tight">
            Dodaj dokument
          </h1>
          <p className="text-[14px] font-medium text-[#6b7280]">
            Wybierz szablon lub zeskanuj dokument PDF
          </p>
        </div>

        {/* Scan PDF Button */}
        <div className="px-6 mb-8">
          <button className="w-full bg-[#cb2027] rounded-[24px] p-6 flex items-center gap-5 shadow-[0_12px_28px_-8px_rgba(203,32,39,0.55)] hover:bg-[#b91c23] transition-colors active:scale-[0.98]">
            {/* Scan Icon z Lucide */}
            <div className="text-white flex-shrink-0">
              <ScanLine size={40} strokeWidth={2} />
            </div>
            <div className="text-left flex flex-col">
              <span className="text-white font-bold text-[18px]">Zeskanuj PDF</span>
              <span className="text-white/80 text-[13px] font-medium mt-0.5">Importuj dane z dokumentu PDF</span>
            </div>
          </button>
        </div>

        {/* Templates Section */}
        <div className="px-6 mb-4">
          <h2 className="text-[18px] font-black text-[#1a1e27] mb-1">Szablony</h2>
          <p className="text-[13px] font-medium text-[#9ca3af] mb-5">
            Wybierz typ dokumentu do dodania
          </p>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
            <TemplateCard 
              icon={<Shield size={24} strokeWidth={2.5} />} 
              title="Ubezpieczenie OC/AC" 
            />
            <TemplateCard 
              icon={<FileText size={24} strokeWidth={2.5} />} 
              title="Dowód rejestracyjny" 
            />
            <TemplateCard 
              icon={<Wrench size={24} strokeWidth={2.5} />} 
              title="Książka serwisowa" 
            />
            <TemplateCard 
              icon={<FolderOpen size={24} strokeWidth={2.5} />} 
              title="Przegląd techniczny" 
            />
            <TemplateCard 
              icon={<Receipt size={24} strokeWidth={2.5} />} 
              title="Faktura zakupu" 
            />
            <TemplateCard 
              icon={<File size={24} strokeWidth={2.5} />} 
              title="Inny dokument" 
            />
          </div>
        </div>

        {/* Додаємо ваш BottomNav в кінець main */}
        <BottomNav />

      </main>
    </div>
  );
}

// Перевикористовуваний компонент картки
function TemplateCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button className="bg-white rounded-[24px] p-5 flex flex-col items-start justify-start min-h-[145px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:bg-gray-50 active:scale-[0.98] transition-all text-left">
      <div className="w-[42px] h-[42px] rounded-[12px] bg-[#fce8e9] flex items-center justify-center text-[#e32129] mb-4">
        {icon}
      </div>
      <span className="text-[15px] font-bold text-[#1a1e27] leading-[1.3] pr-2">
        {title}
      </span>
    </button>
  );
}