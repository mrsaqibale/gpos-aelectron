import React from 'react';
import { X, FileText } from 'lucide-react';

const OrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  orderDetails = [],
  onCreateInvoice,
  foodDetails = null 
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Order Information Section */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Order Type:</span>
                <div className="mt-1 text-gray-900">{order.order_type || 'N/A'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Order Number:</span>
                <div className="mt-1 text-gray-900">{order.order_number || order.id}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <div className="mt-1 text-gray-900">{order.order_status || 'N/A'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <div className="mt-1 text-gray-900">{order.customer_name || 'Walk-in Customer'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <div className="mt-1 text-gray-900">{new Date(order.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-sm font-medium text-gray-700">
                    <th className="px-4 py-3 text-left">Item</th>
                    <th className="px-4 py-3 text-center">Price</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-center">Discount</th>
                    <th className="px-4 py-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {orderDetails && orderDetails.length > 0 ? (
                    orderDetails.map((item, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{item.food_name || 'Unknown Item'}</div>
                            {item.food_description && (
                              <div className="text-xs text-gray-600 mt-1">
                                {item.food_description}
                              </div>
                            )}
                            {item.category_name && (
                              <div className="text-xs text-gray-500 mt-1">
                                Category: {item.category_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          €{parseFloat(item.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {item.quantity || 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          €{parseFloat(item.discount || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-gray-800">
                          €{parseFloat(item.total_price || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold">
                  {orderDetails.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total:</span>
                <span className="font-semibold">
                  €{orderDetails.reduce((total, item) => total + (parseFloat(item.price || 0) * parseInt(item.quantity || 1)), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Discount:</span>
                <span className="font-semibold">
                  €{orderDetails.reduce((total, item) => total + parseFloat(item.discount || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">
                  €{((orderDetails.reduce((total, item) => total + parseFloat(item.total_price || 0), 0) * 0.135) / 1.135).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-lg font-semibold text-gray-800">Total Payable:</span>
                <span className="text-xl font-bold text-gray-800">
                  €{parseFloat(order.order_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
