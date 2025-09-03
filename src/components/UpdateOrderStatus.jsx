import React, { useState } from 'react';
import { X, Clock, CheckCircle, Star, Truck } from 'lucide-react';

const UpdateOrderStatus = ({ 
  isOpen, 
  onClose, 
  order, 
  onStatusUpdate, 
  onRiderAssignment,
  selectedStatus,
  onStatusChange,
  isUpdating = false
}) => {
  if (!isOpen || !order) return null;

  // Get statuses based on order type
  const getStatusesForOrderType = (orderType) => {
    switch (orderType) {
      case 'In Store':
        return [
          { key: 'New', label: 'New', icon: <Clock size={20} />, disabled: false },
          { key: 'In Progress', label: 'In Progress', icon: <Clock size={20} />, disabled: false },
          { key: 'Ready', label: 'Ready', icon: <CheckCircle size={20} />, disabled: false },
          { key: 'Completed', label: 'Completed', icon: <Star size={20} />, disabled: false }
        ];
      case 'Table':
      case 'Dine In':
      case 'Collection':
        return [
          { key: 'New', label: 'New', icon: <Clock size={20} />, disabled: false },
          { key: 'In Progress', label: 'In Progress', icon: <Clock size={20} />, disabled: false },
          { key: 'Ready', label: 'Ready', icon: <CheckCircle size={20} />, disabled: false },
          { key: 'Completed', label: 'Completed', icon: <Star size={20} />, disabled: false }
        ];
      case 'Delivery':
        return [
          { key: 'New', label: 'New', icon: <Clock size={20} />, disabled: false },
          { key: 'In Progress', label: 'In Progress', icon: <Clock size={20} />, disabled: false },
          { key: 'Ready', label: 'Ready', icon: <CheckCircle size={20} />, disabled: false },
          { key: 'On the way', label: 'On the way', icon: <Truck size={20} />, disabled: false },
          { key: 'Delivered', label: 'Delivered', icon: <CheckCircle size={20} />, disabled: false },
          { key: 'Completed', label: 'Completed', icon: <Star size={20} />, disabled: false }
        ];
      default:
        return [
          { key: 'New', label: 'New', icon: <Clock size={20} />, disabled: false },
          { key: 'In Progress', label: 'In Progress', icon: <Clock size={20} />, disabled: false },
          { key: 'Ready', label: 'Ready', icon: <CheckCircle size={20} />, disabled: false },
          { key: 'Completed', label: 'Completed', icon: <Star size={20} />, disabled: false }
        ];
    }
  };

  const handleStatusSelect = (status) => {
    if (!status.disabled) {
      // Check if this is "On the way" for delivery orders
      if (order.orderType === 'Delivery' && status.key === 'On the way') {
        // Show rider assignment modal first
        onClose();
        if (onRiderAssignment) {
          onRiderAssignment();
        }
      } else {
        onStatusChange(status.key);
      }
    }
  };

  const handleUpdateStatus = () => {
    if (onStatusUpdate) {
      onStatusUpdate(selectedStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold">Update Order Status</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Information */}
        <div className="p-6 bg-gray-50">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600 mb-1">
              Type: {order.orderType || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              Current: {order.status || 'Pending'}
            </p>
          </div>
        </div>

        {/* Status Selection */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getStatusesForOrderType(order.orderType).map((status) => (
                <button
                  key={status.key}
                  onClick={() => handleStatusSelect(status)}
                  className={`p-4 rounded-lg border-2 transition-all ${status.disabled
                      ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                      : selectedStatus === status.key
                        ? 'bg-white border-primary text-primary cursor-pointer' // Selected state
                        : 'bg-primary text-white border-primary hover:bg-primary/90 cursor-pointer' // Default state
                  }`}
                  disabled={status.disabled}
                >
                  <div className="flex items-center justify-center gap-2">
                    {status.icon}
                    <span className="font-medium">{status.label}</span>
                  </div>
                </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              isUpdating
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary cursor-pointer'
            }`}
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrderStatus;