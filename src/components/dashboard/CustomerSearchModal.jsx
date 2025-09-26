import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Edit, Plus, RefreshCw, Eye } from 'lucide-react';
import VirtualKeyboard from '../VirtualKeyboard';
import CustomAlert from '../CustomAlert';

const CustomerSearchModal = ({ isOpen, onClose, onCustomerSelect, onEditCustomer, onNewCustomer, orderType }) => {
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // CustomAlert state
  const [alertState, setAlertState] = useState({
    isVisible: false,
    message: '',
    type: 'error'
  });

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const result = await window.myAPI?.getCustomersByHotelId(1);
      if (result && result.success) {
        setCustomers(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh customer list when a customer is updated
  const refreshCustomerList = useCallback(async () => {
    if (customers.length > 0) {
      // If we have customers in the list, refresh them
      await fetchCustomers();
    }
  }, [customers.length]);

  // Function to update a specific customer in the list
  const updateCustomerInList = useCallback((updatedCustomer) => {
    console.log('Updating customer in list:', updatedCustomer);
    
    setCustomers(prevCustomers => {
      const customerExists = prevCustomers.some(customer => customer.id === updatedCustomer.id);
      if (customerExists) {
        return prevCustomers.map(customer => 
          customer.id === updatedCustomer.id ? updatedCustomer : customer
        );
      }
      return prevCustomers;
    });
    
    setFilteredCustomers(prevFiltered => {
      const customerExists = prevFiltered.some(customer => customer.id === updatedCustomer.id);
      if (customerExists) {
        return prevFiltered.map(customer => 
          customer.id === updatedCustomer.id ? updatedCustomer : customer
        );
      }
      return prevFiltered;
    });
    
    // Update selected customer if it's the one being edited
    if (selectedCustomer && selectedCustomer.id === updatedCustomer.id) {
      setSelectedCustomer(updatedCustomer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (isOpen) {
      // Don't fetch all customers by default
      setCustomers([]);
      setFilteredCustomers([]);
      setHasSearched(false);
      setSearchName('');
      setSearchPhone('');
      setSearchEmail('');
      setSelectedCustomer(null);
    }
  }, [isOpen]);

  // Listen for customer update events
  useEffect(() => {
    const handleCustomerUpdate = (event) => {
      console.log('Customer updated event received:', event.detail);
      const updatedCustomer = event.detail.customer;
      
      if (updatedCustomer) {
        // Update the specific customer in the list
        updateCustomerInList(updatedCustomer);
      }
    };

    // Add event listener for customer updates
    window.addEventListener('customerUpdated', handleCustomerUpdate);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('customerUpdated', handleCustomerUpdate);
    };
  }, [updateCustomerInList]);

  // Remove filterCustomers function since we're using direct search

  const handleSearch = async () => {
    if (!searchName.trim() && !searchPhone.trim()) {
      alert('Please enter either a name or phone number to search');
      return;
    }
    
    setLoading(true);
    setHasSearched(true);
    
    // Hide keyboard when searching
    setShowKeyboard(false);
    setActiveInput('');
    
    try {
      let allCustomers = [];
      
      // If name is entered, search by name
      if (searchName.trim()) {
        console.log('Searching by name:', searchName.trim());
        const nameResult = await window.myAPI?.searchCustomerByName(searchName.trim());
        console.log('Name search result:', nameResult);
        if (nameResult && nameResult.success && nameResult.data) {
          allCustomers = [...allCustomers, ...nameResult.data];
        }
      }
      
      // If phone is entered, search by phone
      if (searchPhone.trim()) {
        const phoneResult = await window.myAPI?.searchCustomerByPhone(searchPhone.trim());
        if (phoneResult && phoneResult.success && phoneResult.data) {
          allCustomers = [...allCustomers, ...phoneResult.data];
        }
      }
      
      // Remove duplicates based on customer ID
      const uniqueCustomers = allCustomers.filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      );
      
      console.log('All customers found:', allCustomers.length);
      console.log('Unique customers:', uniqueCustomers.length);
      
      if (uniqueCustomers.length > 0) {
        // Fetch addresses for each unique customer found
        const customersWithAddresses = await Promise.all(
          uniqueCustomers.map(async (customer) => {
            try {
              const addressResult = await window.myAPI?.getCustomerAddresses(customer.id);
              if (addressResult && addressResult.success) {
                return {
                  ...customer,
                  addresses: addressResult.data || []
                };
              }
              return customer;
            } catch (error) {
              console.error('Error fetching addresses for customer:', customer.id, error);
              return customer;
            }
          })
        );
        
        setCustomers(customersWithAddresses);
        setFilteredCustomers(customersWithAddresses);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const showAlert = useCallback((message, type = 'error') => {
    setAlertState({
      isVisible: true,
      message,
      type
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState({
      isVisible: false,
      message: '',
      type: 'error'
    });
  }, []);

  const handleSave = () => {
    if (selectedCustomer && onCustomerSelect) {
      // Check phone number for Collection and Delivery orders
      if ((orderType === 'Collection' || orderType === 'Delivery') && (!selectedCustomer.phone || selectedCustomer.phone.trim().length === 0)) {
        // Open edit customer modal instead of showing error
        if (onEditCustomer) {
          onEditCustomer(selectedCustomer);
        }
        return;
      }
      
      onCustomerSelect(selectedCustomer);
      onClose();
    }
  };

  const handleReset = () => {
    setSearchName('');
    setSearchPhone('');
    setSearchEmail('');
    setCustomers([]);
    setFilteredCustomers([]);
    setSelectedCustomer(null);
    setHasSearched(false);
  };

  // Keyboard event handlers
  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
    if (inputName === 'searchName') {
      setKeyboardInput(searchName || '');
    } else if (inputName === 'searchPhone') {
      setKeyboardInput(searchPhone || '');
    }
    setShowKeyboard(true);
  };

  const handleInputBlur = (e) => {
    // Small delay to allow keyboard interactions to complete
    setTimeout(() => {
      setShowKeyboard(false);
      setActiveInput('');
      setKeyboardInput('');
    }, 300);
  };

  // Auto-show keyboard for any input focus
  const handleAnyInputFocus = (e, inputName) => {
    handleInputFocus(inputName);
  };

  // Auto-show keyboard for any input click
  const handleAnyInputClick = (e, inputName) => {
    if (!showKeyboard || activeInput !== inputName) {
      handleInputFocus(inputName);
    }
  };

  const onKeyboardChange = (input, inputName) => {
    setKeyboardInput(input);
    
    // Update the corresponding form field
    if (inputName === 'searchName') {
      setSearchName(input);
    } else if (inputName === 'searchPhone') {
      setSearchPhone(input);
    }
  };

  // Handle regular input changes (when typing directly)
  const handleInputChange = (e, fieldName) => {
    const value = e.target.value;
    if (fieldName === 'searchName') {
      setSearchName(value);
      // Update keyboard input if keyboard is active for this field
      if (activeInput === 'searchName') {
        setKeyboardInput(value);
      }
    } else if (fieldName === 'searchPhone') {
      setSearchPhone(value);
      // Update keyboard input if keyboard is active for this field
      if (activeInput === 'searchPhone') {
        setKeyboardInput(value);
      }
    } else if (fieldName === 'searchEmail') {
      setSearchEmail(value);
      // Update keyboard input if keyboard is active for this field
      if (activeInput === 'searchEmail') {
        setKeyboardInput(value);
      }
    }
  };

  const onKeyboardKeyPress = (button) => {
    if (button === '{enter}') {
      // Move to next input field or submit search
      if (activeInput === 'searchName') {
        const phoneInput = document.querySelector('[name="searchPhone"]');
        if (phoneInput) {
          phoneInput.focus();
        }
      } else if (activeInput === 'searchPhone') {
        // Submit search when pressing enter on phone field
        handleSearch();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h2 className="text-xl font-bold">Customer List</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-primary p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Search</h3>
          <div className="grid grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone:
              </label>
              <input
                type="text"
                name="searchPhone"
                value={searchPhone}
                onChange={(e) => handleInputChange(e, 'searchPhone')}
                onFocus={(e) => handleAnyInputFocus(e, 'searchPhone')}
                onBlur={handleInputBlur}
                onClick={(e) => handleAnyInputClick(e, 'searchPhone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="-"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name:
              </label>
              <input
                type="text"
                name="searchName"
                value={searchName}
                onChange={(e) => handleInputChange(e, 'searchName')}
                onFocus={(e) => handleAnyInputFocus(e, 'searchName')}
                onBlur={handleInputBlur}
                onClick={(e) => handleAnyInputClick(e, 'searchName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email:
              </label>
              <input
                type="text"
                name="searchEmail"
                value={searchEmail}
                onChange={(e) => handleInputChange(e, 'searchEmail')}
                onFocus={(e) => handleAnyInputFocus(e, 'searchEmail')}
                onBlur={handleInputBlur}
                onClick={(e) => handleAnyInputClick(e, 'searchEmail')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Enter email"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-3 bg-[#16A34A] text-white rounded-md hover:bg-[#16A34A]/90 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="pb-6 pl-6 pr-6 border-b border-gray-200">
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                if (selectedCustomer && window) {
                  window.dispatchEvent(new CustomEvent('openCustomerInfo', { detail: { customer: selectedCustomer } }));
                }
              }}
              disabled={!selectedCustomer}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedCustomer 
                  ? 'bg-[#007BFF] text-white hover:bg-[#007BFF]/90 focus:ring-[#007BFF]' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Eye size={16} />
              View
            </button>
            <button
              onClick={() => {
                if (onNewCustomer) {
                  onNewCustomer();
                  // Don't close the modal - let the New Customer modal appear on top
                }
              }}
              className="flex-1 px-4 py-2 bg-[#007BFF] text-white rounded-md hover:bg-[#007BFF]/90 focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Create
            </button>
            <button
              onClick={() => {
                if (selectedCustomer && onEditCustomer) {
                  onEditCustomer(selectedCustomer);
                  // Don't close the modal - let the Edit Customer modal appear on top
                }
              }}
              disabled={!selectedCustomer}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedCustomer 
                  ? 'bg-[#007BFF] text-white hover:bg-[#007BFF]/90 focus:ring-[#007BFF]' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Customer Table */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Count
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loyal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          Loading customers...
                        </td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          {!hasSearched 
                            ? 'Enter name, phone, or email to search customers' 
                            : 'No customers found'}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr 
                          key={customer.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="customerSelect"
                              checked={selectedCustomer?.id === customer.id}
                              onChange={() => handleCustomerSelect(customer)}
                              className="text-primary focus:ring-primary border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {customer.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {customer.phone || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {customer.orderCount || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="flex flex-col gap-1">
                              {customer.addresses && customer.addresses.length > 0 ? (
                                customer.addresses.map((addr, index) => (
                                  <div key={index} className="text-xs">
                                    {addr.address}
                                    {addr.code && ` (${addr.code})`}
                                  </div>
                                ))
                              ) : (
                                <span>No addresses</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {customer.isLoyal ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                YES
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                NO
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Always visible at bottom */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedCustomer}
            className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
              selectedCustomer 
                ? 'bg-primary hover:bg-primary/90' 
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>

      {/* Virtual Keyboard - Always visible when needed */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        activeInput={activeInput}
        onInputChange={onKeyboardChange}
        onInputBlur={handleInputBlur}
        inputValue={keyboardInput}
        onKeyPress={onKeyboardKeyPress}
      />

      {/* Custom Alert */}
      <CustomAlert
        message={alertState.message}
        isVisible={alertState.isVisible}
        onClose={hideAlert}
        type={alertState.type}
        duration={3000}
      />
    </div>
  );
};

export default CustomerSearchModal; 