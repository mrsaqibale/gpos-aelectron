import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Table Selection modal (copied from RunningOrders UI)
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - floors: []
 * - floorsLoading: boolean
 * - selectedFloor: string
 * - onSelectFloor: (floor) => void
 * - addSampleData: () => void
 * - tables: []
 * - tablesLoading: boolean
 * - selectedTable: string|number
 * - onSelectTable: (tableId) => void
 * - reservedTables: Array<{id, tableNo, persons, floor}>
 * - onRemoveReservedTable: (id) => void
 * - isTableReserved: (tableId) => boolean
 * - selectedPersons: string|number
 * - onSelectPersons: (count) => void
 * - getSeatCapacityOptions: () => number[]
 * - onMergeTable: () => void
 * - onSave: () => void
 */
const TableSelectionModal = ({
  open,
  onClose,
  floors = [],
  floorsLoading = false,
  selectedFloor = '',
  onSelectFloor,
  addSampleData,
  tables = [],
  tablesLoading = false,
  selectedTable = '',
  onSelectTable,
  reservedTables = [],
  onRemoveReservedTable,
  isTableReserved = () => false,
  selectedPersons = '',
  onSelectPersons,
  getSeatCapacityOptions = () => [],
  onMergeTable,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
          <h2 className="text-xl font-bold">Table Selection</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className='flex gap-6'>
            {/* Floor Selection */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Floor</h3>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                {floorsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">Loading floors...</div>
                  </div>
                ) : floors && floors.length > 0 ? (
                  floors.map((floor) => (
                    <button
                      key={floor.id}
                      onClick={() => onSelectFloor?.(floor)}
                      className={`px-4 py-3 text-left rounded-lg transition-colors border ${selectedFloor === floor.name
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                        }`}
                    >
                      <div className="font-medium">{floor.name}</div>
                      <div className="text-sm opacity-75">{floor.type}</div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">No floors found</div>
                    <div className="text-gray-400 text-xs mt-2 mb-4">Please add floors to the database</div>
                    <button
                      onClick={addSampleData}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                    >
                      Add Sample Data
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Dropdowns Section */}
            <div className="flex-1 grid grid-cols-1 gap-4">
              {/* Table Selection Dropdown */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${selectedFloor ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                  Select Table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => onSelectTable?.(e.target.value)}
                  disabled={!selectedFloor}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${selectedFloor
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <option value="">Choose a table...</option>
                  {tablesLoading ? (
                    <option value="" disabled>Loading tables...</option>
                  ) : tables.length > 0 ? (
                    tables.map((table) => (
                      <option 
                        key={table.id} 
                        value={table.id}
                        disabled={isTableReserved(table.id.toString())}
                      >
                        Table {table.table_no} ({table.seat_capacity || 4} seats) {isTableReserved(table.id.toString()) ? '- RESERVED' : ''}
                      </option>
                    ))
                  ) : selectedFloor ? (
                    <option value="" disabled>No available tables</option>
                  ) : (
                    <option value="" disabled>Select a floor first</option>
                  )}
                </select>
                {/* Reserved Tables Indicator */}
                {reservedTables.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Reserved Tables:</h4>
                    <div className={`space-y-2 ${reservedTables.length > 3 ? 'max-h-32 overflow-y-auto pr-2' : ''}`}>
                      {reservedTables.map((reservedTable) => (
                        <div key={reservedTable.id} className="p-2 bg-orange-50 border border-orange-200 rounded-lg flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm text-orange-700 font-medium">
                                Table {reservedTable.tableNo} ({reservedTable.persons} persons) - {reservedTable.floor}
                              </span>
                            </div>
                            <button
                              onClick={() => onRemoveReservedTable?.(reservedTable.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove reservation"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Persons Selection Dropdown */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${selectedTable ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                  Persons
                </label>
                <select
                  value={selectedPersons}
                  onChange={(e) => onSelectPersons?.(e.target.value)}
                  disabled={!selectedTable}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${selectedTable
                    ? 'border-gray-300 bg-white'
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <option value="">Select number of persons...</option>
                  {getSeatCapacityOptions().map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Person' : 'Persons'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              disabled={!selectedFloor}
              onClick={onMergeTable}
              className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedFloor
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
              </svg>
              Merge Table
            </button>
            <button
              disabled={!selectedPersons}
              onClick={onSave}
              className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedPersons
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17,21 17,13 7,13 7,21"></polyline>
                <polyline points="7,3 7,8 15,8"></polyline>
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableSelectionModal;


