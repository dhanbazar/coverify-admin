import { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineCheck, HiOutlineCheckCircle, HiOutlineInformationCircle, HiOutlineExclamation, HiOutlineX } from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { fetchNotifications, markNotificationRead, markAllRead, type Notification } from '../api/notifications';

const typeIcons: Record<Notification['type'], React.ReactNode> = {
  info: <HiOutlineInformationCircle size={18} className="text-blue-500" />,
  success: <HiOutlineCheckCircle size={18} className="text-green-500" />,
  warning: <HiOutlineExclamation size={18} className="text-amber-500" />,
  error: <HiOutlineX size={18} className="text-red-500" />,
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(1, 20),
    enabled: open,
    refetchInterval: open ? 15000 : false,
  });

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const notifications = data?.notifications ?? [];

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
        <button
          onClick={() => markAllMutation.mutate()}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
        >
          <HiOutlineCheck size={14} />
          Mark all read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.is_read) markReadMutation.mutate(n.id);
              }}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 ${
                !n.is_read ? 'bg-indigo-50/50' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">{typeIcons[n.type]}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
              {!n.is_read && (
                <span className="mt-2 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
