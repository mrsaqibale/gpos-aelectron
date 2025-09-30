import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { getAudioPath } from '../../utils/soundUtils.js';
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
  Truck,
  Store,
  Table as TableIcon,
  Package,
  UserCheck,
  Clock3,
  Wallet,
  Save,
  Archive
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
import OrderDetailsModal from '../../components/OrderDetailsModal';
import Invoice from '../../components/Invoice';
import CustomerInformation from '../../components/dashboard/CustomerInformation';
import Drafts from '../../components/Drafts';
import DraftNumberModal from '../../components/DraftNumberModal';
import DueTo from '../../components/DueTo';
import AssignRider from '../../components/AssignRider';
import UpdateOrderStatus from '../../components/UpdateOrderStatus';
import { useDraftCount } from '../../contexts/DraftContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useButtonSound } from '../../hooks/useButtonSound';
import { useOrderTypeSettings } from '../../hooks/useOrderTypeSettings';
import { useSettings } from '../../contexts/SettingsContext';
import FinalizeSaleModal from '../../components/FinalizeSaleModal';
import MergeTableModal from '../../components/dashboard/table/MergeTableModal';
import FoodIngredientsModalbox from '../../components/dashboard/FoodIngredientsModalbox';
import InvoiceOptions from '../../components/InvoiceOptions.jsx';
import PlaceOrderComponent from '../../components/PlaceOrderComponent.jsx';
import SplitBillModal from '../../components/SplitBillModal.jsx';

const RunningOrders = () => {
  // Accept navigation state to pre-load an order
  const location = useLocation();
  // Custom Alert Hook
  const { alertState, showSuccess, showError, showWarning, showInfo, hideAlert } = useCustomAlert();
  const { updateDraftCount } = useDraftCount();
  const { addNotification } = useNotifications();
  const { playButtonSound } = useButtonSound();
  const { shouldShowOrderType, orderTypeSettings } = useOrderTypeSettings();
  const { settings } = useSettings();

  // Helper function to get the first available order type
  const getFirstAvailableOrderType = () => {
    if (shouldShowOrderType('instore')) return 'In Store';
    if (shouldShowOrderType('table')) return 'Table';
    if (shouldShowOrderType('collection')) return 'Collection';
    if (shouldShowOrderType('delivery')) return 'Delivery';
    return null; // No order types available
  };

  // Helper function to check if a selected order type is still valid
  const isOrderTypeValid = (orderType) => {
    if (!orderType) return false;
    const typeMap = {
      'In Store': 'instore',
      'Table': 'table',
      'Collection': 'collection',
      'Delivery': 'delivery'
    };
    const key = typeMap[orderType];
    return key ? shouldShowOrderType(key) : false;
  };

  // Helper function to validate order type selection
  const validateOrderTypeSelection = () => {
    if (!selectedOrderType || !isOrderTypeValid(selectedOrderType)) {
      const availableTypes = [];
      if (shouldShowOrderType('instore')) availableTypes.push('In Store');
      if (shouldShowOrderType('table')) availableTypes.push('Table');
      if (shouldShowOrderType('collection')) availableTypes.push('Collection');
      if (shouldShowOrderType('delivery')) availableTypes.push('Delivery');

      if (availableTypes.length > 0) {
        showError(`Please select an order type first. Available options: ${availableTypes.join(', ')}`);
        return false;
      } else {
        showError('No order types are available. Please check your settings.');
        return false;
      }
    }
    return true;
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCustomerSearchModal, setShowCustomerSearchModal] = useState(false);
  const [customerSearchFromSplit, setCustomerSearchFromSplit] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteCartModal, setShowDeleteCartModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [customerForInfo, setCustomerForInfo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [foodQuantity, setFoodQuantity] = useState(1);
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);
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
  const [reservedTables, setReservedTables] = useState([]); // Track multiple reserved tables
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [tablesLoading, setTablesLoading] = useState(false);

  const [mergeTable1, setMergeTable1] = useState('');
  const [mergeTable2, setMergeTable2] = useState('');
  const [mergeTableSelections, setMergeTableSelections] = useState([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);

  // Load order from ManageOrders when navigated with state
  useEffect(() => {
    const state = location?.state;
    if (!state || !state.loadOrder) return;
    const o = state.loadOrder;

    console.log('RunningOrders: Received order data from ManageOrders:', o);

    // Imitate "Modify Order" flow: clear current context first
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

    // Set customer
    if (o.customer) {
      console.log('Setting customer:', o.customer);
      setSelectedCustomer(o.customer);
    }

    // Set order type
    if (o.orderType) {
      console.log('Setting order type:', o.orderType);
      setSelectedOrderType(o.orderType);
    }

    // Load items into cart
    const nowBase = Date.now();
    if (o.items && Array.isArray(o.items)) {
      console.log('Loading items into cart:', o.items);
      const cartItems = o.items.map((item, idx) => {
        // Check if it's a custom pizza item
        if (item.isCustomPizza) {
          return {
            id: nowBase + idx,
            name: item.name,
            price: item.price,
            tax: item.tax,
            totalPrice: item.totalPrice,
            quantity: item.quantity || 1,
            variations: {},
            adons: [],
            slices: item.slices,
            size: item.size,
            selectedPizzas: item.selectedPizzas,
            flavorIngredients: item.flavorIngredients,
            sliceColors: item.sliceColors,
            customNote: item.customNote,
            isCustomPizza: true,
            addedAt: new Date().toISOString()
          };
        }

        // Check if it's a custom food item
        if (item.isCustomFood) {
          return {
            id: nowBase + idx,
            name: item.name,
            price: item.price,
            tax: item.tax,
            totalPrice: item.totalPrice,
            quantity: item.quantity || 1,
            variations: {},
            adons: [],
            customFoodName: item.customFoodName,
            customFoodNote: item.customFoodNote,
            customFoodIngredients: item.customFoodIngredients,
            isCustomFood: true,
            addedAt: new Date().toISOString()
          };
        }

        // Regular food item
        return {
          id: nowBase + idx,
          food: item.food,
          variations: item.variations || {},
          adons: item.adons || [],
          quantity: item.quantity || 1,
          totalPrice: item.totalPrice || 0,
          addedAt: new Date().toISOString()
        };
      });
      setCartItems(cartItems);
      setCartItemId(nowBase + (o.items.length || 0) + 1);
    }

    // Table if any
    if (o.table) {
      console.log('Setting table:', o.table);
      setSelectedTable(o.table);
    }

    // Mark as modifying this order
    setIsModifyingOrder(true);
    setModifyingOrderId(o.databaseId || o.orderId);

    // Set selectedPlacedOrder for compatibility with existing flows
    setSelectedPlacedOrder({
      id: o.orderId,
      databaseId: o.databaseId,
      customer: o.customer,
      items: o.items,
      orderType: o.orderType,
      table: o.table
    });

    // Clear state to avoid reapplying when navigating within sales
    window.history.replaceState({}, document.title);
  }, [location]);

  const [foods, setFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [runningOrdersSearchQuery, setRunningOrdersSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantityUpdateTimeout, setQuantityUpdateTimeout] = useState(null);
  const [lastSoundTime, setLastSoundTime] = useState(0);

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
  
  // Ref to track the latest cart items for draft saving
  const cartItemsRef = useRef(cartItems);

  // Debug cart items changes and update ref
  useEffect(() => {
    console.log('=== CART ITEMS STATE CHANGED ===');
    console.log('Cart items count:', cartItems.length);
    console.log('Cart items:', cartItems.map(item => ({
      id: item.id,
      name: item.food?.name || 'Unknown',
      quantity: item.quantity,
      price: item.food?.price || item.price || 0
    })));
    // Update ref with latest cart items
    cartItemsRef.current = cartItems;
  }, [cartItems]);
  const [editingCartItem, setEditingCartItem] = useState(null); // Track which cart item is being edited
  const [cartCharge, setCartCharge] = useState(0); // Cart charge amount
  const [cartTips, setCartTips] = useState(0); // Cart tips amount
  const [orderNote, setOrderNote] = useState(''); // Order note field

  // Split Pizza Modal State
  const [showSplitPizzaModal, setShowSplitPizzaModal] = useState(false);
  const [pizzaSlices, setPizzaSlices] = useState(4);

  // Open Order (Custom Food) Modal State
  const [showOpenOrderModal, setShowOpenOrderModal] = useState(false);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customFoodPrice, setCustomFoodPrice] = useState('');
  const [customFoodNote, setCustomFoodNote] = useState('');
  const [customFoodIngredients, setCustomFoodIngredients] = useState([]);
  const [customIngredientInput, setCustomIngredientInput] = useState('');
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false);
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
  const [editingCustomFood, setEditingCustomFood] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);

  // Add state for pizza price and size
  const [pizzaPrice, setPizzaPrice] = useState('');
  const [pizzaSize, setPizzaSize] = useState('12'); // Default to 12 inch
  const [pizzaNote, setPizzaNote] = useState('');

  // Pizza foods and ingredients state
  const [pizzaFoods, setPizzaFoods] = useState([]);
  const [selectedPizzaFood, setSelectedPizzaFood] = useState(null);
  const [pizzaIngredients, setPizzaIngredients] = useState([]);

  // New state for pizza integration
  const [selectedPizzaFlavors, setSelectedPizzaFlavors] = useState({});
  const [pizzaIngredientsBySlice, setPizzaIngredientsBySlice] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customIngredients, setCustomIngredients] = useState([]);

  // Track removed default ingredients per slice
  const [removedDefaultIngredients, setRemovedDefaultIngredients] = useState({});

  // Track ingredients per flavor (both default and custom)
  const [flavorIngredients, setFlavorIngredients] = useState({}); // { flavorIndex: { default: [], custom: [] } }

  // State for slice-specific pizza selection and ingredients
  const [selectedPizzaPerSlice, setSelectedPizzaPerSlice] = useState({});
  const [ingredientsPerSlice, setIngredientsPerSlice] = useState({});

  // State to track which flavor box is currently selected for ingredient editing
  const [selectedFlavorForEditing, setSelectedFlavorForEditing] = useState(null);

  // Schedule Order Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleTime, setSelectedScheduleTime] = useState('');
  const [selectedScheduleDate, setSelectedScheduleDate] = useState('');
  const [selectedScheduleDateTime, setSelectedScheduleDateTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [customTime, setCustomTime] = useState('');
  const [useCustomTime, setUseCustomTime] = useState(false);



  // Split Bill Modal State
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [totalSplit, setTotalSplit] = useState('');

  // Drafts Modal State
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [currentDraftOrders, setCurrentDraftOrders] = useState([]);
  const [showDraftNumberModal, setShowDraftNumberModal] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null); // Track current draft ID for updates
  const [currentDraftPosition, setCurrentDraftPosition] = useState(null); // Track original position of loaded draft
  const [currentDraftNumber, setCurrentDraftNumber] = useState(null); // Track draft order number for display
  const [splitItems, setSplitItems] = useState([]);
  const [splitDiscount, setSplitDiscount] = useState(0);
  const [splitCharge, setSplitCharge] = useState(0);
  const [splitTips, setSplitTips] = useState(0);
  const [splitBills, setSplitBills] = useState([]);
  const [selectedSplitBill, setSelectedSplitBill] = useState(null);
  const [splitBillToRemove, setSplitBillToRemove] = useState(null);

  // Calculate maximum splits based on total quantity
  const calculateMaxSplits = () => {
    if (!splitItems || splitItems.length === 0) return 1;

    const totalQuantity = splitItems.reduce((sum, item) => sum + item.quantity, 0);
    return Math.max(1, totalQuantity);
  };

  // Order Management State
  const [placedOrders, setPlacedOrders] = useState([]);
  const [selectedPlacedOrder, setSelectedPlacedOrder] = useState(null);
  const [showInvoiceOptions, setShowInvoiceOptions] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set()); // Track which orders are expanded
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [selectedOrderForStatusUpdate, setSelectedOrderForStatusUpdate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('New');

  // Invoice Modal States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showKitchenInvoiceModal, setShowKitchenInvoiceModal] = useState(false);
  const [showEmployeeInvoiceModal, setShowEmployeeInvoiceModal] = useState(false);
  const [currentOrderForInvoice, setCurrentOrderForInvoice] = useState(null);
  const [isInvoiceAfterPayment, setIsInvoiceAfterPayment] = useState(false);

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

  // Rider Assignment Modal State
  const [showRiderAssignmentModal, setShowRiderAssignmentModal] = useState(false);

  // Cart Details Modal State
  const [showCartDetailsModal, setShowCartDetailsModal] = useState(false);

  // Time reference for order time display (updates every minute only)
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cancel Order Modal State
  const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  // Draft Conversion Modal State
  const [showDraftConversionModal, setShowDraftConversionModal] = useState(false);
  const [draftToConvert, setDraftToConvert] = useState(null);
  const [conversionOrderType, setConversionOrderType] = useState('In Store');
  const [conversionTable, setConversionTable] = useState('');
  const [conversionPersons, setConversionPersons] = useState('');
  const [conversionFloor, setConversionFloor] = useState('');

  // Order Type State - Initialize with null, will be set by useEffect
  const [selectedOrderType, setSelectedOrderType] = useState(null);
  const [isSinglePayMode, setIsSinglePayMode] = useState(false);
  const [isModifyingOrder, setIsModifyingOrder] = useState(false);
  const [modifyingOrderId, setModifyingOrderId] = useState(null);
  const [modifyingOrderPaymentInfo, setModifyingOrderPaymentInfo] = useState(null);
  const [showPayLaterButton, setShowPayLaterButton] = useState(false);
  const [hasResetPayment, setHasResetPayment] = useState(false);
  const [selectedNewOrderStatus, setSelectedNewOrderStatus] = useState('New'); // Track status for new orders

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
  } = useVirtualKeyboard(['searchQuery', 'runningOrdersSearchQuery', 'couponCode', 'customIngredientInput', 'pizzaNote', 'customFoodName', 'customFoodNote']);

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

  // Drafts modal event listener
  useEffect(() => {
    const handleOpenDraftsModal = () => {
      setShowDraftsModal(true);
    };

    window.addEventListener('openDraftsModal', handleOpenDraftsModal);
    return () => {
      window.removeEventListener('openDraftsModal', handleOpenDraftsModal);
    };
  }, []);

  // Fetch draft orders when drafts modal is opened
  useEffect(() => {
    if (showDraftsModal) {
      fetchDraftOrders();
    }
  }, [showDraftsModal]);

  // Update draft count whenever currentDraftOrders changes
  useEffect(() => {
    updateDraftCount(currentDraftOrders.length);
  }, [currentDraftOrders, updateDraftCount]);

  // Minute-based timer: updates only the time labels once per minute
  useEffect(() => {
    // Align the first tick to the start of next minute to avoid drift
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    let intervalId = null;
    const startTimeout = setTimeout(() => {
      setCurrentTime(new Date());
      intervalId = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
    }, msUntilNextMinute);

    return () => {
      if (intervalId) clearInterval(intervalId);
      clearTimeout(startTimeout);
    };
  }, []);

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

  // Open Status modal when triggered from OrdersHeader
  const handleOpenStatusModal = () => {
    const mockOrder = {
      orderType: selectedOrderType || 'In Store',
      orderNumber: 'NEW-ORDER',
      status: 'New'
    };
    setSelectedOrderForStatusUpdate(mockOrder);
    setSelectedStatus('New');
    setShowStatusUpdateModal(true);
  };

  React.useEffect(() => {
    window.addEventListener('openStatusModal', handleOpenStatusModal);
    const handleOpenInfo = (e) => {
      const c = e?.detail?.customer;
      if (c) {
        setCustomerForInfo(c);
        setShowCustomerInfo(true);
      }
    };
    window.addEventListener('openCustomerInfo', handleOpenInfo);
    
    // Add event listener for Save button to create draft
    const handleSaveClicked = () => {
      if (cartItems.length === 0) {
        showError('Please add items to cart before saving as draft');
        return;
      }
      // Call handleDraftOrder directly - now uses ref for latest cart state
      handleDraftOrder('Walk-in Customer');
    };
    window.addEventListener('headerSaveClicked', handleSaveClicked);
    
    return () => {
      window.removeEventListener('openStatusModal', handleOpenStatusModal);
      window.removeEventListener('openCustomerInfo', handleOpenInfo);
      window.removeEventListener('headerSaveClicked', handleSaveClicked);
    };
  }, [selectedOrderType, cartItems.length, showError]);

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
    setSelectedCategory(category);
    fetchFoodsByCategory(category.id);
  };

  // Get customer name by ID
  const getCustomerName = async (customerId) => {
    try {
      if (!customerId) return 'Walk-in Customer';
      const result = await window.myAPI.getCustomerById(customerId);
      if (result && result.success && result.data) {
        return result.data.name || `Customer ${customerId}`;
      }
      return `Customer ${customerId}`;
    } catch (error) {
      console.error('Error fetching customer name:', error);
      return `Customer ${customerId}`;
    }
  };

  // Fetch active orders from database (not completed/delivered/canceled)
  const fetchExistingOrders = async () => {
    try {
      console.log('Fetching active orders from database...');

      if (!window.myAPI) {
        console.error('myAPI is not available');
        return;
      }

      // Get all orders from database
      const result = await window.myAPI.getAllOrders(100, 0); // Get last 100 orders

      if (result && result.success) {
        console.log('All orders loaded:', result.data);

        // Filter to only show orders that are not completed, delivered, canceled, or drafts
        const activeOrders = result.data.filter(order => {
          const status = order.order_status?.toLowerCase();
          const orderType = order.order_type?.toLowerCase();
          const isActive = status !== 'completed' &&
            status !== 'delivered' &&
            status !== 'canceled' &&
            status !== 'done' &&
            status !== 'finished' &&
            status !== 'closed' &&
            status !== 'draft' &&
            orderType !== 'draft';
          console.log(`Order ${order.id}: status="${order.order_status}", order_type="${order.order_type}" (normalized: "${status}"), isActive=${isActive}`);
          return isActive;
        });

        console.log('Active orders (not completed):', activeOrders);

        // Transform database orders to UI format
        const transformedOrders = activeOrders.map(async dbOrder => {
          try {
            // Get order details for this order
            console.log(`Fetching order details for order ${dbOrder.id}...`);
            const detailsResult = await window.myAPI.getOrderDetailsWithFood(dbOrder.id);

            let items = [];
            if (detailsResult && detailsResult.success) {
              console.log(`Order ${dbOrder.id} details:`, detailsResult.data);
              // Transform order details to cart items format
              items = detailsResult.data.map(detail => {
                let foodDetails = {};
                let variations = {};
                let adons = [];
                try {
                  if (detail.food_details) {
                    foodDetails = JSON.parse(detail.food_details);
                  }
                  if (detail.variation) {
                    variations = JSON.parse(detail.variation);
                  }
                  if (detail.add_ons) {
                    adons = JSON.parse(detail.add_ons);
                  }
                } catch (error) {
                  console.error('Error parsing JSON data:', error);
                }
                return {
                  id: detail.id,
                  food: {
                    id: detail.food_id,
                    name: detail.food_name || foodDetails.food?.name || 'Unknown Food',
                    description: detail.food_description || foodDetails.food?.description,
                    price: detail.price,
                    image: detail.food_image || foodDetails.food?.image
                  },
                  variations: variations,
                  adons: adons,
                  quantity: detail.quantity,
                  totalPrice: detail.price * detail.quantity,
                  addedAt: detail.created_at
                };
              });
            } else {
              console.warn(`No order details found for order ${dbOrder.id}. Including order with empty items.`);
            }

            // Get customer name
            const customerName = dbOrder.customer_id ? await getCustomerName(dbOrder.customer_id) : 'Walk-in Customer';

            // Get complete customer data if customer_id exists
            let customerData = {
              id: dbOrder.customer_id,
              name: customerName
            };

            if (dbOrder.customer_id) {
              try {
                // Fetch complete customer data
                const customerResult = await window.myAPI.getCustomerById(dbOrder.customer_id);
                if (customerResult && customerResult.success && customerResult.data) {
                  customerData = {
                    id: customerResult.data.id,
                    name: customerResult.data.name,
                    phone: customerResult.data.phone,
                    email: customerResult.data.email
                  };

                  // Fetch customer addresses
                  const addressResult = await window.myAPI.getCustomerAddresses(dbOrder.customer_id);
                  if (addressResult && addressResult.success && addressResult.data) {
                    customerData.addresses = addressResult.data;
                  }

                  // Debug logging for delivery orders
                  if (dbOrder.order_type === 'delivery') {
                    console.log('Delivery order customer data:', {
                      orderId: dbOrder.id,
                      customerId: dbOrder.customer_id,
                      customerData: customerData,
                      addresses: customerData.addresses
                    });
                  }
                }
              } catch (error) {
                console.error(`Error fetching customer data for order ${dbOrder.id}:`, error);
                // Keep the basic customer data if fetching fails
              }
            }

            // Debug logging for draft orders
            if (dbOrder.order_type === 'draft') {
              console.log('Processing draft order from database:', {
                id: dbOrder.id,
                order_type: dbOrder.order_type,
                order_status: dbOrder.order_status
              });
            }

            return {
              id: dbOrder.id,
              orderNumber: dbOrder.order_type === 'draft'
                ? `DRAFT-${String(dbOrder.id).padStart(3, '0')}`
                : `ORD-${String(dbOrder.id).padStart(3, '0')}`,
              items: items,
              customer: customerData,
              total: dbOrder.order_amount,
              coupon: dbOrder.coupon_code
                ? {
                  code: dbOrder.coupon_code,
                  title: dbOrder.coupon_discount_title,
                  discount: dbOrder.coupon_discount_amount
                }
                : null,
              orderType:
                dbOrder.order_type === 'draft'
                  ? 'Draft'
                  : dbOrder.order_type === 'instore'
                    ? 'In Store'
                    : dbOrder.order_type === 'table'
                      ? 'Table'
                      : dbOrder.order_type === 'collection'
                        ? 'Collection'
                        : dbOrder.order_type === 'delivery'
                          ? 'Delivery'
                          : 'In Store',
              table: dbOrder.delivery_address_id ? 'Table ' + dbOrder.delivery_address_id : 'None',
              waiter: 'Ds Waiter',
              status:
                dbOrder.order_status === 'pending'
                  ? 'Pending'
                  : dbOrder.order_status === 'completed'
                    ? 'Complete'
                    : dbOrder.order_status === 'ready'
                      ? 'Ready'
                      : dbOrder.order_status,
              placedAt: dbOrder.created_at,
              databaseId: dbOrder.id,
              isDraft: dbOrder.order_type === 'draft'
            };
          } catch (error) {
            console.error(`Error processing order ${dbOrder.id}:`, error);
            // Return a basic order object on error
            return {
              id: dbOrder.id,
              orderNumber: dbOrder.order_type === 'draft'
                ? `DRAFT-${String(dbOrder.id).padStart(3, '0')}`
                : `ORD-${String(dbOrder.id).padStart(3, '0')}`,
              items: [],
              customer: {
                id: dbOrder.customer_id,
                name: dbOrder.customer_id ? `Customer ${dbOrder.customer_id}` : 'Walk-in Customer'
              },
              total: dbOrder.order_amount,
              coupon: null,
              orderType: dbOrder.order_type === 'draft' ? 'Draft' : 'In Store',
              table: 'None',
              waiter: 'Ds Waiter',
              status: dbOrder.order_status === 'pending' ? 'Pending' :
                dbOrder.order_status === 'completed' ? 'Complete' :
                  dbOrder.order_status === 'ready' ? 'Ready' :
                    dbOrder.order_status,
              placedAt: dbOrder.created_at,
              databaseId: dbOrder.id,
              isDraft: dbOrder.order_type === 'draft'
            };
          }
        });

        // Wait for all order details to be fetched
        const resolvedOrders = await Promise.all(transformedOrders);
        const validOrders = resolvedOrders.filter(order => !!order);

        // Merge with existing orders to avoid flicker/duplication
        setPlacedOrders(prev => {
          const byId = new Map();

          // Debug: Log existing orders before merge
          console.log('Existing orders before merge:', prev.map(o => ({ id: o.id, databaseId: o.databaseId, orderType: o.orderType, isDraft: o.isDraft })));
          console.log('New orders from database:', validOrders.map(o => ({ id: o.id, databaseId: o.databaseId, orderType: o.orderType, isDraft: o.isDraft })));

          [...prev, ...validOrders].forEach(order => {
            if (order) {
              // Use databaseId for merging to avoid conflicts between UI and database IDs
              const key = order.databaseId || order.id;

              // Debug: Log merge conflicts
              if (byId.has(key)) {
                const existing = byId.get(key);
                console.log('Merge conflict detected:', {
                  key,
                  existing: { id: existing.id, databaseId: existing.databaseId, orderType: existing.orderType, isDraft: existing.isDraft },
                  new: { id: order.id, databaseId: order.databaseId, orderType: order.orderType, isDraft: order.isDraft }
                });
              }

              byId.set(key, order);
            }
          });
          const merged = Array.from(byId.values());
          console.log('Merged active orders:', merged.map(o => ({ id: o.id, databaseId: o.databaseId, orderType: o.orderType, isDraft: o.isDraft })));
          return merged;
        });
        console.log('Transformed active orders loaded:', validOrders);
      } else {
        console.error('Failed to fetch existing orders:', result?.message);
      }
    } catch (error) {
      console.error('Error fetching existing orders:', error);
    }
  };

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchFloors(); // Add this line to fetch floors on component mount
    fetchExistingOrders(); // Load active orders from database
    fetchDraftOrders(); // Load draft orders from database
    // Removed auto-refresh - orders only update when user clicks refresh button
  }, []);

  // Set default order type to 'In Store' when component mounts and no order type is selected
  useEffect(() => {
    if (!selectedOrderType && shouldShowOrderType('instore')) {
      setSelectedOrderType('In Store');
    }
  }, [selectedOrderType, shouldShowOrderType]);

  // Debug selectedCustomer changes
  useEffect(() => {
    console.log('selectedCustomer changed to:', selectedCustomer);
    console.log('selectedCustomer name:', selectedCustomer?.name);
  }, [selectedCustomer]);

  // Clear invalid order type selection when settings change and set default to 'In Store'
  useEffect(() => {
    // If current selection is no longer available, set to 'In Store' if available
    if (selectedOrderType && !isOrderTypeValid(selectedOrderType)) {
      if (shouldShowOrderType('instore')) {
        setSelectedOrderType('In Store');
      } else {
        setSelectedOrderType(null);
      }
    }
    // If no order type is selected and 'In Store' is available, set it as default
    else if (!selectedOrderType && shouldShowOrderType('instore')) {
      setSelectedOrderType('In Store');
    }
  }, [orderTypeSettings, selectedOrderType, shouldShowOrderType]);

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
    // If in modification mode and current order type is already Table, don't allow changing floors
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing floor selection change');
      return;
    }
    setSelectedFloor(floor.name);
    // Don't reset table selection when changing floors - preserve the reservation
    // setSelectedTable('');
    // setSelectedPersons('');
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
    console.log('=== QUANTITY INCREASE DEBUG ===');
    console.log('Current quantity:', foodQuantity);
    setFoodQuantity(prev => {
      const newQuantity = prev + 1;
      console.log('New quantity:', newQuantity);
      return newQuantity;
    });
  };

  // Handle quantity decrease
  const handleQuantityDecrease = () => {
    console.log('=== QUANTITY DECREASE DEBUG ===');
    console.log('Current quantity:', foodQuantity);
    if (foodQuantity > 1) {
      setFoodQuantity(prev => {
        const newQuantity = prev - 1;
        console.log('New quantity:', newQuantity);
        return newQuantity;
      });
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // Prevent multiple simultaneous executions
    if (isAddingToCart) {
      console.log('Already adding item to cart, ignoring click');
      return;
    }

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

    setIsAddingToCart(true);

    // Sound will be played by updateCartItemQuantity function when needed

    console.log('=== ADD TO CART DEBUG ===');
    console.log('Adding to cart:', {
      food: selectedFood,
      variations: selectedVariations,
      adons: selectedAdons,
      quantity: foodQuantity,
      totalPrice: calculateTotalPrice()
    });
    console.log('foodQuantity state:', foodQuantity);
    console.log('selectedFood:', selectedFood);

    // Check if we're editing an existing cart item
    if (editingCartItem) {
      handleUpdateCartItem();
      return;
    }

    // Check if the same food item with the same variations and adons already exists in cart
    const existingCartItem = isFoodWithVariationsInCart(selectedFood, selectedVariations, selectedAdons);
    console.log('=== CHECKING FOR EXISTING CART ITEM ===');
    console.log('Existing cart item found:', existingCartItem);
    console.log('Selected food:', selectedFood);
    console.log('Selected variations:', selectedVariations);
    console.log('Selected adons:', selectedAdons);

    if (existingCartItem) {
      // If item with same variations and adons exists, increase quantity
      const newQuantity = existingCartItem.quantity + foodQuantity;
      console.log('=== UPDATING EXISTING ITEM QUANTITY ===');
      console.log('Existing item quantity:', existingCartItem.quantity);
      console.log('Adding quantity:', foodQuantity);
      console.log('New total quantity:', newQuantity);
      updateCartItemQuantity(existingCartItem.id, newQuantity);
      console.log('Increased quantity for existing item with variations and adons:', existingCartItem.food.name);

      // Show success alert
      showSuccess(`${existingCartItem.food.name} quantity increased!`);
    } else {
      // Create new cart item with all details
      console.log('=== FINAL QUANTITY CHECK BEFORE CART ITEM CREATION ===');
      console.log('foodQuantity state value:', foodQuantity);
      console.log('typeof foodQuantity:', typeof foodQuantity);
      
      const cartItem = {
        id: cartItemId,
        food: selectedFood,
        variations: selectedVariations,
        adons: selectedAdons,
        quantity: foodQuantity,
        totalPrice: calculateTotalPrice(),
        addedAt: new Date().toISOString()
      };
      
      console.log('=== CREATING CART ITEM ===');
      console.log('Cart item created:', cartItem);
      console.log('Quantity set to:', cartItem.quantity);

      // Add to cart
      setCartItems(prev => {
        console.log('Previous cart items:', prev);
        const newCart = [...prev, cartItem];
        console.log('New cart items:', newCart);
        return newCart;
      });
      setCartItemId(prev => prev + 1);
      console.log('Added new item to cart:', selectedFood.name);

      // Play sound for new item (with cooldown to prevent multiple sounds)
      const now = Date.now();
      if (now - lastSoundTime > 200) { // 200ms cooldown between sounds
        try {
          const audio = new Audio(getAudioPath('newProductAdd.mp3'));
          audio.play().catch(error => {
            console.log('Audio play failed:', error);
          });
          setLastSoundTime(now);
        } catch (error) {
          console.log('Audio creation failed:', error);
        }
      }

      // Show success alert
      showSuccess(`${selectedFood.name} added to cart!`);
    }

    // Close modal and reset
    setShowFoodModal(false);
    setSelectedFood(null);
    setSelectedVariations({});
    setSelectedAdons([]);
    setFoodQuantity(1); // Reset quantity
    setIsAddingToCart(false);
  };

  // Check if food item is already in cart (without variations)
  const isFoodInCart = (foodItem) => {
    return cartItems.find(item =>
      item.food?.id === foodItem.id &&
      JSON.stringify(item.variations) === JSON.stringify({})
    );
  };

  // Check if food item with specific variations is already in cart
  const isFoodWithVariationsInCart = (foodItem, variations, adons = []) => {
    return cartItems.find(item =>
      item.food?.id === foodItem.id &&
      JSON.stringify(item.variations) === JSON.stringify(variations) &&
      JSON.stringify(item.adons || []) === JSON.stringify(adons)
    );
  };

  // Check if any food item with the same ID exists in cart (regardless of variations)
  const isAnyFoodInCart = (foodItem) => {
    return cartItems.find(item => item.food?.id === foodItem.id);
  };

  // Clean up duplicate items in cart by merging quantities
  const cleanupDuplicateItems = () => {
    setCartItems(prevItems => {
      const itemMap = new Map();

      console.log('Before cleanup - Cart items:', prevItems);

      prevItems.forEach(item => {
        const key = `${item.food?.id || 'unknown'}-${JSON.stringify(item.variations)}`;
        console.log('Processing item:', item.food?.name || 'Unknown Food', 'with key:', key);

        if (itemMap.has(key)) {
          // Merge quantities
          const existing = itemMap.get(key);
          existing.quantity += item.quantity;
          existing.totalPrice = (existing.totalPrice / existing.quantity) * existing.quantity;
          console.log('Merged with existing item:', existing.food.name, 'new quantity:', existing.quantity);
        } else {
          // Add new item
          itemMap.set(key, { ...item });
          console.log('Added new item to map:', item.food?.name || 'Unknown Food');
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
    if (!foodItem) {
      console.error('Food item is undefined or null');
      return;
    }

    // Prevent multiple simultaneous executions
    if (isAddingToCart) {
      console.log('Already adding item to cart, ignoring click');
      return;
    }

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
      setIsAddingToCart(true);
      // If food is not in cart, fetch detailed food data to check for variations
      console.log('Fetching detailed food data for:', foodItem?.name || 'Unknown Food');
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

            // Play sound for new item (with cooldown to prevent multiple sounds)
            const now = Date.now();
            if (now - lastSoundTime > 200) { // 200ms cooldown between sounds
              try {
                const audio = new Audio(getAudioPath('newProductAdd.mp3'));
                audio.play().catch(error => {
                  console.log('Audio play failed:', error);
                });
                setLastSoundTime(now);
              } catch (error) {
                console.log('Audio creation failed:', error);
              }
            }

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
          console.log('Added food without variations directly to cart (fallback):', foodItem?.name || 'Unknown Food');

          // Play sound for new item (with cooldown to prevent multiple sounds)
          const now = Date.now();
          if (now - lastSoundTime > 200) { // 200ms cooldown between sounds
            try {
              const audio = new Audio(getAudioPath('newProductAdd.mp3'));
              audio.play().catch(error => {
                console.log('Audio play failed:', error);
              });
              setLastSoundTime(now);
            } catch (error) {
              console.log('Audio creation failed:', error);
            }
          }

          // Show success alert
          showSuccess(`${foodItem?.name || 'Unknown Food'} added to cart!`);
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
        console.log('Added food without variations directly to cart (error fallback):', foodItem?.name || 'Unknown Food');

        // Play sound for new item (with cooldown to prevent multiple sounds)
        const now = Date.now();
        if (now - lastSoundTime > 200) { // 200ms cooldown between sounds
          try {
            const audio = new Audio(getAudioPath('newProductAdd.mp3'));
            audio.play().catch(error => {
              console.log('Audio play failed:', error);
            });
            setLastSoundTime(now);
          } catch (error) {
            console.log('Audio creation failed:', error);
          }
        }

        // Show success alert
        showSuccess(`${foodItem?.name || 'Unknown Food'} added to cart!`);
      } finally {
        setFoodDetailsLoading(false);
        setIsAddingToCart(false);
      }
    }
  };

  // Handle table selection
  const handleTableSelect = (tableId) => {
    // If in modification mode and current order type is already Table, don't allow table changes
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing table selection change');
      showWarning('Cannot change table selection while modifying a table order');
      return;
    }
    setSelectedTable(tableId);
    // Reset persons when table changes
    setSelectedPersons('');
    // Automatically set order type to "Table" when a table is selected
    setSelectedOrderType('Table');
  };

  // Check if a table is reserved (previously selected)
  const isTableReserved = (tableId) => {
    return reservedTables.some(table => table.id === tableId);
  };

  // Get the currently selected table details
  const getSelectedTableDetails = () => {
    if (!selectedTable) return null;
    return tables.find(table => table.id.toString() === selectedTable);
  };

  // Add table to reserved tables
  const addReservedTable = (tableId, persons) => {
    // If in modification mode and current order type is already Table, don't allow adding reserved tables
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing reserved table addition');
      return;
    }
    const table = tables.find(t => t.id.toString() === tableId);
    if (table && !isTableReserved(tableId)) {
      setReservedTables(prev => [...prev, {
        id: tableId,
        tableNo: table.table_no,
        persons: persons,
        floor: selectedFloor
      }]);
      // Automatically set order type to "Table" when adding reserved tables
      setSelectedOrderType('Table');
    }
  };

  // Remove table from reserved tables
  const removeReservedTable = (tableId) => {
    // If in modification mode and current order type is already Table, don't allow removing reserved tables
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing reserved table removal');
      return;
    }
    setReservedTables(prev => prev.filter(table => table.id !== tableId));
  };

  // Handle persons selection
  const handlePersonsSelect = (persons) => {
    // If in modification mode and current order type is already Table, don't allow changing persons
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing persons selection change');
      return;
    }
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
    // If in modification mode and current order type is already Table, don't allow merge table modal
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing merge table modal');
      return;
    }
    setShowTableModal(false);
    setShowMergeTableModal(true);
    // Reset merge table selections to initial state
    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
  };

  // Handle back button in merge modal
  const handleBackToTableSelection = () => {
    // If in modification mode and current order type is already Table, don't allow going back to table selection
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing back to table selection');
      return;
    }
    setShowMergeTableModal(false);
    setShowTableModal(true);
    // Reset merge table selections when going back
    setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
  };

  // Handle merge table selections
  const handleMergeTable1Select = (tableId) => {
    // If in modification mode and current order type is already Table, don't allow merge table changes
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing merge table 1 selection');
      return;
    }
    setMergeTable1(tableId);
    // If the same table is selected in table2, clear it
    if (mergeTable2 === tableId) {
      setMergeTable2('');
    }
    // Automatically set order type to "Table" when selecting merge tables
    setSelectedOrderType('Table');
  };

  const handleMergeTable2Select = (tableId) => {
    // If in modification mode and current order type is already Table, don't allow merge table changes
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing merge table 2 selection');
      return;
    }
    setMergeTable2(tableId);
    // If the same table is selected in table1, clear it
    if (mergeTable1 === tableId) {
      setMergeTable1('');
    }
    // Automatically set order type to "Table" when selecting merge tables
    setSelectedOrderType('Table');
  };

  // Handle dynamic merge table selections
  const handleMergeTableSelectionChange = (selectionId, tableId) => {
    // If in modification mode and current order type is already Table, don't allow merge table changes
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing dynamic merge table selection');
      return;
    }
    setMergeTableSelections(prev =>
      prev.map(selection =>
        selection.id === selectionId
          ? { ...selection, tableId }
          : selection
      )
    );
    // Automatically set order type to "Table" when selecting merge tables
    setSelectedOrderType('Table');
  };

  // Add more table selection
  const handleAddMoreTableSelection = () => {
    // If in modification mode and current order type is already Table, don't allow adding more table selections
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing add more table selection');
      return;
    }
    const newId = Math.max(...mergeTableSelections.map(s => s.id)) + 1;
    setMergeTableSelections(prev => [...prev, { id: newId, tableId: '' }]);
  };

  // Remove table selection
  const handleRemoveTableSelection = (selectionId) => {
    // If in modification mode and current order type is already Table, don't allow removing table selections
    if (isModifyingOrder && selectedOrderType === 'Table') {
      console.log('In modification mode with Table order type - preventing remove table selection');
      return;
    }
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
    console.log('handleCustomerSelect called with:', customer);
    console.log('Current selectedOrderType:', selectedOrderType);
    console.log('Customer name:', customer?.name);
    console.log('Customer id:', customer?.id);

    // Set customer first
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    setShowCustomerSearchModal(false);

    console.log('Customer set, selectedCustomer should be:', customer);
    console.log('Customer name after setting:', customer?.name);

    // Check if customer needs editing based on order type
    if (customer && selectedOrderType) {
      let needsEdit = false;

      // Only validate for Collection and Delivery orders
      // In Store and Table orders don't require validation
      if (selectedOrderType === 'Delivery') {
        const hasPhone = customer.phone && customer.phone.trim().length > 0;
        const hasAddress = customer.addresses && customer.addresses.length > 0;

        console.log('Delivery validation - hasPhone:', hasPhone, 'hasAddress:', hasAddress);

        if (!hasPhone || !hasAddress) {
          needsEdit = true;
        }
      }
      else if (selectedOrderType === 'Collection') {
        const hasPhone = customer.phone && customer.phone.trim().length > 0;

        console.log('Collection validation - hasPhone:', hasPhone);

        if (!hasPhone) {
          needsEdit = true;
        }
      }
      // For In Store and Table orders, no validation needed
      else if (selectedOrderType === 'In Store' || selectedOrderType === 'Table') {
        console.log('In Store/Table order - no validation needed');
        // No validation required, customer can be selected directly
      }

      // Show edit modal if validation fails
      if (needsEdit) {
        console.log('Opening edit modal for customer');
        setShowEditModal(true);
        return; // Don't trigger customer update event yet
      }
    }

    console.log('Customer selection completed successfully');

    // If we're in split bill mode and have a selected split bill, update that split's customer
    if (showSplitBillModal && selectedSplitBill) {
      handleSplitBillCustomerChange(selectedSplitBill.id, customer.name);
    }

    // If this is a new customer (has an ID), trigger update event
    if (customer && customer.id) {
      window.dispatchEvent(new CustomEvent('customerUpdated', {
        detail: { customer: customer }
      }));
    }
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
    console.log('handleEditCustomer called with:', updatedCustomer);
    console.log('Current selectedOrderType:', selectedOrderType);

    // Always set the customer first
    setSelectedCustomer(updatedCustomer);

    // Validate that the updated customer has all required data for the current order type
    if (updatedCustomer && selectedOrderType) {
      let hasRequiredData = true;

      // Check for Delivery orders
      if (selectedOrderType === 'Delivery') {
        const hasPhone = updatedCustomer.phone && updatedCustomer.phone.trim().length > 0;
        const hasAddress = updatedCustomer.addresses && updatedCustomer.addresses.length > 0;

        console.log('Delivery validation - hasPhone:', hasPhone, 'hasAddress:', hasAddress);

        if (!hasPhone || !hasAddress) {
          hasRequiredData = false;
        }
      }
      // Check for Collection orders
      else if (selectedOrderType === 'Collection') {
        const hasPhone = updatedCustomer.phone && updatedCustomer.phone.trim().length > 0;

        console.log('Collection validation - hasPhone:', hasPhone);

        if (!hasPhone) {
          hasRequiredData = false;
        }
      }
      // For In Store and Table orders, no validation needed
      else if (selectedOrderType === 'In Store' || selectedOrderType === 'Table') {
        console.log('In Store/Table order - no validation needed');
        hasRequiredData = true;
      }

      console.log('Customer validation result:', hasRequiredData);
    }

    setShowEditModal(false);

    // Trigger a custom event to refresh customer list in CustomerSearchModal
    window.dispatchEvent(new CustomEvent('customerUpdated', {
      detail: { customer: updatedCustomer }
    }));
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

  const handleOpenEditModal = async (customerToEdit) => {
    const customer = customerToEdit ?? selectedCustomer;
    if (!customer) {
      showError('No customer selected to edit');
      return;
    }

    try {
      // Fetch the customer's addresses before opening edit form
      const addressResult = await window.myAPI?.getCustomerAddresses(customer.id);
      if (addressResult && addressResult.success) {
        const customerWithAddresses = {
          ...customer,
          addresses: addressResult.data || []
        };
        setSelectedCustomer(customerWithAddresses);
      } else {
        setSelectedCustomer(customer);
      }
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
      setSelectedCustomer(customer);
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

  // Handle keyboard input changes - matching FoodForm.jsx pattern
  const updateFieldFromKeyboard = (fieldName, value) => {
    if (fieldName === 'searchQuery') {
      setSearchQuery(value);
    } else if (fieldName === 'runningOrdersSearchQuery') {
      setRunningOrdersSearchQuery(value);
    } else if (fieldName === 'couponCode') {
      setCouponCode(value);
    } else if (fieldName === 'discountAmount') {
      setDiscountAmount(value);
    } else if (fieldName === 'customIngredientInput') {
      setCustomIngredientInput(value);
    } else if (fieldName === 'pizzaNote') {
      setPizzaNote(value);
    } else if (fieldName === 'customFoodName') {
      setCustomFoodName(value);
    } else if (fieldName === 'customFoodNote') {
      setCustomFoodNote(value);
    }
  };

  const getValueForActiveInput = (fieldName) => {
    if (fieldName === 'searchQuery') return searchQuery || '';
    if (fieldName === 'runningOrdersSearchQuery') return runningOrdersSearchQuery || '';
    if (fieldName === 'couponCode') return couponCode || '';
    if (fieldName === 'discountAmount') return discountAmount || '';
    if (fieldName === 'customIngredientInput') return customIngredientInput || '';
    if (fieldName === 'pizzaNote') return pizzaNote || '';
    if (fieldName === 'customFoodName') return customFoodName || '';
    if (fieldName === 'customFoodNote') return customFoodNote || '';
    return '';
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
        // Calculate change based on the total
        if (input) {
          const total = isSinglePayMode ? calculateSinglePayTotals().total :
            selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
          const change = parseFloat(input) - total;
          setChangeAmount(change > 0 ? change.toFixed(2) : '0.00');
        } else {
          setChangeAmount('0.00');
        }
      }
    } else if (numericActiveInput === 'givenAmount') {
      setGivenAmount(input);
      setPaymentAmount(input);
      // Calculate change based on the total
      if (input) {
        const total = isSinglePayMode ? calculateSinglePayTotals().total :
          selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
        const change = parseFloat(input) - total;
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
    console.log('=== UPDATE CART ITEM QUANTITY DEBUG ===');
    console.log('Updating item ID:', itemId, 'to quantity:', newQuantity);
    console.log('Current cart items:', cartItems.map(item => ({ id: item.id, quantity: item.quantity })));
    console.log('Looking for item with ID:', itemId);
    
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      console.log('Quantity is 0 or less, removing item');
      removeCartItem(itemId);
      return;
    }

    // Clear existing timeout
    if (quantityUpdateTimeout) {
      clearTimeout(quantityUpdateTimeout);
    }

    // Play sound only if enough time has passed since last sound (prevent rapid sounds)
    const now = Date.now();
    if (now - lastSoundTime > 200) { // 200ms cooldown between sounds
      try {
        const audio = new Audio(getAudioPath('newProductAdd.mp3'));
        audio.play().catch(error => {
          console.log('Audio play failed:', error);
        });
        setLastSoundTime(now);
      } catch (error) {
        console.log('Audio creation failed:', error);
      }
    }

    // Update state immediately (remove debouncing for quantity updates)
    setCartItems(prev => prev.map(item => {
      console.log('Checking item:', { id: item.id, quantity: item.quantity }, 'against target ID:', itemId);
      if (item.id === itemId) {
        console.log('Found matching item, updating quantity from', item.quantity, 'to', newQuantity);
        // Handle custom pizza and custom food items
        if (item.isCustomPizza || item.isCustomFood) {
          const newTotalPrice = item.price * newQuantity;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: newTotalPrice
          };
        }

        // Handle regular food items
        // Recalculate total price based on new quantity
        const basePrice = item.food?.price || 0;
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

        const updatedItem = {
          ...item,
          quantity: newQuantity,
          totalPrice: newTotalPrice
        };
        
        console.log('Updated cart item:', updatedItem);
        console.log('Final quantity:', updatedItem.quantity);
        return updatedItem;
      }
      console.log('Item ID', item.id, 'does not match target ID', itemId, '- keeping unchanged');
      return item;
    }));
  };

  const removeCartItem = (itemId) => {
    // Get the item name before removing it for the alert message
    const itemToRemove = cartItems.find(item => item.id === itemId);
    const itemName = itemToRemove ?
      (itemToRemove.isCustomPizza ? 'Split Pizza' :
        itemToRemove.isCustomFood ? 'Open Food' :
          itemToRemove.food.name) :
      'Item';

    // Remove the item from cart
    setCartItems(prev => prev.filter(item => item.id !== itemId));

    // Show success alert
    showSuccess(`${itemName} removed from cart!`);
  };

  // Handle editing cart item
  const handleEditCartItem = async (cartItem) => {
    console.log('=== EDIT BUTTON CLICKED ===');
    console.log('Editing cart item:', cartItem);
    console.log('Is custom pizza:', cartItem.isCustomPizza);
    console.log('Item keys:', Object.keys(cartItem));

    // Check if it's a custom food item
    if (cartItem.isCustomFood) {
      console.log('=== CUSTOM FOOD DETECTED ===');
      console.log('Editing custom food:', cartItem);

      // Handle custom food editing
      setEditingCustomFood(cartItem);

      // Set custom food modal state with existing data
      setCustomFoodName(cartItem.customFoodName || '');
      setCustomFoodPrice(cartItem.price.toString());
      setCustomFoodNote(cartItem.customFoodNote || '');
      setCustomFoodIngredients(cartItem.customFoodIngredients || []);

      console.log('Set custom food data for editing:', {
        name: cartItem.customFoodName || '',
        price: cartItem.price.toString(),
        note: cartItem.customFoodNote || '',
        ingredients: cartItem.customFoodIngredients || []
      });
      console.log('Raw cartItem.customFoodNote:', cartItem.customFoodNote);
      console.log('Setting customFoodNote to:', cartItem.customFoodNote || '');

      // Open custom food modal
      console.log('=== SETTING CUSTOM FOOD MODAL TO TRUE ===');
      setShowOpenOrderModal(true);
      console.log('Opening custom food modal for editing');
      return;
    }

    // Check if it's a custom pizza - also check for other indicators
    if (cartItem.isCustomPizza || cartItem.slices || cartItem.size || cartItem.selectedPizzas) {
      console.log('=== CUSTOM PIZZA DETECTED ===');
      console.log('Editing custom pizza:', cartItem);

      // Handle custom pizza editing
      setEditingCartItem(cartItem);

      // Set pizza modal state with existing data
      setPizzaSlices(cartItem.slices || 4);
      setPizzaPrice(cartItem.price.toString());
      setPizzaSize(cartItem.size || '12');
      setPizzaNote(cartItem.customNote || '');

      // Set pizza selection and ingredients
      setSelectedPizzaPerSlice(cartItem.selectedPizzas || {});
      setFlavorIngredients(cartItem.flavorIngredients || {});

      console.log('Set pizza data for editing:', {
        slices: cartItem.slices || 4,
        price: cartItem.price.toString(),
        size: cartItem.size || '12',
        note: cartItem.customNote || '',
        selectedPizzas: cartItem.selectedPizzas || {},
        flavorIngredients: cartItem.flavorIngredients || {}
      });

      // Open pizza modal
      console.log('=== SETTING MODAL TO TRUE ===');
      setShowSplitPizzaModal(true);
      console.log('Opening split pizza modal for editing');
      console.log('Modal should now be visible');
      return;
    }

    // Handle regular food item editing
    setEditingCartItem(cartItem);
    setSelectedFood(cartItem.food);

    // Parse variations and addons if they're strings
    let variations = {};
    let adons = [];

    try {
      if (typeof cartItem.variations === 'string') {
        variations = JSON.parse(cartItem.variations);
      } else {
        variations = cartItem.variations || {};
      }

      if (typeof cartItem.adons === 'string') {
        adons = JSON.parse(cartItem.adons);
      } else {
        adons = cartItem.adons || [];
      }
    } catch (error) {
      console.error('Error parsing variations/addons for editing:', error);
      variations = cartItem.variations || {};
      adons = cartItem.adons || [];
    }

    console.log('Setting variations for editing:', variations);
    console.log('Setting addons for editing:', adons);

    setSelectedVariations(variations);
    setSelectedAdons(adons);
    setFoodQuantity(cartItem.quantity);

    // Load food details to get proper variation and addon names
    try {
      setFoodDetailsLoading(true);
      const result = await window.myAPI.getFoodById(cartItem.food.id);
      if (result && result.success) {
        setFoodDetails(result.data);
        console.log('Food details loaded for editing:', result.data);
      }
    } catch (error) {
      console.error('Error loading food details for editing:', error);
    } finally {
      setFoodDetailsLoading(false);
    }

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

  // Get tax rate from settings
  const getTaxRate = () => {
    // Use food_tax if available, otherwise fall back to standard_tax, then default to 0
    const foodTax = parseFloat(settings?.food_tax) || 0;
    const standardTax = parseFloat(settings?.standard_tax) || 0;
    return foodTax > 0 ? foodTax : standardTax;
  };

  // Calculate tax for a specific amount
  const calculateTaxAmount = (amount) => {
    const taxRate = getTaxRate();
    return (amount * taxRate) / 100;
  };

  // Calculate cart totals (only include items with quantity > 0)
  const calculateCartSubtotal = () => {
    return cartItems.filter(item => item.quantity > 0).reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateCartTax = () => {
    const subtotal = calculateCartSubtotal();
    return calculateTaxAmount(subtotal);
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
  const clearCart = (clearDraftId = false) => {
    console.log('=== CLEAR CART FUNCTION CALLED ===');
    console.log('Current cartItems before clearing:', cartItems);
    console.log('Cart items count before clearing:', cartItems.length);
    
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
    setReservedTables([]); // Clear all reserved tables
    setEditingCartItem(null);
    setFoodQuantity(1);
    setSelectedVariations({});
    setSelectedAdons([]);
    setSelectedOrderType('In Store');
    setSelectedScheduleDateTime(''); // Clear schedule when clearing cart

    // Clear modification flags when starting fresh
    setIsModifyingOrder(false);
    setModifyingOrderId(null);

    // Clear current draft ID, position, and number if starting a completely new order
    if (clearDraftId) {
      setCurrentDraftId(null);
      setCurrentDraftPosition(null);
      setCurrentDraftNumber(null);
      console.log('Cleared current draft ID, position, and number for new order');
    }

    console.log('Cart cleared successfully - itemCount was:', itemCount);
    console.log('Cart state should now be empty');

    // Show success alert if there were items in the cart
    if (itemCount > 0) {
      showSuccess(`All ${itemCount} item${itemCount === 1 ? '' : 's'} removed from cart!`);
    }
  };

  // Start new order function (clears draft ID and cart)
  const startNewOrder = () => {
    clearCart(true); // Clear cart and draft ID for new order
  };

  // Fetch all ingredients for custom food
  const fetchAllIngredients = async () => {
    try {
      const result = await window.myAPI.getAllIngredients();
      if (result.success) {
        setAllIngredients(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setAllIngredients([]);
    }
  };

  // Open Order Modal Functions
  const handleOpenOrderModal = async () => {
    if (!editingCustomFood) {
      // Reset state for new custom food
      setCustomFoodName('');
      setCustomFoodPrice('');
      setCustomFoodNote('');
      setCustomFoodIngredients([]);
      setCustomIngredientInput('');
      setShowIngredientSuggestions(false);
      setIngredientSuggestions([]);
    }

    // Fetch ingredients when opening modal
    await fetchAllIngredients();
    setShowOpenOrderModal(true);
  };

  const handleCloseOpenOrderModal = () => {
    setShowOpenOrderModal(false);
    setCustomFoodName('');
    setCustomFoodPrice('');
    setCustomFoodNote('');
    setCustomFoodIngredients([]);
    setCustomIngredientInput('');
    setShowIngredientSuggestions(false);
    setIngredientSuggestions([]);
    setEditingCustomFood(null);
  };

  const handleSaveCustomFood = () => {
    // Validation
    if (!customFoodName.trim()) {
      showError('Please enter a food name');
      return;
    }
    if (!customFoodPrice || parseFloat(customFoodPrice) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    const customPrice = parseFloat(customFoodPrice);
    const tax = calculateTaxAmount(customPrice);
    const totalPrice = customPrice + tax;

    const customFoodItem = {
      id: editingCustomFood ? editingCustomFood.id : `custom_food_${Date.now()}`,
      name: `Open Food - ${customFoodName}`,
      price: customPrice,
      tax: tax,
      totalPrice: totalPrice,
      quantity: editingCustomFood ? editingCustomFood.quantity : 1,
      variations: {},
      adons: [],
      customFoodName: customFoodName,
      customFoodNote: customFoodNote,
      customFoodIngredients: customFoodIngredients,
      isCustomFood: true
    };

    if (editingCustomFood) {
      setCartItems(prev => prev.map(item =>
        item.id === editingCustomFood.id ? customFoodItem : item
      ));
      showSuccess(`Custom food "${customFoodName}" updated!`);
    } else {
      setCartItems(prev => [...prev, customFoodItem]);
      playButtonSound();
      showSuccess(`Custom food "${customFoodName}" added to order!`);
    }

    setEditingCustomFood(null);
    handleCloseOpenOrderModal();
  };

  // Handle ingredient input for custom food
  const handleCustomIngredientInputChange = (e) => {
    const value = e.target.value;
    setCustomIngredientInput(value);

    console.log('Ingredient input changed:', value);
    console.log('All ingredients available:', allIngredients.length);

    if (value.length > 0) {
      // Filter ingredients based on input
      const filtered = allIngredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(value.toLowerCase())
      );
      console.log('Filtered ingredients:', filtered);
      setIngredientSuggestions(filtered);
      setShowIngredientSuggestions(true);
    } else {
      setShowIngredientSuggestions(false);
      setIngredientSuggestions([]);
    }
  };

  const handleAddCustomIngredient = (ingredient) => {
    console.log('Adding ingredient:', ingredient);
    if (!customFoodIngredients.find(ing => ing.id === ingredient.id)) {
      setCustomFoodIngredients(prev => {
        const newIngredients = [...prev, ingredient];
        console.log('Updated ingredients:', newIngredients);
        return newIngredients;
      });
    }
    setCustomIngredientInput('');
    setShowIngredientSuggestions(false);
    setIngredientSuggestions([]);
  };

  const handleRemoveCustomIngredient = (ingredientId) => {
    setCustomFoodIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
  };

  // Split Pizza Modal Functions
  const handleOpenSplitPizzaModal = async () => {
    // Only reset state if we're not editing an existing item
    if (!editingCartItem) {
      setPizzaSlices(2);
      setSelectedPizzaPerSlice({});
      setIngredientsPerSlice({});
      setPizzaIngredients([]);
      setCustomIngredientInput('');
      setIngredientSuggestions([]);
      setShowIngredientSuggestions(false);
      setCurrentIngredients([]);
      setPizzaPrice('');
      setPizzaSize('12');
      setPizzaNote('');
      setSelectedFlavorForEditing(null);
      setFlavorIngredients({});
      setRemovedDefaultIngredients({});
    }

    setShowSplitPizzaModal(true);
    await fetchPizzaFoods();
  };

  // Fetch pizza foods from database
  const fetchPizzaFoods = async () => {
    try {
      const result = await window.myAPI.getPizzaFoods();
      if (result.success) {
        setPizzaFoods(result.data || []);
      } else {
        console.error('Failed to fetch pizza foods:', result.message);
        showError('Failed to load pizza options');
      }
    } catch (error) {
      console.error('Error fetching pizza foods:', error);
      showError('Error loading pizza options');
    }
  };

  // Handle pizza food selection for a specific slice
  const handleSlicePizzaSelect = async (sliceIndex, foodId) => {
    try {
      const selectedFood = pizzaFoods.find(food => food.id === parseInt(foodId));
      if (selectedFood) {
        // Update pizza selection for this slice
        setSelectedPizzaPerSlice(prev => ({
          ...prev,
          [sliceIndex]: selectedFood
        }));

        // Automatically select this flavor for ingredient editing
        setSelectedFlavorForEditing(sliceIndex);

        // Fetch ingredients for this pizza
        const result = await window.myAPI.getFoodIngredients(foodId);
        if (result.success) {
          const ingredients = result.data || [];
          setIngredientsPerSlice(prev => ({
            ...prev,
            [sliceIndex]: ingredients
          }));

          // Check if we already have saved ingredients for this slice
          const existingFlavorIngredients = flavorIngredients[sliceIndex];

          if (existingFlavorIngredients && existingFlavorIngredients.default.length > 0) {
            // If we have saved ingredients, keep them (user has already modified this slice)
            console.log(`Keeping saved ingredients for slice ${sliceIndex}:`, existingFlavorIngredients);
          } else {
            // Initialize with fresh default ingredients only if no saved data exists
            setFlavorIngredients(prev => ({
              ...prev,
              [sliceIndex]: {
                default: ingredients,
                custom: []
              }
            }));
            console.log(`Initialized fresh ingredients for slice ${sliceIndex}:`, ingredients);
          }
        } else {
          console.error('Failed to fetch pizza ingredients:', result.message);
          setIngredientsPerSlice(prev => ({
            ...prev,
            [sliceIndex]: []
          }));
          setFlavorIngredients(prev => ({
            ...prev,
            [sliceIndex]: {
              default: [],
              custom: []
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error selecting pizza for slice:', error);
      showError('Error loading pizza ingredients for slice');
    }
  };

  // Handle custom ingredient input with alphabetical suggestions
  const handleCustomIngredientInput = async (value) => {
    setCustomIngredientInput(value);

    if (value.length >= 1) {
      try {
        const result = await window.myAPI.searchIngredientsByName(value);
        if (result.success) {
          // Sort suggestions alphabetically
          const sortedSuggestions = (result.data || []).sort((a, b) =>
            a.name.toLowerCase().localeCompare(b.name.toLowerCase())
          );
          setIngredientSuggestions(sortedSuggestions);
          setShowIngredientSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching ingredient suggestions:', error);
        setIngredientSuggestions([]);
        setShowIngredientSuggestions(false);
      }
    } else {
      setIngredientSuggestions([]);
      setShowIngredientSuggestions(false);
    }
  };

  // Handle ingredient suggestion selection
  const handleIngredientSuggestionSelect = (ingredient) => {
    setCustomIngredientInput(ingredient.name);
    setShowIngredientSuggestions(false);
    setIngredientSuggestions([]);
  };

  // Add custom ingredient for pizza
  const handleAddPizzaCustomIngredient = () => {
    if (!customIngredientInput.trim()) {
      return;
    }

    // Check if a flavor is selected for editing
    if (selectedFlavorForEditing === null) {
      showError('Please select a flavor first');
      return;
    }

    const newIngredient = {
      id: `custom_${Date.now()}`,
      name: customIngredientInput.trim(),
      isCustom: true
    };

    // Add to the current flavor's custom ingredients
    setFlavorIngredients(prev => {
      const updated = {
        ...prev,
        [selectedFlavorForEditing]: {
          default: prev[selectedFlavorForEditing]?.default || [],
          custom: [...(prev[selectedFlavorForEditing]?.custom || []), newIngredient]
        }
      };
      console.log(`Added custom ingredient "${newIngredient.name}" to slice ${selectedFlavorForEditing}. Updated ingredients:`, updated[selectedFlavorForEditing]);
      return updated;
    });

    setCustomIngredientInput('');
    setShowIngredientSuggestions(false);
    setIngredientSuggestions([]);
  };

  // Save custom pizza to cart
  const handleSaveCustomPizza = () => {
    if (!pizzaPrice || pizzaPrice <= 0) {
      showError('Please enter a valid price for the pizza');
      return;
    }

    // Validate that at least one slice has a pizza selected
    const hasSelectedPizza = Object.keys(selectedPizzaPerSlice).some(sliceIndex => selectedPizzaPerSlice[sliceIndex]);
    if (!hasSelectedPizza) {
      showError('Please select at least one pizza type for the slices');
      return;
    }

    const customPrice = parseFloat(pizzaPrice);
    const tax = calculateTaxAmount(customPrice);
    const totalPrice = customPrice + tax;

    // Create custom pizza item with all slice data
    const customPizzaItem = {
      id: editingCartItem ? editingCartItem.id : `custom_pizza_${Date.now()}`,
      name: `Custom Pizza (${pizzaSize}" - ${pizzaSlices} halves)`,
      price: customPrice,
      tax: tax,
      totalPrice: totalPrice,
      quantity: editingCartItem ? editingCartItem.quantity : 1,
      variations: {},
      adons: [],
      slices: pizzaSlices,
      size: pizzaSize,
      selectedPizzas: selectedPizzaPerSlice,
      flavorIngredients: flavorIngredients,
      sliceColors: sliceColors,
      customNote: pizzaNote,
      isCustomPizza: true
    };

    if (editingCartItem) {
      // Update existing custom pizza in cart
      setCartItems(prev => prev.map(item =>
        item.id === editingCartItem.id ? customPizzaItem : item
      ));
      showSuccess(`Custom ${pizzaSize}" pizza with ${pizzaSlices} halves updated!`);
    } else {
      // Add new custom pizza to cart
      setCartItems(prev => [...prev, customPizzaItem]);

      // Play sound
      try {
        const audio = new Audio(getAudioPath('newProductAdd.mp3'));
        audio.play().catch(error => console.log('Audio play failed:', error));
      } catch (error) {
        console.log('Audio creation failed:', error);
      }

      showSuccess(`Custom ${pizzaSize}" pizza with ${pizzaSlices} halves added to cart!`);
    }

    // Reset editing state
    setEditingCartItem(null);

    // Close modal
    handleCloseSplitPizzaModal();
  };

  const handleCloseSplitPizzaModal = () => {
    setShowSplitPizzaModal(false);
    setPizzaSlices(2);
    setSelectedPizzaPerSlice({});
    setIngredientsPerSlice({});
    setPizzaIngredients([]);
    setCustomIngredientInput('');
    setIngredientSuggestions([]);
    setShowIngredientSuggestions(false);
    setCurrentIngredients([]);
    setPizzaPrice('');
    setPizzaSize('12');
    setPizzaNote('');
    setRemovedDefaultIngredients({});
    setFlavorIngredients({});
    setSelectedFlavorForEditing(null);

    // Reset editing state when closing modal
    setEditingCartItem(null);

    console.log('Pizza modal closed - all state reset');
  };




  const handlePizzaSlicesChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 2 && value <= 4) {
      setPizzaSlices(value);
    }
  };





  // Get ingredients for selected slice/half
  const getIngredientsForSelectedSlice = (sliceIndex) => {
    if (selectedPizzaPerSlice[sliceIndex] && ingredientsPerSlice[sliceIndex]) {
      return ingredientsPerSlice[sliceIndex];
    }
    return [];
  };

  // Get saved ingredients for a specific slice (user's modifications)
  const getSavedIngredientsForSlice = (sliceIndex) => {
    return flavorIngredients[sliceIndex] || { default: [], custom: [] };
  };

  // State to track current ingredients for better reactivity
  const [currentIngredients, setCurrentIngredients] = useState([]);

  // Order Details Modal State
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);



  // Different colors for each slice - default dark yellow, then specific colors when selected
  const sliceColors = [
    "#B8860B", // Dark Goldenrod (default)
    "#8B4513", // Saddle Brown
    "#2F4F4F", // Dark Slate Gray
    "#8B008B"  // Dark Magenta
  ];

  const renderPizzaSlices = () => {
    const slices = [];
    const angleStep = 360 / pizzaSlices;

    for (let i = 0; i < pizzaSlices; i++) {
      const startAngle = i * angleStep;
      const endAngle = (i + 1) * angleStep;
      const hasPizzaSelected = selectedPizzaPerSlice[i]; // Check if pizza is selected for this slice

      // Calculate the slice path
      const x1 = 100 + 80 * Math.cos(startAngle * Math.PI / 180);
      const y1 = 100 + 80 * Math.sin(startAngle * Math.PI / 180);
      const x2 = 100 + 80 * Math.cos(endAngle * Math.PI / 180);
      const y2 = 100 + 80 * Math.sin(endAngle * Math.PI / 180);

      // Create large arc flag (1 if angle > 180 degrees, 0 otherwise)
      const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

      // Determine fill color - default dark yellow, change when pizza is selected
      let fillColor = "#B8860B"; // Default dark yellow

      if (hasPizzaSelected) {
        // Use slice-specific color when pizza is selected
        fillColor = sliceColors[i] || "#B8860B";
      }

      slices.push(
        <g key={i}>
          {/* Visible slice */}
          <path
            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
            fill={fillColor}
            stroke="#FF8C00"
            strokeWidth="2"
            style={{
              transition: 'fill 0.3s ease-in-out'
            }}
          />
        </g>
      );
    }

    return slices;
  };

  // Generate notification data based on order type
  const generateOrderNotification = (orderType, orderId, customerName, tableDetails) => {
    const baseNotification = {
      title: '',
      description: '',
      icon: '',
      iconColor: ''
    };

    switch (orderType) {
      case 'instore':
        return {
          ...baseNotification,
          title: 'In Store Order',
          description: `New in-store order #${orderId} placed`,
          icon: 'store',
          iconColor: 'bg-blue-500'
        };
      case 'table':
        const tableInfo = tableDetails ? JSON.parse(tableDetails) : null;
        const tableName = tableInfo?.tables?.[0]?.table_no || 'Unknown';
        return {
          ...baseNotification,
          title: 'Table Order',
          description: `New order #${orderId} from Table ${tableName}`,
          icon: 'table',
          iconColor: 'bg-purple-500'
        };
      case 'collection':
        return {
          ...baseNotification,
          title: 'Collection Order',
          description: `New collection order #${orderId} from ${customerName || 'Customer'}`,
          icon: 'package',
          iconColor: 'bg-orange-500'
        };
      case 'delivery':
        return {
          ...baseNotification,
          title: 'Delivery Order',
          description: `New delivery order #${orderId} to ${customerName || 'Customer'}`,
          icon: 'truck',
          iconColor: 'bg-green-500'
        };
      default:
        return {
          ...baseNotification,
          title: 'New Order',
          description: `New order #${orderId} placed`,
          icon: 'shopping-cart',
          iconColor: 'bg-red-500'
        };
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called with cartItems:', cartItems);
    console.log('cartItems length:', cartItems.length);
    
    if (cartItems.length === 0) {
      showError('Please add items to cart before placing order');
      return;
    }

    // Validate order type selection
    if (!validateOrderTypeSelection()) {
      return;
    }

    // Reset single pay mode when placing order normally (not from PAY button)
    // This ensures kitchen and employee invoices show for PLACE ORDER button
    setIsSinglePayMode(false);


    // Check if customer is selected for delivery orders
    if (selectedOrderType === 'Delivery' && !selectedCustomer) {
      showError('Select customer first');
      return;
    }

    // Check if customer is selected for collection orders
    if (selectedOrderType === 'Collection' && !selectedCustomer) {
      showError('Select customer first');
      return;
    }

    // Check phone number for Collection and Delivery orders
    if ((selectedOrderType === 'Collection' || selectedOrderType === 'Delivery') && selectedCustomer) {
      if (!selectedCustomer.phone || selectedCustomer.phone.trim().length === 0) {
        // Open customer management modal to edit phone number
        setShowEditModal(true);
        return;
      }
    }

    // Check if customer has address for delivery orders
    if (selectedOrderType === 'Delivery' && selectedCustomer) {
      console.log('Delivery order validation - Customer data:', selectedCustomer);
      console.log('Customer addresses:', selectedCustomer.addresses);

      // Check if customer has addresses array with at least one address
      if (!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) {
        console.log('No addresses found for customer');
        // Open customer management modal to edit address
        setShowEditModal(true);
        return;
      }

      // Additional check: ensure at least one address has a valid address field
      const hasValidAddress = selectedCustomer.addresses.some(addr =>
        addr && addr.address && addr.address.trim().length > 0
      );

      console.log('Has valid address:', hasValidAddress);
      console.log('Address details:', selectedCustomer.addresses.map(addr => ({
        id: addr.id,
        address: addr.address,
        code: addr.code,
        hasAddress: addr && addr.address && addr.address.trim().length > 0
      })));

      if (!hasValidAddress) {
        // Open customer management modal to edit address
        setShowEditModal(true);
        return;
      }

      // If we reach here, customer has valid addresses for delivery
      console.log('Customer validation passed - ready for delivery order');
    }

    try {
      console.log('Starting order placement process...');
      console.log('Is modifying order:', isModifyingOrder);
      console.log('Modifying order ID:', modifyingOrderId);

      // Check if API is available
      if (!window.myAPI) {
        console.error('API not available - window.myAPI is undefined');
        showError('API not available. Please refresh the page.');
        return;
      }
      
      console.log('API is available:', !!window.myAPI);
      console.log('createOrder method available:', !!window.myAPI.createOrder);

      // Map order type based on selection
      console.log('Mapping order type. selectedOrderType:', selectedOrderType);
      let orderType = 'instore'; // default for database
      if (selectedOrderType === 'Table') {
        orderType = 'table';
      } else if (selectedOrderType === 'Collection') {
        orderType = 'collection';
      } else if (selectedOrderType === 'Delivery') {
        orderType = 'delivery';
      } else if (selectedOrderType === 'In Store') {
        orderType = 'instore';
      }
      console.log('Mapped to database order type:', orderType);

      // Calculate totals
      const subtotal = calculateCartSubtotal();
      const tax = calculateCartTax();
      const discount = calculateCartDiscount();
      const total = calculateCartTotal();

      // Prepare table details for database
      let tableDetails = null;
      let tableIdsToReserve = [];

      if (conversionOrderType === 'Table' && conversionTable) {
        // Handle single table selection for conversion
        const table = tables.find(t => t.id.toString() === conversionTable);
        if (table) {
          tableDetails = JSON.stringify({
            tables: [{
              id: table.id,
              table_no: table.table_no,
              floor_name: table.floor_name,
              persons: conversionPersons || table.seat_capacity || 4
            }],
            total_persons: conversionPersons || table.seat_capacity || 4
          });
          tableIdsToReserve.push(table.id);
        }
      }

      // Map selected status to database status
      let dbStatus = 'pending';
      switch (selectedNewOrderStatus) {
        case 'New':
          dbStatus = 'new';
          break;
        case 'In Progress':
          dbStatus = 'in_progress';
          break;
        case 'Ready':
          dbStatus = 'ready';
          break;
        case 'On the way':
          dbStatus = 'on_the_way';
          break;
        case 'Delivered':
          dbStatus = 'delivered';
          break;
        case 'Completed':
          dbStatus = 'completed';
          break;
        case 'Pending':
          dbStatus = 'pending';
          break;
        case 'Complete':
          dbStatus = 'completed';
          break;
        default:
          dbStatus = selectedNewOrderStatus.toLowerCase().replace(' ', '_');
      }

      // Prepare delivery address for delivery orders
      let deliveryAddressId = null;
      if (orderType === 'delivery' && selectedCustomer && selectedCustomer.addresses && selectedCustomer.addresses.length > 0) {
        // Use the first address as delivery address (you can modify this logic to let user choose)
        deliveryAddressId = selectedCustomer.addresses[0].id;
      }

      // Prepare order data for database
      const orderData = {
        customer_id: selectedCustomer?.id || null, // Allow null for walk-in customers
        order_amount: total,
        coupon_discount_amount: discount,
        coupon_discount_title: appliedCoupon?.title || null,
        payment_status: 'pending',
        order_status: dbStatus, // Use the mapped status instead of hardcoded 'pending'
        total_tax_amount: tax,
        payment_method: null, // Will be set when payment is made
        delivery_address_id: deliveryAddressId, // Set delivery address for delivery orders
        coupon_code: appliedCoupon?.code || null,
        order_note: null, // Can be added later
        order_type: orderType,
        restaurant_id: 1, // Default restaurant ID
        delivery_charge: 0, // Can be calculated for delivery
        additional_charge: 0, // Set to 0 since cartCharge is not in schema
        discount_amount: discount,
        tax_percentage: getTaxRate(), // Use tax rate from settings
        scheduled: selectedScheduleDateTime ? 1 : 0, // Set to 1 if scheduled
        schedule_at: selectedScheduleDateTime || null, // Add scheduled time
        failed: 0, // Convert boolean to integer for SQLite
        refunded: 0, // Convert boolean to integer for SQLite
        isdeleted: 0, // Convert boolean to integer for SQLite
        issyncronized: 0, // Convert boolean to integer for SQLite
        table_details: tableDetails, // Add table details
        placed_at: dbStatus === 'new' ? new Date().toISOString() : null // Set placed_at when status is new
      };

      let orderId;

      if (isModifyingOrder && modifyingOrderId) {
        // Update existing order
        console.log('Updating existing order:', modifyingOrderId);
        console.log('Order data to update:', orderData);
        const updateResult = await window.myAPI.updateOrder(modifyingOrderId, orderData);
        console.log('Update result:', updateResult);

        if (!updateResult.success) {
          showError('Failed to update order: ' + updateResult.message);
          return;
        }

        orderId = modifyingOrderId;
        console.log('Order updated successfully');

        // Update table status to Reserved if this is a table order modification
        if (tableIdsToReserve.length > 0) {
          try {
            console.log('Reserving tables for modified order:', tableIdsToReserve);
            const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIdsToReserve, 'Reserved');
            if (tableUpdateResult.success) {
              console.log('Tables reserved successfully for modified order:', tableUpdateResult.message);
            } else {
              console.warn('Failed to reserve tables for modified order:', tableUpdateResult.message);
            }
          } catch (error) {
            console.error('Error reserving tables for modified order:', error);
          }
        }
      } else {
        // Create new order
        console.log('Creating new order with data:', orderData);
        const orderResult = await window.myAPI.createOrder(orderData);
        console.log('createOrder result:', orderResult);

        if (!orderResult.success) {
          console.error('Order creation failed:', orderResult);
          showError('Failed to create order: ' + orderResult.message);
          return;
        }

        orderId = orderResult.id;
        console.log('Order created successfully with ID:', orderId);

        // Update table status to Reserved if this is a table order
        if (tableIdsToReserve.length > 0) {
          try {
            console.log('Reserving tables:', tableIdsToReserve);
            const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIdsToReserve, 'Reserved');
            if (tableUpdateResult.success) {
              console.log('Tables reserved successfully:', tableUpdateResult.message);
            } else {
              console.warn('Failed to reserve tables:', tableUpdateResult.message);
            }
          } catch (error) {
            console.error('Error reserving tables:', error);
          }
        }
      }

      // Prepare order details data
      const orderDetailsArray = cartItems.map(item => {
        // Calculate item-specific totals
        const itemSubtotal = item.totalPrice;
        const itemTax = calculateTaxAmount(itemSubtotal); // Calculate tax using settings
        const itemDiscount = 0; // Individual item discount if any

        // Handle custom pizza items differently
        if (item.isCustomPizza) {
          // For custom pizzas, create special food details
          const customPizzaDetails = JSON.stringify({
            type: 'custom_pizza',
            name: 'Split Pizza',
            size: item.size,
            slices: item.slices,
            price: item.price,
            note: item.customNote,
            selectedPizzas: item.selectedPizzas,
            flavorIngredients: item.flavorIngredients,
            sliceColors: item.sliceColors
          });

          return {
            order_id: orderId,
            food_id: 0, // No specific food ID for custom pizzas
            quantity: item.quantity,
            price: item.price,
            food_details: customPizzaDetails,
            item_note: item.customNote,
            variation: null,
            add_ons: null,
            ingredients: JSON.stringify(item.flavorIngredients),
            discount_on_food: 0,
            discount_type: null,
            tax_amount: itemTax,
            total_add_on_price: 0,
            issynicronized: 0,
            isdeleted: 0,
            iscreateyourown: 1, // Mark as custom pizza
            isopen: 0
          };
        }

        // Handle custom food items
        if (item.isCustomFood) {
          const customFoodDetails = JSON.stringify({
            type: 'custom_food',
            name: item.customFoodName,
            price: item.price,
            note: item.customFoodNote,
            ingredients: item.customFoodIngredients
          });

          return {
            order_id: orderId,
            food_id: 0, // No specific food ID for custom foods
            quantity: item.quantity,
            price: item.price,
            food_details: customFoodDetails,
            item_note: item.customFoodNote,
            variation: null,
            add_ons: null,
            ingredients: JSON.stringify(item.customFoodIngredients),
            discount_on_food: 0,
            discount_type: null,
            tax_amount: itemTax,
            total_add_on_price: 0,
            issynicronized: 0,
            isdeleted: 0,
            iscreateyourown: 0,
            isopen: 1 // Mark as open order
          };
        }

        // Handle regular food items
        // Prepare variations and addons as JSON
        const variations = Object.keys(item.variations).length > 0 ? JSON.stringify(item.variations) : null;
        const addons = item.adons && item.adons.length > 0 ? JSON.stringify(item.adons) : null;

        // Prepare food details as JSON (including food info, variations, addons)
        const foodDetails = JSON.stringify({
          food: {
            id: item.food?.id || 0,
            name: item.food?.name || 'Unknown Food',
            description: item.food?.description || '',
            price: item.food?.price || 0,
            image: item.food?.image || null
          },
          variations: item.variations,
          addons: item.adons,
          quantity: item.quantity,
          totalPrice: item.totalPrice
        });

        return {
          food_id: item.food?.id || 0,
          order_id: orderId,
          price: item.food?.price || 0,
          food_details: foodDetails,
          item_note: null, // Can be added later
          variation: variations,
          add_ons: addons,
          discount_on_food: itemDiscount,
          discount_type: null,
          quantity: item.quantity,
          tax_amount: itemTax,
          total_add_on_price: 0, // Calculate if needed
          issynicronized: false,
          isdeleted: false
        };
      });

      if (isModifyingOrder && modifyingOrderId) {
        // Smart update: Get existing order details and compare with new items
        console.log('Smart updating order details for order:', modifyingOrderId);

        try {
          // Get existing order details
          const existingDetailsResult = await window.myAPI.getOrderDetailsWithFood(modifyingOrderId);
          if (!existingDetailsResult.success) {
            console.error('Failed to get existing order details:', existingDetailsResult.message);
            showError('Failed to get existing order details');
            return;
          }

          const existingDetails = existingDetailsResult.data || [];
          console.log('Existing order details:', existingDetails);

          // Process each new cart item
          for (const newItem of orderDetailsArray) {
            // Find matching existing item by food_id, variations, and addons
            const existingItem = existingDetails.find(existing => {
              // Match by food_id first
              if (existing.food_id !== newItem.food_id) return false;

              // Match by variations (if both have variations)
              if (newItem.variation && existing.variation) {
                try {
                  const newVariations = JSON.parse(newItem.variation);
                  const existingVariations = JSON.parse(existing.variation);
                  if (JSON.stringify(newVariations) !== JSON.stringify(existingVariations)) {
                    return false;
                  }
                } catch (error) {
                  console.warn('Error parsing variations:', error);
                }
              } else if (newItem.variation !== existing.variation) {
                return false;
              }

              // Match by addons (if both have addons)
              if (newItem.add_ons && existing.add_ons) {
                try {
                  const newAddons = JSON.parse(newItem.add_ons);
                  const existingAddons = JSON.parse(existing.add_ons);
                  if (JSON.stringify(newAddons) !== JSON.stringify(existingAddons)) {
                    return false;
                  }
                } catch (error) {
                  console.warn('Error parsing addons:', error);
                }
              } else if (newItem.add_ons !== existing.add_ons) {
                return false;
              }

              return true;
            });

            if (existingItem) {
              // Update existing item
              console.log('Updating existing item:', existingItem.id);
              const updateResult = await window.myAPI.updateOrderDetail(existingItem.id, {
                quantity: newItem.quantity,
                price: newItem.price,
                food_details: newItem.food_details,
                variation: newItem.variation,
                add_ons: newItem.add_ons,
                discount_on_food: newItem.discount_on_food,
                tax_amount: newItem.tax_amount,
                total_add_on_price: newItem.total_add_on_price
              });

              if (!updateResult.success) {
                console.error('Failed to update order detail:', updateResult.message);
              }
            } else {
              // Add new item
              console.log('Adding new item:', newItem.food_id);
              const createResult = await window.myAPI.createOrderDetail(newItem);

              if (!createResult.success) {
                console.error('Failed to create new order detail:', createResult.message);
              }
            }
          }

          // Remove items that are no longer in the cart
          for (const existingItem of existingDetails) {
            const stillExists = orderDetailsArray.find(newItem => {
              // Match by food_id first
              if (existingItem.food_id !== newItem.food_id) return false;

              // Match by variations (if both have variations)
              if (newItem.variation && existingItem.variation) {
                try {
                  const newVariations = JSON.parse(newItem.variation);
                  const existingVariations = JSON.parse(existingItem.variation);
                  if (JSON.stringify(newVariations) !== JSON.stringify(existingVariations)) {
                    return false;
                  }
                } catch (error) {
                  console.warn('Error parsing variations:', error);
                }
              } else if (newItem.variation !== existingItem.variation) {
                return false;
              }

              // Match by addons (if both have addons)
              if (newItem.add_ons && existingItem.add_ons) {
                try {
                  const newAddons = JSON.parse(newItem.add_ons);
                  const existingAddons = JSON.parse(existingItem.add_ons);
                  if (JSON.stringify(newAddons) !== JSON.stringify(existingAddons)) {
                    return false;
                  }
                } catch (error) {
                  console.warn('Error parsing addons:', error);
                }
              } else if (newItem.add_ons !== existingItem.add_ons) {
                return false;
              }

              return true;
            });

            if (!stillExists) {
              console.log('Removing item:', existingItem.id);
              const deleteResult = await window.myAPI.deleteOrderDetail(existingItem.id);

              if (!deleteResult.success) {
                console.error('Failed to delete order detail:', deleteResult.message);
              }
            }
          }

          console.log('Smart update completed');

        } catch (error) {
          console.error('Error in smart update:', error);
          showError('Failed to update order details: ' + error.message);
          return;
        }

      } else {
        // Create new order details
        console.log('Creating new order details:', orderDetailsArray);
        const orderDetailsResult = await window.myAPI.createMultipleOrderDetails(orderDetailsArray);
        console.log('Order details result:', orderDetailsResult);

        if (!orderDetailsResult.success) {
          showError('Failed to create order details: ' + orderDetailsResult.message);
          return;
        }
      }

      // Create order object for UI display
      const newOrder = {
        id: orderId,
        orderNumber: `ORD-${String(orderId).padStart(3, '0')}`,
        items: [...cartItems],
        customer: selectedCustomer ? {
          ...selectedCustomer, // Include all customer properties
          id: selectedCustomer.id,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone || null,
          email: selectedCustomer.email || null,
          addresses: selectedCustomer.addresses || []
        } : { name: 'Walk-in Customer' },
        total: total,
        coupon: appliedCoupon,
        orderType: selectedOrderType,
        table: (() => {
          if (selectedOrderType === 'Table') {
            if (selectedTable) {
              const table = tables.find(t => t.id.toString() === selectedTable);
              return table ? `Table ${table.table_no}` : selectedTable;
            } else if (reservedTables.length > 0) {
              return reservedTables.map(rt => `Table ${rt.tableNo}`).join(', ');
            }
          }
          return 'None';
        })(),
        waiter: 'Ds Waiter',
        status: selectedNewOrderStatus, // Use the selected status for new orders
        placedAt: new Date().toISOString(),
        databaseId: orderId // Store database ID for reference
      };



      if (isModifyingOrder && modifyingOrderId) {
        console.log('Modifying order. Original order type:', selectedPlacedOrder?.orderType);
        console.log('Current selectedOrderType:', selectedOrderType);

        // Update existing order in the list
        setPlacedOrders(prev => prev.map(order =>
          order.databaseId === modifyingOrderId
            ? { ...newOrder, databaseId: modifyingOrderId }
            : order
        ));

        // Clear modification flags
        setIsModifyingOrder(false);
        setModifyingOrderId(null);

        // Clear cart but preserve order type for potential future modifications
        setCartItems([]);
        setAppliedCoupon(null);
        setSelectedTable('');
        setSelectedPersons('');
        setSelectedFloor('');
        setSelectedCustomer(null);
        setMergeTable1('');
        setMergeTable2('');
        setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
        setReservedTables([]);
        setEditingCartItem(null);
        setFoodQuantity(1);
        setSelectedVariations({});
        setSelectedAdons([]);
        // Don't clear selectedOrderType - preserve it for potential future use
        console.log('Order type preserved after modification:', selectedOrderType);

        showSuccess('Order updated successfully!', 'success');
      } else {
        // Add new order to the list (only if not from PAY button)
        if (!isSinglePayMode) {
          setPlacedOrders(prev => [newOrder, ...prev]);
          showSuccess('Order placed successfully!', 'success');

          // Add notification for the new order
          const customerName = selectedCustomer?.name || null;
          const notification = generateOrderNotification(orderType, orderId, customerName, tableDetails);
          addNotification(notification);

          // Clear cart completely for new orders
          clearCart();

          // Automatically set order type to 'In Store' for new orders
          setSelectedOrderType('In Store');
        } else {
          // For PAY button, don't add to active orders, just show success
          showSuccess('Order created for payment!', 'success');

          // Still add notification for PAY button orders
          const customerName = selectedCustomer?.name || null;
          const notification = generateOrderNotification(orderType, orderId, customerName, tableDetails);
          addNotification(notification);
        }
      }

      // Clear scheduled time after successful order placement
      setSelectedScheduleDateTime('');

      // Show invoice modals for kitchen and employee (only if not after payment and not from PAY button)
      // For PLACE ORDER button, always show kitchen and employee invoices
      // For PAY button (isSinglePayMode), don't show kitchen and employee invoices
      if (!isModifyingOrder && !isInvoiceAfterPayment && !isSinglePayMode) {
        // Set the current order for invoice display
        setCurrentOrderForInvoice(newOrder);

        // Show kitchen invoice first
        setShowKitchenInvoiceModal(true);

        // Show employee invoice after a short delay
        setTimeout(() => {
          setShowEmployeeInvoiceModal(true);
        }, 500);
      }

      // Return the order ID for external use (like payment processing)
      return orderId;

    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error details:', error.message, error.stack);
      showError('Failed to place order: ' + error.message);
      return null;
    }
  };

  // Get next draft ID in format draft_id001, draft_id002, etc.
  const getNextDraftId = async () => {
    try {
      if (!window.myAPI) {
        return `draft_id001`;
      }

      // Get all draft orders to find the highest number
      const result = await window.myAPI.getOrdersByStatus('draft');
      if (result && result.success) {
        const draftOrders = result.data || [];
        let maxNumber = 0;

        // Find the highest draft number
        draftOrders.forEach(order => {
          if (order.order_number && typeof order.order_number === 'string' && order.order_number.startsWith('draft_id')) {
            // Extract number from draft_id format
            const numberPart = order.order_number.replace('draft_id', '');
            const number = parseInt(numberPart);
            
            // Only consider valid sequential numbers (001, 002, etc.)
            if (!isNaN(number) && number > 0 && number <= 999 && number > maxNumber) {
              maxNumber = number;
            }
          }
        });

        // Return next draft ID with proper padding
        const nextNumber = maxNumber + 1;
        const paddedNumber = nextNumber.toString().padStart(3, '0');
        console.log('Generated next draft ID:', `draft_id${paddedNumber}`, 'from max number:', maxNumber);
        return `draft_id${paddedNumber}`;
      }

      // If no drafts found, start with 001
      console.log('No existing drafts found, starting with draft_id001');
      return 'draft_id001';
    } catch (error) {
      console.error('Error getting next draft ID:', error);
      return 'draft_id001';
    }
  };

  // Fetch draft orders from database
  const fetchDraftOrders = async () => {
    try {
      if (!window.myAPI) {
        console.warn('API not available for fetching draft orders');
        return;
      }

      const result = await window.myAPI.getOrdersByStatus('draft');
      if (result && result.success) {
        const draftOrders = result.data || [];

        // Transform database orders to UI format
        const transformedDrafts = await Promise.all(
          draftOrders.map(async (order) => {
            console.log('Processing draft order from database:', order);
            console.log('Order ID:', order.id, 'Order Number:', order.order_number, 'Draft Name:', order.draft_name);
            
            // Ensure order exists and has required properties
            if (!order || !order.id) {
              console.warn('Invalid order found:', order);
              return null;
            }

            // Fetch order details for this draft
            let items = [];
            try {
              const detailsResult = await window.myAPI.getOrderDetailsByOrderId(order.id);
              console.log(`Order details for draft ${order.id}:`, detailsResult);

              if (detailsResult && detailsResult.success && Array.isArray(detailsResult.data)) {
                // Transform order details to cart item format
                items = detailsResult.data
                  .filter(item =>
                    item &&
                    typeof item === 'object' &&
                    item.food_id &&
                    typeof item.quantity === 'number'
                  )
                  .map(item => {
                    // Parse variations and addons safely
                    let variations = null;
                    let adons = null;

                    try {
                      if (item.variation) {
                        variations = JSON.parse(item.variation);
                      }
                    } catch (error) {
                      console.error('Error parsing variations:', error);
                      variations = null;
                    }

                    try {
                      if (item.add_ons) {
                        adons = JSON.parse(item.add_ons);
                      }
                    } catch (error) {
                      console.error('Error parsing addons:', error);
                      adons = null;
                    }

                    console.log('=== PROCESSING ORDER DETAIL ITEM FROM DATABASE ===');
                    console.log('Raw order detail from database:', item);
                    console.log('item.quantity from database:', item.quantity);
                    console.log('typeof item.quantity:', typeof item.quantity);
                    console.log('item.quantity || 1 result:', item.quantity || 1);
                    
                    const cartItem = {
                      id: Date.now() + Math.random(), // Use unique ID for draft items
                      food: {
                        id: item.food_id,
                        name: item.food_details || 'Unknown Food',
                        price: item.price || 0
                      },
                      quantity: item.quantity !== null && item.quantity !== undefined ? item.quantity : 1,
                      variations: variations,
                      adons: adons,
                      notes: item.item_note || null,
                      totalPrice: (item.price || 0) * (item.quantity !== null && item.quantity !== undefined ? item.quantity : 1)
                    };
                    
                    console.log('Created cart item from draft:', {
                      id: cartItem.id,
                      name: cartItem.food.name,
                      price: cartItem.food.price,
                      quantity: cartItem.quantity,
                      totalPrice: cartItem.totalPrice
                    });
                    
                    return cartItem;
                  });
              }
            } catch (error) {
              console.error(`Error fetching order details for order ${order.id}:`, error);
              items = []; // Set empty array if there's an error
            }

            // Ensure we have valid IDs
            const validId = order.id || Date.now(); // Fallback to timestamp if no ID
            
            // Generate proper sequential draft numbers (001, 002, 003, etc.)
            let validOrderNumber;
            if (order.order_number && order.order_number.startsWith('draft_id') && /draft_id\d{3}$/.test(order.order_number)) {
              // Use existing properly formatted draft number (draft_id001, draft_id002, etc.)
              validOrderNumber = order.order_number;
            } else {
              // Generate a proper sequential draft ID (001, 002, 003, etc.)
              // We'll assign sequential numbers based on the order in which drafts appear
              // This will ensure we get proper sequential numbering
              const draftIndex = draftOrders.indexOf(order) + 1;
              const sequentialNum = draftIndex.toString().padStart(3, '0');
              validOrderNumber = `draft_id${sequentialNum}`;
              console.log('Generated sequential draft number for order ID:', order.id, 'at index:', draftIndex, '->', validOrderNumber);
            }
            
            console.log('Creating draft object with ID:', validId, 'order_number:', order.order_number, 'validOrderNumber:', validOrderNumber);
            
            const draftObject = {
              id: validId,
              databaseId: validId,
              orderNumber: validOrderNumber,
              items: items,
              customer: {
                name: order.draft_name || 'Unknown',
                phone: 'N/A'
              },
              total: order.order_amount || 0,
              coupon: null,
              orderType: 'Draft',
              table: 'None',
              waiter: 'N/A',
              status: 'Draft',
              placedAt: order.created_at || new Date().toISOString(),
              totalItems: items.reduce((sum, item) => {
                return sum + (item && item.quantity ? item.quantity : 0);
              }, 0),
              subTotal: (order.order_amount || 0) - (order.total_tax_amount || 0),
              discount: order.discount_amount || 0,
              totalDiscount: order.discount_amount || 0,
              tax: order.total_tax_amount || 0,
              charge: 0,
              tips: 0,
              totalPayable: order.order_amount || 0,
              draftName: order.draft_name || 'Unknown'
            };
            
            console.log('Final draft object created:', draftObject);
            return draftObject;
          })
        );

        // Filter out any null entries
        const validDrafts = transformedDrafts.filter(draft => draft !== null);

        // Check for duplicate order numbers and fix them
        const orderNumberMap = new Map();
        const fixedDrafts = validDrafts.map(draft => {
          if (orderNumberMap.has(draft.orderNumber)) {
            // Duplicate order number found, create unique one
            const originalNumber = draft.orderNumber;
            const uniqueNumber = `${originalNumber}_${draft.id}`;
            console.log(`Fixed duplicate order number: ${originalNumber} -> ${uniqueNumber}`);
            return { ...draft, orderNumber: uniqueNumber };
          }
          orderNumberMap.set(draft.orderNumber, true);
          return draft;
        });

        setCurrentDraftOrders(fixedDrafts);
        console.log('Fetched draft orders:', fixedDrafts);
        console.log('Draft order numbers:', fixedDrafts.map(d => ({ id: d.id, orderNumber: d.orderNumber })));
      }
    } catch (error) {
      console.error('Error fetching draft orders:', error);
    }
  };

  // Handle draft order
  const handleDraftOrder = async (userName) => {
    // Use ref to get the latest cart items
    const latestCartItems = cartItemsRef.current;
    
    if (latestCartItems.length === 0) {
      showError('Please add items to cart before creating draft');
      return;
    }

    try {
      const isUpdatingExistingDraft = currentDraftId !== null;
      console.log('=== DRAFT SAVE DEBUG START ===');
      console.log(isUpdatingExistingDraft ? 'Updating existing draft order:' : 'Creating new draft order for customer:', userName, isUpdatingExistingDraft ? `with ID: ${currentDraftId}` : '');
      console.log('Cart items count:', latestCartItems.length);
      console.log('Cart items details:', latestCartItems.map(item => ({
        id: item.id,
        name: item.food?.name || 'Unknown',
        quantity: item.quantity,
        price: item.food?.price || item.price || 0,
        totalPrice: item.totalPrice,
        isCustomPizza: item.isCustomPizza,
        isCustomFood: item.isCustomFood
      })));
      console.log('Cart items raw data:', latestCartItems);

      // Check if API is available
      if (!window.myAPI) {
        showError('API not available. Please refresh the page.');
        return;
      }

      // Calculate totals
      const subtotal = calculateCartSubtotal();
      const tax = calculateCartTax();
      const discount = calculateCartDiscount();
      const total = calculateCartTotal();

      let draftId, orderId;
      
      if (isUpdatingExistingDraft) {
        // For edited drafts, always generate a new sequential draft ID
        // This ensures we don't reuse the same draft number
        draftId = await getNextDraftId();
        console.log('Generated new sequential draft ID for edited draft:', draftId, 'for ID:', currentDraftId);
      } else {
        // Get next draft ID for new draft
        draftId = await getNextDraftId();
      }

      // Prepare order data for database
      const orderData = {
        customer_id: selectedCustomer?.id || null,
        order_amount: total,
        coupon_discount_amount: discount,
        coupon_discount_title: appliedCoupon?.title || null,
        payment_status: 'pending',
        order_status: 'draft', // Set status as draft
        total_tax_amount: tax,
        payment_method: null,
        delivery_address_id: null,
        coupon_code: appliedCoupon?.code || null,
        order_note: null,
        order_type: 'draft',
        restaurant_id: 1,
        delivery_charge: 0,
        additional_charge: 0,
        discount_amount: discount,
        tax_percentage: getTaxRate(),
        scheduled: 0,
        schedule_at: null,
        failed: 0,
        refunded: 0,
        isdeleted: 0,
        issyncronized: 0,
        table_details: null,
        draft_name: userName, // Save the draft name
        order_number: draftId // Set the draft ID as order number
      };

      let orderResult;
      
      // Always create a new order (since we deleted the old one when editing)
      // This ensures the draft gets the same draft number even if no changes were made
      orderResult = await window.myAPI.createOrder(orderData);

      if (!orderResult.success) {
        showError('Failed to save draft order: ' + orderResult.message);
        return;
      }

      orderId = orderResult.id;
      
      if (isUpdatingExistingDraft) {
        console.log('Recreated draft order successfully with new ID:', orderId, 'using same draft number:', draftId);
      } else {
      console.log('Draft order created successfully with ID:', orderId);
      }

      // Debug cart items
      console.log('=== ORDER DETAILS CREATION DEBUG ===');
      console.log('Cart items before creating order details:', latestCartItems);
      console.log('Cart items structure:', latestCartItems.map(item => ({
        id: item.id,
        foodId: item.food?.id,
        foodName: item.food?.name,
        price: item.food?.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        hasVariations: !!item.variations,
        hasAdons: !!item.adons
      })));
      console.log('=== DETAILED CART ITEMS FOR SAVING ===');
      console.log('Raw cart items:', latestCartItems);
      console.log('Cart items with quantities:', latestCartItems.map(item => ({
        id: item.id,
        name: item.food?.name,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      })));

      // Prepare order details data for the draft items
      const orderDetailsArray = latestCartItems
        .filter(item => {
          // For custom pizzas, check different validation criteria
          if (item.isCustomPizza) {
            const isValid = item && item.quantity && item.price;
            if (!isValid) {
              console.warn('Filtered out invalid custom pizza item:', item);
            }
            return isValid;
          }

          // For custom foods, check different validation criteria
          if (item.isCustomFood) {
            const isValid = item && item.quantity && item.price && item.customFoodName;
            if (!isValid) {
              console.warn('Filtered out invalid custom food item:', item);
            }
            return isValid;
          }

          // For regular items, check food ID and price
          const isValid = item && item.food && item.food?.id && item.quantity && item.food?.price;
          if (!isValid) {
            console.warn('Filtered out invalid cart item:', item);
          }
          return isValid;
        })
        .map(item => {
          // Handle custom pizza items
          if (item.isCustomPizza) {
            const customPizzaDetails = JSON.stringify({
              type: 'custom_pizza',
              name: 'Split Pizza',
              size: item.size,
              slices: item.slices,
              price: item.price,
              note: item.customNote,
              selectedPizzas: item.selectedPizzas,
              flavorIngredients: item.flavorIngredients,
              sliceColors: item.sliceColors
            });

            const orderDetail = {
              order_id: orderId,
              food_id: 0, // No specific food ID for custom pizzas
              quantity: item.quantity,
              price: item.price,
              food_details: customPizzaDetails,
              item_note: item.customNote,
              variation: null,
              add_ons: null,
              ingredients: JSON.stringify(item.flavorIngredients),
              discount_on_food: 0,
              discount_type: null,
              tax_amount: calculateTaxAmount(item.price),
              total_add_on_price: 0,
              issynicronized: 0,
              isdeleted: 0,
              iscreateyourown: 1, // Mark as custom pizza
              isopen: 0
            };
            console.log('Created custom pizza order detail object:', orderDetail);
            return orderDetail;
          }

          // Handle custom food items
          if (item.isCustomFood) {
            const customFoodDetails = JSON.stringify({
              type: 'custom_food',
              name: item.customFoodName,
              price: item.price,
              note: item.customFoodNote,
              ingredients: item.customFoodIngredients
            });

            const orderDetail = {
              order_id: orderId,
              food_id: 0, // No specific food ID for custom foods
              quantity: item.quantity,
              price: item.price,
              food_details: customFoodDetails,
              item_note: item.customFoodNote,
              variation: null,
              add_ons: null,
              ingredients: JSON.stringify(item.customFoodIngredients),
              discount_on_food: 0,
              discount_type: null,
              tax_amount: calculateTaxAmount(item.price),
              total_add_on_price: 0,
              issynicronized: 0,
              isdeleted: 0,
              iscreateyourown: 0,
              isopen: 1 // Mark as open order
            };
            console.log('Created custom food order detail object:', orderDetail);
            return orderDetail;
          }

          // Handle regular food items
          const orderDetail = {
            order_id: orderId,
            food_id: item.food?.id || 0,
            quantity: item.quantity,
            price: item.food?.price || 0, // Use food.price instead of item.price
            food_details: item.food?.name || null, // Add food name as food_details
            item_note: null, // No notes field in cart items
            variation: item.variations ? JSON.stringify(item.variations) : null, // Use 'variation' instead of 'variations'
            add_ons: item.adons ? JSON.stringify(item.adons) : null, // Use 'add_ons' instead of 'adons'
            discount_on_food: 0,
            discount_type: null,
            tax_amount: 0,
            total_add_on_price: 0,
            issynicronized: 0,
            isdeleted: 0
          };
          console.log('=== CREATING ORDER DETAIL ===');
          console.log('Original cart item:', {
            id: item.id,
            foodId: item.food?.id,
            foodName: item.food?.name,
            quantity: item.quantity,
            price: item.food?.price,
            totalPrice: item.totalPrice
          });
          console.log('item.quantity value:', item.quantity);
          console.log('typeof item.quantity:', typeof item.quantity);
          console.log('Created order detail object:', orderDetail);
          return orderDetail;
        });

      // Test API availability
      console.log('Testing API availability...');
      console.log('window.myAPI.createOrderDetail exists:', typeof window.myAPI.createOrderDetail);
      console.log('window.myAPI.createMultipleOrderDetails exists:', typeof window.myAPI.createMultipleOrderDetails);

      // Create order details for the new order
      let createdDetailsCount = 0;

      if (orderDetailsArray.length > 0) {
        try {
          console.log(isUpdatingExistingDraft ? 'Creating order details for recreated draft:' : 'Creating order details for new draft:', orderDetailsArray);
          const batchResult = await window.myAPI.createMultipleOrderDetails(orderDetailsArray);
          console.log('Batch API response:', batchResult);

          if (batchResult && batchResult.success) {
            console.log('Order details created successfully in batch:', batchResult);
            createdDetailsCount = batchResult.count || orderDetailsArray.length;
          } else {
            console.error('Failed to create order details in batch:', batchResult);

            // Fallback to individual creation
            console.log('Falling back to individual creation...');
            for (const detail of orderDetailsArray) {
              try {
                console.log('Creating order detail individually:', detail);
                const detailResult = await window.myAPI.createOrderDetail(detail);
                console.log('Individual API response:', detailResult);
                if (detailResult && detailResult.success) {
                  console.log('Order detail created successfully:', detailResult);
                  createdDetailsCount++;
                } else {
                  console.error('Failed to create order detail:', detailResult);
                }
              } catch (error) {
                console.error('Error creating order detail:', error);
                console.error('Error stack:', error.stack);
              }
            }
          }
        } catch (error) {
          console.error('Error in batch creation:', error);
          console.error('Error stack:', error.stack);
        }
      } else {
        console.log('No order details to create');
      }

      console.log(`Created ${createdDetailsCount} out of ${orderDetailsArray.length} order details`);

      // Verify order details were created
      if (createdDetailsCount > 0) {
        try {
          const verifyResult = await window.myAPI.getOrderDetailsByOrderId(orderId);
          if (verifyResult && verifyResult.success) {
            console.log(`Verification: Found ${verifyResult.data.length} order details for draft order ${orderId}`);
          }
        } catch (error) {
          console.error('Error verifying order details:', error);
        }
      }

      // Create or update local draft order object for UI
      const draftOrder = {
        id: orderId, // Use database ID
        databaseId: orderId, // Store database ID
        orderNumber: draftId, // Use the draft ID format
        items: [...cartItems],
        customer: selectedCustomer || { name: userName, phone: 'N/A' },
        total: total,
        coupon: appliedCoupon,
        orderType: 'Draft',
        table: 'None',
        waiter: 'N/A',
        status: 'Draft',
        placedAt: new Date().toISOString(),
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        subTotal: subtotal,
        discount: discount,
        totalDiscount: discount,
        tax: tax,
        charge: 0,
        tips: 0,
        totalPayable: total,
        draftName: userName // Store draft name
      };

      // Update local state
      if (isUpdatingExistingDraft) {
        // Restore draft at its original position in the list with new database ID
        setCurrentDraftOrders(prev => {
          const newDrafts = [...prev];
          
          // If we have a valid position, insert at that position
          if (currentDraftPosition !== null && currentDraftPosition >= 0) {
            // Insert the draft at its original position
            newDrafts.splice(currentDraftPosition, 0, draftOrder);
            console.log('Restored draft at original position:', currentDraftPosition, 'with new database ID:', orderId);
          } else {
            // If position is not available, add to top
            newDrafts.unshift(draftOrder);
            console.log('Added recreated draft to top of list');
          }
          
          return newDrafts;
        });
        showSuccess('Draft order saved successfully!', 'success');
      } else {
        // Add new draft order to local state (at the top)
        setCurrentDraftOrders(prev => [draftOrder, ...prev]);
      showSuccess('Draft order created successfully!', 'success');
      }

      // Clear cart completely for new draft orders, but keep current draft ID for updates
      if (!isUpdatingExistingDraft) {
        clearCart(true); // Clear cart and reset draft ID for new orders
      } else {
        clearCart(); // Clear cart but keep current draft ID for continued updates
      }

      // Automatically set order type to 'In Store' for new orders
      if (!isUpdatingExistingDraft) {
      setSelectedOrderType('In Store');
      }

      // Refresh the draft list to ensure UI is updated
      setTimeout(() => {
        fetchDraftOrders();
      }, 100);

    } catch (error) {
      console.error('Error creating draft order:', error);
      console.error('Error details:', error.message, error.stack);
      showError('Failed to create draft order: ' + error.message);
    }
  };

  // Handle converting draft to regular order
  const handleConvertDraftToOrder = async (draftOrder) => {
    // Set the draft order to convert and show the modal
    setDraftToConvert(draftOrder);
    setShowDraftConversionModal(true);
  };

  // Handle delete draft order
  const handleDeleteDraft = async (draftId) => {
    try {
      console.log('Deleting draft order:', draftId);

      if (!window.myAPI) {
        showError('API not available. Please refresh the page.');
        return;
      }

      // Delete the draft order from database
      const deleteResult = await window.myAPI.deleteOrder(draftId);

      if (!deleteResult.success) {
        showError('Failed to delete draft order: ' + deleteResult.message);
        return;
      }

      // Remove from local state
      setCurrentDraftOrders(prev => prev.filter(draft => draft.databaseId !== draftId));

      showSuccess('Draft order deleted successfully!');
    } catch (error) {
      console.error('Error deleting draft order:', error);
      showError('Failed to delete draft order: ' + error.message);
    }
  };

  // Handle delete all draft orders
  const handleDeleteAllDrafts = async () => {
    try {
      console.log('Deleting all draft orders');

      if (!window.myAPI) {
        showError('API not available. Please refresh the page.');
        return;
      }

      // Get all draft orders
      const result = await window.myAPI.getOrdersByStatus('draft');
      if (!result.success) {
        showError('Failed to fetch draft orders: ' + result.message);
        return;
      }

      const draftOrders = result.data || [];
      if (draftOrders.length === 0) {
        showError('No draft orders to delete');
        return;
      }

      // Delete each draft order
      let deletedCount = 0;
      let failedCount = 0;

      for (const draft of draftOrders) {
        try {
          const deleteResult = await window.myAPI.deleteOrder(draft.id);
          if (deleteResult.success) {
            deletedCount++;
          } else {
            failedCount++;
            console.error(`Failed to delete draft ${draft.id}:`, deleteResult.message);
          }
        } catch (error) {
          failedCount++;
          console.error(`Error deleting draft ${draft.id}:`, error);
        }
      }

      // Clear local state
      setCurrentDraftOrders([]);

      if (failedCount === 0) {
        showSuccess(`Successfully deleted ${deletedCount} draft orders!`);
      } else {
        showError(`Deleted ${deletedCount} draft orders, but failed to delete ${failedCount} orders.`);
      }
    } catch (error) {
      console.error('Error deleting all draft orders:', error);
      showError('Failed to delete all draft orders: ' + error.message);
    }
  };

  // Handle the actual conversion after user selects order type
  const handleConfirmDraftConversion = async () => {
    if (!draftToConvert) {
      showError('No draft order selected for conversion');
      return;
    }

    try {
      console.log('Converting draft order to regular order:', draftToConvert);

      // Check if API is available
      if (!window.myAPI) {
        showError('API not available. Please refresh the page.');
        return;
      }

      // Map order type based on conversion selection
      let orderType = 'instore'; // default for database
      if (conversionOrderType === 'Table') {
        orderType = 'table';
      } else if (conversionOrderType === 'Collection') {
        orderType = 'collection';
      } else if (conversionOrderType === 'Delivery') {
        orderType = 'delivery';
      } else if (conversionOrderType === 'In Store') {
        orderType = 'instore';
      }

      // Prepare table details for database
      let tableDetails = null;
      let tableIdsToReserve = [];

      if (conversionOrderType === 'Table' && (conversionTable || reservedTables.length > 0)) {
        // Handle single table selection
        if (conversionTable) {
          const table = tables.find(t => t.id.toString() === conversionTable);
          if (table) {
            tableDetails = JSON.stringify({
              tables: [{
                id: table.id,
                table_no: table.table_no,
                floor_name: table.floor_name,
                persons: conversionPersons || table.seat_capacity || 4
              }],
              total_persons: conversionPersons || table.seat_capacity || 4
            });
            tableIdsToReserve.push(table.id);
          }
        }

        // Handle merged tables (reserved tables)
        if (reservedTables.length > 0) {
          const reservedTableDetails = reservedTables.map(reservedTable => {
            const table = tables.find(t => t.id.toString() === reservedTable.id);
            return {
              id: table?.id || reservedTable.id,
              table_no: table?.table_no || reservedTable.tableNo,
              floor_name: table?.floor_name || reservedTable.floor,
              persons: reservedTable.persons || table?.seat_capacity || 4
            };
          });

          tableDetails = JSON.stringify({
            tables: reservedTableDetails,
            total_persons: reservedTableDetails.reduce((sum, table) => sum + (table.persons || 0), 0)
          });

          tableIdsToReserve = reservedTableDetails.map(table => table.id);
        }
      }

      // Map selected status to database status
      let dbStatus = 'pending';
      switch (selectedNewOrderStatus) {
        case 'New':
          dbStatus = 'new';
          break;
        case 'In Progress':
          dbStatus = 'in_progress';
          break;
        case 'Ready':
          dbStatus = 'ready';
          break;
        case 'On the way':
          dbStatus = 'on_the_way';
          break;
        case 'Delivered':
          dbStatus = 'delivered';
          break;
        case 'Completed':
          dbStatus = 'completed';
          break;
        case 'Pending':
          dbStatus = 'pending';
          break;
        case 'Complete':
          dbStatus = 'completed';
          break;
        default:
          dbStatus = selectedNewOrderStatus.toLowerCase().replace(' ', '_');
      }

      // Update the order in database
      const updateData = {
        order_type: orderType,
        order_status: dbStatus,
        table_details: tableDetails
      };

      console.log('Updating draft order with data:', updateData);
      const updateResult = await window.myAPI.updateOrder(draftToConvert.databaseId, updateData);

      if (!updateResult.success) {
        showError('Failed to convert draft order: ' + updateResult.message);
        return;
      }

      // Update table status to Reserved if this is a table order
      if (tableIdsToReserve.length > 0) {
        try {
          console.log('Reserving tables for converted order:', tableIdsToReserve);
          const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIdsToReserve, 'Reserved');
          if (tableUpdateResult.success) {
            console.log('Tables reserved successfully for converted order:', tableUpdateResult.message);
          } else {
            console.warn('Failed to reserve tables for converted order:', tableUpdateResult.message);
          }
        } catch (error) {
          console.error('Error reserving tables for converted order:', error);
        }
      }

      // Update the order in the UI
      const updatedOrder = {
        ...draftToConvert,
        orderType: conversionOrderType,
        status: 'Pending', // Set to pending for new regular orders
        table: (() => {
          if (conversionOrderType === 'Table') {
            if (conversionTable) {
              const table = tables.find(t => t.id.toString() === conversionTable);
              return table ? `Table ${table.table_no}` : conversionTable;
            } else if (reservedTables.length > 0) {
              return reservedTables.map(rt => `Table ${rt.tableNo}`).join(', ');
            }
          }
          return 'None';
        })(),
        isDraft: false // Remove draft flag
      };

      // Update the order in the list
      setPlacedOrders(prev => prev.map(order =>
        order.databaseId === draftToConvert.databaseId
          ? updatedOrder
          : order
      ));

      // Close the modal and reset state
      setShowDraftConversionModal(false);
      setDraftToConvert(null);
      setConversionOrderType('In Store');
      setConversionTable('');
      setConversionPersons('');
      setConversionFloor('');

      showSuccess('Draft order converted to regular order successfully!', 'success');

    } catch (error) {
      console.error('Error converting draft order:', error);
      console.error('Error details:', error.message, error.stack);
      showError('Failed to convert draft order: ' + error.message);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (cartItems.length === 0) {
      showError('Please add items to cart before proceeding to payment');
      return;
    }

    // Validate order type selection
    if (!validateOrderTypeSelection()) {
      return;
    }

    // Reset modal state and open the Finalize Sale Modal
    resetFinalizeSaleModalForSinglePay();
    setIsSinglePayMode(true); // Set to true for new orders from PAY button
    setShowFinalizeSaleModal(true);
    
    console.log('PAY button clicked - isSinglePayMode set to true');
    console.log('Cart items for payment:', cartItems);
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
              alt={item?.name || 'Food'}
              className="w-full h-[100%] object-cover"
              onError={() => setImageSrc(null)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-xs">No Image</div>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 text-md mt-2 mb-1 text-center">{item?.name || 'Unknown Food'}</h3>
        <div className="flex justify-between p-2 items-center">
          <div className="flex flex-col">
            {item.discount && item.discount > 0 ? (
              <>
                <p className="text-gray-400 font-medium text-[12px] line-through">€{item.price?.toFixed(2) || '0.00'}</p>
                <p className="text-green-600 font-semibold text-md">€{(item.price - item.discount)?.toFixed(2) || '0.00'}</p>
              </>
            ) : (
              <p className="text-gray-600 font-semibold text-md mt-1">€{item.price?.toFixed(2) || '0.00'}</p>
            )}
          </div>
          <button
            className="mt-1 w-6 h-6 flex items-center justify-center rounded-full bg-primary border-2 border-primary text-white cursor-pointer"
            title="Add"
            onClick={() => handleFoodItemClick(item)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
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
            {/* <div className="text-gray-500 text-sm">Loading foods...</div> */}
          </div>
        ) : searchQuery !== debouncedSearchQuery ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">Searching...</div>
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4">
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
    
    // Initialize split items from current cart items (these will be updated as items are moved to splits)
    setSplitItems([...cartItems]);
    
    // Set order type when opening split screen for before orders
    if (cartItems.length > 0) {
      // Use current selectedOrderType from the main screen
      // This ensures split bills inherit the same order type
    }
    
    setSplitDiscount(0);
    setSplitCharge(0);
    setSplitTips(0);
  };

  const handleCloseSplitBillModal = () => {
    // Restore cart items to their original quantities before closing
    // Since paid splits are automatically removed, all remaining splits are unpaid
    const originalCartItems = [...cartItems];
    
    // For each item that was in remaining splits, restore its quantity
    splitBills.forEach(splitBill => {
      splitBill.items.forEach(splitItem => {
        const cartItem = originalCartItems.find(item => item.food?.id === splitItem.food?.id);
        if (cartItem) {
          cartItem.quantity += splitItem.quantity;
          // Recalculate total price based on original per-unit price
          const perUnitPrice = splitItem.totalPrice / splitItem.quantity;
          cartItem.totalPrice = perUnitPrice * cartItem.quantity;
        }
      });
    });
    
    // Update cart items with restored quantities
    setCartItems(originalCartItems);
    
    setShowSplitBillModal(false);
    setTotalSplit('');
    setSplitItems([]);
    setSplitBills([]); // This will remove all remaining splits
    setSelectedSplitBill(null);
    setSplitDiscount(0);
    setSplitCharge(0);
    setSplitTips(0);
    setSplitBillToRemove(null); // Clear split bill to remove
    
    // Reset customer search flag when closing split modal
    setCustomerSearchFromSplit(false);
    
    // Ensure single pay mode is reset when closing split modal
    setIsSinglePayMode(false);
    
    console.log('Split bill modal closed - all remaining unpaid splits restored to cart');
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

    // Don't automatically distribute items - let user manually add items to splits

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
              i.food?.id === item.food?.id
                ? { ...i, quantity: (i.quantity || 0) + 1, totalPrice: ((i.totalPrice || 0) / (i.quantity || 1)) * ((i.quantity || 0) + 1) }
                : i
            )
          };
        } else {
          // Add new item with quantity 1 and proper per-unit pricing
          const perUnitPrice = item.totalPrice / item.quantity;
          const newItem = { ...item, quantity: 1, totalPrice: perUnitPrice };
          return {
            ...split,
            items: [...split.items, newItem]
          };
        }
      }
      return split;
    }));

    // Update the base cart items by reducing the quantity (keep items even with 0 qty)
    setCartItems(prev => prev.map(cartItem => {
      if (cartItem.id === itemId) {
        const newQuantity = cartItem.quantity - 1;
        // Keep the item even if quantity becomes 0
        const perUnitPrice = cartItem.totalPrice / cartItem.quantity;
        return {
          ...cartItem,
          quantity: newQuantity,
          totalPrice: perUnitPrice * newQuantity
        };
      }
      return cartItem;
    }));

    // Update splitItems to reflect the new quantities (keep items even with 0 qty)
    setSplitItems(prev => prev.map(splitItem => {
      if (splitItem.id === itemId) {
        const newQuantity = splitItem.quantity - 1;
        // Keep the item even if quantity becomes 0
        const perUnitPrice = splitItem.totalPrice / splitItem.quantity;
        return {
          ...splitItem,
          quantity: newQuantity,
          totalPrice: perUnitPrice * newQuantity
        };
      }
      return splitItem;
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
                i.food?.id === item.food?.id
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

    // Return the item to the base cart items
    setCartItems(prev => {
      const existingCartItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingCartItem) {
        // Increase quantity in cart
        const newQuantity = existingCartItem.quantity + 1;
        // Calculate per unit price from the original item (before any modifications)
        const originalItem = splitItems.find(splitItem => splitItem.id === itemId);
        const perUnitPrice = originalItem ? originalItem.totalPrice / originalItem.quantity : existingCartItem.totalPrice / Math.max(existingCartItem.quantity, 1);
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: newQuantity, totalPrice: perUnitPrice * newQuantity }
            : cartItem
        );
      } else {
        // Add item back to cart if it was completely removed
        const perUnitPrice = item.totalPrice / item.quantity;
        const newCartItem = { ...item, quantity: 1, totalPrice: perUnitPrice };
        return [...prev, newCartItem];
      }
    });

    // Update splitItems to reflect the returned quantity
    setSplitItems(prev => {
      const existingSplitItem = prev.find(splitItem => splitItem.id === itemId);
      if (existingSplitItem) {
        // Increase quantity in splitItems
        const newQuantity = existingSplitItem.quantity + 1;
        // Calculate per unit price from the original item
        const perUnitPrice = item.totalPrice / item.quantity;
        return prev.map(splitItem =>
          splitItem.id === itemId
            ? { ...splitItem, quantity: newQuantity, totalPrice: perUnitPrice * newQuantity }
            : splitItem
        );
      } else {
        // Add item back to splitItems if it was completely removed
        const perUnitPrice = item.totalPrice / item.quantity;
        const newSplitItem = { ...item, quantity: 1, totalPrice: perUnitPrice };
        return [...prev, newSplitItem];
      }
    });

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
    // Find the item in the current cart items (which are updated when items are added to splits)
    const cartItem = cartItems.find(item => item.id === itemId);
    if (!cartItem) return 0;

    // Return the current quantity in cart (which decreases as items are added to splits)
    // Items can have 0 quantity but still exist in the cart
    return Math.max(0, cartItem.quantity);
  };

  const areAllItemsDistributed = () => {
    if (!splitBills || splitBills.length === 0) return false;

    // Check if any split bill has at least 1 item
    return splitBills.some(split => split.items && split.items.length > 0);
  };

  const updateSplitBillTotals = (splitBillId) => {
    setSplitBills(prev => prev.map(split => {
      if (split.id === splitBillId) {
        const subtotal = split.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const tax = calculateTaxAmount(subtotal); // Calculate tax using settings
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

  const updateCartAfterSplitPayment = (paidSplitBill) => {
    console.log('=== UPDATE CART AFTER SPLIT PAYMENT ===');
    console.log('Paid split bill:', paidSplitBill);
    console.log('Current cart items before update:', cartItems);
    
    if (!paidSplitBill || !paidSplitBill.items || paidSplitBill.items.length === 0) {
      console.log('No paid items to remove from cart');
      return;
    }

    // Remove paid items from cart items
    setCartItems(prev => {
      const updatedCartItems = [...prev];
      
      paidSplitBill.items.forEach(paidItem => {
        const cartItemIndex = updatedCartItems.findIndex(item => item.food?.id === paidItem.food?.id);
        if (cartItemIndex !== -1) {
          const cartItem = updatedCartItems[cartItemIndex];
          const newQuantity = cartItem.quantity - paidItem.quantity;
          
          if (newQuantity <= 0) {
            // Remove item completely if quantity becomes 0 or negative
            updatedCartItems.splice(cartItemIndex, 1);
            console.log(`Removed item ${paidItem.food?.name} from cart (quantity was ${cartItem.quantity}, paid ${paidItem.quantity})`);
          } else {
            // Update quantity and recalculate price
            const perUnitPrice = cartItem.totalPrice / cartItem.quantity;
            updatedCartItems[cartItemIndex] = {
              ...cartItem,
              quantity: newQuantity,
              totalPrice: perUnitPrice * newQuantity
            };
            console.log(`Updated item ${paidItem.food?.name} quantity from ${cartItem.quantity} to ${newQuantity}`);
          }
        }
      });
      
      console.log('Updated cart items after split payment:', updatedCartItems);
      return updatedCartItems;
    });
    
    console.log('Cart items updated after split payment');
  };

  const handlePlaceSplitBillOrder = async (splitBill, paymentInfo) => {
    console.log('=== HANDLE PLACE SPLIT BILL ORDER CALLED ===');
    console.log('handlePlaceSplitBillOrder called with:');
    console.log('splitBill:', splitBill);
    console.log('paymentInfo:', paymentInfo);
    console.log('paymentInfo.paymentAmount:', paymentInfo.paymentAmount);
    console.log('splitBill.items:', splitBill.items);
    console.log('splitBill.items.length:', splitBill.items?.length);
    
    try {
      // Split bill orders always get "New" status regardless of main screen selection
      let dbStatus = 'new';

      // Map order type to database format
      let orderType = 'instore';
      switch (selectedOrderType) {
        case 'In Store':
          orderType = 'instore';
          break;
        case 'Table':
          orderType = 'table';
          break;
        case 'Collection':
          orderType = 'collection';
          break;
        case 'Delivery':
          orderType = 'delivery';
          break;
        default:
          orderType = 'instore';
      }

      // Prepare order data for database (same structure as regular handlePlaceOrder)
      const orderData = {
        customer_id: selectedCustomer?.id || null,
        order_amount: paymentInfo.paymentAmount || splitBill.total, // Use payment amount from paymentInfo
        coupon_discount_amount: splitBill.discount || 0,
        coupon_discount_title: null,
        payment_status: 'paid', // Split bills are paid when placed
        order_status: dbStatus, // Use the same status mapping as regular orders
        total_tax_amount: splitBill.tax || 0,
        payment_method: paymentInfo.paymentMethod || 'Cash',
        delivery_address_id: null, // Will be set if delivery order
        coupon_code: null,
        order_note: null,
        order_type: orderType,
        restaurant_id: 1,
        delivery_charge: 0,
        additional_charge: 0,
        discount_amount: splitBill.discount || 0,
        tax_percentage: getTaxRate(),
        scheduled: 0,
        schedule_at: null,
        failed: 0,
        refunded: 0,
        isdeleted: 0,
        issyncronized: 0,
        table_details: selectedTable ? JSON.stringify({ tables: [{ id: selectedTable, table_no: selectedTable }] }) : null,
        placed_at: dbStatus === 'new' ? new Date().toISOString() : null
      };

      // Place the order in database first (same as simple pay)
      console.log('Creating split bill order with data:', orderData);
      const orderResult = await window.myAPI?.createOrder(orderData);
      console.log('Split bill createOrder result:', orderResult);
      
      if (!orderResult || !orderResult.success) {
        console.error('Split bill order creation failed:', orderResult);
        showError('Failed to place split bill order: ' + (orderResult?.message || 'Unknown error'));
        return null;
      }

      const orderId = orderResult.id;
      console.log('Split bill order created successfully with ID:', orderId);

      // Prepare order details data (same structure as simple pay)
      const orderDetailsArray = splitBill.items.map(item => {
        // Calculate item-specific totals
        const itemSubtotal = item.totalPrice;
        const itemTax = calculateTaxAmount(itemSubtotal); // Calculate tax using settings
        const itemDiscount = 0; // Individual item discount if any

        // Handle custom pizza items differently (same as simple pay)
        if (item.isCustomPizza) {
          // For custom pizzas, create special food details
          const customPizzaDetails = JSON.stringify({
            type: 'custom_pizza',
            name: 'Split Pizza',
            size: item.size,
            slices: item.slices,
            price: item.price,
            note: item.customNote,
            selectedPizzas: item.selectedPizzas,
            flavorIngredients: item.flavorIngredients,
            sliceColors: item.sliceColors
          });

          return {
            order_id: orderId,
            food_id: 0, // No specific food ID for custom pizzas
            quantity: item.quantity,
            price: item.price,
            food_details: customPizzaDetails,
            item_note: item.customNote,
            variation: null,
            add_ons: null,
            ingredients: JSON.stringify(item.flavorIngredients),
            discount_on_food: 0,
            discount_type: null,
            tax_amount: itemTax,
            total_add_on_price: 0,
            issynicronized: 0,
            isdeleted: 0,
            iscreateyourown: 1, // Mark as custom pizza
            isopen: 0
          };
        }

        // Handle custom food items (same as simple pay)
        if (item.isCustomFood) {
          const customFoodDetails = JSON.stringify({
            type: 'custom_food',
            name: item.customFoodName,
            price: item.price,
            note: item.customFoodNote,
            ingredients: item.customFoodIngredients
          });

          return {
            order_id: orderId,
            food_id: 0, // No specific food ID for custom foods
            quantity: item.quantity,
            price: item.price,
            food_details: customFoodDetails,
            item_note: item.customFoodNote,
            variation: null,
            add_ons: null,
            ingredients: JSON.stringify(item.customFoodIngredients),
            discount_on_food: 0,
            discount_type: null,
            tax_amount: itemTax,
            total_add_on_price: 0,
            issynicronized: 0,
            isdeleted: 0,
            iscreateyourown: 0,
            isopen: 1 // Mark as open order
          };
        }

        // Handle regular food items (same as simple pay)
        // Prepare variations and addons as JSON
        const variations = Object.keys(item.variations || {}).length > 0 ? JSON.stringify(item.variations) : null;
        const addons = item.adons && item.adons.length > 0 ? JSON.stringify(item.adons) : null;

        // Prepare food details as JSON (same structure as regular orders)
        const foodDetails = JSON.stringify({
          food: {
            id: item.food?.id || 0,
            name: item.food?.name || 'Unknown Food',
            description: item.food?.description || '',
            price: item.food?.price || 0,
            image: item.food?.image || null
          },
          variations: item.variations || {},
          addons: item.adons || [],
          quantity: item.quantity,
          totalPrice: item.totalPrice
        });

        return {
          food_id: item.food?.id || 0,
          order_id: orderId,
          price: item.food?.price || 0,
          food_details: foodDetails,
          item_note: null,
          variation: variations,
          add_ons: addons,
          discount_on_food: itemDiscount,
          discount_type: null,
          quantity: item.quantity,
          tax_amount: itemTax,
          total_add_on_price: 0,
          issynicronized: false,
          isdeleted: false
        };
      });

      // Create order details separately (same as simple pay)
      console.log('Creating split bill order details:', orderDetailsArray);
      console.log('Order details array length:', orderDetailsArray.length);
      console.log('API available check:', !!window.myAPI);
      console.log('createMultipleOrderDetails available check:', !!window.myAPI?.createMultipleOrderDetails);
      
      if (!window.myAPI?.createMultipleOrderDetails) {
        console.error('createMultipleOrderDetails API not available');
        showError('createMultipleOrderDetails API not available');
        return null;
      }
      
      const orderDetailsResult = await window.myAPI.createMultipleOrderDetails(orderDetailsArray);
      console.log('Split bill order details result:', orderDetailsResult);

      if (!orderDetailsResult.success) {
        console.error('Failed to create split bill order details:', orderDetailsResult);
        showError('Failed to create split bill order details: ' + orderDetailsResult.message);
        return null;
      }

      console.log('Split bill order and details created successfully');
      console.log('Order ID:', orderId);
      console.log('Order details created:', orderDetailsResult);
      showSuccess(`Split Bill ${splitBill.id} order placed successfully!`);
      return orderId;
    } catch (error) {
      console.error('Error placing split bill order:', error);
      showError('Failed to place split bill order. Please try again.');
      return null;
    }
  };

  const handleRemoveSplitBill = (splitBillId) => {
    // Get the split bill being removed to return its items to the pool
    const splitToRemove = splitBills.find(split => split.id === splitBillId);

    // Since paid splits are automatically removed, all remaining splits are unpaid
    // Return items to cart items
    if (splitToRemove) {
      const updatedCartItems = [...cartItems];
      splitToRemove.items.forEach(splitItem => {
        const cartItem = updatedCartItems.find(item => item.food?.id === splitItem.food?.id);
        if (cartItem) {
          // Increase quantity in cart
          cartItem.quantity += splitItem.quantity;
          // Recalculate total price based on original per-unit price
          const perUnitPrice = splitItem.totalPrice / splitItem.quantity;
          cartItem.totalPrice = perUnitPrice * cartItem.quantity;
        }
      });
      
      // Update cart items with returned quantities
      setCartItems(updatedCartItems);
      
      // Also update splitItems
      const updatedSplitItems = [...splitItems];
      splitToRemove.items.forEach(splitItem => {
        const splitItemInList = updatedSplitItems.find(item => item.food?.id === splitItem.food?.id);
        if (splitItemInList) {
          // Increase quantity in splitItems
          splitItemInList.quantity += splitItem.quantity;
          // Recalculate total price
          const perUnitPrice = splitItem.totalPrice / splitItem.quantity;
          splitItemInList.totalPrice = perUnitPrice * splitItemInList.quantity;
        }
      });
      
      // Update splitItems with returned quantities
      setSplitItems(updatedSplitItems);
    }

    // Remove the split bill
    setSplitBills(prev => prev.filter(split => split.id !== splitBillId));

    // Update selected split bill if the removed one was selected
    if (selectedSplitBill?.id === splitBillId) {
      const remainingSplits = splitBills.filter(split => split.id !== splitBillId);
      setSelectedSplitBill(remainingSplits[0] || null);
    }
  };

  // Function to recalculate split bill totals after a split is removed
  const recalculateSplitBillTotals = () => {
    setSplitBills(prev => prev.map(split => {
      const subtotal = split.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      const tax = calculateTaxAmount(subtotal); // Calculate tax using settings
      const total = subtotal + tax + (split.charge || 0) + (split.tips || 0) - (split.discount || 0);

      return {
        ...split,
        subtotal,
        tax,
        total
      };
    }));
  };

  // Function to calculate the due amount
  const calculateDueAmount = () => {
    const totalAmount = isSinglePayMode ? calculateSinglePayTotals().total :
      selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
    const paidAmount = addedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    return Math.max(0, totalAmount - paidAmount);
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
    // Calculate change based on the correct total
    if (value) {
      const total = isSinglePayMode ? calculateSinglePayTotals().total :
        selectedSplitBill ? calculateSplitBillTotal() : calculateCartTotal();
      const change = parseFloat(value) - total;
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
    // Fetch available coupons
    fetchAvailableCoupons();
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
    // Don't clear splitBillToRemove - we need it for removal after payment
    // Fetch available coupons
    fetchAvailableCoupons();
  };

  const resetFinalizeSaleModalForSinglePay = () => {
    setSelectedPaymentMethod('Cash');
    setPaymentAmount('');
    setGivenAmount('');
    setChangeAmount('');
    setAddedPayments([]);
    setFinalizeDiscountAmount('');
    setSendSMS(false);
    setSelectedCurrency('EUR');
    setCurrencyAmount('');
    // Don't set isSinglePayMode here - it should be set explicitly by the calling function
    setSelectedSplitBill(null);
    setAppliedCoupon(null); // Clear any applied coupon
    // Fetch available coupons
    fetchAvailableCoupons();
  };

  // Calculate totals for single pay mode
  const calculateSinglePayTotals = () => {
    if (!isSinglePayMode) return { subtotal: 0, tax: 0, total: 0 };

    // Use cartItems for single pay mode (PAY button) or selectedPlacedOrder.items for existing orders
    const items = cartItems.length > 0 ? cartItems.filter(item => item.quantity > 0) : (selectedPlacedOrder?.items || []);

    const subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.totalPrice) || 0);
    }, 0);

    const tax = calculateTaxAmount(subtotal); // Calculate tax using settings

    // Calculate discount
    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'percentage') {
        discount = subtotal * (appliedCoupon.discount / 100);
        if (appliedCoupon.maxDiscount > 0) {
          discount = Math.min(discount, appliedCoupon.maxDiscount);
        }
      } else {
        discount = appliedCoupon.discount;
      }
    }

    // Add manual discount
    if (finalizeDiscountAmount) {
      discount += parseFloat(finalizeDiscountAmount) || 0;
    }

    const total = subtotal + tax - discount;

    return { subtotal, tax, discount, total };
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

    // Get the split bill's own discount
    const splitBillDiscount = selectedSplitBill.discount || 0;

    // Calculate discount from applied coupon (manual discount)
    let couponDiscount = 0;
    if (appliedCoupon) {
      const subtotal = selectedSplitBill.subtotal || 0;
      if (appliedCoupon.discountType === 'percentage') {
        couponDiscount = subtotal * (appliedCoupon.discount / 100);
        if (appliedCoupon.maxDiscount > 0) {
          couponDiscount = Math.min(couponDiscount, appliedCoupon.maxDiscount);
        }
      } else {
        couponDiscount = appliedCoupon.discount;
      }
    }

    // Return the total discount (split bill discount + coupon discount)
    return splitBillDiscount + couponDiscount;
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

    const subtotal = selectedSplitBill.subtotal || 0;
    const tax = selectedSplitBill.tax || 0;
    const charge = selectedSplitBill.charge || 0;
    const tips = selectedSplitBill.tips || 0;
    const discount = calculateSplitBillDiscount(); // Use the updated discount calculation

    const total = subtotal + tax + charge + tips - discount;
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

  // Handle opening order details modal
  const handleOpenOrderDetailsModal = () => {
    if (!selectedPlacedOrder) {
      showError('Please select an order to view details');
      return;
    }
    setShowOrderDetailsModal(true);
  };

  // Handle creating invoice
  const handleCreateInvoice = () => {
    setShowOrderDetailsModal(false);
    setShowInvoiceModal(true);
  };

  // Handle printing invoice
  const handlePrintInvoice = () => {
    // This will trigger the browser's print dialog
    window.print();
    showSuccess('Payment processed successfully! Invoice printed successfully!');
    setShowInvoiceModal(false);

    // Remove the split bill if it was a split bill payment
    if (splitBillToRemove) {
      // Get the split bill being removed to know which items were paid
      const paidSplit = splitBills.find(split => split.id === splitBillToRemove);

      // Mark the split bill as paid before removing
      setSplitBills(prev => prev.map(split =>
        split.id === splitBillToRemove
          ? { ...split, paid: true }
          : split
      ));

      // Remove the split bill after a short delay to show the PAID status
      setTimeout(() => {
        setSplitBills(prev => {
          const updatedSplits = prev.filter(split => split.id !== splitBillToRemove);

          // If no more split bills, close the split bill modal
          if (updatedSplits.length === 0) {
            setShowSplitBillModal(false);
            setSelectedSplitBill(null);
          } else {
            // Select the first remaining split bill
            setSelectedSplitBill(updatedSplits[0]);
            // Recalculate totals for remaining splits
            setTimeout(() => recalculateSplitBillTotals(), 100);
          }

          return updatedSplits;
        });

        // Update splitItems to remove the paid items from the available pool
        if (paidSplit && paidSplit.items.length > 0) {
          setSplitItems(prev => prev.map(item => {
            const paidItem = paidSplit.items.find(paid => paid.food?.id === item.food?.id);
            if (paidItem) {
              const newQuantity = Math.max(0, item.quantity - paidItem.quantity);
              return {
                ...item,
                quantity: newQuantity
              };
            }
            return item;
          }));
        }

        setSplitBillToRemove(null);
      }, 1000); // Show PAID status for 1 second before removing
    }
  };

  // Handle opening status update modal
  const handleOpenStatusUpdateModal = (order, event) => {
    if (event) {
      event.stopPropagation();
    }
    setSelectedOrderForStatusUpdate(order);

    // Get the appropriate default status based on order type
    const getDefaultStatusForOrderType = (orderType) => {
      switch (orderType) {
        case 'In Store':
          return 'New'; // Default to New for In Store orders (now that all statuses are enabled)
        case 'Table':
        case 'Dine In':
        case 'Collection':
        case 'Delivery':
          return 'New'; // Default to New for other order types
        default:
          return 'New';
      }
    };

    setSelectedStatus(getDefaultStatusForOrderType(order.orderType));
    setShowStatusUpdateModal(true);
  };



  // Handle updating order status
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrderForStatusUpdate) return;

    try {
      // Map UI status to database status and corresponding date field
      let dbStatus = 'pending';
      let dateField = null;

      switch (selectedStatus) {
        case 'New':
          dbStatus = 'new';
          dateField = 'placed_at'; // Set placed_at when status is new
          break;
        case 'In Progress':
          dbStatus = 'in_progress';
          dateField = 'processing_date'; // Set processing_date when status is in_progress
          break;
        case 'Ready':
          dbStatus = 'ready';
          dateField = 'ready_date'; // Set ready_date when status is ready
          break;
        case 'On the way':
          dbStatus = 'on_the_way';
          dateField = 'ontheway'; // Set ontheway when status is on_the_way
          break;
        case 'Delivered':
          dbStatus = 'delivered';
          dateField = 'delivered_date'; // Set delivered_date when status is delivered
          break;
        case 'Completed':
          dbStatus = 'completed';
          dateField = 'confirmed_date'; // Set confirmed_date when status is completed
          break;
        case 'Pending':
          dbStatus = 'pending';
          dateField = null; // No need to set pending_date now
          break;
        case 'Complete':
          dbStatus = 'completed';
          dateField = 'done_date'; // Set done_date when status is completed
          break;
        case 'Confirmed':
          dbStatus = 'confirmed';
          dateField = 'confirmed_date'; // Set confirmed_date when status is confirmed
          break;
        case 'Processing':
          dbStatus = 'processing';
          dateField = 'processing_date'; // Set processing_date when status is processing
          break;
        case 'Handover':
          dbStatus = 'handover';
          dateField = null; // No need to set handover_date now
          break;
        case 'Picked Up':
          dbStatus = 'picked_up';
          dateField = null; // No need to set picked_up_date now
          break;
        case 'Cooked':
          dbStatus = 'cooked';
          dateField = null; // No need to set cooked_date now
          break;
        case 'Canceled':
          dbStatus = 'canceled';
          dateField = 'canceled_date'; // Set canceled_date when status is canceled
          break;
        default:
          dbStatus = selectedStatus.toLowerCase().replace(' ', '_');
          // Map common status patterns to date fields
          if (selectedStatus.toLowerCase().includes('new')) {
            dateField = 'placed_at';
          } else if (selectedStatus.toLowerCase().includes('confirmed')) {
            dateField = 'confirmed_date';
          } else if (selectedStatus.toLowerCase().includes('processing') || selectedStatus.toLowerCase().includes('in_progress')) {
            dateField = 'processing_date';
          } else if (selectedStatus.toLowerCase().includes('ready')) {
            dateField = 'ready_date';
          } else if (selectedStatus.toLowerCase().includes('on_the_way')) {
            dateField = 'ontheway';
          } else if (selectedStatus.toLowerCase().includes('delivered')) {
            dateField = 'delivered_date';
          } else if (selectedStatus.toLowerCase().includes('canceled')) {
            dateField = 'canceled_date';
          } else if (selectedStatus.toLowerCase().includes('done') || selectedStatus.toLowerCase().includes('completed')) {
            dateField = 'done_date';
          }
      }

      // Check if this is a new order (no databaseId) - just setting status for future orders
      if (!selectedOrderForStatusUpdate.databaseId) {
        setSelectedNewOrderStatus(selectedStatus);
        showSuccess(`Order status set to ${selectedStatus} for new orders!`);
        setShowStatusUpdateModal(false);
        setSelectedOrderForStatusUpdate(null);
        setSelectedStatus('New');
        return;
      }

      // Prepare update data with status and date
      const updateData = {
        order_status: dbStatus
      };

      // Add the corresponding date field if mapped
      if (dateField) {
        updateData[dateField] = new Date().toISOString();
      }

      // Update order status and date in database
      const updateResult = await window.myAPI.updateOrder(
        selectedOrderForStatusUpdate.databaseId,
        updateData
      );

      if (!updateResult.success) {
        showError('Failed to update order status: ' + updateResult.message);
        return;
      }

      // If order is completed, delivered, or canceled, free the associated tables
      if ((dbStatus === 'completed' || dbStatus === 'delivered') && selectedOrderForStatusUpdate.databaseId) {
        try {
          // Get the order details to check for table information
          const orderResult = await window.myAPI.getOrderById(selectedOrderForStatusUpdate.databaseId);
          if (orderResult.success && orderResult.data.table_details) {
            const tableDetails = JSON.parse(orderResult.data.table_details);
            if (tableDetails && tableDetails.tables && tableDetails.tables.length > 0) {
              const tableIds = tableDetails.tables.map(table => table.id);
              console.log('Freeing tables:', tableIds);

              const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIds, 'Free');
              if (tableUpdateResult.success) {
                console.log('Tables freed successfully:', tableUpdateResult.message);
              } else {
                console.warn('Failed to free tables:', tableUpdateResult.message);
              }
            }
          }
        } catch (error) {
          console.error('Error freeing tables:', error);
        }
      }

      // Update local state - remove order if it's completed, delivered, or canceled, otherwise update status
      const normalizedStatus = selectedStatus.toLowerCase();
      const shouldRemove = normalizedStatus === 'complete' ||
        normalizedStatus === 'completed' ||
        normalizedStatus === 'delivered' ||
        normalizedStatus === 'canceled' ||
        normalizedStatus === 'done' ||
        normalizedStatus === 'finished' ||
        normalizedStatus === 'closed';

      console.log('Status update debug:', {
        selectedStatus,
        normalizedStatus,
        shouldRemove,
        orderId: selectedOrderForStatusUpdate.id
      });

      if (shouldRemove) {
        // Remove the order from running orders immediately
        console.log('Removing order from running orders:', selectedOrderForStatusUpdate.id);
        console.log('Current orders before removal:', placedOrders.length);
        setPlacedOrders(prev => {
          console.log('Previous orders:', prev.map(o => ({ id: o.id, databaseId: o.databaseId, status: o.status })));
          const filtered = prev.filter(order =>
            order.id !== selectedOrderForStatusUpdate.id &&
            order.databaseId !== selectedOrderForStatusUpdate.databaseId
          );
          console.log('Orders after removal:', filtered.length);
          console.log('Removed order details:', {
            targetId: selectedOrderForStatusUpdate.id,
            targetDatabaseId: selectedOrderForStatusUpdate.databaseId
          });
          return filtered;
        });
        showSuccess(`Order ${selectedStatus.toLowerCase()} and removed from running orders!`);
      } else {
        // Update the order status in the list
        console.log('Updating order status in list:', selectedOrderForStatusUpdate.id);
        setPlacedOrders(prev => prev.map(order =>
          (order.id === selectedOrderForStatusUpdate.id || order.databaseId === selectedOrderForStatusUpdate.databaseId)
            ? { ...order, status: selectedStatus }
            : order
        ));
        showSuccess(`Order status updated to ${selectedStatus}!`);
      }

      setShowStatusUpdateModal(false);
      setSelectedOrderForStatusUpdate(null);
      setSelectedStatus('New');
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Failed to update order status. Please try again.');
    }
  };

  // Handle modify order - load order details back into cart
  const handleModifyOrder = async () => {
    if (!selectedPlacedOrder) {
      showError('Please select an order to modify');
      return;
    }

    // Check if order is paid and has valid status for modification
    if (selectedPlacedOrder.payment_status === 'paid') {
      const orderStatus = selectedPlacedOrder.status?.toLowerCase();
      const orderType = selectedPlacedOrder.orderType?.toLowerCase();

      // Check if order status allows modification
      const isStatusValid = (orderType === 'table' || orderType === 'collection' || orderType === 'instore')
        ? orderStatus !== 'completed'
        : (orderType === 'delivery'
          ? orderStatus !== 'on_the_way' && orderStatus !== 'delivered' && orderStatus !== 'completed'
          : true);

      if (!isStatusValid) {
        showError('Cannot modify order: Order status does not allow modification');
        return;
      }
    }

    // Clear current cart first
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
    // Don't clear selectedOrderType here - it will be set from the order being modified

    // Load order details back into cart with full details
    if (selectedPlacedOrder.items && selectedPlacedOrder.items.length > 0) {
      console.log('Loading order items:', selectedPlacedOrder.items);

      // Convert order items back to cart items with all details
      const cartItemsFromOrder = selectedPlacedOrder.items.map((item, index) => {
        console.log('Processing item:', item);

        // Check if it's a custom pizza item
        if (item.isCustomPizza) {
          return {
            id: Date.now() + index, // Generate unique IDs
            name: item.name,
            price: item.price,
            tax: item.tax,
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            variations: {},
            adons: [],
            slices: item.slices,
            size: item.size,
            selectedPizzas: item.selectedPizzas,
            flavorIngredients: item.flavorIngredients,
            sliceColors: item.sliceColors,
            customNote: item.customNote,
            isCustomPizza: true,
            addedAt: new Date().toISOString()
          };
        }

        // Check if it's a custom food item
        if (item.isCustomFood) {
          return {
            id: Date.now() + index, // Generate unique IDs
            name: item.name,
            price: item.price,
            tax: item.tax,
            totalPrice: item.totalPrice,
            quantity: item.quantity,
            variations: {},
            adons: [],
            customFoodName: item.customFoodName,
            customFoodNote: item.customFoodNote,
            customFoodIngredients: item.customFoodIngredients,
            isCustomFood: true,
            addedAt: new Date().toISOString()
          };
        }

        // Parse variations and addons from JSON if they're strings
        let variations = {};
        let adons = [];

        try {
          if (typeof item.variations === 'string') {
            variations = JSON.parse(item.variations);
          } else {
            variations = item.variations || {};
          }

          if (typeof item.adons === 'string') {
            adons = JSON.parse(item.adons);
          } else {
            adons = item.adons || [];
          }
        } catch (error) {
          console.error('Error parsing variations/addons for item:', item, error);
        }

        console.log('Parsed variations:', variations);
        console.log('Parsed addons:', adons);

        return {
          id: Date.now() + index, // Generate unique IDs
          food: item.food,
          variations: variations,
          adons: adons,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          addedAt: new Date().toISOString()
        };
      });

      console.log('Cart items from order:', cartItemsFromOrder);
      setCartItems(cartItemsFromOrder);
      setCartItemId(Date.now() + cartItemsFromOrder.length + 1);
    }

    // Load customer information
    if (selectedPlacedOrder.customer) {
      console.log('Loading customer:', selectedPlacedOrder.customer);
      setSelectedCustomer(selectedPlacedOrder.customer);
    }

    // Load order type - selectedPlacedOrder.orderType already contains UI display value
    if (selectedPlacedOrder.orderType) {
      console.log('Loading order type from order:', selectedPlacedOrder.orderType);
      setSelectedOrderType(selectedPlacedOrder.orderType);
      console.log('Order type set to:', selectedPlacedOrder.orderType);
    } else {
      console.log('No order type found in selectedPlacedOrder');
    }

    // Load table information if it's a table order
    if (selectedPlacedOrder.table && selectedPlacedOrder.table !== 'None') {
      console.log('Loading table:', selectedPlacedOrder.table);

      // First, try to get table details from database if we have the database ID
      if (selectedPlacedOrder.databaseId) {
        try {
          const orderResult = await window.myAPI.getOrderById(selectedPlacedOrder.databaseId);
          if (orderResult.success && orderResult.data.table_details) {
            const tableDetails = JSON.parse(orderResult.data.table_details);
            if (tableDetails && tableDetails.tables && tableDetails.tables.length > 0) {
              console.log('Loading table details from database:', tableDetails);

              // Load all tables from database into reserved tables
              const reservedTablesFromDB = tableDetails.tables.map(tableDetail => {
                const table = tables.find(t => t.id === tableDetail.id);
                return {
                  id: tableDetail.id.toString(),
                  tableNo: table?.table_no || tableDetail.table_no,
                  persons: tableDetail.persons || table?.seat_capacity || 4,
                  floor: table?.floor_name || tableDetail.floor_name
                };
              });
              setReservedTables(reservedTablesFromDB);
              console.log('Loaded reserved tables from database:', reservedTablesFromDB);

              // Load the first table as the selected table
              const firstTable = tableDetails.tables[0];
              const table = tables.find(t => t.id === firstTable.id);
              if (table) {
                console.log('Found table from database:', table);
                setSelectedFloor(table.floor_name || 'Floor 1');
                setSelectedTable(table.id.toString());
                setSelectedPersons(firstTable.persons || table.seat_capacity || 4);
              }

              // Skip the UI table field parsing since we have database data
              return;
            }
          }
        } catch (error) {
          console.error('Error loading table details from database:', error);
        }
      }

      // Fallback to UI table field parsing
      const tableMatch = selectedPlacedOrder.table.match(/Table (\d+)/);
      if (tableMatch) {
        const tableNumber = tableMatch[1];
        // Find the table by table number
        const table = tables.find(t => t.table_no.toString() === tableNumber);
        if (table) {
          console.log('Found table:', table);
          // Set the floor first, then the table
          setSelectedFloor(table.floor_name || 'Floor 1');
          setSelectedTable(table.id.toString());
        } else {
          console.log('Table not found, setting table name as is');
          setSelectedTable(selectedPlacedOrder.table);
        }
      } else {
        setSelectedTable(selectedPlacedOrder.table);
      }
    }

    // Load applied coupon if any
    if (selectedPlacedOrder.coupon) {
      console.log('Loading coupon:', selectedPlacedOrder.coupon);
      setAppliedCoupon(selectedPlacedOrder.coupon);
    }

    // Load waiter information if available
    if (selectedPlacedOrder.waiter) {
      console.log('Loading waiter:', selectedPlacedOrder.waiter);
      // You can add a waiter state if needed
    }

    // Set modification flags
    setIsModifyingOrder(true);
    setModifyingOrderId(selectedPlacedOrder.databaseId);

    // Store payment information if order is paid
    if (selectedPlacedOrder.payment_status === 'paid') {
      setModifyingOrderPaymentInfo({
        payment_method: selectedPlacedOrder.payment_method,
        paid_amount: selectedPlacedOrder.order_amount || 0
      });
      setShowPayLaterButton(false);
      setHasResetPayment(false);
    } else {
      setModifyingOrderPaymentInfo(null);
      setShowPayLaterButton(false);
      setHasResetPayment(false);
    }

    // Don't remove the order from placed orders - keep it there
    // setPlacedOrders(prev => prev.filter(order => order.id !== selectedPlacedOrder.id));
    setSelectedPlacedOrder(null);

    // Automatically open schedule modal if the order type is Collection
    if (selectedPlacedOrder.orderType === 'Collection') {
      await handleOpenScheduleModal();
    }

    showSuccess('Order loaded for modification. You can now edit the items.');
  };

  // Handle cancel order button click - show modal
  const handleCancelOrder = () => {
    if (!selectedPlacedOrder) {
      showError('Please select an order to cancel');
      return;
    }

    setShowCancelOrderModal(true);
    setCancellationReason('');
  };

  // Handle actual order cancellation with reason
  const handleConfirmCancelOrder = async (saveReason = true) => {
    if (!selectedPlacedOrder) {
      showError('Please select an order to cancel');
      return;
    }

    try {
      // Prepare update data
      const updateData = {
        order_status: 'canceled'
      };

      // Add cancellation reason if saving reason
      if (saveReason && cancellationReason.trim()) {
        updateData.cancellation_reason = cancellationReason.trim();
      }

      // Update order status to canceled in database
      if (selectedPlacedOrder.databaseId) {
        const updateResult = await window.myAPI.updateOrder(selectedPlacedOrder.databaseId, updateData);

        if (!updateResult.success) {
          showError('Failed to cancel order: ' + updateResult.message);
          return;
        }

        // Free the associated tables when order is canceled
        try {
          // Get the order details to check for table information
          const orderResult = await window.myAPI.getOrderById(selectedPlacedOrder.databaseId);
          if (orderResult.success && orderResult.data.table_details) {
            const tableDetails = JSON.parse(orderResult.data.table_details);
            if (tableDetails && tableDetails.tables && tableDetails.tables.length > 0) {
              const tableIds = tableDetails.tables.map(table => table.id);
              console.log('Freeing tables due to cancellation:', tableIds);

              const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIds, 'Free');
              if (tableUpdateResult.success) {
                console.log('Tables freed successfully after cancellation:', tableUpdateResult.message);
              } else {
                console.warn('Failed to free tables after cancellation:', tableUpdateResult.message);
              }
            }
          }
        } catch (error) {
          console.error('Error freeing tables after cancellation:', error);
        }
      }

      // Remove the order from running orders since it's canceled
      setPlacedOrders(prev => prev.filter(order => order.id !== selectedPlacedOrder.id));

      // Close modal and reset
      setShowCancelOrderModal(false);
      setCancellationReason('');

      // Remove from selected order since it's now canceled
      setSelectedPlacedOrder(null);

      showSuccess('Order canceled successfully!');
    } catch (error) {
      console.error('Error canceling order:', error);
      showError('Failed to cancel order. Please try again.');
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (!selectedPlacedOrder) {
      showError('Please select an order to delete');
      return;
    }

    try {
      // Delete order from database
      if (selectedPlacedOrder.databaseId) {
        // First, get the order details to check for table information before deletion
        let tableIdsToFree = [];
        try {
          const orderResult = await window.myAPI.getOrderById(selectedPlacedOrder.databaseId);
          if (orderResult.success && orderResult.data.table_details) {
            const tableDetails = JSON.parse(orderResult.data.table_details);
            if (tableDetails && tableDetails.tables && tableDetails.tables.length > 0) {
              tableIdsToFree = tableDetails.tables.map(table => table.id);
            }
          }
        } catch (error) {
          console.error('Error getting order details before deletion:', error);
        }

        const deleteResult = await window.myAPI.deleteOrder(selectedPlacedOrder.databaseId);

        if (!deleteResult.success) {
          showError('Failed to delete order: ' + deleteResult.message);
          return;
        }

        // Free the associated tables after successful deletion
        if (tableIdsToFree.length > 0) {
          try {
            console.log('Freeing tables due to deletion:', tableIdsToFree);
            const tableUpdateResult = await window.myAPI.tableUpdateMultipleStatuses(tableIdsToFree, 'Free');
            if (tableUpdateResult.success) {
              console.log('Tables freed successfully after deletion:', tableUpdateResult.message);
            } else {
              console.warn('Failed to free tables after deletion:', tableUpdateResult.message);
            }
          } catch (error) {
            console.error('Error freeing tables after deletion:', error);
          }
        }
      }

      // Remove from local state
      setPlacedOrders(prev => prev.filter(order => order.id !== selectedPlacedOrder.id));
      setSelectedPlacedOrder(null);

      showSuccess('Order deleted successfully!');
    } catch (error) {
      console.error('Error deleting order:', error);
      showError('Failed to delete order. Please try again.');
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Ready':
        return 'bg-blue-100 text-blue-700';
      case 'Complete':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  // Schedule Order Functions
  const handleOpenScheduleModal = async () => {
    try {
      // Fetch hotel information to get opening and closing times
      if (!window.myAPI) {
        showError('API not available');
        return;
      }

      const hotelResult = await window.myAPI.getHotelInfo();
      if (!hotelResult.success) {
        showError('Failed to fetch hotel information');
        return;
      }

      setHotelInfo(hotelResult.data);

      // Set today's date as default
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      setSelectedScheduleDate(todayString);

      // Generate time slots based on hotel opening and closing times
      generateTimeSlots(hotelResult.data, todayString);

      setShowScheduleModal(true);
    } catch (error) {
      console.error('Error opening schedule modal:', error);
      showError('Failed to open schedule modal');
    }
  };

  const generateTimeSlots = (hotel, selectedDate) => {
    if (!hotel.opening_time || !hotel.closeing_time) {
      showError('Hotel opening/closing times not configured');
      return;
    }

    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDateObj.toDateString() === now.toDateString();

    // Parse opening and closing times (assuming format like "09:00" or "09:00:00")
    const openingTime = hotel.opening_time.split(':').slice(0, 2).join(':');
    const closingTime = hotel.closeing_time.split(':').slice(0, 2).join(':');

    const slots = [];
    const startHour = parseInt(openingTime.split(':')[0]);
    const startMinute = parseInt(openingTime.split(':')[1]);
    const endHour = parseInt(closingTime.split(':')[0]);
    const endMinute = parseInt(closingTime.split(':')[1]);

    // Generate 5-minute intervals
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        // Skip if this time is after closing time
        if (hour === endHour && minute >= endMinute) break;

        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(selectedDate + 'T' + timeString);

        // If it's today, only show future times
        if (isToday && slotDateTime <= now) continue;

        slots.push(timeString);
      }
    }

    setAvailableTimeSlots(slots);
  };

  const handleScheduleDateChange = (date) => {
    setSelectedScheduleDate(date);
    setSelectedScheduleTime(''); // Reset time when date changes
    if (hotelInfo) {
      generateTimeSlots(hotelInfo, date);
    }
  };

  const handleScheduleTimeSelect = (time) => {
    setSelectedScheduleTime(time);
    setUseCustomTime(false);
    setCustomTime('');
  };

  const handleCustomTimeChange = (time) => {
    setCustomTime(time);
    setUseCustomTime(true);
    setSelectedScheduleTime('');
  };

  const handleScheduleConfirm = () => {
    const finalTime = useCustomTime ? customTime : selectedScheduleTime;

    if (!finalTime) {
      showError('Please select a time');
      return;
    }

    // Validate custom time if used
    if (useCustomTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(customTime)) {
        showError('Please enter a valid time in HH:MM format');
        return;
      }

      // Check if custom time is within hotel hours
      if (hotelInfo) {
        const openingTime = hotelInfo.opening_time.split(':').slice(0, 2).join(':');
        const closingTime = hotelInfo.closeing_time.split(':').slice(0, 2).join(':');

        if (customTime < openingTime || customTime > closingTime) {
          showError(`Time must be between ${openingTime} and ${closingTime}`);
          return;
        }

        // Check if it's today and the time is in the past
        const now = new Date();
        const selectedDateObj = new Date(selectedScheduleDate);
        const isToday = selectedDateObj.toDateString() === now.toDateString();

        if (isToday) {
          const currentTime = now.toTimeString().slice(0, 5);
          if (customTime <= currentTime) {
            showError('Custom time must be in the future for today');
            return;
          }
        }
      }
    }

    // Combine date and time
    const scheduledDateTime = `${selectedScheduleDate}T${finalTime}:00`;

    // Store the scheduled time in the order data
    // This will be used when placing the order
    setSelectedScheduleDateTime(scheduledDateTime);

    setShowScheduleModal(false);
    showSuccess(`Order scheduled for ${selectedScheduleDate} at ${finalTime}`);
  };

  const handleScheduleCancel = () => {
    setShowScheduleModal(false);
    setSelectedScheduleTime('');
    setSelectedScheduleDate('');
    setCustomTime('');
    setUseCustomTime(false);
  };

  return (
    <>
      <div className="flex justify-between gap-2 h-full">
        <div className='flex w-[20%] flex-col bg-[#ffffff] border-r border-gray-200 shadow-lg rounded-xl pb-4'>
          {/* Main content row */}
          {/* Running Orders */}
          <div className="p-2">

            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xs sm:text-sm md:text-md lg:text-lg text-gray-800">Active Orders</h2>
              <button
                onClick={() => {
                  playButtonSound();
                  fetchExistingOrders();
                }}
                className="text-[#715af3] text-[11px] font-bold bg-white border border-gray-300 rounded-lg p-2 cursor-pointer hover:text-blue-800 flex items-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150"
              >
                <RefreshCw size={12} />
                {/* Refresh */}
              </button>
            </div>

            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  name="runningOrdersSearchQuery"
                  placeholder="Search Active Orders"
                  value={runningOrdersSearchQuery}
                  onChange={(e) => setRunningOrdersSearchQuery(e.target.value)}
                  onFocus={(e) => handleAnyInputFocus(e, 'runningOrdersSearchQuery')}
                  onClick={(e) => handleAnyInputClick(e, 'runningOrdersSearchQuery')}
                  onBlur={(e) => handleCustomInputBlur(e, 'runningOrdersSearchQuery')}
                  className="w-full pl-8 text-sm font-semibold pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="overflow-y-auto p-3 h-100">

            {/* Placed Orders List */}
            <PlaceOrderComponent
              placedOrders={placedOrders}
              runningOrdersSearchQuery={runningOrdersSearchQuery}
              currentTime={new Date()}
              expandedOrders={expandedOrders}
              selectedPlacedOrder={selectedPlacedOrder}
              setSelectedPlacedOrder={setSelectedPlacedOrder}
              handleToggleOrderExpansion={handleToggleOrderExpansion}
              getStatusBadgeStyle={getStatusBadgeStyle}
              foodDetails={foodDetails}
              handleConvertDraftToOrder={handleConvertDraftToOrder}
              handleOpenStatusUpdateModal={handleOpenStatusUpdateModal}
            />
          </div>
          {/* Order Action Buttons - Below Running Orders Box */}
          <div className="flex justify-center p-2">
            {/* Modification Mode Indicator */}
            {isModifyingOrder && (
              <></>
            )}
            <div className="flex flex-col gap-2 w-full">
              {/* First Row - Bill and Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-2">
                {selectedPlacedOrder?.isDraft ? (
                  // Draft order actions
                  <>
                    <button
                      className="bg-green-600 text-white text-xs sm:text-sm md:text-xs lg:text-xs font-medium p-1 rounded-lg hover:bg-green-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle convert to order
                        handleConvertDraftToOrder(selectedPlacedOrder);
                      }}
                      disabled={!selectedPlacedOrder}
                    >
                      PLACE
                    </button>
                  </>
                ) : (
                  // Regular order actions
                  <>
                    <button
                      className={`text-[14px] font-bold rounded-lg p-1 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder && !(isModifyingOrder && selectedPlacedOrder && selectedPlacedOrder.databaseId === modifyingOrderId)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        }`}
                      // className="flex-1 bg-blue-600 text-white text-xs sm:text-sm md:text-xs lg:text-sm font-medium p-1 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle mark as action
                        handleOpenStatusUpdateModal(selectedPlacedOrder, e);
                      }}
                      disabled={!selectedPlacedOrder}
                    >
                      STATUS
                    </button>
                  </>
                )}
                <button
                  data-invoice-button
                  onClick={() => setShowInvoiceOptions(!showInvoiceOptions)}
                  disabled={!selectedPlacedOrder}
                  className={`text-[14px] font-bold rounded-lg p-1 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder ? 'bg-[#010101] text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
                  <Receipt size={14} />
                  BILL
                </button>
                {/* <button
                  onClick={() => {
                    if (selectedPlacedOrder) {
                      setIsInvoiceAfterPayment(false); // This is NOT after payment
                      setShowInvoiceModal(true);
                    }
                  }}
                  disabled={!selectedPlacedOrder}
                  className={`text-[14px] font-bold rounded-lg p-1 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder ? 'bg-[#4d36eb] text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
                  <FileText size={14} />
                  INVOICE
                </button> */}
                {/* Second Row - Order Details, Modify Order, Cancel */}
                <button
                  onClick={handleOpenOrderDetailsModal}
                  disabled={!selectedPlacedOrder}
                  className={`text-[14px] font-bold rounded-lg p-1 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder ? 'bg-[#4d36eb] text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                >
                  <Eye size={14} />
                  DETAILS
                </button>
                <button
                  onClick={async () => {
                    try {
                      await handleModifyOrder();
                    } catch (error) {
                      console.error('Error modifying order:', error);
                      showError('Failed to modify order. Please try again.');
                    }
                  }}
                  disabled={!selectedPlacedOrder || (isModifyingOrder && selectedPlacedOrder && selectedPlacedOrder.databaseId === modifyingOrderId)}
                  className={`text-[14px] font-bold rounded-lg p-1 cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder && !(isModifyingOrder && selectedPlacedOrder && selectedPlacedOrder.databaseId === modifyingOrderId)
                    ? 'bg-[#f3be25] text-white hover:bg-[#e6b31e]'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                  title={
                    !selectedPlacedOrder
                      ? 'Select an order to modify'
                      : (isModifyingOrder && selectedPlacedOrder && selectedPlacedOrder.databaseId === modifyingOrderId)
                        ? 'Order is already being modified'
                        : 'Modify order'
                  }
                >
                  <Edit size={14} />
                  LOAD
                </button>
                {/* <button
                  onClick={handleCancelOrder}
                  disabled={!selectedPlacedOrder}
                  className={`text-[13px] col-span-2 mx-auto font-bold rounded-lg p-1 flex items-center justify-center gap-2 shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150 ${selectedPlacedOrder ? 'bg-[#C42232] text-white cursor-pointer hover:bg-[#b01a28]' : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }`}
                >
                  <X size={14} />
                  CANCEL ORDER
                </button> */}
              </div>
            </div>
          </div>

          {/* Invoice Options Dropdown */}
          {showInvoiceOptions && selectedPlacedOrder && (
            <InvoiceOptions
              resetFinalizeSaleModalForSinglePay={resetFinalizeSaleModalForSinglePay}
              setIsSinglePayMode={setIsSinglePayMode}
              selectedPlacedOrder={selectedPlacedOrder}
              setCartItems={setCartItems}
              setCartItemId={setCartItemId}
              setSelectedCustomer={setSelectedCustomer}
              setAppliedCoupon={setAppliedCoupon}
              setShowFinalizeSaleModal={setShowFinalizeSaleModal}
              setShowInvoiceOptions={setShowInvoiceOptions}
              handleOpenSplitBillModal={handleOpenSplitBillModal}
            />
          )}
        </div>

        {/* Menu Items */}
        <div className="w-[40%] bg-white flex flex-col shadow-lg rounded-xl overflow-hidden">
          {/* Search and categories section */}
          <div className="py-3 px-2 border-b border-gray-200">
            {/* Search bar */}
            <div className="relative mb-4 w-full">
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
      focus:outline-none focus:ring-2 focus:ring-primary"
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
            )}
            <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
              <div className="flex items-center gap-2">

                <span className="font-semibold text-gray-800 text-xs sm:text-sm md:text-xs lg:text-sm">🍽 Food &amp; Categories</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenSplitPizzaModal}
                  className="bg-[#e53943] hover:bg-[#c62836] cursor-pointer text-white font-medium rounded-lg p-1 text-xs sm:text-sm md:text-xs lg:text-sm transition-colors"
                >
                  Create Your Own
                </button>
                <button
                  onClick={handleOpenOrderModal}
                  className="bg-primary hover:bg-primaryLight cursor-pointer text-white font-medium rounded-lg p-1 text-xs sm:text-sm md:text-xs lg:text-sm transition-colors"
                >
                  Open Order
                </button>
              </div>
            </div>
            {/* Category buttons */}
            <div className="flex flex-wrap gap-1.5">
              {loading ? (
                <div className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">Loading categories...</div>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <button
                    key={category.id}
                    className={`p-1 text-md font-semibold flex items-center justify-center gap-1 
                       btn-lifted transition-colors cursor-pointer ${selectedCategory?.id === category.id
                        ? 'bg-white text-black border-2 border-primary'
                        : 'bg-primary text-white hover:bg-primary/90'
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
          {/* Modification indicator */}
          {isModifyingOrder && (
            <></>
          )}
          {/* Draft Update indicator */}
          {currentDraftId && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 mb-2 mx-2 mt-2" role="alert">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium">Updating Draft: {currentDraftNumber || currentDraftId}</span>
              </div>
            </div>
          )}
          <div className="px-2 py-2 flex-shrink-0 space-y-2">
            {/* Order Type Buttons Row */}
            <div className="grid grid-cols-3 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {shouldShowOrderType('instore') && (
                <button
                  onClick={() => {
                    // Prevent order type change when modifying an existing order
                    if (isModifyingOrder) {
                      showWarning('Cannot change order type while modifying an existing order');
                      return;
                    }
                    setSelectedOrderType('In Store');
                    // Clear table selections when switching to non-table order type
                    setSelectedTable('');
                    setSelectedPersons('');
                    setReservedTables([]);
                    // Clear schedule when switching away from Collection
                    setSelectedScheduleDateTime('');
                  }}
                  disabled={isModifyingOrder}
                  className={`p-1 text-[#666] text-base font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                          transition-colors cursor-pointer ${isModifyingOrder
                      ? (selectedOrderType === 'In Store' ? 'bg-primary text-white cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                      : selectedOrderType === 'In Store'
                        ? 'bg-primary text-white'
                        : 'bg-white hover:bg-[#F8F9FA] hover:border-primary hover:border-2'
                    }`}>
                  <Store size={14} />
                  In Store
                </button>
              )}
              {shouldShowOrderType('table') && (
                <button
                  onClick={() => {
                    // Prevent order type change when modifying an existing order
                    if (isModifyingOrder) {
                      showWarning('Cannot change order type while modifying an existing order');
                      return;
                    }
                    setSelectedOrderType('Table');
                    // Clear schedule when switching away from Collection
                    setSelectedScheduleDateTime('');
                    setShowTableModal(true);
                  }}
                  disabled={isModifyingOrder}
                  className={`p-1 text-[#666] text-base font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                          transition-colors cursor-pointer ${isModifyingOrder
                      ? (selectedOrderType === 'Table' ? 'bg-primary text-white cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                      : selectedOrderType === 'Table'
                        ? 'bg-primary text-white'
                        : 'bg-white hover:border-primary hover:border-2 hover:bg-[#F8F9FA]'
                    }`}>
                  <TableIcon size={14} />
                  Table
                </button>
              )}
              {shouldShowOrderType('collection') && (
                <button
                  onClick={() => {
                    // Prevent order type change when modifying an existing order
                    if (isModifyingOrder) {
                      showWarning('Cannot change order type while modifying an existing order');
                      return;
                    }
                    setSelectedOrderType('Collection');
                    // Clear table selections when switching to non-table order type
                    setSelectedTable('');
                    setSelectedPersons('');
                    setReservedTables([]);
                    // Check if selected customer has required data for Collection orders
                    if (selectedCustomer) {
                      const hasPhone = selectedCustomer.phone && selectedCustomer.phone.trim().length > 0;
                      if (!hasPhone) {
                        // Open edit modal to add missing phone number
                        setShowEditModal(true);
                      }
                    } else {
                      // Open customer search modal only if no customer is selected
                      setShowCustomerSearchModal(true);
                    }
                  }}
                  disabled={isModifyingOrder}
                  className={`p-1 text-[#666] text-base font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                          transition-colors cursor-pointer ${isModifyingOrder
                      ? (selectedOrderType === 'Collection' ? 'bg-primary text-white cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                      : selectedOrderType === 'Collection'
                        ? 'bg-primary text-white'
                        : 'bg-white hover:border-primary hover:border-2 hover:bg-[#F8F9FA]'
                    }`}>
                  <Package size={14} />
                  Collection
                </button>
              )}
              {shouldShowOrderType('delivery') && (
                <button
                  onClick={() => {
                    // Prevent order type change when modifying an existing order
                    if (isModifyingOrder) {
                      showWarning('Cannot change order type while modifying an existing order');
                      return;
                    }
                    setSelectedOrderType('Delivery');
                    // Clear table selections when switching to non-table order type
                    setSelectedTable('');
                    setSelectedPersons('');
                    setReservedTables([]);
                    // Clear schedule when switching away from Collection
                    setSelectedScheduleDateTime('');
                    // Check if selected customer has required data for Delivery orders
                    if (selectedCustomer) {
                      const hasPhone = selectedCustomer.phone && selectedCustomer.phone.trim().length > 0;
                      const hasAddress = selectedCustomer.addresses && selectedCustomer.addresses.length > 0;
                      if (!hasPhone || !hasAddress) {
                        // Open edit modal to add missing phone number or address
                        setShowEditModal(true);
                      }
                    } else {
                      // Open customer search modal only if no customer is selected
                      setShowCustomerSearchModal(true);
                    }
                  }}
                  disabled={isModifyingOrder}
                  className={`p-1 text-[#666] text-base font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                           transition-colors cursor-pointer ${isModifyingOrder
                      ? (selectedOrderType === 'Delivery' ? 'bg-primary text-white cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                      : selectedOrderType === 'Delivery'
                        ? 'bg-primary text-white'
                        : 'bg-white hover:border-primary hover:border-2 hover:bg-[#F8F9FA]'
                    }`}>
                  <Truck size={14} />
                  Delivery
                </button>
              )}
              <button
                onClick={handleOpenScheduleModal}
                className={`p-1 text-base text-[#666666] font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                        transition-colors cursor-pointer hover:border-[#007BFF] hover:border-2 ${selectedScheduleDateTime
                    ? 'bg-primary text-white border-primary'
                    : 'text-black hover:border-[#007BFF] hover:border-2 hover:bg-[#F8F9FA]'
                  }`}>
                <Clock size={14} />
                Due to
                {selectedScheduleDateTime && (
                  <div></div>
                )}
              </button>
              <button
                onClick={() => setShowCustomerSearchModal(true)}
                className="p-1 bg-[#007BFF] text-white text-base font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                       transition-colors cursor-pointer">
                <User size={16} />
                Customer
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-xs sm:text-sm md:text-xs lg:text-sm text-base text-[#666666] font-semibold rounded-lg border border-[#e0e0e0] flex items-center justify-center gap-1 
                         transition-colors cursor-pointer hover:border-[#007BFF] hover:bg-[#F8F9FA] hover:border-2">
                {!selectedCustomer && <UserCheck size={14} />}
                {(() => {
                  console.log('Rendering customer button - selectedCustomer:', selectedCustomer);
                  console.log('selectedCustomer name:', selectedCustomer?.name);
                  return selectedCustomer ? selectedCustomer.name : 'Walk In Customer';
                })()}
              </button>
              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    showError('Cart is already empty');
                    return;
                  }

                  setShowDeleteCartModal(true);
                }}
                disabled={cartItems.length === 0 || isModifyingOrder}
                className={`flex justify-center bg-[#dc3545] items-center gap-2 text-white w-[100%] h-10 px-3 py-1.5 text-base font-semibold rounded-lg border border-[#e0e0e0] ${cartItems.length > 0 && !isModifyingOrder
                  ? 'cursor-pointer'
                  : 'cursor-pointer hover:border-[#007BFF] hover:border-2'
                  }`}>
                <Trash2 size={14} />
                Delete
              </button>
            </div>
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
                  {cartItems.filter(item => item.quantity > 0).length > 0 ? (
                    cartItems.filter(item => item.quantity > 0).map((item) => (
                      <tr key={item.id} className="grid grid-cols-[auto_100px_100px_100px] gap-2 items-center text-sm p-2 border-b border-gray-200">

                        <td className="text-gray-800 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {item.isCustomPizza ? 'Split Pizza' :
                                item.isCustomFood ? 'Open Food' :
                                  (item.food?.name || 'Unknown Food')}
                            </span>

                            {/* Show custom pizza details */}
                            {item.isCustomPizza && (
                              <div className="text-xs text-gray-600 mt-1">
                                <div>{item.size}" - {item.slices} halves</div>
                                {item.customNote && <div>Note: {item.customNote}</div>}
                                <div>Price: €{item.price.toFixed(2)}</div>
                              </div>
                            )}

                            {/* Show custom food details */}
                            {item.isCustomFood && (
                              <div className="text-xs text-gray-600 mt-1">
                                <div>Name: {item.customFoodName}</div>
                                {item.customFoodNote && <div>Note: {item.customFoodNote}</div>}
                                {item.customFoodIngredients && item.customFoodIngredients.length > 0 && (
                                  <div>Ingredients: {item.customFoodIngredients.map(ing => ing.name).join(', ')}</div>
                                )}
                                <div>Price: €{item.price.toFixed(2)}</div>
                              </div>
                            )}

                            {/* Show variations if any */}
                            {item.variations && Object.keys(item.variations).length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {Object.entries(item.variations).map(([variationId, selectedOption]) => {
                                  // Try to get variation name from food details if available
                                  const variation = foodDetails?.variations?.find(v => v.id === parseInt(variationId));
                                  const variationName = variation?.name || variationId;

                                  // Handle both single and multiple selections
                                  const selections = Array.isArray(selectedOption) ? selectedOption : [selectedOption];

                                  return (
                                    <div key={variationId} className="flex items-center gap-1">
                                      <span className="text-gray-500">• {variationName}:</span>
                                      <span className="text-gray-700">
                                        {selections.map((optionId, index) => {
                                          const option = variation?.options?.find(o => o.id === parseInt(optionId));
                                          return (
                                            <span key={optionId}>
                                              {option?.option_name || optionId}
                                              {index < selections.length - 1 ? ', ' : ''}
                                            </span>
                                          );
                                        })}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Show addons if any */}
                            {item.adons && item.adons.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {item.adons.map((addonId, index) => {
                                  // Try to get addon name from food details if available
                                  const addon = foodDetails?.adons?.find(a => a.id === parseInt(addonId));
                                  const addonName = addon?.name || addonId;
                                  const addonPrice = addon?.price;

                                  return (
                                    <div key={index} className="flex items-center gap-1">
                                      <span className="text-gray-500">• Addon:</span>
                                      <span className="text-gray-700">{addonName}</span>
                                      {addonPrice && <span className="text-gray-500">(+€{addonPrice.toFixed(2)})</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                        {/* <td className="text-gray-800 text-center">€{(item.totalPrice / item.quantity).toFixed(2)}</td> */}
                        <td className="flex items-center justify-center">
                          <div className="flex items-center rounded">
                            <button
                              className="text-primary flex items-center cursor-pointer justify-center transition-colors"
                              onClick={() => {
                                console.log('=== CART MINUS BUTTON CLICKED ===');
                                console.log('Item ID:', item.id, 'Current quantity:', item.quantity);
                                updateCartItemQuantity(item.id, item.quantity - 1);
                              }}
                            >
                              <Minus size={15} />
                            </button>
                            <span className="w-8 text-center text-gray-800 py-1 text-sm">{item.quantity}</span>
                            <button
                              className="flex items-center cursor-pointer justify-center text-primary transition-colors"
                              onClick={() => {
                                console.log('=== CART PLUS BUTTON CLICKED ===');
                                console.log('Item ID:', item.id, 'Current quantity:', item.quantity);
                                updateCartItemQuantity(item.id, item.quantity + 1);
                              }}
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
            <div className='bg-white mt-5 w-[100%] rounded-lg shadow-sm border border-gray-200 p-4'>
              <div className="space-y-4 pb-2">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">Subtotal</div>
                    <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900">
                      €{calculateCartSubtotal().toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">Tax ({getTaxRate().toFixed(1)}%)</div>
                    <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900">
                      €{calculateCartTax().toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">Discount</div>
                    <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900">
                      €{calculateCartDiscount().toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-700 mb-2">Total</div>
                    <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900">
                      €{calculateCartTotal().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
              {/* Total Payable */}
              {/* <div className='flex justify-center items-center mb-4'>
                <div
                  className="bg-[#d3D3D3] px-4 py-2 btn-lifted cursor-pointer w-[70%] rounded flex items-center justify-center hover:bg-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Eye size={14} />
                    <span className="text-gray-800 font-medium">Total Payable : €{calculateCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div> */}

              {/* Primary Action Buttons */}
              <div className="grid grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                {/* Hide UPDATE ORDER button when modifying paid orders */}
                {!(isModifyingOrder && modifyingOrderPaymentInfo) && (
                  <button
                    onClick={() => {
                      playButtonSound();
                      handlePlaceOrder();
                    }}
                    className="bg-[#fb8b02] text-white btn-lifted p-1 text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm font-bold rounded flex items-center gap-2 hover:bg-[#e67a00] transition-colors"
                  >
                    <ShoppingCart size={16} />
                    {isModifyingOrder ? 'UPDATE ORDER' : 'PLACE ORDER'}
                  </button>
                )}
                <button
                  onClick={() => {
                    playButtonSound();
                    handlePayment();
                  }}
                  className={`${isModifyingOrder && modifyingOrderPaymentInfo ? 'col-span-2' : 'col-span-1'} bg-[#16A34A] text-white btn-lifted p-2 text-xs sm:text-sm md:text-lg:text-xs xl:text-sm font-bold rounded flex items-center justify-center gap-2 hover:bg-[#15803d] transition-colors`}
                >
                  PAY (€{calculateCartTotal().toFixed(2)})
                </button>
                <button
                  onClick={() => {
                    playButtonSound();
                    handlePrintInvoice();
                  }}
                  className="bg-[#3db4e4] text-white btn-lifted p-2 text-xs sm:text-sm md:text-xs lg:text-sm font-bold rounded flex items-center justify-center gap-2 hover:bg-[#2a9fd8] transition-colors"
                >
                  <Printer size={16} />
                  PRINT
                </button>
                {/* Secondary Action Buttons */}
                <button
                  onClick={handleOpenSplitBillModal}
                  className="bg-gray-600 text-white btn-lifted p-2 text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm font-bold rounded flex items-center justify-center gap-1 hover:bg-gray-700 transition-colors"
                >
                  <Wallet size={14} />
                  SPLIT SALE
                </button>
                <button
                  onClick={handleOpenCouponModal}
                  className="bg-gray-600 text-white btn-lifted p-2 text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm font-bold rounded flex items-center justify-center gap-1 hover:bg-gray-700 transition-colors"
                >
                  <Save size={14} />
                  HOLD
                </button>
                <button className="bg-gray-600 text-white btn-lifted p-2 text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm font-bold rounded flex items-center justify-center gap-1 hover:bg-gray-700 transition-colors">
                  <Archive size={14} />
                  OPEN DRAWER
                </button>
                <button className="bg-gray-600 text-white btn-lifted p-2 text-xs sm:text-sm md:text-xs lg:text-xs xl:text-sm font-bold rounded flex items-center justify-center gap-1 hover:bg-gray-700 transition-colors">
                  <ChefHat size={14} />
                  SERVICE FEE
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Customer Management Modal */}
        <CustomerManagement
          isOpen={showCustomerModal}
          onClose={() => {
            setShowCustomerModal(false);
            // Only reset customer if no customer was selected during this modal session
            // Don't reset if customer was already selected before opening modal
          }}
          onCustomerSelect={handleCustomerSelect}
          orderType={selectedOrderType}
        />

        {/* Customer Search Modal */}
        <CustomerSearchModal
          isOpen={showCustomerSearchModal}
          onClose={() => {
            setShowCustomerSearchModal(false);
            setCustomerSearchFromSplit(false);
            // Only reset customer if no customer was selected during this modal session
            // Don't reset if customer was already selected before opening modal
          }}
          onCustomerSelect={handleCustomerSelect}
          onEditCustomer={handleOpenEditModal}
          onNewCustomer={() => setShowCustomerModal(true)}
          orderType={selectedOrderType}
          zIndex={customerSearchFromSplit ? 60 : 50}
        />

        {/* Customer Information Modal */}
        <CustomerInformation
          isOpen={showCustomerInfo}
          onClose={() => setShowCustomerInfo(false)}
          customer={customerForInfo}
          onEditCustomer={(cust) => {
            if (cust) setSelectedCustomer(cust);
            setShowCustomerInfo(false);
            setShowEditModal(true);
          }}
          onChangeCustomer={() => {
            setShowCustomerInfo(false);
            setShowCustomerSearchModal(true);
          }}
        />

        {/* Edit Customer Modal */}
        {showEditModal && selectedCustomer && (
          <CustomerManagement
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              // If user closes edit modal without saving, revert to In Store order type
              if (selectedOrderType === 'Delivery' || selectedOrderType === 'Collection') {
                if (shouldShowOrderType('instore')) {
                  setSelectedOrderType('In Store');
                }
              }
            }}
            onCustomerSelect={handleEditCustomer}
            editingCustomer={selectedCustomer}
            orderType={selectedOrderType}
            onParentClose={showCustomerSearchModal ? () => setShowCustomerSearchModal(false) : undefined}
          />
        )}

        
        {/* Split Bill Modal */}
        {showSplitBillModal && (
          <SplitBillModal
            isOpen={showSplitBillModal}
            onClose={handleCloseSplitBillModal}
            splitItems={splitItems}
            splitBills={splitBills}
            selectedSplitBill={selectedSplitBill}
            setSelectedSplitBill={setSelectedSplitBill}
            totalSplit={totalSplit}
            setTotalSplit={setTotalSplit}
            handleSplitGo={handleSplitGo}
            handleRemoveItemFromSplit={handleRemoveItemFromSplit}
            handleAddItemToSplit={handleAddItemToSplit}
            handleRemoveSplitBill={handleRemoveSplitBill}
            handleSplitBillCustomerChange={handleSplitBillCustomerChange}
            areAllItemsDistributed={areAllItemsDistributed}
            calculateMaxSplits={calculateMaxSplits}
            getRemainingQuantity={getRemainingQuantity}
            getItemQuantityInSplit={getItemQuantityInSplit}
            selectedPlacedOrder={selectedPlacedOrder}
            getTaxRate={getTaxRate}
            setSplitBillToRemove={setSplitBillToRemove}
            resetFinalizeSaleModalForSplitBill={resetFinalizeSaleModalForSplitBill}
            setIsSinglePayMode={setIsSinglePayMode}
            setShowFinalizeSaleModal={setShowFinalizeSaleModal}
            // Customer selection props
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            selectedOrderType={selectedOrderType}
            setSelectedOrderType={setSelectedOrderType}
            showCustomerModal={showCustomerModal}
            setShowCustomerModal={setShowCustomerModal}
            showCustomerSearchModal={showCustomerSearchModal}
            setShowCustomerSearchModal={setShowCustomerSearchModal}
            setCustomerSearchFromSplit={setCustomerSearchFromSplit}
            handleCustomerSelect={handleCustomerSelect}
            handleEditCustomer={handleEditCustomer}
          />

        )}

        {/* Split Pizza Modal */}
        {showSplitPizzaModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold">
                  {editingCartItem ? 'Edit Split Pizza' : 'Split Pizza'}
                </h2>
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
                    <select
                      value={pizzaSize}
                      onChange={(e) => setPizzaSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    >
                      <option value="7">7 inch</option>
                      <option value="12">12 inch</option>
                      <option value="16">16 inch</option>
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

                {/* Middle Section - Pizza Image & Flavor Selection */}
                <div className="grid grid-cols-[40%_60%] gap-8 mb-6">
                  {/* Left Panel - Pizza Visualization */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Pizza Preview</h3>
                    <div className="flex justify-center">
                      <div className="relative">
                        <svg width="300" height="300" viewBox="0 0 200 200">
                          {/* Pizza slices */}
                          {renderPizzaSlices()}
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Flavor Selection & Ingredients */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Flavors</h3>

                    {/* Flavor selections - show all selected splits */}
                    <div className={`grid gap-4 mb-6 ${pizzaSlices === 2 ? 'grid-cols-2' : pizzaSlices === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {Array.from({ length: pizzaSlices }, (_, index) => {
                        const isCurrentlySelected = selectedFlavorForEditing === index;
                        const hasFoodSelected = selectedPizzaPerSlice[index];
                        const savedIngredients = getSavedIngredientsForSlice(index);
                        const hasSavedIngredients = savedIngredients.default.length > 0 || savedIngredients.custom.length > 0;

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border-3 transition-all duration-200 cursor-pointer transform ${isCurrentlySelected
                              ? 'border-blue-600 bg-blue-100 shadow-lg scale-105 ring-2 ring-blue-200'
                              : hasSavedIngredients
                                ? 'border-green-400 bg-green-50 hover:border-green-500 hover:shadow-md'
                                : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
                              }`}
                            onClick={() => {
                              // Auto-select this flavor box for ingredient editing
                              setSelectedFlavorForEditing(index);
                            }}
                          >
                            <label className="block text-sm font-semibold mb-2 ${
                              isCurrentlySelected 
                                ? 'text-blue-800' 
                                : hasSavedIngredients 
                                  ? 'text-green-700' 
                                  : 'text-gray-700'
                            }">
                              Flavor {index + 1}:
                              {hasSavedIngredients && (
                                <span className="ml-2 text-xs text-green-600 font-normal">
                                  (Modified)
                                </span>
                              )}
                              {isCurrentlySelected && (
                                <span className="ml-2 text-xs text-blue-600 font-bold">
                                  (Selected)
                                </span>
                              )}
                            </label>
                            <select
                              value={selectedPizzaPerSlice[index]?.id || ''}
                              onChange={(e) => handleSlicePizzaSelect(index, e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-colors ${isCurrentlySelected
                                ? 'border-blue-400 focus:ring-blue-300 focus:border-blue-500 bg-blue-50'
                                : 'border-gray-300 focus:ring-primary focus:border-primary bg-white'
                                }`}
                            >
                              <option value="">Select pizza...</option>
                              {pizzaFoods.map((food) => (
                                <option key={food.id} value={food.id}>
                                  {food.name} - €{food.price}
                                </option>
                              ))}
                            </select>
                            {hasSavedIngredients && (
                              <div className={`mt-2 text-xs ${isCurrentlySelected ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                {savedIngredients.default.length + savedIngredients.custom.length} ingredients
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Show ingredients per flavor - separate tracking */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Ingredients for {(() => {
                            if (selectedFlavorForEditing !== null && selectedPizzaPerSlice[selectedFlavorForEditing]) {
                              const selectedPizza = selectedPizzaPerSlice[selectedFlavorForEditing];
                              return `Flavor ${selectedFlavorForEditing + 1} (${selectedPizza.name})`;
                            }
                            return 'Selected Flavor';
                          })()}:
                        </h4>
                        {(() => {
                          if (selectedFlavorForEditing !== null) {
                            const savedIngredients = getSavedIngredientsForSlice(selectedFlavorForEditing);
                            const hasSavedIngredients = savedIngredients.default.length > 0 || savedIngredients.custom.length > 0;

                            if (hasSavedIngredients) {
                              return (
                                <button
                                  onClick={() => {
                                    if (selectedFlavorForEditing !== null) {
                                      // Reset to original ingredients
                                      const originalIngredients = ingredientsPerSlice[selectedFlavorForEditing] || [];
                                      setFlavorIngredients(prev => ({
                                        ...prev,
                                        [selectedFlavorForEditing]: {
                                          default: originalIngredients,
                                          custom: []
                                        }
                                      }));
                                      console.log(`Reset ingredients for slice ${selectedFlavorForEditing} to original:`, originalIngredients);
                                    }
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800 underline"
                                >
                                  Reset to Original
                                </button>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>
                      {(() => {
                        // Check if a flavor is selected for editing and has a food selected
                        if (selectedFlavorForEditing === null || !selectedPizzaPerSlice[selectedFlavorForEditing]) {
                          return <div className="text-gray-400 text-sm">Select a flavor above to see ingredients</div>;
                        }

                        const selectedPizza = selectedPizzaPerSlice[selectedFlavorForEditing];

                        // Get stored ingredients for this flavor (this contains the user's saved modifications)
                        const storedIngredients = getSavedIngredientsForSlice(selectedFlavorForEditing);

                        // Use stored ingredients (which include both default and custom)
                        const allIngredients = [...storedIngredients.default, ...storedIngredients.custom];

                        if (allIngredients.length > 0) {
                          return (
                            <div className="flex flex-wrap gap-2">
                              {/* All ingredients with same design */}
                              {allIngredients.map((ingredient, idx) => {
                                const isDefault = idx < storedIngredients.default.length;
                                const ingredientName = ingredient.name || ingredient;

                                return (
                                  <span
                                    key={`${selectedFlavorForEditing}-${idx}`}
                                    className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                                  >
                                    {ingredientName}
                                    <button
                                      onClick={() => {
                                        if (isDefault) {
                                          // Remove from default ingredients
                                          const updatedDefaults = storedIngredients.default.filter((_, index) => index !== idx);
                                          setFlavorIngredients(prev => ({
                                            ...prev,
                                            [selectedFlavorForEditing]: {
                                              ...prev[selectedFlavorForEditing],
                                              default: updatedDefaults
                                            }
                                          }));
                                          console.log(`Removed default ingredient "${ingredientName}" from slice ${selectedFlavorForEditing}. Updated defaults:`, updatedDefaults);
                                        } else {
                                          // Remove from custom ingredients
                                          const customIdx = idx - storedIngredients.default.length;
                                          const updatedCustom = storedIngredients.custom.filter((_, index) => index !== customIdx);
                                          setFlavorIngredients(prev => ({
                                            ...prev,
                                            [selectedFlavorForEditing]: {
                                              ...prev[selectedFlavorForEditing],
                                              custom: updatedCustom
                                            }
                                          }));
                                          console.log(`Removed custom ingredient "${ingredientName}" from slice ${selectedFlavorForEditing}. Updated custom:`, updatedCustom);
                                        }
                                      }}
                                      className="text-white hover:text-red-200"
                                    >
                                      <X size={10} />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          );
                        } else {
                          return <div className="text-gray-400 text-sm">No ingredients available for this pizza</div>;
                        }
                      })()}
                    </div>

                    {/* Single field to add ingredients for all flavors */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Ingredient:</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={virtualKeyboardActiveInput === 'customIngredientInput' ? virtualKeyboardInput : customIngredientInput}
                          onChange={(e) => handleCustomIngredientInput(e.target.value)}
                          onFocus={(e) => handleAnyInputFocus(e, 'customIngredientInput', customIngredientInput)}
                          onClick={(e) => handleAnyInputClick(e, 'customIngredientInput', customIngredientInput)}
                          onBlur={(e) => handleCustomInputBlur(e, 'customIngredientInput')}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddPizzaCustomIngredient();
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                          placeholder="Type ingredient name and press Enter or click Add..."
                        />
                        <button
                          onClick={handleAddCustomIngredient}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Add
                        </button>
                      </div>

                      {/* Show ingredient suggestions */}
                      {showIngredientSuggestions && ingredientSuggestions.length > 0 && (
                        <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {ingredientSuggestions.map((ingredient) => (
                            <button
                              key={ingredient.id}
                              onClick={() => handleIngredientSuggestionSelect(ingredient)}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              {ingredient.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Note Field */}
                <div className="mb-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Note</h3>
                    <textarea
                      value={virtualKeyboardActiveInput === 'pizzaNote' ? virtualKeyboardInput : pizzaNote}
                      onChange={(e) => setPizzaNote(e.target.value)}
                      onFocus={(e) => handleAnyInputFocus(e, 'pizzaNote', pizzaNote)}
                      onClick={(e) => handleAnyInputClick(e, 'pizzaNote', pizzaNote)}
                      onBlur={(e) => handleCustomInputBlur(e, 'pizzaNote')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                      rows={3}
                      placeholder="Add any special instructions or notes for this pizza order..."
                    />
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
                    onClick={handleSaveCustomPizza}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCartItem ? 'Update Pizza' : 'Add to Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Open Order (Custom Food) Modal */}
        {showOpenOrderModal && (
          <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                <h2 className="text-xl font-bold">
                  {editingCustomFood ? 'Edit Open Food' : 'Open Order'}
                </h2>
                <button
                  onClick={handleCloseOpenOrderModal}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 overflow-y-auto">
                {/* First Row: Food Name and Price */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Food Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Food Name:</label>
                    <input
                      type="text"
                      value={virtualKeyboardActiveInput === 'customFoodName' ? virtualKeyboardInput : customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      placeholder="Enter food name"
                      onFocus={(e) => handleAnyInputFocus(e, 'customFoodName', customFoodName)}
                      onClick={(e) => handleAnyInputClick(e, 'customFoodName', customFoodName)}
                      onBlur={handleInputBlur}
                    />
                  </div>

                  {/* Food Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price:</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={customFoodPrice}
                        onChange={(e) => setCustomFoodPrice(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                        placeholder="0.00"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-800">€</span>
                    </div>
                  </div>
                </div>

                {/* Second Row: Ingredients Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients:</label>

                  {/* Ingredient Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={virtualKeyboardActiveInput === 'customIngredientInput' ? virtualKeyboardInput : customIngredientInput}
                      onChange={handleCustomIngredientInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      placeholder="Type ingredient name..."
                      onFocus={(e) => handleAnyInputFocus(e, 'customIngredientInput', customIngredientInput)}
                      onClick={(e) => handleAnyInputClick(e, 'customIngredientInput', customIngredientInput)}
                      onBlur={handleInputBlur}
                    />

                    {/* Ingredient Suggestions */}
                    {showIngredientSuggestions && ingredientSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {ingredientSuggestions.map((ingredient) => (
                          <button
                            key={ingredient.id}
                            onClick={() => handleAddCustomIngredient(ingredient)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0"
                          >
                            {ingredient.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Ingredients */}
                  {customFoodIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customFoodIngredients.map((ingredient) => (
                        <span
                          key={ingredient.id}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-sm rounded-full"
                        >
                          {ingredient.name}
                          <button
                            onClick={() => handleRemoveCustomIngredient(ingredient.id)}
                            className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Last Row: Food Note */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note:</label>
                  <textarea
                    value={virtualKeyboardActiveInput === 'customFoodNote' ? virtualKeyboardInput : customFoodNote}
                    onChange={(e) => setCustomFoodNote(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    rows="3"
                    placeholder="Enter any special notes or instructions"
                    onFocus={(e) => handleAnyInputFocus(e, 'customFoodNote', customFoodNote)}
                    onClick={(e) => handleAnyInputClick(e, 'customFoodNote', customFoodNote)}
                    onBlur={handleInputBlur}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCloseOpenOrderModal}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCustomFood}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryLight transition-colors"
                  >
                    {editingCustomFood ? 'Update Food' : 'Add to Order'}
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
                  onClick={() => {
                    setShowTableModal(false);
                    // If no table is selected and order type is Table, fallback to In Store
                    if (selectedOrderType === 'Table' && !selectedTable && reservedTables.length === 0 && shouldShowOrderType('instore')) {
                      setSelectedOrderType('In Store');
                    }
                  }}
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
                            <option
                              key={table.id}
                              value={table.id}
                              disabled={isTableReserved(table.id.toString())}
                            >
                              Table {table.table_no} ({table.seat_capacity || 4} seats) {isTableReserved(table.id.toString()) ? '- RESERVED' : ''}
                            </option>
                          ))
                        ) : selectedFloor ? (
                          <option value="" disabled>No available tables</option>
                        ) : (
                          <option value="" disabled>Select a floor first</option>
                        )}
                      </select>
                      {/* Reserved Tables Indicator */}
                      {reservedTables.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Reserved Tables:</h4>
                          <div className={`space-y-2 ${reservedTables.length > 3 ? 'max-h-32 overflow-y-auto pr-2' : ''}`}>
                            {reservedTables.map((reservedTable) => (
                              <div key={reservedTable.id} className="p-2 bg-orange-50 border border-orange-200 rounded-lg flex-shrink-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    <span className="text-sm text-orange-700 font-medium">
                                      Table {reservedTable.tableNo} ({reservedTable.persons} persons) - {reservedTable.floor}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => removeReservedTable(reservedTable.id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove reservation"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                    onClick={() => {
                      // Add the current table to reserved tables
                      if (selectedTable && selectedPersons) {
                        addReservedTable(selectedTable, selectedPersons);
                      }
                      // Reset current selection
                      setSelectedTable('');
                      setSelectedPersons('');
                      // Close the modal
                      setShowTableModal(false);
                    }}
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
          <MergeTableModal
            open={showMergeTableModal}
            onBack={handleBackToTableSelection}
            onClose={() => {
              setShowMergeTableModal(false);
              setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
            }}
            floors={floors}
            floorsLoading={floorsLoading}
            selectedFloor={selectedFloor}
            onSelectFloor={handleFloorSelect}
            addSampleData={addSampleData}
            tables={tables}
            tablesLoading={tablesLoading}
            mergeTableSelections={mergeTableSelections}
            onSelectionChange={handleMergeTableSelectionChange}
            onRemoveSelection={handleRemoveTableSelection}
            onAddMoreSelection={handleAddMoreTableSelection}
            isAddMoreDisabled={isAddMoreDisabled}
            getAvailableTablesForSelection={getAvailableTablesForSelection}
            isTableReserved={(id) => isTableReserved(id.toString())}
            onSave={(selectedTables) => {
              selectedTables.forEach(table => {
                if (!isTableReserved(table.id)) {
                  addReservedTable(table.id, 'Merged Table');
                }
              });
              showSuccess(`Successfully merged ${selectedTables.length} tables!`);
              setShowMergeTableModal(false);
              setMergeTableSelections([{ id: 1, tableId: '' }, { id: 2, tableId: '' }]);
            }}
          />
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
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {editingCartItem ? 'Edit Food Item' : 'Food Details'}
                  </h2>
                  {isModifyingOrder && (
                    <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
                      Modifying Order
                    </span>
                  )}
                </div>
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
                    <></>
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

                {/* Ingredients Button */}
                <div className="mb-6 rounded-lg">
                  <button
                    onClick={() => setShowIngredientsModal(true)}
                    className="w-[150px] bg-primary text-white  flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} className="text-white" />
                    <span className="font-medium text-white">Ingredients</span>
                  </button>
                </div>

                {/* Note Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Note:</label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Add any special instructions or notes for this order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    rows="3"
                  />
                </div>

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

        {/* Food Ingredients Modal */}
        <FoodIngredientsModalbox
          isVisible={showIngredientsModal}
          onClose={() => setShowIngredientsModal(false)}
          foodId={selectedFood?.id}
          foodName={selectedFood?.name}
        />

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
          <FinalizeSaleModal
            isOpen={showFinalizeSaleModal}
            onClose={() => {
              // Reset payment modification state when closing modal
              if (isModifyingOrder && modifyingOrderPaymentInfo && hasResetPayment) {
                setHasResetPayment(false);
                setShowPayLaterButton(false);
              }
              setShowFinalizeSaleModal(false);
            }}
            // Payment related props
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            paymentAmount={paymentAmount}
            setPaymentAmount={setPaymentAmount}
            givenAmount={givenAmount}
            setGivenAmount={setGivenAmount}
            changeAmount={changeAmount}
            setChangeAmount={setChangeAmount}
            currencyAmount={currencyAmount}
            setCurrencyAmount={setCurrencyAmount}
            selectedCurrency={selectedCurrency}
            handleRemoveSplitBill={handleRemoveSplitBill}
            setSelectedCurrency={setSelectedCurrency}
            currencyOptions={currencyOptions}
            addedPayments={addedPayments}
            setAddedPayments={setAddedPayments}
            // Mode and data props
            isSinglePayMode={isSinglePayMode}
            selectedSplitBill={selectedSplitBill}
            setSelectedSplitBill={setSelectedSplitBill}
            selectedPlacedOrder={selectedPlacedOrder}
            cartItems={cartItems}
            foodDetails={foodDetails}
            // Coupon related props
            appliedCoupon={appliedCoupon}
            removeAppliedCoupon={removeAppliedCoupon}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            availableCoupons={availableCoupons}
            couponsLoading={couponsLoading}
            // Discount related props
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
            // Other props
            sendSMS={sendSMS}
            setSendSMS={setSendSMS}
            // Handler functions
            handleCashGivenAmountChange={handleCashGivenAmountChange}
            handleCashAmountChange={handleCashAmountChange}
            handleNumericInputFocus={handleNumericInputFocus}
            handleNumericKeyboardChange={handleNumericKeyboardChange}
            handleNumericKeyboardKeyPress={handleNumericKeyboardKeyPress}
            handleAddPayment={handleAddPayment}
            handleApplyManualDiscount={handleApplyManualDiscount}
            handleApplyCoupon={handleApplyCoupon}
            handleAnyInputFocus={handleAnyInputFocus}
            handleAnyInputClick={handleAnyInputClick}
            handleCustomInputBlur={handleCustomInputBlur}
            // Calculation functions
            calculateSinglePayTotals={calculateSinglePayTotals}
            calculateSplitBillTotal={calculateSplitBillTotal}
            calculateCartTotal={calculateCartTotal}
            calculateSplitBillSubtotal={calculateSplitBillSubtotal}
            calculateSplitBillTax={calculateSplitBillTax}
            calculateSplitBillDiscount={calculateSplitBillDiscount}
            calculateSplitBillCharge={calculateSplitBillCharge}
            calculateSplitBillTips={calculateSplitBillTips}
            calculateCartSubtotal={calculateCartSubtotal}
            calculateCartTax={calculateCartTax}
            calculateCartDiscount={calculateCartDiscount}
            calculateDueAmount={calculateDueAmount}
            getCurrencySymbol={getCurrencySymbol}
            // State variables
            numericActiveInput={numericActiveInput}
            numericKeyboardInput={numericKeyboardInput}
            setNumericActiveInput={setNumericActiveInput}
            setNumericKeyboardInput={setNumericKeyboardInput}
            // Modal state
            setShowCartDetailsModal={setShowCartDetailsModal}
            // Split bill props
            splitBillToRemove={splitBillToRemove}
            setSplitBills={setSplitBills}
            setSplitBillToRemove={setSplitBillToRemove}
            updateCartAfterSplitPayment={updateCartAfterSplitPayment}
            handlePlaceSplitBillOrder={handlePlaceSplitBillOrder}
            // Order related props
            placedOrders={placedOrders}
            selectedCustomer={selectedCustomer}
            selectedOrderType={selectedOrderType}
            selectedTable={selectedTable}
            // Functions
            handlePlaceOrder={handlePlaceOrder}
            showError={showError}
            showSuccess={showSuccess}
            setIsInvoiceAfterPayment={setIsInvoiceAfterPayment}
            setShowInvoiceModal={setShowInvoiceModal}
            clearCart={clearCart}
            resetFinalizeSaleModal={resetFinalizeSaleModal}
            setIsSinglePayMode={setIsSinglePayMode}
            setSelectedPlacedOrder={setSelectedPlacedOrder}
            setCurrentOrderForInvoice={setCurrentOrderForInvoice}
            // Modify order payment props
            isModifyingOrder={isModifyingOrder}
            modifyingOrderId={modifyingOrderId}
            modifyingOrderPaymentInfo={modifyingOrderPaymentInfo}
            showPayLaterButton={showPayLaterButton}
            setShowPayLaterButton={setShowPayLaterButton}
            hasResetPayment={hasResetPayment}
            setHasResetPayment={setHasResetPayment}
            setShowSplitBillModal={setShowSplitBillModal}
            setCustomerSearchFromSplit={setCustomerSearchFromSplit}
            splitBills={splitBills}
            setSplitItems={setSplitItems}
            setSplitBills={setSplitBills}
            setSplitDiscount={setSplitDiscount}
            setSplitCharge={setSplitCharge}
            setSplitTips={setSplitTips}
            setSplitBillToRemove={setSplitBillToRemove}
          />
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
                          {index + 1}. {item.food?.name || 'Unknown Food'}
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
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-60 p-4">
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
                {/* Items List for Single Pay Mode */}
                {isSinglePayMode && selectedPlacedOrder && selectedPlacedOrder.items && selectedPlacedOrder.items.length > 0 && (
                  <div className="border-b border-gray-200 pb-3 mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Order Items:</h3>
                    <div className="space-y-2">
                      {selectedPlacedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-800">{item.food?.name || 'Unknown Item'}</span>
                              <span className="text-gray-500 ml-2">x{item.quantity || 0}</span>
                            </div>

                            {/* Show variations if any */}
                            {item.variations && Object.keys(item.variations).length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {Object.entries(item.variations).map(([variationId, selectedOption]) => {
                                  const variation = foodDetails?.variations?.find(v => v.id === parseInt(variationId));
                                  const variationName = variation?.name || variationId;
                                  const selections = Array.isArray(selectedOption) ? selectedOption : [selectedOption];

                                  return (
                                    <div key={variationId} className="flex items-center gap-1">
                                      <span className="text-gray-500">• {variationName}:</span>
                                      <span className="text-gray-700">
                                        {selections.map((optionId, idx) => {
                                          const option = variation?.options?.find(o => o.id === parseInt(optionId));
                                          return (
                                            <span key={optionId}>
                                              {option?.option_name || optionId}
                                              {idx < selections.length - 1 ? ', ' : ''}
                                            </span>
                                          );
                                        })}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Show addons if any */}
                            {item.adons && item.adons.length > 0 && (
                              <div className="text-xs text-gray-600 mt-1">
                                {item.adons.map((addonId, idx) => {
                                  const addon = foodDetails?.adons?.find(a => a.id === parseInt(addonId));
                                  const addonName = addon?.name || addonId;
                                  const addonPrice = addon?.price;

                                  return (
                                    <div key={idx} className="flex items-center gap-1">
                                      <span className="text-gray-500">• Addon:</span>
                                      <span className="text-gray-700">{addonName}</span>
                                      {addonPrice && <span className="text-gray-500">(+€{addonPrice.toFixed(2)})</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <span className="text-gray-800 font-medium">€{(parseFloat(item.totalPrice) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Total Item:</span>
                  <span className="font-semibold">
                    {isSinglePayMode
                      ? (cartItems.length > 0 ? cartItems.filter(item => item.quantity > 0) : selectedPlacedOrder?.items || []).reduce((total, item) => total + (parseInt(item.quantity) || 0), 0)
                      : selectedSplitBill
                        ? selectedSplitBill.items.reduce((total, item) => total + (item.quantity || 0), 0)
                        : cartItems.filter(item => item.quantity > 0).reduce((total, item) => total + (item.quantity || 0), 0)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sub Total:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? calculateSinglePayTotals().subtotal.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillSubtotal().toFixed(2) : calculateCartSubtotal().toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? calculateSinglePayTotals().discount.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Discount:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? calculateSinglePayTotals().discount.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillDiscount().toFixed(2) : calculateCartDiscount().toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? calculateSinglePayTotals().tax.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillTax().toFixed(2) : calculateCartTax().toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Charge:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? '0.00' :
                        selectedSplitBill ? calculateSplitBillCharge().toFixed(2) : cartCharge.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tips:</span>
                  <span className="font-semibold">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? '0.00' :
                        selectedSplitBill ? calculateSplitBillTips().toFixed(2) : cartTips.toFixed(2)
                    }
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-800 font-semibold">Total Payable:</span>
                  <span className="font-bold text-lg">
                    {getCurrencySymbol()}{
                      isSinglePayMode ? calculateSinglePayTotals().total.toFixed(2) :
                        selectedSplitBill ? calculateSplitBillTotal().toFixed(2) : calculateCartTotal().toFixed(2)
                    }
                  </span>
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

      {/* Cancel Order Modal */}
      {showCancelOrderModal && selectedPlacedOrder && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Cancel Order</h2>
              <button
                onClick={() => {
                  setShowCancelOrderModal(false);
                  setCancellationReason('');
                }}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Cancel Order #{selectedPlacedOrder.orderNumber}?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This action will cancel the order. Please provide a reason for cancellation (optional).
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none resize-none"
                  rows="3"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCancelOrderModal(false);
                  setCancellationReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleConfirmCancelOrder(true)}
                disabled={!cancellationReason.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${cancellationReason.trim()
                  ? 'bg-primary text-white'
                  : 'bg-primary text-white cursor-not-allowed'
                  }`}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft Conversion Modal */}
      {showDraftConversionModal && draftToConvert && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Convert Draft to Order</h2>
              <button
                onClick={() => {
                  setShowDraftConversionModal(false);
                  setDraftToConvert(null);
                  setConversionOrderType('In Store');
                  setConversionTable('');
                  setConversionPersons('');
                  setConversionFloor('');
                }}
                className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Convert Draft #{draftToConvert.orderNumber}?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the order type and details to convert this draft to a regular order.
                </p>

                {/* Order Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Type
                  </label>
                  <select
                    value={conversionOrderType}
                    onChange={async (e) => {
                      const selectedOrderType = e.target.value;
                      setConversionOrderType(selectedOrderType);

                      // If Collection is selected, automatically open the schedule modal
                      if (selectedOrderType === 'Collection') {
                        try {
                          console.log('Collection selected, opening schedule modal...');
                          await handleOpenScheduleModal();
                        } catch (error) {
                          console.error('Error opening schedule modal:', error);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {shouldShowOrderType('instore') && <option value="In Store">In Store</option>}
                    {shouldShowOrderType('collection') && <option value="Collection">Collection</option>}
                    {shouldShowOrderType('delivery') && <option value="Delivery">Delivery</option>}
                    {shouldShowOrderType('table') && <option value="Table">Table</option>}
                  </select>
                </div>

                {/* Table Selection (only show if Table is selected) */}
                {conversionOrderType === 'Table' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Floor
                      </label>
                      <select
                        value={conversionFloor}
                        onChange={async (e) => {
                          const selectedFloorId = e.target.value;
                          setConversionFloor(selectedFloorId);
                          setConversionTable('');

                          // Fetch tables for the selected floor
                          if (selectedFloorId) {
                            try {
                              console.log('Fetching tables for floor ID:', selectedFloorId);
                              await fetchTablesByFloor(selectedFloorId);
                            } catch (error) {
                              console.error('Error fetching tables for floor:', error);
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select Floor</option>
                        {floors.map((floor) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {conversionFloor && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Table
                        </label>
                        <select
                          value={conversionTable}
                          onChange={(e) => setConversionTable(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Select Table</option>
                          {(() => {
                            // Debug logging
                            console.log('Debug table filtering:', {
                              conversionFloor,
                              conversionFloorType: typeof conversionFloor,
                              tablesCount: tables.length,
                              tables: tables.map(t => ({ id: t.id, floor_id: t.floor_id, floor_id_type: typeof t.floor_id, status: t.status, table_no: t.table_no }))
                            });

                            const filteredTables = tables
                              .filter(table => {
                                const matchesFloor = table.floor_id.toString() === conversionFloor.toString();
                                const isFree = table.status === 'Free';
                                console.log(`Table ${table.table_no}: floor_id=${table.floor_id} (${typeof table.floor_id}), conversionFloor=${conversionFloor} (${typeof conversionFloor}), matchesFloor=${matchesFloor}, isFree=${isFree}`);
                                return matchesFloor && isFree;
                              });

                            console.log('Filtered tables:', filteredTables);
                            return filteredTables.map((table) => (
                              <option key={table.id} value={table.id}>
                                Table {table.table_no} ({table.seat_capacity} seats)
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                    )}

                    {conversionTable && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Persons
                        </label>
                        <input
                          type="number"
                          value={conversionPersons}
                          onChange={(e) => setConversionPersons(e.target.value)}
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter number of persons"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowDraftConversionModal(false);
                  setDraftToConvert(null);
                  setConversionOrderType('In Store');
                  setConversionTable('');
                  setConversionPersons('');
                  setConversionFloor('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDraftConversion}
                disabled={conversionOrderType === 'Table' && (!conversionFloor || !conversionTable || !conversionPersons)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${conversionOrderType === 'Table' && (!conversionFloor || !conversionTable || !conversionPersons)
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
              >
                Convert to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <UpdateOrderStatus
        isOpen={showStatusUpdateModal}
        onClose={() => setShowStatusUpdateModal(false)}
        order={selectedOrderForStatusUpdate}
        onStatusUpdate={handleUpdateOrderStatus}
        onRiderAssignment={() => {
          setShowStatusUpdateModal(false);
          setShowRiderAssignmentModal(true);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Rider Assignment Modal */}
      <AssignRider
        isOpen={showRiderAssignmentModal}
        onClose={() => {
          setShowRiderAssignmentModal(false);
        }}
        onBack={() => {
          setShowRiderAssignmentModal(false);
          setShowStatusUpdateModal(true);
        }}
        order={selectedOrderForStatusUpdate}
        onAssignRider={async (rider) => {
          try {
            // Here you would typically update the order with the assigned rider
            // For now, we'll just show a success message
            showSuccess(`Rider ${rider.name} assigned to order successfully!`);

            // Set the status to "On the way" since rider is assigned
            setSelectedStatus('On the way');

            // Close the rider assignment modal and return to status update modal
            setShowRiderAssignmentModal(false);
            setShowStatusUpdateModal(true);
            return true;
          } catch (error) {
            console.error('Error assigning rider:', error);
            showError('Failed to assign rider. Please try again.');
            return false;
          }
        }}
        onStatusUpdate={() => {
          // This function can be used if needed for status updates
        }}
      />



      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        order={selectedPlacedOrder}
        onCreateInvoice={handleCreateInvoice}
        foodDetails={foodDetails}
      />

      {/* Invoice Modal */}
      <Invoice
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setIsInvoiceAfterPayment(false); // Reset the flag when modal is closed
        }}
        order={selectedPlacedOrder}
        onPrint={handlePrintInvoice}
        foodDetails={foodDetails}
        paymentStatus="PAID"
      />

      {/* Kitchen Invoice Modal */}
      <Invoice
        isOpen={showKitchenInvoiceModal}
        onClose={() => setShowKitchenInvoiceModal(false)}
        order={currentOrderForInvoice}
        onPrint={() => {
          window.print();
          setShowKitchenInvoiceModal(false);
        }}
        foodDetails={foodDetails}
        isKitchen={true}
        paymentStatus="UNPAID"
      />

      {/* Employee Invoice Modal */}
      <Invoice
        isOpen={showEmployeeInvoiceModal}
        onClose={() => setShowEmployeeInvoiceModal(false)}
        order={currentOrderForInvoice}
        onPrint={() => {
          window.print();
          setShowEmployeeInvoiceModal(false);
        }}
        foodDetails={foodDetails}
        isEmployee={true}
        paymentStatus="UNPAID"
      />

      {/* Draft Number Modal */}
      <DraftNumberModal
        isOpen={showDraftNumberModal}
        onClose={() => setShowDraftNumberModal(false)}
        onSubmit={(userName) => {
          handleDraftOrder(userName);
        }}
      />

      {/* Drafts Modal */}
      <Drafts
        isOpen={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
        currentDraftOrders={currentDraftOrders}
        onEditDraft={async (draft) => {
          // Handle editing draft in cart
          console.log('=== EDIT DRAFT DEBUG START ===');
          console.log('Editing draft:', draft);
          console.log('Draft properties:', {
            id: draft.id,
            databaseId: draft.databaseId,
            orderNumber: draft.orderNumber,
            hasDatabaseId: 'databaseId' in draft,
            hasOrderNumber: 'orderNumber' in draft
          });
          console.log('Draft items:', draft.items);
          console.log('Draft items details:', draft.items?.map(item => ({
            id: item.id,
            name: item.food?.name || 'Unknown',
            quantity: item.quantity,
            price: item.food?.price || item.price || 0,
            totalPrice: item.totalPrice
          })));
          console.log('Full draft object keys:', Object.keys(draft));
          console.log('Full draft object:', JSON.stringify(draft, null, 2));
          
          // Check if draft has the required properties, if not, try to derive them
          let databaseId = draft.databaseId || draft.id;
          let orderNumber = draft.orderNumber;
          
          if (!databaseId) {
            console.error('No valid database ID found for draft:', draft);
            showError('Invalid draft data. Cannot edit this draft.');
            return;
          }
          
          if (!orderNumber) {
            // Generate a fallback order number
            orderNumber = `draft_id${databaseId}`;
            console.log('Generated fallback order number:', orderNumber);
          }
          
          // Find the position of this draft in the list before removing it
          const draftPosition = currentDraftOrders.findIndex(d => d.id === draft.id);
          console.log('Draft position in list:', draftPosition);
          
          // Load the draft into the cart
          if (draft.items && draft.items.length > 0) {
            console.log('=== LOADING DRAFT ITEMS INTO CART ===');
            console.log('Draft items to load:', draft.items);
            console.log('Items details:', draft.items.map(item => ({
              id: item.id,
              name: item.food?.name || 'Unknown',
              quantity: item.quantity,
              price: item.food?.price || item.price || 0,
              totalPrice: item.totalPrice
            })));
            setCartItems(draft.items);
            console.log('Cart items set successfully');
            console.log('=== CART ITEMS AFTER LOADING DRAFT ===');
            console.log('Loaded cart items:', draft.items);
            console.log('First item quantity:', draft.items[0]?.quantity);
            console.log('First item details:', draft.items[0]);
          }
          if (draft.customer) {
            setSelectedCustomer(draft.customer);
          }
          if (draft.orderType) {
            setSelectedOrderType(draft.orderType);
          }
          if (draft.coupon) {
            setAppliedCoupon(draft.coupon);
          }
          
          // Set the current draft ID, position, and number so future saves will update this draft at same position
          setCurrentDraftId(databaseId);
          setCurrentDraftPosition(draftPosition);
          setCurrentDraftNumber(orderNumber);
          console.log('Set current draft ID for updates:', databaseId, 'at position:', draftPosition, 'with number:', orderNumber);
          
          // DELETE the draft from database when editing
          try {
            if (window.myAPI) {
              console.log('Attempting to delete draft from database:', databaseId);
              const deleteResult = await window.myAPI.deleteOrder(databaseId);
              console.log('Delete result:', deleteResult);
              
              if (deleteResult && deleteResult.success) {
                console.log('Successfully deleted draft from database for editing:', databaseId);
                // Show success message to user
                showSuccess('Draft loaded for editing');
              } else {
                console.error('Failed to delete draft from database:', deleteResult?.message || 'Unknown error');
                showError('Failed to load draft for editing. Please try again.');
                return; // Don't proceed if deletion failed
              }
            } else {
              console.error('API not available for deleting draft');
              showError('API not available. Please refresh the page.');
              return;
            }
          } catch (error) {
            console.error('Error deleting draft from database:', error);
            showError('Error loading draft for editing: ' + error.message);
            return;
          }
          
          // Remove the draft from currentDraftOrders list (it will be re-added when saved)
          setCurrentDraftOrders(prev => prev.filter(d => d.id !== draft.id));
          console.log('Removed draft from list - will be restored at same position when saved');
          
          // Refresh the draft list to ensure UI is updated
          setTimeout(() => {
            fetchDraftOrders();
          }, 100);
          
          setShowDraftsModal(false);
        }}
        onDeleteDraft={handleDeleteDraft}
        onDeleteAllDrafts={handleDeleteAllDrafts}
      />

      {/* Schedule Modal */}
      <DueTo
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        hotelInfo={hotelInfo}
        selectedScheduleDate={selectedScheduleDate}
        selectedScheduleTime={selectedScheduleTime}
        availableTimeSlots={availableTimeSlots}
        useCustomTime={useCustomTime}
        customTime={customTime}
        onDateChange={handleScheduleDateChange}
        onTimeSelect={handleScheduleTimeSelect}
        onCustomTimeChange={handleCustomTimeChange}
        onUseCustomTimeChange={(checked) => {
          setUseCustomTime(checked);
          if (checked) {
            setSelectedScheduleTime('');
          } else {
            setCustomTime('');
          }
        }}
        onConfirm={handleScheduleConfirm}
        onCancel={handleScheduleCancel}
      />

      {/* Virtual Keyboard Component */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={() => hideKeyboard()}
        activeInput={virtualKeyboardActiveInput}
        onInputChange={(input, inputName) => {
          updateFieldFromKeyboard(inputName, input);
        }}
        onInputBlur={handleInputBlur}
        inputValue={getValueForActiveInput(virtualKeyboardActiveInput)}
      />

      {/* Finalize Sale Modal */}
      {showFinalizeSaleModal && (
        <FinalizeSaleModal
          isOpen={showFinalizeSaleModal}
          onClose={() => setShowFinalizeSaleModal(false)}
          // Payment related props
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          givenAmount={givenAmount}
          setGivenAmount={setGivenAmount}
          changeAmount={changeAmount}
          setChangeAmount={setChangeAmount}
          currencyAmount={currencyAmount}
          setCurrencyAmount={setCurrencyAmount}
          selectedCurrency={selectedCurrency}
          handleRemoveSplitBill={handleRemoveSplitBill}
          setSelectedCurrency={setSelectedCurrency}
          currencyOptions={currencyOptions}
          addedPayments={addedPayments}
          setAddedPayments={setAddedPayments}
          // Mode and data props
          isSinglePayMode={isSinglePayMode}
          selectedSplitBill={selectedSplitBill}
          setSelectedSplitBill={setSelectedSplitBill}
          selectedPlacedOrder={selectedPlacedOrder}
          cartItems={cartItems}
          foodDetails={foodDetails}
          // Coupon related props
          appliedCoupon={appliedCoupon}
          removeAppliedCoupon={removeAppliedCoupon}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          availableCoupons={availableCoupons}
          couponsLoading={couponsLoading}
          // Discount related props
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountAmount={discountAmount}
          setDiscountAmount={setDiscountAmount}
          // Other props
          sendSMS={sendSMS}
          setSendSMS={setSendSMS}
          // Handler functions
          handleCashGivenAmountChange={handleCashGivenAmountChange}
          handleCashAmountChange={handleCashAmountChange}
          handleNumericInputFocus={handleNumericInputFocus}
          handleNumericKeyboardChange={handleNumericKeyboardChange}
          handleNumericKeyboardKeyPress={handleNumericKeyboardKeyPress}
          handleAddPayment={handleAddPayment}
          handleApplyManualDiscount={handleApplyManualDiscount}
          handleApplyCoupon={handleApplyCoupon}
          handleAnyInputFocus={handleAnyInputFocus}
          handleAnyInputClick={handleAnyInputClick}
          handleCustomInputBlur={handleCustomInputBlur}
          // Calculation functions
          calculateSinglePayTotals={calculateSinglePayTotals}
          calculateSplitBillTotal={calculateSplitBillTotal}
          calculateCartTotal={calculateCartTotal}
          calculateSplitBillSubtotal={calculateSplitBillSubtotal}
          calculateSplitBillTax={calculateSplitBillTax}
          calculateSplitBillDiscount={calculateSplitBillDiscount}
          calculateSplitBillCharge={calculateSplitBillCharge}
          calculateSplitBillTips={calculateSplitBillTips}
          calculateCartSubtotal={calculateCartSubtotal}
          calculateCartTax={calculateCartTax}
          calculateCartDiscount={calculateCartDiscount}
          calculateDueAmount={calculateDueAmount}
          getCurrencySymbol={getCurrencySymbol}
          // State variables
          numericActiveInput={numericActiveInput}
          numericKeyboardInput={numericKeyboardInput}
          setNumericActiveInput={setNumericActiveInput}
          setNumericKeyboardInput={setNumericKeyboardInput}
          // Modal state
          setShowCartDetailsModal={setShowCartDetailsModal}
          // Split bill props
          splitBillToRemove={splitBillToRemove}
          setSplitBills={setSplitBills}
          setSplitBillToRemove={setSplitBillToRemove}
          updateCartAfterSplitPayment={updateCartAfterSplitPayment}
          handlePlaceSplitBillOrder={handlePlaceSplitBillOrder}
          // Order related props
          placedOrders={placedOrders}
          selectedCustomer={selectedCustomer}
          selectedOrderType={selectedOrderType}
          selectedTable={selectedTable}
          // Functions
          handlePlaceOrder={handlePlaceOrder}
          showError={showError}
          showSuccess={showSuccess}
          setIsInvoiceAfterPayment={setIsInvoiceAfterPayment}
          setShowInvoiceModal={setShowInvoiceModal}
          clearCart={clearCart}
          resetFinalizeSaleModal={resetFinalizeSaleModal}
          setIsSinglePayMode={setIsSinglePayMode}
          setSelectedPlacedOrder={setSelectedPlacedOrder}
          setCurrentOrderForInvoice={setCurrentOrderForInvoice}
          // Modify order payment props
          isModifyingOrder={isModifyingOrder}
          modifyingOrderId={modifyingOrderId}
          modifyingOrderPaymentInfo={modifyingOrderPaymentInfo}
          showPayLaterButton={showPayLaterButton}
          setShowPayLaterButton={setShowPayLaterButton}
          hasResetPayment={hasResetPayment}
          setHasResetPayment={setHasResetPayment}
          setShowSplitBillModal={setShowSplitBillModal}
          setCustomerSearchFromSplit={setCustomerSearchFromSplit}
          splitBills={splitBills}
          setSplitItems={setSplitItems}
          setSplitBills={setSplitBills}
          setSplitDiscount={setSplitDiscount}
          setSplitCharge={setSplitCharge}
          setSplitTips={setSplitTips}
          setSplitBillToRemove={setSplitBillToRemove}
        />
      )}
    </>
  );
};

export default RunningOrders;