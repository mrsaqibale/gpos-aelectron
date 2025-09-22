import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2 } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import CustomAlert from '../CustomAlert'

const FoodIngredientsModalbox = ({ isVisible, onClose, foodId, foodName }) => {
  const { themeColors } = useTheme()
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(false)
  const [newIngredient, setNewIngredient] = useState('')
  const [editingIngredient, setEditingIngredient] = useState(null)
  const [editIngredientName, setEditIngredientName] = useState('')
  const [showEditForm, setShowEditForm] = useState(false)
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })

  // Fetch ingredients for the food
  const fetchIngredients = async () => {
    if (!foodId) return
    
    try {
      setLoading(true)
      const result = await window.myAPI?.getFoodIngredients(foodId)
      if (result.success) {
        setIngredients(result.data || [])
      } else {
        console.error('Error fetching ingredients:', result.message)
        setIngredients([])
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error)
      setIngredients([])
    } finally {
      setLoading(false)
    }
  }

  // Add new ingredient to food
  const addIngredientToFood = async () => {
    if (!newIngredient.trim() || !foodId) return

    try {
      setLoading(true)
      
      // First create the ingredient if it doesn't exist
      const createResult = await window.myAPI?.createIngredient({ 
        name: newIngredient.trim(), 
        status: 1 
      })
      
      if (createResult.success) {
        const ingredientId = createResult.id
        
        // Then add it to the food
        const addResult = await window.myAPI?.createFoodIngredient(foodId, ingredientId)
        
        if (addResult.success) {
          // Refresh the ingredients list
          await fetchIngredients()
          setNewIngredient('')
          showAlert(`Ingredient "${newIngredient.trim()}" added successfully!`, 'success')
        } else {
          showAlert('Failed to add ingredient to food', 'error')
        }
      } else {
        showAlert('Failed to create ingredient', 'error')
      }
    } catch (error) {
      console.error('Error adding ingredient:', error)
      showAlert('An error occurred while adding the ingredient', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Remove ingredient from food
  const removeIngredientFromFood = async (ingredientId) => {
    try {
      setLoading(true)
      
      // Remove the food-ingredient relationship
      const result = await window.myAPI?.removeFoodIngredient(foodId, ingredientId)
      
      if (result.success) {
        await fetchIngredients()
        showAlert('Ingredient removed successfully!', 'success')
      } else {
        showAlert('Failed to remove ingredient', 'error')
      }
    } catch (error) {
      console.error('Error removing ingredient:', error)
      showAlert('An error occurred while removing the ingredient', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Update ingredient name
  const updateIngredient = async () => {
    if (!editIngredientName.trim() || !editingIngredient) return

    try {
      setLoading(true)
      
      const result = await window.myAPI?.updateIngredient(editingIngredient.id, {
        name: editIngredientName.trim()
      })
      
      if (result.success) {
        await fetchIngredients()
        setShowEditForm(false)
        setEditingIngredient(null)
        setEditIngredientName('')
        showAlert('Ingredient updated successfully!', 'success')
      } else {
        showAlert('Failed to update ingredient', 'error')
      }
    } catch (error) {
      console.error('Error updating ingredient:', error)
      showAlert('An error occurred while updating the ingredient', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Handle edit ingredient
  const handleEditIngredient = (ingredient) => {
    setEditingIngredient(ingredient)
    setEditIngredientName(ingredient.name)
    setShowEditForm(true)
  }

  // Show alert
  const showAlert = (message, type = 'success') => {
    setAlertConfig({
      isVisible: true,
      message,
      type
    })
  }

  // Handle key press for adding ingredient
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIngredientToFood()
    }
  }

  // Fetch ingredients when modal opens
  useEffect(() => {
    if (isVisible && foodId) {
      fetchIngredients()
    }
  }, [isVisible, foodId])

  if (!isVisible) return null

  return (
    <>
      <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div 
            className="text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0"
            style={{ backgroundColor: themeColors.primary }}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Ingredients</h2>
              <span className="text-sm opacity-90">for {foodName}</span>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Add New Ingredient */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Plus size={18} style={{ color: themeColors.primary }} />
                Add New Ingredient
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter ingredient name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': themeColors.primary 
                  }}
                />
                <button
                  onClick={addIngredientToFood}
                  disabled={loading || !newIngredient.trim()}
                  className="px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>

            {/* Ingredients List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Edit2 size={18} style={{ color: themeColors.primary }} />
                Current Ingredients ({ingredients.length})
              </h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">Loading ingredients...</div>
                </div>
              ) : ingredients.length > 0 ? (
                <div className="space-y-2">
                  {ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-800 font-medium">{ingredient.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditIngredient(ingredient)}
                          className="p-1 text-gray-600 hover:text-primary transition-colors"
                          style={{ color: themeColors.primary }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => removeIngredientFromFood(ingredient.id)}
                          className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">No ingredients added yet</div>
                  <div className="text-gray-400 text-xs mt-1">Add ingredients using the form above</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Ingredient Modal */}
      {showEditForm && editingIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div 
              className="text-white p-4 flex justify-between items-center rounded-t-xl"
              style={{ backgroundColor: themeColors.primary }}
            >
              <h3 className="text-lg font-bold">Edit Ingredient</h3>
              <button
                onClick={() => {
                  setShowEditForm(false)
                  setEditingIngredient(null)
                  setEditIngredientName('')
                }}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={editIngredientName}
                  onChange={(e) => setEditIngredientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': themeColors.primary 
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingIngredient(null)
                    setEditIngredientName('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={updateIngredient}
                  disabled={loading || !editIngredientName.trim()}
                  className="flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert */}
      <CustomAlert
        isVisible={alertConfig.isVisible}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isVisible: false })}
      />
    </>
  )
}

export default FoodIngredientsModalbox