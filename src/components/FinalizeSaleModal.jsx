import React from 'react';
import { X, AlertTriangle, CheckCircle, FileText, Gift, Clock } from 'lucide-react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const FinalizeSaleModal = ({
  isOpen,
  onClose,
  // Payment related props
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  paymentAmount,
  setPaymentAmount,
  givenAmount,
  setGivenAmount,
  handleRemoveSplitBill,
  changeAmount,
  setChangeAmount,
  currencyAmount,
  setCurrencyAmount,
  selectedCurrency,
  setSelectedCurrency,
  currencyOptions,
  addedPayments,
  setAddedPayments,
  // Mode and data props
  isSinglePayMode,
  selectedSplitBill,
  selectedPlacedOrder,
  cartItems,
  foodDetails,
  // Coupon related props
  appliedCoupon,
  removeAppliedCoupon,
  couponCode,
  setCouponCode,
  availableCoupons,
  couponsLoading,
  // Discount related props
  discountType,
  setDiscountType,
  discountAmount,
  setDiscountAmount,
  // Other props
  sendSMS,
  setSendSMS,
  // Handler functions
  handleCashGivenAmountChange,
  handleCashAmountChange,
  handleNumericInputFocus,
  handleNumericKeyboardChange,
  handleNumericKeyboardKeyPress,
  handleAddPayment,
  handleApplyManualDiscount,
  handleApplyCoupon,
  handleAnyInputFocus,
  handleAnyInputClick,
  handleCustomInputBlur,
  // Calculation functions
  calculateSinglePayTotals,
  calculateSplitBillTotal,
  calculateCartTotal,
  calculateSplitBillSubtotal,
  calculateSplitBillTax,
  calculateSplitBillDiscount,
  calculateSplitBillCharge,
  calculateSplitBillTips,
  calculateCartSubtotal,
  calculateCartTax,
  calculateCartDiscount,
  calculateDueAmount,
  getCurrencySymbol,
  // State variables
  numericActiveInput,
  numericKeyboardInput,
  setNumericActiveInput,
  setNumericKeyboardInput,
  // Modal state
  setShowCartDetailsModal,
  // Split bill props
  splitBillToRemove,
  setSplitBills,
  setSplitBillToRemove,
  updateCartAfterSplitPayment,
  handlePlaceSplitBillOrder,
  // Order related props
  placedOrders,
  selectedCustomer,
  selectedOrderType,
  selectedTable,
  // Functions
  handlePlaceOrder,
  showError,
  showSuccess,
  setIsInvoiceAfterPayment,
  setShowInvoiceModal,
  clearCart,
  resetFinalizeSaleModal,
  setIsSinglePayMode,
  setSelectedPlacedOrder,
  setCurrentOrderForInvoice,
  // Modify order payment props
  isModifyingOrder,
  modifyingOrderId,
  modifyingOrderPaymentInfo,
  showPayLaterButton,
  setShowPayLaterButton,
  hasResetPayment,
  setHasResetPayment
}) => {
  if (!isOpen) return null;

  // Set payment method when modifying a paid order
  React.useEffect(() => {
    if (isModifyingOrder && modifyingOrderPaymentInfo && modifyingOrderPaymentInfo.payment_method) {
      setSelectedPaymentMethod(modifyingOrderPaymentInfo.payment_method);
    }
  }, [isModifyingOrder, modifyingOrderPaymentInfo, setSelectedPaymentMethod]);

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl border-b border-gray-200">
          <h2 className="text-xl font-bold">
            {isSinglePayMode ? 'Finalize Sale - Single Pay' : 
             selectedSplitBill ? `Finalize Sale - Split Bill ${selectedSplitBill.id}` : 'Finalize Sale'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex gap-6 flex-1 overflow-hidden">
          {/* Left Panel - Payment Methods */}
          <div className="w-44 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
            <div className="space-y-2">
              {['Cash', 'Credit Card', 'Check', 'Bank Transfer'].map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setSelectedPaymentMethod(method);
                    // Clear amount fields when switching payment methods
                    setPaymentAmount('');
                    setGivenAmount('');
                    setChangeAmount('');
                    setCurrencyAmount('');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedPaymentMethod === method
                    ? 'bg-gray-200 text-gray-800 font-medium'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Center Panel - Payment Details */}
          <div className="flex-1 flex flex-col overflow-y-auto max-h-[70vh]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedPaymentMethod}</h3>

            {/* Payment Input Section */}
            <div className="flex gap-1 mb-6">
              {selectedPaymentMethod === 'Cash' ? (
                <>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Given</label>
                    <input
                      type="number"
                      value={givenAmount}
                      onChange={(e) => handleCashGivenAmountChange(e.target.value)}
                      onFocus={(e) => handleNumericInputFocus(e, 'givenAmount', givenAmount)}
                      onClick={(e) => handleNumericInputFocus(e, 'givenAmount', givenAmount)}
                      onBlur={(e) => {
                        if (numericActiveInput === 'givenAmount' && numericKeyboardInput !== undefined) {
                          setGivenAmount(numericKeyboardInput);
                          setPaymentAmount(numericKeyboardInput);
                          if (numericKeyboardInput) {
                            const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                         selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                            const change = parseFloat(numericKeyboardInput) - total;
                            setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                          } else {
                            setChangeAmount('0.00');
                          }
                        }
                        setNumericActiveInput('');
                      }}
                      onInput={(e) => {
                        const value = e.target.value;
                        setGivenAmount(value);
                        setPaymentAmount(value);
                        if (numericActiveInput === 'givenAmount') {
                          setNumericKeyboardInput(value);
                        }
                        if (value) {
                          const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                       selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                          const change = parseFloat(value) - total;
                          setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                        } else {
                          setChangeAmount('0.00');
                        }
                      }}
                      placeholder="Given Amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change</label>
                    <input
                      type="number"
                      value={changeAmount}
                      onChange={(e) => setChangeAmount(e.target.value)}
                      placeholder="Change"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => handleCashAmountChange(e.target.value)}
                      onFocus={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                      onClick={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                      onBlur={(e) => {
                        if (numericActiveInput === 'paymentAmount' && numericKeyboardInput !== undefined) {
                          setPaymentAmount(numericKeyboardInput);
                          if (selectedPaymentMethod === 'Cash') {
                            setGivenAmount(numericKeyboardInput);
                            if (numericKeyboardInput) {
                              const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                           selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                              const change = parseFloat(numericKeyboardInput) - total;
                              setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                            } else {
                              setChangeAmount('0.00');
                            }
                          }
                        }
                        setNumericActiveInput('');
                      }}
                      onInput={(e) => {
                        const value = e.target.value;
                        setPaymentAmount(value);
                        if (numericActiveInput === 'paymentAmount') {
                          setNumericKeyboardInput(value);
                        }
                        if (selectedPaymentMethod === 'Cash') {
                          setGivenAmount(value);
                          if (value) {
                            const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                         selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                            const change = parseFloat(value) - total;
                            setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                          } else {
                            setChangeAmount('0.00');
                          }
                        }
                      }}
                      placeholder="Amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              ) : selectedPaymentMethod === 'Change Currency' ? (
                <>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {currencyOptions.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      value={currencyAmount}
                      onChange={(e) => setCurrencyAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setCurrencyAmount('');
                    }}
                    className="px-2 py-2 text-red-500 hover:text-red-700 self-end"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    onFocus={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                    onClick={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                    onBlur={(e) => {
                      if (numericActiveInput === 'paymentAmount' && numericKeyboardInput !== undefined) {
                        setPaymentAmount(numericKeyboardInput);
                      }
                      setNumericActiveInput('');
                    }}
                    onInput={(e) => {
                      const value = e.target.value;
                      setPaymentAmount(value);
                      if (numericActiveInput === 'paymentAmount') {
                        setNumericKeyboardInput(value);
                      }
                    }}
                    placeholder="Amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {selectedPaymentMethod !== 'Change Currency' && (
                <button
                  onClick={handleAddPayment}
                  className="px-2 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors self-end"
                >
                  Add
                </button>
              )}
            </div>

            {/* Added Payments Display */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-6">
              {addedPayments.length > 0 ? (
                <div className="space-y-2">
                  {addedPayments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <span className="text-sm text-gray-700">{payment.method}: €{payment.amount}</span>
                      <button
                        onClick={() => setAddedPayments(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  <div className="mb-2">No payments added yet</div>
                  <div className="text-xs">Add a payment above to enable the Submit button</div>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                {/* Split Bill Header */}
                {selectedSplitBill && (
                  <div className="border-b border-gray-200 pb-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Split Bill {selectedSplitBill.id}:</span>
                      <span className="text-sm font-medium text-gray-700">{selectedSplitBill.customer}</span>
                    </div>
                  </div>
                )}

                {/* Single Pay Header */}
                {isSinglePayMode && selectedPlacedOrder && (
                  <div className="border-b border-gray-200 pb-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-md font-medium text-gray-700">Order #{selectedPlacedOrder.id || selectedPlacedOrder.orderNumber}:</span>
                      <span className="text-md font-medium text-gray-700">{selectedPlacedOrder.customer?.name || selectedPlacedOrder.customer || 'Walk-in Customer'}</span>
                    </div>
                  </div>
                )}

                {/* Bill Breakdown */}
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-md font-medium text-gray-700">Subtotal:</span>
                    <span className="text-md font-medium text-gray-700">
                      {getCurrencySymbol()}{
                        isSinglePayMode ? calculateSinglePayTotals().subtotal.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillSubtotal().toFixed(2) : calculateCartSubtotal().toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-md font-medium text-gray-700">Tax:</span>
                    <span className="text-md font-medium text-gray-700">
                      {getCurrencySymbol()}{
                        isSinglePayMode ? calculateSinglePayTotals().tax.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillTax().toFixed(2) : calculateCartTax().toFixed(2)
                      }
                    </span>
                  </div>
                  {(isSinglePayMode ? calculateSinglePayTotals().discount : (selectedSplitBill ? calculateSplitBillDiscount() : calculateCartDiscount())) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">Discount:</span>
                      <span className="text-sm font-medium text-green-600">
                        -{getCurrencySymbol()}{
                          isSinglePayMode ? calculateSinglePayTotals().discount.toFixed(2) :
                          selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)
                        }
                      </span>
                    </div>
                  )}
                  {(isSinglePayMode ? 0 : (selectedSplitBill ? calculateSplitBillCharge() : 0)) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Charge:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillCharge().toFixed(2) : '0.00'}
                      </span>
                    </div>
                  )}
                  {(isSinglePayMode ? 0 : (selectedSplitBill ? calculateSplitBillTips() : 0)) > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Tips:</span>
                      <span className="text-sm font-medium text-gray-700">
                        {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillTips().toFixed(2) : '0.00'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Applied Coupons (if any) */}
                {appliedCoupon && (
                  <div className="border-b border-gray-200 pb-2 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-600">
                        {appliedCoupon.title} ({appliedCoupon.code}):
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        -{getCurrencySymbol()}{
                          isSinglePayMode ? calculateSinglePayTotals().discount.toFixed(2) :
                          selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Payable:</span>
                  <span className="text-xl font-bold text-gray-800">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? calculateSinglePayTotals().total.toFixed(2) :
                      selectedSplitBill ? calculateSplitBillTotal().toFixed(2) : calculateCartTotal().toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Paid:</span>
                  <span className="text-xl font-bold text-gray-800">{getCurrencySymbol()}{addedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Due:</span>
                  <span className="text-xl font-bold text-gray-800">
                    {getCurrencySymbol()}{Math.max(0, (
                      isSinglePayMode ? calculateSinglePayTotals().total :
                      selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal()
                    ) - addedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modify Order Payment Information */}
            {isModifyingOrder && modifyingOrderPaymentInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-semibold text-blue-800">Previous Payment Information</h4>
                  <button
                    onClick={() => {
                      setHasResetPayment(true);
                      setPaymentAmount('0');
                      setGivenAmount('0');
                      setChangeAmount('0');
                      setAddedPayments([]);
                      setShowPayLaterButton(true);
                    }}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Reset Payment
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Payment Method:</span>
                    <span className="text-sm font-medium text-blue-800">{modifyingOrderPaymentInfo.payment_method}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-700">Previously Paid:</span>
                    <span className="text-sm font-medium text-blue-800">{getCurrencySymbol()}{modifyingOrderPaymentInfo.paid_amount.toFixed(2)}</span>
                  </div>
                </div>
                {hasResetPayment && (
                  <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                    <p className="text-sm text-yellow-800">Payment has been reset. You can now add new payments or use Pay Later option.</p>
                  </div>
                )}
              </div>
            )}

            {/* Payment Status Message */}
            {addedPayments.length > 0 && calculateDueAmount() > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Payment incomplete. Due amount: {getCurrencySymbol()}{calculateDueAmount().toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Add more payments to complete the transaction.
                </p>
              </div>
            )}

            {addedPayments.length > 0 && calculateDueAmount() === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    Payment complete! Ready to submit.
                  </span>
                </div>
              </div>
            )}

            {/* Split Bill Items */}
            {selectedSplitBill && selectedSplitBill.items && selectedSplitBill.items.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Items in this Split Bill:</h4>
                <div className="space-y-2">
                  {selectedSplitBill.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">{item.food?.name || 'Unknown Item'}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity || 0}</span>
                      </div>
                      <span className="text-gray-800 font-medium">€{(item.totalPrice || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Single Pay Items */}
            {isSinglePayMode && ((cartItems.length > 0) || (selectedPlacedOrder && selectedPlacedOrder.items && selectedPlacedOrder.items.length > 0)) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Order Items:</h4>
                <div className="space-y-2">
                  {(cartItems.length > 0 ? cartItems : selectedPlacedOrder.items).map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800">{item.food?.name || 'Unknown Item'}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity || 0}</span>
                        </div>
                        
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
                      <span className="text-gray-800 font-medium">€{(parseFloat(item.totalPrice) || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={sendSMS}
                  onChange={(e) => setSendSMS(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Send SMS</span>
              </label>
              {/* <button
                onClick={() => setShowCartDetailsModal(true)}
                className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors text-sm"
              >
                {isSinglePayMode ? 'Order Details' : 
                 selectedSplitBill ? 'Split Bill Details' : 'Cart Details'}
              </button> */}
            </div>
          </div>

          {/* Right Panel - Coupons and offers */}
          <div className="flex-shrink-0 flex flex-col h-full">
            {/* Numeric Keyboard Section - Fixed */}
            <div className="mb-4 flex-shrink-0">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div
                  className="keyboard-container w-full"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Keyboard
                    keyboardRef={(r) => (window.keyboard = r)}
                    input={numericKeyboardInput}
                    onChange={handleNumericKeyboardChange}
                    onKeyPress={handleNumericKeyboardKeyPress}
                    theme="hg-theme-default"
                    layoutName="numeric"
                    layout={{
                      numeric: [
                        "1 2 3",
                        "4 5 6",
                        "7 8 9",
                        "0 {bksp}"
                      ]
                    }}
                    display={{
                      "1": "1",
                      "2": "2",
                      "3": "3",
                      "4": "4",
                      "5": "5",
                      "6": "6",
                      "7": "7",
                      "8": "8",
                      "9": "9",
                      "0": "0",
                      "{bksp}": "⌫"
                    }}
                    physicalKeyboardHighlight={true}
                    physicalKeyboardHighlightTextColor={"#000000"}
                    physicalKeyboardHighlightBgColor={"#fff475"}
                  />
                </div>
              </div>
            </div>

            {/* Coupons & Discounts Section - Scrollable */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Coupons & Discounts</h4>

                {/* Manual Discount Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">Manual Discount</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Discount Type
                          </label>
                          <select
                            name="discountType"
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (€)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Disc. Amount
                          </label>
                          <input
                            type="number"
                            name="discountAmount"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            onFocus={(e) => handleNumericInputFocus(e, 'discountAmount', discountAmount)}
                            onClick={(e) => handleNumericInputFocus(e, 'discountAmount', discountAmount)}
                            onBlur={(e) => {
                              if (numericActiveInput === 'discountAmount' && numericKeyboardInput !== undefined) {
                                setDiscountAmount(numericKeyboardInput);
                              }
                              setNumericActiveInput('');
                            }}
                            onInput={(e) => {
                              // Update both the field value and keyboard input immediately
                              const value = e.target.value;
                              setDiscountAmount(value);
                              if (numericActiveInput === 'discountAmount') {
                                setNumericKeyboardInput(value);
                              }
                            }}
                            min="0"
                            step="0.01"
                            placeholder={discountType === 'percentage' ? '20' : '10'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                          />
                        </div>
                      </div>
                      {discountAmount && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Manual discount of {discountAmount}{discountType === 'percentage' ? '%' : '€'} is ready to apply.
                        </div>
                      )}
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleApplyManualDiscount}
                          disabled={!discountAmount || parseFloat(discountAmount) <= 0}
                          className={`px-4 py-2 rounded-lg transition-colors font-medium ${discountAmount && parseFloat(discountAmount) > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          Apply Manual Discount
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enter Coupon Code Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">Enter Coupon Code</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="couponCode"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      onFocus={(e) => handleAnyInputFocus(e, 'couponCode')}
                      onClick={(e) => handleAnyInputClick(e, 'couponCode')}
                      onBlur={(e) => handleCustomInputBlur(e, 'couponCode')}
                      placeholder="Enter promo code or click a coupon below"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${couponCode.trim()
                        ? 'border-green-400 focus:ring-green-500 focus:ring-green-500 bg-green-50'
                        : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                        }`}
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim()}
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${couponCode.trim()
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                      Apply
                    </button>
                  </div>
                  {couponCode.trim() && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ Coupon code "{couponCode}" is ready to apply. Click "Apply".
                    </div>
                  )}
                </div>

                {/* Applied Coupon Display */}
                {appliedCoupon && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-green-800">Applied Coupon</h4>
                        <p className="text-sm text-green-600">{appliedCoupon.title}</p>
                        <p className="text-xs text-green-600">Code: {appliedCoupon.code}</p>
                        {appliedCoupon.discountType === 'percentage' ? (
                          <p className="text-green-700 font-medium">{appliedCoupon.discount}% OFF</p>
                        ) : (
                          <p className="text-green-700 font-medium">€{appliedCoupon.discount} OFF</p>
                        )}
                      </div>
                      <button
                        onClick={removeAppliedCoupon}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Available Coupons Section */}
                <div>
                  <h5 className="text-md font-semibold text-gray-800 mb-3">Available Coupons</h5>
                  {couponsLoading ? (
                    <div className="text-center py-4">
                      <div className="text-gray-500 text-sm">Loading coupons...</div>
                    </div>
                  ) : availableCoupons.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer group"
                          onClick={() => {
                            setCouponCode(coupon.code);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h6 className="font-semibold text-gray-800 text-sm">{coupon.title}</h6>
                              <p className="text-xs text-gray-600 mt-1">Customer Type: {coupon.customerType}</p>
                              {coupon.discountType === 'percentage' ? (
                                <p className="text-green-600 font-medium mt-1 text-sm">{coupon.discount}% OFF</p>
                              ) : (
                                <p className="text-green-600 font-medium mt-1 text-sm">€{coupon.discount} OFF</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-xs text-gray-500 font-mono">Code: {coupon.code}</span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            Click to use this coupon code
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-500 text-sm">No coupons available</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pay Later Button - Only show when modifying order and reset has been clicked */}
        {isModifyingOrder && showPayLaterButton && (
          <div className="px-6 pb-4">
            <button
              onClick={async () => {
                try {
                  // Calculate the new total amount
                  const newTotal = isSinglePayMode ? calculateSinglePayTotals().total :
                                 selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                  
                  // Update the order with the new total amount and set payment status to pending
                  const paymentUpdates = {
                    order_amount: newTotal,
                    payment_status: 'pending',
                    payment_method: null
                  };
                  
                  // Update the order with the new total amount and set payment status to pending
                  if (modifyingOrderId) {
                    const updateResult = await window.myAPI.updateOrder(modifyingOrderId, paymentUpdates);
                    if (!updateResult.success) {
                      showError('Failed to update order: ' + updateResult.message);
                      return;
                    }
                    showSuccess('Order updated with new amount. Payment status set to pending.');
                  } else {
                    showError('Order ID not found. Cannot update order.');
                    return;
                  }
                  
                  onClose();
                  setIsSinglePayMode(false);
                  clearCart();
                  resetFinalizeSaleModal();
                } catch (error) {
                  console.error('Error updating order for pay later:', error);
                  showError('Failed to update order. Please try again.');
                }
              }}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <Clock size={20} />
              Pay Later (€{(isSinglePayMode ? calculateSinglePayTotals().total :
                           selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal()).toFixed(2)})
            </button>
          </div>
        )}

        {/* Footer - Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={() => {
              onClose();
              setIsSinglePayMode(false);
            }}
            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <X size={20} />
            Cancel
          </button>
          <button
            disabled={addedPayments.length === 0 || calculateDueAmount() > 0}
            onClick={async () => {
              try {
              // Handle payment submission
                const paymentAmountValue = parseFloat(paymentAmount) || 0;
                const givenAmountValue = parseFloat(givenAmount) || 0;
                const changeAmountValue = parseFloat(changeAmount) || 0;

                // If this is a single pay mode (direct payment without placing order first)
                if (isSinglePayMode) {
                  // Set flag to indicate this invoice is after payment
                  setIsInvoiceAfterPayment(true);
                  
                  // Create order first, then update with payment
                  const createdOrderId = await handlePlaceOrder();
                  
                  // Check if order was created successfully
                  if (!createdOrderId) {
                    showError('Failed to create order for payment');
                    return;
                  }
                  
                  // For single pay mode, we now have the order ID directly
                  try {
                      
                      // Update order with payment information
                      const paymentUpdates = {
                        payment_status: 'paid',
                        payment_method: selectedPaymentMethod,
                        order_status: 'completed'
                      };
                      
                      const updateResult = await window.myAPI.updateOrder(createdOrderId, paymentUpdates);
                      if (!updateResult.success) {
                        showError('Failed to update order payment: ' + updateResult.message);
                        return;
                      }
                      
                      // Free the associated tables when order is completed through payment
                      try {
                        const orderResult = await window.myAPI.getOrderById(createdOrderId);
                        if (orderResult.success && orderResult.data.table_details) {
                          const tableDetails = JSON.parse(orderResult.data.table_details);
                          if (tableDetails && tableDetails.tables && tableDetails.tables.length > 0) {
                            const tableIds = tableDetails.tables.map(table => table.id);
                            console.log('Freeing tables after payment completion:', tableIds);
                            
                            const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIds, 'Free');
                            if (tableUpdateResult.success) {
                              console.log('Tables freed successfully after payment:', tableUpdateResult.message);
                            } else {
                              console.warn('Failed to free tables after payment:', tableUpdateResult.message);
                            }
                          }
                        }
                      } catch (error) {
                        console.error('Error freeing tables after payment:', error);
                      }
                      
                      // Create order object for invoice display
                      const orderForInvoice = {
                        id: createdOrderId,
                        orderNumber: `ORD-${String(createdOrderId).padStart(3, '0')}`,
                        items: cartItems,
                        customer: selectedCustomer || { name: 'Walk-in Customer' },
                        total: calculateCartTotal(),
                        coupon: appliedCoupon,
                        orderType: selectedOrderType,
                        table: selectedTable ? `Table ${selectedTable}` : 'None',
                        waiter: 'Ds Waiter',
                        status: 'Completed',
                        placedAt: new Date().toISOString(),
                        databaseId: createdOrderId
                      };
                      
                      // Set the order for invoice display
                      setSelectedPlacedOrder(orderForInvoice);
                  } catch (error) {
                    console.error('Error processing single pay order:', error);
                    showError('Failed to process payment for new order');
                    return;
                  }

                } else if (selectedPlacedOrder && selectedPlacedOrder.databaseId) {
                  // Set flag to indicate this invoice is after payment
                  setIsInvoiceAfterPayment(true);
                  
                  // Update existing order with payment information (but don't complete the order)
                  const paymentUpdates = {
                    payment_status: 'paid',
                    payment_method: selectedPaymentMethod
                    // Note: order_status is not updated to 'completed' - this should be done manually
                  };
                  
                  const updateResult = await window.myAPI.updateOrder(selectedPlacedOrder.databaseId, paymentUpdates);
                  if (!updateResult.success) {
                    showError('Failed to update order payment: ' + updateResult.message);
                    return;
                  }
                  
                  // Note: Tables are not freed automatically - this should be done when order is manually completed
                  // Note: Order is not removed from active orders - this should be done when order is manually completed
                } else if (selectedSplitBill) {
console.log("selectedSplitBill selectedSplitBill", selectedSplitBill);

                  // Handle split bill payment
                  setIsInvoiceAfterPayment(true);
                  
                  // Prepare payment information
                  const paymentInfo = {
                    paymentMethod: selectedPaymentMethod,
                    paymentAmount: parseFloat(paymentAmount) || selectedSplitBill.total,
                    givenAmount: parseFloat(givenAmount) || 0,
                    changeAmount: parseFloat(changeAmount) || 0,
                    currency: selectedCurrency,
                    currencyAmount: parseFloat(currencyAmount) || 0
                  };
                  
                  // Place the split bill order in database
                  const orderId = await handlePlaceSplitBillOrder(selectedSplitBill, paymentInfo);
                  
                  if (orderId) {
                    // Create a temporary order object for invoice display from the split bill
                    const splitOrderForInvoice = {
                      id: orderId,
                      orderNumber: `ORD-${orderId}-SPLIT-${selectedSplitBill.id}`,
                      items: selectedSplitBill.items,
                      customer: selectedSplitBill.customer || selectedPlacedOrder?.customer || { name: 'Walk-in Customer' },
                      total: selectedSplitBill.total,
                      coupon: appliedCoupon,
                      orderType: selectedPlacedOrder?.orderType || 'In Store',
                      table: selectedPlacedOrder?.table || 'None',
                      waiter: selectedPlacedOrder?.waiter || 'Ds Waiter',
                      status: 'Completed',
                      paymentStatus: 'Paid',
                      paymentMethod: paymentInfo.paymentMethod,
                      placedAt: new Date().toISOString(),
                      completedAt: new Date().toISOString(),
                      databaseId: orderId
                    };
                    
                    // Set the split order for invoice display
                    setSelectedPlacedOrder(splitOrderForInvoice);
                    
                    // Remove the processed split bill from the list and update cart items
                    if (splitBillToRemove) {
                      setSplitBills(prev => prev.filter(split => split.id !== splitBillToRemove));
                      handleRemoveSplitBill(splitBillToRemove);
                      setSplitBillToRemove(null);
                      
                      // Update cart items by removing paid quantities
                      updateCartAfterSplitPayment(selectedSplitBill);
                    }
                  } else {
                    showError('Failed to place split bill order. Please try again.');
                    return;
                  }
                }

              onClose();
              setIsSinglePayMode(false);
              clearCart();
              resetFinalizeSaleModal();
              
              // Show invoice modal after successful payment
              if (isSinglePayMode && selectedPlacedOrder) {
                // For single pay mode, we already set selectedPlacedOrder above
                setIsInvoiceAfterPayment(true); // This IS after payment
                setShowInvoiceModal(true);
              } else if (placedOrders[0]) {
                setSelectedPlacedOrder(placedOrders[0]);
                setIsInvoiceAfterPayment(true); // This IS after payment
                setShowInvoiceModal(true);
              } else if (selectedPlacedOrder) {
                setIsInvoiceAfterPayment(true); // This IS after payment
                setShowInvoiceModal(true);
              }
              
              // Reset single pay mode after successful payment
              setIsSinglePayMode(false);
              
              // Reset invoice flags to ensure kitchen and employee invoices show for new orders
              setIsInvoiceAfterPayment(false);
              setCurrentOrderForInvoice(null);
              } catch (error) {
                console.error('Error processing payment:', error);
                showError('Failed to process payment. Please try again.');
              }
            }}
            className={`flex-1 px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              addedPayments.length === 0 || calculateDueAmount() > 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <FileText size={20} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalizeSaleModal;    