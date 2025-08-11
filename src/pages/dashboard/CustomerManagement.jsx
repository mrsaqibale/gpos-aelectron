import React, { useState, useEffect } from 'react';
import { Edit, Plus, X, Trash2, Eye, EyeOff, Upload, Users, ChevronDown, Filter } from 'lucide-react';
import VirtualKeyboard from '../../components/VirtualKeyboard';

const CustomerManagement = () => {
  // State for filters
  const [orderStartDate, setOrderStartDate] = useState('');
  const [orderEndDate, setOrderEndDate] = useState('');
  const [customerJoiningDate, setCustomerJoiningDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [chooseFirst, setChooseFirst] = useState('');



  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  // Sample sorting options
  const sortingOptions = [
    { value: 'loyal_customers', label: 'Loyal Customers' },
    { value: 'impulse_customers', label: 'Impulse Customers' },
    { value: 'discount_customer', label: 'Discount Customers' }
  ];



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

        {/* Apply Filters Button */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              // Handle filter application
              console.log('Applying filters:', {
                orderStartDate,
                orderEndDate,
                customerJoiningDate,
                sortBy,
                chooseFirst
              });
            }}
            className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Filter size={16} />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Customer List Placeholder */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="text-center py-12">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Customer List</h3>
          <p className="text-sm text-gray-500">
            Customer data will be displayed here based on the selected filters.
          </p>
        </div>
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