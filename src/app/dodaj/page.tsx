"use client";

import { useRouter } from "next/navigation";
import { ScanLine, CircleDollarSign } from 'lucide-react';
import { BottomNav } from "@/components/BottomNav"; // Підключаємо вашу навігацію

export default function DodajDokumentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex justify-center items-start sm:py-10 font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-[414px] min-h-screen sm:min-h-[896px] overflow-hidden sm:rounded-[40px] flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
          
         
          <div className="px-6 mb-8">
            
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
              {/* Scan Icon */}
              <div className="text-white flex-shrink-0">
                <ScanLine className="w-10 h-10" />
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
              <TemplateCard icon={<CircleDollarSign />} title="Sprzedaż pojazdu" />
              <TemplateCard icon={<FileTextIcon />} title="Dowód rejestracyjny" />
              <TemplateCard icon={<WrenchIcon />} title="Książka serwisowa" />
              <TemplateCard icon={<ClipboardIcon />} title="Przegląd techniczny" />
              <TemplateCard icon={<InvoiceIcon />} title="Faktura zakupu" />
              <TemplateCard icon={<BlankFileIcon />} title="Inny dokument" />
            </div>
          </div>

        </div> 
        
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

// ---------------- SVG ІКОНКИ ----------------

const FileTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const WrenchIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const InvoiceIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 0v-4m0 4h.01" />
  </svg>
);

const BlankFileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);