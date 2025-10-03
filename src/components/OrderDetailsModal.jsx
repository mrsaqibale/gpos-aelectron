import React from 'react';
import { X, CreditCard, UtensilsCrossed, AlertCircle, CheckCircle, RefreshCw, Printer } from 'lucide-react';

const OrderDetailsModal = ({ 
  isOpen, 
  onClose, 
  order, 
  orderDetails = [],
  onCreateInvoice,
  foodDetails = null 
}) => {
  if (!isOpen || !order) return null;

  // Calculate totals
  const totalItems = orderDetails.reduce((total, item) => total + (parseInt(item.quantity) || 0), 0);
  const subTotal = orderDetails.reduce((total, item) => total + (parseFloat(item.price || 0) * parseInt(item.quantity || 1)), 0);
  const totalDiscount = orderDetails.reduce((total, item) => total + parseFloat(item.discount || 0), 0);
  const tax = order.tax_amount || 0;
  const totalPayable = parseFloat(order.order_amount || 0);

  // Get payment status
  const paymentStatus = order.payment_status || order.paid_status || 'unpaid';
  const isPaid = paymentStatus === 'paid' || paymentStatus === 1;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Order Information */}
          <div className="w-64 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Order ID */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Order ID</div>
                <div className="text-3xl font-bold text-primary">{order.order_number || order.id}</div>
              </div>

              {/* Customer Name */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Customer Name</div>
                <div className="text-base font-medium text-gray-900">{order.customer_name || 'Walk-in Customer'}</div>
              </div>

              {/* Order Date */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Order Date</div>
                <div className="text-base font-medium text-gray-900">
                  {new Date(order.created_at).toLocaleDateString('en-CA')}
                </div>
              </div>

              {/* Order Type */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Order Type</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1">
                    <UtensilsCrossed size={14} />
                    {order.order_type || 'Dine-In'}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${
                    order.order_status === 'completed' || order.order_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    order.order_status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    order.order_status === 'new' ? 'bg-blue-100 text-blue-700' :
                    order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    <AlertCircle size={14} />
                    {order.order_status || 'Pending'}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Payment</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${
                    isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isPaid ? <CheckCircle size={14} /> : <X size={14} />}
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              {/* Method */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Method</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="bg-white border border-gray-300 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2 text-gray-700">
                    <CreditCard size={14} />
                    {order.payment_method || 'Paid with Cash'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-xs border-b border-gray-200 font-semibold text-gray-600 uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Item</th>
                      <th className="px-4 py-3 text-center">Price</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-center">Discount</th>
                      <th className="px-4 py-3 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {orderDetails && orderDetails.length > 0 ? (
                      orderDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <div className="font-semibold text-gray-900">{item.food_name || 'Unknown Item'}</div>
                              {item.food_description && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {item.food_description}
                                </div>
                              )}
                              {item.category_name && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Category: {item.category_name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">
                            €{parseFloat(item.price || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">
                            {item.quantity || 1}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700">
                            €{parseFloat(item.discount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">
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

              {/* Summary Totals */}
              <div className="bg-[#F8F9FA] border border-[#e9ecef] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold text-gray-900">{totalItems}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sub Total:</span>
                  <span className="font-semibold text-gray-900">€{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-semibold text-gray-900">€{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-900">€{parseFloat(tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-3 mt-2">
                  <span className="text-base font-semibold text-gray-900">Total Payable:</span>
                  <span className="text-xl font-bold text-primary">€{totalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Add re-order functionality here
                  console.log('Re-order clicked');
                }}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Re-order
              </button>
              <button
                onClick={() => {
                  // Add print functionality here
                  window.print();
                }}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
