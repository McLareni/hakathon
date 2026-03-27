import { Vehicle } from '@/types';

interface Props {
  vehicle: Vehicle;
}

export const VehicleCard = ({ vehicle }: Props) => {
  return (
    // Додали w-[85vw] max-w-[320px] для ширини та shrink-0 snap-center для плавного гортання
    <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/50 flex flex-col gap-5 relative overflow-hidden shrink-0 w-[85vw] max-w-[320px] snap-center">
      
      {/* Хедер картки */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl flex-shrink-0">
          {vehicle.brand[0]}
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-[17px] font-bold text-gray-900 leading-none">
            {vehicle.brand} {vehicle.model}
          </h3>
          <span className="bg-[#F8F9FA] text-gray-800 px-3 py-1 rounded-xl font-bold text-[12px] tracking-wide mt-0.5 border border-gray-100">
            {vehicle.registrationNumber}
          </span>
        </div>
      </div>

      {/* Грід з даними */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 text-sm px-1 mt-1">
        <div>
          <span className="block text-[11px] text-gray-400 font-medium mb-1">Marka</span>
          <span className="block text-gray-900 font-bold text-[14px]">{vehicle.brand}</span>
        </div>
        <div>
          <span className="block text-[11px] text-gray-400 font-medium mb-1">Model</span>
          <span className="block text-gray-900 font-bold text-[14px]">{vehicle.model}</span>
        </div>
        <div>
          <span className="block text-[11px] text-gray-400 font-medium mb-1">Rok</span>
          <span className="block text-gray-900 font-bold text-[14px]">{vehicle.year}</span>
        </div>
        <div>
          <span className="block text-[11px] text-gray-400 font-medium mb-1">VIN</span>
          <span className="block text-gray-900 font-bold text-[14px]">{vehicle.vin}</span>
        </div>
      </div>

      {/* Кнопка продажу */}
      <button className="w-full bg-[#E31E24] hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl text-[15px] transition-colors mt-2 shadow-md shadow-red-500/20">
        Sprzedaj pojazd
      </button>
    </div>
  );
};