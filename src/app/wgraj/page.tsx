"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  FileText,
  TriangleAlert,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const MAX_SIZE = 10 * 1024 * 1024;

type UploadState = "idle" | "uploading" | "success" | "error";

export default function WgrajDokumentPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (picked: File | null) => {
    setFileError(null);
    if (!picked) return;
    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setFileError("Nieobsługiwany format. Wybierz PDF, PNG lub JPG.");
      return;
    }
    if (picked.size > MAX_SIZE) {
      setFileError("Plik jest za duży. Maksymalny rozmiar to 10 MB.");
      return;
    }
    setFile(picked);
    if (!name) setName(picked.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files[0] ?? null);
  };

  const handleSubmit = async () => {
    if (!file || !name.trim()) return;
    setUploadState("uploading");
    setErrorMsg(null);

    try {
      // fetch current user from dashboard
      const dashRes = await fetch("/api/dashboard");
      if (!dashRes.ok) throw new Error("Nie udało się pobrać danych użytkownika");
      const dash = (await dashRes.json()) as { user?: { id: string } | null };
      const creatorId = dash.user?.id;
      if (!creatorId) throw new Error("Zaloguj się, aby wgrać dokument");

      const form = new FormData();
      form.append("creatorId", creatorId);
      form.append("name", name.trim());
      form.append("type", "CAR_SALE");
      form.append("file", file);

      const res = await fetch("/api/document-templates/upload-scan", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const payload = (await res.json()) as { error?: string };
        throw new Error(payload.error ?? "Błąd przesyłania");
      }

      setUploadState("success");
    } catch (err) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Nieznany błąd");
    }
  };

  const reset = () => {
    setFile(null);
    setName("");
    setFileError(null);
    setUploadState("idle");
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start font-sans text-[#1b1b1f]">
      <main className="relative w-full max-w-[414px] bg-[#f5f5f5] min-h-screen sm:min-h-[896px] shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10">

          {/* Header */}
          <div className="px-6 pt-5 mb-6">
            <button
              onClick={() => router.push("/dodaj")}
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-5 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Dodaj dokument
            </button>
            <h1 className="text-[32px] font-black text-[#1a1e27] tracking-tight leading-tight">
              Wgraj dokument
            </h1>
          </div>

          {/* Info box */}
          <div className="mx-6 mb-6 bg-[#f0f5ff] rounded-[16px] p-5">
            <p className="text-[13px] text-[#1C398E] font-medium leading-relaxed">
              Wgraj skan umowy w formacie PDF, PNG lub JPG. System automatycznie
              rozpozna tekst i stworzy szablon dokumentu.
            </p>
          </div>

          {/* Success state */}
          {uploadState === "success" ? (
            <div className="mx-6 mb-6 bg-white rounded-[24px] p-8 flex flex-col items-center text-center gap-4 shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <p className="text-[17px] font-black text-[#1a1e27] mb-1">Szablon zapisany!</p>
                <p className="text-[13px] text-[#6b7280]">
                  &ldquo;{name}&rdquo; został dodany do Twoich szablonów.
                </p>
              </div>
              <button
                onClick={reset}
                className="mt-2 bg-[#f3f4f6] text-[#1a1e27] font-bold text-[14px] px-6 py-3 rounded-[12px] hover:bg-gray-200 transition-colors active:scale-95"
              >
                Wgraj kolejny
              </button>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                className={`mx-6 mb-4 bg-white border-2 border-dashed rounded-[24px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  file
                    ? "border-[#1d4ed8] bg-blue-50"
                    : fileError
                      ? "border-red-400 bg-red-50"
                      : "border-[#d1d5db] hover:bg-gray-50"
                }`}
                onClick={() => !file && inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />

                {file ? (
                  <div className="w-full flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#1d4ed8] rounded-[10px] flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[13px] font-bold text-[#1a1e27] truncate">{file.name}</p>
                      <p className="text-[11px] text-[#9ca3af]">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X size={16} className="text-[#6b7280]" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-[72px] h-[72px] bg-[#1d4ed8] rounded-full flex items-center justify-center text-white mb-5 shadow-[0_8px_16px_rgba(29,78,216,0.3)]">
                      <Upload size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[17px] font-bold text-[#1a1e27] mb-2">
                      Wybierz lub przeciągnij plik
                    </h3>
                    <p className="text-[13px] text-[#9ca3af] font-medium mb-6 px-2 leading-relaxed">
                      PDF, PNG lub JPG — maks. 10 MB
                    </p>
                    <button className="bg-[#f3f4f6] text-[#1a1e27] font-bold text-[14px] px-6 py-3.5 rounded-[12px] hover:bg-gray-200 transition-colors active:scale-95">
                      Przeglądaj pliki
                    </button>
                  </>
                )}
              </div>

              {fileError && (
                <p className="mx-6 mb-4 text-[12px] text-red-600 font-medium">{fileError}</p>
              )}

              {/* Name input */}
              <div className="mx-6 mb-6">
                <label className="block text-[13px] font-bold text-[#1a1e27] mb-2">
                  Nazwa szablonu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Umowa kupna-sprzedaży 2026"
                  className="w-full bg-white border border-gray-200 rounded-[14px] px-4 py-3.5 text-[14px] text-[#1a1e27] font-medium placeholder:text-[#9ca3af] outline-none focus:border-[#1d4ed8] transition-colors"
                />
              </div>

              {/* Error */}
              {uploadState === "error" && errorMsg && (
                <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-[14px] p-4 flex items-start gap-2">
                  <TriangleAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-700 font-medium">{errorMsg}</p>
                </div>
              )}

              {/* Upload button */}
              <div className="mx-6 mb-6">
                <button
                  onClick={handleSubmit}
                  disabled={!file || !name.trim() || uploadState === "uploading"}
                  className="w-full bg-[#1d4ed8] text-white font-bold text-[16px] rounded-[18px] py-4 flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(29,78,216,0.35)] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                >
                  {uploadState === "uploading" ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Skanowanie...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Wgraj i skanuj
                    </>
                  )}
                </button>
              </div>

              {/* Warning */}
              <div className="mx-6 mb-8 bg-[#fffbeb] rounded-[16px] p-5 flex items-start gap-3">
                <TriangleAlert size={18} className="text-[#92400e] flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#92400e] font-medium leading-relaxed">
                  <span className="font-bold">Maks. 10 MB.</span> Upewnij się, że dokument jest czytelny i zawiera wszystkie wymagane informacje.
                </p>
              </div>
            </>
          )}
        </div>

        <BottomNav />
      </main>
    </div>
  );
}