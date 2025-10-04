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
  setSelectedSplitBill,
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
  setShowSplitBillModal,
  setCustomerSearchFromSplit,
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
  splitBills,
  splitBillToRemove,
  setSplitBills,
  setSplitBillToRemove,
  setSplitItems,
  setSplitDiscount,
  setSplitCharge,
  setSplitTips,
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

  // State for print toggle
  const [isPrintOn, setIsPrintOn] = React.useState(true);

  // Set payment method when modifying a paid order
  React.useEffect(() => {
    if (isModifyingOrder && modifyingOrderPaymentInfo && modifyingOrderPaymentInfo.payment_method) {
      setSelectedPaymentMethod(modifyingOrderPaymentInfo.payment_method);
    }
  }, [isModifyingOrder, modifyingOrderPaymentInfo, setSelectedPaymentMethod]);

  // Synchronize paymentAmount with addedPayments for single pay mode
  React.useEffect(() => {
    if (isSinglePayMode && addedPayments.length > 0 && paymentAmount === '') {
      const totalFromAddedPayments = addedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      console.log('Syncing paymentAmount with addedPayments total:', totalFromAddedPayments);
      setPaymentAmount(totalFromAddedPayments.toString());
      setGivenAmount(totalFromAddedPayments.toString());
      setChangeAmount('0.00');
    }
  }, [isSinglePayMode, addedPayments, paymentAmount, setPaymentAmount, setGivenAmount, setChangeAmount]);

  // Debug payment amount changes
  React.useEffect(() => {
    console.log('Payment amount changed:', paymentAmount);
    console.log('Given amount changed:', givenAmount);
  }, [paymentAmount, givenAmount]);


  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
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
        <div className="p-6 flex flex-col gap-6 overflow-hidden">

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsPrintOn(!isPrintOn)}
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-semibold ${
                isPrintOn 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {isPrintOn ? 'Print ON' : 'Print OFF'}
            </button>

            <div className="grid grid-cols-4 gap-4 ">
              <div className="bg-white  text-center">
                <div className="text-sm text-gray-600 mb-2">Amount Due</div>
                <div className="text-2xl border-2 border-gray-300 rounded-lg p-4 font-bold text-gray-900">
                  {getCurrencySymbol()}{
                    isSinglePayMode ? calculateSinglePayTotals().total.toFixed(2) :
                      selectedSplitBill ? calculateSplitBillTotal().toFixed(2) : calculateCartTotal().toFixed(2)
                  }
              </div>
            </div>
              <div className="  text-center">
                <div className="text-sm text-gray-600 mb-2">Remaining</div>
                <div className="text-2xl border-2 border-red-300 rounded-lg p-4 font-bold text-red-600">
                {getCurrencySymbol()}{Math.max(0, (
                  isSinglePayMode ? calculateSinglePayTotals().total :
                  selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal()
                  ) - (parseFloat(givenAmount) || 0)).toFixed(2)}
              </div>
            </div>
              <div className="bg-white text-center">
                <div className="text-sm text-gray-600 mb-2">Change</div>
                <div className="text-2xl border-2 border-gray-300 rounded-lg p-4  font-bold text-gray-900">
                {getCurrencySymbol()}{changeAmount || '0.00'}
              </div>
            </div>
              <div className="text-center">
                <div className="text-sm mb-2">Given</div>
                <div className="text-2xl border-2 border-gray-300 rounded-lg p-4  font-bold">
                {getCurrencySymbol()}{givenAmount || '0.00'}
              </div>
            </div>
          </div>
          
          {/* Reset Button */}
          <button
            onClick={() => {
              setGivenAmount('');
                setPaymentAmount('');
              setChangeAmount('0.00');
                setSelectedPaymentMethod('Cash');
            }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-lg font-semibold"
          >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            Reset
          </button>
        </div>
          <div className="flex px-6 gap-4">
            <div className="bg-gray-50 border border-[#dee2e6] rounded-lg p-4">
              <h3 className="text-md text-center font-semibold text-gray-800 my-3">AMOUNT DUE</h3>
              <div className="text-md text-center font-bold text-gray-900 mb-4 border-b border-gray-300 pb-4">
                {getCurrencySymbol()}{
                  isSinglePayMode ? calculateSinglePayTotals().total.toFixed(2) :
                    selectedSplitBill ? calculateSplitBillTotal().toFixed(2) : calculateCartTotal().toFixed(2)
                }
            </div>
            
              {/* Order Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm gap-10">
                  <span className="text-[#333] font-semibold">TAX:</span>
                  <span className="text-[#222] text-lg font-semibold">
                  {getCurrencySymbol()}{
                    isSinglePayMode ? calculateSinglePayTotals().tax.toFixed(2) :
                    selectedSplitBill ? calculateSplitBillTax().toFixed(2) : calculateCartTax().toFixed(2)
                  }
                </span>
              </div>
                <div className="flex justify-between text-sm gap-10">
                  <span className="text-[#333] font-semibold">BASKET DISCOUNT:</span>
                  <span className="text-[#222] text-lg font-semibold">{getCurrencySymbol()}0.00</span>
              </div>
                <div className="flex justify-between text-sm gap-10">
                  <span className="text-[#333] font-semibold">ITEM DISCOUNT:</span>
                  <span className="text-[#222] text-lg font-semibold">
                  {getCurrencySymbol()}{
                    isSinglePayMode ? calculateSinglePayTotals().discount.toFixed(2) :
                    selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)
                  }
                </span>
              </div>
                <div className="flex justify-between text-sm gap-10">
                  <span className="text-[#333] font-semibold">CUSTOMER DISCOUNT:</span>
                  <span className="text-[#222] text-lg font-semibold">{getCurrencySymbol()}0.00</span>
              </div>
                <div className="flex justify-between text-sm gap-10">
                  <span className="text-[#333] font-semibold">POINTS SPEND:</span>
                  <span className="text-[#222] text-lg font-semibold">{getCurrencySymbol()}0.00</span>
              </div>
            </div>
          </div>

            {/* Numeric Keypad */}
            <div className="border border-[#dee2e6] rounded-lg p-3">
              <div className="bg-white rounded-lg p-2">
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                        const currentValue = givenAmount || '';
                        const newValue = currentValue + num.toString();
                      setGivenAmount(newValue);
                      setPaymentAmount(newValue);
                      const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                   selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                        const parsedValue = parseFloat(newValue) || 0;
                        const change = parsedValue - total;
                      setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                  }}
                      className="px-2 py-1 bg-white border border-primary rounded-lg text-xl font-semibold text-gray-800"
                >
                  {num}
                </button>
              ))}
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2">
              <button
                onClick={() => {
                  setGivenAmount('');
                      setPaymentAmount('');
                  setChangeAmount('0.00');
                }}
                    className="px-2 py-1 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                      const currentValue = givenAmount || '';
                      const newValue = currentValue + '0';
                    setGivenAmount(newValue);
                    setPaymentAmount(newValue);
                    const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                 selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                      const parsedValue = parseFloat(newValue) || 0;
                      const change = parsedValue - total;
                    setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                }}
                    className="px-2 py-1 bg-white border border-primary rounded-lg text-2xl font-semibold text-gray-800"
              >
                    0
                  </button>
              <button
                onClick={() => {
                      const currentValue = givenAmount || '';
                      // Only add decimal if there isn't one already
                      if (currentValue.includes('.')) {
                        return;
                      }
                      // If empty or no value, start with "0."
                      const newValue = currentValue ? currentValue + '.' : '0.';
                    setGivenAmount(newValue);
                    setPaymentAmount(newValue);
                }}
                    className="px-2 py-1 bg-white border-2 border-primary rounded-lg text-xl font-semibold text-gray-800"
              >
                .
              </button>
            </div>
            
            {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-4">
                  {[50, 20, 10].map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    const newValue = amount.toFixed(2);
                      setGivenAmount(newValue);
                      setPaymentAmount(newValue);
                      const total = isSinglePayMode ? calculateSinglePayTotals().total : 
                                   selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                        const change = amount - total;
                      setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                      }}
                      className="px-5 py-3 bg-primary flex items-center justify-center text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                    >
                      {getCurrencySymbol()}{amount}.00
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-3">
                  {[5, 2, 1].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        const newValue = amount.toFixed(2);
                        setGivenAmount(newValue);
                      setPaymentAmount(newValue);
                        const total = isSinglePayMode ? calculateSinglePayTotals().total :
                          selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                        const change = amount - total;
                        setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                  }}
                      className="px-5 py-3 bg-primary flex items-center justify-center text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                >
                      {getCurrencySymbol()}{amount}.00
                </button>
              ))}
                </div>
            </div>
          </div>

            {/* Payment Methods */}
            <div className="flex-1 border border-[#dee2e6] rounded-lg p-4">
              <div className="space-y-3">
                {/* Cash Button */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Cash');
                    }}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 transition-all border border-gray-300 m-1 rounded-md ${
                      selectedPaymentMethod === 'Cash'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-md font-semibold">Cash</span>
                  </button>
                  <div className="px-4 py-3 bg-white border m-1 rounded-md border-gray-300 text-center">
                    <span className="text-gray-700 font-medium">
                      {getCurrencySymbol()}{selectedPaymentMethod === 'Cash' && givenAmount ? parseFloat(givenAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                {/* Card Button */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Credit Card');
                    }}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 transition-all border border-gray-300 m-1 rounded-md ${
                      selectedPaymentMethod === 'Credit Card'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-md font-semibold">Card</span>
                  </button>
                  <div className="px-4 py-3 bg-white border m-1 rounded-md border-gray-300 text-center">
                    <span className="text-gray-700 font-medium">
                      {getCurrencySymbol()}{selectedPaymentMethod === 'Credit Card' && givenAmount ? parseFloat(givenAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                {/* Cheque Button */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Check');
                    }}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 transition-all border border-gray-300 m-1 rounded-md ${
                      selectedPaymentMethod === 'Check'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-md font-semibold">Cheque</span>
                  </button>
                  <div className="px-4 py-3 bg-white border m-1 rounded-md border-gray-300 text-center">
                    <span className="text-gray-700 font-medium">
                      {getCurrencySymbol()}{selectedPaymentMethod === 'Check' && givenAmount ? parseFloat(givenAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                {/* Online Button */}
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedPaymentMethod('Bank Transfer');
                    }}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 transition-all border border-gray-300 m-1 rounded-md ${
                      selectedPaymentMethod === 'Bank Transfer'
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                    <span className="text-md font-semibold">Online</span>
                  </button>
                  <div className="px-4 py-3 bg-white border m-1 rounded-md border-gray-300 text-center">
                    <span className="text-gray-700 font-medium">
                      {getCurrencySymbol()}{selectedPaymentMethod === 'Bank Transfer' && givenAmount ? parseFloat(givenAmount).toFixed(2) : '0.00'}
                    </span>
                  </div>
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


        {/* <button
            disabled={(() => {
              const remainingAmount = Math.max(0, (
                isSinglePayMode ? calculateSinglePayTotals().total :
                selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal()
              ) - (parseFloat(givenAmount) || 0));
              const isDisabled = remainingAmount > 0;
              console.log('Submit button disabled check:', {
                isSinglePayMode,
                givenAmount,
                parseFloatGivenAmount: parseFloat(givenAmount),
                total: isSinglePayMode ? calculateSinglePayTotals().total :
                       selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal(),
                remainingAmount,
                isDisabled
              });
              return isDisabled;
            })()}
            onClick={async () => {
              console.log('=== PAYMENT SUBMIT CLICKED ===');
              console.log('isSinglePayMode:', isSinglePayMode);
              console.log('selectedSplitBill:', selectedSplitBill);
              console.log('selectedPlacedOrder:', selectedPlacedOrder);
              console.log('cartItems length:', cartItems?.length);
              console.log('givenAmount:', givenAmount);
              console.log('selectedPaymentMethod:', selectedPaymentMethod);
              
              try {
                // Handle payment submission using givenAmount
                const givenAmountValue = parseFloat(givenAmount) || 0;
                const changeAmountValue = parseFloat(changeAmount) || 0;
                const totalAmount = isSinglePayMode ? calculateSinglePayTotals().total : 
                                   selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
                
                console.log('Payment values:', {
                  givenAmountValue,
                  changeAmountValue,
                  totalAmount,
                  selectedPaymentMethod
                });
                
                // Use givenAmount as the final payment amount
                const finalPaymentAmount = givenAmountValue;
                
                // Validate payment amount
                if (finalPaymentAmount <= 0) {
                  console.error('Payment amount is zero or invalid:', finalPaymentAmount);
                  showError('Please enter a valid payment amount');
                  return;
                }
                
                // Validate that given amount covers the total
                if (finalPaymentAmount < totalAmount) {
                  console.error('Given amount is less than total:', finalPaymentAmount, '<', totalAmount);
                  showError('Given amount must be at least equal to the total amount');
                  return;
                }
                
                console.log('Final payment amount to use:', finalPaymentAmount);
                
                // Set paymentAmount to match givenAmount for downstream processing
                setPaymentAmount(givenAmount);

                // If this is a single pay mode (direct payment without placing order first)
                if (isSinglePayMode) {
                  console.log('Single pay mode - creating order first');
                  console.log('isSinglePayMode:', isSinglePayMode);
                  
                  // Set flag to indicate this invoice is after payment
                  setIsInvoiceAfterPayment(true);
                  
                  // Create order first, then update with payment
                  console.log('About to call handlePlaceOrder...');
                  const createdOrderId = await handlePlaceOrder();
                  console.log('handlePlaceOrder returned:', createdOrderId);
                  
                  // Check if order was created successfully
                  if (!createdOrderId) {
                    console.error('Order creation failed - no order ID returned');
                    showError('Failed to create order for payment');
                    return;
                  }
                  
                  console.log('Order created successfully with ID:', createdOrderId);
                  
                  // For single pay mode, we now have the order ID directly
                  try {
                      
                      // Update order with payment information
                      const paymentUpdates = {
                        payment_status: 'paid',
                        payment_method: selectedPaymentMethod,
                        order_status: 'new',
                        order_amount: finalPaymentAmount // Use the final payment amount
                      };
                      
                      console.log('Updating order with payment info:', paymentUpdates);
                      console.log('Order ID to update:', createdOrderId);
                      
                      const updateResult = await window.myAPI.updateOrder(createdOrderId, paymentUpdates);
                      console.log('Update result:', updateResult);
                      
                      if (!updateResult.success) {
                        console.error('Order update failed:', updateResult);
                        showError('Failed to update order payment: ' + updateResult.message);
                        return;
                      }
                      
                      console.log('Order updated successfully with payment info');
                      
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

                } else if (selectedPlacedOrder && selectedPlacedOrder.databaseId && !selectedSplitBill) {
                  console.log('=== PROCESSING EXISTING ORDER PAYMENT ===');
                  console.log('selectedPlacedOrder:', selectedPlacedOrder);
                  console.log('selectedPlacedOrder.databaseId:', selectedPlacedOrder.databaseId);
                  
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
                  console.log('=== PROCESSING SPLIT BILL PAYMENT ===');
                  console.log('selectedSplitBill:', selectedSplitBill);
                  console.log('selectedPlacedOrder:', selectedPlacedOrder);
console.log("selectedSplitBill selectedSplitBill", selectedSplitBill);

                  // Handle split bill payment
                  setIsInvoiceAfterPayment(true);
                  
                  // Prepare payment information
                  const paymentInfo = {
                    paymentMethod: selectedPaymentMethod,
                    paymentAmount: finalPaymentAmount, // Use the final payment amount we calculated
                    givenAmount: parseFloat(givenAmount) || 0,
                    changeAmount: parseFloat(changeAmount) || 0,
                    currency: selectedCurrency,
                    currencyAmount: parseFloat(currencyAmount) || 0
                  };
                  
                  console.log('Split bill paymentInfo with finalPaymentAmount:', paymentInfo);
                  
                  // Place the split bill order in database
                  console.log('About to call handlePlaceSplitBillOrder...');
                  console.log('handlePlaceSplitBillOrder function available:', typeof handlePlaceSplitBillOrder);
                  console.log('selectedSplitBill:', selectedSplitBill);
                  console.log('paymentInfo:', paymentInfo);
                  
                  const orderId = await handlePlaceSplitBillOrder(selectedSplitBill, paymentInfo);
                  console.log('handlePlaceSplitBillOrder returned:', orderId);
                  
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
                    
                    // Automatically remove the paid split bill
                    if (splitBillToRemove) {
                      const updatedSplitBills = (splitBills || []).filter(split => split.id !== splitBillToRemove);
                      setSplitBills(updatedSplitBills);
                      setSplitBillToRemove(null);
                      
                      // Update cart items by removing paid quantities
                      console.log('=== CALLING updateCartAfterSplitPayment ===');
                      console.log('selectedSplitBill before updateCartAfterSplitPayment:', selectedSplitBill);
                      updateCartAfterSplitPayment(selectedSplitBill);
                      console.log('=== updateCartAfterSplitPayment COMPLETED ===');
                      
                      // Check if cart is empty after removing paid items, then clear it
                      const remainingCartItems = cartItems.filter(item => item.quantity > 0);
                      if (remainingCartItems.length === 0) {
                        console.log('No remaining items after split payment - clearing cart...');
                        clearCart();
                        console.log('Cart cleared after split bill payment - no items remaining');
                      } else {
                        console.log('Cart still has items after split bill payment:', remainingCartItems.length, 'items');
                        console.log('Remaining items:', remainingCartItems.map(item => ({ name: item.food?.name, quantity: item.quantity })));
                      }
                      
                      // Reset selectedSplitBill after successful payment
                      setSelectedSplitBill(null);
                      
                      // Check if no more split bills remain, then close the split modal
                      if (updatedSplitBills.length === 0) {
                        console.log('No more split bills remaining - closing split bill modal automatically');
                        // Close the split bill modal
                        setShowSplitBillModal(false);
                        setTotalSplit('');
                        setSplitItems([]);
                        setSplitBills([]);
                        setSelectedSplitBill(null);
                        setSplitDiscount(0);
                        setSplitCharge(0);
                        setSplitTips(0);
                        setSplitBillToRemove(null);
                        setCustomerSearchFromSplit(false);
                        setIsSinglePayMode(false);
                      }
                      
                      console.log('Automatically removed paid split bill and reset selectedSplitBill after successful payment');
                    }
                  } else {
                    showError('Failed to place split bill order. Please try again.');
                    return;
                  }
                }

              // Clear cart after successful payment (for single pay mode only)
              // Split bill cart clearing is handled above in the split bill section
              console.log('=== CART CLEARING LOGIC ===');
              console.log('selectedSplitBill:', selectedSplitBill);
              console.log('isSinglePayMode:', isSinglePayMode);
              console.log('cartItems before clearing:', cartItems);
              console.log('cartItems length:', cartItems?.length);
              
              if (!selectedSplitBill) {
                // Single pay mode - clear entire cart
                console.log('Clearing cart for single pay mode...');
                clearCart();
                console.log('Cart cleared after single pay mode payment');
              } else {
                // Split bill mode - cart clearing is handled above in the split bill section
                console.log('Split bill mode - cart clearing already handled above');
              }
              
              onClose();
              setIsSinglePayMode(false);
              resetFinalizeSaleModal();
              
              // Ensure selectedSplitBill is cleared after payment processing
              if (selectedSplitBill) {
                setSelectedSplitBill(null);
                console.log('Cleared selectedSplitBill after payment processing');
              }
              
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
                
                // Even if there's an error, we should still try to clear the cart if the order was successfully created
                console.log('Payment error occurred - checking if cart should still be cleared...');
                console.log('selectedSplitBill:', selectedSplitBill);
                console.log('isSinglePayMode:', isSinglePayMode);
                
                // For single pay mode, if we get here it means the order creation failed, so don't clear cart
                // For split bills, the updateCartAfterSplitPayment might have already been called
                if (selectedSplitBill) {
                  console.log('Split bill payment failed - cart state depends on updateCartAfterSplitPayment');
                } else {
                  console.log('Single pay mode payment failed - keeping cart intact');
                }
              }
            }}
            className={`flex-1 px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg font-semibold ${
              (() => {
                const remainingAmount = Math.max(0, (
                  isSinglePayMode ? calculateSinglePayTotals().total :
                  selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal()
                ) - (parseFloat(givenAmount) || 0));
                return remainingAmount > 0
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700';
              })()
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Submit
          </button> */}
        </div>
      </div>

  );
};

export default FinalizeSaleModal;    