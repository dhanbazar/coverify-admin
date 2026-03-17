import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function AdminLayout({ children, title, currentPath, onNavigate }: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
