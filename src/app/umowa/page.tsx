"use client";

import { Suspense } from "react";
import { UmowaContent } from "./content";

export default function UmowaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#606164] flex justify-center items-start">
          <div className="w-full max-w-[414px] bg-[#f5f5f5] min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e31d3b] mx-auto"></div>
              <p className="mt-4 text-[#1a1e27]">Ładowanie...</p>
            </div>
          </div>
        </div>
      }
    >
      <UmowaContent />
    </Suspense>
  );
}