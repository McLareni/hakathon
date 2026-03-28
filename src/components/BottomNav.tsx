"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Strona główna",
      href: "/",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.2Z" />
        </svg>
      ),
    },
    {
      label: "Usługi",
      href: "/uslugi",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A1.5 1.5 0 015.5 6H10l2 2h6.5A1.5 1.5 0 0120 9.5v8a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5v-10Z" />
        </svg>
      ),
    },
    {
      label: "Kod QR",
      href: "#",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
          <path d="M5 5h4v4H5zM15 5h4v4h-4zM5 15h4v4H5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 15h2m3 0h-1m-4 4h4m-1-3v3" />
        </svg>
      ),
    },
    {
      label: "Więcej",
      href: "#",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
          <circle cx="7" cy="7" r="2.2" />
          <circle cx="17" cy="7" r="2.2" />
          <circle cx="7" cy="17" r="2.2" />
          <circle cx="17" cy="17" r="2.2" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-107.5 -translate-x-1/2 items-center justify-around border-t border-[#e8eaef] bg-white px-2 pb-6 pt-3 sm:rounded-b-[26px]">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 transition-colors ${
              active ? "text-[#e31d3b]" : "text-[#9199a6]"
            }`}
          >
            {item.icon}
            <span className={`text-[10px] leading-tight ${active ? "font-bold" : "font-medium"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};