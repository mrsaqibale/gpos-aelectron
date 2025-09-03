import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  MapPin,
  ShoppingBag,
  Eye,
  Check,
  X,
  ChefHat,
  CheckCircle,
  DollarSign,
  ChevronRight,
  Edit,
  Printer,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';
import VirtualKeyboard from '../../components/VirtualKeyboard';
import useVirtualKeyboard from '../../hooks/useVirtualKeyboard';

const ManageOrders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedDateFilter, setAppliedDateFilter] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [appliedCustomerSearchTerm, setAppliedCustomerSearchTerm] = useState('');
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');
  const [appliedFromDateTime, setAppliedFromDateTime] = useState('');
  const [appliedToDateTime, setAppliedToDateTime] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Use the custom hook for keyboard functionality
  const {
    showKeyboard,
    activeInput,
    keyboardInput,
    capsLock,
    handleInputFocus,
    handleInputBlur,
    handleAnyInputFocus,
    handleAnyInputClick,
    onKeyboardChange,
    onKeyboardChangeAll,
    onKeyboardKeyPress,
    resetKeyboardInputs,
    hideKeyboard
  } = useVirtualKeyboard(['searchTerm', 'dateFilter', 'customerSearchTerm']);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockOrders = [
      {
        id: '100031',
        kitchenId: 'K1000',
        type: 'Online',
        orderDate: '9/3/2025',
        orderTime: '10:37:59 AM',
        dueDate: '9/3/2025',
        dueTime: '11:46:51 AM',
        customer: 'Alice Johnson',
        phone: '+353 89100000',
        address: '45 High St, Dublin',
        source: 'Online App',
        items: ['2x Margherita Pizza', '1x Caesar Salad'],
        total: 19.92,
        paymentMethod: 'Card',
        orderMethod: 'Delivery',
        status: 'In Progress',
        paymentStatus: 'Paid',
        driver: 'Tom B.',
        table: null
      },
      {
        id: '100029',
        kitchenId: 'K1001',
        type: 'In Store',
        orderDate: '9/2/2025',
        orderTime: '7:37:59 PM',
        dueDate: '9/2/2025',
        dueTime: '8:24:10 PM',
        customer: 'Bob Smith',
        phone: '+353 89100137',
        address: '',
        source: 'POS Terminal',
        items: ['1x Burger Deluxe', '2x French Fries'],
        total: 14.88,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'In Prepare',
        paymentStatus: 'Paid',
        driver: null,
        table: null
      },
      {
        id: '100028',
        kitchenId: 'K1002',
        type: 'Dine In',
        orderDate: '9/2/2025',
        orderTime: '6:24:00 PM',
        dueDate: '9/2/2025',
        dueTime: '7:00:00 PM',
        customer: 'Sandra McDowell',
        phone: '+353 8637637623',
        address: '78 Oak Ave, Dublin',
        source: 'POS Terminal',
        items: ['1x Chicken Alfredo'],
        total: 70.55,
        paymentMethod: 'Card',
        orderMethod: 'Dine In',
        status: 'Ready',
        paymentStatus: 'Unpaid',
        driver: null,
        table: 'T2'
      },
      {
        id: '100026',
        kitchenId: 'K1003',
        type: 'Collection',
        orderDate: '9/1/2025',
        orderTime: '1:46:00 PM',
        dueDate: '9/1/2025',
        dueTime: '6:00:00 PM',
        customer: 'Michelle Lonergan',
        phone: '+353 86237676',
        address: '123 Main St, Dublin',
        source: 'Website',
        items: ['1x Pepperoni Pizza', '1x Garlic Bread'],
        total: 28.10,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'Completed',
        paymentStatus: 'Paid',
        driver: null,
        table: null
      },
      {
        id: '100025',
        kitchenId: 'K1004',
        type: 'Delivery',
        orderDate: '9/1/2025',
        orderTime: '9:30:00 AM',
        dueDate: '9/1/2025',
        dueTime: '10:30:00 AM',
        customer: 'Anna Davis',
        phone: '+353 82367237',
        address: '67 Park Lane, Dublin',
        source: 'POS Terminal',
        items: ['1x Fish & Chips'],
        total: 16.99,
        paymentMethod: 'Cash',
        orderMethod: 'Delivery',
        status: 'Delivered',
        paymentStatus: 'Paid',
        driver: 'John D.',
        table: null
      },
      {
        id: '100024',
        kitchenId: 'K1005',
        type: 'Dine In',
        orderDate: '9/1/2025',
        orderTime: '5:30:00 PM',
        dueDate: '9/1/2025',
        dueTime: '6:30:00 PM',
        customer: 'Michael Brown',
        phone: '+353 23236368238',
        address: '34 River Rd, Dublin',
        source: 'Dine In',
        items: ['1x Steak Dinner', '1x Wine'],
        total: 85.50,
        paymentMethod: 'Card',
        orderMethod: 'Dine In',
        status: 'In Progress',
        paymentStatus: 'Unpaid',
        driver: null,
        table: 'T1'
      },
      {
        id: '100023',
        kitchenId: 'K1006',
        type: 'Online',
        orderDate: '8/31/2025',
        orderTime: '12:30:00 PM',
        dueDate: '8/31/2025',
        dueTime: '1:30:00 PM',
        customer: 'Sarah Johnson',
        phone: '+353 851234567',
        address: '89 Hill Street, Dublin',
        source: 'Website',
        items: ['1x Chicken Curry', '1x Naan Bread'],
        total: 35.40,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'Completed',
        paymentStatus: 'Paid',
        driver: null,
        table: null
      }
    ];
    setOrders(mockOrders);
  }, []);

  // Keyboard useEffect - handled by the hook now

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'collection', label: 'Collection', count: orders.filter(o => o.type === 'Collection').length },
    { id: 'delivery', label: 'Delivery', count: orders.filter(o => o.type === 'Delivery').length },
    { id: 'online', label: 'Online', count: orders.filter(o => o.type === 'Online').length },
    { id: 'dinein', label: 'Dine In', count: orders.filter(o => o.type === 'Dine In').length },
    { id: 'instore', label: 'In Store', count: orders.filter(o => o.type === 'In Store').length },
    { id: 'paid', label: 'Paid', count: orders.filter(o => o.paymentStatus === 'Paid').length },
    { id: 'unpaid', label: 'Unpaid', count: orders.filter(o => o.paymentStatus === 'Unpaid').length }
  ];

  const formatDateForComparison = (dateStr) => {
    // Convert "05 Jul 2025" format to "2025-07-05" format for comparison
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const parseOrderDateTime = (order) => {
    // order.orderDate like '9/3/2025' and order.orderTime like '10:37:59 AM'
    try {
      return new Date(`${order.orderDate} ${order.orderTime}`);
    } catch (e) {
      return null;
    }
  };

  const parseLocalDateTime = (value) => {
    // value is HTML datetime-local like '2025-09-03T12:00'
    if (!value) return null;
    try {
      return new Date(value);
    } catch (e) {
      return null;
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by tab
    if (activeTab === 'collection') {
      filtered = filtered.filter(o => o.type === 'Collection');
    } else if (activeTab === 'delivery') {
      filtered = filtered.filter(o => o.type === 'Delivery');
    } else if (activeTab === 'online') {
      filtered = filtered.filter(o => o.type === 'Online');
    } else if (activeTab === 'dinein') {
      filtered = filtered.filter(o => o.type === 'Dine In');
    } else if (activeTab === 'instore') {
      filtered = filtered.filter(o => o.type === 'In Store');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(o => o.paymentStatus === 'Paid');
    } else if (activeTab === 'unpaid') {
      filtered = filtered.filter(o => o.paymentStatus === 'Unpaid');
    }

    // Payment status filter
    if (paymentStatusFilter === 'paid') {
      filtered = filtered.filter(o => o.paymentStatus === 'Paid');
    } else if (paymentStatusFilter === 'unpaid') {
      filtered = filtered.filter(o => o.paymentStatus === 'Unpaid');
    }

    // Order ID filter
    if (appliedSearchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(appliedSearchTerm.toLowerCase())
      );
    }

    // Customer filter
    if (appliedCustomerSearchTerm) {
      filtered = filtered.filter(o => 
        o.customer.toLowerCase().includes(appliedCustomerSearchTerm.toLowerCase()) ||
        o.phone.includes(appliedCustomerSearchTerm)
      );
    }

    // Old single date filter (kept for compatibility)
    if (appliedDateFilter) {
      filtered = filtered.filter(o => {
        const orderDate = formatDateForComparison(o.orderDate);
        return orderDate === appliedDateFilter;
      });
    }

    // New datetime range filter
    const fromDt = parseLocalDateTime(appliedFromDateTime);
    const toDt = parseLocalDateTime(appliedToDateTime);
    if (fromDt || toDt) {
      filtered = filtered.filter(o => {
        const dt = parseOrderDateTime(o);
        if (!dt) return false;
        if (fromDt && dt < fromDt) return false;
        if (toDt && dt > toDt) return false;
        return true;
      });
    }

    return filtered;
  };

  const handleApplyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedDateFilter(dateFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setAppliedSearchTerm('');
    setAppliedDateFilter('');
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    // Trigger animation after modal is shown
    setTimeout(() => setIsModalAnimating(true), 10);
  };

  const closeOrderModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setShowOrderModal(false);
      setSelectedOrder(null);
    }, 300);
  };

  // Handle keyboard input changes
  const handleKeyboardChange = (input, inputName) => {
    if (inputName === 'searchTerm') {
      setSearchTerm(input);
      // Apply search filter immediately as user types
      setAppliedSearchTerm(input);
    } else if (inputName === 'dateFilter') {
      setDateFilter(input);
      // Apply date filter immediately as user types
      setAppliedDateFilter(input);
    } else if (inputName === 'customerSearchTerm') {
      setCustomerSearchTerm(input);
      // Apply customer search filter immediately as user types
      setAppliedCustomerSearchTerm(input);
    }
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

  // Enhanced input focus handling for keyboard
  const handleInputFocusEnhanced = (e, inputName) => {
    // Set the active input for the virtual keyboard
    if (inputName === 'searchTerm') {
      handleAnyInputFocus(e, 'searchTerm', searchTerm);
    } else if (inputName === 'customerSearchTerm') {
      handleAnyInputFocus(e, 'customerSearchTerm', customerSearchTerm);
    } else if (inputName === 'dateFilter') {
      handleAnyInputFocus(e, 'dateFilter', dateFilter);
    }
  };

  // Enhanced input click handling for keyboard
  const handleInputClickEnhanced = (e, inputName) => {
    // Set the active input for the virtual keyboard
    if (inputName === 'searchTerm') {
      handleAnyInputClick(e, 'searchTerm', searchTerm);
    } else if (inputName === 'customerSearchTerm') {
      handleAnyInputClick(e, 'customerSearchTerm', customerSearchTerm);
    } else if (inputName === 'dateFilter') {
      handleAnyInputClick(e, 'dateFilter', dateFilter);
    }
  };

  // Keyboard functionality is now handled by the useVirtualKeyboard hook

  const getStatusColor = (status) => {
    const colors = {
      'In Prepare': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'Ready': 'bg-green-50 text-green-700 border-green-200',
      'Completed': 'bg-gray-50 text-gray-700 border-gray-200',
      'Delivered': 'bg-blue-50 text-blue-700 border-blue-200',
      'new': 'bg-purple-50 text-purple-700 border-purple-200',
      'pending': 'bg-orange-50 text-orange-700 border-orange-200',
      'confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
      'preparing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'ready': 'bg-green-50 text-green-700 border-green-200',
      'completed': 'bg-gray-50 text-gray-700 border-gray-200',
      'cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      new: 'New',
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getActionButtons = (order) => {
    return (
      <div className="flex gap-2">
        <button className="text-primary cursor-pointer transition-colors">
          <Edit size={16} />
        </button>
        <button className="text-primary hover:text-gray-800 cursor-pointer transition-colors">
          <Printer size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col px-4 py-2">


      {/* Orders Table - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Top Section: Date Filters, Order Type Filters, and Global Actions */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-2 mb-4 ">
            {/* Date & Time Range Filter */}
            <div className="flex flex-col items-start gap-6">
              {/* From Date & Time */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="from-datetime">From:</label>
                <div className="relative flex items-center gap-2">
                  <input
                    id="from-datetime"
                    type="datetime-local"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                    value={fromDateTime}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFromDateTime(v);
                      setAppliedFromDateTime(v);
                    }}
                  />
                </div>
              </div>
              {/* To Date & Time */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="to-datetime">To:</label>
                <div className="relative flex items-center gap-2">
                  <input
                    id="to-datetime"
                    type="datetime-local"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                    value={toDateTime}
                    onChange={(e) => {
                      const v = e.target.value;
                      setToDateTime(v);
                      setAppliedToDateTime(v);
                    }}
                  />
                </div>
              </div>
            </div>



            {/* Order Type Filters */}
            <div className="flex items-center gap-2 mb-4">
              {['In-Store', 'Dine-In', 'Collection', 'Delivery', 'Online'].map((type) => (
                <button
                  key={type}
                  className={`w-28 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === type.toLowerCase().replace('-', '')
                      ? 'bg-primaryLight text-white'
                      : 'bg-primaryExtraLight text-primaryLight hover:bg-primaryLight hover:text-white'
                    }`}
                  onClick={() => setActiveTab(type.toLowerCase().replace('-', ''))}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Payment Status Filters */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <button
                className={`w-24 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${paymentStatusFilter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'paid' ? 'all' : 'paid')}
              >
                Paid
              </button>
              <button
                className={`w-24 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${paymentStatusFilter === 'unpaid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'unpaid' ? 'all' : 'unpaid')}
              >
                Unpaid
              </button>
            </div>
            {/* Global Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setActiveTab('all');
                  setPaymentStatusFilter('all');
                  setSearchTerm('');
                  setDateFilter('');
                  setCustomerSearchTerm('');
                  setFromDateTime('');
                  setToDateTime('');
                  setAppliedSearchTerm('');
                  setAppliedDateFilter('');
                  setAppliedCustomerSearchTerm('');
                  setAppliedFromDateTime('');
                  setAppliedToDateTime('');
                }}
              >
                <RotateCcw size={18} className="text-gray-600" />
              </button>
              <button className="w-10 h-10 bg-white border cursor-pointer border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                <ShoppingBag size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section: Search and Advanced Search */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent">
                <option>Status (All)</option>
                <option>In Prepare</option>
                <option>In Progress</option>
                <option>Ready</option>
                <option>Completed</option>
                <option>Delivered</option>
              </select>
            </div>

            {/* Search Fields */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                name="searchTerm"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchTerm(value);
                  setAppliedSearchTerm(value);
                }}
                onFocus={(e) => handleInputFocusEnhanced(e, 'searchTerm')}
                onClick={(e) => handleInputClickEnhanced(e, 'searchTerm')}
                onBlur={handleInputBlur}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
              />
              <input
                type="text"
                name="customerSearchTerm"
                placeholder="Search by Customer name or Number"
                value={customerSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerSearchTerm(value);
                  setAppliedCustomerSearchTerm(value);
                }}
                onFocus={(e) => handleInputFocusEnhanced(e, 'customerSearchTerm')}
                onClick={(e) => handleInputClickEnhanced(e, 'customerSearchTerm')}
                onBlur={handleInputBlur}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
              />
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                Search by Driver
              </button>
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                Advanced Search
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 bg-primary">
          <div className="flex gap-2 w-full">
            {['Load Sales', 'Move Order', 'Pay', 'Assign Driver', 'Complete All', 'Mark Delivered', 'Print'].map((action) => (
              <button
                key={action}
                className="w-full px-4 py-2 bg-white text-primary rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors font-semibold"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container - Scrollable */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead className="sticky top-0 bg-primaryExtraLight z-10">
              <tr>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300 text-primaryLight focus:ring-primaryLight" />
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Type

                  </div>
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Order ID

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Kitchen ID

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Date/Time

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Due At

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Driver/Table

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Customer

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Address

                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Amount
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Payment
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Status
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((order, index) => (
                <tr
                  key={order.id}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  onClick={() => handleOrderClick(order)}
                >
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded border-gray-300 text-primaryLight focus:ring-primaryLight" />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{order.type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-primary">ORD-{order.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{order.kitchenId}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-800">{order.orderDate}</div>
                      <div className="text-xs text-gray-600">{order.orderTime}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-800">{order.dueDate}</div>
                      <div className="text-xs text-gray-600">{order.dueTime}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {order.driver || order.table || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-600">({order.phone})</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {order.address || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-semibold text-gray-800">€{order.total.toFixed(2)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredOrders().length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-300 mb-3">
                <ShoppingBag size={40} className="mx-auto" />
              </div>
              <p className="text-gray-600 font-medium text-sm">No orders found</p>
              <p className="text-gray-500 text-xs">Orders matching your filter criteria will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal - Slides in from right */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0000000d] bg-opacity-50 transition-opacity"
            onClick={closeOrderModal}
          />

          {/* Modal Content - Slides in from right */}
          <div className={`relative w-96 h-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isModalAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
              <button
                onClick={closeOrderModal}
                className="text-primaryLight hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Order Info */}
            <div className="p-6 space-y-6">
              {/* Order ID and Type */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-primary">ORD-{selectedOrder.id}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{selectedOrder.type}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedOrder.orderDate}, {selectedOrder.orderTime}</p>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-700">{item}</span>
                      <span className="text-sm font-medium text-gray-800">
                        €{(selectedOrder.total / selectedOrder.items.length).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment and Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                {/* Payment Details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Payment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-gray-800">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-800">€{selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${selectedOrder.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Customer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-800 font-medium">{selectedOrder.customer}</div>
                    <div className="text-gray-600">{selectedOrder.phone}</div>
                    <div className="text-gray-400">-</div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800">Current Status</h3>
                <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-white">
              <div className="flex gap-3">
                <button className="w-full px-4 py-2 border border-primaryLight text-primaryLight rounded-lg hover:bg-primaryLight hover:text-white transition-colors font-medium">
                  Update Status
                </button>
                <button className="w-full px-4 py-2 border border-primaryLight text-primaryLight rounded-lg hover:bg-primaryLight hover:text-white transition-colors font-medium">
                  Print Invoice
                </button>
                <button className="w-full px-4 py-2 border border-primaryLight text-primaryLight rounded-lg hover:bg-primaryLight hover:text-white transition-colors font-medium">
                  Assign Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Keyboard Component */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={hideKeyboard}
        activeInput={activeInput}
        onInputChange={handleKeyboardChange}
        onInputBlur={handleInputBlur}
        inputValue={keyboardInput}
      />
    </div>
  );
};

export default ManageOrders;