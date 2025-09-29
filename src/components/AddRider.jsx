import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useRiders } from '../contexts/RiderContext'

const AddRider = ({ isOpen, onClose, onSave }) => {
  const { addRider } = useRiders()
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    address: '',
    status: '',
    vehicleType: '',
    regNo: '',
    licenceExpiry: '',
    insuranceExpiry: '',
    blockOnExpiry: false,
    payPreset: 'hourly',
    perDrop: '',
    perKm: '',
    basePerShift: '',
    hourlyRate: '',
    deliveryFeeKeptBy: 'restaurant',
    riderShare: '',
    cashTipsKeptByRider: 'yes',
    cardTipsPayout: 'no',
    payoutMethod: 'cash',
    ibanBic: ''
  })

  const [showRegNo, setShowRegNo] = useState(false)
  const [showInsuranceExpiry, setShowInsuranceExpiry] = useState(false)
  const [showRiderShare, setShowRiderShare] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleVehicleFields = (vehicleType) => {
    setShowRegNo(vehicleType === 'car')
    setShowInsuranceExpiry(vehicleType === 'car')
  }

  const toggleSplitFields = (deliveryFeeKeptBy) => {
    setShowRiderShare(deliveryFeeKeptBy === 'split')
  }

  const setPayPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      payPreset: preset,
      perDrop: preset === 'mileage' ? '2.50' : '',
      perKm: preset === 'mileage' ? '0.50' : '',
      hourlyRate: preset === 'hourly' ? '12.00' : '',
      basePerShift: preset === 'custom' ? '50.00' : ''
    }))
  }

  const validateForm = () => {
    const requiredFields = ['fullName', 'mobile', 'status', 'vehicleType']
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '')
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`)
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validateForm()) return
    const newRider = addRider(formData)
    onSave(newRider)
    onClose()
  }

  const handleSaveAndNew = () => {
    if (!validateForm()) return
    const newRider = addRider(formData)
    onSave(newRider)
    setFormData({
      fullName: '',
      mobile: '',
      address: '',
      status: '',
      vehicleType: '',
      regNo: '',
      licenceExpiry: '',
      insuranceExpiry: '',
      blockOnExpiry: false,
      payPreset: 'hourly',
      perDrop: '',
      perKm: '',
      basePerShift: '',
      hourlyRate: '',
      deliveryFeeKeptBy: 'restaurant',
      riderShare: '',
      cashTipsKeptByRider: 'yes',
      cardTipsPayout: 'no',
      payoutMethod: 'cash',
      ibanBic: ''
    })
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <style jsx>{`
        input[type="date"] {
          position: relative;
          z-index: 1;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: auto;
          height: auto;
          color: transparent;
          background: transparent;
          cursor: pointer;
          z-index: 2;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button {
          display: none;
          -webkit-appearance: none;
        }
        .modal-content {
          pointer-events: auto;
          position: relative;
          z-index: 1;
        }
        .modal-content input[type="date"]:focus {
          z-index: 10;
          position: relative;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40;
        }
      `}</style>
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex bg-primary items-center justify-between px-6 py-3 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-white">Add Rider</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form className="space-y-8">
            {/* Identity & Contact */}
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800">Identity & Contact</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g., Ahsan Ali"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="+353..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="street, city, Eircode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              
              <p className="text-sm text-gray-500">Mobile required, Eircode helpful for zones.</p>
            </div>

            {/* Vehicle & Compliance */}
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800">Vehicle & Compliance</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vehicle type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={(e) => {
                      handleInputChange(e)
                      toggleVehicleFields(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    <option value="bike">Bike</option>
                    <option value="car">Car</option>
                    <option value="e-bike">E-bike</option>
                  </select>
                </div>
                
                {showRegNo && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Reg no.</label>
                    <input
                      type="text"
                      name="regNo"
                      value={formData.regNo}
                      onChange={handleInputChange}
                      placeholder="if Car"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Licence expiry</label>
                  <input
                    type="date"
                    name="licenceExpiry"
                    value={formData.licenceExpiry}
                    onChange={handleInputChange}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                {showInsuranceExpiry && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Insurance expiry</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleInputChange}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="blockOnExpiry"
                  name="blockOnExpiry"
                  checked={formData.blockOnExpiry}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary/20"
                />
                <label htmlFor="blockOnExpiry" className="text-sm font-medium text-gray-700">
                  Block on expiry
                </label>
              </div>
            </div>

            {/* Pay Rules */}
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800">Pay Rules</h4>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Preset</label>
                <select
                  name="payPreset"
                  value={formData.payPreset}
                  onChange={(e) => {
                    handleInputChange(e)
                    setPayPreset(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="mileage">Mileage</option>
                  <option value="hourly">Hourly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Per-drop</label>
                  <input
                    type="number"
                    name="perDrop"
                    value={formData.perDrop}
                    onChange={handleInputChange}
                    placeholder="€ per delivery"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Per-km</label>
                  <input
                    type="number"
                    name="perKm"
                    value={formData.perKm}
                    onChange={handleInputChange}
                    placeholder="€ per km"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Base per shift</label>
                  <input
                    type="number"
                    name="basePerShift"
                    value={formData.basePerShift}
                    onChange={handleInputChange}
                    placeholder="€ (optional)"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Hourly rate</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder="€ (optional)"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500">Per-drop + Per-km payment structure.</p>
            </div>

            {/* Tips & Delivery-Fee Policy */}
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800">Tips & Delivery-Fee Policy</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery fee kept by <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deliveryFeeKeptBy"
                    value={formData.deliveryFeeKeptBy}
                    onChange={(e) => {
                      handleInputChange(e)
                      toggleSplitFields(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="rider">Rider</option>
                    <option value="split">Split %</option>
                  </select>
                </div>
                
                {showRiderShare && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Rider share %</label>
                    <input
                      type="number"
                      name="riderShare"
                      value={formData.riderShare}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cash tips kept by rider <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cashTipsKeptByRider"
                    value={formData.cashTipsKeptByRider}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Card tips payout <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="cardTipsPayout"
                    value={formData.cardTipsPayout}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="no">No</option>
                    <option value="weekly">Yes (weekly)</option>
                    <option value="share">Yes (% share)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Payout method</label>
                  <select
                    name="payoutMethod"
                    value={formData.payoutMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">IBAN/BIC</label>
                  <input
                    type="text"
                    name="ibanBic"
                    value={formData.ibanBic}
                    onChange={handleInputChange}
                    placeholder="if Bank"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-2 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleSaveAndNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save & New
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddRider
