import React from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Package, Clock, Heart, DollarSign } from 'lucide-react'

const CashoutSummaryModal = ({ isOpen, onClose, rider, onManageOrders, onProcessCashout }) => {
  const navigate = useNavigate()
  
  if (!isOpen) return null

  const cashoutData = {
    rider: rider?.name || 'N/A',
    settledOrders: 2,
    unsettledOrders: 0,
    totalDrops: { count: 3, rate: 3, total: 9.00 },
    totalDistance: { km: 6.7, rate: 0.75, total: 5.03 },
    totalDeliveryFees: 14.03,
    totalTips: 8.50,
    totalPayout: 16.91
  }

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex bg-primary rounded-t-lg items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-white">Cashout Summary</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Rider Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-lg font-medium text-gray-800">Rider: {cashoutData.rider}</p>
        </div>

        {/* Order Status Cards */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1 bg-[#FFC824] p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-yellow-800 mb-2">SETTLED ORDERS</p>
              <p className="text-3xl font-bold text-yellow-900">{cashoutData.settledOrders}</p>
            </div>
            <div className="flex-1 bg-[#3395FF] p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-white mb-2">UNSETTLED ORDERS</p>
              <p className="text-3xl font-bold text-white">{cashoutData.unsettledOrders}</p>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Breakdown:</h3>
          
          <div className="space-y-3">
            {/* Total Drops */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Total Drops</span>
              </div>
              <span className="font-medium text-gray-800">
                {cashoutData.totalDrops.count} x €{cashoutData.totalDrops.rate} = €{cashoutData.totalDrops.total.toFixed(2)}
              </span>
            </div>

            {/* Total Distance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Total Distance</span>
              </div>
              <span className="font-medium text-gray-800">
                {cashoutData.totalDistance.km} km x €{cashoutData.totalDistance.rate} = €{cashoutData.totalDistance.total.toFixed(2)}
              </span>
            </div>

            {/* Total Delivery Fees */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Total Delivery Fees</span>
              </div>
              <span className="font-medium text-gray-800">€{cashoutData.totalDeliveryFees.toFixed(2)}</span>
            </div>

            {/* Total Tips */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Total Tips</span>
              </div>
              <span className="font-medium text-gray-800">€{cashoutData.totalTips.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Total Payout */}
        <div className="p-6 border-b border-gray-200">
          <div className="bg-[#28A745] p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Total Payout</span>
              <span className="text-2xl font-bold text-white">€{cashoutData.totalPayout.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex gap-3">
          <button
            onClick={() => {
              onClose() 
              navigate('/dashboard/manage-orders') 
            }}
            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            MANAGE ORDERS
          </button>
          <button
            onClick={onProcessCashout}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            PROCESS CASHOUT
          </button>
        </div>
      </div>
    </div>
  )
}

const RiderReport = ({ isOpen, onClose, rider, onManageOrders, onProcessCashout }) => {
  return (
    <CashoutSummaryModal
      isOpen={isOpen}
      onClose={onClose}
      rider={rider}
      onManageOrders={onManageOrders}
      onProcessCashout={onProcessCashout}
    />
  )
}

export default RiderReport