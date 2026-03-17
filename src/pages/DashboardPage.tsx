import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { HiOutlineBriefcase, HiOutlineClock, HiOutlineUsers, HiOutlineExclamation } from "react-icons/hi";
import { fetchDashboardStats, fetchCaseTrends, fetchAgentPerformance } from "../api/dashboard";

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
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  const { data: trends } = useQuery({
    queryKey: ["case-trends"],
    queryFn: () => fetchCaseTrends(30),
  });

  const { data: agents } = useQuery({
    queryKey: ["agent-performance"],
    queryFn: fetchAgentPerformance,
  });

  // Placeholder data when API is not connected
  const mockStats = stats ?? {
    totalCases: 1247,
    activeCases: 89,
    completedToday: 23,
    avgTatHours: 6.4,
    tatBreachRate: 4.2,
    activeAgents: 15,
    pendingReview: 12,
  };

  const mockTrends = trends ?? [
    { date: "Mar 1", submitted: 18, approved: 15, rejected: 2 },
    { date: "Mar 5", submitted: 22, approved: 19, rejected: 1 },
    { date: "Mar 10", submitted: 27, approved: 24, rejected: 3 },
    { date: "Mar 15", submitted: 20, approved: 18, rejected: 1 },
  ];

  const mockAgents = agents ?? [
    { agentId: "1", agentName: "Rajesh K.", casesCompleted: 45, avgTatHours: 5.2, tatBreachCount: 1 },
    { agentId: "2", agentName: "Priya S.", casesCompleted: 52, avgTatHours: 4.8, tatBreachCount: 0 },
    { agentId: "3", agentName: "Amit P.", casesCompleted: 38, avgTatHours: 7.1, tatBreachCount: 3 },
    { agentId: "4", agentName: "Sneha M.", casesCompleted: 41, avgTatHours: 5.9, tatBreachCount: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Cases" value={mockStats.totalCases} icon={<HiOutlineBriefcase size={24} />} color="#5B4FCF" />
        <StatCard label="Active Cases" value={mockStats.activeCases} icon={<HiOutlineClock size={24} />} color="#F59E0B" />
        <StatCard label="Active Agents" value={mockStats.activeAgents} icon={<HiOutlineUsers size={24} />} color="#10B981" />
        <StatCard label="Pending Review" value={mockStats.pendingReview} icon={<HiOutlineExclamation size={24} />} color="#EF4444" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Trends */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Case Trends (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockTrends}>
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
        </div>

        {/* Agent Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Agent Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockAgents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentName" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="casesCompleted" fill="#5B4FCF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TAT Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">TAT Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{mockStats.avgTatHours}h</p>
            <p className="text-sm text-gray-500">Avg TAT</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-500">{mockStats.tatBreachRate}%</p>
            <p className="text-sm text-gray-500">Breach Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{mockStats.completedToday}</p>
            <p className="text-sm text-gray-500">Completed Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
