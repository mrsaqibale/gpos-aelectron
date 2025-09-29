import React from 'react';
import { ArrowLeft, X, Plus } from 'lucide-react';

/**
 * Reusable modal for merging tables across floors.
 *
 * Props:
 * - open: boolean
 * - onBack: () => void
 * - onClose: () => void
 * - floors: Array<{ id: string|number, name: string, type?: string }>
 * - floorsLoading: boolean
 * - selectedFloor: any
 * - onSelectFloor: (floor) => void
 * - addSampleData: () => void
 * - tables: Array<{ id: string|number, table_no: string|number, seat_capacity?: number }>
 * - tablesLoading: boolean
 * - mergeTableSelections: Array<{ id: string|number, tableId: string }>
 * - onSelectionChange: (selectionId: string|number, tableId: string) => void
 * - onRemoveSelection: (selectionId: string|number) => void
 * - onAddMoreSelection: () => void
 * - isAddMoreDisabled: () => boolean
 * - getAvailableTablesForSelection: (selectionId: string|number) => Array
 * - isTableReserved: (tableId: string) => boolean
 * - onSave: (selectedTables: Array<{ id: string, tableNo: string|number, floor: any }>) => void
 */
const MergeTableModal = ({
  open,
  onBack,
  onClose,
  floors,
  floorsLoading,
  selectedFloor,
  onSelectFloor,
  addSampleData,
  tables,
  tablesLoading,
  mergeTableSelections,
  onSelectionChange,
  onRemoveSelection,
  onAddMoreSelection,
  isAddMoreDisabled,
  getAvailableTablesForSelection,
  isTableReserved,
  onSave,
}) => {
  if (!open) return null;

  const canSave = mergeTableSelections.filter(s => s.tableId).length >= 2;

  const handleSaveClick = () => {
    if (!canSave) return;
    const selectedTables = mergeTableSelections
      .filter(selection => selection.tableId)
      .map(selection => {
        const table = tables.find(t => t.id.toString() === selection.tableId);
        return {
          id: selection.tableId,
          tableNo: table?.table_no,
          floor: selectedFloor,
        };
      });
    onSave?.(selectedTables);
  };

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center rounded-t-xl relative flex-shrink-0">
          <button
            onClick={onBack}
            className="text-white cursor-pointer p-1 rounded-full flex items-center gap-1"
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">Merge Tables</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 ml-auto"
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
                ) : floors.length > 0 ? (
                  floors.map((floor) => (
                    <button
                      key={floor.id}
                      onClick={() => onSelectFloor(floor)}
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

            {/* Merge Tables Section */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Tables to Merge</h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {mergeTableSelections.map((selection, index) => (
                  <div key={selection.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className={`block text-sm font-medium mb-2 ${selectedFloor ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                        Select Table {index + 1}
                      </label>
                      <select
                        value={selection.tableId}
                        onChange={(e) => onSelectionChange(selection.id, e.target.value)}
                        disabled={!selectedFloor}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${selectedFloor
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <option value="">Choose table {index + 1}...</option>
                        {tablesLoading ? (
                          <option value="" disabled>Loading tables...</option>
                        ) : tables.length > 0 ? (
                          getAvailableTablesForSelection(selection.id).map((table) => (
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
                    </div>
                    {mergeTableSelections.length > 2 && (
                      <button
                        onClick={() => onRemoveSelection(selection.id)}
                        className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove table selection"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={onAddMoreSelection}
                  disabled={isAddMoreDisabled()}
                  className={`w-fit px-4 py-2 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isAddMoreDisabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                >
                  <Plus size={16} />
                  Add More
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!canSave}
              onClick={handleSaveClick}
              className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${canSave
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

export default MergeTableModal;


