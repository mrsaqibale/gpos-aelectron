import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([ ]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    position: '',
    image: null,
    originalFilename: null
  });
  const [nameError, setNameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async()=>{
    try{
      const hotelId= 1;
      const result = await window.myAPI?.getCategoriesByHotel(hotelId);
      if (result && result.success) {
        setCategories(result.data);
      } else {
        console.error('Failed to fetch categories:', result?.message);
        setCategories([]);
      }
    }catch(error){
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }
  useEffect(()=>{
    fetchCategories();
  })

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      position: category.position,
      image: category.image || null,
      originalFilename: null
    });
    setNameError(''); // Clear any previous error messages
    setShowForm(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setNewCategory({
      name: '',
      position: '',
      image: null,
      originalFilename: null
    });
    setNameError(''); // Clear any previous error messages
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Check for duplicate category name when name field changes
    if (name === 'name') {
      const trimmedValue = value.trim().toLowerCase();
      const existingCategory = categories.find(cat => 
        cat.name.toLowerCase() === trimmedValue && 
        (!editingCategory || cat.id !== editingCategory.id)
      );
      
      if (existingCategory) {
        setNameError('⚠ Category with this name already exists');
      } else {
        setNameError('');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategory(prev => ({
        ...prev,
        image: file,
        originalFilename: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for duplicate category name before submitting
    const trimmedName = newCategory.name.trim().toLowerCase();
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === trimmedName && 
      (!editingCategory || cat.id !== editingCategory.id)
    );
    
    if (existingCategory) {
      setNameError('⚠ Category with this name already exists');
      return;
    }
    
    const hotelId = 1;
    try {
      let imageBase64 = null;
      if (newCategory.image && newCategory.image instanceof File) {
        // Read the image as base64
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(newCategory.image);
        });
      }
      
      if (editingCategory) {
        // Update existing category in backend
        const updateData = {
          name: newCategory.name,
          position: parseInt(newCategory.position),
        };
        
        // Only include image if a new file is selected
        if (newCategory.image instanceof File) {
          updateData.image = imageBase64;
        }
        
        const result = await window.myAPI?.updateCategory(
          editingCategory.id, 
          updateData, 
          newCategory.originalFilename
        );
        
        if (!result.success) {
          console.error('Failed to update category:', result.message);
          return;
        }
      } else {
        // Add new category in backend
        const result = await window.myAPI?.createCategory({
          name: newCategory.name,
          position: parseInt(newCategory.position),
          hotel_id: hotelId,
          image: imageBase64,
          originalFilename: newCategory.originalFilename,
          status: 1, // Set status to 1 by default for new categories
        });
        
        if (!result.success) {
          console.error('Failed to create category:', result.message);
          return;
        }
      }
      // Refetch categories from backend
      fetchCategories();
      setShowForm(false);
      setNameError(''); // Clear any error messages
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const category = categories.find(cat => cat.id === id);
      if (!category) return;
      const newStatus = category.status ? 0 : 1;
      await window.myAPI?.updateCategory(id, { status: newStatus });
      fetchCategories();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const deleteCategory = async (id) => {
    try {
      await window.myAPI?.updateCategory(id, { isdelete: 1 });
      fetchCategories();
      setShowForm(false);
      setShowDeleteConfirm(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Category List</h2>
        <button
          onClick={handleAddCategory}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Category
        </button>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
        <thead>
          <tr className="bg-primaryExtraLight">
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              SI
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Image
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Position
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Priority
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
          {categories.map((category, index) => (
            <tr key={category.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
              </td>
              <td className="py-3 px-4">
                {category.image ? (
                  <CategoryImage imagePath={category.image} alt={category.name} />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                )}
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-800">{category.name}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">{category.position}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">-</span>
              </td>
              <td className="py-3 px-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!category.status}
                    onChange={() => toggleStatus(category.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${category.status ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${category.status ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                  </div>
                </label>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditCategory(category)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(category)}
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
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name*
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight ${
                      nameError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primaryLight'
                    }`}
                    placeholder="e.g., Burgers"
                    required
                  />
                  {nameError && (
                    <p className="mt-1 text-sm text-red-600">{nameError}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="number"
                    name="position"
                    value={newCategory.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    placeholder="e.g., 1"
                    min="1"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Image
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700">
                      Choose File
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept="image/*"
                      />
                    </label>
                    {newCategory.image ? (
                      <img
                        src={typeof newCategory.image === 'string'
                          ? `data:image/png;base64,${newCategory.image}`
                          : URL.createObjectURL(newCategory.image)}
                        alt="Selected"
                        className="w-16 h-16 object-cover rounded mt-2"
                      />
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Recommended: 200x200px, PNG, JPG up to 2MB</p>
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
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Category</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete this category?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(categoryToDelete.id)}
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

export default CategoryManagement;