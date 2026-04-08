import { useState } from "react";
import {
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineDocumentReport,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLocationMarker,
  HiOutlineShieldCheck,
  HiOutlineDownload,
  HiOutlineUserGroup,
  HiOutlineX,
} from "react-icons/hi";
import { clearStoredAuth } from "../../store/authStore";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <HiOutlineHome size={20} />, path: "/" },
  { label: "Cases", icon: <HiOutlineBriefcase size={20} />, path: "/cases" },
  { label: "Agents", icon: <HiOutlineUsers size={20} />, path: "/agents" },
  { label: "Live Map", icon: <HiOutlineLocationMarker size={20} />, path: "/live-map" },
  { label: "Reports", icon: <HiOutlineDocumentReport size={20} />, path: "/reports" },
  { label: "Audit Log", icon: <HiOutlineShieldCheck size={20} />, path: "/audit-log" },
  { label: "App Distribution", icon: <HiOutlineDownload size={20} />, path: "/app-distribution" },
  { label: "Users", icon: <HiOutlineUserGroup size={20} />, path: "/users" },
  { label: "Settings", icon: <HiOutlineCog size={20} />, path: "/settings" },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onClose?: () => void;
}

export function Sidebar({ currentPath, onNavigate, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = "/login";
  };

  return (
    <aside
      className={`flex flex-col bg-gray-900 text-white h-full transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
            CV
          </div>
          {!collapsed && <span className="font-bold text-lg">CoVerify</span>}
        </div>
        {/* Close button — mobile only */}
        {onClose && !collapsed && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
          >
            <HiOutlineX size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              currentPath === item.path
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <HiOutlineLogout size={20} />
          {!collapsed && "Sign Out"}
        </button>
        {/* Collapse toggle — hidden on mobile */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex w-full items-center justify-center py-2 text-gray-500 hover:text-white"
        >
          {collapsed ? <HiOutlineChevronRight size={16} /> : <HiOutlineChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
