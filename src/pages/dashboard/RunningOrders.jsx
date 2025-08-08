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
  CheckCircle
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedVariations, setSelectedVariations] = useState({});
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
  



  const orders = [
    {
      id: 1001,
      customer: 'James Smith',
      type: 'In Store',
      status: 'active'
    },
    {
      id: 1002,
      customer: 'Peter Wright',
      type: 'Dine-in',
      status: 'active'
    },
    {
      id: 1004,
      customer: 'Sunstru Martin',
      type: 'Collection',
      status: 'active'
    }
  ];

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
        setCategories(result.data);
        console.log('Categories loaded successfully:', result.data);
        
        // Auto-select the first category if available
        if (result.data && result.data.length > 0) {
          const firstCategory = result.data[0];
          console.log('Auto-selecting first category:', firstCategory);
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
      if (variationId === 'size') {
        // Size is single selection
        return {
          ...prev,
          [variationId]: optionId
        };
      } else if (variationId === 'addons' || variationId === 'toppings') {
        // Addons and toppings can be multiple selection
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
      if (type === 'size' && variationPrices[type] && variationPrices[type][selection]) {
        variationPrice += variationPrices[type][selection];
      } else if ((type === 'toppings' || type === 'addons') && Array.isArray(selection)) {
        selection.forEach(item => {
          if (variationPrices[type] && variationPrices[type][item]) {
            variationPrice += variationPrices[type][item];
          }
        });
      }
    });
    
    return basePrice + variationPrice;
  };

  // Handle add to cart
  const handleAddToCart = () => {
    console.log('Adding to cart:', {
      food: selectedFood,
      variations: selectedVariations,
      totalPrice: calculateTotalPrice()
    });
    
    // TODO: Add to cart functionality
    setShowFoodModal(false);
    setSelectedFood(null);
    setSelectedVariations({});
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


const MenuCard = ({ item }) => (
  <div 
    className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden transform hover:-translate-y-1 cursor-pointer"
    onClick={() => {
      console.log('Food item clicked:', item);
      setSelectedFood(item);
      setShowFoodModal(true);
      setSelectedVariations({});
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
      ) : foods.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-2 gap-y-4">
          {foods.map((food) => (
            <MenuCard key={food.id} item={food} />
          ))}
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
      <div className="flex justify-center  gap-2.5 overflow-hidden px-1.5 py-2 bg-[#d3D3D3]">
            {/* Running Orders */}
            <div className="w-68 bg-[#ffffff] border-r border-gray-200 flex flex-col shadow-lg rounded-xl h-[500px]">
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

              <div className="py-4 mt-2 px-2 space-y-2 h-auto overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`p-4 border-b  cursor-pointer border border-gray-300 hover:bg-gray-50 rounded-lg shadow-md ${
                      selectedOrder?.id === order.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="font-semibold text-sm text-gray-800">{order.customer}</div>
                    <div className="text-xs mt-1  text-gray-700">Order ID: {order.id}</div>
                    <div className="text-xs  text-gray-700">Order Type: {order.type}</div>
                  </div>
                ))}
              </div>

              <div className="py-4 px-2 border-t border-gray-200 flex gap-2 text-[10px] ">
                <button className="flex-1 bg-[#010101] text-white font-medium rounded-lg px-3 py-1 cursor-pointer flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  BILL
                </button>
                <button className="flex-1 bg-[#4d36eb] text-white font-medium rounded-lg px-3 py-1 cursor-pointer  flex items-center justify-centershadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  ORDER DETAILS
                </button>
                <button className="flex-1 bg-[#f3be25] text-white font-medium rounded-lg px-3 py-1 cursor-pointer  flex items-center justify-center  shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  MODIFY ORDER
                </button>
                <button className="flex-1 bg-[#c81118] text-white justify-center  font-medium rounded-lg px-3 py-1 cursor-pointer  flex items-center  shadow-[0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] hover:shadow-[0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)_inset] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)_inset] active:translate-y-[1px] transition-all duration-150">
                  CANCEL
                </button>
              </div>
            </div>

            {/* Menu Items */}
          <div className="w-[730px] bg-white flex flex-col shadow-lg rounded-xl overflow-hidden">
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
    className="w-full pl-10 pr-4 py-2 text-sm bg-white placeholder:text-primary font-semibold border border-gray-300 rounded-xl z-10
      shadow-[0_6px_12px_-2px_rgba(50,50,93,0.25),0_3px_7px_-3px_rgba(0,0,0,0.3)]
      focus:outline-none focus:ring-2 focus:ring-blue-400"
  />
</div>
    
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
                transition-all duration-150 hover:bg-primary/90 ${
                  selectedCategory?.id === category.id ? 'bg-primary/90' : ''
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
           <div className="w-[680px]  border border-gray-300 rounded-lg ">
<div className="px-3 py-2 mb-2 bg-white border-b border-gray-200 rounded-lg">
  {/* Tabs row */}
  <div className="flex gap-1.5 mb-4">
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
  </div>

  {/* Status section */}
  <div className="flex items-center gap-1.5">

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
                      border border-gray-300 btn-lifted transition-colors ${
                        !selectedCustomer ? 'bg-primary text-white' : 'bg-[#d3D3D3] text-black'
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
  className={`btn-lifted transition-colors ${
    selectedCustomer 
      ? 'text-green-600 hover:text-green-800 cursor-pointer' 
      : 'text-gray-400 cursor-not-allowed'
  }`}>
  <Edit size={17}/>
</button>
     <button 
      //  onClick={() => {
      //    if (selectedCustomer) {
      //      setShowDeleteConfirm(true);
      //    } else {
      //      alert('No customer selected to delete');
      //    }
      //  }}
      //  disabled={!selectedCustomer}
       className={`px-2 py-1.5 text-white text-xs rounded flex items-center gap-1 
                      border border-gray-300 btn-lifted transition-colors bg-[#c81118] hover:bg-red-700 cursor-pointer 
                    
                         
                      `}>
      <Trash2 size={14} />
      Delete 
    </button>
  </div>
</div>

  {/* Items table */}
   {/* Items table header */}
<div className='bg-white rounded-lg p-2 '>
<div className="mt-3 border border-primary">
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
    {/* Red Velvet Delight Slice */}
    <tr className="grid grid-cols-4 gap-4 items-center text-sm p-2 border-b border-gray-200">
      <td className="flex items-center gap-2">
        <Edit2 size={22} className="text-primary" />
        <span className="text-gray-800">Red Velvet Delight Slice</span>
      </td>
      <td className="text-gray-800 text-center">89.00</td>
      <td className="flex items-center justify-center">
         <div className="flex items-center rounded">
          <button className="text-primary flex items-center cursor-pointer justify-center transition-colors">
            <Minus size={11} />
          </button>
          <span className="w-8 text-center text-gray-800  py-1 text-sm">1</span>
          <button className=" flex items-center cursor-pointer justify-center text-primary transition-colors">
            <Plus size={11} />
         </button>
        </div>
      </td>
      <td className="flex items-center justify-center gap-2">
        <span className="text-gray-800">89.00</span>
        <Trash2 size={14} className="text-[#c81118] mt-0.5 cursor-pointer" />
      </td>
    </tr>

    {/* Chicken */}
    <tr className="grid grid-cols-4 gap-4 items-center text-sm p-3 border-b border-gray-200">
      <td className="flex items-center gap-2">
        <Edit2 size={13} className="text-primary" />
        <span className="text-gray-800 text-center">chicken</span>
      </td>
      <td className="text-gray-800 text-center">49.00</td>
      <td className="flex items-center justify-center">
       <div className="flex items-center rounded">
          <button className="text-primary flex items-center cursor-pointer justify-center transition-colors">
            <Minus size={11} />
          </button>
          <span className="w-8 text-center text-gray-800  py-1 text-sm">1</span>
          <button className=" flex items-center cursor-pointer justify-center text-primary transition-colors">
            <Plus size={11} />
         </button>
        </div>
      </td>
      <td className="flex items-center justify-center gap-2">
        <span className="text-gray-800">49.00</span>
        <Trash2 size={14} className="text-[#c81118] mt-0.5 cursor-pointer" />
      </td>
    </tr>

    {/* Burger */}
    <tr className="grid grid-cols-4 gap-4 items-center text-sm p-3 border-b border-gray-200">
      <td className="flex items-center gap-2">
        <Edit2 size={13} className="text-primary" />
        <span className="text-gray-800">burger</span>
      </td>
      <td className="text-gray-800 text-center">180.00</td>
      <td className="flex items-center justify-center">
        <div className="flex items-center rounded">
          <button className="text-primary flex items-center cursor-pointer justify-center transition-colors">
            <Minus size={11} />
          </button>
          <span className="w-8 text-center text-gray-800  py-1 text-sm">1</span>
          <button className=" flex items-center cursor-pointer justify-center text-primary transition-colors">
            <Plus size={11} />
         </button>
        </div>
      </td>
      <td className="flex items-center justify-center gap-2">
        <span className="text-gray-800">180.00</span>
        <Trash2 size={14} className="text-[#c81118] mt-0.5 cursor-pointer" />
      </td>
    </tr>
  </tbody>
</table>
</div>
{/* Summary section */}
<div className="bg-white p-4 max-w-md mx-auto">
  <div className="grid grid-cols-4 place-content-center text-xs mb-4 text-center">
    <span className="font-medium">Subtotal</span>
    <span className="font-medium">Tax</span>
    <span className="font-medium">Discount</span>
    <span className="font-medium">DIY.CHARGE</span>
  </div>
  <div className="grid grid-cols-4 gap-2 place-content-center text-sm mb-4 text-center font-medium">
    <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto ">
      €130
    </div>
    <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto">
      €130
    </div>
    <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto text-red-500">
      €130
    </div>
    <div className="border-[1.5px] border-primary w-13 px-1.5 flex items-center justify-center text-xs rounded mx-auto">
      €130
    </div>
  </div>
</div>
  {/* Total Payable */}
<div className='flex justify-center items-center'>
    <div className="bg-[#d3D3D3] px-4 py-2 btn-lifted cursor-pointer   w-[70%] rounded flex items-center justify-center mb-4">
    <div className="flex items-center  gap-2">
     <Eye size={14} />
      <span className="text-gray-800 font-medium">Total Payable : 0.00</span>
    </div>
  </div>
</div>

  {/* Action buttons */}
  <div className="flex gap-2 flex-wrap justify-center my-4 pb-5">
    <button className="bg-[#43a148] text-white px-2.5 btn-lifted  py-1.5  text-[11px] rounded  hover:bg-green-600">
      DISCOUNT
    </button>
    <button className="bg-[#4d35ee] text-white px-2.5 py-1.5 btn-lifted    text-[11px] rounded   hover:bg-blue-700">
      DRAFT
    </button>
    <button className="bg-[#3db4e4] text-white px-2.5 py-1.5 btn-lifted   text-[11px] rounded  hover:bg-cyan-500">
      KOT
    </button>
    <button className="bg-[#fb8b02] text-white px-2.5 py-1.5 btn-lifted  text-[11px] rounded   hover:bg-orange-600">
      PLACE ORDER
    </button>
    <button className="bg-[#f42cef] text-white px-2.5 py-1.5 btn-lifted  text-[11px] rounded  hover:bg-pink-600">
      PAY
    </button>
  </div>

{/* Items */}



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
                            className={`px-4 py-3 text-left rounded-lg transition-colors border ${
                              selectedFloor === floor.name
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
                      <label className={`block text-sm font-medium mb-2 ${
                        selectedFloor ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        Select Table
                      </label>
                      <select 
                        value={selectedTable}
                        onChange={(e) => handleTableSelect(e.target.value)}
                        disabled={!selectedFloor}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                          selectedFloor 
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
                      <label className={`block text-sm font-medium mb-2 ${
                        selectedTable ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        Persons
                      </label>
                      <select 
                        value={selectedPersons}
                        onChange={(e) => handlePersonsSelect(e.target.value)}
                        disabled={!selectedTable}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                          selectedTable 
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
                       className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                         selectedFloor
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
                      className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                        selectedPersons
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
                             className={`px-4 py-3 text-left rounded-lg transition-colors border ${
                               selectedFloor === floor.name
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
                             <label className={`block text-sm font-medium mb-2 ${
                               selectedFloor ? 'text-gray-700' : 'text-gray-400'
                             }`}>
                               Select Table {index + 1}
                             </label>
                             <select 
                               value={selection.tableId}
                               onChange={(e) => handleMergeTableSelectionChange(selection.id, e.target.value)}
                               disabled={!selectedFloor}
                               className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                                 selectedFloor 
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
                         className={`w-fit px-4 py-2 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                           isAddMoreDisabled()
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
                       className={`px-6 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 ${
                         mergeTableSelections.filter(s => s.tableId).length >= 2
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
                  <h2 className="text-xl font-bold">Food Details</h2>
                  <button 
                    onClick={() => {
                      setShowFoodModal(false);
                      setSelectedFood(null);
                      setSelectedVariations({});
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
                          ].map((size) => (
                            <button
                              key={size.name}
                              onClick={() => handleVariationSelect('size', size.name)}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                selectedVariations.size === size.name
                                  ? 'bg-primary/10 border-primary'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  selectedVariations.size === size.name
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedVariations.size === size.name && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className={`font-medium ${
                                  selectedVariations.size === size.name ? 'text-primary' : 'text-gray-700'
                                }`}>
                                  {size.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${
                                selectedVariations.size === size.name ? 'text-primary' : 'text-gray-600'
                              }`}>
                                {size.price > 0 ? `+€${size.price.toFixed(2)}` : 'Free'}
                              </span>
                            </button>
                          ))}
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
                                  {addon.name}
                                </span>
                              </div>
                              <span className={`font-semibold ${
                                isSelected ? 'text-primary' : 'text-gray-600'
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
                  <div className="mb-6">
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
                  </div>

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
                      <button
                        onClick={() => {
                          setShowFoodModal(false);
                          setSelectedFood(null);
                          setSelectedVariations({});
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    );
};

export default RunningOrders;