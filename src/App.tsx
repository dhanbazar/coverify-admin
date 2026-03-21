import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getStoredAuth } from "./store/authStore";
import { connectWebSocket, disconnectWebSocket } from "./services/websocket";
import { AdminLayout } from "./components/layout/AdminLayout";
import RoleGuard from "./components/RoleGuard";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CasesPage } from "./pages/CasesPage";
import { AgentsPage } from "./pages/AgentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LiveMapPage } from "./pages/LiveMapPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { AppDistributionPage } from "./pages/AppDistributionPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/cases": "Case Management",
  "/agents": "Agent Management",
  "/live-map": "Live Agent Map",
  "/reports": "Reports",
  "/audit-log": "Audit Log",
  "/app-distribution": "App Distribution",
  "/users": "User Management",
  "/settings": "Settings",
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getStoredAuth().isAuthenticated,
  );
  const [currentPath, setCurrentPath] = useState("/");

  useEffect(() => {
    const auth = getStoredAuth();
    setIsAuthenticated(auth.isAuthenticated);
  }, []);

  // WebSocket lifecycle: connect on auth, disconnect on logout
  useEffect(() => {
    if (isAuthenticated) {
      try {
        connectWebSocket();
      } catch {
        // Auth token may not be available yet, WebSocket will connect later
      }
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoginPage onLogin={() => setIsAuthenticated(true)} />
      </QueryClientProvider>
    );
  }

  const renderPage = () => {
    switch (currentPath) {
      case "/":
        return (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <DashboardPage />
          </RoleGuard>
        );
      case "/cases":
        return (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <CasesPage />
          </RoleGuard>
        );
      case "/agents":
        return (
          <RoleGuard allowedRoles={["admin"]}>
            <AgentsPage />
          </RoleGuard>
        );
      case "/live-map":
        return (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <LiveMapPage />
          </RoleGuard>
        );
      case "/reports":
        return (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <ReportsPage />
          </RoleGuard>
        );
      case "/audit-log":
        return (
          <RoleGuard allowedRoles={["admin"]}>
            <AuditLogPage />
          </RoleGuard>
        );
      case "/app-distribution":
        return (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <AppDistributionPage />
          </RoleGuard>
        );
      case "/users":
        return (
          <RoleGuard allowedRoles={["admin"]}>
            <UserManagementPage />
          </RoleGuard>
        );
      case "/settings":
        return (
          <RoleGuard allowedRoles={["admin"]}>
            <SettingsPage />
          </RoleGuard>
        );
      default:
        return (
          <RoleGuard allowedRoles={["admin", "manager"]}>
            <DashboardPage />
          </RoleGuard>
        );
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayout
        title={PAGE_TITLES[currentPath] ?? "Dashboard"}
        currentPath={currentPath}
        onNavigate={setCurrentPath}
      >
        {renderPage()}
      </AdminLayout>
    </QueryClientProvider>
  );
}

export default App;
