import { IdCard } from 'lucide-react';

type QuickActionTab = "Dokumenty" | "Umowy";

export const QuickActions = ({
  activeTab,
  onTabChange,
}: {
  activeTab: QuickActionTab;
  onTabChange: (tab: QuickActionTab) => void;
}) => {
  const actions = [
    {
      label: "Dokumenty",
      active: activeTab === "Dokumenty",
      icon: (
        <IdCard className="h-10 w-10" strokeWidth={1.7} />
      ),
    },
    {
      label: "Umowy",
      active: activeTab === "Umowy",
      icon: (
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
          <path d="M8 3.5h8a2 2 0 012 2V20a.5.5 0 01-.8.4L14 18H8a2 2 0 01-2-2V5.5a2 2 0 012-2z" />
          <path d="M6 7H4.8A1.8 1.8 0 003 8.8v8.4A1.8 1.8 0 004.8 19H6" />
          <path strokeLinecap="round" d="M9 8h6M9 11h6M9 14h4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="px-5 pt-5">
      <div className="flex gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onTabChange(action.label as QuickActionTab)}
            className={`flex flex-1 flex-col items-center justify-center gap-2.5 rounded-[20px] py-6 text-center ${
              action.active
                ? "bg-[#e31d3b] border border-[#DC143C] text-white shadow-redSoft"
                : "bg-white border border-[#F5F5F5] text-[#666666] shadow-soft"
            }`}
          >
            <div>{action.icon}</div>
            <p className={`text-[14px] leading-tight ${action.active ? "font-bold text-white" : "font-semibold text-[#5d6067]"}`}>
              {action.label}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};