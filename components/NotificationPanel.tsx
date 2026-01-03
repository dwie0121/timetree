
import React from 'react';
import { X, Bell, Calendar as CalendarIcon, Info } from 'lucide-react';
import { AppNotification } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onClear: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onClear }) => {
  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-4">
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClear}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No new notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3">
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                notif.type === 'creation' ? 'bg-green-100 text-green-600' :
                notif.type === 'reminder' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {notif.type === 'creation' ? <CalendarIcon size={14} /> : <Info size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{notif.message}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">
                  {formatDistanceToNow(notif.time, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
