import React from 'react';
import {
  Clock,
  User,
  MapPin,
  ChefHat,
  CheckCircle,
  AlertTriangle,
  Plus,
  Utensils
} from 'lucide-react';

const KDSCard = ({
  order,
  onUpdateItemStatus,
  onUpdateOrderStatus,
  onCompleteOrder,
  onCookAll,
  onMarkAllReady,
  formatElapsedTime
}) => {

  const getItemStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'preparing': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'ready': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTimeColor = (elapsedTime) => {
    if (elapsedTime > 1200) return 'text-red-600'; // 20+ minutes
    if (elapsedTime > 900) return 'text-orange-600'; // 15+ minutes
    if (elapsedTime > 600) return 'text-yellow-600'; // 10+ minutes
    return 'text-green-600';
  };

  const allItemsReady = order.items.every(item => item.status === 'ready');
  const hasPreparingItems = order.items.some(item => item.status === 'preparing');
  const allItemsNew = order.items.every(item => item.status === 'new');

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-primary">#{order.id}</span>

          </div>
          <div className={`text-sm font-bold ${getTimeColor(order.elapsedTime)}`}>
            <Clock size={16} className="inline mr-1" />
            {formatElapsedTime(order.elapsedTime)}
          </div>
        </div>
        <div className='flex justify-between items-center mt-2'>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            <span>Table {order.tableNumber}</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderType === 'Dine-In' ? 'bg-primaryExtraLight text-primary' :
              order.orderType === 'Takeaway' ? 'bg-primaryExtraLight text-primary' :
                'bg-primaryExtraLight text-primary'
            }`}>
            {order.orderType}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <User size={14} />
          <span>{order.customer}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="p-4">
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{item.name}</span>

                </div>
                {item.notes && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-orange-600">
                    <AlertTriangle size={12} />
                    <span>{item.notes}</span>
                  </div>
                )}
                {item.isAddedLate && (
                  <span className="bg-yellow-100 mt-2 text-yellow-800 w-[90px] py-1 rounded-full text-xs font-medium flex items-center justify-center gap-1">
                    <Plus size={10} />
                    Added Late
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getItemStatusColor(item.status)}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>

                <div className="flex gap-1">
                  {item.status === 'new' && (
                    <button
                      onClick={() => onUpdateItemStatus(order.id, item.id, 'preparing')}
                      className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors"
                    >
                      Cook
                    </button>
                  )}

                  {item.status === 'preparing' && (
                    <button
                      onClick={() => onUpdateItemStatus(order.id, item.id, 'ready')}
                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                    >
                      Ready
                    </button>
                  )}

                  {item.status === 'ready' && (
                    <CheckCircle size={16} className="text-green-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Card Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex gap-2">
            {allItemsNew && (
              <button
                onClick={() => onCookAll(order.id)}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
              >
                Cook All
              </button>
            )}

            {hasPreparingItems && !allItemsReady && (
              <button
                onClick={() => onMarkAllReady(order.id)}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                Mark All Ready
              </button>
            )}

            {allItemsReady && (
              <button
                onClick={() => onCompleteOrder(order.id)}
                className="flex-1 bg-primaryLight text-white py-2 px-4 rounded-lg hover:bg-primary transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KDSCard;