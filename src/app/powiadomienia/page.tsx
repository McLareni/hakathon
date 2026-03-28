"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

type DashboardUser = {
  id: string;
};

type NotificationItemData = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  actionUrl: string | null;
  isVirtual?: boolean;
};

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PowiadomieniaPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<NotificationItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "unread">("all");

  useEffect(() => {
    const load = async () => {
      try {
        const dashboardRes = await fetch("/api/dashboard", { cache: "no-store" });
        if (!dashboardRes.ok) throw new Error("dashboard failed");
        const dashboardPayload = (await dashboardRes.json()) as { user: DashboardUser | null };
        if (!dashboardPayload.user?.id) {
          setItems([]);
          return;
        }

        setUserId(dashboardPayload.user.id);

        const notificationsRes = await fetch(
          `/api/notifications?userId=${dashboardPayload.user.id}`,
          { cache: "no-store" },
        );
        if (!notificationsRes.ok) throw new Error("notifications failed");

        const notificationsPayload = (await notificationsRes.json()) as {
          notifications: NotificationItemData[];
        };
        setItems(notificationsPayload.notifications ?? []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  const visibleItems = useMemo(
    () => (tab === "all" ? items : items.filter((item) => !item.read)),
    [items, tab],
  );

  const markAsRead = async (id: string) => {
    if (!userId) return;

    const target = items.find((item) => item.id === id);
    if (target?.isVirtual) return;

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );

    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Keep optimistic UI state for smoother UX.
    }
  };

  return (
    <div className="min-h-screen bg-[#606164] flex justify-center items-start  font-sans text-[#1b1b1f]">
      
      <main className="relative w-full max-w-103.5 bg-[#f5f5f5] min-h-screen sm:min-h-224 overflow-hidden flex flex-col">
        
        {/* Контентна область */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-10">
          
          {/* Header Section */}
          <div className="px-5 mb-6">
            {/* Кнопка тепер веде строго на головну / */}
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center text-[#e32129] font-bold text-[16px] mb-6 hover:opacity-70 transition-opacity"
            >
              <ChevronLeft size={24} strokeWidth={3} className="mr-1" />
              Strona główna
            </button>
            
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-[34px] font-black text-[#1a1e27] tracking-tight">
                Powiadomienia
              </h1>
              {/* Badge */}
              <div className="bg-[#e32129] text-white text-[15px] font-black w-7 h-7 rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              <button
                onClick={() => setTab("all")}
                className={`${
                  tab === "all"
                    ? "bg-[#e32129] text-white shadow-[0_4px_12px_rgba(227,33,41,0.2)]"
                    : "bg-white text-[#8e8e93] border border-gray-100 shadow-sm"
                } font-bold px-6 py-3 rounded-[12px] transition-all`}
              >
                Wszystkie ({items.length})
              </button>
              <button
                onClick={() => setTab("unread")}
                className={`${
                  tab === "unread"
                    ? "bg-[#e32129] text-white shadow-[0_4px_12px_rgba(227,33,41,0.2)]"
                    : "bg-white text-[#8e8e93] border border-gray-100 shadow-sm"
                } font-bold px-5 py-3 rounded-[12px] transition-all`}
              >
                Nieprzeczytane ({unreadCount})
              </button>
            </div>
          </div>

          <div className="px-5 space-y-3">
            {loading ? (
              <div className="rounded-3xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse h-24" />
            ) : visibleItems.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 text-center text-[#9ca3af] font-medium">
                Brak powiadomień
              </div>
            ) : (
              visibleItems.map((item) => {
                const content = (
                  <NotificationItem
                    title={item.title}
                    desc={item.description}
                    time={formatRelativeDate(item.createdAt)}
                    isUnread={!item.read}
                  />
                );

                if (item.actionUrl) {
                  return (
                    <Link
                      key={item.id}
                      href={item.actionUrl}
                      onClick={() => {
                        void markAsRead(item.id);
                      }}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      void markAsRead(item.id);
                    }}
                    className="w-full text-left"
                  >
                    {content}
                  </button>
                );
              })
            )}
          </div>

         </div>
      </main>
    </div>
  );
}

// Допоміжний компонент сповіщення
function NotificationItem({
  title,
  desc,
  time,
  isUnread,
}: {
  title: string;
  desc: string;
  time: string;
  isUnread: boolean;
}) {
  return (
    <div className={`relative bg-white p-4 my-2 rounded-[20px] shadow-sm border ${isUnread ? 'border-blue-50' : 'border-gray-50'} flex gap-4 transition-all active:scale-[0.98]`}>
      {isUnread && (
        <div className="absolute top-4 right-4 w-2 h-2 bg-[#e32129] rounded-full" />
      )}
      <div className="w-10 h-10 rounded-full bg-[#fce8e9] flex items-center justify-center shrink-0 text-[#e32129]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M9 12h6M9 16h6M13 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9l-5-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13 2v7h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className={`text-[15px] ${isUnread ? 'font-black' : 'font-bold'} text-[#1a1e27]`}>
          {title}
        </h3>
        <p className="text-[13px] text-[#9ca3af] font-medium leading-snug pr-4">
          {desc}
        </p>
        <span className="text-[11px] text-[#d1d5db] font-bold mt-1">
          {time}
        </span>
      </div>
    </div>
  );
}