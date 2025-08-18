import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ChevronDown, Info, Package, DollarSign, Settings, Tag, Pen, PenIcon, PenTool, X } from 'lucide-react';

const FoodForm = ({ food, onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    category_id: '',
    subcategory_id: '',
    veg: 0, // 0 for Non-Veg, 1 for Veg
    isPizza: false, // New field for pizza toggle
    status: 'active',
    restaurant_id: 1,
    position: '',
    price: '',
    tax: '',
    tax_type: 'percentage',
    discount: '',
    discount_type: 'percentage',
    available_time_starts: '',
    available_time_ends: '',
    sku: '',
    barcode: '',
    stock_type: '',
    item_stock: '',
    sell_count: 0,
    // Keep form-specific fields that aren't in database
    // allergenIngredients: '',
    addons: [],
    allowNotes: true,
    productNote: '',
    trackInventory: false,
    lowInventory: 5,
    recommended: false,
    variations: []
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [allergins, setAllergins] = useState([]);
  const [selectedAllergins, setSelectedAllergins] = useState([]);
  const [allerginInput, setAllerginInput] = useState('');
  const [allerginSuggestions, setAllerginSuggestions] = useState([]);
  const [showAllerginSuggestions, setShowAllerginSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [adons, setAdons] = useState([]);
  const [selectedAdons, setSelectedAdons] = useState([]);
  const [adonInput, setAdonInput] = useState('');
  const [adonSuggestions, setAdonSuggestions] = useState([]);
  const [showAdonSuggestions, setShowAdonSuggestions] = useState(false);
  const [selectedAdonSuggestionIndex, setSelectedAdonSuggestionIndex] = useState(-1);

  // Ingredients state variables (similar to allergens)
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false);
  const [selectedIngredientSuggestionIndex, setSelectedIngredientSuggestionIndex] = useState(-1);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load categories and subcategories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        console.log('Loading categories...');
        const result = await window.myAPI?.getCategoriesByHotel(1); // Assuming hotel_id = 1
        console.log('Categories API result:', result);
        if (result && result.success) {
          // Filter categories to only show active ones (status = 1)
          const activeCategories = (result.data || []).filter(category => category.status === 1);
          setCategories(activeCategories);
          console.log('Active categories loaded:', activeCategories);
        } else {
          console.error('Failed to load categories:', result?.message);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Load allergens
  useEffect(() => {
    const loadAllergins = async () => {
      try {
        console.log('Loading allergens...');
        const result = await window.myAPI?.getAllAllergins();
        console.log('Allergins API result:', result);
        if (result && result.success) {
          setAllergins(result.data || []);
          console.log('Allergins loaded:', result.data);
        } else {
          console.error('Failed to load allergens:', result?.message);
        }
      } catch (error) {
        console.error('Error loading allergens:', error);
      }
    };

    loadAllergins();
  }, []);

  // Load adons
  useEffect(() => {
    const loadAdons = async () => {
      try {
        console.log('Loading adons...');
        const result = await window.myAPI?.getAdonsByHotel(1); // Assuming hotel_id = 1
        console.log('Adons API result:', result);
        if (result && result.success) {
          // Filter adons to only show active ones (status = 1)
          const activeAdons = (result.data || []).filter(adon => adon.status === 1);
          setAdons(activeAdons);
          console.log('Active adons loaded:', activeAdons);
        } else {
          console.error('Failed to load adons:', result?.message);
        }
      } catch (error) {
        console.error('Error loading adons:', error);
      }
    };

    loadAdons();
  }, []);

  // Load ingredients
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        console.log('Loading ingredients...');
        const result = await window.myAPI?.getAllIngredients();
        console.log('Ingredients API result:', result);
        if (result && result.success) {
          // Filter ingredients to only show active ones (status = 1)
          const activeIngredients = (result.data || []).filter(ingredient => ingredient.status === 1);
          setIngredients(activeIngredients);
          console.log('Active ingredients loaded:', activeIngredients);
        } else {
          console.error('Failed to load ingredients:', result?.message);
        }
      } catch (error) {
        console.error('Error loading ingredients:', error);
      }
    };

    loadIngredients();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!formData.category_id) {
        setSubcategories([]);
        return;
      }

      try {
        console.log('Loading subcategories for category:', formData.category_id);
        const result = await window.myAPI?.getSubcategoriesByCategory(formData.category_id);
        console.log('Subcategories API result:', result);
        if (result && result.success) {
          // Filter subcategories to only show active ones (status = 1)
          const activeSubcategories = (result.data || []).filter(subcategory => subcategory.status === 1);
          setSubcategories(activeSubcategories);
          console.log('Active subcategories loaded:', activeSubcategories);
        } else {
          console.error('Failed to load subcategories:', result?.message);
          setSubcategories([]);
        }
      } catch (error) {
        console.error('Error loading subcategories:', error);
        setSubcategories([]);
      }
    };

    loadSubcategories();
  }, [formData.category_id]);

  // Clear ingredients when category changes (for new food items)
  useEffect(() => {
    if (!food) { // Only for new food items, not when editing
      setSelectedIngredients([]);
      setIngredientInput('');
      setIngredientSuggestions([]);
      setShowIngredientSuggestions(false);
      setSelectedIngredientSuggestionIndex(-1);
    }
  }, [formData.category_id, food]);

  useEffect(() => {
    if (food) {
      setFormData({
        name: food.name || '',
        description: food.description || '',
        image: food.image || null,
        category_id: food.category_id || '',
        subcategory_id: food.subcategory_id || '',
        type: food.type || '',
        isPizza: food.isPizza === 1 || food.isPizza === true || false,
        allergenIngredients: food.allergenIngredients || '',
        addons: food.addons || [],
        availableFrom: food.availableFrom || '',
        availableTo: food.availableTo || '',
        unitPrice: food.unitPrice || 0,
        discountType: food.discountType || 'percent',
        discountValue: food.discountValue || 0,
        maxPurchaseQty: food.maxPurchaseQty || '',
        stockType: food.stockType || 'unlimited',
        position: food.position || '',
        variations: food.variations || [],
        allowNotes: food.allowNotes || false,
        productNote: food.productNote || '',
        sku: food.sku || '',
        barcode: food.barcode || '',
        trackInventory: food.trackInventory || false,
        quantity: food.quantity || 0,
        lowInventory: food.lowInventory || 5,
        recommended: food.recommended || false,
        status: food.status !== undefined ? food.status : true
      });

      // Load image preview
      if (food.image) {
        if (food.image.startsWith('uploads/')) {
          // Load image from uploads folder
          window.myAPI.getFoodImage(food.image).then(result => {
            if (result.success) {
              setImagePreview(result.data);
            } else {
              console.error('Failed to load food image:', result.message);
              setImagePreview(null);
            }
          }).catch(() => {
            setImagePreview(null);
          });
        } else if (food.image.startsWith('data:image')) {
          // Already a base64 data URL
          setImagePreview(food.image);
        } else {
          // Assume it's base64 without data URL prefix
          setImagePreview(`data:image/png;base64,${food.image}`);
        }
      } else {
        setImagePreview(null);
      }

      // Load existing allergens if editing
      if (food.allergins && food.allergins.length > 0) {
        setSelectedAllergins(food.allergins);
      }

      // Load existing adons if editing
      if (food.adons && food.adons.length > 0) {
        // If adons are already loaded in the food object
        setSelectedAdons(food.adons);
      } else if (food.id) {
        // If not loaded, fetch them separately
        const loadFoodAdons = async () => {
          try {
            const adonResult = await window.myAPI?.getFoodAdons(food.id);
            if (adonResult && adonResult.success) {
              setSelectedAdons(adonResult.data || []);
            }
          } catch (error) {
            console.error('Error loading food adons:', error);
          }
        };
        loadFoodAdons();
      }

      // Load existing ingredients if editing
      if (food.ingredients && food.ingredients.length > 0) {
        // If ingredients are already loaded in the food object
        setSelectedIngredients(food.ingredients);
      } else if (food.id) {
        // If not loaded, fetch them separately
        const loadFoodIngredients = async () => {
          try {
            const ingredientResult = await window.myAPI?.getFoodIngredients(food.id);
            if (ingredientResult && ingredientResult.success) {
              setSelectedIngredients(ingredientResult.data || []);
            }
          } catch (error) {
            console.error('Error loading food ingredients:', error);
          }
        };
        loadFoodIngredients();
      }
    }
  }, [food]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };



  const handleAddVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...(prev.variations || []),
        {
          name: '',
          type: 'single',
          min: 1,
          max: '',
          is_required: false,
          options: [{ option_name: '', option_price: 0, total_stock: '', stock_type: '', sell_count: 0 }]
        }
      ]
    }));
  };

  const handleAddOption = (variationIndex) => {
    const updatedVariations = [...(formData.variations || [])];
    if (!updatedVariations[variationIndex].options) {
      updatedVariations[variationIndex].options = [];
    }
    updatedVariations[variationIndex].options.push({
      option_name: '',
      option_price: 0,
      total_stock: '',
      stock_type: '',
      sell_count: 0
    });
    setFormData(prev => ({ ...prev, variations: updatedVariations }));
  };

  const handleVariationChange = (variationIndex, field, value) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[variationIndex] = {
      ...updatedVariations[variationIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, variations: updatedVariations }));
  };

  const handleOptionChange = (variationIndex, optionIndex, field, value) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[variationIndex].options[optionIndex] = {
      ...updatedVariations[variationIndex].options[optionIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, variations: updatedVariations }));
  };

  const handleRemoveVariation = (variationIndex) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations.splice(variationIndex, 1);
    setFormData(prev => ({ ...prev, variations: updatedVariations }));
  };

  const handleRemoveOption = (variationIndex, optionIndex) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[variationIndex].options.splice(optionIndex, 1);
    setFormData(prev => ({ ...prev, variations: updatedVariations }));
  };

  // Allergin handling functions
  const handleAllerginInputChange = (e) => {
    const value = e.target.value;
    setAllerginInput(value);
    setSelectedSuggestionIndex(-1); // Reset selection when typing

    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = allergins.filter(allergin =>
        allergin.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedAllergins.some(selected => selected.id === allergin.id)
      );
      setAllerginSuggestions(filtered);
      setShowAllerginSuggestions(true);
    } else {
      // Show all available allergens when input is empty
      const availableAllergins = allergins.filter(allergin =>
        !selectedAllergins.some(selected => selected.id === allergin.id)
      );
      setAllerginSuggestions(availableAllergins);
      setShowAllerginSuggestions(true);
    }
  };

  const handleAllerginFocus = () => {
    // Show all available allergens when field is focused
    const availableAllergins = allergins.filter(allergin =>
      !selectedAllergins.some(selected => selected.id === allergin.id)
    );
    setAllerginSuggestions(availableAllergins);
    setShowAllerginSuggestions(true);
  };

  const handleAllerginSelect = (allergin) => {
    if (!selectedAllergins.some(selected => selected.id === allergin.id)) {
      setSelectedAllergins(prev => [...prev, allergin]);
    }
    setAllerginInput('');
    setAllerginSuggestions([]);
    setShowAllerginSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleAllerginRemove = (allerginId) => {
    setSelectedAllergins(prev => prev.filter(allergin => allergin.id !== allerginId));
  };

  const handleAllerginKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (selectedSuggestionIndex >= 0 && allerginSuggestions[selectedSuggestionIndex]) {
        // Select the highlighted suggestion
        handleAllerginSelect(allerginSuggestions[selectedSuggestionIndex]);
      } else if (allerginInput.trim()) {
        // Create new allergen or select existing
        const existingAllergin = allergins.find(allergin =>
          allergin.name.toLowerCase() === allerginInput.trim().toLowerCase()
        );

        if (existingAllergin) {
          handleAllerginSelect(existingAllergin);
        } else {
          // Create new allergen
          try {
            const result = await window.myAPI?.createAllergin({ name: allerginInput.trim() });
            if (result && result.success) {
              const newAllergin = { id: result.id, name: allerginInput.trim() };
              setAllergins(prev => [...prev, newAllergin]);
              setSelectedAllergins(prev => [...prev, newAllergin]);
              setAllerginInput('');
              setAllerginSuggestions([]);
              setShowAllerginSuggestions(false);
              setSelectedSuggestionIndex(-1);
            } else {
              console.error('Failed to create allergen:', result?.message);
            }
          } catch (error) {
            console.error('Error creating allergen:', error);
          }
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < allerginSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowAllerginSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleAllerginKeyPress = async (e) => {
    if (e.key === 'Enter' && allerginInput.trim()) {
      e.preventDefault();

      // Check if allergen already exists
      const existingAllergin = allergins.find(allergin =>
        allergin.name.toLowerCase() === allerginInput.trim().toLowerCase()
      );

      if (existingAllergin) {
        handleAllerginSelect(existingAllergin);
      } else {
        // Create new allergen
        try {
          const result = await window.myAPI?.createAllergin({ name: allerginInput.trim() });
          if (result && result.success) {
            const newAllergin = { id: result.id, name: allerginInput.trim() };
            setAllergins(prev => [...prev, newAllergin]);
            setSelectedAllergins(prev => [...prev, newAllergin]);
            setAllerginInput('');
            setAllerginSuggestions([]);
            setShowAllerginSuggestions(false);
          } else {
            console.error('Failed to create allergen:', result?.message);
          }
        } catch (error) {
          console.error('Error creating allergen:', error);
        }
      }
    }
  };

  // Adon handling functions
  const handleAdonInputChange = (e) => {
    const value = e.target.value;
    setAdonInput(value);
    setSelectedAdonSuggestionIndex(-1); // Reset selection when typing

    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = adons.filter(adon =>
        adon.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedAdons.some(selected => selected.id === adon.id)
      );
      setAdonSuggestions(filtered);
      setShowAdonSuggestions(true);
    } else {
      // Show all available adons when input is empty
      const availableAdons = adons.filter(adon =>
        !selectedAdons.some(selected => selected.id === adon.id)
      );
      setAdonSuggestions(availableAdons);
      setShowAdonSuggestions(true);
    }
  };

  const handleAdonFocus = () => {
    // Show all available adons when field is focused
    const availableAdons = adons.filter(adon =>
      !selectedAdons.some(selected => selected.id === adon.id)
    );
    setAdonSuggestions(availableAdons);
    setShowAdonSuggestions(true);
  };

  const handleAdonSelect = (adon) => {
    if (!selectedAdons.some(selected => selected.id === adon.id)) {
      setSelectedAdons(prev => [...prev, adon]);
    }
    setAdonInput('');
    setAdonSuggestions([]);
    setShowAdonSuggestions(false);
    setSelectedAdonSuggestionIndex(-1);
  };

  const handleAdonRemove = (adonId) => {
    setSelectedAdons(prev => prev.filter(adon => adon.id !== adonId));
  };

  const handleAdonKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (selectedAdonSuggestionIndex >= 0 && adonSuggestions[selectedAdonSuggestionIndex]) {
        // Select the highlighted suggestion
        handleAdonSelect(adonSuggestions[selectedAdonSuggestionIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedAdonSuggestionIndex(prev =>
        prev < adonSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedAdonSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowAdonSuggestions(false);
      setSelectedAdonSuggestionIndex(-1);
    }
  };

  // Ingredient handling functions (similar to allergens)
  const handleIngredientInputChange = (e) => {
    if (!formData.category_id) return; // Don't process if category not selected

    const value = e.target.value;
    setIngredientInput(value);
    setSelectedIngredientSuggestionIndex(-1); // Reset selection when typing

    if (value.trim()) {
      // Filter suggestions based on input
      const filtered = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(value.toLowerCase()) &&
        !selectedIngredients.some(selected => selected.id === ingredient.id)
      );
      setIngredientSuggestions(filtered);
      setShowIngredientSuggestions(true);
    } else {
      // Show all available ingredients when input is empty
      const availableIngredients = ingredients.filter(ingredient =>
        !selectedIngredients.some(selected => selected.id === ingredient.id)
      );
      setIngredientSuggestions(availableIngredients);
      setShowIngredientSuggestions(true);
    }
  };

  const handleIngredientFocus = () => {
    if (!formData.category_id) return; // Don't process if category not selected

    // Show all available ingredients when field is focused
    const availableIngredients = ingredients.filter(ingredient =>
      !selectedIngredients.some(selected => selected.id === ingredient.id)
    );
    setIngredientSuggestions(availableIngredients);
    setShowIngredientSuggestions(true);
  };

  const handleIngredientSelect = (ingredient) => {
    console.log('Selecting ingredient:', ingredient);
    if (!selectedIngredients.some(selected => selected.id === ingredient.id)) {
      setSelectedIngredients(prev => {
        const newIngredients = [...prev, ingredient];
        console.log('Updated selectedIngredients:', newIngredients);
        return newIngredients;
      });
    } else {
      console.log('Ingredient already selected:', ingredient.name);
    }
    setIngredientInput('');
    setIngredientSuggestions([]);
    setShowIngredientSuggestions(false);
    setSelectedIngredientSuggestionIndex(-1);
  };

  const handleIngredientRemove = (ingredientId) => {
    setSelectedIngredients(prev => prev.filter(ingredient => ingredient.id !== ingredientId));
  };

  const handleIngredientKeyDown = async (e) => {
    if (!formData.category_id) return; // Don't process if category not selected

    if (e.key === 'Enter') {
      e.preventDefault();

      if (selectedIngredientSuggestionIndex >= 0 && ingredientSuggestions[selectedIngredientSuggestionIndex]) {
        // Select the highlighted suggestion
        handleIngredientSelect(ingredientSuggestions[selectedIngredientSuggestionIndex]);
      } else if (ingredientInput.trim()) {
        // Create new ingredient or select existing
        const existingIngredient = ingredients.find(ingredient =>
          ingredient.name.toLowerCase() === ingredientInput.trim().toLowerCase()
        );

        if (existingIngredient) {
          handleIngredientSelect(existingIngredient);
        } else {
          // Create new ingredient
          console.log('Creating new ingredient:', ingredientInput.trim());
          try {
            const result = await window.myAPI?.createIngredient({ name: ingredientInput.trim() });
            console.log('createIngredient result:', result);
            if (result && result.success) {
              const newIngredient = { id: result.id, name: ingredientInput.trim() };
              console.log('Created new ingredient:', newIngredient);
              setIngredients(prev => [...prev, newIngredient]);
              setSelectedIngredients(prev => {
                const newIngredients = [...prev, newIngredient];
                console.log('Added new ingredient to selectedIngredients:', newIngredients);
                return newIngredients;
              });
              setIngredientInput('');
              setIngredientSuggestions([]);
              setShowIngredientSuggestions(false);
              setSelectedIngredientSuggestionIndex(-1);
            } else {
              console.error('Failed to create ingredient:', result?.message);
            }
          } catch (error) {
            console.error('Error creating ingredient:', error);
          }
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIngredientSuggestionIndex(prev =>
        prev < ingredientSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIngredientSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowIngredientSuggestions(false);
      setSelectedIngredientSuggestionIndex(-1);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Handle image data
      let imageData = null;
      let originalFilename = null;

      if (formData.image && formData.image instanceof File) {
        // Convert file to base64
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(formData.image);
        });
        originalFilename = formData.image.name;
      } else if (typeof formData.image === 'string' && formData.image.startsWith('data:image')) {
        // Already a base64 data URL
        imageData = formData.image;
      } else if (typeof formData.image === 'string' && formData.image.startsWith('uploads/')) {
        // Already a file path, keep as is
        imageData = formData.image;
      }

      // Transform form data to match database schema
      const foodData = {
        name: formData.name,
        description: formData.description,
        image: imageData,
        originalFilename: originalFilename,
        category_id: parseInt(formData.category_id),
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
        price: parseFloat(formData.price),
        tax: formData.tax === '' ? 0 : parseFloat(formData.tax),
        tax_type: formData.tax_type,
        discount: formData.discount === '' ? 0 : parseFloat(formData.discount),
        discount_type: formData.discount_type,
        available_time_starts: formData.available_time_starts,
        available_time_ends: formData.available_time_ends,
        veg: formData.veg,
        isPizza: formData.isPizza ? 1 : 0,
        status: formData.status,
        restaurant_id: formData.restaurant_id,
        position: formData.position ? parseInt(formData.position) : null,
        sku: formData.sku,
        barcode: formData.barcode,
        stock_type: formData.stock_type || 'unlimited',
        item_stock: formData.stock_type === 'limited' && formData.item_stock !== ''
          ? parseInt(formData.item_stock)
          : null,
        sell_count: parseInt(formData.sell_count),
        maximum_cart_quantity: formData.maxPurchaseQty ? parseInt(formData.maxPurchaseQty) : null,
        track_inventory: formData.trackInventory ? 1 : 0,
        low_inventory_threshold: formData.lowInventory ? parseInt(formData.lowInventory) : null,
        product_note_enabled: formData.allowNotes ? 1 : 0,
        product_note: formData.productNote || null
      };

      const result = await window.myAPI?.createFood(foodData);

      if (result && result.success) {
        console.log('Food created successfully:', result);

        // Save food-allergin relationships if allergens are selected
        if (selectedAllergins.length > 0) {
          try {
            const allerginIds = selectedAllergins.map(allergin => allergin.id);
            const relationshipResult = await window.myAPI?.updateFoodAllergins(result.food_id, allerginIds);

            if (relationshipResult && relationshipResult.success) {
              console.log('Food-allergin relationships saved successfully');
            } else {
              console.error('Failed to save food-allergin relationships:', relationshipResult?.message);
            }
          } catch (error) {
            console.error('Error saving food-allergin relationships:', error);
          }
        }

        // Save food-addon relationships if adons are selected
        if (selectedAdons.length > 0) {
          try {
            const adonIds = selectedAdons.map(adon => adon.id);
            const adonResult = await window.myAPI?.updateFoodAdons(result.food_id, adonIds);

            if (adonResult && adonResult.success) {
              console.log('Food-addon relationships saved successfully');
            } else {
              console.error('Failed to save food-addon relationships:', adonResult?.message);
            }
          } catch (error) {
            console.error('Error saving food-addon relationships:', error);
          }
        }

        // Save food-ingredient relationships if ingredients are selected
        if (selectedIngredients.length > 0 && formData.category_id) {
          try {
            console.log('Processing ingredients for food:', result.food_id);
            console.log('Selected ingredients:', selectedIngredients);
            console.log('Category ID:', formData.category_id);

            // Use the complex processing function that handles all the logic
            const ingredientNames = selectedIngredients.map(ingredient => ingredient.name);
            console.log('Ingredient names to process:', ingredientNames);

            const ingredientResult = await window.myAPI?.processFoodIngredients(
              result.food_id,
              parseInt(formData.category_id),
              ingredientNames
            );

            console.log('processFoodIngredients result:', ingredientResult);

            if (ingredientResult && ingredientResult.success) {
              console.log('Food-ingredient relationships processed successfully:', ingredientResult.data);
            } else {
              console.error('Failed to process food-ingredient relationships:', ingredientResult?.message);
            }
          } catch (error) {
            console.error('Error processing food-ingredient relationships:', error);
          }
        } else {
          console.log('No ingredients to save or no category selected');
          console.log('selectedIngredients.length:', selectedIngredients.length);
          console.log('formData.category_id:', formData.category_id);
        }

        // Save variations and variation options if they exist
        if (formData.variations && formData.variations.length > 0) {
          try {
            for (const variation of formData.variations) {
              if (variation.name && variation.options && variation.options.length > 0) {
                // Create variation
                const variationData = {
                  food_id: result.food_id,
                  name: variation.name,
                  type: variation.type || 'single',
                  min: parseInt(variation.min) || 1,
                  max: variation.max ? parseInt(variation.max) : null,
                  is_required: variation.is_required || false
                };

                const variationResult = await window.myAPI?.createVariation(variationData);

                if (variationResult) {
                  const variationId = variationResult;
                  console.log('Variation created successfully:', variationId);

                  // Create variation options
                  for (const option of variation.options) {
                    if (option.option_name) {
                      const optionData = {
                        food_id: result.food_id,
                        variation_id: variationId,
                        option_name: option.option_name,
                        option_price: parseFloat(option.option_price) || 0,
                        total_stock: parseInt(option.total_stock) || 0,
                        stock_type: option.stock_type || 'unlimited',
                        sell_count: parseInt(option.sell_count) || 0
                      };

                      const optionResult = await window.myAPI?.createVariationOption(optionData);
                      if (optionResult) {
                        console.log('Variation option created successfully:', optionResult);
                      } else {
                        console.error('Failed to create variation option');
                      }
                    }
                  }
                } else {
                  console.error('Failed to create variation');
                }
              }
            }
            console.log('All variations and options saved successfully');
          } catch (error) {
            console.error('Error saving variations:', error);
          }
        }

        navigate('/dashboard/food-management');
      } else {
        console.error('Failed to create food:', result?.message);
        alert('Failed to create food: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating food:', error);
      alert('Error creating food: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getInputClasses = (fieldName, hasError = false) => {
    const baseClasses = "w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2";
    const errorClasses = hasError ? "border-red-500 focus:ring-red-500" : "";
    const focusClasses = focusedField === fieldName && !hasError ? "border-primaryLight focus:ring-primaryLight focus:border-primaryLight" : "";
    const normalClasses = !hasError && focusedField !== fieldName ? "border-gray-300 hover:border-primaryLight" : "";

    return `${baseClasses} ${errorClasses} ${focusClasses} ${normalClasses}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center text-center text-black font-bold border-2 border-black h-6 w-6 rounded-full hover:text-gray-800 mr-4">
          {food ? (
            <Pen className="h-4 w-4 mr-1 pl-1" />
          ) : (
            <Plus className="h-5 w-5 mr-1 pl-1 font-bold" />
          )}
        </div>
        <h1 className="text-2xl font-bold">
          {food ? 'Edit Food Item' : 'Add New Food Item'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Basic Information Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <Info className="h-5 w-5 text-primaryLight mr-2" />
            <h2 className="text-lg font-semibold">Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  className={getInputClasses('name', errors.name)}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField('')}
                  className={getInputClasses('description')}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primaryLight transition-colors">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-md mb-2" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primaryLight hover:text-primaryDark">
                        <span>Upload an image</span>
                        <input type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <Tag className="h-5 w-5 text-primaryLight mr-2" />
            <h2 className="text-lg font-semibold">Category & Position</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('category_id')}
                  onBlur={() => setFocusedField('')}
                  className={`${getInputClasses('category_id', errors.category_id)} appearance-none pr-8`}
                  required
                  disabled={loading}
                >
                  <option value="">{loading ? 'Loading categories...' : 'Select Category'}</option>
                  {categories.map(cat => {
                    console.log('Rendering category:', cat);
                    return (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    );
                  })}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
              <div className="relative">
                <select
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('subcategory_id')}
                  onBlur={() => setFocusedField('')}
                  className={`${getInputClasses('subcategory_id')} appearance-none pr-8`}
                  disabled={!formData.category_id}
                >
                  <option value="">Select Sub Category</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <div className="relative">
                <select
                  name="veg"
                  value={formData.veg}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('veg')}
                  onBlur={() => setFocusedField('')}
                  className={`${getInputClasses('veg')} appearance-none pr-8`}
                >
                  <option value={0}>Non-Veg</option>
                  <option value={1}>Veg</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Position (in Category)</label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleChange}
                onFocus={() => setFocusedField('position')}
                onBlur={() => setFocusedField('')}
                className={getInputClasses('position')}
                min="1"
                placeholder="1, 2, 3..."
              />
            </div>
          </div>

          <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Is Pizza */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Is Pizza</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isPizza" checked={formData.isPizza} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryLight/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaryLight"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">{formData.isPizza ? 'Yes' : 'No'}</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">Enable if this is a pizza item</p>
            </div>

            {/* Product Notes Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Notes</label>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="allowNotes" checked={formData.allowNotes} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryLight/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaryLight"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">{formData.allowNotes ? 'ON' : 'OFF'}</span>
                </label>
              </div>
              <p className="text-xs text-gray-500">Allow staff to add custom notes while ordering</p>
            </div>

            {/* Default Product Note */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Default Product Note</label>
              <input
                type="text"
                name="productNote"
                value={formData.productNote}
                onChange={handleChange}
                onFocus={() => setFocusedField('productNote')}
                onBlur={() => setFocusedField('')}
                disabled={!formData.allowNotes}
                className={`${getInputClasses('productNote')} ${!formData.allowNotes ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="e.g., No onions, Extra spicy"
                title={!formData.allowNotes ? 'Enable Product Notes to add a default note' : ''}
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients {!formData.category_id && <span className="text-gray-400">(Select category first)</span>}
              </label>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={handleIngredientInputChange}
                  onKeyDown={handleIngredientKeyDown}
                  onFocus={handleIngredientFocus}
                  onBlur={() => setTimeout(() => setShowIngredientSuggestions(false), 200)}
                  className={`${getInputClasses('ingredientInput')} ${!formData.category_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder={formData.category_id ? "Click to see all ingredients, type to search" : "Select category first to enable ingredients"}
                  disabled={!formData.category_id}
                />

                {/* Suggestions dropdown */}
                {showIngredientSuggestions && ingredientSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {ingredientSuggestions.map((ingredient, index) => (
                      <div
                        key={ingredient.id}
                        className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === selectedIngredientSuggestionIndex
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                          }`}
                        onClick={() => handleIngredientSelect(ingredient)}
                      >
                        {ingredient.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected ingredients tags */}
              {selectedIngredients.length > 0 && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Ingredients:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{ingredient.name}</span>
                        <button
                          type="button"
                          onClick={() => handleIngredientRemove(ingredient.id)}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Allergin Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergins</label>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={allerginInput}
                  onChange={handleAllerginInputChange}
                  onKeyDown={handleAllerginKeyDown}
                  onFocus={handleAllerginFocus}
                  onBlur={() => setTimeout(() => setShowAllerginSuggestions(false), 200)}
                  className={getInputClasses('allerginInput')}
                  placeholder="Click to see all allergens, type to search"
                />

                {/* Suggestions dropdown */}
                {showAllerginSuggestions && allerginSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {allerginSuggestions.map((allergin, index) => (
                      <div
                        key={allergin.id}
                        className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === selectedSuggestionIndex
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100'
                          }`}
                        onClick={() => handleAllerginSelect(allergin)}
                      >
                        {allergin.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected allergens tags */}
              {selectedAllergins.length > 0 && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selected Allergins:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedAllergins.map((allergin) => (
                      <div
                        key={allergin.id}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{allergin.name}</span>
                        <button
                          type="button"
                          onClick={() => handleAllerginRemove(allergin.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergen Ingredients</label>
            <input
              type="text"
              name="allergenIngredients"
              value={formData.allergenIngredients}
              onChange={handleChange}
              onFocus={() => setFocusedField('allergenIngredients')}
              onBlur={() => setFocusedField('')}
              className={getInputClasses('allergenIngredients')}
              placeholder="e.g., Contains peanuts, gluten"
            />
          </div> */}


        </div>

        {/* Price & Availability Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <DollarSign className="h-5 w-5 text-primaryLight mr-2" />
            <h2 className="text-lg font-semibold">Price & Availability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField('')}
                  className={getInputClasses('price', errors.price)}
                  step="0.01"
                  min="0.01"
                  required
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                  <input
                    type="number"
                    name="tax"
                    value={formData.tax}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('tax')}
                    onBlur={() => setFocusedField('')}
                    className={getInputClasses('tax')}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Type</label>
                  <div className="relative">
                    <select
                      name="tax_type"
                      value={formData.tax_type}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('tax_type')}
                      onBlur={() => setFocusedField('')}
                      className={`${getInputClasses('tax_type')} appearance-none pr-8`}
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <div className="relative">
                    <select
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('discount_type')}
                      onBlur={() => setFocusedField('')}
                      className={`${getInputClasses('discount_type')} appearance-none pr-8`}
                    >
                      <option value="percentage">Percent (%)</option>
                      <option value="amount">Amount (€)</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('discount')}
                    onBlur={() => setFocusedField('')}
                    className={getInputClasses('discount')}
                    min="0"
                    step={formData.discount_type === 'percentage' ? '1' : '0.01'}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available From</label>
                  <input
                    type="time"
                    name="available_time_starts"
                    value={formData.available_time_starts}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('available_time_starts')}
                    onBlur={() => setFocusedField('')}
                    className={getInputClasses('available_time_starts')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available To</label>
                  <input
                    type="time"
                    name="available_time_ends"
                    value={formData.available_time_ends}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('available_time_ends')}
                    onBlur={() => setFocusedField('')}
                    className={getInputClasses('available_time_ends')}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Purchase Quantity</label>
                <input
                  type="number"
                  name="maxPurchaseQty"
                  value={formData.maxPurchaseQty}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('maxPurchaseQty')}
                  onBlur={() => setFocusedField('')}
                  className={getInputClasses('maxPurchaseQty')}
                  min="1"
                />
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                    <div className="relative">
                      <select
                        name="stock_type"
                        value={formData.stock_type}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('stock_type')}
                        onBlur={() => setFocusedField('')}
                        className={`${getInputClasses('stock_type')} appearance-none pr-8`}
                      >
                        <option value="">Select Stock Type</option>
                        <option value="unlimited">Unlimited</option>
                        <option value="limited">Limited</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  {formData.stock_type === 'limited' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                      <input
                        type="number"
                        name="item_stock"
                        value={formData.item_stock}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('item_stock')}
                        onBlur={() => setFocusedField('')}
                        className={getInputClasses('item_stock')}
                        min="0"
                        placeholder="Enter stock amount"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adons Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <Package className="h-5 w-5 text-primaryLight mr-2" />
            <h2 className="text-lg font-semibold">Adons</h2>
          </div>

          {/* Adon Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adons</label>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={adonInput}
                onChange={handleAdonInputChange}
                onKeyDown={handleAdonKeyDown}
                onFocus={handleAdonFocus}
                onBlur={() => setTimeout(() => setShowAdonSuggestions(false), 200)}
                className={getInputClasses('adonInput')}
                placeholder="Click to see all adons, type to search"
              />

              {/* Suggestions dropdown */}
              {showAdonSuggestions && adonSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {adonSuggestions.map((adon, index) => (
                    <div
                      key={adon.id}
                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${index === selectedAdonSuggestionIndex
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                        }`}
                      onClick={() => handleAdonSelect(adon)}
                    >
                      <div className="flex justify-between items-center">
                        <span>{adon.name}</span>
                        <span className="text-sm font-medium">€{adon.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected adons tags */}
            {selectedAdons.length > 0 && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Adons:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedAdons.map((adon) => (
                    <div
                      key={adon.id}
                      className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{adon.name}</span>
                      <span className="ml-2 font-medium">€{adon.price}</span>
                      <button
                        type="button"
                        onClick={() => handleAdonRemove(adon.id)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Variations Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-primaryLight mr-2" />
              <h2 className="text-lg font-semibold">Variations</h2>
            </div>
            <button
              type="button"
              onClick={handleAddVariation}
              className="flex items-center px-3 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primaryDark transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Variation
            </button>
          </div>

          <div className="space-y-6">
            {formData.variations?.map((variation, vIndex) => (
              <div key={vIndex} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-800">Variation {vIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariation(vIndex)}
                    className="flex items-center text-red-600 hover:text-red-800 text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Variation Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={variation.name || ''}
                      onChange={(e) => handleVariationChange(vIndex, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                      placeholder="e.g., Size"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selection Type</label>
                    <div className="flex space-x-4 pt-2">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`type-${vIndex}`}
                          checked={(variation.type || 'single') === 'single'}
                          onChange={() => handleVariationChange(vIndex, 'type', 'single')}
                          className="h-4 w-4 text-primaryLight focus:ring-primaryLight border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Single Selection</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={`type-${vIndex}`}
                          checked={variation.type === 'multiple'}
                          onChange={() => handleVariationChange(vIndex, 'type', 'multiple')}
                          className="h-4 w-4 text-primaryLight focus:ring-primaryLight border-gray-300" />
                        <span className="ml-2 text-sm text-gray-700">Multiple Selection</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Selections</label>
                    <input
                      type="number"
                      value={variation.min || 1}
                      onChange={(e) => handleVariationChange(vIndex, 'min', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Selections</label>
                    <input
                      type="number"
                      value={variation.max || ''}
                      onChange={(e) => handleVariationChange(vIndex, 'max', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                      min="1"
                    />
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={variation.is_required || false}
                        onChange={(e) => handleVariationChange(vIndex, 'is_required', e.target.checked)}
                        className="h-4 w-4 text-primaryLight focus:ring-primaryLight border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Required</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <button
                      type="button"
                      onClick={() => handleAddOption(vIndex)}
                      className="flex items-center text-primaryLight hover:text-primaryDark text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Option
                    </button>
                  </div>

                  {variation.options?.map((option, oIndex) => (
                    <div key={oIndex} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white p-4 rounded-lg border">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Option Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={option.option_name || ''}
                          onChange={(e) => handleOptionChange(vIndex, oIndex, 'option_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Price (€)</label>
                        <input
                          type="number"
                          value={option.option_price || ''}
                          onChange={(e) => handleOptionChange(vIndex, oIndex, 'option_price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                        <select
                          value={option.stock_type || ''}
                          onChange={(e) => handleOptionChange(vIndex, oIndex, 'stock_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                        >
                          <option value="">Select Stock Type</option>
                          <option value="unlimited">Unlimited</option>
                          <option value="limited">Limited</option>
                        </select>
                      </div>
                      {option.stock_type === 'limited' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock Type</label>
                          <input
                            type="number"
                            value={option.total_stock !== undefined && option.total_stock !== null ? option.total_stock : ''}
                            onChange={(e) => handleOptionChange(vIndex, oIndex, 'total_stock', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primaryLight focus:border-primaryLight"
                            min="0"
                            placeholder="Enter stock amount"
                          />
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(vIndex, oIndex)}
                          className="flex items-center text-red-600 hover:text-red-800 text-sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
            <Package className="h-5 w-5 text-primaryLight mr-2" />
            <h2 className="text-lg font-semibold">Inventory</h2>
          </div>

          <div className="space-y-6">
            {/* SKU and Barcode in one line */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={getInputClasses('sku')}
                  placeholder="e.g., ABC-123"
                />
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className={getInputClasses('barcode')}
                  placeholder="EAN, UPC, GTIN, etc"
                />
              </div>
            </div>

            {/* Inventory Tracking Toggle */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Track Inventory</h3>
                  <p className="text-xs text-gray-500">Enable to track stock levels for this item</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="trackInventory"
                    checked={formData.trackInventory}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primaryLight/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primaryLight"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {formData.trackInventory ? 'ON' : 'OFF'}
                  </span>
                </label>
              </div>

              {formData.trackInventory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Stock</label>
                    <input
                      type="number"
                      name="item_stock"
                      value={formData.item_stock}
                      onChange={handleChange}
                      className={getInputClasses('item_stock')}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Inventory Threshold</label>
                    <input
                      type="number"
                      name="lowInventory"
                      value={formData.lowInventory}
                      onChange={handleChange}
                      className={getInputClasses('lowInventory')}
                      min="1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/foods')}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryLight transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating...' : (food ? 'Update Food Item' : 'Add Food Item')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FoodForm;