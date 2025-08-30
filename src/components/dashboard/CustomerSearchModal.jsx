import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import VirtualKeyboard from '../VirtualKeyboard';

const CustomerSearchModal = ({ isOpen, onClose, onCustomerSelect }) => {
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Don't fetch all customers by default
      setCustomers([]);
      setFilteredCustomers([]);
      setHasSearched(false);
    }
  }, [isOpen]);

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

  const handleSave = () => {
    if (selectedCustomer && onCustomerSelect) {
      onCustomerSelect(selectedCustomer);
      onClose();
    }
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
          <h2 className="text-xl font-bold">Search Customer</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-primary p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name
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
                Search by Phone
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
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Search
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
                        Addresses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          Loading customers...
                        </td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          {!hasSearched 
                            ? 'Enter name or phone to search customers' 
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
    </div>
  );
};

export default CustomerSearchModal; 