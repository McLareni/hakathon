"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderClosed, FolderOpen, ScanLine, Menu } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      label: "Strona główna", 
      href: "/", 
      icon: LayoutDashboard, // Для неактивного стану
    },
    { 
      label: "Usługi", 
      href: "/uslugi", 
      icon: FolderClosed, 
      activeIcon: FolderOpen, 
    },
    { 
      label: "Kod QR", 
      href: "/qr", 
      icon: ScanLine, 
    },
    { 
      label: "Więcej", 
      href: "/more", 
      // LayoutDashboard ідеально підходить для іконки сітки 2x2 зі скріншота "Więcej"
      icon: LayoutDashboard, 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full -translate-x-1/2 items-center justify-between bg-white px-2 pt-3 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.05)] border-t border-gray-100 sm:border-x sm:border-gray-200">
      {navItems.map((item) => {
        const active = pathname === item.href;
        
        // Визначаємо іконку для поточного пункту
        const IconComponent = (active && item.activeIcon) ? item.activeIcon : item.icon;

        return (
          <Link 
            key={item.label} 
            href={item.href} 
            // Використовуємо flex-1 для рівномірного розподілу ширини замість w-20
            className="flex flex-1 flex-col items-center gap-1.5 transition-transform active:scale-95"
          >
            <div className={`transition-colors duration-200 ${active ? "text-[#e31e25]" : "text-[#8e8e93]"}`}>
              
              {/* Кастомна іконка для "Strona główna", щоб точно відтворити дизайн зі скріншота */}
              {item.label === "Strona główna" && active ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h12v2H6z" opacity="0.3"/>
                  <path d="M5 8h14v2H5z" opacity="0.6"/>
                  <rect x="3" y="12" width="18" height="9" rx="2.5" />
                </svg>
              ) : (
                <IconComponent size={26} strokeWidth={active ? 2.2 : 2} />
              )}
              
            </div>

            {/* whitespace-nowrap - головний фікс, щоб текст не розривався на два рядки */}
            <span className={`text-[11px] tracking-wide whitespace-nowrap transition-colors duration-200 ${active ? "font-bold text-[#e31e25]" : "font-medium text-[#8e8e93]"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};