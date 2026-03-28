"use client";
import { useEffect, useState } from "react";

export const Header = ({
  fullName,
  initials,
  loading,
}: {
  fullName: string;
  initials: string;
  loading: boolean;
}) => {
  const [time, setTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-[#f5f5f7] px-5 pb-4">
      {/* СТАТУС БАР (Годинник, Сигнал, Wi-Fi, Батарея) */}
      <div className="flex items-center justify-between pt-3 pb-4 text-black">
        <span className="text-[15px] font-semibold tracking-tight">{time}</span>
        
        <div className="flex items-center gap-1.5">
          {/* Сигнал сотової мережі */}
          <div className="flex items-end gap-[1px] h-[10px]">
            <div className="w-[3px] h-[30%] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[50%] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[75%] bg-black rounded-[0.5px]"></div>
            <div className="w-[3px] h-[100%] bg-black rounded-[0.5px]"></div>
          </div>
          
          {/* Wi-Fi */}
          <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21l-12-11.6c4.6-4.6 11.2-5.7 16.8-3.2l2.2-2.2c-6.8-3.6-15.4-2.4-21 3.4l14 13.6 14-13.6c-5.6-5.8-14.2-7-21-3.4l2.2 2.2c5.6-2.5 12.2-1.4 16.8 3.2l-12 11.6z" />
          </svg>

          {/* Батарея */}
          <div className="h-[11px] w-[22px] rounded-[3px] border-[1px] border-black/30 p-[1px] relative">
            <div className="h-full w-[85%] bg-black rounded-[1px]"></div>
            <div className="absolute -right-[2.5px] top-1/2 -translate-y-1/2 w-[1.5px] h-[4px] bg-black/30 rounded-r-[1px]"></div>
          </div>
        </div>
      </div>

      {/* ВЕРХНІЙ РЯДОК (Логотип, Повідомлення, Дзвіночок) */}
      <div className="mb-4 flex items-center justify-between">
        {/* Логотип з гербом */}
        <div className="flex h-[35px] w-[35px] items-center justify-center rounded-[8px] bg-[#e32129] shadow-sm">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Coat_of_arms_of_Poland.svg" 
            alt="Godło" 
            className="w-6 h-6 invert brightness-0" 
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Іконка чат-бота */}
          <svg className="w-7 h-7 text-[#1f1f22]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Дзвіночок сповіщень */}
          <svg className="w-7 h-7 text-[#1f1f22]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      </div>

      {/* Заголовок "Dokumenty" та дії */}
      <div className="flex items-end justify-between">
        <h1 className="text-[32px] font-bold text-[#1b1b1f] tracking-tight">
          Dokumenty
        </h1>
        
        <div className="flex items-center gap-3 pb-1">
          <button className="flex items-center gap-1 text-[#e32129] font-bold text-[14px]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Customize
          </button>
          <button className="flex items-center gap-1 text-[#e32129] font-bold text-[14px]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Dodaj
          </button>
        </div>
      </div>
    </section>
  );
};