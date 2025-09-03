import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import UpdateOrderStatus from '../../components/UpdateOrderStatus';
import AssignRider from '../../components/AssignRider';

const ManageOrders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [fromDateTime, setFromDateTime] = useState('');
  const [toDateTime, setToDateTime] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderTotals, setOrderTotals] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderIdForSales, setSelectedOrderIdForSales] = useState(null);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('New');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showAssignRiderModal, setShowAssignRiderModal] = useState(false);
  const [selectedOrderForRider, setSelectedOrderForRider] = useState(null);
  const navigate = useNavigate();

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
  } = useVirtualKeyboard(['searchTerm', 'customerSearchTerm']);

  // Format Date to input[type="datetime-local"] string in local time
  const formatForDatetimeLocal = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  };

  // Set today's date range on component mount
  useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);
    
    setFromDateTime(formatForDatetimeLocal(todayStart));
    setToDateTime(formatForDatetimeLocal(todayEnd));
    
    // Also fetch immediately on mount
    loadOrders(todayStart.toISOString(), todayEnd.toISOString());
  }, []);

  // Load orders from database
  const loadOrders = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await window.myAPI.getOrdersByDateRange(startDate, endDate);
      
      if (result.success) {
        // Process orders to include customer data and format properly
        const processedOrders = await Promise.all(
          result.data.map(async (order) => {
            let customerData = null;
            
            if (order.customer_id) {
              try {
                const customerResult = await window.myAPI.getCustomerById(order.customer_id);
                if (customerResult.success && customerResult.data) {
                  customerData = customerResult.data;
                }
              } catch (error) {
                console.warn(`Failed to fetch customer data for order ${order.id}:`, error);
              }
            }
            
            return {
              ...order,
              customerData,
              // Format dates for display
              orderDate: new Date(order.created_at).toLocaleDateString(),
              orderTime: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              dueDate: order.schedule_at ? new Date(order.schedule_at).toLocaleDateString() : 'N/A',
              dueTime: order.schedule_at ? new Date(order.schedule_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
              // Format amount
              total: parseFloat(order.order_amount || 0),
              // Format status
              status: order.order_status || 'new',
              paymentStatus: order.payment_status || 'pending'
            };
          })
        );
        
        setOrders(processedOrders);
        setFilteredOrders(processedOrders);
      } else {
        setError(result.message || 'Failed to load orders');
        setOrders([]);
        setFilteredOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = orders;

    // Filter by tab
    if (activeTab === 'collection') {
      filtered = filtered.filter(o => normalizeOrderType(o.order_type) === 'collection');
    } else if (activeTab === 'delivery') {
      filtered = filtered.filter(o => normalizeOrderType(o.order_type) === 'delivery');
    } else if (activeTab === 'online') {
      filtered = filtered.filter(o => normalizeOrderType(o.order_type) === 'online');
    } else if (activeTab === 'dinein') {
      filtered = filtered.filter(o => normalizeOrderType(o.order_type) === 'dinein');
    } else if (activeTab === 'instore') {
      filtered = filtered.filter(o => normalizeOrderType(o.order_type) === 'instore');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(o => o.paymentStatus === 'paid');
    } else if (activeTab === 'unpaid') {
      filtered = filtered.filter(o => o.paymentStatus === 'unpaid');
    }

    // Payment status filter
    if (paymentStatusFilter === 'paid') {
      filtered = filtered.filter(o => o.paymentStatus === 'paid');
    } else if (paymentStatusFilter === 'unpaid') {
      filtered = filtered.filter(o => o.paymentStatus === 'unpaid');
    }

    // Order status filter
    if (orderStatusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === orderStatusFilter);
    }

    // Order ID filter
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Customer filter
    if (customerSearchTerm) {
      filtered = filtered.filter(o => {
        if (o.customerData) {
          return o.customerData.name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                 o.customerData.phone?.includes(customerSearchTerm);
        }
        return false;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, activeTab, paymentStatusFilter, orderStatusFilter, searchTerm, customerSearchTerm]);

  // Fetch orders instantly when either date changes (when both present)
  useEffect(() => {
    if (!fromDateTime || !toDateTime) return;
    try {
      const startDate = new Date(fromDateTime).toISOString();
      const endDate = new Date(toDateTime).toISOString();
      loadOrders(startDate, endDate);
    } catch (e) {
      // ignore invalid date parse
    }
  }, [fromDateTime, toDateTime]);

  // Handle clear filters
  const handleClearFilters = () => {
    setActiveTab('all');
    setPaymentStatusFilter('all');
    setOrderStatusFilter('all');
    setSearchTerm('');
    setCustomerSearchTerm('');
    
    // Reset to today's date range
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);
    
    setFromDateTime(formatForDatetimeLocal(todayStart));
    setToDateTime(formatForDatetimeLocal(todayEnd));
    
    loadOrders(todayStart.toISOString(), todayEnd.toISOString());
  };

  const openInvoiceForOrder = async (order) => {
    try {
      setInvoiceLoading(true);
      setSelectedOrder(order);
      setShowOrderModal(true);
      setTimeout(() => setIsModalAnimating(true), 10);
      // Fetch order details and totals
      const [detailsResult, totalsResult] = await Promise.all([
        window.myAPI.getOrderDetailsWithFood(order.id),
        window.myAPI.calculateOrderTotal(order.id)
      ]);
      if (detailsResult?.success) setOrderDetails(detailsResult.data || []);
      else setOrderDetails([]);
      if (totalsResult?.success) setOrderTotals(totalsResult.data || null);
      else setOrderTotals(null);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const closeOrderModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setShowOrderModal(false);
      setSelectedOrder(null);
      setOrderDetails([]);
      setOrderTotals(null);
    }, 300);
  };

  const openUpdateStatusModal = (order) => {
    setSelectedOrderForStatus({
      id: order.id,
      orderNumber: order.id,
      orderType: getOrderTypeDisplay(order.order_type),
      status: order.status,
      customer: order.customerData
    });
    // Ensure status is properly normalized to match the component's expected format
    const normalizeStatus = (status) => {
      if (!status) return 'New';
      
      // Handle common status variations
      const statusMap = {
        'new': 'New',
        'in progress': 'In Progress',
        'inprogress': 'In Progress',
        'ready': 'Ready',
        'completed': 'Completed',
        'delivered': 'Delivered',
        'on the way': 'On the way',
        'ontheway': 'On the way'
      };
      
      const lowerStatus = status.toLowerCase().replace(/[_\s-]+/g, ' ');
      return statusMap[lowerStatus] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };
    
    const normalizedStatus = normalizeStatus(order.status);
    setSelectedStatus(normalizedStatus);
    setShowUpdateStatusModal(true);
  };

  const closeUpdateStatusModal = () => {
    setShowUpdateStatusModal(false);
    setSelectedOrderForStatus(null);
    setSelectedStatus('New');
  };

  const openAssignRiderModal = (order) => {
    // Only allow rider assignment for delivery orders
    if (normalizeOrderType(order.order_type) !== 'delivery') {
      console.log('Rider assignment is only available for delivery orders');
      return;
    }
    
    setSelectedOrderForRider({
      id: order.id,
      orderNumber: order.id,
      orderType: getOrderTypeDisplay(order.order_type),
      status: order.status,
      customer: order.customerData
    });
    setShowAssignRiderModal(true);
  };

  const closeAssignRiderModal = () => {
    setShowAssignRiderModal(false);
    setSelectedOrderForRider(null);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrderForStatus) return;
    
    console.log('handleStatusUpdate called with status:', newStatus);
    console.log('selectedOrderForStatus:', selectedOrderForStatus);
    
    setIsUpdatingStatus(true);
    
    try {
      // Map UI status to database status format
      let dbStatus = newStatus;
      switch (newStatus) {
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
        default:
          dbStatus = newStatus.toLowerCase().replace(/\s+/g, '_');
      }
      
      console.log('Mapped status for database:', dbStatus);
      
      // Update the order status in the database
      const result = await window.myAPI.updateOrderStatus(selectedOrderForStatus.id, dbStatus);
      
      console.log('API result:', result);
      
      if (result.success) {
        // Update the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrderForStatus.id 
              ? { ...order, status: newStatus }
              : order
          )
        );
        
        // Show success message
        console.log('Order status updated successfully');
        
        // Add a small delay before closing the modal to show success state
        setTimeout(() => {
          closeUpdateStatusModal();
        }, 500);
        
        // You can add a toast notification here if you have a notification system
        // For now, we'll just close the modal and update the UI
      } else {
        console.error('Failed to update order status:', result.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = (status) => {
    console.log('handleStatusChange called with status:', status);
    setSelectedStatus(status);
  };

  const handleAssignRider = async (rider) => {
    if (!selectedOrderForRider) return false;
    
    try {
      // Here you would call your API to assign the rider to the order
      // For now, we'll just log it and close the modal
      console.log(`Assigning rider ${rider.name} to order ${selectedOrderForRider.id}`);
      
      // You can add your API call here:
      // const result = await window.myAPI.assignRiderToOrder(selectedOrderForRider.id, rider.id);
      
      // Update the order status to "On the way" since this is triggered from status selection
      const statusUpdateResult = await window.myAPI.updateOrderStatus(selectedOrderForRider.id, 'on_the_way');
      
      if (statusUpdateResult.success) {
        // Update the local state to show the assigned rider and new status
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === selectedOrderForRider.id 
              ? { ...order, driver: rider.name, status: 'On the way' }
              : order
          )
        );
        
        console.log('Order status updated to "On the way" and rider assigned successfully');
        
        // Close the modal on success
        closeAssignRiderModal();
        return true;
      } else {
        console.error('Failed to update order status:', statusUpdateResult.message);
        return false;
      }
    } catch (error) {
      console.error('Error assigning rider:', error);
      return false;
    }
  };

  // Handle keyboard input changes
  const handleKeyboardChange = (input, inputName) => {
    if (inputName === 'searchTerm') {
      setSearchTerm(input);
    } else if (inputName === 'customerSearchTerm') {
      setCustomerSearchTerm(input);
    }
  };

  // Enhanced input focus handling for keyboard
  const handleInputFocusEnhanced = (e, inputName) => {
    if (inputName === 'searchTerm') {
      handleAnyInputFocus(e, 'searchTerm', searchTerm);
    } else if (inputName === 'customerSearchTerm') {
      handleAnyInputFocus(e, 'customerSearchTerm', customerSearchTerm);
    }
  };

  // Enhanced input click handling for keyboard
  const handleInputClickEnhanced = (e, inputName) => {
    if (inputName === 'searchTerm') {
      handleAnyInputClick(e, 'searchTerm', searchTerm);
    } else if (inputName === 'customerSearchTerm') {
      handleAnyInputClick(e, 'customerSearchTerm', customerSearchTerm);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'new': 'bg-purple-50 text-purple-700 border-purple-200',
      'pending': 'bg-orange-50 text-orange-700 border-orange-200',
      'confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
      'processing': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'ready': 'bg-green-50 text-green-700 border-green-200',
      'completed': 'bg-gray-50 text-gray-700 border-gray-200',
      'delivered': 'bg-blue-50 text-blue-700 border-blue-200',
      'canceled': 'bg-red-50 text-red-700 border-red-200',
      'In Prepare': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
      'Ready': 'bg-green-50 text-green-700 border-green-200',
      'Completed': 'bg-gray-50 text-gray-700 border-gray-200',
      'Delivered': 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      new: 'New',
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      ready: 'Ready',
      completed: 'Completed',
      delivered: 'Delivered',
      canceled: 'Canceled'
    };
    return statusMap[status] || status;
  };

  const normalizeOrderType = (orderType) => {
    if (!orderType) return '';
    const s = String(orderType).toLowerCase().replace(/[_\s-]+/g, '');
    if (s === 'dinein' || s === 'dine') return 'dinein';
    if (s === 'instore' || s === 'instoreshop' || s === 'inshop') return 'instore';
    if (s === 'collection' || s === 'pickup' || s === 'pickuporder') return 'collection';
    if (s === 'delivery') return 'delivery';
    if (s === 'online' || s === 'web' || s === 'app') return 'online';
    return s;
  };

  const getOrderTypeDisplay = (orderType) => {
    const key = normalizeOrderType(orderType);
    const typeMap = {
      dinein: 'Dine In',
      delivery: 'Delivery',
      collection: 'Collection',
      online: 'Online',
      instore: 'In Store'
    };
    return typeMap[key] || orderType;
  };

  const getCustomerDisplay = (order) => {
    if (order.customerData) {
      return {
        name: order.customerData.name || 'N/A',
        phone: order.customerData.phone || 'N/A',
        address: order.customerData.address || 'N/A'
      };
    } else {
      return {
        name: 'Walk-in Customer',
        phone: 'N/A',
        address: 'N/A'
      };
    }
  };

  const getDriverTableDisplay = (order) => {
    const t = normalizeOrderType(order.order_type);
    if (t === 'delivery') {
      return order.driver || 'N/A';
    } else if (t === 'dinein') {
      return order.table_details || 'N/A';
    } else {
      return 'N/A';
    }
  };

  // Helper function to check if an order status prevents navigation to sales
  const isOrderStatusBlocked = (status) => {
    if (!status) return false;
    const normalizedStatus = status.toLowerCase().replace(/[_\s-]+/g, '');
    const blockedStatuses = ['completed', 'ontheway', 'delivered'];
    return blockedStatuses.includes(normalizedStatus);
  };

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'collection', label: 'Collection', count: orders.filter(o => normalizeOrderType(o.order_type) === 'collection').length },
    { id: 'delivery', label: 'Delivery', count: orders.filter(o => normalizeOrderType(o.order_type) === 'delivery').length },
    { id: 'online', label: 'Online', count: orders.filter(o => normalizeOrderType(o.order_type) === 'online').length },
    { id: 'dinein', label: 'Dine In', count: orders.filter(o => normalizeOrderType(o.order_type) === 'dinein').length },
    { id: 'instore', label: 'In Store', count: orders.filter(o => normalizeOrderType(o.order_type) === 'instore').length },
    { id: 'paid', label: 'Paid', count: orders.filter(o => o.paymentStatus === 'paid').length },
    { id: 'unpaid', label: 'Unpaid', count: orders.filter(o => o.paymentStatus === 'unpaid').length }
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <X size={48} className="mx-auto" />
          </div>
          <p className="text-red-600 font-medium mb-2">Error loading orders</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button 
            onClick={() => handleClearFilters()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryDark transition-colors"
          >
            Retry
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col px-4 py-2 bg-transparent">
      {/* Orders Table - Takes remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#CDCDCD] rounded-lg mb-6">
        {/* Top Section: Date Filters, Order Type Filters, and Global Actions */}
        <div className="flex-shrink-0 p-4">
          <div className="flex items-start justify-between gap-2 mb-4 ">
            {/* Date & Time Range Filter */}
            <div className="flex flex-col items-start gap-6">
              {/* From Date & Time */}
              <div className="flex items-center gap-2">
                <label className="w-20 text-center rounded-md px-3 py-2 text-sm font-medium text-white bg-primary" htmlFor="from-datetime">From:</label>
                <div className="relative flex items-center gap-2">
                  <input
                    id="from-datetime"
                    type="datetime-local"
                    className="px-3 py-2 border bg-white text-black border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                    value={fromDateTime}
                    onChange={(e) => setFromDateTime(e.target.value)}
                  />
                </div>
              </div>
              {/* To Date & Time */}
              <div className="flex items-center gap-2">
                <label className="w-20 text-center rounded-md px-3 py-2 text-sm font-medium text-white bg-primary" htmlFor="to-datetime">To:</label>
                <div className="relative flex items-center gap-2">
                  <input
                    id="to-datetime"
                    type="datetime-local"
                    className="px-3 py-2 border bg-white text-black border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                    value={toDateTime}
                    onChange={(e) => setToDateTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Order Type Filters */}
            <div className="flex items-center gap-2 mb-4">
              {['In Store', 'Dine In', 'Collection', 'Delivery', 'Online'].map((type) => {
                const typeId = type.toLowerCase().replace(/\s+/g, '');
                return (
                <button
                  key={type}
                    className={`w-28 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === typeId
                      ? 'bg-primary text-white'
                      : 'bg-primary text-white cursor-pointer'
                    }`}
                    onClick={() => setActiveTab(typeId)}
                >
                  {type}
                </button>
                );
              })}
            </div>

            {/* Payment Status Filters */}
            <div className="flex flex-col items-center gap-2 mb-4">
              <button
                className={`w-24 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${paymentStatusFilter === 'paid'
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-[#16A34A] text-white hover:bg-[#16A34A] cursor-pointer'
                  }`}
                onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'paid' ? 'all' : 'paid')}
              >
                Paid
              </button>
              <button
                className={`w-24 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${paymentStatusFilter === 'unpaid'
                    ? 'bg-[#0EA5E9] text-white'
                    : 'bg-[#0EA5E9] text-white hover:bg-[#0EA5E9] cursor-pointer'
                  }`}
                onClick={() => setPaymentStatusFilter(paymentStatusFilter === 'unpaid' ? 'all' : 'unpaid')}
              >
                Unpaid
              </button>
            </div>
            {/* Global Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                className="w-10 h-10 bg-white border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={handleClearFilters}
              >
                <RotateCcw size={18} className="text-gray-600" />
              </button>
              <button className="w-10 h-10 bg-white border cursor-pointer border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 transition-colors">
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
              <select 
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white w-38"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <option value="all">Status (All)</option>
                <option value="new">New</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Search Fields */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                name="searchTerm"
                placeholder="Search by Order ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => handleInputFocusEnhanced(e, 'searchTerm')}
                onClick={(e) => handleInputClickEnhanced(e, 'searchTerm')}
                onBlur={handleInputBlur}
                className="px-3 py-2 border bg-white border-gray-300 rounded-lg text-sm focus:outline-none"
              />
              <input
                type="text"
                name="customerSearchTerm"
                placeholder="Search by Customer name or Number"
                value={customerSearchTerm}
                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                onFocus={(e) => handleInputFocusEnhanced(e, 'customerSearchTerm')}
                onClick={(e) => handleInputClickEnhanced(e, 'customerSearchTerm')}
                onBlur={handleInputBlur}
                className="px-3 py-2 border bg-white border-gray-300 rounded-lg text-sm focus:outline-none"
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
        </div>
        {/* Bulk Actions Bar */}
        <div className="flex-shrink-0 px-4 py-2 rounded-lg mb-5 border-b border-gray-200 bg-primary">
          <div className="flex gap-2 w-full">
            <button
              className={`w-full px-4 py-2 rounded-sm text-sm font-medium transition-colors font-semibold ${
                (() => {
                  if (!selectedOrderIdForSales) return 'bg-gray-300 text-black cursor-not-allowed';
                  const order = orders.find(o => o.id === selectedOrderIdForSales);
                  if (!order) return 'bg-gray-300 text-black cursor-not-allowed';
                  
                  // Check if order status prevents navigation to sales
                  if (isOrderStatusBlocked(order.status)) {
                    return 'bg-gray-300 text-black cursor-not-allowed';
                  }
                  
                  return 'bg-white text-primary hover:bg-gray-100 cursor-pointer';
                })()
              }`}
              title={(() => {
                if (!selectedOrderIdForSales) return 'No order selected';
                const order = orders.find(o => o.id === selectedOrderIdForSales);
                if (!order) return 'No order selected';
                
                if (isOrderStatusBlocked(order.status)) {
                  return `Cannot load sales for order with status: ${order.status}`;
                }
                
                return 'Load order into sales screen';
              })()}
              onClick={async () => {
                if (!selectedOrderIdForSales) return;
                const order = orders.find(o => o.id === selectedOrderIdForSales);
                if (!order) return;
                
                // Check if order status prevents navigation to sales
                if (isOrderStatusBlocked(order.status)) {
                  console.log(`Cannot load sales for order with status: ${order.status}`);
                  return;
                }
                
                try {
                  // Fetch details and totals to pass along
                  const [detailsResult] = await Promise.all([
                    window.myAPI.getOrderDetailsWithFood(order.id)
                  ]);
                  const details = detailsResult?.success ? detailsResult.data : [];
                  // Build minimal payload for RunningOrders
                  const payload = {
                    orderId: order.id,
                    databaseId: order.id,
                    orderType: getOrderTypeDisplay(order.order_type),
                    customer: order.customerData ? {
                      id: order.customer_id,
                      name: order.customerData.name,
                      phone: order.customerData.phone,
                      address: order.customerData.address
                    } : null,
                    items: details.map(d => ({
                      id: d.id,
                      food: {
                        id: d.food_id,
                        name: d.food_name,
                        description: d.food_description
                      },
                      quantity: d.quantity,
                      totalPrice: Number(d.price || 0) * Number(d.quantity || 1),
                      variations: d.variation ? (() => { try { return JSON.parse(d.variation); } catch { return {}; } })() : {},
                      adons: d.add_ons ? (() => { try { return JSON.parse(d.add_ons); } catch { return []; } })() : []
                    })),
                    payment: {
                      method: order.payment_method,
                      status: order.paymentStatus,
                      amount: order.total
                    },
                    table: order.table_details || null,
                    waiter: order.waiter || null
                  };
                  navigate('/dashboard/sales', { state: { loadOrder: payload } });
                } catch (e) {
                  console.error('Failed to prepare order for sales:', e);
                }
              }}
            >
              Load Sales
            </button>
            <button
              className="w-full px-4 py-2 bg-white text-primary rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
              onClick={() => {
                if (!selectedOrderIdForSales) return;
                const order = orders.find(o => o.id === selectedOrderIdForSales);
                if (!order) return;
                openUpdateStatusModal(order);
              }}
            >
              Move Order
            </button>
            {['Pay'].map((action) => (
              <button
                key={action}
                className="w-full px-4 py-2 bg-white text-primary rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
              >
                {action}
              </button>
            ))}
            <button
              className="w-full px-4 py-2 bg-white text-primary rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
              onClick={() => {
                if (!selectedOrderIdForSales) return;
                const order = orders.find(o => o.id === selectedOrderIdForSales);
                if (!order) return;
                openAssignRiderModal(order);
              }}
            >
              Assign Driver
            </button>
            {['Complete All', 'Mark Delivered', 'Print'].map((action) => (
              <button
                key={action}
                className="w-full px-4 py-2 bg-white text-primary rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors font-semibold cursor-pointer"
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
              {filteredOrders.map((order, index) => {
                const customerDisplay = getCustomerDisplay(order);
                const driverTableDisplay = getDriverTableDisplay(order);
                
                return (
                <tr
                  key={order.id}
                  className={`border-b border-gray-100 transition-colors ${
                    isOrderStatusBlocked(order.status)
                      ? 'bg-gray-100 opacity-75'
                      : index % 2 === 0 
                        ? 'bg-white hover:bg-blue-50' 
                        : 'bg-gray-50 hover:bg-blue-50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <input 
                      type="checkbox" 
                      className={`rounded border-gray-300 focus:ring-primaryLight ${
                        isOrderStatusBlocked(order.status) 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-primaryLight cursor-pointer'
                      }`}
                      checked={selectedOrderIdForSales === order.id}
                      disabled={isOrderStatusBlocked(order.status)}
                      title={isOrderStatusBlocked(order.status) 
                        ? `Cannot select order with status: ${order.status}` 
                        : 'Select order for sales operations'
                      }
                      onChange={(e) => {
                        // Prevent selection of orders with blocked statuses
                        if (isOrderStatusBlocked(order.status)) {
                          return;
                        }
                        setSelectedOrderIdForSales(e.target.checked ? order.id : null);
                      }}
                    />
                  </td>
                  <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-700">{getOrderTypeDisplay(order.order_type)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="text-sm font-medium text-primary underline hover:text-primaryDark"
                      onClick={() => openInvoiceForOrder(order)}
                    >
                      ORD-{order.id}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-700">{order.id}</span>
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
                        {driverTableDisplay}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-800">{customerDisplay.name}</div>
                        <div className="text-xs text-gray-600">({customerDisplay.phone})</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                        {customerDisplay.address}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-semibold text-gray-800">€{order.total.toFixed(2)}</div>
                  </td>
                  <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
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
                  <span className="text-sm text-gray-600">{getOrderTypeDisplay(selectedOrder.order_type)}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedOrder.orderDate}, {selectedOrder.orderTime}</p>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800">Items</h3>
                {invoiceLoading ? (
                  <div className="text-sm text-gray-500">Loading items...</div>
                ) : (
                  <div className="space-y-2">
                    {orderDetails.length === 0 && (
                      <div className="text-sm text-gray-500">No items found for this order.</div>
                    )}
                    {orderDetails.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700">{item.food_name || 'Item'}</span>
                          <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">€{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment and Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                {/* Payment Details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Payment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-gray-800">{selectedOrder.payment_method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-800">€{(orderTotals?.grand_total ?? selectedOrder.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${selectedOrder.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                    {orderTotals && (
                      <div className="space-y-1 pt-2 border-t border-gray-100">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-800">€{Number(orderTotals.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Add-ons:</span>
                          <span className="text-gray-800">€{Number(orderTotals.total_addons || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxes:</span>
                          <span className="text-gray-800">€{Number(orderTotals.total_taxes || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discounts:</span>
                          <span className="text-gray-800">-€{Number(orderTotals.total_discounts || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-800">Grand Total:</span>
                          <span className="text-gray-800">€{Number(orderTotals.grand_total || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-800">Customer</h3>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-800 font-medium">{getCustomerDisplay(selectedOrder).name}</div>
                    <div className="text-gray-600">{getCustomerDisplay(selectedOrder).phone}</div>
                    <div className="text-gray-400">{getCustomerDisplay(selectedOrder).address}</div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-800">Current Status</h3>
                <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
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

      {/* Update Order Status Modal */}
      {showUpdateStatusModal && selectedOrderForStatus && (
        <UpdateOrderStatus
          isOpen={showUpdateStatusModal}
          onClose={closeUpdateStatusModal}
          order={selectedOrderForStatus}
          onStatusUpdate={handleStatusUpdate}
          onRiderAssignment={() => {
            closeUpdateStatusModal();
            // Open the rider assignment modal for delivery orders
            setSelectedOrderForRider(selectedOrderForStatus);
            setShowAssignRiderModal(true);
          }}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          isUpdating={isUpdatingStatus}
        />
      )}

      {/* Assign Rider Modal */}
      {showAssignRiderModal && selectedOrderForRider && (
        <AssignRider
          isOpen={showAssignRiderModal}
          onClose={closeAssignRiderModal}
          onBack={closeAssignRiderModal}
          order={selectedOrderForRider}
          onAssignRider={handleAssignRider}
          onStatusUpdate={handleStatusUpdate}
        />
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