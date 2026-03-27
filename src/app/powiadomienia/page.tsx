import { Navigation } from '@/components/Navigation';

export default function PowiadomieniaPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative">
      <main className="grow p-5 pt-10 max-w-md mx-auto w-full mb-28">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">e-Skrzynka</h1>
        <p className="text-[14px] text-gray-500 font-medium mb-6">Twoje oficjalne e-Doręczenia</p>
        
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/50 flex flex-col items-center justify-center text-center h-64">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center">
             <span className="text-gray-300 text-2xl">📬</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Skrzynka jest pusta</h3>
          <p className="text-[14px] text-gray-400">Коли покупець надішле вам договір, він з'явиться тут.</p>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}