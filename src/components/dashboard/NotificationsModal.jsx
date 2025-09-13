import React from 'react';
import { X, ShoppingCart, BellIcon, Table as TableIcon, Utensils, Trash2, CheckCheck, Store, Package, Truck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationsModal = ({ isOpen, onClose }) => {
  const { notifications, markAllAsRead, clearAll } = useNotifications();

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'shopping-cart':
        return <ShoppingCart size={16} className="text-white" />;
      case 'table':
        return <TableIcon size={16} className="text-white" />;
      case 'utensils':
        return <Utensils size={16} className="text-white" />;
      case 'store':
        return <Store size={16} className="text-white" />;
      case 'package':
        return <Package size={16} className="text-white" />;
      case 'truck':
        return <Truck size={16} className="text-white" />;
      default:
        return <ShoppingCart size={16} className="text-white" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleClearAll = () => {
    clearAll();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 rounded-lg shadow-lg w-96 max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex rounded-t-lg bg-primary items-center justify-between p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold text-white">Notifications</h2>
          <button
            onClick={onClose}
            className="text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
                <BellIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No notifications</p>
              <p className="text-sm text-gray-500">You are all caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg bg-white border ${
                  notification.isRead ? 'opacity-60' : 'shadow-sm'
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.iconColor}`}>
                  {getIcon(notification.icon)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1">
                    {notification.description}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {formatTimeAgo(notification.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex space-x-2 p-4 border-t border-gray-300">
            <button
              onClick={handleClearAll}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              <Trash2 size={14} className="inline mr-2" />
              Clear All
            </button>
            <button
              onClick={handleMarkAllRead}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
            >
              <CheckCheck size={14} className="inline mr-2" />
              Mark All Read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsModal;