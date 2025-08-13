import React, { useEffect, useState } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    position: '',
    image: null
  });
  const [nameError, setNameError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  
  const categories = ['Traditional', 'Burgers', 'Pizza', 'Beverages'];
  
  // Random ingredients for dropdown
  const randomIngredients = [
    'Tomatoes', 'Onions', 'Garlic', 'Bell Peppers', 'Mushrooms',
    'Spinach', 'Salt', 'Black Pepper', 'Paprika',
    'Cumin', 'Coriander', 'Turmeric', 'Ginger', 'Lemon',
    'Lime', 'Parsley', 'Cilantro', 'Mint', 'Chives'
  ];

  const fetchIngredients = async()=>{
    try{
      const dummyIngredients = [
        { id: 1, name: 'Tomatoes', position: 1, status: 1 },
        { id: 2, name: 'Onions', position: 2, status: 1 },
        { id: 3, name: 'Garlic', position: 3, status: 0 },
        { id: 4, name: 'Bell Peppers', position: 4, status: 1 },
        { id: 5, name: 'Mushrooms', position: 5, status: 1 },
        { id: 6, name: 'Spinach', position: 6, status: 0 },
        { id: 7, name: 'Basil', position: 7, status: 1 },
        { id: 8, name: 'Oregano', position: 8, status: 1 }
      ];
      setIngredients(dummyIngredients);
    }catch(error){
      console.error('Error fetching ingredients:', error);
      setIngredients([]);
    }
  }
  
  useEffect(()=>{
    fetchIngredients();
  }, [])

  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient);
    setNewIngredient({
      name: ingredient.name,
      position: ingredient.position,
      image: ingredient.image || null
    });
    setNameError('');
    setShowForm(true);
  };

  const handleAddIngredient = () => {
    setEditingIngredient(null);
    setNewIngredient({
      name: '',
      position: '',
      image: null
    });
    setSelectedIngredients([]);
    setTagInput('');
    setNameError('');
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'name') {
      const trimmedValue = value.trim().toLowerCase();
      const existingIngredient = ingredients.find(ing => 
        ing.name.toLowerCase() === trimmedValue && 
        (!editingIngredient || ing.id !== editingIngredient.id)
      );
      
      if (existingIngredient) {
        setNameError('⚠ Ingredient with this name already exists');
      } else {
        setNameError('');
      }
    }
  };

  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue && !selectedIngredients.includes(selectedValue)) {
      setSelectedIngredients([...selectedIngredients, selectedValue]);
    }
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!selectedIngredients.includes(tagInput.trim())) {
        setSelectedIngredients([...selectedIngredients, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedIngredients(selectedIngredients.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e) => {
    setNewIngredient(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = newIngredient.name.trim().toLowerCase();
    const existingIngredient = ingredients.find(ing => 
      ing.name.toLowerCase() === trimmedName && 
      (!editingIngredient || ing.id !== editingIngredient.id)
    );
    
    if (existingIngredient) {
      setNameError('⚠ Ingredient with this name already exists');
      return;
    }
    
    try {
      let imageBase64 = null;
      if (newIngredient.image) {
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(newIngredient.image);
        });
      }
      
      // TODO: Implement API calls for creating/updating ingredients
      // if (editingIngredient) {
      //   await window.myAPI?.updateIngredient(editingIngredient.id, {
      //     name: newIngredient.name,
      //     position: parseInt(newIngredient.position),
      //     image: imageBase64,
      //   });
      // } else {
      //   await window.myAPI?.createIngredient({
      //     name: newIngredient.name,
      //     position: parseInt(newIngredient.position),
      //     image: imageBase64,
      //     status: 1,
      //   });
      // }
      
      fetchIngredients();
      setShowForm(false);
      setNameError('');
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const ingredient = ingredients.find(ing => ing.id === id);
      if (!ingredient) return;
      const newStatus = ingredient.status ? 0 : 1;
      // TODO: Implement API call to update ingredient status
      // await window.myAPI?.updateIngredient(id, { status: newStatus });
      fetchIngredients();
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
      fetchIngredients();
      setShowForm(false);
      setShowDeleteConfirm(false);
      setIngredientToDelete(null);
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  // Filter ingredients based on search term and category
  const filteredIngredients = ingredients.filter(item => {
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
               <option>Out Of Stock Foods</option>
               {categories.map(cat => (
                 <option key={cat}>{cat}</option>
               ))}
             </select>
           </div>
           
           <div className="relative">
             <input
               type="text"
               placeholder="Search ingredients..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-64 px-4 py-1.5 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
             />
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
               Status
             </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
                 <tbody>
           {filteredIngredients.map((ingredient, index) => (
            <tr key={ingredient.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                             <td className="py-3 px-4">
                 <span className="text-sm font-medium text-gray-700">{index + 1}</span>
               </td>
                              <td className="py-3 px-4">
                 <span className="text-sm font-medium text-gray-800">{ingredient.name}</span>
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

             {filteredIngredients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600 font-medium text-sm">No ingredients found</p>
          <p className="text-gray-500 text-xs">Ingredients will appear here once added.</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-[#0000008e] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

                             <form onSubmit={handleSubmit}>
                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Select Ingredients*
                   </label>
                   <select
                     onChange={handleDropdownChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                     defaultValue=""
                   >
                     <option value="" disabled>Choose from ingredients...</option>
                     {randomIngredients.map((ingredient, index) => (
                       <option key={index} value={ingredient}>{ingredient}</option>
                     ))}
                   </select>
                 </div>

                 <div className="mb-4">
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Add Custom Ingredient
                   </label>
                   <input
                     type="text"
                     value={tagInput}
                     onChange={handleTagInputChange}
                     onKeyPress={handleTagInputKeyPress}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryLight"
                     placeholder="Type ingredient name and press Enter"
                   />
                 </div>

                 {selectedIngredients.length > 0 && (
                   <div className="mb-4">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Selected Ingredients
                     </label>
                     <div className="flex flex-wrap gap-2">
                       {selectedIngredients.map((ingredient, index) => (
                                                   <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white text-gray-800 border border-2 border-primaryLight"
                          >
                           {ingredient}
                                                       <button
                              type="button"
                              onClick={() => removeTag(ingredient)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                         </span>
                       ))}
                     </div>
                   </div>
                 )}

                

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
                    {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
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
                Do you want to delete this ingredient?
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
