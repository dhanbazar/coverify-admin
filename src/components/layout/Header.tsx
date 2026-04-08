import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineBell, HiOutlineSearch, HiOutlineMenu } from "react-icons/hi";
import { getStoredAuth } from "../../store/authStore";
import { getUnreadCount } from "../../api/notifications";
import { NotificationPanel } from "../NotificationPanel";

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  const { user } = getStoredAuth();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
        >
          <HiOutlineMenu size={22} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search — hidden on small screens */}
        <div className="relative hidden sm:block">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <HiOutlineBell size={20} />
            {(unreadCount ?? 0) > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount! > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* User — name hidden on small screens */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm shrink-0">
            {user?.fullName?.charAt(0) ?? "A"}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:inline">
            {user?.fullName ?? "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
