import React, { useEffect, useState, useRef } from 'react';
import { Edit, Plus, X, Trash2, Search } from 'lucide-react';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState(-1);
  const [filteredIngredientsByCategory, setFilteredIngredientsByCategory] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateIngredientName, setUpdateIngredientName] = useState('');
  const [updateIngredientStatus, setUpdateIngredientStatus] = useState(1);
  const [updateIngredientCategory, setUpdateIngredientCategory] = useState('');
  const [ingredientCategories, setIngredientCategories] = useState({});
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch all ingredients
  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const result = await window.myAPI?.getAllIngredientsWithCategories();
      if (result.success) {
        setIngredients(result.data);
        // Build categories map from the result
        const categoriesMap = {};
        result.data.forEach(ingredient => {
          if (ingredient.category_id && ingredient.category_name) {
            categoriesMap[ingredient.id] = {
              category_id: ingredient.category_id,
              name: ingredient.category_name
            };
          }
        });
        setIngredientCategories(categoriesMap);
      } else {
        console.error('Error fetching ingredients:', result.message);
        setIngredients([]);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active categories
  const fetchCategories = async () => {
    try {
      const result = await window.myAPI?.getActiveCategories(null);
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Error fetching categories:', result.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Fetch ingredients by category
  const fetchIngredientsByCategory = async (categoryId) => {
    try {
      const result = await window.myAPI?.getIngredientsByCategoryPaginated(categoryId);
      if (result.success) {
        setFilteredIngredientsByCategory(result.data);
      } else {
        setFilteredIngredientsByCategory([]);
      }
    } catch (error) {
      console.error('Error fetching ingredients by category:', error);
      setFilteredIngredientsByCategory([]);
    }
  };

  // Search ingredients by name
  const searchIngredients = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredIngredients([]);
      setShowDropdown(false);
      return;
    }

    try {
      const result = await window.myAPI?.searchIngredientsByName(searchTerm);
      if (result.success) {
        setFilteredIngredients(result.data);
        setShowDropdown(result.data.length > 0);
        setSelectedDropdownIndex(-1);
      } else {
        setFilteredIngredients([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching ingredients:', error);
      setFilteredIngredients([]);
      setShowDropdown(false);
    }
  };

  // Check if ingredient already exists in category
  const checkIngredientExists = async (categoryId, ingredientId) => {
    try {
      const result = await window.myAPI?.checkCategoryIngredientExists(categoryId, ingredientId);
      return result.success && result.exists;
    } catch (error) {
      console.error('Error checking ingredient existence:', error);
      return false;
    }
  };

  // Add ingredient to category
  const addIngredientToCategory = async (categoryId, ingredientId) => {
    try {
      const result = await window.myAPI?.createCategoryIngredient(categoryId, ingredientId);
      return result.success;
    } catch (error) {
      console.error('Error adding ingredient to category:', error);
      return false;
    }
  };

  // Create new ingredient and add to category
  const createNewIngredient = async (name) => {
    try {
      const result = await window.myAPI?.createIngredient({ name, status: 1 });
      if (result.success) {
        return result.id;
      }
      return null;
    } catch (error) {
      console.error('Error creating ingredient:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchIngredients();
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchIngredients(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle category filter change
  useEffect(() => {
    if (categoryFilter && categoryFilter !== 'All categories') {
      const selectedCat = categories.find(cat => cat.name === categoryFilter);
      if (selectedCat) {
        fetchIngredientsByCategory(selectedCat.id);
      }
    } else {
      setFilteredIngredientsByCategory([]);
    }
  }, [categoryFilter, categories]);

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setSelectedCategory('');
    setSearchTerm('');
    setFilteredIngredients([]);
    setSelectedIngredients([]);
    setShowDropdown(false);
    setSelectedDropdownIndex(-1);
    setShowForm(true);
  };

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setUpdateIngredientName(ingredient.name);
    setUpdateIngredientStatus(ingredient.status);
    // Set the current category if available
    const currentCategory = ingredientCategories[ingredient.id];
    setUpdateIngredientCategory(currentCategory ? currentCategory.category_id : '');
    setShowUpdateForm(true);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedDropdownIndex >= 0 && filteredIngredients[selectedDropdownIndex]) {
        // Select the highlighted ingredient
        handleIngredientSelect(filteredIngredients[selectedDropdownIndex]);
      } else if (searchTerm.trim()) {
        // Create new ingredient if no dropdown item is selected
        handleCreateNewIngredient();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDropdownIndex(prev => 
        prev < filteredIngredients.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDropdownIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedDropdownIndex(-1);
    }
  };

  const handleIngredientSelect = (ingredient) => {
    if (!selectedIngredients.find(item => item.id === ingredient.id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setSearchTerm('');
    setFilteredIngredients([]);
    setShowDropdown(false);
    setSelectedDropdownIndex(-1);
  };

  const handleCreateNewIngredient = async () => {
    if (!searchTerm.trim() || !selectedCategory) return;

    try {
      setLoading(true);
      
      // Create new ingredient
      const ingredientId = await createNewIngredient(searchTerm.trim());
      if (!ingredientId) {
        alert('Failed to create ingredient');
        return;
      }

      // Add to category
      const added = await addIngredientToCategory(selectedCategory, ingredientId);
      if (added) {
        // Refresh ingredients list
        await fetchIngredients();
        // Clear search term but keep modal open
        setSearchTerm('');
        setShowDropdown(false);
        setSelectedDropdownIndex(-1);
        // Show success message
        alert(`Ingredient "${searchTerm.trim()}" added successfully!`);
      } else {
        alert('Failed to add ingredient to category');
      }
    } catch (error) {
      console.error('Error creating ingredient:', error);
      alert('Error creating ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIngredient = async (e) => {
    e.preventDefault();
    if (!updateIngredientName.trim() || !editingIngredient) return;

    try {
      setLoading(true);
      
      // Update ingredient basic info
      const result = await window.myAPI?.updateIngredient(editingIngredient.id, {
        name: updateIngredientName.trim(),
        status: updateIngredientStatus
      });
      
      if (result.success) {
        // If category changed, update the category-ingredient relationship
        if (updateIngredientCategory) {
          const currentCategory = ingredientCategories[editingIngredient.id];
          const currentCategoryId = currentCategory ? currentCategory.category_id : null;
          
          if (currentCategoryId !== updateIngredientCategory) {
            // Remove from old category if exists
            if (currentCategoryId) {
              await window.myAPI?.removeCategoryIngredient(currentCategoryId, editingIngredient.id);
            }
            
            // Add to new category
            await addIngredientToCategory(updateIngredientCategory, editingIngredient.id);
          }
        }
        
        // Refresh ingredients list
        await fetchIngredients();
        setShowUpdateForm(false);
        setEditingIngredient(null);
        setUpdateIngredientName('');
        setUpdateIngredientStatus(1);
        setUpdateIngredientCategory('');
        alert('Ingredient updated successfully!');
      } else {
        alert('Failed to update ingredient');
      }
    } catch (error) {
      console.error('Error updating ingredient:', error);
      alert('Error updating ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleExistingIngredientSubmit = async (e) => {
    e.preventDefault();
    if (selectedIngredients.length === 0 || !selectedCategory) return;

    try {
      setLoading(true);
      let successCount = 0;
      let alreadyExistsIngredients = [];

      for (const ingredient of selectedIngredients) {
        // Check if already exists
        const exists = await checkIngredientExists(selectedCategory, ingredient.id);
        if (!exists) {
          const added = await addIngredientToCategory(selectedCategory, ingredient.id);
          if (added) successCount++;
        } else {
          alreadyExistsIngredients.push(ingredient.name);
        }
      }

      if (successCount > 0) {
        await fetchIngredients();
        // Clear selected ingredients but keep modal open
        setSelectedIngredients([]);
        // Show success message
        alert(`${successCount} ingredient(s) added successfully!`);
      }

      if (alreadyExistsIngredients.length > 0) {
        const ingredientNames = alreadyExistsIngredients.join(', ');
        alert(`${alreadyExistsIngredients.length} ingredient(s) were already in this category: ${ingredientNames}`);
      }
    } catch (error) {
      console.error('Error adding ingredients to category:', error);
      alert('Error adding ingredients to category');
    } finally {
      setLoading(false);
    }
  };

  const removeSelectedIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(item => item.id !== ingredientId));
  };

  const toggleStatus = async (id) => {
    try {
      const ingredient = ingredients.find(ing => ing.id === id);
      if (!ingredient) return;
      
      const newStatus = ingredient.status ? 0 : 1;
      const result = await window.myAPI?.updateIngredient(id, { status: newStatus });
      
      if (result.success) {
        await fetchIngredients();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDeleteClick = (ingredient) => {
    setIngredientToDelete(ingredient);
    setShowDeleteConfirm(true);
  };

  const deleteIngredient = async (id) => {
    try {
      const result = await window.myAPI?.updateIngredient(id, { isdeleted: 1 });
      if (result.success) {
        await fetchIngredients();
        setShowDeleteConfirm(false);
        setIngredientToDelete(null);
        alert('Ingredient deleted successfully!');
      } else {
        alert('Failed to delete ingredient');
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      alert('Error deleting ingredient');
    }
  };

  // Filter ingredients based on category filter
  const displayIngredients = categoryFilter && categoryFilter !== 'All categories' 
    ? filteredIngredientsByCategory 
    : ingredients;

  return (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Ingredients List</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-48 px-4 py-1.5 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
            >
              <option>All categories</option>
              {categories.map(cat => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddIngredient}
            className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Ingredient
          </button>
        </div>
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
              Category
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
          {displayIngredients.map((ingredient, index) => (
            <tr key={ingredient.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-700">{index + 1}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-800">{ingredient.name}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm font-medium text-gray-600">
                  {ingredientCategories[ingredient.id] ? ingredientCategories[ingredient.id].name : 'No Category'}
                </span>
              </td>
              <td className="py-3 px-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!ingredient.status}
                    onChange={() => toggleStatus(ingredient.id)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${ingredient.status ? 'bg-primary' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${ingredient.status ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                  </div>
                </label>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditIngredient(ingredient)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(ingredient)}
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

      {displayIngredients.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 font-medium text-sm">No ingredients found</p>
          <p className="text-gray-500 text-xs">Ingredients will appear here once added.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingIngredient ? 'Edit Ingredient' : 'Add Ingredients to Category'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Category*
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Single Row Input for Ingredient */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search or Create Ingredient*
                  </label>
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onKeyDown={handleSearchKeyDown}
                      placeholder="Type ingredient name and press Enter to add (can add multiple)..."
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                      required
                    />
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  
                  {/* Dropdown Results */}
                  {showDropdown && filteredIngredients.length > 0 && (
                    <div 
                      ref={dropdownRef}
                      className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg"
                    >
                      {filteredIngredients.map((ingredient, index) => (
                        <div
                          key={ingredient.id}
                          onClick={() => handleIngredientSelect(ingredient)}
                          className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            index === selectedDropdownIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-sm text-gray-800">{ingredient.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Instructions */}
                  <div className="mt-2 text-xs text-gray-500">
                    <p>• Use ↑↓ arrow keys to navigate dropdown</p>
                    <p>• Press Enter to select highlighted item or create new ingredient</p>
                    <p>• Press Enter multiple times to add multiple ingredients</p>
                    <p>• Press Escape to close dropdown</p>
                    <p>• Click Close when done adding ingredients</p>
                  </div>
                </div>

                {/* Selected Ingredients */}
                {selectedIngredients.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Ingredients ({selectedIngredients.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedIngredients.map((ingredient) => (
                        <span
                          key={ingredient.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white text-gray-800 border border-2 border-primaryLight"
                        >
                          {ingredient.name}
                          <button
                            type="button"
                            onClick={() => removeSelectedIngredient(ingredient.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedIngredients.length > 0 && (
                    <button
                      onClick={handleExistingIngredientSubmit}
                      disabled={loading || !selectedCategory}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : `Add ${selectedIngredients.length} Ingredient(s)`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Ingredient Modal */}
      {showUpdateForm && editingIngredient && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Update Ingredient
                </h2>
                <button 
                  onClick={() => {
                    setShowUpdateForm(false);
                    setEditingIngredient(null);
                    setUpdateIngredientName('');
                    setUpdateIngredientStatus(1);
                  }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateIngredient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ingredient Name*
                  </label>
                  <input
                    type="text"
                    value={updateIngredientName}
                    onChange={(e) => setUpdateIngredientName(e.target.value)}
                    placeholder="Enter ingredient name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category*
                  </label>
                  <select
                    value={updateIngredientCategory}
                    onChange={(e) => setUpdateIngredientCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!updateIngredientStatus}
                      onChange={(e) => setUpdateIngredientStatus(e.target.checked ? 1 : 0)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${updateIngredientStatus ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${updateIngredientStatus ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700">
                      {updateIngredientStatus ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUpdateForm(false);
                      setEditingIngredient(null);
                      setUpdateIngredientName('');
                      setUpdateIngredientStatus(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !updateIngredientName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Ingredient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && ingredientToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Ingredient</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIngredientToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete the ingredient "{ingredientToDelete.name}"?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIngredientToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteIngredient(ingredientToDelete.id)}
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

export default Ingredients;
