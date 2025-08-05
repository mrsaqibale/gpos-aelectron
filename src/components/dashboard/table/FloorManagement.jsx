import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';

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
    fetchFloors();
  }, []);

  const handleEditFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloor({
      name: floor.name,
      type: floor.type
    });
    setShowForm(true);
  };

  const handleAddFloor = () => {
    setEditingFloor(null);
    setNewFloor({
      name: '',
      type: 'Indoor'
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFloor(prev => ({
      ...prev,
      [name]: value
    }));
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



  return (
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
                <span className="text-sm font-medium text-gray-800">{floor.name}</span>
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

      {showForm && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingFloor ? 'Edit Floor' : 'Add New Floor'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
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
                    value={newFloor.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="e.g., Ground Floor, Rooftop"
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
                    onClick={() => setShowForm(false)}
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
    </div>
  );
};

export default FloorManagement; 