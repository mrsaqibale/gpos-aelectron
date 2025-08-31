import React from 'react';
import { X, FileText } from 'lucide-react';

const OrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  onCreateInvoice,
  foodDetails = null 
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl border-b border-gray-200">
          <h2 className="text-xl font-bold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100"
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
                <div className="mt-1 text-gray-900">{order.orderType}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Order Number:</span>
                <div className="mt-1 text-gray-900">{order.orderNumber}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Waiter:</span>
                <div className="mt-1 text-gray-900">{order.waiter}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <div className="mt-1 text-gray-900">{order.customer?.name || 'Walk-in Customer'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Table:</span>
                <div className="mt-1 text-gray-900">{order.table || 'None'}</div>
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
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <tr key={index} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div>
                            <div className="font-medium">{item.food?.name || 'Unknown Item'}</div>
                            {/* Show variations if any */}
                            {item.variations && Object.keys(item.variations).length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {Object.entries(item.variations).map(([variationId, selectedOption]) => {
                                  const variation = foodDetails?.variations?.find(v => v.id === parseInt(variationId));
                                  const variationName = variation?.name || variationId;
                                  const selections = Array.isArray(selectedOption) ? selectedOption : [selectedOption];
                                  
                                  return (
                                    <div key={variationId} className="flex items-center gap-1">
                                      <span className="text-gray-500">• {variationName}:</span>
                                      <span className="text-gray-700">
                                        {selections.map((optionId, idx) => {
                                          const option = variation?.options?.find(o => o.id === parseInt(optionId));
                                          return (
                                            <span key={optionId}>
                                              {option?.option_name || optionId}
                                              {idx < selections.length - 1 ? ', ' : ''}
                                            </span>
                                          );
                                        })}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {/* Show addons if any */}
                            {item.adons && item.adons.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {item.adons.map((addonId, idx) => {
                                  const addon = foodDetails?.adons?.find(a => a.id === parseInt(addonId));
                                  const addonName = addon?.name || addonId;
                                  const addonPrice = addon?.price;
                                  
                                  return (
                                    <div key={idx} className="flex items-center gap-1">
                                      <span className="text-gray-500">• Addon:</span>
                                      <span className="text-gray-700">{addonName}</span>
                                      {addonPrice && <span className="text-gray-500">(+€{addonPrice.toFixed(2)})</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          €{(parseFloat(item.totalPrice) / parseFloat(item.quantity)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          €0.00
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-gray-800">
                          €{parseFloat(item.totalPrice).toFixed(2)}
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
                <span className="text-gray-600">Total Item:</span>
                <span className="font-semibold">
                  {order.items ? order.items.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sub Total:</span>
                <span className="font-semibold">
                  €{(order.total / 1.135).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Discount:</span>
                <span className="font-semibold">
                  €{order.coupon ? order.coupon.discount : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="font-semibold">
                  €{(order.total * 0.135 / 1.135).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-semibold">
                  €{order.coupon ? order.coupon.discount : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Charge:</span>
                <span className="font-semibold">€0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tips:</span>
                <span className="font-semibold">€0.00</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="text-lg font-semibold text-gray-800">Total Payable:</span>
                <span className="text-xl font-bold text-gray-800">
                  €{order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCreateInvoice}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={20} />
            Create Invoice & Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
