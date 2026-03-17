import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineLocationMarker, HiOutlineExternalLink, HiOutlineRefresh } from 'react-icons/hi';
import { fetchAgentLocations, type AgentLocation } from '../api/location';
import { getSocket, connectWebSocket } from '../services/websocket';

interface LivePosition {
  lat: number;
  lng: number;
  timestamp: string;
}

function getTimeSince(dateStr: string): { text: string; status: 'online' | 'idle' | 'offline' } {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return { text: 'Just now', status: 'online' };
  if (diffMin < 5) return { text: `${diffMin}m ago`, status: 'online' };
  if (diffMin < 15) return { text: `${diffMin}m ago`, status: 'idle' };
  if (diffMin < 60) return { text: `${diffMin}m ago`, status: 'offline' };
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return { text: `${hours}h ago`, status: 'offline' };
  return { text: `${Math.floor(hours / 24)}d ago`, status: 'offline' };
}

const statusColors = {
  online: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
  idle: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  offline: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400', border: 'border-gray-200' },
};

function AgentLocationCard({ agent, livePosition }: { agent: AgentLocation; livePosition?: LivePosition }) {
  const lat = livePosition?.lat ?? agent.last_known_lat;
  const lng = livePosition?.lng ?? agent.last_known_lng;
  const locationTime = livePosition?.timestamp ?? agent.last_location_at;
  const { text: timeText, status } = getTimeSince(locationTime);
  const colors = statusColors[status];
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const initial = agent.full_name.charAt(0).toUpperCase();

  return (
    <div className={`bg-white rounded-xl border ${colors.border} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${colors.bg} ${colors.text}`}>
            {initial}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${colors.dot} ${status === 'online' ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{agent.full_name}</p>
            {agent.assigned_city && (
              <p className="text-xs text-gray-500">{agent.assigned_city}</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} font-medium`}>
          {timeText}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <HiOutlineLocationMarker size={14} />
          <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View Map <HiOutlineExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}

export function LiveMapPage() {
  const { data: agents, refetch, isLoading } = useQuery({
    queryKey: ['agent-locations'],
    queryFn: fetchAgentLocations,
    refetchInterval: 30000,
  });

  const [livePositions, setLivePositions] = useState<Record<string, LivePosition>>({});

  useEffect(() => {
    let socket = getSocket();
    if (!socket) {
      try {
        socket = connectWebSocket();
      } catch {
        return;
      }
    }

    const handler = (data: { agentId: string; lat: number; lng: number; timestamp: string }) => {
      setLivePositions(prev => ({
        ...prev,
        [data.agentId]: { lat: data.lat, lng: data.lng, timestamp: data.timestamp },
      }));
    };

    socket.on('agent:location', handler);
    return () => { socket?.off('agent:location', handler); };
  }, []);

  const counts = useMemo(() => {
    if (!agents) return { online: 0, idle: 0, offline: 0 };
    let online = 0;
    let idle = 0;
    let offline = 0;
    for (const agent of agents) {
      const time = livePositions[agent.id]?.timestamp ?? agent.last_location_at;
      const { status } = getTimeSince(time);
      if (status === 'online') online++;
      else if (status === 'idle') idle++;
      else offline++;
    }
    return { online, idle, offline };
  }, [agents, livePositions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Live Agent Tracking</h1>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
        >
          <HiOutlineRefresh size={16} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{counts.online}</p>
          <p className="text-sm text-green-600">Online Now</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{counts.idle}</p>
          <p className="text-sm text-amber-600">Idle</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{counts.offline}</p>
          <p className="text-sm text-gray-500">Offline</p>
        </div>
      </div>

      {/* Agent grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading agent locations...</div>
      ) : !agents?.length ? (
        <div className="text-center py-12 text-gray-500">No agent location data available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <AgentLocationCard
              key={agent.id}
              agent={agent}
              livePosition={livePositions[agent.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
