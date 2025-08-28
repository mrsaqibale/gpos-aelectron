import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';
import useVirtualKeyboard from '../../../hooks/useVirtualKeyboard';

const SubCategoryManagement = () => {
  const [subCategories, setSubCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [newSubCategory, setNewSubCategory] = useState({
    category_id: '',
    name: '',
    position: ''
  });

const [mainCategories, setMainCategories] = useState([]);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [subCategoryToDelete, setSubCategoryToDelete] = useState(null);

  // Virtual Keyboard integration for modal inputs
  const {
    showKeyboard,
    activeInput,
    handleAnyInputFocus,
    handleAnyInputClick,
    handleInputBlur,
    hideKeyboard
  } = useVirtualKeyboard(['subcat_name', 'subcat_position']);

  const getKeyboardValue = (name) => {
    if (name === 'subcat_name') return newSubCategory.name || '';
    if (name === 'subcat_position') return (newSubCategory.position ?? '').toString();
    return '';
  };

const fetchMainCategories = async()=>{
  try{
    const result = await window.myAPI?.getCategoriesByHotel(1);
    if (result && result.success) {
      setMainCategories(result.data);
    } else {
      console.error('Failed to fetch main categories:', result?.message);
      setMainCategories([]);
    }
  }catch(error){
    console.error('Error fetching main categories:', error);
    setMainCategories([]);
  }
}

const fetchSubCategories = async()=>{
  try{
    const result = await window.myAPI?.getSubcategoriesByHotel(1);
    if (result && result.success) {
      setSubCategories(result.data);
    } else {
      console.error('Failed to fetch sub categories:', result?.message);
      setSubCategories([]);
    }
  }catch(error){
    console.error('Error fetching sub categories:', error);
    setSubCategories([]);
  }
}

useEffect(()=>{
  fetchMainCategories();
  fetchSubCategories();
  },[])

  const handleAddSubCategory = () => {
    setEditingSubCategory(null);
    setNewSubCategory({
      category_id: '',
      name: '',
      position: ''
    });
    setShowForm(true);
  };

  const handleEditSubCategory = (subCategory) => {
    setEditingSubCategory(subCategory);
    setNewSubCategory({
      category_id: subCategory.category_id,
      name: subCategory.name,
      position: subCategory.position
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSubCategory) {
      // Update existing subcategory
      try {
        await window.myAPI?.updateSubcategory(editingSubCategory.id, {
          category_id: newSubCategory.category_id,
          name: newSubCategory.name,
          position: parseInt(newSubCategory.position)
        });
        fetchSubCategories();
      } catch (error) {
        console.log(error, "error updating sub category");
      }
    } else {
      // Add new subcategory
      try {
        await window.myAPI?.createSubcategory({
          category_id: newSubCategory.category_id,
          name: newSubCategory.name,
          position: parseInt(newSubCategory.position),
          status: 1 // Set status to 1 by default for new sub categories
        });
        fetchSubCategories();
      } catch (error) {
        console.log(error, "error creating sub category");
      }
    }
    setShowForm(false);
  };

  const handleDeleteClick = (subCategory) => {
    setSubCategoryToDelete(subCategory);
    setShowDeleteConfirm(true);
  };

  const deleteSubCategory = async (id) => {
    try {
      await window.myAPI?.updateSubcategory(id, { isDelete: 1 });
      fetchSubCategories();
      setShowForm(false);
      setShowDeleteConfirm(false);
      setSubCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting sub category:', error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const subCategory = subCategories.find(sc => sc.id === id);
      if (!subCategory) return;
      const newStatus = subCategory.status ? 0 : 1;
      await window.myAPI?.updateSubcategory(id, { status: newStatus });
      fetchSubCategories();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <>
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Sub Category List</h2>
        <button
          onClick={handleAddSubCategory}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Sub Category
        </button>
      </div>

      {subCategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 font-medium text-sm">No sub categories found</p>
          <p className="text-gray-500 text-xs">Create your first sub category to get started</p>
        </div>
      ) : (
        <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
          <thead>
            <tr className="bg-primaryExtraLight">
              <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                SI
              </th>
              <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Main Category
              </th>
              <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Position
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
            {subCategories.map((subCategory, index) => (
              <tr key={subCategory.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">{subCategory.category_name}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-800">{subCategory.name}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-gray-600">{subCategory.position}</span>
                </td>
                <td className="py-3 px-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!subCategory.status}
                      onChange={() => toggleStatus(subCategory.id)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${subCategory.status ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${subCategory.status ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                    </div>
                  </label>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditSubCategory(subCategory)}
                      className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(subCategory)}
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
      )}

      {showForm && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingSubCategory ? 'Edit Sub Category' : 'Add New Sub Category'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Category*
                  </label>
                  <select
                    name="category_id"
                    value={newSubCategory.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  >
                    <option value="">Select Category</option>
                    {mainCategories
                      .filter(cat => cat.status === 1) // Only show active categories
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sub Category Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newSubCategory.name}
                    onChange={handleInputChange}
                    onFocus={(e) => { handleAnyInputFocus(e, 'subcat_name', newSubCategory.name || ''); if (window.keyboard && typeof window.keyboard.setInput === 'function') { window.keyboard.setInput(newSubCategory.name || ''); } }}
                    onClick={(e) => { handleAnyInputClick(e, 'subcat_name', newSubCategory.name || ''); if (window.keyboard && typeof window.keyboard.setInput === 'function') { window.keyboard.setInput(newSubCategory.name || ''); } }}
                    onBlur={handleInputBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="e.g., Chicken Burgers"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    name="position"
                    value={newSubCategory.position}
                    onChange={handleInputChange}
                    onFocus={(e) => { handleAnyInputFocus(e, 'subcat_position', (newSubCategory.position ?? '').toString()); if (window.keyboard && typeof window.keyboard.setInput === 'function') { window.keyboard.setInput((newSubCategory.position ?? '').toString()); } }}
                    onClick={(e) => { handleAnyInputClick(e, 'subcat_position', (newSubCategory.position ?? '').toString()); if (window.keyboard && typeof window.keyboard.setInput === 'function') { window.keyboard.setInput((newSubCategory.position ?? '').toString()); } }}
                    onBlur={handleInputBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="e.g., 1"
                    min="1"
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
                    {editingSubCategory ? 'Update Sub Category' : 'Add Sub Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && subCategoryToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Sub Category</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSubCategoryToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete this sub category?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSubCategoryToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSubCategory(subCategoryToDelete.id)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <VirtualKeyboard
      isVisible={showKeyboard}
      onClose={() => hideKeyboard()}
      activeInput={activeInput}
      onInputChange={(input, inputName) => {
        if (inputName === 'subcat_name') {
          setNewSubCategory(prev => ({ ...prev, name: input }));
        } else if (inputName === 'subcat_position') {
          setNewSubCategory(prev => ({ ...prev, position: input }));
        }
      }}
      onInputBlur={handleInputBlur}
      inputValue={getKeyboardValue(activeInput)}
    />
    </>
  );
};

export default SubCategoryManagement;