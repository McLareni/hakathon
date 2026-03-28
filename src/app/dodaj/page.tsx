"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ScanLine,
  CircleDollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";

type DashboardPayload = {
  user: {
    id: string;
  } | null;
};

type TemplateItem = {
  id: string;
  name: string;
  type: string;
  source: "SYSTEM" | "USER_SCAN";
  originalFileName: string | null;
  createdAt: string;
  updatedAt: string;
};

type TemplatesPayload = {
  templates: TemplateItem[];
};

export default function DodajDokumentPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError(null);

        const dashboardRes = await fetch("/api/dashboard");
        if (!dashboardRes.ok) {
          throw new Error("Nie udało się pobrać użytkownika");
        }

        const dashboardPayload = (await dashboardRes.json()) as DashboardPayload;
        const userId = dashboardPayload.user?.id;

        const templatesRes = await fetch(
          userId
            ? `/api/document-templates?userId=${userId}`
            : "/api/document-templates",
        );

        if (!templatesRes.ok) {
          throw new Error("Nie udało się pobrać szablonów");
        }

        const templatesPayload = (await templatesRes.json()) as TemplatesPayload;
        setTemplates(templatesPayload.templates);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Nie udało się pobrać szablonów",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTemplates();
  }, []);

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
            <button 
            onClick={() => router.push('/wgraj')}
            className="w-full bg-[#cb2027] rounded-[24px] p-6 flex items-center gap-5 shadow-[0_12px_28px_-8px_rgba(203,32,39,0.55)] hover:bg-[#b91c23] transition-colors active:scale-[0.98]">
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
              Dostępne szablony systemowe i własne
            </p>

            {loading ? (
              <div className="bg-white rounded-[24px] p-6 flex items-center justify-center gap-3 text-[#6b7280] border border-gray-100">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-[14px] font-medium">Ładowanie szablonów...</span>
              </div>
            ) : error ? (
              <div className="bg-[#fff1f2] rounded-[24px] p-5 flex items-start gap-3 border border-[#fecdd3] text-[#9f1239]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium leading-relaxed">{error}</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 text-center">
                <p className="text-[14px] font-medium text-[#6b7280]">
                  Brak dostępnych szablonów dla tego użytkownika.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    icon={getTemplateIcon(template.type)}
                    title={template.name}
                    meta={template.source === "SYSTEM" ? "Systemowy" : "Własny"}
                    onClick={() => router.push(`/dodaj/${template.id}`)}
                  />
                ))}
              </div>
            )}
          </div>

        </div> 
        
      </main>
    </div>
  );
}

function TemplateCard({
  icon,
  title,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-[24px] p-5 flex flex-col items-start justify-start min-h-[145px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 hover:bg-gray-50 active:scale-[0.98] transition-all text-left"
    >
      <div className="w-[42px] h-[42px] rounded-[12px] bg-[#fce8e9] flex items-center justify-center text-[#e32129] mb-4">
        {icon}
      </div>
      <span className="text-[15px] font-bold text-[#1a1e27] leading-[1.3] pr-2">
        {title}
      </span>
      <span className="mt-2 text-[12px] font-medium text-[#9ca3af]">
        {meta}
      </span>
    </button>
  );
}

function getTemplateIcon(type: string) {
  switch (type) {
    case "CAR_SALE":
      return <CircleDollarSign />;
    case "UMOWA_ZLECENIE":
      return <ClipboardIcon />;
    case "APLIKACJA_POBYT":
      return <FileTextIcon />;
    default:
      return <BlankFileIcon />;
  }
}

// ---------------- SVG ІКОНКИ ----------------

const FileTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const BlankFileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);