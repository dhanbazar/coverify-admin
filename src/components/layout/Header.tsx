import { HiOutlineBell, HiOutlineSearch } from "react-icons/hi";
import { getStoredAuth } from "../../store/authStore";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = getStoredAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
          <HiOutlineBell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
            {user?.fullName?.charAt(0) ?? "A"}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {user?.fullName ?? "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
