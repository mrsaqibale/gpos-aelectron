import React, { useState, useEffect } from 'react';
import { Edit, Plus, X, Trash2, Eye, EyeOff, Upload, Users, ChevronDown, Filter, Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  // Sample sorting options
  const sortingOptions = [
    { value: 'loyal_customers', label: 'Loyal Customers' },
    { value: 'impulse_customers', label: 'Impulse Customers' },
    { value: 'discount_customer', label: 'Discount Customers' }
  ];

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
      isActive: true
    },
    {
      id: 2,
      name: 'Selena Connor',
      email: 'selenaconnor@gmail.com',
      phone: '0881234567',
      totalOrders: 3,
      totalAmount: 2387.55,
      joiningDate: '2025-05-24',
      isActive: true
    },
    {
      id: 3,
      name: 'john dolan',
      email: 'dolan.john28@gmail.com',
      phone: '0894562363',
      totalOrders: 2,
      totalAmount: 85.50,
      joiningDate: '2025-06-28',
      isActive: true
    },
    {
      id: 4,
      name: 'James Donald',
      email: 'jamesdonald@gmail.com',
      phone: '0862294367',
      totalOrders: 1,
      totalAmount: 35.49,
      joiningDate: '2025-06-11',
      isActive: true
    },
    {
      id: 5,
      name: 'Stephen Fahy',
      email: 'fahystephen47@gmail.com',
      phone: '0877005711',
      totalOrders: 1,
      totalAmount: 25.94,
      joiningDate: '2025-06-13',
      isActive: true
    },
    {
      id: 6,
      name: 'Marie Johnston',
      email: 'mariecgillane@gmail.com',
      phone: '0834004467',
      totalOrders: 1,
      totalAmount: 44.57,
      joiningDate: '2025-06-13',
      isActive: true
    },
    {
      id: 7,
      name: 'Michael O\'Connor',
      email: 'michael.oconnor@email.com',
      phone: '0861234567',
      totalOrders: 5,
      totalAmount: 320.80,
      joiningDate: '2025-05-15',
      isActive: true
    },
    {
      id: 8,
      name: 'Sarah Walsh',
      email: 'sarah.walsh@email.com',
      phone: '0879876543',
      totalOrders: 2,
      totalAmount: 156.25,
      joiningDate: '2025-06-05',
      isActive: false
    },
    {
      id: 9,
      name: 'David Murphy',
      email: 'david.murphy@email.com',
      phone: '0854567890',
      totalOrders: 8,
      totalAmount: 892.30,
      joiningDate: '2025-04-20',
      isActive: true
    },
    {
      id: 10,
      name: 'Emma Ryan',
      email: 'emma.ryan@email.com',
      phone: '0831234567',
      totalOrders: 3,
      totalAmount: 245.60,
      joiningDate: '2025-06-10',
      isActive: true
    },
    {
      id: 11,
      name: 'James Byrne',
      email: 'james.byrne@email.com',
      phone: '0867890123',
      totalOrders: 1,
      totalAmount: 67.89,
      joiningDate: '2025-06-25',
      isActive: true
    },
    {
      id: 12,
      name: 'Lisa Kelly',
      email: 'lisa.kelly@email.com',
      phone: '0874567890',
      totalOrders: 6,
      totalAmount: 456.78,
      joiningDate: '2025-05-08',
      isActive: true
    },
    {
      id: 13,
      name: 'Patrick O\'Sullivan',
      email: 'patrick.osullivan@email.com',
      phone: '0851234567',
      totalOrders: 4,
      totalAmount: 234.56,
      joiningDate: '2025-06-18',
      isActive: false
    },
    {
      id: 14,
      name: 'Aoife McCarthy',
      email: 'aoife.mccarthy@email.com',
      phone: '0869876543',
      totalOrders: 2,
      totalAmount: 123.45,
      joiningDate: '2025-06-22',
      isActive: true
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
            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={orderStartDate}
                  onChange={(e) => setOrderStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
              
              {/* End Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={orderEndDate}
                  onChange={(e) => setOrderEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
                    <button className="p-1 text-gray-400 hover:text-primary transition-colors">
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