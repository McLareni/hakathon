export const QuickActions = () => {
  const actions = ["Dowód osobisty", "Dokumenty", "Płatności"];

  return (
    <section className="px-5 pt-8">
      <p className="mb-4 text-[12px] font-bold uppercase tracking-wider text-[#a7a7b0]">
        Szybkie akcje
      </p>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((label) => (
          <div
            key={label}
            className="rounded-[20px] bg-white px-2 py-5 text-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-3"
          >
            <div className="h-10 w-10 rounded-[14px] bg-[#f2f2f4]" />
            <p className="text-[12px] font-semibold text-[#44454d] leading-tight px-1">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};