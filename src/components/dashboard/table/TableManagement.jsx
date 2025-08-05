import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [floors, setFloors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({
    table_no: '',
    floor_id: '',
    seat_capacity: 4
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  const fetchTables = async () => {
    try {
      const result = await window.myAPI?.tableGetAll();
      if (result && result.success) {
        setTables(result.data || []);
      } else {
        console.error('Failed to fetch tables:', result?.message || 'Unknown error');
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

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

  useEffect(() => {
    fetchTables();
    fetchFloors();
  }, []);

  const handleEditTable = (table) => {
    setEditingTable(table);
    setNewTable({
      table_no: table.table_no,
      floor_id: table.floor_id,
      seat_capacity: table.seat_capacity || 4
    });
    setShowForm(true);
  };

  const handleAddTable = () => {
    setEditingTable(null);
    setNewTable({
      table_no: '',
      floor_id: floors.length > 0 ? floors[0].id : '',
      seat_capacity: 4
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTable(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        // Update existing table
        const updateResult = await window.myAPI?.tableUpdate(editingTable.id, {
          table_no: newTable.table_no,
          floor_id: parseInt(newTable.floor_id),
          seat_capacity: parseInt(newTable.seat_capacity),
        });
        if (!updateResult || !updateResult.success) {
          throw new Error(updateResult?.message || 'Failed to update table');
        }
      } else {
        // Add new table
        const createResult = await window.myAPI?.tableCreate({
          table_no: newTable.table_no,
          floor_id: parseInt(newTable.floor_id),
          seat_capacity: parseInt(newTable.seat_capacity),
          addedby: 1, // Mock user ID
        });
        if (!createResult || !createResult.success) {
          throw new Error(createResult?.message || 'Failed to create table');
        }
      }
      fetchTables();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving table:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDeleteClick = (table) => {
    setTableToDelete(table);
    setShowDeleteConfirm(true);
  };

  const deleteTable = async (id) => {
    try {
      const deleteResult = await window.myAPI?.tableUpdate(id, { isdeleted: 1 });
      if (!deleteResult || !deleteResult.success) {
        throw new Error(deleteResult?.message || 'Failed to delete table');
      }
      fetchTables();
      setShowForm(false);
      setShowDeleteConfirm(false);
      setTableToDelete(null);
    } catch (error) {
      console.error('Error deleting table:', error);
      alert(`Error: ${error.message}`);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'Free':
        return 'text-green-600 bg-green-100';
      case 'Occupied':
        return 'text-red-600 bg-red-100';
      case 'Reserved':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Table List</h2>
        <button
          onClick={handleAddTable}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Table
        </button>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
        <thead>
          <tr className="bg-primaryExtraLight">
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Table ID
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Table Name
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Floor
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Seats
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table, index) => (
            <tr key={table.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-700">{table.id}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-800">{table.table_no}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{table.floor_name || 'N/A'}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{table.seat_capacity || 4}</span>
              </td>
              <td className="py-3 px-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                  {table.status || 'Free'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditTable(table)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(table)}
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

      {showForm && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingTable ? 'Edit Table' : 'Add New Table'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Name / Number*
                  </label>
                  <input
                    type="text"
                    name="table_no"
                    value={newTable.table_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="e.g., T1, Booth 3"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor*
                  </label>
                  <select
                    name="floor_id"
                    value={newTable.floor_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  >
                    <option value="">Select a floor</option>
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seats Capacity*
                  </label>
                  <input
                    type="number"
                    name="seat_capacity"
                    value={newTable.seat_capacity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="e.g., 4"
                    min="1"
                    max="20"
                    required
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primaryLight hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight"
                  >
                    {editingTable ? 'Update Table' : 'Add Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && tableToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Table</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTableToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete this table?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTableToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTable(tableToDelete.id)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement; 