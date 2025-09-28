import React, { useEffect, useState } from 'react';
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset success state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

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
  const statuses = getStatusesForOrderType(order.orderType);
  let colCount = 4;
  if(statuses.length == 6 ){
    colCount = 3;
  } else {
    colCount = 4;
  }

  const gridColsClass = `grid grid-cols-${colCount} gap-2`;

  const handleStatusSelect = (status) => {
    if (!status.disabled) {
      // Check if this is "On the way" for delivery orders
      if (order.orderType === 'Delivery' && status.key === 'On the way') {
        // For delivery orders with "On the way" status, immediately trigger rider assignment
        handleClose();
        if (onRiderAssignment) {
          onRiderAssignment();
        }
      } else {
        // For all other statuses, just update the selected status
        onStatusChange(status.key);
      }
    }
  };

  const handleUpdateStatus = () => {
    if (onStatusUpdate) {
      // Show success state first
      setShowSuccess(true);

      // Update the status normally
      onStatusUpdate(selectedStatus);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold">Update Order Status</h2>
          <button
            onClick={handleClose}
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
          <div className={gridColsClass}>
            {statuses.map((status) => (
              <button
                key={status.key}
                onClick={() => handleStatusSelect(status)}
                className={`p-1 rounded-lg border-2 transition-all ${status.disabled
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

        {/* Success Message */}
        {showSuccess && (
          <div className="px-6 py-3 bg-green-50 border-t border-green-200">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span className="font-medium">Status updated successfully!</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${isUpdating
              ? 'bg-gray-400 text-gray-400 cursor-not-allowed'
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