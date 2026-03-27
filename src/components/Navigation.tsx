"use client"; // Це важливо для використання хуків у Next.js
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Navigation = () => {
  const pathname = usePathname();

  // Масив наших вкладок (Профіль прибрали)
  const navItems = [
    { path: '/', label: 'Główna' },
    { path: '/dokumenty', label: 'Dokumenty' },
    { path: '/powiadomienia', label: 'Powiadom.' },
  ];

  return (
    // Додали тінь shadow-[0_-4px_20px_rgba(0,0,0,0.03)], щоб відірвати панель від фону сторінки
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 pb-8 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path; // Перевіряємо, чи ми зараз на цій сторінці
          
          return (
            <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1.5 w-20">
              <div 
                className={`w-7 h-7 rounded-lg transition-colors duration-300 ${
                  isActive ? 'bg-[#E31E24]' : 'bg-gray-200'
                }`}
              ></div>
              <span 
                className={`text-[11px] transition-colors duration-300 ${
                  isActive ? 'text-[#E31E24] font-bold' : 'text-gray-400 font-medium'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};