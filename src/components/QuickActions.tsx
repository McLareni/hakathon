// src/components/QuickActions.tsx
export const QuickActions = () => {
  const actions = [
    { label: 'Dowód osobisty' },
    { label: 'Dokumenty' },
    { label: 'Płatności' },
  ];

  return (
    <section className="mb-10">
      <h2 className="text-[13px] font-bold text-gray-400 mb-4 uppercase tracking-wider">
        Szybkie akcje
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <div key={index} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3 aspect-square">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex-shrink-0"></div> {/* Сірий квадрат замість іконки */}
            <span className="text-[11px] font-semibold text-gray-700 leading-tight">
              {action.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};