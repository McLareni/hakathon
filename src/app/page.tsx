import { currentUser, mockVehicles } from '@/data/mockData';
import { QuickActions } from '@/components/QuickActions';
import { VehicleCard } from '@/components/VehicleCard';
import { Navigation } from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative">
      {/* Прибрали max-w-md, щоб карусель могла виходити за краї на великих екранах */}
      <main className="grow pt-8 w-full">
        
        {/* Header (зберігаємо відступи px-5) */}
        <header className="flex justify-between items-center mb-10 px-5 max-w-md mx-auto">
          <div>
            <div className="w-6 h-6 bg-[#E31E24] rounded mb-2"></div>
            <span className="block text-[15px] text-gray-500 font-medium">Dzień dobry,</span>
            <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight">
              {currentUser.name}
            </h1>
          </div>
          <div className="w-14 h-14 bg-[#E31E24] text-white rounded-full flex items-center justify-center font-bold text-[22px] shadow-sm">
            {currentUser.initials}
          </div>
        </header>

        {/* Quick Actions */}
        <div className="px-5 max-w-md mx-auto">
          <QuickActions />
        </div>
        
        {/* Секція Автомобілів (Карусель) */}
        <section className="mb-28 mt-4">
          <div className="px-5 max-w-md mx-auto">
            <h2 className="text-[13px] font-bold text-gray-400 mb-4 uppercase tracking-wider">
              Moje pojazdy
            </h2>
          </div>
          
          {/* Контейнер для свайпу */}
          <div className="flex gap-4 overflow-x-auto pb-8 pt-2 px-5 snap-x snap-mandatory hide-scrollbar">
            {mockVehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
            {/* Пустий блок в кінці, щоб остання картка не прилипала до правого краю */}
            <div className="w-4 shrink-0"></div>
          </div>
        </section>
        
      </main>

      <Navigation />
    </div>
  );
}