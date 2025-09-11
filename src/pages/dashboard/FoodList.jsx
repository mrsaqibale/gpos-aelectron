import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, ChevronUp, ChevronDown, Utensils, List, Layers, X } from 'lucide-react';
import CategoryManagement from '../../components/dashboard/food/CategoryManagement';
import SubCategoryManagement from '../../components/dashboard/food/SubCategoryManagement';
import AddonManagement from '../../components/dashboard/food/AddonManagement';
import Ingredients from '../../components/dashboard/food/Ingredients';
import FoodForm from '../../components/dashboard/food/FoodForm';
import VirtualKeyboard from '../../components/VirtualKeyboard';
import useVirtualKeyboard from '../../hooks/useVirtualKeyboard';

// FoodImage component to handle image loading
const FoodImage = ({ imagePath, alt, className = "w-10 h-10 object-cover rounded" }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Check if imagePath exists and is a valid string
        if (imagePath && typeof imagePath === 'string' && imagePath.startsWith('uploads/')) {
          const result = await window.myAPI?.getFoodImage(imagePath);
          if (result && result.success) {
            setImageSrc(result.data);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Error loading food image:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // Only load image if imagePath is provided
    if (imagePath) {
      loadImage();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [imagePath]);

  if (loading) {
    return <div className={`${className} bg-gray-200 animate-pulse`}></div>;
  }

  if (error || !imageSrc) {
    return <div className={`${className} bg-gray-200`}></div>;
  }

  return <img src={imageSrc} alt={alt} className={className} />;
};

const FoodList = () => {
  const [activeTab, setActiveTab] = useState('foodList');
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);

  const categories = ['Traditional', 'Burgers', 'Pizza', 'Beverages'];

  // Virtual Keyboard for search input
  const {
    showKeyboard,
    activeInput,
    handleAnyInputFocus,
    handleAnyInputClick,
    handleInputBlur,
    hideKeyboard
  } = useVirtualKeyboard(['foodSearch']);

  const getKeyboardValue = (name) => {
    if (name === 'foodSearch') return searchTerm || '';
    return '';
  };

  // Function to fetch food data from database
  const fetchFoodData = async () => {
    try {
      setLoading(true);
      const result = await window.myAPI?.getAllFoods();
      
      if (result && result.success) {
        // Transform the data to match the table structure
        const transformedData = result.data.map(food => ({
          id: food.id,
          name: food.name,
          image: food.image && typeof food.image === 'string' && food.image.trim() !== '' ? food.image : null,
          category: food.category_name || 'Uncategorized',
          price: food.price || 0,
          type: food.veg === 1 ? 'Veg' : 'Non-Veg',
          recommended: false, // This field might need to be added to the database
          status: food.status === 'active' || food.status === 1 || food.status === true,
          stock: food.stock_type || (food.item_stock > 0 ? 'limited' : 'unlimited'),
          position: food.position || 0
        }));
        
        setFoodItems(transformedData);
      } else {
        console.error('Failed to fetch food data:', result?.message);
        setFoodItems([]);
      }
    } catch (error) {
      console.error('Error fetching food data:', error);
      setFoodItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchFoodData();
  }, []);

  const handleEditFood = async (food) => {
    try {
      // Fetch complete food data including relationships
      const result = await window.myAPI?.getFoodById(food.id);
      if (result && result.success) {
        setEditingFood(result.data);
        setShowFoodForm(true);
      } else {
        console.error('Failed to fetch food details:', result?.message);
        alert('Failed to load food details for editing');
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
      alert('Error loading food details for editing');
    }
  };

  const handleDeleteClick = (food) => {
    setFoodToDelete(food);
    setShowDeleteConfirm(true);
  };

  const handleDeleteFood = async (id) => {
    try {
      console.log('Attempting to delete food with ID:', id);
      console.log('window.myAPI available:', !!window.myAPI);
      console.log('deleteFood available:', !!window.myAPI?.deleteFood);
      
      // Call the backend API to delete the food
      const result = await window.myAPI?.deleteFood(id);
      console.log('Delete result:', result);
      
      if (result && result.success) {
        console.log('Food deleted successfully');
        // Refresh the food list from database
        fetchFoodData();
        setShowDeleteConfirm(false);
        setFoodToDelete(null);
      } else {
        console.error('Failed to delete food:', result?.message);
        alert('Error deleting food: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Error deleting food: ' + error.message);
    }
  };

  const toggleRecommended = async (id) => {
    try {
      // Find the current food item to get its current recommended status
      const currentFood = foodItems.find(food => food.id === id);
      if (!currentFood) return;
      
      // Toggle the recommended status
      const newRecommended = !currentFood.recommended;
      
      // Call the backend API to update the recommended status
      const result = await window.myAPI?.updateFood(id, { foodData: { recommended: newRecommended ? 1 : 0 } });
      if (result && result.success) {
        // Refresh the food list from database
        fetchFoodData();
      } else {
        console.error('Failed to update recommended status:', result?.message);
      }
    } catch (error) {
      console.error('Error toggling recommended status:', error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      // Find the current food item to get its current status
      const currentFood = foodItems.find(food => food.id === id);
      if (!currentFood) return;
      
      // Toggle the status (if current is true, set to false; if current is false, set to true)
      const newStatus = !currentFood.status;
      
      // Call the backend API to update the status
      const result = await window.myAPI?.updateFood(id, { foodData: { status: newStatus ? 1 : 0 } });
      if (result && result.success) {
        // Refresh the food list from database
        fetchFoodData();
      } else {
        console.error('Failed to update status:', result?.message);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedItems = () => {
    if (!sortConfig.key) {
      return foodItems;
    }

    return [...foodItems].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Updated filtering logic - now filters automatically
  const filteredItems = getSortedItems().filter(item => {
    if (searchTerm && 
        !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (categoryFilter && categoryFilter !== 'All categories' && 
        item.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return (
        <div className="flex flex-col ml-1">
          <ChevronUp size={12} className="text-gray-400" />
          <ChevronDown size={12} className="text-gray-400 -mt-1" />
        </div>
      );
    }
    if (sortConfig.direction === 'asc') {
      return <ChevronUp size={12} className="ml-1 text-primary" />;
    }
    return <ChevronDown size={12} className="ml-1 text-primary" />;
  };

  return (
    <div className="px-4 py-2">
      {/* Tabs */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('foodList')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'foodList' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Utensils size={16} />
            Food List
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'categories' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List size={16} />
            Categories
          </button>
          <button
            onClick={() => setActiveTab('subCategories')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'subCategories' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Layers size={16} />
            Sub Categories
          </button>
           <button
            onClick={() => setActiveTab('addons')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'addons' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Layers size={16} />
          Addons
          </button>
           <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'ingredients' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Layers size={16} />
          Ingredients
          </button>
        </div>
      </div>

      {activeTab === 'foodList' && (
        <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
          {showFoodForm && (
            <div className="mb-6">
              <FoodForm 
                food={editingFood} 
                onSubmit={(updatedFood) => {
                  if (updatedFood === null) {
                    setShowFoodForm(false);
                    setEditingFood(null);
                  } else if (editingFood) {
                    setFoodItems(foodItems.map(item => 
                      item.id === updatedFood.id ? updatedFood : item
                    ));
                    setShowFoodForm(false);
                    setEditingFood(null);
                    fetchFoodData();
                  } else {
                    setFoodItems([...foodItems, {
                      ...updatedFood,
                      id: Math.max(...foodItems.map(i => i.id)) + 1
                    }]);
                    setShowFoodForm(false);
                    setEditingFood(null);
                    fetchFoodData();
                  }
                }}
              />
            </div>
          )}
          {/* Search and Filters */}
          <div className="mb-6 flex justify-end items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-48 px-4 py-1.5 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                >
                  <option>All categories</option>
                  <option>Out Of Stock Foods</option>
                  {categories.map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search food items..."
                  name="foodSearch"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={(e) => { handleAnyInputFocus(e, 'foodSearch', searchTerm || ''); if (window.keyboard && typeof window.keyboard.setInput === 'function') { window.keyboard.setInput(searchTerm || ''); } }}
                  onClick={(e) => { handleAnyInputClick(e, 'foodSearch', searchTerm || ''); if (window.keyboard && typeof window.keyboard.setInput === 'function') { window.keyboard.setInput(searchTerm || ''); } }}
                  onBlur={handleInputBlur}
                  className="w-64 px-4 py-1.5 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                />
              </div>

              <Link to='/dashboard/food-management/add-food'>
                <button
                  onClick={() => {
                    setEditingFood(null);
                    setShowFoodForm(true);
                  }}
                  className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add New Food
                </button>
              </Link>
            </div>
          </div>

          {/* Food Items Table */}
          <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead>
              <tr className="bg-primaryExtraLight">
                <th 
                  className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    SI
                    {renderSortIcon('id')}
                  </div>
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Image
                </th>
                <th 
                  className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {renderSortIcon('category')}
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {renderSortIcon('price')}
                  </div>
                </th>
                <th 
                  className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('type')}
                >
                  <div className="flex items-center">
                    Type
                    {renderSortIcon('type')}
                  </div>
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Recommended
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('stock')}
                >
                  <div className="flex items-center">
                    Stock
                    {renderSortIcon('stock')}
                  </div>
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    {item.image && typeof item.image === 'string' && item.image.trim() !== '' ? (
                      <FoodImage imagePath={item.image} alt={item.name} />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">🍽️</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-800">${item.price.toFixed(2)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.type === 'Veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.type}
                    </span>
                  </td>
               
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.recommended}
                        onChange={() => toggleRecommended(item.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primaryLight"></div>
                    </label>
                  </td>

                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={item.status}
                        onChange={() => toggleStatus(item.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primaryLight"></div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {item.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditFood(item)}
                        className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(item)}
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

          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 font-medium text-sm">No food items found</p>
              <p className="text-gray-500 text-xs">Items matching your filter criteria will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && <CategoryManagement />}
      {activeTab === 'subCategories' && <SubCategoryManagement />}
       {activeTab === 'addons' && <AddonManagement/>}
      {activeTab === 'ingredients' && <Ingredients />}

      

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && foodToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Food Item</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFoodToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Do you want to delete this food item?
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setFoodToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFood(foodToDelete.id)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={() => hideKeyboard()}
        activeInput={activeInput}
        onInputChange={(input, inputName) => {
          if (inputName === 'foodSearch') {
            setSearchTerm(input);
          }
        }}
        onInputBlur={handleInputBlur}
        inputValue={getKeyboardValue(activeInput)}
      />
    </div>
  );
};

export default FoodList;