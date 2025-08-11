import React, { useState, useEffect } from 'react';
import { Edit, Plus, X, Trash2, Eye, EyeOff, Upload, Users, ChevronDown, Filter, Search, Download, ChevronLeft, ChevronRight, Mail, Phone, ShoppingBag, Home, Printer } from 'lucide-react';
import VirtualKeyboard from '../../components/VirtualKeyboard';

const CustomerManagement = () => {
  // State for filters
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [customerJoiningDate, setCustomerJoiningDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [chooseFirst, setChooseFirst] = useState('');

  // Customer list state
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(7);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  // Sample sorting options
  const sortingOptions = [
    { value: 'loyal_customers', label: 'Loyal Customers' },
    { value: 'impulse_customers', label: 'Impulse Customers' },
    { value: 'discount_customer', label: 'Discount Customers' }
  ];

  // Generate dummy orders for each customer based on their total orders
  const generateCustomerOrders = (customerId, totalOrders, totalAmount) => {
    const orders = [];
    const baseOrderId = 100000 + (customerId * 10);
    const averageOrderAmount = totalAmount / totalOrders;
    
    for (let i = 0; i < totalOrders; i++) {
      // Vary the order amount slightly around the average
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const orderAmount = Math.max(5, averageOrderAmount * (1 + variation));
      
      orders.push({
        id: (baseOrderId + i).toString(),
        status: 'Confirmed',
        totalAmount: parseFloat(orderAmount.toFixed(2)),
        date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Random date within last 90 days
      });
    }
    
    return orders.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
  };

  // Dummy customer data
  const dummyCustomers = [
    {
      id: 1,
      name: 'Laura',
      email: 'Lbcarew@gmail.com',
      phone: '0871601656',
      totalOrders: 4,
      totalAmount: 100.70,
      joiningDate: '2025-06-21',
      isActive: true,
      address: 'Windmill, Cashel, Co. Tipperary, E25 YK57, Ireland'
    },
    {
      id: 2,
      name: 'Selena Connor',
      email: 'selenaconnor@gmail.com',
      phone: '0881234567',
      totalOrders: 3,
      totalAmount: 2387.55,
      joiningDate: '2025-05-24',
      isActive: true,
      address: 'Main Street, Dublin, Co. Dublin, D01 AB12, Ireland'
    },
    {
      id: 3,
      name: 'john dolan',
      email: 'dolan.john28@gmail.com',
      phone: '0894562363',
      totalOrders: 2,
      totalAmount: 85.50,
      joiningDate: '2025-06-28',
      isActive: true,
      address: 'Oak Avenue, Cork, Co. Cork, T12 CD34, Ireland'
    },
    {
      id: 4,
      name: 'James Donald',
      email: 'jamesdonald@gmail.com',
      phone: '0862294367',
      totalOrders: 1,
      totalAmount: 35.49,
      joiningDate: '2025-06-11',
      isActive: true,
      address: 'River Road, Galway, Co. Galway, H91 EF56, Ireland'
    },
    {
      id: 5,
      name: 'Stephen Fahy',
      email: 'fahystephen47@gmail.com',
      phone: '0877005711',
      totalOrders: 1,
      totalAmount: 25.94,
      joiningDate: '2025-06-13',
      isActive: true,
      address: 'Hill Street, Limerick, Co. Limerick, V94 GH78, Ireland'
    },
    {
      id: 6,
      name: 'Marie Johnston',
      email: 'mariecgillane@gmail.com',
      phone: '0834004467',
      totalOrders: 1,
      totalAmount: 44.57,
      joiningDate: '2025-06-13',
      isActive: true,
      address: 'Park Lane, Waterford, Co. Waterford, X91 IJ90, Ireland'
    },
    {
      id: 7,
      name: 'Michael O\'Connor',
      email: 'michael.oconnor@email.com',
      phone: '0861234567',
      totalOrders: 5,
      totalAmount: 320.80,
      joiningDate: '2025-05-15',
      isActive: true,
      address: 'Church Street, Kilkenny, Co. Kilkenny, R95 KL12, Ireland'
    },
    {
      id: 8,
      name: 'Sarah Walsh',
      email: 'sarah.walsh@email.com',
      phone: '0879876543',
      totalOrders: 2,
      totalAmount: 156.25,
      joiningDate: '2025-06-05',
      isActive: false,
      address: 'Bridge Street, Wexford, Co. Wexford, Y35 MN34, Ireland'
    },
    {
      id: 9,
      name: 'David Murphy',
      email: 'david.murphy@email.com',
      phone: '0854567890',
      totalOrders: 8,
      totalAmount: 892.30,
      joiningDate: '2025-04-20',
      isActive: true,
      address: 'High Street, Sligo, Co. Sligo, F91 PQ56, Ireland'
    },
    {
      id: 10,
      name: 'Emma Ryan',
      email: 'emma.ryan@email.com',
      phone: '0831234567',
      totalOrders: 3,
      totalAmount: 245.60,
      joiningDate: '2025-06-10',
      isActive: true,
      address: 'Queen Street, Derry, Co. Derry, BT48 RS78, Ireland'
    },
    {
      id: 11,
      name: 'James Byrne',
      email: 'james.byrne@email.com',
      phone: '0867890123',
      totalOrders: 1,
      totalAmount: 67.89,
      joiningDate: '2025-06-25',
      isActive: true,
      address: 'King Street, Belfast, Co. Antrim, BT1 TU90, Ireland'
    },
    {
      id: 12,
      name: 'Lisa Kelly',
      email: 'lisa.kelly@email.com',
      phone: '0874567890',
      totalOrders: 6,
      totalAmount: 456.78,
      joiningDate: '2025-05-08',
      isActive: true,
      address: 'Castle Street, Armagh, Co. Armagh, BT61 VW12, Ireland'
    },
    {
      id: 13,
      name: 'Patrick O\'Sullivan',
      email: 'patrick.osullivan@email.com',
      phone: '0851234567',
      totalOrders: 4,
      totalAmount: 234.56,
      joiningDate: '2025-06-18',
      isActive: false,
      address: 'Market Square, Tralee, Co. Kerry, V92 XY34, Ireland'
    },
    {
      id: 14,
      name: 'Aoife McCarthy',
      email: 'aoife.mccarthy@email.com',
      phone: '0869876543',
      totalOrders: 2,
      totalAmount: 123.45,
      joiningDate: '2025-06-22',
      isActive: true,
      address: 'Harbour Road, Drogheda, Co. Louth, A92 ZA56, Ireland'
    }
  ];

  // Initialize customers data
  useEffect(() => {
    setCustomers(dummyCustomers);
    setFilteredCustomers(dummyCustomers);
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, customers]);

  // Get current customers for pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

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
  const handleStatusToggle = (customerId) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer =>
        customer.id === customerId
          ? { ...customer, isActive: !customer.isActive }
          : customer
      )
    );
  };

  // Handle modal open
  const handleModalOpen = (customer) => {
    console.log('Opening modal for customer:', customer);
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };


  // Handle keyboard input
  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
    setShowKeyboard(true);
  };

  const handleInputBlur = (e) => {
    // Check if the focus is moving to a keyboard element
    if (e.relatedTarget && e.relatedTarget.closest('.hg-theme-default')) {
      return;
    }
    
    // Small delay to allow keyboard interactions to complete
    setTimeout(() => {
      setShowKeyboard(false);
      setActiveInput('');
    }, 300);
  };

  const handleAnyInputFocus = (e, inputName) => {
    handleInputFocus(inputName);
  };

  const handleAnyInputClick = (e, inputName) => {
    if (!showKeyboard || activeInput !== inputName) {
      handleInputFocus(inputName);
    }
  };

  const onKeyboardChange = (input, inputName) => {
    if (inputName === 'chooseFirst') {
      setChooseFirst(input);
    }
  };

  const handleKeyboardClose = () => {
    setShowKeyboard(false);
    setActiveInput('');
  };



  // Handle number input change
  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
    setChooseFirst(value);
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Date
            </label>
            <div className="grid grid-cols-2 gap-4 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 ">Start Date</label>
                <input
                  type="date"
                  value={orderStartDate}
                  onChange={(e) => setOrderStartDate(e.target.value)}
                />
              </div>
              
              {/* End Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 ">End Date</label>
                <input
                  type="date"
                  value={orderEndDate}
                  onChange={(e) => setOrderEndDate(e.target.value)}
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
                <option value="">Select Customer Sorting Order</option>
                {sortingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Choose First Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose First
            </label>
            <input
              type="text"
              name="chooseFirst"
              placeholder="Ex : 100"
              value={chooseFirst}
              onChange={handleNumberChange}
              onFocus={() => handleAnyInputFocus(null, 'chooseFirst')}
              onBlur={handleInputBlur}
              onClick={() => handleAnyInputClick(null, 'chooseFirst')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>
        </div>

        
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* Header with search and export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Customer list</h3>
            <span className="text-sm text-gray-500">({filteredCustomers.length} customers)</span>
          </div>
          <div className="flex items-center gap-3">
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
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Active/Inactive</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentCustomers.map((customer, index) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {indexOfFirstCustomer + index + 1}
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
                    {customer.totalAmount.toFixed(2)} €
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatDate(customer.joiningDate)}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleStatusToggle(customer.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        customer.isActive ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          customer.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstCustomer + 1} to {Math.min(indexOfLastCustomer, filteredCustomers.length)} of {filteredCustomers.length} customers
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
                       {generateCustomerOrders(selectedCustomer.id, selectedCustomer.totalOrders, selectedCustomer.totalAmount).map((order, index) => (
                         <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                           <td className="py-3 px-4 text-sm text-gray-600">
                             {index + 1}
                           </td>
                           <td className="py-3 px-4">
                             <span className="text-primary font-medium cursor-pointer hover:underline">
                               {order.id}
                             </span>
                           </td>
                           <td className="py-3 px-4">
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                               {order.status}
                             </span>
                           </td>
                           <td className="py-3 px-4 text-sm font-medium text-gray-800">
                             {order.totalAmount.toFixed(2)} €
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
                       ))}
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

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={handleKeyboardClose}
        activeInput={activeInput}
        onInputChange={onKeyboardChange}
        onInputBlur={handleInputBlur}
        inputValue={chooseFirst || ''}
        placeholder="Type here..."
      />


    </div>
  );
};

export default CustomerManagement;