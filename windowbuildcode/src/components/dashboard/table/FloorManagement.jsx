import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2, ArrowLeft, Users } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';
import useVirtualKeyboard from '../../../hooks/useVirtualKeyboard';

const FloorManagement = () => {
  const [floors, setFloors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [newFloor, setNewFloor] = useState({
    name: '',
    type: 'Indoor'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [floorTables, setFloorTables] = useState([]);
  const [showTableView, setShowTableView] = useState(false);
  
  // Use the custom hook for keyboard functionality
  const {
    showKeyboard,
    activeInput,
    keyboardInput,
    capsLock,
    handleInputFocus,
    handleInputBlur,
    handleAnyInputFocus,
    handleAnyInputClick,
    onKeyboardChange,
    onKeyboardChangeAll,
    onKeyboardKeyPress,
    resetKeyboardInputs,
    hideKeyboard
  } = useVirtualKeyboard(['name', 'type']);

  const fetchFloors = async () => {
    try {
      const result = await window.myAPI?.floorGetAll();
      if (result && result.success) {
        setFloors(result.data || []);
      } else {
        console.error('Failed to fetch floors:', result?.message || 'Unknown error');
        setFloors([]);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      setFloors([]);
    }
  };

  const fetchFloorTables = async (floorId) => {
    try {
      const result = await window.myAPI?.tableGetByFloor(floorId);
      if (result && result.success) {
        setFloorTables(result.data || []);
      } else {
        console.error('Failed to fetch floor tables:', result?.message || 'Unknown error');
        setFloorTables([]);
      }
    } catch (error) {
      console.error('Error fetching floor tables:', error);
      setFloorTables([]);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  // Keyboard useEffect - handled by the hook now

  const handleFloorClick = async (floor) => {
    setSelectedFloor(floor);
    await fetchFloorTables(floor.id);
    setShowTableView(true);
  };

  const handleBackToList = () => {
    setShowTableView(false);
    setSelectedFloor(null);
    setFloorTables([]);
  };

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloor({
      name: floor.name,
      type: floor.type
    });
    setShowForm(true);
    resetKeyboardInputs();
  };

  const handleAddFloor = () => {
    setEditingFloor(null);
    setNewFloor({
      name: '',
      type: 'Indoor'
    });
    setShowForm(true);
    resetKeyboardInputs();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFloor(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle keyboard input changes
  const handleKeyboardChange = (input, inputName) => {
    if (inputName === 'name') {
      setNewFloor(prev => ({
        ...prev,
        name: input
      }));
    } else if (inputName === 'type') {
      setNewFloor(prev => ({
        ...prev,
        type: input
      }));
    }
  };

  // Handle keyboard key presses
  const handleKeyboardKeyPress = (result) => {
    if (result && result.action === 'enter' && result.nextField) {
      const nextInput = document.querySelector(`[name="${result.nextField}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    } else if (result && result.action === 'tab' && result.nextField) {
      const nextInput = document.querySelector(`[name="${result.nextField}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFloor) {
        // Update existing floor
        const updateResult = await window.myAPI?.floorUpdate(editingFloor.id, {
          name: newFloor.name,
          type: newFloor.type,
        });
        if (!updateResult || !updateResult.success) {
          throw new Error(updateResult?.message || 'Failed to update floor');
        }
      } else {
        // Add new floor
        const createResult = await window.myAPI?.floorCreate({
          name: newFloor.name,
          type: newFloor.type,
          addedby: 1, // Mock user ID
        });
        if (!createResult || !createResult.success) {
          throw new Error(createResult?.message || 'Failed to create floor');
        }
      }
      fetchFloors();
      setShowForm(false);
      resetKeyboardInputs();
    } catch (error) {
      console.error('Error saving floor:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteClick = (floor) => {
    setFloorToDelete(floor);
    setShowDeleteConfirm(true);
  };

  const deleteFloor = async (id) => {
    try {
      const deleteResult = await window.myAPI?.floorUpdate(id, { isdeleted: 1 });
      if (!deleteResult || !deleteResult.success) {
        throw new Error(deleteResult?.message || 'Failed to delete floor');
      }
      fetchFloors();
      setShowForm(false);
      setShowDeleteConfirm(false);
      setFloorToDelete(null);
    } catch (error) {
      console.error('Error deleting floor:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Table View Component
  const TableView = () => {
    const getTableSize = (seatCapacity) => {
      if (seatCapacity <= 2) return 'w-16 h-16';
      if (seatCapacity <= 4) return 'w-20 h-20';
      if (seatCapacity <= 6) return 'w-24 h-24';
      return 'w-28 h-28';
    };

    const getTableColor = (status) => {
      switch (status) {
        case 'Occupied':
          return 'bg-red-500';
        case 'Reserved':
          return 'bg-yellow-500';
        default:
          return 'bg-green-500';
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{selectedFloor?.name}</h2>
              <p className="text-sm text-gray-600">{selectedFloor?.type} Floor</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Tables: <span className="font-semibold text-primary">{floorTables.length}</span></p>
            <p className="text-sm text-gray-600">Total Seats: <span className="font-semibold text-primary">
              {floorTables.reduce((total, table) => total + (table.seat_capacity || 0), 0)}
            </span></p>
          </div>
        </div>

        {/* Floor Layout */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
          {floorTables.length > 0 ? (
            <div className="grid grid-cols-6 gap-6">
              {floorTables.map((table) => (
                <div
                  key={table.id}
                  className={`${getTableSize(table.seat_capacity)} ${getTableColor(table.status || 'Free')} rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer relative group`}
                  title={`Table ${table.table_no} - ${table.seat_capacity} seats - ${table.status || 'Free'}`}
                >
                  {/* Table Number */}
                  <span className="text-xs font-bold">T{table.table_no}</span>
                  
                  {/* Seat Capacity */}
                  <div className="flex items-center gap-1 mt-1">
                    <Users size={10} />
                    <span className="text-xs">{table.seat_capacity}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute -top-2 -right-2 bg-white text-xs px-1 py-0.5 rounded-full text-gray-700 font-medium shadow-sm">
                    {table.status || 'Free'}
                  </div>

                  {/* Hover Info */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    Table {table.table_no} - {table.seat_capacity} seats
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <p className="text-lg font-medium">No tables found</p>
              <p className="text-sm text-gray-400 mt-1">Add tables to this floor to see them here</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Reserved</span>
          </div>
        </div>
      </div>
    );
  };

  // Floor List View
  const FloorListView = () => (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Floor List</h2>
        <button
          onClick={handleAddFloor}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Floor
        </button>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
        <thead>
          <tr className="bg-primaryExtraLight">
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              SI
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Floor Name
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Type
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Total Tables
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {floors.map((floor, index) => (
            <tr key={floor.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleFloorClick(floor)}
                  className="text-sm font-medium text-gray-800 hover:text-primary transition-colors text-left"
                >
                  {floor.name}
                </button>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{floor.type}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{floor.table_count || 0}</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditFloor(floor)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(floor)}
                    className="text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {showTableView ? <TableView /> : <FloorListView />}

      {showForm && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingFloor ? 'Edit Floor' : 'Add New Floor'}
                </h2>
                <button onClick={() => { setShowForm(false); resetKeyboardInputs(); }} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Ground Floor, Rooftop"
                    value={newFloor.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewFloor(prev => ({ ...prev, name: value }));
                    }}
                    onFocus={(e) => handleAnyInputFocus(e, 'name', newFloor.name)}
                    onClick={(e) => handleAnyInputClick(e, 'name', newFloor.name)}
                    onBlur={handleInputBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Type*
                  </label>
                  <select
                    name="type"
                    value={newFloor.type}
                    onChange={handleInputChange}
                    onFocus={(e) => handleAnyInputFocus(e, 'type', newFloor.type)}
                    onClick={(e) => handleAnyInputClick(e, 'type', newFloor.type)}
                    onBlur={handleInputBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  >
                    <option value="Indoor">Indoor</option>
                    <option value="Outdoor">Outdoor</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetKeyboardInputs(); }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primaryLight hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight"
                  >
                    {editingFloor ? 'Update Floor' : 'Add Floor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Virtual Keyboard Component */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={hideKeyboard}
        activeInput={activeInput}
        onInputChange={handleKeyboardChange}
        onInputBlur={handleInputBlur}
        inputValue={keyboardInput}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && floorToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Floor</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFloorToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete this floor?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFloorToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteFloor(floorToDelete.id)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloorManagement; 