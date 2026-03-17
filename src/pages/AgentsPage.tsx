import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineUserAdd, HiOutlineLocationMarker } from "react-icons/hi";
import { fetchAgents } from "../api/agents";

export function AgentsPage() {
  const [, setShowAddModal] = useState(false);

  const { data: agents } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  // Mock data
  const mockAgents = agents ?? [
    { id: "1", fullName: "Rajesh Kumar", email: "rajesh@coanfiss.com", phone: "9876543210", assignedCity: "Ahmedabad", isActive: true, activeCases: 5, completedCases: 45, avgTatHours: 5.2, lastLocationLat: 23.0225, lastLocationLng: 72.5714, lastLocationAt: new Date().toISOString() },
    { id: "2", fullName: "Priya Sharma", email: "priya@coanfiss.com", phone: "9876543211", assignedCity: "Surat", isActive: true, activeCases: 3, completedCases: 52, avgTatHours: 4.8, lastLocationLat: 21.1702, lastLocationLng: 72.8311, lastLocationAt: new Date().toISOString() },
    { id: "3", fullName: "Amit Patel", email: "amit@coanfiss.com", phone: "9876543212", assignedCity: "Mumbai", isActive: false, activeCases: 0, completedCases: 38, avgTatHours: 7.1, lastLocationLat: null, lastLocationLng: null, lastLocationAt: null },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{mockAgents.length} agents registered</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <HiOutlineUserAdd size={18} />
          Add Agent
        </button>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAgents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  {agent.fullName.split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{agent.fullName}</h3>
                  <p className="text-sm text-gray-500">{agent.email}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {agent.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-indigo-600">{agent.activeCases}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{agent.completedCases}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-600">{agent.avgTatHours}h</p>
                <p className="text-xs text-gray-500">Avg TAT</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1 text-sm text-gray-500">
              <HiOutlineLocationMarker size={14} />
              <span>{agent.assignedCity}</span>
              {agent.lastLocationAt && (
                <span className="ml-auto text-xs text-green-500">
                  Online
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
