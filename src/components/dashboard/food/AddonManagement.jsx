import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';

const AddonManagement = () => {
  const [addons, setAddons] = useState([]);
  const [newAddon, setNewAddon] = useState({
    name: '',
    price: '',
    restaurant_id:1,
    // status:1,
    stock_type: '',
    addon_stock: '',
    // sell_count :2,
  });

useEffect(()=>{

fetchAddons();

},[addons])
const fetchAddons = async ()=>{
  try{
  if (!window.myAPI) {
        console.error('window.myAPI is not available');
        return;
      }

const hotelId=1;
const data= await window.myAPI?.getAdonsByHotel?.(hotelId);
setAddons(data);
  }catch(error){
    console.error('Error fetching addons:', error);
  }
}


  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState(null);


  const handleEditAddon = (addon) => {
    setEditingAddon(addon);
    setNewAddon({
      name: addon.name,
      price: addon.price,
      restaurant_id: 1,
      stock_type: addon.stock_type,
      addon_stock: addon.stock_type === 'Limited' ? addon.addon_stock : ''
    });
    setShowForm(true);
  };

  const handleAddAddon = () => {
    setEditingAddon(null);
    setNewAddon({
      name: '',
      price: '',
      restaurant_id: 1,
      // status: 1,
      stock_type: '',
      addon_stock: '',
      // sell_count: 2,
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddon(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addonToSave = {
      ...newAddon,
      price: parseFloat(newAddon.price),
      addon_stock: newAddon.stock_type === "Unlimited" ? "Unlimited" : parseInt(newAddon.addon_stock),
    };
    if (editingAddon) {

      await window.myAPI?.updateAdon?.(editingAddon.id, addonToSave);
      // Update existing addon
 fetchAddons();
    } else {
      try {
        const data = await window.myAPI?.createAdon?.(addonToSave);
        if (data?.success) {
          const hotelId = 1;
          const updatedAddons = await window.myAPI?.getAdonsByHotel?.(hotelId);
          setAddons(updatedAddons);
          
        }
      } catch (error) {
        console.error('Error creating addon:', error);
      }
    }
    setShowForm(false);
  };

  const toggleStatus = async(id) => {
    try{
      await window.myAPI?.updateAdon?.(id,{status:0})
      fetchAddons();
        }catch(error){
      console.error('Error toggling status:', error);
        }
  };

  const handleDeleteClick = (addon) => {
    setAddonToDelete(addon);
    setShowDeleteConfirm(true);
  };

  const deleteAddon = async(id) => {
   try{
await window.myAPI?.updateAdon?.(id,{isdeleted:1})
fetchAddons();
setShowDeleteConfirm(false);
setAddonToDelete(null);
   }catch(error){
    console.error('Error deleting addon:', error);
   }
  };

  return (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Addon List</h2>
        <button
          onClick={handleAddAddon}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Addon
        </button>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
        <thead>
          <tr className="bg-primaryExtraLight">
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              SI
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Price
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Stock Type
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Stock
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
          {addons.map((addon, index) => (
            <tr key={addon.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-800">{addon.name}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">   {addon.price != null ? addon.price.toFixed(2) : ''} €</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{addon.stock_type}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{addon.addon_stock}</span>
              </td>
              <td className="py-3 px-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addon.status}
                    onChange={() => toggleStatus(addon.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${addon.status ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${addon.status ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                  </div>
                </label>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditAddon(addon)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(addon)}
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
                  {editingAddon ? 'Edit Addon' : 'Add New Addon'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newAddon.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="Ex: water"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price*
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={newAddon.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="100"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Type*
                  </label>
                  <select
                    name="stock_type"
                    value={newAddon.stock_type ?? ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  >
                    <option value="" disabled>Select Stock Type</option>
                    <option value="Unlimited">Unlimited Stock</option>
                    <option value="Limited">Limited Stock</option>
                  </select>
                </div>

                {newAddon.stock_type === 'Limited' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity*
                    </label>
                    <input
                      type="number"
                      name="addon_stock"
                      value={newAddon.addon_stock ?? ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                      placeholder="Enter stock quantity"
                      min="0"
                      required
                    />
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {editingAddon ? 'Update' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && addonToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Addon</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAddonToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete this addon?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAddonToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAddon(addonToDelete.id)}
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

export default AddonManagement;