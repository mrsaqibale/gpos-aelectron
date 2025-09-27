import React, { useState, useEffect } from 'react';
import { Edit, Plus, X, Trash2, Eye, EyeOff, Upload, Users, ChevronDown, Filter, Search, Download, ChevronLeft, ChevronRight, Mail, Phone, ShoppingBag, Home, Printer } from 'lucide-react';

const CustomerManagement = () => {
  // State for filters
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [customerJoiningDate, setCustomerJoiningDate] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Customer list state
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage, setCustomersPerPage] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [updatingCustomer, setUpdatingCustomer] = useState(null); // Track which customer is being updated

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  // Updated sorting options
  const sortingOptions = [
    { value: 'loyal_customers', label: 'Loyal Customers' },
    { value: 'not_loyal_customers', label: 'Not Loyal Customers' },
    { value: 'max_orders_first', label: 'Maximum Orders' },
    { value: 'min_orders_first', label: 'Minimum Orders' }
  ];

  // Pagination options
  const paginationOptions = [10, 20, 30, 50, 100];


  // Load all customers from database (no pagination, we'll handle it on frontend)
  const loadCustomers = async (search = '') => {
    setLoading(true);
    try {
      let result;
      
      if (search.trim()) {
        // For search, we still use the search function but get more results
        result = await window.electronAPI.invoke('customer:searchWithOrderStats', search, 1, 1000, 0);
      } else {
        // Get all customers without pagination
        result = await window.electronAPI.invoke('customer:getWithOrderStats', 1, 1000, 0);
      }
      
      if (result.success) {
        setCustomers(result.data);
        // Apply frontend filtering
        applyFrontendFilters(result.data);
      } else {
        console.error('Failed to load customers:', result.message);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply frontend filtering and sorting
  const applyFrontendFilters = (customerData) => {
    let filtered = [...customerData];

    // Apply date filtering
    if (orderStartDate || orderEndDate || customerJoiningDate) {
      filtered = filtered.filter(customer => {
        // Check order date filtering
        if (orderStartDate || orderEndDate) {
          const lastOrderDate = new Date(customer.lastOrderDate);
          const startDate = orderStartDate ? new Date(orderStartDate) : null;
          const endDate = orderEndDate ? new Date(orderEndDate + ' 23:59:59') : null;
          
          if (startDate && lastOrderDate < startDate) return false;
          if (endDate && lastOrderDate > endDate) return false;
        }

        // Check customer joining date filtering
        if (customerJoiningDate) {
          const joiningDate = new Date(customer.joiningDate);
          const filterDate = new Date(customerJoiningDate);
          if (joiningDate.toDateString() !== filterDate.toDateString()) return false;
        }

        return true;
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'loyal_customers':
            return b.isloyal - a.isloyal; // Loyal customers first
          case 'not_loyal_customers':
            return a.isloyal - b.isloyal; // Non-loyal customers first
          case 'max_orders_first':
            return b.totalOrders - a.totalOrders; // Highest orders first
          case 'min_orders_first':
            return a.totalOrders - b.totalOrders; // Lowest orders first
          default:
            return 0;
        }
      });
    }

    setFilteredCustomers(filtered);
    setTotalCustomers(filtered.length);
  };

  // Load customer orders for modal
  const loadCustomerOrders = async (customerId) => {
    try {
      const result = await window.electronAPI.invoke('customer:getOrders', customerId, 50, 0);
      if (result.success) {
        setCustomerOrders(result.data);
      } else {
        console.error('Failed to load customer orders:', result.message);
        setCustomerOrders([]);
      }
    } catch (error) {
      console.error('Error loading customer orders:', error);
      setCustomerOrders([]);
    }
  };

  // Initialize customers data
  useEffect(() => {
    loadCustomers();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadCustomers(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle date filtering and sorting changes
  useEffect(() => {
    if (customers.length > 0) {
      applyFrontendFilters(customers);
      setCurrentPage(1);
    }
  }, [orderStartDate, orderEndDate, customerJoiningDate, sortBy, customers]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCustomers / customersPerPage);
  const indexOfFirstCustomer = (currentPage - 1) * customersPerPage + 1;
  const indexOfLastCustomer = Math.min(currentPage * customersPerPage, totalCustomers);
  
  // Get paginated customers for display
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * customersPerPage,
    currentPage * customersPerPage
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle customer status toggle
  const handleStatusToggle = async (customerId) => {
    try {
      console.log('Toggling loyalty for customer ID:', customerId);
      setUpdatingCustomer(customerId); // Set loading state
      
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        console.log('Current customer loyalty status:', customer.isloyal);
        const newLoyaltyStatus = !customer.isloyal;
        console.log('New loyalty status:', newLoyaltyStatus);
        
        // Optimistically update the UI immediately for smooth experience
        setCustomers(prevCustomers => 
          prevCustomers.map(c => 
            c.id === customerId 
              ? { ...c, isloyal: newLoyaltyStatus }
              : c
          )
        );
        
        const result = await window.electronAPI.invoke('customer:update', customerId, { isloyal: newLoyaltyStatus ? 1 : 0 });
        console.log('Update result:', result);
        
        if (result.success) {
          console.log('Successfully updated customer loyalty status');
          // No need to reload - UI is already updated optimistically
        } else {
          console.error('Failed to update customer status:', result.message);
          // Revert the optimistic update on failure
          setCustomers(prevCustomers => 
            prevCustomers.map(c => 
              c.id === customerId 
                ? { ...c, isloyal: customer.isloyal } // Revert to original state
                : c
            )
          );
          alert(`Failed to update customer status: ${result.message}`);
        }
      } else {
        console.error('Customer not found with ID:', customerId);
        alert('Customer not found');
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      // Revert the optimistic update on error
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setCustomers(prevCustomers => 
          prevCustomers.map(c => 
            c.id === customerId 
              ? { ...c, isloyal: customer.isloyal } // Revert to original state
              : c
          )
        );
      }
      alert(`Error updating customer status: ${error.message}`);
    } finally {
      setUpdatingCustomer(null); // Clear loading state
    }
  };

  // Handle modal open
  const handleModalOpen = async (customer) => {
    console.log('Opening modal for customer:', customer);
    setSelectedCustomer(customer);
    setShowModal(true);
    // Load customer orders when modal opens
    await loadCustomerOrders(customer.id);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-4 gap-6">
          
          {/* Order Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {/* Start Date */}
              <div>
                <input
                  type="date"
                  value={orderStartDate}
                  onChange={(e) => setOrderStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Start Date"
                />
              </div>
              
              {/* End Date */}
              <div>
                <input
                  type="date"
                  value={orderEndDate}
                  onChange={(e) => setOrderEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          {/* Customer Joining Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Joining Date
            </label>
            <input
              type="date"
              value={customerJoiningDate}
              onChange={(e) => setCustomerJoiningDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Sorting Order</option>
                {sortingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                // Clear all filters
                setOrderStartDate('');
                setOrderEndDate('');
                setCustomerJoiningDate('');
                setSortBy('');
                setSearchTerm('');
                setCurrentPage(1);
                // Load fresh data
                loadCustomers('');
              }}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* Header with search and export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Customer list</h3>
            <span className="text-sm text-gray-500">({totalCustomers} customers)</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Pagination Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={customersPerPage}
                onChange={(e) => {
                  setCustomersPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {paginationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            {/* Export Button */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
              <Download size={16} />
              Export
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">SI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Name
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Contact Information
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Total Order
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Total Order Amount
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Joining Date
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Loyal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    Loading customers...
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {indexOfFirstCustomer + index}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-800">{customer.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="text-gray-800">{customer.email}</div>
                      <div className="text-gray-500">{customer.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {customer.totalOrders}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800">
                      {parseFloat(customer.totalAmount || 0).toFixed(2)} €
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(customer.joiningDate)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleStatusToggle(customer.id)}
                      disabled={updatingCustomer === customer.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ease-in-out ${
                          customer.isloyal ? 'bg-primary' : 'bg-gray-300'
                      } ${updatingCustomer === customer.id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                    >
                      {updatingCustomer === customer.id ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                              customer.isloyal ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleModalOpen(customer)}
                      className="p-1 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstCustomer} to {indexOfLastCustomer} of {totalCustomers} customers
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Customer Details */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Customer Details</h3>
              <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel - Order List */}
              <div className="flex-1 p-6 border-r border-gray-200 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-800">Order List</h4>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {selectedCustomer.totalOrders}
                    </span>
                  </div>
                </div>
                
                
                {/* Order Table */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Sl
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Order Id
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Status
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Total Amount
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Action</th>
                      </tr>
                    </thead>
                                         <tbody>
                      {customerOrders.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-gray-500">
                            No orders found for this customer
                          </td>
                        </tr>
                      ) : (
                        customerOrders.map((order, index) => (
                         <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                           <td className="py-3 px-4 text-sm text-gray-600">
                             {index + 1}
                           </td>
                           <td className="py-3 px-4">
                             <span className="text-primary font-medium cursor-pointer hover:underline">
                                {order.order_number || order.id}
                             </span>
                           </td>
                           <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                order.order_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.order_status || 'Confirmed'}
                             </span>
                           </td>
                           <td className="py-3 px-4 text-sm font-medium text-gray-800">
                              {parseFloat(order.order_amount || 0).toFixed(2)} €
                           </td>
                           <td className="py-3 px-4">
                             <div className="flex gap-2">
                               <button className="p-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
                                 <Eye size={14} />
                               </button>
                               <button className="p-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
                                 <Printer size={14} />
                               </button>
                             </div>
                           </td>
                         </tr>
                        ))
                      )}
                     </tbody>
                  </table>
                </div>
              </div>
              
              {/* Right Panel - Customer Profile */}
              <div className="w-80 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  <Users size={20} className="text-primary" />
                  <h4 className="text-lg font-semibold text-gray-800">{selectedCustomer.name}</h4>
                </div>
                
                {/* Profile Picture Placeholder */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <span className="text-gray-400 text-2xl">📷</span>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedCustomer.totalOrders} Orders</span>
                  </div>
                </div>
                
                {/* Contact Info Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Contact info</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Home size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-800">{selectedCustomer.address || 'No address available'}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Home size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-800">{selectedCustomer.address || 'No address available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerManagement;