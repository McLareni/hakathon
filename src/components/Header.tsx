"use client";

import { BotMessageSquare, Bell } from "lucide-react";

export const Header = () => {
  return (
    <section className="px-5 pb-4 pt-5">
      <div className="mb-3 flex flex-col items-center justify-between">
        <div className="flex w-full items-center justify-between ">
          <div className="bg-red-600 rounded-lg h-8 w-8 flex items-center justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Coat_of_arms_of_Poland.svg"
              alt="Godlo"
              className="h-5 w-5 invert brightness-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <BotMessageSquare className="w-8 h-8" />
            <Bell className="w-8 h-8" />
          </div>
        </div>
      </div>

      <h1 className="text-[26px] font-black tracking-[-0.03em] text-[#1a1f2e]">
        Strona główna
      </h1>

      <div className="flex justify-end gap-4 text-[#e31d3b] mt-4">
        <button
          type="button"
          className="flex items-center gap-1.5 text-[12px] font-semibold"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.2 5.2l3.6 3.6M5 19l3.7-.5L18 9.2l-3.7-3.7-9.3 9.3L5 19z"
            />
          </svg>
          Dostosuj
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-[12px] font-semibold"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14M5 12h14"
            />
          </svg>
          Dodaj
        </button>
      </div>
    </section>
  );
};
