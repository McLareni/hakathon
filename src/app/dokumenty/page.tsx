import { Navigation } from '@/components/Navigation';

export default function DokumentyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative">
      <main className="grow p-5 pt-10 max-w-md mx-auto w-full mb-28">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Dokumenty</h1>
        
        {/* Картка-заглушка з таким самим красивим фоном/тінню */}
        <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/50 flex flex-col items-center justify-center text-center h-64">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center">
             <span className="text-gray-300 text-2xl">📄</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Brak dokumentów</h3>
          <p className="text-[14px] text-gray-400">Тут будуть ваші активні договори після їх створення.</p>
        </div>
      </main>
      
      <Navigation />
    </div>
  );
}