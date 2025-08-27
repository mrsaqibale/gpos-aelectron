import React, { useState, useEffect } from 'react';
import {
  Home,
  Receipt,
  FileText,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  Clock,
  Printer,
  RefreshCw,
  Search,
  Plus,
  X,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Users2,
  Edit2,
  Minus,
  Eye,
  ArrowLeft,
  ShoppingCart,
  Download,
  ClipboardList,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LogOut,
  LayoutDashboard,
  Utensils,
  Delete,
  AlertTriangle,
  CheckCircle,
  Gift,
  ShoppingBag,
  Check,
  ChefHat,
  DollarSign,
  ChevronRight,
  Calendar,
  Filter,
  RotateCcw,
  Star,
  Tag,
  Percent,
  AlertCircle,
  Info,
  CheckSquare,
  Square,
  Circle,
  Hash,
  HashIcon,
  Truck
} from 'lucide-react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import VirtualKeyboard from '../../components/VirtualKeyboard';
import useVirtualKeyboard from '../../hooks/useVirtualKeyboard';
import CustomerManagement from '../../components/dashboard/CustomerManagement';
import CustomerSearchModal from '../../components/dashboard/CustomerSearchModal';
import FloorPlan3D from '../../components/FloorPlan3D';
import CustomAlert from '../../components/CustomAlert';
import useCustomAlert from '../../hooks/useCustomAlert';

const RunningOrders = () => {
  // Custom Alert Hook
  const { alertState, showSuccess, showError, showWarning, showInfo, hideAlert } = useCustomAlert();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCartModal, setShowDeleteCartModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showMergeTableModal, setShowMergeTableModal] = useState(false);

  // Food details state
  const [foodDetails, setFoodDetails] = useState(null);
  const [foodDetailsLoading, setFoodDetailsLoading] = useState(false);
  const [selectedAdons, setSelectedAdons] = useState([]);

  // Floor and Table Management State
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedPersons, setSelectedPersons] = useState('');
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [mergeTable1, setMergeTable1] = useState('');
  const [mergeTable2, setMergeTable2] = useState('');
  const [mergeTableSelections, setMergeTableSelections] = useState([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);


  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [runningOrdersSearchQuery, setRunningOrdersSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Coupon Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');

  // Cart state to store added food items
  const [cartItems, setCartItems] = useState([]);
  const [cartItemId, setCartItemId] = useState(1); // Unique ID for cart items
  const [editingCartItem, setEditingCartItem] = useState(null); // Track which cart item is being edited
  const [cartCharge, setCartCharge] = useState(0); // Cart charge amount
  const [cartTips, setCartTips] = useState(0); // Cart tips amount

  // Split Pizza Modal State
  const [showSplitPizzaModal, setShowSplitPizzaModal] = useState(false);
  const [pizzaSlices, setPizzaSlices] = useState(4);
  const [selectedIngredients, setSelectedIngredients] = useState([
    'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions', 'Olives',
    'Sausage', 'Bacon', 'Ham', 'Pineapple', 'Spinach'
  ]);
  const [selectedSlices, setSelectedSlices] = useState([]);
  const [completedSlices, setCompletedSlices] = useState([]);
  const [sliceIngredients, setSliceIngredients] = useState({});
  const [currentSliceSelection, setCurrentSliceSelection] = useState([]);
  const [completedBatches, setCompletedBatches] = useState([]);
  const [availableIngredients] = useState([
    'Pepperoni', 'Mushrooms', 'Bell Peppers', 'Onions', 'Olives',
    'Sausage', 'Bacon', 'Ham', 'Pineapple', 'Spinach'
  ]);

  // Add state for pizza price
  const [pizzaPrice, setPizzaPrice] = useState('');
  const [pizzaNote, setPizzaNote] = useState('');

  // Flavor to ingredients mapping
  const flavorIngredients = {
    margherita: ['Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'],
    pepperoni: ['Mozzarella', 'Tomato Sauce', 'Pepperoni', 'Oregano'],
    hawaiian: ['Mozzarella', 'Tomato Sauce', 'Ham', 'Pineapple'],
    vegetarian: ['Mozzarella', 'Tomato Sauce', 'Mushrooms', 'Bell Peppers', 'Onions', 'Spinach'],
    'bbq-chicken': ['Mozzarella', 'BBQ Sauce', 'Chicken', 'Red Onions', 'Cilantro'],
    'meat-lovers': ['Mozzarella', 'Tomato Sauce', 'Pepperoni', 'Sausage', 'Bacon', 'Ham'],
    supreme: ['Mozzarella', 'Tomato Sauce', 'Pepperoni', 'Sausage', 'Mushrooms', 'Bell Peppers', 'Onions', 'Olives'],
    'buffalo-chicken': ['Mozzarella', 'Buffalo Sauce', 'Chicken', 'Red Onions', 'Ranch Drizzle']
  };

  // Flavor to color mapping
  const flavorColors = {
    margherita: '#FF6B6B',      // Red
    pepperoni: '#FF8E53',       // Orange
    hawaiian: '#FFD93D',        // Yellow
    vegetarian: '#6BCF7F',      // Green
    'bbq-chicken': '#8B4513',   // Brown
    'meat-lovers': '#DC143C',   // Crimson
    supreme: '#9370DB',         // Purple
    'buffalo-chicken': '#FF4500' // Orange Red
  };

  // State for tracking selected flavors for each slice
  const [selectedFlavors, setSelectedFlavors] = useState({});

  // Split Bill Modal State
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [totalSplit, setTotalSplit] = useState('');
  const [splitItems, setSplitItems] = useState([]);
  const [splitDiscount, setSplitDiscount] = useState(0);
  const [splitCharge, setSplitCharge] = useState(0);
  const [splitTips, setSplitTips] = useState(0);
  const [splitBills, setSplitBills] = useState([]);
  const [selectedSplitBill, setSelectedSplitBill] = useState(null);

  // Calculate maximum splits based on total quantity
  const calculateMaxSplits = () => {
    if (!splitItems || splitItems.length === 0) return 10;

    const totalQuantity = splitItems.reduce((sum, item) => sum + item.quantity, 0);
    return Math.min(totalQuantity, 10);
  };

  // Order Management State
  const [placedOrders, setPlacedOrders] = useState([]);
  const [selectedPlacedOrder, setSelectedPlacedOrder] = useState(null);
  const [showInvoiceOptions, setShowInvoiceOptions] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set()); // Track which orders are expanded
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedOrderForStatusUpdate, setSelectedOrderForStatusUpdate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('New');

  // Finalize Sale Modal State
  const [showFinalizeSaleModal, setShowFinalizeSaleModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [givenAmount, setGivenAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState('');
  const [addedPayments, setAddedPayments] = useState([]);
  const [finalizeDiscountAmount, setFinalizeDiscountAmount] = useState('');
  const [sendSMS, setSendSMS] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [currencyAmount, setCurrencyAmount] = useState('');

  // Cart Details Modal State
  const [showCartDetailsModal, setShowCartDetailsModal] = useState(false);

  // Order Type State
  const [selectedOrderType, setSelectedOrderType] = useState('In Store');

  // Use the custom hook for keyboard functionality
  const {
    showKeyboard,
    activeInput: virtualKeyboardActiveInput,
    keyboardInput: virtualKeyboardInput,
    // capsLock removed - no longer needed
    handleInputFocus,
    handleInputBlur,
    handleAnyInputFocus,
    handleAnyInputClick,
    onKeyboardChange,
    // onKeyboardChangeAll removed - no longer needed
    onKeyboardKeyPress,
    resetKeyboardInputs,
    hideKeyboard
  } = useVirtualKeyboard(['searchQuery', 'runningOrdersSearchQuery', 'couponCode']);

  // Separate state for numeric keyboard
  const [numericActiveInput, setNumericActiveInput] = useState('');
  const [numericKeyboardInput, setNumericKeyboardInput] = useState('');

  // Custom CSS animations for modal
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fade-in {
        0% {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Close invoice options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInvoiceOptions) {
        const invoiceButton = document.querySelector('[data-invoice-button]');
        const invoiceOptions = document.querySelector('[data-invoice-options]');

        if (invoiceButton && !invoiceButton.contains(event.target) &&
          invoiceOptions && !invoiceOptions.contains(event.target)) {
          setShowInvoiceOptions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInvoiceOptions]);



  // Auto-cleanup duplicates when cart changes - REMOVED to prevent infinite loops

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories for hotel_id: 1');

      // Check if myAPI is available
      if (!window.myAPI) {
        console.error('myAPI is not available');
        setCategories([]);
        return;
      }

      const result = await window.myAPI.getCategoriesByHotel(1);
      console.log('Categories API result:', result);

      if (result && result.success) {
        // Filter categories to only show active ones (status = 1)
        const activeCategories = result.data.filter(category => category.status === 1);
        console.log('Active categories:', activeCategories);

        setCategories(activeCategories);
        console.log('Active categories loaded successfully:', activeCategories);

        // Auto-select the first active category if available
        if (activeCategories && activeCategories.length > 0) {
          const firstCategory = activeCategories[0];
          console.log('Auto-selecting first active category:', firstCategory);
          setSelectedCategory(firstCategory);
          fetchFoodsByCategory(firstCategory.id);
        }
      } else {
        console.error('Failed to fetch categories:', result?.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch foods by category
  const fetchFoodsByCategory = async (categoryId) => {
    try {
      setFoodsLoading(true);
      console.log('Fetching foods for category_id:', categoryId);

      // Check if myAPI is available
      if (!window.myAPI) {
        console.error('myAPI is not available');
        setFoods([]);
        return;
      }

      const result = await window.myAPI.getFoodByCategory(categoryId);
      console.log('Foods API result:', result);

      if (result && result.success) {
        setFoods(result.data);
        console.log('Foods loaded successfully:', result.data);
        // Log image paths for debugging
        result.data.forEach(food => {
          console.log(`Food: ${food.name}, Image: ${food.image}`);
        });
      } else {
        console.error('Failed to fetch foods:', result?.message);
        setFoods([]);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      setFoods([]);
    } finally {
      setFoodsLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setFoods([]); // Clear foods when deselecting
    } else {
      setSelectedCategory(category);
      fetchFoodsByCategory(category.id);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchFloors(); // Add this line to fetch floors on component mount
  }, []);

  // Debug floors state
  useEffect(() => {
    console.log('Floors state updated:', floors);
    console.log('Floors loading:', floorsLoading);
  }, [floors, floorsLoading]);

  // Debounce search query to avoid filtering on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter foods based on debounced search query
  useEffect(() => {
    if (debouncedSearchQuery.trim() === '') {
      setFilteredFoods(foods);
    } else {
      const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
      );
      setFilteredFoods(filtered);
    }
  }, [debouncedSearchQuery, foods]);

  // Initialize filteredFoods when foods are first loaded
  useEffect(() => {
    setFilteredFoods(foods);
  }, [foods]);

  // capsLock useEffect removed - no longer needed

  // Fetch floors from database
  const fetchFloors = async () => {
    try {
      setFloorsLoading(true);
      console.log('Fetching floors...');

      if (!window.myAPI) {
        console.error('myAPI is not available');
        setFloors([]);
        return;
      }

      console.log('Calling floorGetAll...');
      const result = await window.myAPI.floorGetAll();
      console.log('Floors API result:', result);

      if (result && result.success) {
        console.log('Floors data:', result.data);
        setFloors(result.data);
        console.log('Floors loaded successfully:', result.data);
      } else {
        console.error('Failed to fetch floors:', result?.message);
        setFloors([]);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      setFloors([]);
    } finally {
      setFloorsLoading(false);
    }
  };

  // Handle floor selection
  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor.name);
    // Reset table and persons when floor changes
    setSelectedTable('');
    setSelectedPersons('');
    // Reset merge table selections to initial 2 columns when floor changes
    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
    fetchTablesByFloor(floor.id); // Pass floor ID instead of name
  };

  // Fetch tables by floor ID with status filter
  const fetchTablesByFloor = async (floorId) => {
    try {
      setTablesLoading(true);
      console.log('Fetching tables for floor ID:', floorId);

      if (!window.myAPI) {
        console.error('myAPI is not available');
        setTables([]);
        return;
      }

      // First get the floor details using getFloorById
      const floorResult = await window.myAPI.floorGetById(floorId);
      console.log('Floor details:', floorResult);

      if (!floorResult || !floorResult.success) {
        console.error('Failed to get floor details:', floorResult?.message);
        setTables([]);
        return;
      }

      // Then get tables for this floor with status filter
      const result = await window.myAPI.tableGetByFloorWithStatus(floorId, 'Free');
      console.log('Tables API result:', result);

      if (result && result.success) {
        setTables(result.data);
        console.log('Tables loaded successfully:', result.data);
      } else {
        console.error('Failed to fetch tables:', result?.message);
        setTables([]);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  // Handle variation selection
  const handleVariationSelect = (variationId, optionId) => {
    setSelectedVariations(prev => {
      // Check if this variation is single or multiple selection
      const variation = foodDetails?.variations?.find(v => v.id === variationId);
      const isMultiple = variation?.type === 'multiple';

      if (isMultiple) {
        // Multiple selection - toggle the option
        const currentSelections = prev[variationId] || [];
        const isCurrentlySelected = currentSelections.includes(optionId);

        let newSelections;
        if (isCurrentlySelected) {
          // Removing an option
          newSelections = currentSelections.filter(id => id !== optionId);
        } else {
          // Adding an option - check max constraint
          if (variation.max && currentSelections.length >= variation.max) {
            // If max is reached, don't add more
            return prev;
          }
          newSelections = [...currentSelections, optionId];
        }

        return {
          ...prev,
          [variationId]: newSelections
        };
      } else {
        // Single selection - replace the current selection
        return {
          ...prev,
          [variationId]: optionId
        };
      }
    });
  };

  // Handle adon selection
  const handleAdonSelect = (adonId) => {
    setSelectedAdons(prev => {
      const newSelections = prev.includes(adonId)
        ? prev.filter(id => id !== adonId)
        : [...prev, adonId];
      return newSelections;
    });
  };

  // Calculate total price with variations
  const calculateTotalPrice = () => {
    if (!selectedFood) return 0;

    let basePrice = selectedFood.price || 0;
    let variationPrice = 0;
    let adonPrice = 0;

    // Calculate variation prices from real data
    if (foodDetails?.variations) {
      Object.entries(selectedVariations).forEach(([variationId, selections]) => {
        const variation = foodDetails.variations.find(v => v.id === parseInt(variationId));
        if (variation) {
          if (Array.isArray(selections)) {
            // Multiple selection
            selections.forEach(optionId => {
              const option = variation.options?.find(o => o.id === parseInt(optionId));
              if (option) {
                variationPrice += option.option_price || 0;
              }
            });
          } else {
            // Single selection
            const option = variation.options?.find(o => o.id === parseInt(selections));
            if (option) {
              variationPrice += option.option_price || 0;
            }
          }
        }
      });
    }

    // Calculate adon prices from real data
    if (foodDetails?.adons) {
      selectedAdons.forEach(adonId => {
        const adon = foodDetails.adons.find(a => a.id === parseInt(adonId));
        if (adon) {
          adonPrice += adon.price || 0;
        }
      });
    }

    const totalPricePerItem = basePrice + variationPrice + adonPrice;
    return totalPricePerItem * foodQuantity;
  };

  // Handle quantity increase
  const handleQuantityIncrease = () => {
    setFoodQuantity(prev => prev + 1);
  };

  // Handle quantity decrease
  const handleQuantityDecrease = () => {
    if (foodQuantity > 1) {
      setFoodQuantity(prev => prev - 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Check if order type is selected
    if (!selectedOrderType) {
      showError('Select the Order Type First');
      return;
    }

    // Validate variation selections using the new validation function
    if (!validateVariationSelections()) {
      showError('Please complete all required selections before adding to cart');
      return;
    }

    // Play sound when adding to cart
    try {
      const audio = new Audio('/src/assets/ping.mp3');
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    } catch (error) {
      console.log('Audio creation failed:', error);
    }

    console.log('Adding to cart:', {
      food: selectedFood,
      variations: selectedVariations,
      adons: selectedAdons,
      quantity: foodQuantity,
      totalPrice: calculateTotalPrice()
    });

    // Check if we're editing an existing cart item
    if (editingCartItem) {
      handleUpdateCartItem();
      return;
    }

    // Check if the same food item with the same variations and adons already exists in cart
    const existingCartItem = isFoodWithVariationsInCart(selectedFood, selectedVariations, selectedAdons);

    if (existingCartItem) {
      // If item with same variations and adons exists, increase quantity
      updateCartItemQuantity(existingCartItem.id, existingCartItem.quantity + foodQuantity);
      console.log('Increased quantity for existing item with variations and adons:', existingCartItem.food.name);

      // Show success alert
      showSuccess(`${existingCartItem.food.name} quantity increased!`);
    } else {
      // Create new cart item with all details
      const cartItem = {
        id: cartItemId,
        food: selectedFood,
        variations: selectedVariations,
        adons: selectedAdons,
        quantity: foodQuantity,
        totalPrice: calculateTotalPrice(),
        addedAt: new Date().toISOString()
      };

      // Add to cart
      setCartItems(prev => {
        console.log('Previous cart items:', prev);
        const newCart = [...prev, cartItem];
        console.log('New cart items:', newCart);
        return newCart;
      });
      setCartItemId(prev => prev + 1);
      console.log('Added new item to cart:', selectedFood.name);

      // Show success alert
      showSuccess(`${selectedFood.name} added to cart!`);
    }

    // Close modal and reset
    setShowFoodModal(false);
    setSelectedFood(null);
    setSelectedVariations({});
    setSelectedAdons([]);
    setFoodQuantity(1); // Reset quantity
  };

  // Check if food item is already in cart (without variations)
  const isFoodInCart = (foodItem) => {
    return cartItems.find(item =>
      item.food.id === foodItem.id &&
      JSON.stringify(item.variations) === JSON.stringify({})
    );
  };

  // Check if food item with specific variations is already in cart
  const isFoodWithVariationsInCart = (foodItem, variations, adons = []) => {
    return cartItems.find(item =>
      item.food.id === foodItem.id &&
      JSON.stringify(item.variations) === JSON.stringify(variations) &&
      JSON.stringify(item.adons || []) === JSON.stringify(adons)
    );
  };

  // Check if any food item with the same ID exists in cart (regardless of variations)
  const isAnyFoodInCart = (foodItem) => {
    return cartItems.find(item => item.food.id === foodItem.id);
  };

  // Clean up duplicate items in cart by merging quantities
  const cleanupDuplicateItems = () => {
    setCartItems(prevItems => {
      const itemMap = new Map();

      console.log('Before cleanup - Cart items:', prevItems);

      prevItems.forEach(item => {
        const key = `${item.food.id}-${JSON.stringify(item.variations)}`;
        console.log('Processing item:', item.food.name, 'with key:', key);

        if (itemMap.has(key)) {
          // Merge quantities
          const existing = itemMap.get(key);
          existing.quantity += item.quantity;
          existing.totalPrice = (existing.totalPrice / existing.quantity) * existing.quantity;
          console.log('Merged with existing item:', existing.food.name, 'new quantity:', existing.quantity);
        } else {
          // Add new item
          itemMap.set(key, { ...item });
          console.log('Added new item to map:', item.food.name);
        }
      });

      const cleanedItems = Array.from(itemMap.values());
      console.log('After cleanup - Cart items:', cleanedItems);
      console.log('Cleaned up duplicate items, new count:', cleanedItems.length);

      return cleanedItems;
    });
  };

  // Handle food item click - either increase quantity or show modal
  const handleFoodItemClick = async (foodItem) => {
    console.log('Food item clicked:', foodItem);

    // Check if order type is selected
    if (!selectedOrderType) {
      showError('Select the Order Type First');
      return;
    }

    // Check if any food item with the same ID exists in cart
    const existingCartItem = isAnyFoodInCart(foodItem);

    if (existingCartItem) {
      // If food is already in cart, increase quantity by 1
      updateCartItemQuantity(existingCartItem.id, existingCartItem.quantity + 1);
      console.log('Increased quantity for existing item:', existingCartItem.food.name);

      // Show success alert
      showSuccess(`${existingCartItem.food.name} quantity increased!`);
    } else {
      // If food is not in cart, fetch detailed food data to check for variations
      console.log('Fetching detailed food data for:', foodItem.name);
      setFoodDetailsLoading(true);

      try {
        // Fetch detailed food data with variations and adons
        const result = await window.myAPI.getFoodById(foodItem.id);
        console.log('Food details API result:', result);

        if (result && result.success) {
          console.log('Food details loaded successfully:', result.data);
          setFoodDetails(result.data);

          // Check if the food has variations
          const hasVariations = result.data.variations && result.data.variations.length > 0;
          console.log('Food has variations:', hasVariations);

          if (hasVariations) {
            // If food has variations, show the modal for customization
            setSelectedFood(result.data);
            setShowFoodModal(true);
            setSelectedVariations({});
            setSelectedAdons([]);
            setFoodQuantity(1);
          } else {
            // If food has no variations, add directly to cart
            const cartItem = {
              id: cartItemId,
              food: result.data,
              variations: {},
              adons: [],
              quantity: 1,
              totalPrice: result.data.price,
              addedAt: new Date().toISOString()
            };

            // Add to cart
            setCartItems(prev => {
              console.log('Previous cart items:', prev);
              const newCart = [...prev, cartItem];
              console.log('New cart items:', newCart);
              return newCart;
            });
            setCartItemId(prev => prev + 1);
            console.log('Added food without variations directly to cart:', result.data.name);

            // Show success alert
            showSuccess(`${result.data.name} added to cart!`);
          }
        } else {
          console.error('Failed to fetch food details:', result?.message);
          // Fallback to basic food data - add directly to cart
          const cartItem = {
            id: cartItemId,
            food: foodItem,
            variations: {},
            adons: [],
            quantity: 1,
            totalPrice: foodItem.price,
            addedAt: new Date().toISOString()
          };

          // Add to cart
          setCartItems(prev => {
            console.log('Previous cart items:', prev);
            const newCart = [...prev, cartItem];
            console.log('New cart items:', newCart);
            return newCart;
          });
          setCartItemId(prev => prev + 1);
          console.log('Added food without variations directly to cart (fallback):', foodItem.name);

          // Show success alert
          showSuccess(`${foodItem.name} added to cart!`);
        }
      } catch (error) {
        console.error('Error fetching food details:', error);
        // Fallback to basic food data - add directly to cart
        const cartItem = {
          id: cartItemId,
          food: foodItem,
          variations: {},
          adons: [],
          quantity: 1,
          totalPrice: foodItem.price,
          addedAt: new Date().toISOString()
        };

        // Add to cart
        setCartItems(prev => {
          console.log('Previous cart items:', prev);
          const newCart = [...prev, cartItem];
          console.log('New cart items:', newCart);
          return newCart;
        });
        setCartItemId(prev => prev + 1);
        console.log('Added food without variations directly to cart (error fallback):', foodItem.name);

        // Show success alert
        showSuccess(`${foodItem.name} added to cart!`);
      } finally {
        setFoodDetailsLoading(false);
      }
    }
  };

  // Handle table selection
  const handleTableSelect = (tableId) => {
    setSelectedTable(tableId);
    // Reset persons when table changes
    setSelectedPersons('');
  };

  // Handle persons selection
  const handlePersonsSelect = (persons) => {
    setSelectedPersons(persons);
  };

  // Get selected table data
  const getSelectedTableData = () => {
    return tables.find(table => table.id.toString() === selectedTable);
  };

  // Generate seat capacity options based on selected table
  const getSeatCapacityOptions = () => {
    const selectedTableData = getSelectedTableData();
    if (!selectedTableData) return [];

    const seatCapacity = selectedTableData.seat_capacity || 4;
    return Array.from({ length: seatCapacity }, (_, i) => i + 1);
  };

  // Handle merge table button click
  const handleMergeTableClick = () => {
    setShowTableModal(false);
    setShowMergeTableModal(true);
    // Reset merge table selections to initial state
    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
  };

  // Handle back button in merge modal
  const handleBackToTableSelection = () => {
    setShowMergeTableModal(false);
    setShowTableModal(true);
    // Reset merge table selections when going back
    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
  };

  // Handle merge table selections
  const handleMergeTable1Select = (tableId) => {
    setMergeTable1(tableId);
    // If the same table is selected in table2, clear it
    if (mergeTable2 === tableId) {
      setMergeTable2('');
    }
  };

  const handleMergeTable2Select = (tableId) => {
    setMergeTable2(tableId);
    // If the same table is selected in table1, clear it
    if (mergeTable1 === tableId) {
      setMergeTable1('');
    }
  };

  // Handle dynamic merge table selections
  const handleMergeTableSelectionChange = (selectionId, tableId) => {
    setMergeTableSelections(prev =>
      prev.map(selection =>
        selection.id === selectionId
          ? { ...selection, tableId }
          : selection
      )
    );
  };

  // Add more table selection
  const handleAddMoreTableSelection = () => {
    const newId = Math.max(...mergeTableSelections.map(s => s.id)) + 1;
    setMergeTableSelections(prev => [...prev, { id: newId, tableId: '' }]);
  };

  // Remove table selection
  const handleRemoveTableSelection = (selectionId) => {
    if (mergeTableSelections.length > 2) {
      setMergeTableSelections(prev => prev.filter(selection => selection.id !== selectionId));
    }
  };

  // Get available tables for a specific selection (excluding already selected tables)
  const getAvailableTablesForSelection = (selectionId) => {
    const selectedTableIds = mergeTableSelections
      .filter(selection => selection.id !== selectionId && selection.tableId)
      .map(selection => selection.tableId);

    return tables.filter(table => !selectedTableIds.includes(table.id.toString()));
  };

  // Check if "Add More" button should be disabled
  const isAddMoreDisabled = () => {
    const selectedTableIds = mergeTableSelections
      .filter(selection => selection.tableId)
      .map(selection => selection.tableId);

    return selectedTableIds.length >= tables.length;
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      // First delete all addresses for this customer
      if (selectedCustomer.addresses && selectedCustomer.addresses.length > 0) {
        for (const address of selectedCustomer.addresses) {
          await window.myAPI?.deleteAddress(address.id);
        }
      }

      // Then delete the customer
      const result = await window.myAPI?.updateCustomer(selectedCustomer.id, { isDelete: 1 });
      if (result && result.success) {
        setSelectedCustomer(null); // Reset to walk-in customer
        setShowDeleteConfirm(false);
        showSuccess('Customer deleted successfully', 'success');
      } else {
        showError('Error deleting customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showError('Error deleting customer');
    }
  };

  const handleEditCustomer = (updatedCustomer) => {
    setSelectedCustomer(updatedCustomer);
    setShowEditModal(false);
  };

  // Add sample data function
  const addSampleData = async () => {
    try {
      console.log('Adding sample data...');
      const result = await window.myAPI?.floorAddSampleData();
      console.log('Sample data result:', result);

      if (result && result.success) {
        console.log('Sample data added successfully');
        // Refresh floors after adding sample data
        await fetchFloors();
      } else {
        console.error('Failed to add sample data:', result?.error);
        showError('Failed to add sample data: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
      showError('Error adding sample data');
    }
  };

  const handleOpenEditModal = async () => {
    if (!selectedCustomer) {
      showError('No customer selected to edit');
      return;
    }

    try {
      // Fetch the customer's addresses before opening edit form
      const addressResult = await window.myAPI?.getCustomerAddresses(selectedCustomer.id);
      if (addressResult && addressResult.success) {
        const customerWithAddresses = {
          ...selectedCustomer,
          addresses: addressResult.data || []
        };
        setSelectedCustomer(customerWithAddresses);
      }
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      setShowEditModal(true); // Still open modal even if address fetch fails
    }
  };

  // Coupon-related functions
  const fetchAvailableCoupons = async () => {
    try {
      setCouponsLoading(true);
      console.log('Fetching available coupons...');

      if (!window.myAPI) {
        console.error('myAPI is not available');
        setAvailableCoupons([]);
        return;
      }

      const result = await window.myAPI.getAllCoupons();
      console.log('Raw coupons API result:', result);
      console.log('Result success:', result?.success);
      console.log('Result data:', result?.data);

      if (result && result.success) {
        console.log('Raw coupons data:', result.data);

        // Transform database data to match frontend format (similar to Coupons.jsx)
        const transformedCoupons = result.data.map(coupon => {
          console.log('Processing coupon:', coupon);
          const transformed = {
            id: coupon.id,
            title: coupon.title,
            code: coupon.code,
            customerType: coupon.type || 'All Customers',
            limitForSameUser: coupon.usage_limit || 0,
            startDate: coupon.start_date ? coupon.start_date.split('T')[0] : '',
            expireDate: coupon.end_date ? coupon.end_date.split('T')[0] : '',
            discountType: coupon.discount_type || 'percentage',
            discount: coupon.amount || 0,
            maxDiscount: coupon.max_discount || 0,
            minPurchase: coupon.min_purchase || 0,
            totalUsers: 0, // This would need to be calculated from usage data
            status: coupon.status === 1 ? 'active' : 'inactive'
          };
          console.log('Transformed coupon:', transformed);
          return transformed;
        });

        console.log('All transformed coupons:', transformedCoupons);

        // Filter for active/available coupons
        const activeCoupons = transformedCoupons.filter(coupon => {
          console.log('Checking coupon status:', coupon.status, 'expireDate:', coupon.expireDate);
          const isActive = coupon.status === 'active';
          const notExpired = !coupon.expireDate || new Date(coupon.expireDate) > new Date();
          console.log('Is active:', isActive, 'Not expired:', notExpired);
          return isActive && notExpired;
        });

        // TEMPORARY: Show all coupons for debugging
        console.log('All coupons (including inactive):', transformedCoupons);
        console.log('Active coupons only:', activeCoupons);

        console.log('Active coupons after filtering:', activeCoupons);
        setAvailableCoupons(activeCoupons);
        console.log('Available coupons loaded:', activeCoupons);
      } else {
        console.error('Failed to fetch coupons:', result?.message);
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setAvailableCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code');
      return;
    }

    try {
      console.log('Applying coupon code:', couponCode);

      if (!window.myAPI) {
        console.error('myAPI is not available');
        showError('System error: API not available');
        return;
      }

      const result = await window.myAPI.searchCouponByCode(couponCode.trim());
      console.log('Coupon search result:', result);

      if (result && result.success && result.data) {
        const coupon = result.data;

        // Transform the coupon data to match our frontend format
        const transformedCoupon = {
          id: coupon.id,
          title: coupon.title,
          code: coupon.code,
          customerType: coupon.type || 'All Customers',
          limitForSameUser: coupon.usage_limit || 0,
          startDate: coupon.start_date ? coupon.start_date.split('T')[0] : '',
          expireDate: coupon.end_date ? coupon.end_date.split('T')[0] : '',
          discountType: coupon.discount_type || 'percentage',
          discount: coupon.amount || 0,
          maxDiscount: coupon.max_discount || 0,
          minPurchase: coupon.min_purchase || 0,
          totalUsers: 0,
          status: coupon.status === 1 ? 'active' : 'inactive'
        };

        // Check if coupon is valid
        if (transformedCoupon.status !== 'active') {
          showError('This coupon is not active');
          return;
        }

        if (transformedCoupon.expireDate && new Date(transformedCoupon.expireDate) < new Date()) {
          showError('This coupon has expired');
          return;
        }

        // Apply the coupon
        setAppliedCoupon(transformedCoupon);
        setCouponCode('');

        // Don't close modal automatically - let user close it manually

      } else {
        showError('Invalid coupon code. Please try again.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showError('Error applying coupon. Please try again.');
    }
  };

  // Function to apply coupon directly when clicked from the list
  const applyCouponDirectly = (coupon) => {
    try {
      console.log('Applying coupon directly:', coupon);

      // Check if coupon is valid
      if (coupon.status !== 'active') {
        showError('This coupon is not active');
        return;
      }

      if (coupon.expireDate && new Date(coupon.expireDate) < new Date()) {
        showError('This coupon has expired');
        return;
      }

      // Apply the coupon
      setAppliedCoupon(coupon);
      setCouponCode('');
      showSuccess(`Coupon "${coupon.code}" applied successfully!`, 'success');

      // Don't close modal automatically - let user close it manually

    } catch (error) {
      console.error('Error applying coupon directly:', error);
      showError('Error applying coupon. Please try again.');
    }
  };

  const handleOpenCouponModal = () => {
    setShowCouponModal(true);
    setCouponCode('');
    setAppliedCoupon(null);
    fetchAvailableCoupons();
    // Automatically show keyboard for discount amount field when modal opens
    setNumericActiveInput('discountAmount');
    setNumericKeyboardInput(discountAmount || '');
    // Don't show VirtualKeyboard - only numeric keyboard will be visible
  };

  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount('');
    setDiscountType('percentage');
    // Hide keyboard when modal closes
    setShowKeyboard(false);
    setNumericActiveInput(null);
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleApplyManualDiscount = () => {
    if (!discountAmount || parseFloat(discountAmount) <= 0) {
      showError('Please enter a valid discount amount');
      return;
    }

    // Create a manual discount object similar to coupon structure
    const manualDiscount = {
      id: 'manual',
      title: 'Manual Discount',
      code: 'MANUAL',
      discount: parseFloat(discountAmount),
      discountType: discountType,
      customerType: 'All Customers',
      status: 'active'
    };

    setAppliedCoupon(manualDiscount);
    setDiscountAmount('');
    setDiscountType('percentage');
  };

  // Handle keyboard input changes
  const handleKeyboardChange = (input, inputName) => {
    if (inputName === 'searchQuery') {
      setSearchQuery(input);
    } else if (inputName === 'runningOrdersSearchQuery') {
      setRunningOrdersSearchQuery(input);
    } else if (inputName === 'couponCode') {
      setCouponCode(input);
    } else if (inputName === 'discountAmount') {
      setDiscountAmount(input);
    }
  };

  // Custom blur handler that saves the current keyboard input
  const handleCustomInputBlur = (e, inputName) => {
    // Save the current keyboard input to the appropriate state
    if (virtualKeyboardActiveInput === inputName && virtualKeyboardInput !== undefined) {
      handleKeyboardChange(virtualKeyboardInput, inputName);
    }
    // Call the hook's blur handler
    handleInputBlur(e);
  };

  // Custom focus handler for numeric fields - only sets activeInput without showing VirtualKeyboard
  const handleNumericInputFocus = (e, inputName, currentValue = '') => {
    // Set the active input for the numeric keyboard without showing the VirtualKeyboard
    setNumericActiveInput(inputName);
    // Set the keyboard input value to match the current form value
    setNumericKeyboardInput(currentValue || '');
    // Clear the keyboard display to prevent appending to previous values
    if (window.keyboard) {
      window.keyboard.setInput(currentValue || '');
    }
  };

  // Custom handler for numeric keyboard changes
  const handleNumericKeyboardChange = (input) => {
    setNumericKeyboardInput(input);
    if (numericActiveInput === 'discountAmount') {
      setDiscountAmount(input);
    } else if (numericActiveInput === 'paymentAmount') {
      setPaymentAmount(input);
      if (selectedPaymentMethod === 'Cash') {
        setGivenAmount(input);
        // Calculate change based on the split bill total
        if (input) {
          const splitBillTotal = calculateSplitBillTotal();
          const change = parseFloat(input) - splitBillTotal;
          setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
        } else {
          setChangeAmount('0.00');
        }
      }
    } else if (numericActiveInput === 'givenAmount') {
      setGivenAmount(input);
      setPaymentAmount(input);
      // Calculate change based on the split bill total
      if (input) {
        const splitBillTotal = calculateSplitBillTotal();
        const change = parseFloat(input) - splitBillTotal;
        setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
      } else {
        setChangeAmount('0.00');
      }
    }
  };

  // Custom handler for numeric keyboard key presses
  const handleNumericKeyboardKeyPress = (button) => {
    if (numericActiveInput === 'discountAmount') {
      if (button === '{bksp}') {
        const currentValue = numericKeyboardInput || '';
        const newValue = currentValue.slice(0, -1);
        setNumericKeyboardInput(newValue);
        setDiscountAmount(newValue);
        return { action: 'backspace', value: newValue, activeInput: numericActiveInput };
      }
    } else if (numericActiveInput === 'paymentAmount') {
      if (button === '{bksp}') {
        const currentValue = numericKeyboardInput || '';
        const newValue = currentValue.slice(0, -1);
        setNumericKeyboardInput(newValue);
        setPaymentAmount(newValue);
        if (selectedPaymentMethod === 'Cash') {
          setGivenAmount(newValue);
          if (newValue) {
            const splitBillTotal = calculateSplitBillTotal();
            const change = parseFloat(newValue) - splitBillTotal;
            setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
          } else {
            setChangeAmount('0.00');
          }
        }
        return { action: 'backspace', value: newValue, activeInput: numericActiveInput };
      }
    } else if (numericActiveInput === 'givenAmount') {
      if (button === '{bksp}') {
        const currentValue = numericKeyboardInput || '';
        const newValue = currentValue.slice(0, -1);
        setNumericKeyboardInput(newValue);
        setGivenAmount(newValue);
        setPaymentAmount(newValue);
        if (newValue) {
          const splitBillTotal = calculateSplitBillTotal();
          const change = parseFloat(newValue) - splitBillTotal;
          setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
        } else {
          setChangeAmount('0.00');
        }
        return { action: 'backspace', value: newValue, activeInput: numericActiveInput };
      }
    }
    return null;
  };











  // Handle keyboard key presses
  const handleKeyboardKeyPress = (result) => {
    if (result && result.action === 'enter' && result.nextField) {
      const nextInput = document.querySelector(`[name="${result.nextField}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    } else if (result && result.action === 'tab' && result.nextField) {
      const nextInput = document.querySelector(`[name="${result.nextField}"]`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };



  // Cart item operations
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      removeCartItem(itemId);
      return;
    }
    try {
      const audio = new Audio('/src/assets/ping.mp3');
      audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    } catch (error) {
      console.log('Audio creation failed:', error);
    }

    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        // Recalculate total price based on new quantity
        const basePrice = item.food.price || 0;
        let variationPrice = 0;

        // Calculate variation prices (same logic as calculateTotalPrice)
        const variationPrices = {
          size: {
            'Small': 0,
            'Medium': 2.50,
            'Large': 5.00
          },
          toppings: {
            'Extra Cheese': 1.50,
            'Bacon': 2.00,
            'Mushrooms': 1.00,
            'Olives': 0.75
          },
          addons: {
            'Extra Cheese': 1.50,
            'Bacon': 2.00,
            'Mushrooms': 1.00,
            'Olives': 0.75,
            'Extra Sauce': 0.50,
            'Double Portion': 3.00
          }
        };

        Object.entries(item.variations).forEach(([type, selection]) => {
          if ((type === 'size' || type === 'toppings' || type === 'addons') && Array.isArray(selection)) {
            selection.forEach(variationItem => {
              if (variationPrices[type] && variationPrices[type][variationItem]) {
                variationPrice += variationPrices[type][variationItem];
              }
            });
          }
        });

        const totalPricePerItem = basePrice + variationPrice;
        const newTotalPrice = totalPricePerItem * newQuantity;

        return {
          ...item,
          quantity: newQuantity,
          totalPrice: newTotalPrice
        };
      }
      return item;
    }));
  };

  const removeCartItem = (itemId) => {
    // Get the item name before removing it for the alert message
    const itemToRemove = cartItems.find(item => item.id === itemId);
    const itemName = itemToRemove ? itemToRemove.food.name : 'Item';

    // Remove the item from cart
    setCartItems(prev => prev.filter(item => item.id !== itemId));

    // Show success alert
    showSuccess(`${itemName} removed from cart!`);
  };

  // Handle editing cart item
  const handleEditCartItem = (cartItem) => {
    setEditingCartItem(cartItem);
    setSelectedFood(cartItem.food);
    setSelectedVariations(cartItem.variations || {});
    setSelectedAdons(cartItem.adons || []);
    setFoodQuantity(cartItem.quantity);
    setShowFoodModal(true);
  };

  // Handle updating cart item after editing
  const handleUpdateCartItem = () => {
    if (!editingCartItem) return;

    // Update the cart item with new details
    setCartItems(prev => prev.map(item => {
      if (item.id === editingCartItem.id) {
        return {
          ...item,
          variations: selectedVariations,
          adons: selectedAdons,
          quantity: foodQuantity,
          totalPrice: calculateTotalPrice()
        };
      }
      return item;
    }));

    // Reset editing state
    setEditingCartItem(null);
    setShowFoodModal(false);
    setSelectedFood(null);
    setSelectedVariations({});
    setSelectedAdons([]);
    setFoodQuantity(1);
  };

  // Calculate cart totals
  const calculateCartSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateCartTax = () => {
    const subtotal = calculateCartSubtotal();
    return subtotal * 0.13; // 13% tax rate
  };

  const calculateCartDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = calculateCartSubtotal();
    if (appliedCoupon.discountType === 'percentage') {
      const discount = subtotal * (appliedCoupon.discount / 100);
      return appliedCoupon.maxDiscount > 0 ? Math.min(discount, appliedCoupon.maxDiscount) : discount;
    } else {
      return appliedCoupon.discount;
    }
  };

  const calculateCartTotal = () => {
    const subtotal = calculateCartSubtotal();
    const tax = calculateCartTax();
    const discount = calculateCartDiscount();
    return subtotal + tax - discount;
  };

  // Clear cart function
  const clearCart = () => {
    // Check if there are items in the cart before clearing
    const itemCount = cartItems.length;

    // Clear all cart data
    setCartItems([]);
    setAppliedCoupon(null);
    setSelectedTable('');
    setSelectedPersons('');
    setSelectedFloor('');
    setSelectedCustomer(null);
    setMergeTable1('');
    setMergeTable2('');
    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
    setEditingCartItem(null);
    setFoodQuantity(1);
    setSelectedVariations({});
    setSelectedAdons([]);
    setSelectedOrderType('');

    // Show success alert if there were items in the cart
    if (itemCount > 0) {
      showSuccess(`All ${itemCount} item${itemCount === 1 ? '' : 's'} removed from cart!`);
    }
  };

  // Split Pizza Modal Functions
  const handleOpenSplitPizzaModal = () => {
    setShowSplitPizzaModal(true);
    // Reset to all available ingredients when opening the modal
    setSelectedIngredients([...availableIngredients]);
    setCompletedSlices([]);
    setSliceIngredients({});
    setCurrentSliceSelection([]);
    setCompletedBatches([]);
    setSelectedFlavors({}); // Reset selected flavors
    setCurrentIngredients([]); // Reset current ingredients
  };

  const handleCloseSplitPizzaModal = () => {
    setShowSplitPizzaModal(false);
    setPizzaSlices(2);
    setSelectedSlices([]);
    setCompletedSlices([]);
    setSliceIngredients({});
    setCurrentSliceSelection([]);
    setCompletedBatches([]);
    setSelectedFlavors({}); // Reset selected flavors
    setCurrentIngredients([]); // Reset current ingredients
    // Don't reset selectedIngredients here - keep user's selection
  };

  const handleAddSliceIngredients = () => {
    if (selectedSlices.length > 0) {
      // Add selected slices to completed slices
      setCompletedSlices(prev => [...prev, ...selectedSlices]);

      // Save ingredients for these slices
      const newSliceIngredients = { ...sliceIngredients };
      selectedSlices.forEach(sliceIndex => {
        newSliceIngredients[sliceIndex] = [...selectedIngredients];
      });
      setSliceIngredients(newSliceIngredients);

      // Create a new batch with current slices and ingredients
      const newBatch = {
        slices: [...selectedSlices],
        ingredients: [...selectedIngredients]
      };
      setCompletedBatches(prev => [...prev, newBatch]);

      // Clear current selection
      setSelectedSlices([]);
      setSelectedIngredients([...availableIngredients]);
    }
  };



  const handlePizzaSlicesChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 2 && value <= 4) {
      setPizzaSlices(value);
    }
  };



  const handleRemoveIngredient = (ingredient) => {
    setSelectedIngredients(selectedIngredients.filter(item => item !== ingredient));
  };

  const handleSliceClick = (sliceIndex) => {
    // Don't allow selecting completed slices
    if (completedSlices.includes(sliceIndex)) {
      return;
    }

    setSelectedSlices(prev => {
      if (prev.includes(sliceIndex)) {
        return prev.filter(index => index !== sliceIndex);
      } else {
        return [...prev, sliceIndex];
      }
    });
  };

  // Handle flavor selection for each slice
  const handleFlavorChange = (sliceIndex, flavor) => {
    setSelectedFlavors(prev => ({
      ...prev,
      [sliceIndex]: flavor
    }));
  };

  // Get ingredients for a specific flavor
  const getIngredientsForFlavor = (flavor) => {
    return flavorIngredients[flavor] || [];
  };

  // Get all unique ingredients from all selected flavors
  const getAllSelectedIngredients = () => {
    const allIngredients = new Set();
    Object.values(selectedFlavors).forEach(flavor => {
      if (flavor && flavorIngredients[flavor]) {
        flavorIngredients[flavor].forEach(ingredient => {
          allIngredients.add(ingredient);
        });
      }
    });
    return Array.from(allIngredients).sort(); // Sort for consistent display
  };

  // State to track current ingredients for better reactivity
  const [currentIngredients, setCurrentIngredients] = useState([]);

  // Update ingredients whenever flavors change
  useEffect(() => {
    const ingredients = getAllSelectedIngredients();
    setCurrentIngredients(ingredients);
  }, [selectedFlavors]);

  // Handle removing an ingredient from current ingredients list
  const handleRemoveCurrentIngredient = (ingredientToRemove) => {
    setCurrentIngredients(prev => prev.filter(ingredient => ingredient !== ingredientToRemove));
  };

  // Handle adding custom note
  const handleAddCustomNote = () => {
    if (pizzaNote.trim()) {
      setCurrentIngredients(prev => [...prev, pizzaNote.trim()]);
      setPizzaNote('');
    }
  };

  const renderPizzaSlices = () => {
    const slices = [];
    const angleStep = 360 / pizzaSlices;

    for (let i = 0; i < pizzaSlices; i++) {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      const isSelected = selectedSlices.includes(i);
      const isCompleted = completedSlices.includes(i);

      // Calculate the slice path
      const x1 = 100 + 80 * Math.cos(startAngle * Math.PI / 180);
      const y1 = 100 + 80 * Math.sin(startAngle * Math.PI / 180);
      const x2 = 100 + 80 * Math.cos(endAngle * Math.PI / 180);
      const y2 = 100 + 80 * Math.sin(endAngle * Math.PI / 180);

      // Create large arc flag (1 if angle > 180 degrees, 0 otherwise)
      const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

      // Determine fill color based on state
      let fillColor = "#FFD700"; // Default gold
      const hasFlavorSelected = selectedFlavors[i]; // Check if flavor is selected for this slice
      
      if (isCompleted) {
        fillColor = "#22C55E"; // Green for completed
      } else if (isSelected) {
        fillColor = "#E6C200"; // Darker gold for selected
      } else if (hasFlavorSelected) {
        // Use the specific flavor color
        fillColor = flavorColors[hasFlavorSelected] || "#D4AF37"; // Fallback to darker yellow if flavor not found
      }

      slices.push(
        <g key={i}>
          {/* Invisible clickable area - only if not completed */}
          {!isCompleted && (
            <path
              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill="transparent"
              stroke="none"
              style={{ cursor: 'pointer' }}
              onClick={() => handleSliceClick(i)}
            />
          )}
          {/* Visible slice */}
          <path
            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
            fill={fillColor}
            stroke="#FF8C00"
            strokeWidth="2"
            style={{ 
              cursor: isCompleted ? 'default' : 'pointer',
              transition: 'fill 0.3s ease-in-out'
            }}
            onClick={() => !isCompleted && handleSliceClick(i)}
          />
        </g>
      );
    }

    return slices;
  };

  // Handle place order
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      showError('Please add items to cart before placing order');
      return;
    }

    // Map order type based on selection
    let orderType = 'In Store'; // default
    if (selectedOrderType === 'Table') {
      orderType = 'Dine In';
    } else if (selectedOrderType === 'Collection') {
      orderType = 'Collection';
    } else if (selectedOrderType === 'Delivery') {
      orderType = 'Delivery';
    }

    // Create a new order
    const newOrder = {
      id: Date.now(),
      orderNumber: `ORD-${String(placedOrders.length + 1).padStart(3, '0')}`,
      items: [...cartItems],
      customer: selectedCustomer || { name: 'Walk-in Customer' },
      total: calculateCartTotal(),
      coupon: appliedCoupon,
      orderType: orderType,
      table: selectedTable ? selectedTable : 'None',
      waiter: 'Ds Waiter',
      status: 'New',
      placedAt: new Date().toISOString()
    };

    // Add to placed orders
    setPlacedOrders(prev => [newOrder, ...prev]);

    showSuccess('Order placed successfully!', 'success');
    clearCart();
  };

  // Handle payment
  const handlePayment = () => {
    if (cartItems.length === 0) {
      showError('Please add items to cart before proceeding to payment');
      return;
    }

    // Reset modal state and open the Finalize Sale Modal
    resetFinalizeSaleModal();
    setShowFinalizeSaleModal(true);
  };

  // Function to load food image
  const loadFoodImage = async (imagePath) => {
    console.log('Loading food image:', imagePath);
    if (!imagePath || !imagePath.startsWith('uploads/')) {
      console.log('Invalid image path:', imagePath);
      return null;
    }

    try {
      const result = await window.myAPI.getFoodImage(imagePath);
      console.log('Image loading result:', result);
      if (result && result.success) {
        return result.data;
      } else {
        console.log('Image loading failed:', result?.message);
      }
    } catch (error) {
      console.error('Error loading food image:', error);
    }
    return null;
  };

  // Component for displaying food images with loading states
  const FoodImageDisplay = ({ food }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
      const loadImage = async () => {
        setImageLoading(true);
        if (food && food.image) {
          const loadedImage = await loadFoodImage(food.image);
          setImageSrc(loadedImage);
        } else {
          setImageSrc(null);
        }
        setImageLoading(false);
      };

      loadImage();
    }, [food?.image]);

    if (imageLoading) {
      return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-gray-400 text-xs">Loading...</div>
        </div>
      );
    }

    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt={food?.name || 'Food'}
          className="w-full h-full object-cover"
          onError={() => setImageSrc(null)}
        />
      );
    }

    return (
      <img
        src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center"
        alt={food?.name || 'Food'}
        className="w-full h-full object-cover"
      />
    );
  };

  const MenuCard = ({ item }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
      const loadImage = async () => {
        setImageLoading(true);
        if (item.image) {
          const loadedImage = await loadFoodImage(item.image);
          setImageSrc(loadedImage);
        } else {
          setImageSrc(null);
        }
        setImageLoading(false);
      };

      loadImage();
    }, [item.image]);

    return (
      <div
        className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden transform hover:-translate-y-1 cursor-pointer"
        
      >
        <div className="h-[88px] relative">
          {imageLoading ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-xs">Loading...</div>
            </div>
          ) : imageSrc ? (
            <img
              src={imageSrc}
              alt={item.name}
              className="w-full h-[100%] object-cover"
              onError={() => setImageSrc(null)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-xs">No Image</div>
            </div>
          )}
        </div>
          <h3 className="font-semibold text-gray-800 text-md mt-2 mb-1 text-center">{item.name}</h3>
        <div className="flex justify-between p-2 items-center">
          <p className="text-gray-600 font-semibold text-md mt-1">€{item.price?.toFixed(2) || '0.00'}</p>
        <button
          className="mt-1 w-5 h-5 flex items-center justify-center rounded-full bg-primary border-2 border-primary text-white cursor-pointer"
          title="Add"
          onClick={() => handleFoodItemClick(item)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-3 h-3"
          >
            <path d="M10 4v12M4 10h12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        </div>
      </div>
    );
  };

  const MenuGrid = () => {
    return (
      <div className="flex-1 overflow-y-auto py-4 px-2">
        {foodsLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">Loading foods...</div>
          </div>
        ) : searchQuery !== debouncedSearchQuery ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">Searching...</div>
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-2 gap-y-4">
            {filteredFoods.map((food) => (
              <MenuCard key={food.id} item={food} />
            ))}
          </div>
        ) : debouncedSearchQuery.trim() !== '' ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">No foods found matching "{debouncedSearchQuery}"</div>
            <div className="text-gray-400 text-xs mt-2">Try a different search term</div>
          </div>
        ) : selectedCategory ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">No foods found in this category</div>
            <div className="text-gray-400 text-xs mt-2">Category: {selectedCategory.name}</div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">Select a category to view foods</div>
            <div className="text-gray-400 text-xs mt-2">Categories loaded: {categories.length}</div>
          </div>
        )}
      </div>
    );
  };

  // Validate minimum and maximum selections for variations
  const validateVariationSelections = () => {
    if (!foodDetails?.variations) return true;

    for (const variation of foodDetails.variations) {
      const selectedOptions = selectedVariations[variation.id];

      if (variation.is_required && !selectedOptions) {
        return false; // Required variation not selected
      }

      if (selectedOptions) {
        const selectionCount = Array.isArray(selectedOptions) ? selectedOptions.length : 1;

        // Check minimum selection
        if (variation.min && selectionCount < variation.min) {
          return false;
        }

        // Check maximum selection
        if (variation.max && selectionCount > variation.max) {
          return false;
        }
      }
    }

    return true;
  };

  // Get validation messages for variations
  const getVariationValidationMessages = () => {
    const messages = [];

    if (!foodDetails?.variations) return messages;

    for (const variation of foodDetails.variations) {
      const selectedOptions = selectedVariations[variation.id];
      const selectionCount = selectedOptions ? (Array.isArray(selectedOptions) ? selectedOptions.length : 1) : 0;

      if (variation.is_required && !selectedOptions) {
        messages.push(`Required: ${variation.name}`);
      }

      if (selectedOptions) {
        if (variation.min && selectionCount < variation.min) {
          messages.push(`Minimum selection for ${variation.name}: ${variation.min}`);
        }

        if (variation.max && selectionCount > variation.max) {
          messages.push(`Maximum selection for ${variation.name}: ${variation.max}`);
        }
      }
    }

    return messages;
  };

  // Split Bill Modal Functions
  const handleOpenSplitBillModal = () => {
    setShowSplitBillModal(true);
    setShowInvoiceOptions(false); // Close invoice options when opening split bill modal
    setTotalSplit('');
    setSplitBills([]);
    setSelectedSplitBill(null);
    // Initialize split items from selected order items
    const orderItems = selectedPlacedOrder ? selectedPlacedOrder.items : [];
    setSplitItems(orderItems.map(item => ({
      ...item,
      splitQuantity: 0,
      isSelected: false
    })));
    setSplitDiscount(0);
    setSplitCharge(0);
    setSplitTips(0);
  };

  const handleCloseSplitBillModal = () => {
    setShowSplitBillModal(false);
    setTotalSplit('');
    setSplitItems([]);
    setSplitBills([]);
    setSelectedSplitBill(null);
    setSplitDiscount(0);
    setSplitCharge(0);
    setSplitTips(0);
  };

  const handleSplitItemToggle = (itemId) => {
    setSplitItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, isSelected: !item.isSelected, splitQuantity: !item.isSelected ? 1 : 0 }
        : item
    ));
  };

  const handleSplitItemQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return;

    setSplitItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, splitQuantity: newQuantity }
        : item
    ));
  };

  const handleSplitGo = () => {
    if (!totalSplit || parseInt(totalSplit) <= 0) {
      showError('Please enter a valid number of splits');
      return;
    }

    const numSplits = parseInt(totalSplit);
    const maxSplits = calculateMaxSplits();
    if (numSplits > maxSplits) {
      showError(`Maximum ${maxSplits} splits allowed based on total quantity`);
      return;
    }

    // Create split bills
    const dummyCustomers = [
      'Walk-in Customer',
      'Dona M. Leighty 408-230-51',
      'Donld PB 432226663',
      'Gustavo J. Weitz 256-537-96',
      'Mr Joe 231654849',
      'Mr. Heri 523154215',
      'John Smith 555-1234',
      'Jane Doe 555-5678',
      'Mike Johnson 555-9012',
      'Sarah Wilson 555-3456'
    ];

    const newSplitBills = Array.from({ length: numSplits }, (_, index) => ({
      id: index + 1,
      customer: dummyCustomers[index] || `Customer ${index + 1}`,
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      charge: 0,
      tips: 0,
      total: 0
    }));

    setSplitBills(newSplitBills);
    setSelectedSplitBill(newSplitBills[0]); // Select first split by default
    showSuccess(`Created ${numSplits} split bills successfully!`, 'success');
  };

  const handleAddItemToSplit = (itemId, splitBillId) => {
    const item = splitItems.find(item => item.id === itemId);
    if (!item) return;

    // Check if there's remaining quantity available
    const remainingQuantity = getRemainingQuantity(itemId);
    if (remainingQuantity <= 0) {
      showError('No more quantity available for this item');
      return;
    }

    // Add item to the selected split bill
    setSplitBills(prev => prev.map(split => {
      if (split.id === splitBillId) {
        const existingItem = split.items.find(i => i.food?.id === item.food?.id);
        if (existingItem) {
          // Increase quantity if item already exists
          return {
            ...split,
            items: split.items.map(i =>
              i.food.id === item.food.id
                ? { ...i, quantity: (i.quantity || 0) + 1, totalPrice: ((i.totalPrice || 0) / (i.quantity || 1)) * ((i.quantity || 0) + 1) }
                : i
            )
          };
        } else {
          // Add new item
          const newItem = { ...item, quantity: 1 };
          return {
            ...split,
            items: [...split.items, newItem]
          };
        }
      }
      return split;
    }));

    // Update split bill totals
    updateSplitBillTotals(splitBillId);
  };

  const handleRemoveItemFromSplit = (itemId, splitBillId) => {
    const item = splitItems.find(item => item.id === itemId);
    if (!item) return;

    // Remove item from the selected split bill
    setSplitBills(prev => prev.map(split => {
      if (split.id === splitBillId) {
        const existingItem = split.items.find(i => i.food?.id === item.food?.id);
        if (existingItem) {
          if (existingItem.quantity > 1) {
            // Decrease quantity if more than 1
            return {
              ...split,
              items: split.items.map(i =>
                i.food.id === item.food.id
                  ? { ...i, quantity: (i.quantity || 0) - 1, totalPrice: ((i.totalPrice || 0) / (i.quantity || 1)) * ((i.quantity || 0) - 1) }
                  : i
              )
            };
          } else {
            // Remove item completely if quantity is 1
            return {
              ...split,
              items: split.items.filter(i => i.food?.id !== item.food?.id)
            };
          }
        }
      }
      return split;
    }));

    // Update split bill totals
    updateSplitBillTotals(splitBillId);
  };

  const getItemQuantityInSplit = (itemId, splitBillId) => {
    const item = splitItems.find(item => item.id === itemId);
    if (!item) return 0;

    const splitBill = splitBills.find(split => split.id === splitBillId);
    if (!splitBill) return 0;

    const existingItem = splitBill.items.find(i => i.food?.id === item.food?.id);
    return existingItem ? (existingItem.quantity || 0) : 0;
  };

  const getRemainingQuantity = (itemId) => {
    const item = splitItems.find(item => item.id === itemId);
    if (!item) return 0;

    // Calculate total quantity used across all splits
    const totalUsed = splitBills.reduce((total, split) => {
      const existingItem = split.items.find(i => i.food?.id === item.food?.id);
      return total + (existingItem ? (existingItem.quantity || 0) : 0);
    }, 0);

    // Return remaining quantity
    return Math.max(0, (item.quantity || 0) - totalUsed);
  };

  const areAllItemsDistributed = () => {
    if (!splitItems || splitItems.length === 0) return false;

    // Check if all items have been fully distributed (remaining quantity = 0)
    return splitItems.every(item => getRemainingQuantity(item.id) === 0);
  };

  const updateSplitBillTotals = (splitBillId) => {
    setSplitBills(prev => prev.map(split => {
      if (split.id === splitBillId) {
        const subtotal = split.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const tax = subtotal * 0.13; // 13% tax
        const total = subtotal + tax + (split.charge || 0) + (split.tips || 0) - (split.discount || 0);

        return {
          ...split,
          subtotal,
          tax,
          total
        };
      }
      return split;
    }));
  };

  const handleSplitBillCustomerChange = (splitBillId, customer) => {
    setSplitBills(prev => prev.map(split =>
      split.id === splitBillId ? { ...split, customer } : split
    ));
  };

  const handleRemoveSplitBill = (splitBillId) => {
    setSplitBills(prev => prev.filter(split => split.id !== splitBillId));
    if (selectedSplitBill?.id === splitBillId) {
      setSelectedSplitBill(splitBills[0] || null);
    }
  };

  const handleAddDiscountToSplit = () => {
    if (!selectedSplitBill) {
      showError('Please select a split bill first');
      return;
    }

    setSplitBills(prev => prev.map(split => {
      if (split.id === selectedSplitBill.id) {
        return {
          ...split,
          discount: split.discount + 1
        };
      }
      return split;
    }));

    // Update split bill totals
    updateSplitBillTotals(selectedSplitBill.id);
    showSuccess('Discount added to selected split bill', 'success');
  };

  const handleAddChargeToSplit = () => {
    if (!selectedSplitBill) {
      showError('Please select a split bill first');
      return;
    }

    setSplitBills(prev => prev.map(split => {
      if (split.id === selectedSplitBill.id) {
        return {
          ...split,
          charge: split.charge + 1
        };
      }
      return split;
    }));

    // Update split bill totals
    updateSplitBillTotals(selectedSplitBill.id);
    showSuccess('Charge added to selected split bill', 'success');
  };

  const handleAddTipsToSplit = () => {
    if (!selectedSplitBill) {
      showError('Please select a split bill first');
      return;
    }

    setSplitBills(prev => prev.map(split => {
      if (split.id === selectedSplitBill.id) {
        return {
          ...split,
          tips: split.tips + 1
        };
      }
      return split;
    }));

    // Update split bill totals
    updateSplitBillTotals(selectedSplitBill.id);
    showSuccess('Tips added to selected split bill', 'success');
  };

  const getTotalDiscount = () => {
    return splitBills.reduce((total, split) => total + split.discount, 0);
  };

  const getTotalCharge = () => {
    return splitBills.reduce((total, split) => total + split.charge, 0);
  };

  const getTotalTips = () => {
    return splitBills.reduce((total, split) => total + split.tips, 0);
  };

  // Finalize Sale Helper Functions
  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showError('Please enter a valid payment amount');
      return;
    }

    const newPayment = {
      method: selectedPaymentMethod,
      amount: parseFloat(paymentAmount),
      timestamp: new Date().toISOString()
    };

    setAddedPayments(prev => [...prev, newPayment]);
    setPaymentAmount('');
    setGivenAmount('');
    setChangeAmount('');
  };

  const handleCashAmountChange = (value) => {
    setPaymentAmount(value);
    setGivenAmount(value);
    // Calculate change based on the split bill total
    if (value) {
      const splitBillTotal = calculateSplitBillTotal();
      const change = parseFloat(value) - splitBillTotal;
      setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
    } else {
      setChangeAmount('0.00');
    }
  };

  const handleQuickAmountClick = (amount) => {
    if (selectedPaymentMethod === 'Cash') {
      setPaymentAmount(amount);
      setGivenAmount(amount);
      // Calculate change based on the split bill total
      const splitBillTotal = calculateSplitBillTotal();
      const change = parseFloat(amount) - splitBillTotal;
      setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
    } else {
      setPaymentAmount(amount);
    }
  };

  const handleCashGivenAmountChange = (value) => {
    setGivenAmount(value);
    setPaymentAmount(value);
    // Calculate change based on the split bill total
    if (value) {
      const splitBillTotal = calculateSplitBillTotal();
      const change = parseFloat(value) - splitBillTotal;
      setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
    } else {
      setChangeAmount('0.00');
    }
  };

  const resetFinalizeSaleModal = () => {
    setSelectedPaymentMethod('Cash');
    setPaymentAmount('');
    setGivenAmount('');
    setChangeAmount('');
    setAddedPayments([]);
    setFinalizeDiscountAmount('');
    setSendSMS(false);
    setSelectedCurrency('EUR');
    setCurrencyAmount('');
    // Clear selectedSplitBill when not coming from split bill flow
    setSelectedSplitBill(null);
  };

  const resetFinalizeSaleModalForSplitBill = () => {
    setSelectedPaymentMethod('Cash');
    setPaymentAmount('');
    setGivenAmount('');
    setChangeAmount('');
    setAddedPayments([]);
    setFinalizeDiscountAmount('');
    setSendSMS(false);
    setSelectedCurrency('EUR');
    setCurrencyAmount('');
    // Don't clear selectedSplitBill - we want to keep it for split bill finalization
  };

  // Currency options
  const currencyOptions = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'US Dollar' }
  ];

  // Helper function to get current currency symbol
  const getCurrencySymbol = () => {
    const selectedCurrencyOption = currencyOptions.find(option => option.code === selectedCurrency);
    return selectedCurrencyOption ? selectedCurrencyOption.symbol : '€';
  };

  // Split Bill Finalize Sale Helper Functions
  const calculateSplitBillSubtotal = () => {
    console.log('calculateSplitBillSubtotal - selectedSplitBill:', selectedSplitBill);
    if (!selectedSplitBill) return 0;
    const subtotal = selectedSplitBill.subtotal || 0;
    console.log('calculateSplitBillSubtotal - returning:', subtotal);
    return subtotal;
  };

  const calculateSplitBillTax = () => {
    if (!selectedSplitBill) return 0;
    return selectedSplitBill.tax || 0;
  };

  const calculateSplitBillDiscount = () => {
    if (!selectedSplitBill) return 0;
    return selectedSplitBill.discount || 0;
  };

  const calculateSplitBillCharge = () => {
    if (!selectedSplitBill) return 0;
    return selectedSplitBill.charge || 0;
  };

  const calculateSplitBillTips = () => {
    if (!selectedSplitBill) return 0;
    return selectedSplitBill.tips || 0;
  };

  const calculateSplitBillTotal = () => {
    console.log('calculateSplitBillTotal - selectedSplitBill:', selectedSplitBill);
    if (!selectedSplitBill) return 0;
    const total = selectedSplitBill.total || 0;
    console.log('calculateSplitBillTotal - returning:', total);
    return total;
  };

  // Handle expanding/collapsing order details
  const handleToggleOrderExpansion = (orderId, event) => {
    event.stopPropagation(); // Prevent triggering the card click
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Handle opening status update modal
  const handleOpenStatusUpdateModal = (order, event) => {
    event.stopPropagation();
    setSelectedOrderForStatusUpdate(order);
    setSelectedStatus(order.status || 'New');
    setShowStatusUpdateModal(true);
  };

  // Handle updating order status
  const handleUpdateOrderStatus = () => {
    if (!selectedOrderForStatusUpdate) return;

    setPlacedOrders(prev => prev.map(order =>
      order.id === selectedOrderForStatusUpdate.id
        ? { ...order, status: selectedStatus }
        : order
    ));

    showSuccess(`Order status updated to ${selectedStatus}!`);
    setShowStatusUpdateModal(false);
    setSelectedOrderForStatusUpdate(null);
    setSelectedStatus('New');
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'New':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'Ready':
        return 'bg-blue-100 text-blue-700';
      case 'Completed':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  return (
    <>
      <div className="flex justify-between gap-2 h-full">
        <div className='flex w-[20%] flex-col bg-[#ffffff] border-r border-gray-200 shadow-lg rounded-xl pb-4'>
          {/* Main content row */}
          {/* Running Orders */}
          <div className="flex-1 flex flex-col overflow-y-auto p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Running Orders</h2>
              <button className="text-[#715af3] text-[11px] font-bold bg-white border border-gray-300 rounded-lg px-1.5 py-1.5 cursor-pointer hover:text-blue-800 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  name="runningOrdersSearchQuery"
                  placeholder="Search Orders"
                  value={runningOrdersSearchQuery}
                  onChange={(e) => setRunningOrdersSearchQuery(e.target.value)}
                  onFocus={(e) => handleAnyInputFocus(e, 'runningOrdersSearchQuery')}
                  onClick={(e) => handleAnyInputClick(e, 'runningOrdersSearchQuery')}
                  onBlur={(e) => handleCustomInputBlur(e, 'runningOrdersSearchQuery')}
                  className="w-full pl-8 text-xs font-semibold pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Placed Orders List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {placedOrders.length > 0 ? (
                placedOrders.map((order) => {
                  // Calculate time elapsed
                  const orderTime = new Date(order.placedAt);
                  const now = new Date();
                  const timeDiff = Math.floor((now - orderTime) / (1000 * 60)); // minutes
                  const timeAgo = timeDiff === 0 ? 'Just now' : `${timeDiff} min ago`;

                  // Get order type styling
                  const getOrderTypeStyle = (type) => {
                    switch (type) {
                      case 'Dine In':
                        return {
                          bgColor: 'bg-blue-100',
                          textColor: 'text-blue-700',
                          icon: <Utensils size={12} />
                        };
                      case 'Collection':
                        return {
                          bgColor: 'bg-orange-100',
                          textColor: 'text-orange-700',
                          icon: <ShoppingBag size={12} />
                        };
                      case 'Delivery':
                        return {
                          bgColor: 'bg-green-100',
                          textColor: 'text-green-700',
                          icon: <Truck size={12} />
                        };
                      case 'In Store':
                        return {
                          bgColor: 'bg-purple-100',
                          textColor: 'text-purple-700',
                          icon: <Printer size={12} />
                        };
                      default:
                        return {
                          bgColor: 'bg-gray-100',
                          textColor: 'text-gray-700',
                          icon: <Receipt size={12} />
                        };
                    }
                  };

                  const orderTypeStyle = getOrderTypeStyle(order.orderType);

                  return (
                    <div
                      key={order.id}
                      className={`relative bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedPlacedOrder?.id === order.id
                        ? 'border-blue-400 bg-blue-50 shadow-md'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => setSelectedPlacedOrder(order)}
                    >
                      {/* Dropdown arrow */}
                      <div
                        className="absolute top-4 right-3 cursor-pointer"
                        onClick={(e) => handleToggleOrderExpansion(order.id, e)}
                      >
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp size={20} className="text-blue-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>

                      {/* Order header */}
                      <div className={`flex items-start justify-between ${expandedOrders.has(order.id) ? 'bg-blue-50 p-3 border-b border-blue-200  -m-3 rounded-t-lg' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 text-sm">
                              #{order.orderNumber}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${orderTypeStyle.bgColor} ${orderTypeStyle.textColor}`}>
                              {orderTypeStyle.icon}
                              {order.orderType === 'Dine In' ? `${order.orderType} - ${order.table}` : order.orderType}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                              <p className="text-sm font-medium text-gray-800">
                                {order.customer.name}
                              </p>
                              <p className="text-xs text-gray-500">{timeAgo}</p>
                            </div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(order.status || 'New')}`}>
                              {order.status || 'NEW'}
                            </span>
                          </div>

                        </div>

                      </div>

                      {/* Expanded Order Details */}
                      {expandedOrders.has(order.id) && (
                        <div className=" pt-4 ">
                          {/* Order Items */}
                          <div className="space-y-2 mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Order Items:</h4>
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-800">{item.food.name}</span>
                                  <span className="text-blue-600 ml-2">x{item.quantity}</span>
                                </div>
                                <span className="font-medium text-gray-800">€{item.totalPrice.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Total Section */}
                          <div className="border-t border-gray-200 pt-2 mb-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-800">Total:</span>
                              <span className="text-lg font-bold text-gray-800">€{order.total.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              className="flex-1 bg-gray-600 text-white text-sm font-medium py-1.5 px-2 rounded-lg hover:bg-gray-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle view details
                                setSelectedPlacedOrder(order);
                              }}
                            >
                              View Details
                            </button>
                            <button
                              className="flex-1 bg-blue-600 text-white text-sm font-medium py-1.5 px-2 rounded-lg hover:bg-blue-700 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle mark as action
                                handleOpenStatusUpdateModal(order, e);
                              }}
                            >
                              Mark As
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">No orders placed</div>
                  <div className="text-gray-400 text-xs mt-2">Place orders to see them here</div>
                </div>
              )}
            </div>
          </div>
          {/* Order Action Buttons - Below Running Orders Box */}
          <div className="flex justify-center p-2">
            <div className="flex flex-col gap-2 text-[10px] w-full">
              {/* First Row - Bill and Invoice */}
              <div className="flex gap-2">
                <button className="flex-1 h-10 bg-[#010101] text-[13px] text-white font-bold rounded-lg px-3 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  <Receipt size={14} />
                  BILL
                </button>
                <button
                  data-invoice-button
                  onClick={() => setShowInvoiceOptions(!showInvoiceOptions)}
                  disabled={!selectedPlacedOrder}
                  className={`flex-1 h-10 text-[13px] font-bold rounded-lg px-3 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder ? 'bg-[#4d36eb] text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
                  <FileText size={14} />
                  INVOICE
                </button>
              </div>

              {/* Second Row - Order Details, Modify Order, Cancel */}
              <div className="flex gap-2">
                <button className="flex-1 text-[13px] h-10 bg-[#4d36eb] text-white font-bold rounded-lg px-3 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  <Eye size={14} />
                  ORDER DETAILS
                </button>
                <button className="flex-1 text-[13px] h-10 bg-[#f3be25] text-white font-bold rounded-lg px-3 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  <Edit size={14} />
                  MODIFY ORDER
                </button>
              </div>
                <button className="w-[70%] text-[13px] mx-auto h-10 bg-[#c81118] text-white font-bold rounded-lg px-3 cursor-pointer flex items-center justify-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  <X size={14} />
                  CANCEL
                </button>
            </div>
          </div>

          {/* Invoice Options Dropdown */}
          {showInvoiceOptions && selectedPlacedOrder && (
            <div data-invoice-options className="absolute bottom-23 left-1/2 transform -translate-x-7 bg-gray-200 rounded-lg p-2 shadow-lg z-10">
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleOpenSplitBillModal}
                  className="w-32 bg-gray-300 text-black font-medium rounded px-3 py-2 text-center hover:bg-gray-400 transition-colors text-xs">
                  Split Bill
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="w-[40%] bg-white flex flex-col shadow-lg rounded-xl overflow-hidden">
          {/* Search and categories section */}
          <div className="py-3 px-2 border-b border-gray-200">
            {/* Search bar */}
            {/* <div className="relative mb-4 w-full">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <input
                type="text"
                name="searchQuery"
                placeholder="Search Food Items"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={(e) => handleAnyInputFocus(e, 'searchQuery')}
                onClick={(e) => handleAnyInputClick(e, 'searchQuery')}
                onBlur={(e) => handleCustomInputBlur(e, 'searchQuery')}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white placeholder:text-primary font-semibold border border-gray-300 rounded-xl z-10
      shadow-[0_6px_12px_-2px_rgba(50,50,93,0.25),0_3px_7px_-3px_rgba(0,0,0,0.3)]
      focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>
            {debouncedSearchQuery && (
              <div className="mb-2 text-xs text-gray-600">
                Found {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} for "{debouncedSearchQuery}"
              </div>
            )} */}
            <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">
                
                <span className="font-semibold text-gray-800 text-[16px]">🍽 Food &amp; Categories</span>
              </div>
              <button
                onClick={handleOpenSplitPizzaModal}
                className="bg-[#e53943] hover:bg-[#c62836] cursor-pointer text-white font-medium rounded-lg px-5 py-2 text-sm transition-colors"
              >
                Create Your Own
              </button>
            </div>
            {/* Category buttons */}
            <div className="flex flex-wrap gap-1.5">
              {loading ? (
                <div className="text-gray-500 text-sm">Loading categories...</div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    className={`{h-9 px-3 text-black text-[14px] flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer bg-primary  ${selectedCategory?.id === category.id ? 'bg-white text-black' : 'text-white'
                      }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category.name}
                  </button>
                ))
              ) : (
                <div className="text-gray-500 text-sm">No categories found</div>
              )}
              
            </div>
          </div>

          {/* Menu items section */}
          <div className="flex-1 overflow-y-auto">
            <MenuGrid />
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-[40%] bg-white rounded-lg flex flex-col">
          <div className="grid grid-cols-5 gap-2 px-2 py-2 flex-shrink-0">
            {/* Tabs row */}
            <button
              onClick={() => setSelectedOrderType('In Store')}
              className={`h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer ${selectedOrderType === 'In Store' ? 'bg-primary text-white' : 'bg-white hover:border-primary hover:border-2'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              </svg>
              In Store
            </button>
            <button
              onClick={() => {
                setSelectedOrderType('Table');
                setShowTableModal(true);
              }}
              className={`h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer ${selectedOrderType === 'Table' ? 'bg-primary text-white' : 'bg-white hover:border-primary hover:border-2'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              </svg>
              Table
            </button>
            <button
              onClick={() => setSelectedOrderType('Collection')}
              className={`h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer ${selectedOrderType === 'Collection' ? 'bg-primary text-white' : 'bg-white hover:border-primary hover:border-2'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              Collection
            </button>
            <button
              onClick={() => setSelectedOrderType('Delivery')}
              className={`h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer ${selectedOrderType === 'Delivery' ? 'bg-primary text-white' : 'bg-white hover:border-primary hover:border-2'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
              </svg>
              Delivery
            </button>
            <button className="h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer hover:border-primary hover:border-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
              </svg>
              Status
            </button>
            {/* Status section */}

            <button className="h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer hover:border-primary hover:border-2">
              <Clock size={14} />
              Due to
            </button>
            <button
              onClick={() => setShowCustomerSearchModal(true)}
              className="h-9 px-2 bg-primary text-white text-[13px] rounded flex items-center justify-center gap-1 
                     btn-lifted hover:bg-primary/90 transition-colors cursor-pointer">
              <Users2 size={12} />
              Customer
            </button>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="h-9 px-2 text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer hover:border-primary hover:border-2">
              {selectedCustomer ? selectedCustomer.name : 'Walk in Customer'}
            </button>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="h-9 px-2 text-black text-[13px] rounded flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer hover:border-primary hover:border-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              New Customer
            </button>

            <button
              onClick={handleOpenEditModal}
              disabled={!selectedCustomer}
              className={`h-9 px-2 btn-lifted flex items-center justify-center gap-1 bg-primary text-white text-[13px] rounded transition-colors cursor-pointer ${selectedCustomer
                ? 'hover:text-green-800 cursor-pointer'
                : 'cursor-not-allowed'
                }`}>
              <Edit size={17} />
              Edit
            </button>

          </div>

          {/* Items table */}
          {/* Items table header */}
          <div className='bg-white flex flex-col mb-2 rounded-lg p-2 flex-1'>
            <div className="mt-3 border border-gray-200 rounded-lg flex flex-col flex-1 min-h-0">
              <table className="w-full flex flex-col h-full">
                <thead className='bg-gray-100 flex-shrink-0'>
                  <tr className="grid grid-cols-[auto_100px_100px_100px] gap-2 text-sm font-medium text-gray-700 p-3">
                    {/* <th className="text-center w-8">Edit</th> */}
                    <th className="text-left">Items</th>
                    <th className="text-center">Qty</th>
                    {/* <th className="text-center">Price</th> */}
                    <th className="text-center">Total</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white flex-1 overflow-y-auto">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <tr key={item.id} className="grid grid-cols-[auto_100px_100px_100px] gap-2 items-center text-sm p-2 border-b border-gray-200">
                        
                        <td className="text-gray-800 text-sm truncate">
                          <span>{item.food.name}</span>
                        </td>
                        {/* <td className="text-gray-800 text-center">€{(item.totalPrice / item.quantity).toFixed(2)}</td> */}
                        <td className="flex items-center justify-center">
                          <div className="flex items-center rounded">
                            <button
                              className="text-primary flex items-center cursor-pointer justify-center transition-colors"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus size={15} />
                            </button>
                            <span className="w-8 text-center text-gray-800 py-1 text-sm">{item.quantity}</span>
                            <button
                              className="flex items-center cursor-pointer justify-center text-primary transition-colors"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                        </td>
                        <td className='flex items-center justify-center'>
                          <span className="text-gray-800">€{item.totalPrice.toFixed(2)}</span>
                        </td>
                        <td className="flex items-center justify-center gap-2">
                          <Edit2
                            size={15}
                            className="text-primary cursor-pointer hover:text-primary-dark transition-colors"
                            onClick={() => handleEditCartItem(item)}
                            title="Edit item"
                          />
                          <Trash2
                            size={16}
                            className="text-[#c81118] mt-0.5 cursor-pointer"
                            onClick={() => removeCartItem(item.id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="grid grid-cols-[auto_1fr_80px_80px_100px] gap-2 items-center text-sm p-4">
                      <td colSpan="5" className="text-center text-gray-500">
                        {/* No items in cart */}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Summary section */}
            <div className='bg-white mt-5 w-[100%] rounded-lg'>
              <div className=" mx-auto">
                <div className="grid grid-cols-4 place-content-center text-xs mb-4 text-center">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">Tax</span>
                  <span className="font-medium">Discount</span>
                  <span className="font-medium">DIY.CHARGE</span>
                </div>
                <div className="grid grid-cols-4 gap-2 place-content-center text-sm mb-4 text-center font-medium">
                  <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto ">
                    €{calculateCartSubtotal().toFixed(2)}
                  </div>
                  <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto">
                    €{calculateCartTax().toFixed(2)}
                  </div>
                  <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto text-red-500">
                    €{calculateCartDiscount().toFixed(2)}
                  </div>
                  <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto">
                    €0.00
                  </div>
                </div>
              </div>
              {/* Total Payable */}
              <div className='flex justify-center items-center'>
                <div
                  className="bg-[#d3D3D3] px-4 py-2 btn-lifted cursor-pointer w-[70%] rounded flex items-center justify-center mb-4 hover:bg-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye size={14} />
                    <span className="text-gray-800 font-medium">Total Payable : €{calculateCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex gap-2 justify-center pb-2">
                {/* <button
                  onClick={handleOpenCouponModal}
                  className="bg-[#43a148] text-white  btn-lifted py-1.5 px-1 w-[100%]  text-[11px] font-bold rounded  hover:bg-green-600"
                >
                  DISCOUNT
                </button> */}
                <button
                  onClick={() => {
                    if (cartItems.length === 0) {
                      showError('Cart is already empty');
                      return;
                    }

                    setShowDeleteCartModal(true);
                  }}
                  disabled={cartItems.length === 0}
                  className={`bg-red-700 text-white  w-[100%] btn-lifted py-2 px-1  text-[13px] font-bold rounded  ${cartItems.length > 0
                      ? 'bg-[#c81118] hover:bg-red-700 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                    }`}>
                  {/* <Trash2 size={17} /> */}
                  Delete
                </button>
                <button className="bg-[#5A32A3] text-white  w-[100%] btn-lifted py-2 px-1  text-[13px] font-bold rounded">
                  DRAFT
                </button>
                <button className="bg-[#3db4e4] text-white  w-[100%] btn-lifted py-2 px-1  text-[13px] font-bold rounded cursor-pointer">
                  KOT
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="bg-[#fb8b02] text-white  w-[100%] btn-lifted py-2 px-1 text-[13px] font-bold rounded  cursor-pointer"
                >
                  PLACE ORDER
                </button>
                <button
                  onClick={handlePayment}
                  className="bg-[#f42cef] text-white  w-[100%] btn-lifted py-2 px-1 text-[13px] font-bold rounded cursor-pointer"
                >
                  PAY
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Customer Management Modal */}
        <CustomerManagement
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onCustomerSelect={handleCustomerSelect}
        />

        {/* Customer Search Modal */}
        <CustomerSearchModal
          isOpen={showCustomerSearchModal}
          onClose={() => setShowCustomerSearchModal(false)}
          onCustomerSelect={handleCustomerSelect}
        />

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <CustomerManagement
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onCustomerSelect={handleEditCustomer}
            editingCustomer={selectedCustomer}
          />
        )}

        {/* Split Bill Modal */}
        {showSplitBillModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-8xl h-[95vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold">Split Bill</h2>
                <button
                  onClick={handleCloseSplitBillModal}
                  className="text-red-500 hover:text-red-300 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  X Cancel
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Section - Order Items */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>

                    {/* Items Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="text-sm font-medium text-gray-700">
                            <th className="px-3 py-2 text-left">Item Name</th>
                            <th className="px-3 py-2 text-center">Price</th>
                            <th className="px-3 py-2 text-center">Qty</th>
                            <th className="px-3 py-2 text-center">Dis.</th>
                            <th className="px-3 py-2 text-center">Total</th>
                            <th className="px-3 py-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {splitItems.map((item) => (
                            <tr key={item.id} className="border-t border-gray-100">
                              <td className="px-3 py-2 text-sm text-gray-800">
                                <span className="truncate">{item.food.name}</span>
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-600">
                                €{(item.totalPrice / item.quantity).toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-600">
                                {getRemainingQuantity(item.id)}
                              </td>
                              <td className="px-3 py-2 text-sm text-center text-gray-600">
                                €0.00
                              </td>
                              <td className="px-3 py-2 text-sm text-center font-medium text-gray-800">
                                €{item.totalPrice.toFixed(2)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleRemoveItemFromSplit(item.id, selectedSplitBill?.id)}
                                    disabled={!selectedSplitBill || getItemQuantityInSplit(item.id, selectedSplitBill?.id) === 0}
                                    className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${selectedSplitBill && getItemQuantityInSplit(item.id, selectedSplitBill?.id) > 0
                                      ? 'bg-red-500 text-white hover:bg-red-600'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      }`}
                                    title="Remove from selected split"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleAddItemToSplit(item.id, selectedSplitBill?.id)}
                                    disabled={!selectedSplitBill || getRemainingQuantity(item.id) <= 0}
                                    className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${selectedSplitBill && getRemainingQuantity(item.id) > 0
                                      ? 'bg-green-500 text-white hover:bg-green-600'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      }`}
                                    title="Add to selected split"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Section */}

                    <div className="border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Total Items:</span>
                        <span className="text-sm font-bold text-gray-800">{splitItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Sub Total:</span>
                        <span className="text-sm font-bold text-gray-800">€{selectedPlacedOrder ? (selectedPlacedOrder.total / 1.13).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-800">Tax:</span>
                        <span className="text-sm font-bold text-gray-800">€{selectedPlacedOrder ? ((selectedPlacedOrder.total / 1.13) * 0.13).toFixed(2) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total Payable:</span>
                        <span className="text-lg font-bold text-primary">€{selectedPlacedOrder ? selectedPlacedOrder.total.toFixed(2) : '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Split Bills */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Split Bills</h3>

                    {/* Split Creation */}
                    {splitBills.length === 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-800 font-medium mb-2">
                          Maximum Split(s): {calculateMaxSplits()}
                          {calculateMaxSplits() < 10 && (
                            <span className="text-xs text-blue-600 block mt-1">
                              (Based on total quantity: {splitItems.reduce((sum, item) => sum + item.quantity, 0)} items)
                            </span>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Split
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="1"
                                max={calculateMaxSplits()}
                                value={totalSplit}
                                onChange={(e) => setTotalSplit(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (totalSplit && parseInt(totalSplit) > 0 && parseInt(totalSplit) <= calculateMaxSplits()) {
                                      handleSplitGo();
                                    }
                                  }
                                }}
                                placeholder="Enter number of splits"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                              />
                              <button
                                onClick={handleSplitGo}
                                disabled={!totalSplit || parseInt(totalSplit) <= 0 || parseInt(totalSplit) > calculateMaxSplits()}
                                className={`px-6 py-2 font-medium rounded-lg transition-colors ${totalSplit && parseInt(totalSplit) > 0 && parseInt(totalSplit) <= calculateMaxSplits()
                                  ? 'bg-primary text-white hover:bg-primary/90'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Split Bills Display */}
                    {splitBills.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {splitBills.map((splitBill) => (
                          <div
                            key={splitBill.id}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedSplitBill?.id === splitBill.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                            onClick={() => setSelectedSplitBill(splitBill)}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-800">
                                  Split Bill {splitBill.id}
                                </span>
                                {selectedSplitBill?.id === splitBill.id && (
                                  <CheckCircle size={16} className="text-green-600" />
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveSplitBill(splitBill.id);
                                }}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            {/* Customer Selection */}
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Customer:</label>
                              <select
                                value={splitBill.customer}
                                onChange={(e) => handleSplitBillCustomerChange(splitBill.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="Walk-in Customer">Walk-in Customer</option>
                                <option value="Dona M. Leighty 408-230-51">Dona M. Leighty 408-230-51</option>
                                <option value="Donld PB 432226663">Donld PB 432226663</option>
                                <option value="Gustavo J. Weitz 256-537-96">Gustavo J. Weitz 256-537-96</option>
                                <option value="Mr Joe 231654849">Mr Joe 231654849</option>
                                <option value="Mr. Heri 523154215">Mr. Heri 523154215</option>
                                <option value="John Smith 555-1234">John Smith 555-1234</option>
                                <option value="Jane Doe 555-5678">Jane Doe 555-5678</option>
                                <option value="Mike Johnson 555-9012">Mike Johnson 555-9012</option>
                                <option value="Sarah Wilson 555-3456">Sarah Wilson 555-3456</option>
                              </select>
                            </div>

                            {/* Items */}
                            {/* <div className="mb-3">
                              <div className="text-xs font-medium text-gray-700 mb-2">Items:</div>
                              {splitBill.items.length > 0 ? (
                                <div className="space-y-1">
                                  {splitBill.items.map((item, index) => (
                                    <div key={index} className="text-xs text-gray-600 flex justify-between">
                                      <span className="truncate">{item.food?.name || 'Unknown Item'}</span>
                                      <span>Qty: {item.quantity || 0}, €{(item.totalPrice || 0).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">No items added</div>
                      )}
                    </div> */}

                            {/* Summary */}
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Sub Total:</span>
                                <span>€{(splitBill.subtotal || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Disc Amt(%):</span>
                                <span>€{(splitBill.discount || 0).toFixed(2)}X</span>
                              </div>
                              <div className="flex justify-between font-bold border-t border-gray-200 pt-1">
                                <span>Total Payable:</span>
                                <span>€{(splitBill.total || 0).toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                              disabled={!areAllItemsDistributed()}
                              className={`w-full mt-3 text-xs font-medium py-2 px-3 rounded transition-colors ${areAllItemsDistributed()
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (areAllItemsDistributed()) {
                                  // Set the current split bill for finalization
                                  console.log('Setting selectedSplitBill:', splitBill);
                                  setSelectedSplitBill(splitBill);
                                  // Reset modal state and open the Finalize Sale Modal
                                  resetFinalizeSaleModalForSplitBill();
                                  setShowFinalizeSaleModal(true);
                                }
                              }}
                            >
                              Checkout
                            </button>
                            {!areAllItemsDistributed() && (
                              <div className="text-xs text-gray-500 mt-1 text-center">
                                All items must be distributed before checkout
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Split Pizza Modal */}
        {showSplitPizzaModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold">Split Pizza</h2>
                <button
                  onClick={handleCloseSplitPizzaModal}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Top Section - Order Details */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Type:</label>
                    <div className="bg-gray-100 rounded-lg px-3 py-2 text-center">
                      <span className="text-sm font-medium text-gray-800">Pizza</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size:</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm">
                      <option value="12">12"</option>
                      <option value="14">14"</option>
                      <option value="16">16"</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. of Splits:</label>
                    <select 
                        value={pizzaSlices}
                        onChange={handlePizzaSlicesChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price:</label>
                    <div className="flex items-center">
                      <input 
                        type="text" 
                        value={pizzaPrice}
                        onChange={(e) => setPizzaPrice(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        placeholder="0.00"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-800">€</span>
                    </div>
                  </div>
                    </div>

                {/* Middle Section - Pizza Visualization & Flavor Selection */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  {/* Left Panel - Pizza Visualization */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Pizza Visualization</h3>
                    <div className="flex justify-center">
                      <div className="relative">
                        <svg width="280" height="280" viewBox="0 0 200 200">
                          {/* Pizza slices */}
                          {renderPizzaSlices()}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Select Flavors */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Flavors</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {Array.from({ length: pizzaSlices }, (_, index) => (
                        <div key={index}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {index === 0 ? 'First' : index === 1 ? 'Second' : index === 2 ? 'Third' : index === 3 ? 'Fourth' : 
                             index === 4 ? 'Fifth' : index === 5 ? 'Sixth' : index === 6 ? 'Seventh' : index === 7 ? 'Eighth' :
                             index === 8 ? 'Ninth' : index === 9 ? 'Tenth' : index === 10 ? 'Eleventh' : index === 11 ? 'Twelfth' :
                             index === 12 ? 'Thirteenth' : index === 13 ? 'Fourteenth' : index === 14 ? 'Fifteenth' : 'Sixteenth'} Half:
                      </label>
                          <select 
                            value={selectedFlavors[index] || ''}
                            onChange={(e) => handleFlavorChange(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm ${index === 1 ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Select flavor...</option>
                            <option value="margherita">Margherita</option>
                            <option value="pepperoni">Pepperoni</option>
                            <option value="hawaiian">Hawaiian</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="bbq-chicken">BBQ Chicken</option>
                            <option value="meat-lovers">Meat Lovers</option>
                            <option value="supreme">Supreme</option>
                            <option value="buffalo-chicken">Buffalo Chicken</option>
                          </select>
                      </div>
                      ))}
                    </div>
                    <div className='mt-4'>
                  <div className="flex flex-wrap gap-2">
                    {currentIngredients.length > 0 ? (
                      currentIngredients.map((ingredient) => (
                        <button
                          key={ingredient}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 hover:bg-primary/90"
                            >
                              <span>{ingredient}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCurrentIngredient(ingredient);
                                }}
                                className="w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                title={`Remove ${ingredient}`}
                              >
                                <X size={12} className="text-white" />
                              </button>
                        </button>
                      ))
                    ) : (
                      <div className="text-gray-500 text-sm italic">
                        Select flavors from the dropdowns above to see available ingredients
                      </div>
                    )}
                  </div>
                  {currentIngredients.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">
                      Showing ingredients from {Object.values(selectedFlavors).filter(f => f).length} selected flavor(s)
                    </div>
                  )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="customPizzaNote" className="block text-sm font-medium text-gray-700 mb-1">
                    Add a custom note (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="customPizzaNote"
                      name="customPizzaNote"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="E.g. No onions, extra cheese..."
                      value={pizzaNote || ''}
                      onChange={e => setPizzaNote(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddCustomNote();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddCustomNote}
                      disabled={!pizzaNote.trim()}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        pizzaNote.trim() 
                          ? 'bg-primary text-white hover:bg-primary/90' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t border-gray-200">
                          <button
                            onClick={handleCloseSplitPizzaModal}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCloseSplitPizzaModal}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Order
                          </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Management Modal */}
        {showTableModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold">Table Selection</h2>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className='flex gap-6'>
                  {/* Floor Selection */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Floor</h3>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {floorsLoading ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm">Loading floors...</div>
                        </div>
                      ) : floors && floors.length > 0 ? (
                        floors.map((floor) => (
                          <button
                            key={floor.id}
                            onClick={() => handleFloorSelect(floor)}
                            className={`px-4 py-3 text-left rounded-lg transition-colors border ${selectedFloor === floor.name
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                              }`}
                          >
                            <div className="font-medium">{floor.name}</div>
                            <div className="text-sm opacity-75">{floor.type}</div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm">No floors found</div>
                          <div className="text-gray-400 text-xs mt-2 mb-4">Please add floors to the database</div>
                          <button
                            onClick={addSampleData}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                          >
                            Add Sample Data
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdowns Section */}
                  <div className="flex-1 grid grid-cols-1 gap-4">
                    {/* Table Selection Dropdown */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${selectedFloor ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                        Select Table
                      </label>
                      <select
                        value={selectedTable}
                        onChange={(e) => handleTableSelect(e.target.value)}
                        disabled={!selectedFloor}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${selectedFloor
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <option value="">Choose a table...</option>
                        {tablesLoading ? (
                          <option value="" disabled>Loading tables...</option>
                        ) : tables.length > 0 ? (
                          tables.map((table) => (
                            <option key={table.id} value={table.id}>
                              Table {table.table_no} ({table.seat_capacity || 4} seats)
                            </option>
                          ))
                        ) : selectedFloor ? (
                          <option value="" disabled>No available tables</option>
                        ) : (
                          <option value="" disabled>Select a floor first</option>
                        )}
                      </select>
                    </div>

                    {/* Persons Selection Dropdown */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${selectedTable ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                        Persons
                      </label>
                      <select
                        value={selectedPersons}
                        onChange={(e) => handlePersonsSelect(e.target.value)}
                        disabled={!selectedTable}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${selectedTable
                          ? 'border-gray-300 bg-white'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <option value="">Select number of persons...</option>
                        {getSeatCapacityOptions().map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Person' : 'Persons'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 flex-shrink-0">
                  <button
                    disabled={!selectedFloor}
                    onClick={handleMergeTableClick}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedFloor
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                      <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                      <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                      <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                    </svg>
                    Merge Table
                  </button>
                  <button
                    disabled={!selectedPersons}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${selectedPersons
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17,21 17,13 7,13 7,21"></polyline>
                      <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Merge Table Modal */}
        {showMergeTableModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex items-center rounded-t-xl relative flex-shrink-0">
                <button
                  onClick={handleBackToTableSelection}
                  className="text-white cursor-pointer p-1 rounded-full flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                </button>
                <h2 className="text-xl font-bold absolute left-1/2 transform -translate-x-1/2">Merge Tables</h2>
                <button
                  onClick={() => {
                    setShowMergeTableModal(false);
                    // Reset merge table selections when closing modal
                    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
                  }}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 ml-auto"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                <div className='flex gap-6'>
                  {/* Floor Selection */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Floor</h3>
                    <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                      {floorsLoading ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm">Loading floors...</div>
                        </div>
                      ) : floors.length > 0 ? (
                        floors.map((floor) => (
                          <button
                            key={floor.id}
                            onClick={() => handleFloorSelect(floor)}
                            className={`px-4 py-3 text-left rounded-lg transition-colors border ${selectedFloor === floor.name
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                              }`}
                          >
                            <div className="font-medium">{floor.name}</div>
                            <div className="text-sm opacity-75">{floor.type}</div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm">No floors found</div>
                          <div className="text-gray-400 text-xs mt-2 mb-4">Please add floors to the database</div>
                          <button
                            onClick={addSampleData}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                          >
                            Add Sample Data
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Merge Tables Section */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Tables to Merge</h3>
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {mergeTableSelections.map((selection, index) => (
                        <div key={selection.id} className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className={`block text-sm font-medium mb-2 ${selectedFloor ? 'text-gray-700' : 'text-gray-400'
                              }`}>
                              Select Table {index + 1}
                            </label>
                            <select
                              value={selection.tableId}
                              onChange={(e) => handleMergeTableSelectionChange(selection.id, e.target.value)}
                              disabled={!selectedFloor}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${selectedFloor
                                ? 'border-gray-300 bg-white'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                              <option value="">Choose table {index + 1}...</option>
                              {tablesLoading ? (
                                <option value="" disabled>Loading tables...</option>
                              ) : tables.length > 0 ? (
                                getAvailableTablesForSelection(selection.id).map((table) => (
                                  <option key={table.id} value={table.id}>
                                    Table {table.table_no} ({table.seat_capacity || 4} seats)
                                  </option>
                                ))
                              ) : selectedFloor ? (
                                <option value="" disabled>No available tables</option>
                              ) : (
                                <option value="" disabled>Select a floor first</option>
                              )}
                            </select>
                          </div>
                          {mergeTableSelections.length > 2 && (
                            <button
                              onClick={() => handleRemoveTableSelection(selection.id)}
                              className="mt-6 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove table selection"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add More Button */}
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleAddMoreTableSelection}
                        disabled={isAddMoreDisabled()}
                        className={`w-fit px-4 py-2 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${isAddMoreDisabled()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                      >
                        <Plus size={16} />
                        Add More
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => {
                      setShowMergeTableModal(false);
                      // Reset merge table selections when closing modal
                      setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
                    }}
                    className="px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={mergeTableSelections.filter(s => s.tableId).length < 2}
                    className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${mergeTableSelections.filter(s => s.tableId).length >= 2
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17,21 17,13 7,13 7,21"></polyline>
                      <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Customer Confirmation Modal */}
        {showDeleteConfirm && selectedCustomer && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="bg-red-500 text-white p-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-xl font-bold">Delete Customer</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-white hover:text-red-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete this customer? This action cannot be undone.
                </p>
                <p className="text-sm text-gray-600 mb-6">
                  Customer: <strong>{selectedCustomer.name}</strong>
                </p>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Food Details Modal */}
        {console.log('Modal render check:', { showFoodModal, selectedFood: !!selectedFood })}
        {showFoodModal && selectedFood && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold">
                  {editingCartItem ? 'Edit Food Item' : 'Food Details'}
                </h2>
                <button
                  onClick={() => {
                    setShowFoodModal(false);
                    setSelectedFood(null);
                    setSelectedVariations({});
                    setFoodQuantity(1); // Reset quantity
                    setEditingCartItem(null); // Reset editing state
                  }}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                {/* Food Header Section */}
                <div className="mb-6">
                  {editingCartItem && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        ✏️ Editing item: {editingCartItem.food.name}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    {/* Food Image and Info */}
                    {/* Food Image */}
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 mb-3">
                        <FoodImageDisplay food={selectedFood} />
                      </div>
                      {/* Food Name and Description */}
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedFood.name}</h3>
                        {selectedFood.description && (
                          <p className="text-sm text-gray-600">{selectedFood.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Food Price */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">€{selectedFood.price?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                </div>

                {/* Select Variation Section */}
                {foodDetailsLoading ? (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Edit2 size={18} className="text-primary" />
                      Select Variation
                    </h4>
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-sm">Loading variations...</div>
                    </div>
                  </div>
                ) : foodDetails?.variations && foodDetails.variations.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Edit2 size={18} className="text-primary" />
                      Select Variation
                    </h4>
                    <div className="space-y-4">
                      {foodDetails.variations.map((variation) => (
                        <div key={variation.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-800">{variation.name}</h5>
                            <div className="flex items-center gap-2">
                              {variation.is_required && (
                                <span className="text-xs text-red-600 font-medium">Required</span>
                              )}
                              <span className="text-xs text-gray-500">
                                {variation.type === 'multiple' ? 'Multiple' : 'Single'}
                              </span>
                            </div>
                          </div>

                          {/* Show min/max constraints */}
                          {(variation.min || variation.max) && (
                            <div className="mb-3 text-xs text-gray-600">
                              {variation.min && variation.max && (
                                <span>Select {variation.min} to {variation.max} options</span>
                              )}
                              {variation.min && !variation.max && (
                                <span>Select at least {variation.min} option{variation.min > 1 ? 's' : ''}</span>
                              )}
                              {!variation.min && variation.max && (
                                <span>Select up to {variation.max} option{variation.max > 1 ? 's' : ''}</span>
                              )}
                            </div>
                          )}

                          <div className="space-y-2">
                            {variation.options?.map((option) => {
                              const isSelected = variation.type === 'multiple'
                                ? selectedVariations[variation.id]?.includes(option.id)
                                : selectedVariations[variation.id] === option.id;

                              return (
                                <button
                                  key={option.id}
                                  onClick={() => handleVariationSelect(variation.id, option.id)}
                                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                      ? 'border-primary bg-primary'
                                      : 'border-gray-300'
                                      }`}>
                                      {isSelected && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                      )}
                                    </div>
                                    <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'
                                      }`}>
                                      {option.option_name}
                                    </span>
                                  </div>
                                  <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-600'
                                    }`}>
                                    {option.option_price > 0 ? `+€${option.option_price.toFixed(2)}` : 'Free'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Show validation messages */}
                          {(() => {
                            const selectedOptions = selectedVariations[variation.id];
                            const selectionCount = selectedOptions ? (Array.isArray(selectedOptions) ? selectedOptions.length : 1) : 0;
                            const messages = [];

                            if (variation.is_required && !selectedOptions) {
                              messages.push(`Required: ${variation.name}`);
                            }

                            if (selectedOptions) {
                              if (variation.min && selectionCount < variation.min) {
                                messages.push(`Minimum selection: ${variation.min}`);
                              }

                              if (variation.max && selectionCount > variation.max) {
                                messages.push(`Maximum selection: ${variation.max}`);
                              }
                            }

                            return messages.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                {messages.map((message, index) => (
                                  <div key={index} className="text-xs text-red-600">
                                    {message}
                                  </div>
                                ))}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Select Add on Section */}
                {foodDetailsLoading ? (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Plus size={18} className="text-primary" />
                      Select Add on
                    </h4>
                    <div className="text-center py-8">
                      <div className="text-gray-500 text-sm">Loading addons...</div>
                    </div>
                  </div>
                ) : foodDetails?.adons && foodDetails.adons.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Plus size={18} className="text-primary" />
                      Select Add on
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="space-y-2">
                        {foodDetails.adons.map((adon) => {
                          const isSelected = selectedAdons.includes(adon.id);
                          return (
                            <button
                              key={adon.id}
                              onClick={() => handleAdonSelect(adon.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${isSelected
                                ? 'bg-primary/10 border-primary'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-gray-300'
                                  }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-primary' : 'text-gray-700'
                                  }`}>
                                  {adon.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-600'
                                }`}>
                                +€{adon.price.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Total Price Display */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold text-gray-800">Total Price:</span>
                    <span className="text-2xl font-bold text-primary">€{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Fixed Bottom Section */}
              <div className="border-t border-gray-200 p-6 bg-white rounded-b-xl flex-shrink-0">
                <div className="flex gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white">
                    <button
                      onClick={handleQuantityDecrease}
                      disabled={foodQuantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center text-gray-800 font-medium text-lg">
                      {foodQuantity}
                    </span>
                    <button
                      onClick={handleQuantityIncrease}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={!validateVariationSelections()}
                    className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${validateVariationSelections()
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <ShoppingCart size={18} />
                    {editingCartItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Modal */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl min-w-[800px] max-h-[90vh]">
              {/* Header */}
              <div className="bg-white text-black p-3 flex justify-between items-center rounded-t-xl border-b border-gray-200">
                <h2 className="text-xl font-bold">Coupons & Offers</h2>
                <button
                  onClick={handleCloseCouponModal}
                  className="text-black hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex gap-4 overflow-y-auto max-h-[80vh]">
                <div className="">
                  {/* Discount Amount and Type Section */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-800">Manual Discount</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Discount Type
                            </label>
                            <select
                              name="discountType"
                              value={discountType}
                              onChange={(e) => setDiscountType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            >
                              <option value="percentage">Percentage (%)</option>
                              <option value="fixed">Fixed Amount (€)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Disc. Amount
                            </label>
                            <input
                              type="number"
                              name="discountAmount"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(e.target.value)}
                              onFocus={(e) => handleNumericInputFocus(e, 'discountAmount', discountAmount)}
                              onClick={(e) => handleNumericInputFocus(e, 'discountAmount', discountAmount)}
                              onBlur={(e) => {
                                // Save the current keyboard input to the discount amount state
                                if (numericActiveInput === 'discountAmount' && numericKeyboardInput !== undefined) {
                                  setDiscountAmount(numericKeyboardInput);
                                }
                                // Clear the active input
                                setNumericActiveInput('');
                              }}
                              onInput={(e) => {
                                // Update both the field value and keyboard input immediately
                                const value = e.target.value;
                                setDiscountAmount(value);
                                if (numericActiveInput === 'discountAmount') {
                                  setNumericKeyboardInput(value);
                                }
                              }}
                              min="0"
                              step="0.01"
                              placeholder={discountType === 'percentage' ? '20' : '10'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            />
                          </div>
                        </div>
                        {discountAmount && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ Manual discount of {discountAmount}{discountType === 'percentage' ? '%' : '€'} is ready to apply.
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={handleApplyManualDiscount}
                            disabled={!discountAmount || parseFloat(discountAmount) <= 0}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium ${discountAmount && parseFloat(discountAmount) > 0
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            Apply Manual Discount
                          </button>
                        </div>
                        {/* Enter Coupon Code Section */}
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Gift className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-800">Enter Coupon Code</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="couponCode"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              onFocus={(e) => handleAnyInputFocus(e, 'couponCode')}
                              onClick={(e) => handleAnyInputClick(e, 'couponCode')}
                              onBlur={(e) => handleCustomInputBlur(e, 'couponCode')}
                              placeholder="Enter promo code or click a coupon below"
                              className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${couponCode.trim()
                                ? 'border-green-400 focus:ring-green-500 focus:ring-green-500 bg-green-50'
                                : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                                }`}
                              onKeyUp={(e) => {
                                if (e.key === 'Enter') {
                                  handleApplyCoupon();
                                }
                              }}
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={!couponCode.trim()}
                              className={`px-4 py-2 rounded-lg transition-colors font-medium ${couponCode.trim()
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                              Apply
                            </button>
                          </div>
                          {couponCode.trim() && (
                            <div className="mt-2 text-sm text-green-600">
                              ✓ Coupon code "{couponCode}" is ready to apply. Click "Apply".
                            </div>
                          )}
                        </div>
                        {/* Applied Coupon Display */}
                        {appliedCoupon && (
                          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-green-800">Applied Coupon</h4>
                                <p className="text-sm text-green-600">{appliedCoupon.title}</p>
                                <p className="text-xs text-green-600">Code: {appliedCoupon.code}</p>
                                {appliedCoupon.discountType === 'percentage' ? (
                                  <p className="text-green-700 font-medium">{appliedCoupon.discount}% OFF</p>
                                ) : (
                                  <p className="text-green-700 font-medium">€{appliedCoupon.discount} OFF</p>
                                )}
                              </div>
                              <button
                                onClick={removeAppliedCoupon}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                        {/* Separator */}
                        <div className="border-t border-gray-300 my-4"></div>
                        {/* Available Coupons Section */}
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-4">Available Coupons</h3>
                          {couponsLoading ? (
                            <div className="text-center py-8">
                              <div className="text-gray-500 text-sm">Loading coupons...</div>
                            </div>
                          ) : availableCoupons.length > 0 ? (
                            <div className="space-y-3">
                              {availableCoupons.map((coupon) => (
                                <div
                                  key={coupon.id}
                                  className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer group"
                                  onClick={() => {
                                    setCouponCode(coupon.code);
                                    // Don't apply automatically - let user review and apply manually
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800">{coupon.title}</h4>
                                      <p className="text-sm text-gray-600 mt-1">Customer Type: {coupon.customerType}</p>
                                      {coupon.discountType === 'percentage' ? (
                                        <p className="text-green-600 font-medium mt-1">{coupon.discount}% OFF</p>
                                      ) : (
                                        <p className="text-green-600 font-medium mt-1">€{coupon.discount} OFF</p>
                                      )}
                                      {coupon.minPurchase > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">Min Purchase: €{coupon.minPurchase}</p>
                                      )}
                                      {coupon.maxDiscount > 0 && (
                                        <p className="text-xs text-gray-500">Max Discount: €{coupon.maxDiscount}</p>
                                      )}
                                    </div>
                                    <div className="text-right ml-4">
                                      <span className="text-xs text-gray-500 font-mono">Code: {coupon.code}</span>
                                      {coupon.expireDate && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Expires: {new Date(coupon.expireDate).toLocaleDateString()}
                                        </p>
                                      )}
                                      {coupon.limitForSameUser > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          Limit: {coupon.limitForSameUser} uses
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-2 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to use this coupon code
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="text-gray-500 text-sm">No coupons available</div>
                              <div className="text-gray-400 text-xs mt-2">Create coupons in the Coupons section</div>
                              {/* Debug info */}
                              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-xs text-yellow-800 font-medium">Debug Info:</p>
                                <p className="text-xs text-yellow-700">Available coupons count: {availableCoupons.length}</p>
                                <p className="text-xs text-yellow-700">Loading state: {couponsLoading ? 'true' : 'false'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Numeric Keyboard Component - Positioned next to discount fields */}
                      {numericActiveInput === 'discountAmount' && (
                        <div className="w-80">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div
                              className="keyboard-container w-full"
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              <Keyboard
                                keyboardRef={(r) => (window.keyboard = r)}
                                input={numericKeyboardInput}
                                onChange={handleNumericKeyboardChange}
                                // onChangeAll removed - no longer needed
                                onKeyPress={handleNumericKeyboardKeyPress}
                                theme="hg-theme-default"
                                layoutName="numeric"
                                layout={{
                                  numeric: [
                                    "1 2 3",
                                    "4 5 6",
                                    "7 8 9",
                                    "0 {bksp}"
                                  ]
                                }}
                                display={{
                                  "1": "1",
                                  "2": "2",
                                  "3": "3",
                                  "4": "4",
                                  "5": "5",
                                  "6": "6",
                                  "7": "7",
                                  "8": "8",
                                  "9": "9",
                                  "0": "0",
                                  "{bksp}": "⌫"
                                }}
                                physicalKeyboardHighlight={true}
                                physicalKeyboardHighlightTextColor={"#000000"}
                                physicalKeyboardHighlightBgColor={"#fff475"}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>


                </div>



              </div>
            </div>
          </div>
        )}

        {/* Finalize Sale Modal */}
        {showFinalizeSaleModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-8xl h-[95vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl border-b border-gray-200">
                <h2 className="text-xl font-bold">
                  {selectedSplitBill ? `Finalize Sale - Split Bill ${selectedSplitBill.id}` : 'Finalize Sale'}
                </h2>
                <button
                  onClick={() => setShowFinalizeSaleModal(false)}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex gap-6 flex-1 overflow-hidden">
                {/* Left Panel - Payment Methods */}
                <div className="w-44 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                  <div className="space-y-2">
                    {['Cash', 'Credit Card', 'Check', 'Bank Transfer'].map((method) => (
                      <button
                        key={method}
                        onClick={() => {
                          setSelectedPaymentMethod(method);
                          // Clear amount fields when switching payment methods
                          setPaymentAmount('');
                          setGivenAmount('');
                          setChangeAmount('');
                          setCurrencyAmount('');
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedPaymentMethod === method
                          ? 'bg-gray-200 text-gray-800 font-medium'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center Panel - Payment Details */}
                <div className="flex-1 flex flex-col overflow-y-auto max-h-[70vh]">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">{selectedPaymentMethod}</h3>

                  {/* Payment Input Section */}
                  <div className="flex gap-4 mb-6">
                    {selectedPaymentMethod === 'Cash' ? (
                      <>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Given Amount</label>
                          <input
                            type="number"
                            value={givenAmount}
                            onChange={(e) => handleCashGivenAmountChange(e.target.value)}
                            onFocus={(e) => handleNumericInputFocus(e, 'givenAmount', givenAmount)}
                            onClick={(e) => handleNumericInputFocus(e, 'givenAmount', givenAmount)}
                            onBlur={(e) => {
                              if (numericActiveInput === 'givenAmount' && numericKeyboardInput !== undefined) {
                                setGivenAmount(numericKeyboardInput);
                                setPaymentAmount(numericKeyboardInput);
                                if (numericKeyboardInput) {
                                  const splitBillTotal = calculateSplitBillTotal();
                                  const change = parseFloat(numericKeyboardInput) - splitBillTotal;
                                  setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                                } else {
                                  setChangeAmount('0.00');
                                }
                              }
                              setNumericActiveInput('');
                            }}
                            onInput={(e) => {
                              const value = e.target.value;
                              setGivenAmount(value);
                              setPaymentAmount(value);
                              if (numericActiveInput === 'givenAmount') {
                                setNumericKeyboardInput(value);
                              }
                              if (value) {
                                const splitBillTotal = calculateSplitBillTotal();
                                const change = parseFloat(value) - splitBillTotal;
                                setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                              } else {
                                setChangeAmount('0.00');
                              }
                            }}
                            placeholder="Given Amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Change Amount</label>
                          <input
                            type="number"
                            value={changeAmount}
                            onChange={(e) => setChangeAmount(e.target.value)}
                            placeholder="Change Amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => handleCashAmountChange(e.target.value)}
                            onFocus={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                            onClick={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                            onBlur={(e) => {
                              if (numericActiveInput === 'paymentAmount' && numericKeyboardInput !== undefined) {
                                setPaymentAmount(numericKeyboardInput);
                                if (selectedPaymentMethod === 'Cash') {
                                  setGivenAmount(numericKeyboardInput);
                                  if (numericKeyboardInput) {
                                    const splitBillTotal = calculateSplitBillTotal();
                                    const change = parseFloat(numericKeyboardInput) - splitBillTotal;
                                    setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                                  } else {
                                    setChangeAmount('0.00');
                                  }
                                }
                              }
                              setNumericActiveInput('');
                            }}
                            onInput={(e) => {
                              const value = e.target.value;
                              setPaymentAmount(value);
                              if (numericActiveInput === 'paymentAmount') {
                                setNumericKeyboardInput(value);
                              }
                              if (selectedPaymentMethod === 'Cash') {
                                setGivenAmount(value);
                                if (value) {
                                  const splitBillTotal = calculateSplitBillTotal();
                                  const change = parseFloat(value) - splitBillTotal;
                                  setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
                                } else {
                                  setChangeAmount('0.00');
                                }
                              }
                            }}
                            placeholder="Amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </>
                    ) : selectedPaymentMethod === 'Change Currency' ? (
                      <>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                          <select
                            value={selectedCurrency}
                            onChange={(e) => setSelectedCurrency(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {currencyOptions.map((currency) => (
                              <option key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                          <input
                            type="number"
                            value={currencyAmount}
                            onChange={(e) => setCurrencyAmount(e.target.value)}
                            placeholder="Amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setCurrencyAmount('');
                          }}
                          className="px-2 py-2 text-red-500 hover:text-red-700 self-end"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          onFocus={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                          onClick={(e) => handleNumericInputFocus(e, 'paymentAmount', paymentAmount)}
                          onBlur={(e) => {
                            if (numericActiveInput === 'paymentAmount' && numericKeyboardInput !== undefined) {
                              setPaymentAmount(numericKeyboardInput);
                            }
                            setNumericActiveInput('');
                          }}
                          onInput={(e) => {
                            const value = e.target.value;
                            setPaymentAmount(value);
                            if (numericActiveInput === 'paymentAmount') {
                              setNumericKeyboardInput(value);
                            }
                          }}
                          placeholder="Amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    {selectedPaymentMethod !== 'Change Currency' && (
                      <button
                        onClick={handleAddPayment}
                        className="px-6 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors self-end"
                      >
                        Add
                      </button>
                    )}
                  </div>

                  {/* Added Payments Display */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-6">
                    {addedPayments.length > 0 ? (
                      <div className="space-y-2">
                        {addedPayments.map((payment, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                            <span className="text-sm text-gray-700">{payment.method}: €{payment.amount}</span>
                            <button
                              onClick={() => setAddedPayments(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-center py-8">
                        Your added payments will be shown here
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      {/* Split Bill Header */}
                      {selectedSplitBill && (
                        <div className="border-b border-gray-200 pb-2 mb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Split Bill {selectedSplitBill.id}:</span>
                            <span className="text-sm font-medium text-gray-700">{selectedSplitBill.customer}</span>
                          </div>
                        </div>
                      )}

                      {/* Bill Breakdown */}
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                          <span className="text-sm font-medium text-gray-700">
                            {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillSubtotal().toFixed(2) : calculateCartSubtotal().toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Tax:</span>
                          <span className="text-sm font-medium text-gray-700">
                            {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillTax().toFixed(2) : calculateCartTax().toFixed(2)}
                          </span>
                        </div>
                        {(selectedSplitBill ? calculateSplitBillDiscount() : calculateCartDiscount()) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-600">Discount:</span>
                            <span className="text-sm font-medium text-green-600">
                              -{getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)}
                            </span>
                          </div>
                        )}
                        {(selectedSplitBill ? calculateSplitBillCharge() : cartCharge) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Charge:</span>
                            <span className="text-sm font-medium text-gray-700">
                              {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillCharge().toFixed(2) : cartCharge.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {(selectedSplitBill ? calculateSplitBillTips() : cartTips) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Tips:</span>
                            <span className="text-sm font-medium text-gray-700">
                              {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillTips().toFixed(2) : cartTips.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Applied Coupons (if any) */}
                      {appliedCoupon && (
                        <div className="border-b border-gray-200 pb-2 mb-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-green-600">
                              {appliedCoupon.title} ({appliedCoupon.code}):
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              -{getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Payable:</span>
                        <span className="text-xl font-bold text-gray-800">
                          {getCurrencySymbol()}{selectedSplitBill ? calculateSplitBillTotal().toFixed(2) : calculateCartTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Paid:</span>
                        <span className="text-xl font-bold text-gray-800">{getCurrencySymbol()}{addedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Due:</span>
                        <span className="text-xl font-bold text-gray-800">
                          {getCurrencySymbol()}{Math.max(0, (selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal()) - addedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Split Bill Items */}
                  {selectedSplitBill && selectedSplitBill.items && selectedSplitBill.items.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Items in this Split Bill:</h4>
                      <div className="space-y-2">
                        {selectedSplitBill.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                              <span className="font-medium text-gray-800">{item.food?.name || 'Unknown Item'}</span>
                              <span className="text-gray-500 ml-2">x{item.quantity || 0}</span>
                            </div>
                            <span className="text-gray-800 font-medium">€{(item.totalPrice || 0).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Options */}
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sendSMS}
                        onChange={(e) => setSendSMS(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Send SMS</span>
                    </label>
                    <button
                      onClick={() => setShowCartDetailsModal(true)}
                      className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors text-sm"
                    >
                      {selectedSplitBill ? 'Split Bill Details' : 'Cart Details'}
                    </button>
                  </div>
                </div>

                {/* Right Panel - Coupons and offers */}
                <div className="flex-shrink-0 flex flex-col h-full">
                  {/* Numeric Keyboard Section - Fixed */}
                  <div className="mb-4 flex-shrink-0">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div
                        className="keyboard-container w-full"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        <Keyboard
                          keyboardRef={(r) => (window.keyboard = r)}
                          input={numericKeyboardInput}
                          onChange={handleNumericKeyboardChange}
                          onKeyPress={handleNumericKeyboardKeyPress}
                          theme="hg-theme-default"
                          layoutName="numeric"
                          layout={{
                            numeric: [
                              "1 2 3",
                              "4 5 6",
                              "7 8 9",
                              "0 {bksp}"
                            ]
                          }}
                          display={{
                            "1": "1",
                            "2": "2",
                            "3": "3",
                            "4": "4",
                            "5": "5",
                            "6": "6",
                            "7": "7",
                            "8": "8",
                            "9": "9",
                            "0": "0",
                            "{bksp}": "⌫"
                          }}
                          physicalKeyboardHighlight={true}
                          physicalKeyboardHighlightTextColor={"#000000"}
                          physicalKeyboardHighlightBgColor={"#fff475"}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coupons & Discounts Section - Scrollable */}
                  <div className="flex-1 overflow-y-auto pr-2">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800">Coupons & Discounts</h4>

                      {/* Manual Discount Section */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-800">Manual Discount</span>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Discount Type
                                </label>
                                <select
                                  name="discountType"
                                  value={discountType}
                                  onChange={(e) => setDiscountType(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                >
                                  <option value="percentage">Percentage (%)</option>
                                  <option value="fixed">Fixed Amount (€)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Disc. Amount
                                </label>
                                <input
                                  type="number"
                                  name="discountAmount"
                                  value={discountAmount}
                                  onChange={(e) => setDiscountAmount(e.target.value)}
                                  onFocus={(e) => handleNumericInputFocus(e, 'discountAmount', discountAmount)}
                                  onClick={(e) => handleNumericInputFocus(e, 'discountAmount', discountAmount)}
                                  onBlur={(e) => {
                                    if (numericActiveInput === 'discountAmount' && numericKeyboardInput !== undefined) {
                                      setDiscountAmount(numericKeyboardInput);
                                    }
                                    setNumericActiveInput('');
                                  }}
                                  onInput={(e) => {
                                    // Update both the field value and keyboard input immediately
                                    const value = e.target.value;
                                    setDiscountAmount(value);
                                    if (numericActiveInput === 'discountAmount') {
                                      setNumericKeyboardInput(value);
                                    }
                                  }}
                                  min="0"
                                  step="0.01"
                                  placeholder={discountType === 'percentage' ? '20' : '10'}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                />
                              </div>
                            </div>
                            {discountAmount && (
                              <div className="mt-2 text-sm text-green-600">
                                ✓ Manual discount of {discountAmount}{discountType === 'percentage' ? '%' : '€'} is ready to apply.
                              </div>
                            )}
                            <div className="flex justify-end mt-3">
                              <button
                                onClick={handleApplyManualDiscount}
                                disabled={!discountAmount || parseFloat(discountAmount) <= 0}
                                className={`px-4 py-2 rounded-lg transition-colors font-medium ${discountAmount && parseFloat(discountAmount) > 0
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                              >
                                Apply Manual Discount
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enter Coupon Code Section */}
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-800">Enter Coupon Code</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="couponCode"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            onFocus={(e) => handleAnyInputFocus(e, 'couponCode')}
                            onClick={(e) => handleAnyInputClick(e, 'couponCode')}
                            onBlur={(e) => handleCustomInputBlur(e, 'couponCode')}
                            placeholder="Enter promo code or click a coupon below"
                            className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${couponCode.trim()
                              ? 'border-green-400 focus:ring-green-500 focus:ring-green-500 bg-green-50'
                              : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                              }`}
                            onKeyUp={(e) => {
                              if (e.key === 'Enter') {
                                handleApplyCoupon();
                              }
                            }}
                          />
                          <button
                            onClick={handleApplyCoupon}
                            disabled={!couponCode.trim()}
                            className={`px-4 py-2 rounded-lg transition-colors font-medium ${couponCode.trim()
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            Apply
                          </button>
                        </div>
                        {couponCode.trim() && (
                          <div className="mt-2 text-sm text-green-600">
                            ✓ Coupon code "{couponCode}" is ready to apply. Click "Apply".
                          </div>
                        )}
                      </div>

                      {/* Applied Coupon Display */}
                      {appliedCoupon && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-green-800">Applied Coupon</h4>
                              <p className="text-sm text-green-600">{appliedCoupon.title}</p>
                              <p className="text-xs text-green-600">Code: {appliedCoupon.code}</p>
                              {appliedCoupon.discountType === 'percentage' ? (
                                <p className="text-green-700 font-medium">{appliedCoupon.discount}% OFF</p>
                              ) : (
                                <p className="text-green-700 font-medium">€{appliedCoupon.discount} OFF</p>
                              )}
                            </div>
                            <button
                              onClick={removeAppliedCoupon}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Available Coupons Section */}
                      <div>
                        <h5 className="text-md font-semibold text-gray-800 mb-3">Available Coupons</h5>
                        {couponsLoading ? (
                          <div className="text-center py-4">
                            <div className="text-gray-500 text-sm">Loading coupons...</div>
                          </div>
                        ) : availableCoupons.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableCoupons.map((coupon) => (
                              <div
                                key={coupon.id}
                                className="border border-gray-200 rounded-lg p-3 hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer group"
                                onClick={() => {
                                  setCouponCode(coupon.code);
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h6 className="font-semibold text-gray-800 text-sm">{coupon.title}</h6>
                                    <p className="text-xs text-gray-600 mt-1">Customer Type: {coupon.customerType}</p>
                                    {coupon.discountType === 'percentage' ? (
                                      <p className="text-green-600 font-medium mt-1 text-sm">{coupon.discount}% OFF</p>
                                    ) : (
                                      <p className="text-green-600 font-medium mt-1 text-sm">€{coupon.discount} OFF</p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <span className="text-xs text-gray-500 font-mono">Code: {coupon.code}</span>
                                  </div>
                                </div>
                                <div className="mt-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                  Click to use this coupon code
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-gray-500 text-sm">No coupons available</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Action Buttons */}
              <div className="p-6 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => setShowFinalizeSaleModal(false)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle payment submission
                    showSuccess('Payment processed successfully!');
                    setShowFinalizeSaleModal(false);
                    clearCart();
                    resetFinalizeSaleModal();
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={20} />
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Cart Confirmation Modal */}
      {showDeleteCartModal && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Cart Items</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 text-base leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-red-600">{cartItems.length}</span> item{cartItems.length !== 1 ? 's' : ''} from your cart?
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  This will permanently remove all items and reset your order. You'll need to start over.
                </p>
              </div>

              {/* Cart Items Preview */}
              {cartItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Items to be deleted:</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {cartItems.slice(0, 5).map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate flex-1">
                          {index + 1}. {item.food.name}
                        </span>
                        <span className="text-gray-500 ml-2">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                    {cartItems.length > 5 && (
                      <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
                        +{cartItems.length - 5} more items
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowDeleteCartModal(false)}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  try {
                    const audio = new Audio('/src/assets/ping.mp3');
                    audio.play().catch(error => {
                      console.log('Audio play failed:', error);
                    });
                  } catch (error) {
                    console.log('Audio creation failed:', error);
                  }
                  clearCart();
                  setShowDeleteCartModal(false);
                }}
                className="px-6 py-2.5 text-white bg-red-600 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete All Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Component */}
      <CustomAlert
        isVisible={alertState.isVisible}
        message={alertState.message}
        type={alertState.type}
        position={alertState.position}
        duration={alertState.duration}
        onClose={hideAlert}
      />

      {/* Cart Details Modal */}
      {showCartDetailsModal && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Cart Details</h2>
              <button
                onClick={() => setShowCartDetailsModal(false)}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Item:</span>
                  <span className="font-semibold">{cartItems.reduce((total, item) => total + (item.quantity || 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub Total:</span>
                  <span className="font-semibold">{getCurrencySymbol()}{calculateCartSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold">{getCurrencySymbol()}{calculateCartDiscount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-semibold">{getCurrencySymbol()}{calculateCartDiscount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">{getCurrencySymbol()}{calculateCartTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Charge:</span>
                  <span className="font-semibold">{getCurrencySymbol()}{cartCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tips:</span>
                  <span className="font-semibold">{getCurrencySymbol()}{cartTips.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            {/* <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCartDetailsModal(false)}
                className="w-full px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div> */}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdateModal && selectedOrderForStatusUpdate && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Update Order Status</h2>
              <button
                onClick={() => setShowStatusUpdateModal(false)}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Order Information */}
            <div className="p-6 bg-gray-50">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  #{selectedOrderForStatusUpdate.orderNumber}
                </h3>
                <p className="text-sm text-gray-600">
                  Current: {selectedOrderForStatusUpdate.status || 'New'}
                </p>
              </div>
            </div>

            {/* Status Selection */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3">
                {/* New Status */}
                <button
                  onClick={() => setSelectedStatus('New')}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedStatus === 'New'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-primary text-white border-primary'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus size={20} />
                    <span className="font-medium">New</span>
                  </div>
                </button>

                {/* In Progress Status */}
                <button
                  onClick={() => setSelectedStatus('In Progress')}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedStatus === 'In Progress'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-primary text-white border-primary'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={20} />
                    <span className="font-medium">In Progress</span>
                  </div>
                </button>

                {/* Ready Status */}
                <button
                  onClick={() => setSelectedStatus('Ready')}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedStatus === 'Ready'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-primary text-white border-primary'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    <span className="font-medium">Ready</span>
                  </div>
                </button>

                {/* Completed Status */}
                <button
                  onClick={() => setSelectedStatus('Completed')}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedStatus === 'Completed'
                      ? 'bg-white border-primary text-primary'
                      : 'bg-primary text-white border-primary'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Star size={20} />
                    <span className="font-medium">Completed</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowStatusUpdateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateOrderStatus}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors cursor-pointer"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Keyboard Component */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={(onBeforeHide) => hideKeyboard(() => {
          // Save the current input value before hiding the keyboard
          if (virtualKeyboardActiveInput && virtualKeyboardInput !== undefined) {
            handleKeyboardChange(virtualKeyboardInput, virtualKeyboardActiveInput);
          }
        })}
        activeInput={virtualKeyboardActiveInput}
        onInputChange={handleKeyboardChange}
        inputValue={virtualKeyboardInput}
        onKeyPress={handleKeyboardKeyPress}
      />
    </>
  );
};

export default RunningOrders;