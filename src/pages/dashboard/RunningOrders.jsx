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
  LogOut,
  LayoutDashboard,
  Utensils,
  Delete,
  AlertTriangle,
  CheckCircle,
  Gift
} from 'lucide-react';
import CustomerManagement from '../../components/dashboard/CustomerManagement';
import CustomerSearchModal from '../../components/dashboard/CustomerSearchModal';
import FloorPlan3D from '../../components/FloorPlan3D';

const RunningOrders = () => {

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
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Coupon Modal State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Cart state to store added food items
  const [cartItems, setCartItems] = useState([]);
  const [cartItemId, setCartItemId] = useState(1); // Unique ID for cart items
  const [editingCartItem, setEditingCartItem] = useState(null); // Track which cart item is being edited
  
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
      if (variationId === 'size' || variationId === 'addons' || variationId === 'toppings') {
        // Size, addons and toppings can be multiple selection
        const currentSelections = prev[variationId] || [];
        const newSelections = currentSelections.includes(optionId)
          ? currentSelections.filter(id => id !== optionId)
          : [...currentSelections, optionId];

        return {
          ...prev,
          [variationId]: newSelections
        };
      } else {
        // Default to single selection
        return {
          ...prev,
          [variationId]: optionId
        };
      }
    });
  };

  // Calculate total price with variations
  const calculateTotalPrice = () => {
    if (!selectedFood) return 0;

    let basePrice = selectedFood.price || 0;
    let variationPrice = 0;

    // Mock variation prices - replace with actual API data
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

    // Add variation prices
    Object.entries(selectedVariations).forEach(([type, selection]) => {
      if ((type === 'size' || type === 'toppings' || type === 'addons') && Array.isArray(selection)) {
        selection.forEach(item => {
          if (variationPrices[type] && variationPrices[type][item]) {
            variationPrice += variationPrices[type][item];
          }
        });
      }
    });

    const totalPricePerItem = basePrice + variationPrice;
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
    console.log('Adding to cart:', {
      food: selectedFood,
      variations: selectedVariations,
      quantity: foodQuantity,
      totalPrice: calculateTotalPrice()
    });

    // Check if we're editing an existing cart item
    if (editingCartItem) {
      handleUpdateCartItem();
      return;
    }

    // Create cart item with all details
    const cartItem = {
      id: cartItemId,
      food: selectedFood,
      variations: selectedVariations,
      quantity: foodQuantity,
      totalPrice: calculateTotalPrice(),
      addedAt: new Date().toISOString()
    };

    // Add to cart
    setCartItems(prev => [...prev, cartItem]);
    setCartItemId(prev => prev + 1);

    // Close modal and reset
    setShowFoodModal(false);
    setSelectedFood(null);
    setSelectedVariations({});
    setFoodQuantity(1); // Reset quantity
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
        alert('Customer deleted successfully');
      } else {
        alert('Error deleting customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
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
        alert('Failed to add sample data: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
      alert('Error adding sample data');
    }
  };

  const handleOpenEditModal = async () => {
    if (!selectedCustomer) {
      alert('No customer selected to edit');
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
      alert('Please enter a coupon code');
      return;
    }

    try {
      console.log('Applying coupon code:', couponCode);

      if (!window.myAPI) {
        console.error('myAPI is not available');
        alert('System error: API not available');
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
          alert('This coupon is not active');
          return;
        }

        if (transformedCoupon.expireDate && new Date(transformedCoupon.expireDate) < new Date()) {
          alert('This coupon has expired');
          return;
        }

        // Apply the coupon
        setAppliedCoupon(transformedCoupon);
        setCouponCode('');

        // Don't close modal automatically - let user close it manually

      } else {
        alert('Invalid coupon code. Please try again.');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert('Error applying coupon. Please try again.');
    }
  };

  // Function to apply coupon directly when clicked from the list
  const applyCouponDirectly = (coupon) => {
    try {
      console.log('Applying coupon directly:', coupon);

      // Check if coupon is valid
      if (coupon.status !== 'active') {
        alert('This coupon is not active');
        return;
      }

      if (coupon.expireDate && new Date(coupon.expireDate) < new Date()) {
        alert('This coupon has expired');
        return;
      }

              // Apply the coupon
        setAppliedCoupon(coupon);
        setCouponCode('');
        alert(`Coupon "${coupon.code}" applied successfully!`);

        // Don't close modal automatically - let user close it manually

    } catch (error) {
      console.error('Error applying coupon directly:', error);
      alert('Error applying coupon. Please try again.');
    }
  };

  const handleOpenCouponModal = () => {
    setShowCouponModal(true);
    setCouponCode('');
    setAppliedCoupon(null);
    fetchAvailableCoupons();
  };

  const handleCloseCouponModal = () => {
    setShowCouponModal(false);
    setCouponCode('');
    setAppliedCoupon(null);
  };

  const removeAppliedCoupon = () => {
    setAppliedCoupon(null);
  };

  // Cart item operations
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      removeCartItem(itemId);
      return;
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
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Handle editing cart item
  const handleEditCartItem = (cartItem) => {
    setEditingCartItem(cartItem);
    setSelectedFood(cartItem.food);
    setSelectedVariations(cartItem.variations);
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
  };

  // Handle place order
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart before placing order');
      return;
    }
    
    // TODO: Implement order placement logic
    console.log('Placing order:', {
      items: cartItems,
      customer: selectedCustomer,
      total: calculateCartTotal(),
      coupon: appliedCoupon
    });
    
    alert('Order placed successfully!');
    clearCart();
  };

  // Handle payment
  const handlePayment = () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart before proceeding to payment');
      return;
    }
    
    // TODO: Implement payment logic
    console.log('Processing payment:', {
      items: cartItems,
      customer: selectedCustomer,
      total: calculateCartTotal(),
      coupon: appliedCoupon
    });
    
    alert('Payment processed successfully!');
    clearCart();
  };

  const MenuCard = ({ item }) => (
    <div
      className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden transform hover:-translate-y-1 cursor-pointer"
      onClick={() => {
        console.log('Food item clicked:', item);
        setSelectedFood(item);
        setShowFoodModal(true);
        setSelectedVariations({});
        setFoodQuantity(1); // Reset quantity when opening modal
      }}
    >
      <div className="h-[88px]">
        <img
          src={item.image || "https://via.placeholder.com/150x120?text=Food"}
          alt={item.name}
          className="w-full h-[100%] object-cover"
        />
      </div>
      <div className="flex justify-center py-2 items-center flex-col">
        <h3 className="font-semibold text-gray-800 text-sm text-center">{item.name}</h3>
        <p className="text-gray-600 font-semibold text-xs mt-1">€{item.price?.toFixed(2) || '0.00'}</p>
      </div>
    </div>
  );

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
  return (
    <>
      <div className="flex justify-between gap-2 h-[100%] px-1.5 py-2 bg-[#d3D3D3]">
        <div className='flex w-[20%] flex-col relative gap-2 bg-[#ffffff]  border-r border-gray-200 shadow-lg rounded-xl'>
          {/* Main content row */}
          {/* Running Orders */}
          <div className=" h-[85%] flex flex-col overflow-y-auto">
            <div className="p-3 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">Running Orders</h2>
              <button className="text-[#715af3] text-[11px] font-bold bg-white border border-gray-300 rounded-lg px-1.5 py-1.5 cursor-pointer hover:text-blue-800 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            <div className="px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full pl-8 text-xs font-semibold pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* <div className="py-4 mt-2 my-auto px-2 space-y-2 h-auto overflow-y-auto">
              {cartItems.length > 0 ? (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border-b cursor-pointer border border-gray-300 hover:bg-gray-50 rounded-lg shadow-md ${selectedOrder?.id === item.id ? 'bg-blue-50' : ''
                      }`}
                    onClick={() => setSelectedOrder(item)}
                  >
                    <div className="font-semibold text-sm text-gray-800">{item.food.name}</div>
                    <div className="text-xs mt-1 text-gray-700">Qty: {item.quantity}</div>
                    <div className="text-xs text-gray-700">€{item.totalPrice.toFixed(2)}</div>
                    {Object.keys(item.variations).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.variations).map(([type, selections]) => {
                          if (Array.isArray(selections) && selections.length > 0) {
                            return `${type}: ${selections.join(', ')}`;
                          }
                          return null;
                        }).filter(Boolean).join(' | ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">No items in cart</div>
                  <div className="text-gray-400 text-xs mt-2">Add items from the menu</div>
                </div>
              )}
            </div> */}
          </div>
          {/* Order Action Buttons - Below Running Orders Box */}
          <div className="flex justify-center absolute bottom-0 left-0 w-[100%]">
            <div className="flex gap-2 p-2 text-[10px]">
              <button className="flex-1 bg-[#010101] text-white font-bold rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                BILL
              </button>
              <button className="flex-1 bg-[#4d36eb] text-white font-bold rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                ORDER DETAILS
              </button>
              <button className="flex-1 bg-[#f3be25] text-white font-bold rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                MODIFY ORDER
              </button>
              <button className="flex-1 bg-[#c81118] text-white font-bold rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                CANCEL
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="w-[50%] bg-white flex flex-col shadow-lg rounded-xl overflow-hidden">
          {/* Search and categories section */}
          <div className="py-3 px-2 border-b border-gray-200">
            {/* Search bar */}
            <div className="relative mb-4 w-full">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 text-primary" />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            
            {/* Search results info */}
            {debouncedSearchQuery && (
              <div className="mb-2 text-xs text-gray-600">
                Found {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} for "{debouncedSearchQuery}"
              </div>
            )}

            {/* Category buttons */}
            <div className="flex flex-wrap gap-1.5">
              {loading ? (
                <div className="text-gray-500 text-sm">Loading categories...</div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-2 py-1 rounded-lg text-white text-[10.5px] font-medium bg-primary 
                shadow-[0_4px_4px_rgba(0,0,0,0.15),0_1px_2px_rgba(0,0,0,0.1)] 
                active:shadow-[0_1px_2px_rgba(0,0,0,0.15)] 
                active:translate-y-[1px] 
                transition-all duration-150 hover:bg-primary/90 ${selectedCategory?.id === category.id ? 'bg-primary/90' : ''
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
          <MenuGrid />
        </div>

        {/* Order Summary */}
        <div className="w-[30%] h-[100%] border border-gray-300 rounded-lg ">
          <div className="flex flex-wrap gap-1.5 px-2 py-2 mb-2 h-[20%] bg-white border-b border-gray-200 rounded-lg">
            {/* Tabs row */}
              <button className="px-3 py-1 bg-[#d3D3D3] text-black text-[11px] rounded flex items-center gap-1 
                      border border-gray-200 btn-lifted ">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                In Store
              </button>
              <button
                onClick={() => setShowTableModal(true)}
                className="px-3 py-1 bg-[#d3D3D3] text-black text-xs rounded flex items-center gap-1 
                      border border-gray-200 btn-lifted hover:bg-gray-200 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                </svg>
                Table
              </button>
              <button className="px-2.5 py-1 bg-[#d3D3D3] text-black text-xs rounded flex items-center gap-1 
                      border border-gray-200 btn-lifted ">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
                Collection
              </button>
              <button className="px-2.5 py-1 bg-[#d3D3D3] text-black text-xs rounded flex items-center gap-1 
                      border border-gray-200 btn-lifted ">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
                </svg>
                Delivery
              </button>
              <button className="px-2 py-1 bg-[#d3D3D3] text-black text-xs rounded flex items-center gap-1 
                      border border-gray-200 btn-lifted ">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
                </svg>
                Status
              </button>
            {/* Status section */}

              <button className="px-2.5 py-1 bg-[#d3D3D3] text-black text-xs rounded flex items-center gap-1 
                      border border-gray-300 btn-lifted ">
                <Clock size={14} />
                Due to
              </button>
              <button
                onClick={() => setShowCustomerSearchModal(true)}
                className="px-2.5 py-1 bg-primary text-white text-xs rounded flex items-center gap-1 
                     btn-lifted hover:bg-primary/90 transition-colors">
                <Users2 size={12} />
                Customer
              </button>


              <button
                onClick={() => setSelectedCustomer(null)}
                className={`px-1.5 py-1 text-[11px] rounded flex items-center gap-1 
                      border border-gray-300 btn-lifted transition-colors ${!selectedCustomer ? 'bg-primary text-white' : 'bg-[#d3D3D3] text-black'
                  }`}>
                {selectedCustomer ? selectedCustomer.name : 'Walk in Customer'}
              </button>

              <button
                onClick={() => setShowCustomerModal(true)}
                className=" px-2 py-1 bg-primary text-white text-xs rounded flex items-center gap-1 
                      border border-[#1e4a9a] btn-lifted hover:bg-primary/90 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                Add New Customer
              </button>

              <button
                onClick={handleOpenEditModal}
                disabled={!selectedCustomer}
                className={`btn-lifted transition-colors ${selectedCustomer
                  ? 'text-green-600 hover:text-green-800 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
                  }`}>
                <Edit size={17} />
              </button>
              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert('Cart is already empty');
                    return;
                  }
                  
                  setShowDeleteCartModal(true);
                }}
                disabled={cartItems.length === 0}
                className={`px-2 py-1.5 text-white text-xs rounded flex items-center gap-1 
                      border border-gray-300 btn-lifted transition-colors ${
                        cartItems.length > 0 
                          ? 'bg-[#c81118] hover:bg-red-700 cursor-pointer' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}>
                <Trash2 size={17} />
                Delete All
              </button>

          </div>

          {/* Items table */}
          {/* Items table header */}
          <div className='bg-white flex flex-col h-[79%] mb-2 rounded-lg p-2 relative'>
            <div className="mt-3 border border-primary overflow-y-auto h-[60%]">
              <table className="w-full">
                <thead>
                  <tr className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700 p-3">
                    <th className="text-center">Items</th>
                    <th className="text-center">Price</th>
                    <th className="text-center">Qty</th>
                    <th className="text-center">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                                             <tr key={item.id} className="grid grid-cols-4 gap-4 items-center text-sm p-2 border-b border-gray-200">
                         <td className="flex items-center gap-2">
                           <Edit2 
                             size={13} 
                             className="text-primary cursor-pointer hover:text-primary-dark transition-colors" 
                             onClick={() => handleEditCartItem(item)}
                             title="Edit item"
                           />
                           <span className="text-gray-800 text-sm">{item.food.name}</span>
                         </td>
                        <td className="text-gray-800 text-center">€{(item.totalPrice / item.quantity).toFixed(2)}</td>
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
                        <td className="flex items-center justify-center gap-2">
                          <span className="text-gray-800">€{item.totalPrice.toFixed(2)}</span>
                          <Trash2 
                            size={14} 
                            className="text-[#c81118] mt-0.5 cursor-pointer" 
                            onClick={() => removeCartItem(item.id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="grid grid-cols-4 gap-4 items-center text-sm p-4">
                      <td colSpan="4" className="text-center text-gray-500">
                        {/* No items in cart */}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Summary section */}
            <div className='bg-white p-2 absolute bottom-0 right-0 w-[100%] rounded-lg'>
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
                <div className="bg-[#d3D3D3] px-4 py-2 btn-lifted cursor-pointer   w-[70%] rounded flex items-center justify-center mb-4">
                  <div className="flex items-center  gap-2">
                    <Eye size={14} />
                    <span className="text-gray-800 font-medium">Total Payable : €{calculateCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex gap-2 justify-center pb-2">
                <button
                  onClick={handleOpenCouponModal}
                  className="bg-[#43a148] text-white  btn-lifted py-2 px-1 w-[100%]  text-[11px] font-bold rounded  hover:bg-green-600"
                >
                  DISCOUNT
                </button>
                <button 
                  onClick={clearCart}
                  className="bg-[#4d35ee] text-white  w-[100%] btn-lifted py-2 px-1   text-[11px] font-bold rounded   hover:bg-blue-700"
                >
                  CLEAR CART
                </button>
                <button className="bg-[#3db4e4] text-white  w-[100%] btn-lifted py-2 px-1  text-[11px] font-bold rounded  hover:bg-cyan-500">
                  KOT
                </button>
                <button 
                  onClick={handlePlaceOrder}
                  className="bg-[#fb8b02] text-white  w-[100%] btn-lifted py-2 px-1 text-[11px] font-bold rounded   hover:bg-orange-600"
                >
                  PLACE ORDER
                </button>
                <button 
                  onClick={handlePayment}
                  className="bg-[#f42cef] text-white  w-[100%] btn-lifted py-2 px-1 text-[11px] font-bold rounded  hover:bg-pink-600"
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
        {showFoodModal && selectedFood && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh]">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
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

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">

                {/* Food Header Section */}
                <div className="mb-6">
                  {editingCartItem && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        ✏️ Editing item: {editingCartItem.food.name}
                      </p>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    {/* Food Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={selectedFood.image || "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center"}
                        alt={selectedFood.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Food Info */}
                    <div className="flex-1 text-right">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedFood.name}</h3>
                      <p className="text-2xl font-bold text-primary">€{selectedFood.price?.toFixed(2) || '0.00'}</p>
                      {selectedFood.description && (
                        <p className="text-sm text-gray-600 mt-2">{selectedFood.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Select Variation Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Edit2 size={18} className="text-primary" />
                    Select Variation
                  </h4>

                  {/* Mock variations data - replace with actual API call */}
                  <div className="space-y-4">
                    {/* Size Variation */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-3">Size</h5>
                      <div className="space-y-2">
                        {[
                          { name: 'Small', price: 0 },
                          { name: 'Medium', price: 2.50 },
                          { name: 'Large', price: 5.00 }
                        ].map((size) => {
                          const isSelected = selectedVariations.size && selectedVariations.size.includes(size.name);
                          return (
                            <button
                              key={size.name}
                              onClick={() => handleVariationSelect('size', size.name)}
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
                                  {size.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-600'
                                }`}>
                                {size.price > 0 ? `+€${size.price.toFixed(2)}` : 'Free'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toppings Variation */}
                    {/* <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-3">Toppings</h5>
                        <div className="space-y-2">
                          {[
                            { name: 'Extra Cheese', price: 1.50 },
                            { name: 'Bacon', price: 2.00 },
                            { name: 'Mushrooms', price: 1.00 },
                            { name: 'Olives', price: 0.75 }
                          ].map((topping) => {
                            const isSelected = selectedVariations.toppings && selectedVariations.toppings.includes(topping.name);
                            return (
                              <button
                                key={topping.name}
                                onClick={() => handleVariationSelect('toppings', topping.name)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                  isSelected
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'border-primary bg-primary'
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                  <span className={`font-medium ${
                                    isSelected ? 'text-primary' : 'text-gray-700'
                                  }`}>
                                    {topping.name}
                                  </span>
                                </div>
                                <span className={`font-semibold ${
                                  isSelected ? 'text-primary' : 'text-gray-600'
                                }`}>
                                  +€{topping.price.toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div> */}
                  </div>
                </div>

                {/* Select Add on Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Plus size={18} className="text-primary" />
                    Select Add on
                  </h4>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {[
                        { name: 'Extra Cheese', price: 1.50 },
                        { name: 'Bacon', price: 2.00 },
                        { name: 'Mushrooms', price: 1.00 },
                        { name: 'Olives', price: 0.75 },
                        { name: 'Extra Sauce', price: 0.50 },
                        { name: 'Double Portion', price: 3.00 }
                      ].map((addon) => {
                        const isSelected = selectedVariations.addons && selectedVariations.addons.includes(addon.name);
                        return (
                          <button
                            key={addon.name}
                            onClick={() => handleVariationSelect('addons', addon.name)}
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
                                {addon.name}
                              </span>
                            </div>
                            <span className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-600'
                              }`}>
                              +€{addon.price.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Allergens Section */}
                {/* <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" />
                    Allergens
                  </h4>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {['Gluten', 'Dairy', 'Nuts', 'Eggs'].map((allergen) => (
                        <span
                          key={allergen}
                          className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full flex items-center gap-1"
                        >
                          <AlertTriangle size={12} />
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                </div> */}

                {/* Total Price Display */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg font-semibold text-gray-800">Total Price:</span>
                    <span className="text-2xl font-bold text-primary">€{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white">
                      <button
                        onClick={handleQuantityDecrease}
                        disabled={foodQuantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={6} />
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
                      className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      {editingCartItem ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Modal */}
        {showCouponModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh]">
              {/* Header */}
              <div className="bg-white text-black p-4 flex justify-between items-center rounded-t-xl border-b border-gray-200">
                <h2 className="text-xl font-bold">Coupons & Offers</h2>
                <button
                  onClick={handleCloseCouponModal}
                  className="text-black hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[80vh]">
                {/* Enter Coupon Code Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-800">Enter Coupon Code</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter promo code or click a coupon below"
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        couponCode.trim() 
                          ? 'border-green-400 focus:ring-green-500 focus:border-green-500 bg-green-50' 
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
                      className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                        couponCode.trim()
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
      
    </>
  );
};

export default RunningOrders;