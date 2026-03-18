import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getStoredAuth } from "./store/authStore";
import { connectWebSocket, disconnectWebSocket } from "./services/websocket";
import { AdminLayout } from "./components/layout/AdminLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CasesPage } from "./pages/CasesPage";
import { AgentsPage } from "./pages/AgentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { LiveMapPage } from "./pages/LiveMapPage";
import { AuditLogPage } from "./pages/AuditLogPage";
import { AppDistributionPage } from "./pages/AppDistributionPage";
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
        return <DashboardPage />;
      case "/cases":
        return <CasesPage />;
      case "/agents":
        return <AgentsPage />;
      case "/live-map":
        return <LiveMapPage />;
      case "/reports":
        return <ReportsPage />;
      case "/audit-log":
        return <AuditLogPage />;
      case "/app-distribution":
        return <AppDistributionPage />;
      case "/settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
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
