import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Invoice = ({ 
  order, 
  isOpen, 
  onClose, 
  onPrint,
  foodDetails = null,
  isKitchen = false,
  isEmployee = false,
  paymentStatus = "PAID"
}) => {
  const { themeColors } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(false);

  // Fetch settings when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isOpen) return;
      
      setLoadingSettings(true);
      try {
        const result = await window.electronAPI.invoke('settings:get');
        if (result.success && result.data) {
          setSettings(result.data);
        }
      } catch (error) {
        console.error('Error fetching settings for invoice:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [isOpen]);

  if (!isOpen || !order) return null;

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Calculate totals
  const calculateSubtotal = () => {
    if (!order.items) return 0;
    return order.items.reduce((total, item) => total + parseFloat(item.totalPrice), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    // Get tax rate from settings, fallback to 13.5% VAT
    const settings = typeof window !== 'undefined' ? (window.appSettings?.current || {}) : {};
    const taxRate = parseFloat(settings?.standard_tax || settings?.food_tax || 13.5);
    return (subtotal * taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    
    // Get delivery and service settings
    const settings = typeof window !== 'undefined' ? (window.appSettings?.current || {}) : {};
    const deliveryFeePerKm = parseFloat(settings?.delivery_fee_per_km || 2.00);
    const serviceFee = order.orderType === 'Delivery' ? 0.75 : 0; // This could be made configurable too
    const bagFee = 0.22; // This could be made configurable too
    
    const deliveryCharge = order.orderType === 'Delivery' ? deliveryFeePerKm : 0;
    
    return subtotal + tax + deliveryCharge + serviceFee + bagFee;
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <>
      <style>
        {`
          @media print {
            .invoice-print-content {
              width: 3in !important;
              max-width: 3in !important;
              margin: 0 auto !important;
            }
            body {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col" style={{ width: '3in', maxWidth: '3in' }}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              {isKitchen ? 'Kitchen Order' : isEmployee ? 'Employee Copy' : 'Print Invoice'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Invoice Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingSettings ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading settings...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg p-6 print:p-0 print:border-0 invoice-print-content" style={{ width: '3in', maxWidth: '3in' }}>
                {/* Logo Section */}
                <div className="text-center mb-4">
              {settings?.logo_file ? (
                <div className="w-16 h-16 mx-auto rounded-lg border-2 flex items-center justify-center mb-2 shadow-md overflow-hidden">
                  <img 
                    src={`file://${settings.logo_file}`} 
                    alt="Restaurant Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to default logo if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-full flex flex-col items-center justify-center"
                    style={{ 
                      backgroundColor: themeColors.primary, 
                      borderColor: themeColors.primaryLight,
                      display: 'none'
                    }}
                  >
                    <span className="text-white font-bold text-2xl">G</span>
                    <span className="text-white font-medium text-xs">POS</span>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-16 h-16 mx-auto rounded-lg border-2 flex flex-col items-center justify-center mb-2 shadow-md"
                  style={{ 
                    backgroundColor: themeColors.primary, 
                    borderColor: themeColors.primaryLight 
                  }}
                >
                  <span className="text-white font-bold text-2xl">G</span>
                  <span className="text-white font-medium text-xs">POS</span>
                </div>
              )}
              <div className="text-center">
                <h1 className="text-lg font-bold text-gray-800">
                  {settings?.business_name || 'Saffron Indian Cuisine Cashel'}
                </h1>
                <p className="text-sm text-gray-600">
                  Tel: {settings?.phone_number || '06262080'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* Order Type and Details */}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 uppercase">
                {order.orderType}
              </h2>
              <p className="text-sm text-gray-600">
                Due: {formatDate(order.placedAt || order.createdAt)}, ASAP ({formatTime(order.placedAt || order.createdAt)})
              </p>
              <p className="text-sm font-medium text-gray-800">
                # {order.orderNumber}
              </p>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* Items */}
            <div className="mb-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-800">
                          {item.quantity} x {item.food?.name || 'Unknown Item'}
                        </span>
                      </div>
                      {/* Show variations if any */}
                      {item.variations && Object.keys(item.variations).length > 0 && (
                        <div className="text-xs text-gray-600 ml-4 mt-1">
                          {Object.entries(item.variations).map(([variationId, selectedOption]) => {
                            const variation = foodDetails?.variations?.find(v => v.id === parseInt(variationId));
                            const variationName = variation?.name || variationId;
                            const selections = Array.isArray(selectedOption) ? selectedOption : [selectedOption];
                            
                            return (
                              <div key={variationId} className="flex items-center gap-1">
                                <span>• {variationName}:</span>
                                <span>
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
                        <div className="text-xs text-gray-600 ml-4 mt-1">
                          {item.adons.map((addonId, idx) => {
                            const addon = foodDetails?.adons?.find(a => a.id === parseInt(addonId));
                            const addonName = addon?.name || addonId;
                            const addonPrice = addon?.price;
                            
  return (
                              <div key={idx} className="flex items-center gap-1">
                                <span>• Addon: {addonName}</span>
                                {addonPrice && <span>(+€{addonPrice.toFixed(2)})</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 ml-4">
                      €{parseFloat(item.totalPrice).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No items found</p>
              )}
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bag Fee:</span>
                <span className="font-medium">€0.22</span>
              </div>
              {order.orderType === 'Delivery' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee:</span>
                    <span className="font-medium">€0.75</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charge:</span>
                    <span className="font-medium">€2.00</span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">TOTAL (Incl. VAT):</span>
                  <span className="font-bold text-gray-800">€{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* Payment Status */}
            <div className="text-center mb-4">
              <div className={`text-lg font-bold ${paymentStatus === "PAID" ? "text-green-600" : "text-red-600"}`}>
                ***** {paymentStatus} *****
              </div>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* Customer Info */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-2">Customer Info:</h3>

              <div className="text-sm space-y-1">
                <div><span className="font-medium">Name:</span> {order.customer?.name || 'Walk-in Customer'}</div>
                
                {/* Phone number - show for delivery orders or if available */}
                {(order.orderType === 'Delivery' || order.customer?.phone) && (
                  <div>
                    <span className="font-medium">Phone:</span> 
                    {order.customer?.phone || 'N/A'}
                  </div>
                )}
                
                {/* Email - show if available */}
                {order.customer?.email && (
                  <div>
                    <span className="font-medium">Email:</span> {order.customer.email}
                  </div>
                )}
                
                {/* Delivery address for delivery orders */}
                {order.orderType === 'Delivery' && (
                  <div>
                    <span className="font-medium">Delivery Address:</span> 
                    {(() => {
                      // Check if customer has addresses array
                      if (order.customer?.addresses && order.customer.addresses.length > 0) {
                        // Get the first address
                        const firstAddress = order.customer.addresses[0];
                        // Check if it's a string or object
                        if (typeof firstAddress === 'string') {
                          return firstAddress;
                        } else if (firstAddress.address) {
                          return firstAddress.address;
                        } else {
                          return 'Address format error';
                        }
                      } else if (order.customer?.address) {
                        // Fallback to direct address field
                        return order.customer.address;
                      } else {
                        return 'No address available';
                      }
                    })()}
                  </div>
                )}
                
                {/* Table for non-delivery orders */}
                {order.orderType !== 'Delivery' && order.table && order.table !== 'None' && (
                  <div><span className="font-medium">Table:</span> {order.table}</div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-300 my-4"></div>

            {/* Notes */}
            {order.notes && (
              <>
                <div className="mb-4">
                  <h3 className="font-bold text-gray-800 mb-2">Notes:</h3>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
                <div className="border-t border-gray-300 my-4"></div>
              </>
            )}

            {/* Footer */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 mb-1">Thank You For Ordering!</p>
              <p className="text-xs text-gray-600">Powered By G Tech Nexa Limited</p>
            </div>

                <div className="border-t border-gray-300 my-4"></div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {isKitchen ? 'Print Kitchen Order' : isEmployee ? 'Print Employee Copy' : 'Print Invoice'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Invoice;