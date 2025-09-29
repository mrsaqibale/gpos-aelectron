import React, { useMemo, useState, useEffect } from 'react'
import { X, Clock, Calendar, Users, Table2, Search } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import MergeTableModal from '../table/MergeTableModal'
import TableSelectionModal from '../table/TableSelectionModal'
import useCustomAlert from '../../../hooks/useCustomAlert'
import CustomAlert from '../../CustomAlert'

const NewReservation = ({ isOpen, onClose, onCreate }) => {
  const { themeColors } = useTheme()
  const [showMergeTableModal, setShowMergeTableModal] = useState(false)
  const [showTableSelectionModal, setShowTableSelectionModal] = useState(false)
  const [floors, setFloors] = useState([])
  const [floorsLoading, setFloorsLoading] = useState(false)
  const [selectedFloor, setSelectedFloor] = useState('')
  const [tables, setTables] = useState([])
  const [tablesLoading, setTablesLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedPersons, setSelectedPersons] = useState('')
  const [mergeTableSelections, setMergeTableSelections] = useState([{ id: 1, tableId: '' }, { id: 2, tableId: '' }])
  const [form, setForm] = useState({
    customerName: '',
    phoneNumber: '',
    date: '',
    startTime: '',
    duration: '2',
    partySize: '2',
    tablePreference: 'any',
    notes: ''
  })
  const [customerSearchResults, setCustomerSearchResults] = useState([])
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [hotelInfo, setHotelInfo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { alertState, showError, showSuccess, hideAlert } = useCustomAlert()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    
    // Handle customer name search
    if (name === 'customerName' && value.length >= 2) {
      searchCustomers(value)
    } else if (name === 'customerName' && value.length < 2) {
      setCustomerSearchResults([])
      setShowCustomerDropdown(false)
    }
  }

  // Search customers by name
  const searchCustomers = async (searchTerm) => {
    try {
      if (!window.myAPI) return
      const result = await window.myAPI.searchCustomerByName(searchTerm)
      if (result && result.success) {
        setCustomerSearchResults(result.data || [])
        setShowCustomerDropdown(true)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  // Select customer from dropdown
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setForm(prev => ({
      ...prev,
      customerName: customer.name,
      phoneNumber: customer.phone || ''
    }))
    setShowCustomerDropdown(false)
    setCustomerSearchResults([])
  }

  // Load hotel information for opening hours
  const loadHotelInfo = async () => {
    try {
      if (!window.myAPI) return
      const result = await window.myAPI.getHotelInfo()
      if (result && result.success) {
        setHotelInfo(result.data)
      }
    } catch (error) {
      console.error('Error loading hotel info:', error)
    }
  }

  // Check table availability
  const checkTableAvailability = async (tableId, date, startTime, duration) => {
    try {
      if (!window.myAPI || !tableId) return true
      
      const result = await window.myAPI.getReservationsByDateRange(date, date, 1)
      if (result && result.success) {
        const reservations = result.data || []
        const startTimeMinutes = timeToMinutes(startTime)
        const endTimeMinutes = startTimeMinutes + (parseFloat(duration) * 60)
        
        return !reservations.some(reservation => {
          if (reservation.table_id !== tableId) return false
          const resStart = timeToMinutes(reservation.start_time)
          const resEnd = resStart + (parseFloat(reservation.duration || 2) * 60)
          
          // Check for overlap
          return (startTimeMinutes < resEnd && endTimeMinutes > resStart)
        })
      }
      return true
    } catch (error) {
      console.error('Error checking table availability:', error)
      return true
    }
  }

  // Convert time to minutes for comparison
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Validate reservation time against restaurant hours
  const validateReservationTime = (startTime, duration) => {
    if (!hotelInfo || !hotelInfo.opening_time || !hotelInfo.closeing_time) return true
    
    const startMinutes = timeToMinutes(startTime)
    const durationMinutes = parseFloat(duration) * 60
    const endMinutes = startMinutes + durationMinutes
    
    const openingMinutes = timeToMinutes(hotelInfo.opening_time)
    const closingMinutes = timeToMinutes(hotelInfo.closeing_time)
    
    if (startMinutes < openingMinutes) {
      showError(`Reservation time must be after opening time (${hotelInfo.opening_time})`)
      return false
    }
    
    if (endMinutes > closingMinutes) {
      const maxDuration = Math.floor((closingMinutes - startMinutes) / 60 * 10) / 10
      showError(`Maximum duration is ${maxDuration} hours (restaurant closes at ${hotelInfo.closeing_time})`)
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const requiredFields = ['customerName', 'phoneNumber', 'date', 'startTime', 'partySize']
      const missing = requiredFields.filter((k) => !String(form[k] || '').trim())
      if (missing.length) {
        showError('Fill in the required fields')
        return
      }

      // Validate reservation time
      if (!validateReservationTime(form.startTime, form.duration)) {
        return
      }

      // Check table availability if specific table is selected
      if (selectedTable) {
        const isAvailable = await checkTableAvailability(selectedTable, form.date, form.startTime, form.duration)
        if (!isAvailable) {
          showError('Selected table is not available at the chosen time')
          return
        }
      }

      let customerId = selectedCustomer?.id
      let customerData = {
        name: form.customerName,
        phone: form.phoneNumber,
        email: '',
        address: '',
        isloyal: false,
        addedBy: 1, // Default employee ID
        hotel_id: 1
      }

      // If no customer selected, create new customer
      if (!customerId) {
        const customerResult = await window.myAPI.createCustomer(customerData)
        if (customerResult && customerResult.success) {
          customerId = customerResult.id
        } else {
          showError('Failed to create customer')
          return
        }
      }

      // Calculate end time
      const startTimeMinutes = timeToMinutes(form.startTime)
      const endTimeMinutes = startTimeMinutes + (parseFloat(form.duration) * 60)
      const endTime = `${Math.floor(endTimeMinutes / 60).toString().padStart(2, '0')}:${(endTimeMinutes % 60).toString().padStart(2, '0')}`

      // Create reservation data
      const reservationData = {
        customer_id: customerId,
        customer_name: form.customerName,
        customer_phone: form.phoneNumber,
        customer_email: selectedCustomer?.email || '',
        reservation_date: form.date,
        start_time: form.startTime,
        end_time: endTime,
        duration: parseFloat(form.duration),
        party_size: parseInt(form.partySize),
        table_id: selectedTable || null,
        table_preference: form.tablePreference,
        is_table_preferred: form.tablePreference === 'customerrequired',
        status: 'confirmed',
        special_notes: form.notes,
        hotel_id: 1,
        added_by: 1 // Default employee ID
      }

      // Create reservation
      const result = await window.myAPI.createReservation(reservationData)
      if (result && result.success) {
        showSuccess('Reservation created successfully!')
        if (onCreate) onCreate(result.data)
        // Reset form
        setForm({
          customerName: '',
          phoneNumber: '',
          date: '',
          startTime: '',
          duration: '2',
          partySize: '2',
          tablePreference: 'any',
          notes: ''
        })
        setSelectedCustomer(null)
        setSelectedTable('')
        onClose()
      } else {
        showError('Failed to create reservation')
      }
    } catch (error) {
      console.error('Error creating reservation:', error)
      showError('An error occurred while creating the reservation')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load hotel info when modal opens
  useEffect(() => {
    if (isOpen) {
      loadHotelInfo()
    }
  }, [isOpen])

  // Load floors when modal opens
  React.useEffect(() => {
    if (!showTableSelectionModal) return
    const run = async () => {
      try {
        setFloorsLoading(true)
        if (!window.myAPI) {
          setFloors([])
          return
        }
        const result = await window.myAPI.floorGetAll()
        if (result && result.success) {
          setFloors(result.data)
        } else {
          setFloors([])
        }
      } catch (e) {
        setFloors([])
      } finally {
        setFloorsLoading(false)
      }
    }
    run()
  }, [showTableSelectionModal])

  const fetchTablesByFloor = async (floorId) => {
    try {
      setTablesLoading(true)
      if (!window.myAPI) {
        setTables([])
        return
      }
      const result = await window.myAPI.tableGetByFloorWithStatus(floorId, 'Free')
      if (result && result.success) {
        setTables(result.data)
      } else {
        setTables([])
      }
    } catch {
      setTables([])
    } finally {
      setTablesLoading(false)
    }
  }

  const handleSelectFloor = (floor) => {
    setSelectedFloor(floor?.name || '')
    if (floor?.id != null) fetchTablesByFloor(floor.id)
  }

  const handleMergeTableSelectionChange = (selectionId, tableId) => {
    setMergeTableSelections((prev) => prev.map((s) => (s.id === selectionId ? { ...s, tableId } : s)))
  }

  const handleRemoveTableSelection = (selectionId) => {
    setMergeTableSelections((prev) => (prev.length > 2 ? prev.filter((s) => s.id !== selectionId) : prev))
  }

  const handleAddMoreTableSelection = () => {
    setMergeTableSelections((prev) => [...prev, { id: prev.length ? Math.max(...prev.map((p) => Number(p.id))) + 1 : 1, tableId: '' }])
  }

  const isAddMoreDisabled = () => mergeTableSelections.length >= 6
  const getAvailableTablesForSelection = () => tables
  const [reservedTables] = useState([])
  const isTableReserved = () => false
  const removeReservedTable = () => {}
  const getSeatCapacityOptions = () => Array.from({ length: 12 }).map((_, i) => i + 1)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ backgroundColor: themeColors.primary }}
        >
          <h2 className="text-white font-semibold">New Reservation</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/15">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  name="customerName" 
                  required 
                  value={form.customerName} 
                  onChange={handleChange} 
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" 
                  placeholder="Enter customer name" 
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              
              {/* Customer Search Dropdown */}
              {showCustomerDropdown && customerSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {customerSearchResults.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => selectCustomer(customer)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
              <input name="phoneNumber" required value={form.phoneNumber} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Enter phone number" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" required value={form.date} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Start Time <span className="text-red-500">*</span></label>
              <input type="time" name="startTime" required value={form.startTime} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <select name="duration" value={form.duration} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white">
                <option value="1">1 hour</option>
                <option value="1.5">1.5 hours</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Party Size <span className="text-red-500">*</span></label>
              <select name="partySize" required value={form.partySize} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white">
                {Array.from({ length: 20 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Table Preference</label>
              <select name="tablePreference" value={form.tablePreference} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white">
                <option value="any">Any Available Table</option>
                <option value="customerrequired">Customer Required</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={() => setShowTableSelectionModal(true)} className="py-2.5 px-4 rounded bg-primary text-white text-sm font-medium">Choose Table</button>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Special Requests</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={4} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Any special requests or notes" />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-500 text-white" disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        message={alertState.message}
        isVisible={alertState.isVisible}
        onClose={hideAlert}
        duration={alertState.duration}
        type={alertState.type}
      />

      {/* Table Selection Modal */}
      <TableSelectionModal
        open={showTableSelectionModal}
        onClose={() => setShowTableSelectionModal(false)}
        floors={floors}
        floorsLoading={floorsLoading}
        selectedFloor={selectedFloor}
        onSelectFloor={handleSelectFloor}
        addSampleData={() => {}}
        tables={tables}
        tablesLoading={tablesLoading}
        selectedTable={selectedTable}
        onSelectTable={(id) => setSelectedTable(id)}
        reservedTables={reservedTables}
        onRemoveReservedTable={removeReservedTable}
        isTableReserved={isTableReserved}
        selectedPersons={selectedPersons}
        onSelectPersons={(val) => setSelectedPersons(val)}
        getSeatCapacityOptions={getSeatCapacityOptions}
        onMergeTable={() => setShowMergeTableModal(true)}
        onSave={() => setShowTableSelectionModal(false)}
      />

      {/* Merge Table Modal */}
      <MergeTableModal
        open={showMergeTableModal}
        onBack={() => setShowMergeTableModal(false)}
        onClose={() => {
          setShowMergeTableModal(false)
          setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }])
        }}
        floors={floors}
        floorsLoading={floorsLoading}
        selectedFloor={selectedFloor}
        onSelectFloor={handleSelectFloor}
        addSampleData={() => {}}
        tables={tables}
        tablesLoading={tablesLoading}
        mergeTableSelections={mergeTableSelections}
        onSelectionChange={handleMergeTableSelectionChange}
        onRemoveSelection={handleRemoveTableSelection}
        onAddMoreSelection={handleAddMoreTableSelection}
        isAddMoreDisabled={isAddMoreDisabled}
        getAvailableTablesForSelection={getAvailableTablesForSelection}
        isTableReserved={isTableReserved}
        onSave={() => {
          setShowMergeTableModal(false)
          setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }])
        }}
      />
    </div>
  )
}

export default NewReservation