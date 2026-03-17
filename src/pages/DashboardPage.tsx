import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { HiOutlineBriefcase, HiOutlineClock, HiOutlineUsers, HiOutlineExclamation } from "react-icons/hi";
import { fetchDashboardStats, fetchCaseTrends, fetchAgentPerformance } from "../api/dashboard";
import { getSocket, connectWebSocket } from "../services/websocket";

function StatCard({
  label, value, icon, color, change,
}: {
  label: string; value: string | number; icon: React.ReactNode; color: string; change?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
          {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
        </div>
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["case-trends"],
    queryFn: () => fetchCaseTrends(30),
  });

  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ["agent-performance"],
    queryFn: fetchAgentPerformance,
  });

  // Real-time case update listener via WebSocket
  useEffect(() => {
    let socket = getSocket();
    if (!socket) {
      try {
        socket = connectWebSocket();
      } catch {
        return;
      }
    }

    const handleCaseUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      void queryClient.invalidateQueries({ queryKey: ["case-trends"] });
      void queryClient.invalidateQueries({ queryKey: ["agent-performance"] });
    };

    socket.on("case:updated", handleCaseUpdate);
    socket.on("case:created", handleCaseUpdate);

    return () => {
      socket?.off("case:updated", handleCaseUpdate);
      socket?.off("case:created", handleCaseUpdate);
    };
  }, [queryClient]);

  // Fallback data when API is not connected
  const displayStats = stats ?? {
    totalCases: 0,
    activeCases: 0,
    completedToday: 0,
    avgTatHours: 0,
    tatBreachRate: 0,
    activeAgents: 0,
    pendingReview: 0,
  };

  const displayTrends = trends ?? [];
  const displayAgents = agents ?? [];
  const isLoading = statsLoading && trendsLoading && agentsLoading;

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="text-center py-4 text-gray-400 text-sm">Loading dashboard data...</div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Cases" value={displayStats.totalCases} icon={<HiOutlineBriefcase size={24} />} color="#5B4FCF" />
        <StatCard label="Active Cases" value={displayStats.activeCases} icon={<HiOutlineClock size={24} />} color="#F59E0B" />
        <StatCard label="Active Agents" value={displayStats.activeAgents} icon={<HiOutlineUsers size={24} />} color="#10B981" />
        <StatCard label="Pending Review" value={displayStats.pendingReview} icon={<HiOutlineExclamation size={24} />} color="#EF4444" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Case Trends (30 days)</h3>
          {displayTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#5B4FCF" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No trend data available
            </div>
          )}
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Agent Performance</h3>
          {displayAgents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayAgents}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agentName" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="casesCompleted" fill="#5B4FCF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm">
              No agent data available
            </div>
          )}
        </div>
      </div>

      {/* TAT Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">TAT Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{displayStats.avgTatHours}h</p>
            <p className="text-sm text-gray-500">Avg TAT</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{displayStats.tatBreachRate}%</p>
            <p className="text-sm text-gray-500">Breach Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{displayStats.completedToday}</p>
            <p className="text-sm text-gray-500">Completed Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
