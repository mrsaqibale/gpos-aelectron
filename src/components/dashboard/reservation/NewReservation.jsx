import React, { useMemo, useState } from 'react'
import { X, Clock, Calendar, Users, Table2 } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import MergeTableModal from '../table/MergeTableModal'
import TableSelectionModal from '../table/TableSelectionModal'

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

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onCreate) onCreate(form)
  }

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

      <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
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
            <div>
              <label className="text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
              <input name="customerName" value={form.customerName} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Enter customer name" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Enter phone number" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Start Time <span className="text-red-500">*</span></label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
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
              <select name="partySize" value={form.partySize} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded px-3 py-2 bg-white">
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
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-500 text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary text-white">Create Reservation</button>
          </div>
        </form>
      </div>

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