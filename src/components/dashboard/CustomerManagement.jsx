import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const CustomerManagement = ({ isOpen, onClose, onCustomerSelect, editingCustomer }) => {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    isloyal: false
  });
  const [addresses, setAddresses] = useState([
    { address: '', eircode: '' }
  ]);
  const [errors, setErrors] = useState({});

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');
  const [capsLock, setCapsLock] = useState(false);

  // Update keyboard layout when caps lock changes
  useEffect(() => {
    if (window.keyboard && showKeyboard) {
      window.keyboard.setOptions({
        layoutName: capsLock ? "shift" : "default"
      });
    }
  }, [capsLock, showKeyboard]);

  useEffect(() => {
    if (isOpen) {
      if (editingCustomer) {
        // Pre-fill form for editing
        setNewCustomer({
          name: editingCustomer.name || '',
          phone: editingCustomer.phone || '',
          email: editingCustomer.email || '',
          isloyal: editingCustomer.isloyal || false
        });
        // Set addresses for editing
        if (editingCustomer.addresses && editingCustomer.addresses.length > 0) {
          setAddresses(editingCustomer.addresses.map(addr => ({
            id: addr.id, // Keep the ID for existing addresses
            address: addr.address || '',
            eircode: addr.code || ''
          })));
        } else {
          setAddresses([{ address: '', eircode: '' }]);
        }
      } else {
        // Reset form for new customer
        setNewCustomer({
          name: '',
          phone: '',
          email: '',
          isloyal: false
        });
        setAddresses([{ address: '', eircode: '' }]);
      }
      setErrors({});
    }
  }, [isOpen, editingCustomer]);

  // Keyboard event handlers
  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
    if (inputName.startsWith('address_')) {
      // Handle address fields
      const [field, index, subField] = inputName.split('_');
      const addressIndex = parseInt(index);
      const address = addresses[addressIndex];
      if (address && subField) {
        setKeyboardInput(address[subField] || '');
      }
    } else {
      // Handle customer fields
      setKeyboardInput(newCustomer[inputName] || '');
    }
    setShowKeyboard(true);
    
    // Ensure keyboard layout matches caps lock state
    setTimeout(() => {
      if (window.keyboard) {
        window.keyboard.setOptions({
          layoutName: capsLock ? "shift" : "default"
        });
      }
    }, 100);
  };

  const handleInputBlur = (e) => {
    // Check if the focus is moving to a keyboard element
    if (e.relatedTarget && e.relatedTarget.closest('.hg-theme-default')) {
      return; // Don't hide keyboard if focus moved to keyboard
    }
    
    // Also check if the click target is within the keyboard
    if (e.target && e.target.closest('.hg-theme-default')) {
      return; // Don't hide keyboard if clicking within keyboard
    }
    
    // Small delay to allow keyboard interactions to complete
    setTimeout(() => {
      setShowKeyboard(false);
      setActiveInput('');
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

  const onKeyboardChange = (input) => {
    setKeyboardInput(input);
    
    // Update the corresponding form field
    if (activeInput.startsWith('address_')) {
      // Handle address fields
      const [field, index, subField] = activeInput.split('_');
      const addressIndex = parseInt(index);
      if (subField) {
        handleAddressChange(addressIndex, subField, input);
      }
    } else if (activeInput) {
      // Handle customer fields
      setNewCustomer(prev => ({
        ...prev,
        [activeInput]: input
      }));
    }
  };

  const onKeyboardChangeAll = (inputs) => {
    setKeyboardInput(inputs[activeInput] || '');
  };

  const onKeyboardKeyPress = (button) => {
    if (button === '{enter}') {
      // Move to next input field
      const inputFields = ['name', 'phone', 'email'];
      const currentIndex = inputFields.indexOf(activeInput);
      if (currentIndex < inputFields.length - 1) {
        const nextField = inputFields[currentIndex + 1];
        const nextInput = document.querySelector(`[name="${nextField}"]`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else if (button === '{lock}') {
      // Toggle caps lock
      setCapsLock(!capsLock);
      // Force keyboard to update layout
      if (window.keyboard) {
        window.keyboard.setOptions({
          layoutName: !capsLock ? "shift" : "default"
        });
      }
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Update keyboard input when typing directly
    if (activeInput === name) {
      setKeyboardInput(value);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddressChange = (index, field, value) => {
    setAddresses(prev => 
      prev.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    );
    
    // Update keyboard input when typing directly in address fields
    if (activeInput === `address_${index}_${field}`) {
      setKeyboardInput(value);
    }
  };

  const addAddress = () => {
    setAddresses(prev => [...prev, { address: '', eircode: '' }]);
  };

  const removeAddress = (index) => {
    if (addresses.length > 1) {
      setAddresses(prev => prev.filter((_, i) => i !== index));
    }
  };

  const deleteAddress = async (addressId) => {
    if (!addressId) return; // Don't delete if no ID (new address)
    
    try {
      const result = await window.myAPI?.deleteAddress(addressId);
      if (result && result.success) {
        // Remove from local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      } else {
        alert('Error deleting address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Error deleting address');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newCustomer.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!newCustomer.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (newCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingCustomer) {
        // Update existing customer
        const customerData = {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim() || null,
          email: newCustomer.email.trim() || null,
          isloyal: newCustomer.isloyal ? 1 : 0,
          addedBy: 1,
          hotel_id: 1
        };
        
        const result = await window.myAPI?.updateCustomer(editingCustomer.id, customerData);
        if (result.success) {
          // Add new addresses if any
          const newAddresses = addresses
            .filter(addr => addr.address.trim() && !addr.id) // Only new addresses (no id)
            .map(addr => ({
              address: addr.address.trim(),
              code: addr.eircode.trim() || null,
              addedby: 1
            }));

          // Create new addresses
          for (const address of newAddresses) {
            await window.myAPI?.createAddress({
              customer_id: editingCustomer.id,
              ...address
            });
          }

          if (onCustomerSelect) {
            onCustomerSelect({
              id: editingCustomer.id,
              ...customerData,
              isloyal: newCustomer.isloyal
            });
          }
          onClose();
        } else {
          alert('Error updating customer: ' + result.message);
        }
      } else {
        // Filter out empty addresses
        const validAddresses = addresses
          .filter(addr => addr.address.trim())
          .map(addr => ({
            address: addr.address.trim(),
            code: addr.eircode.trim() || null,
            addedby: 1
          }));

        // Add new customer with addresses (no address in customer table)
        const customerData = {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim() || null,
          email: newCustomer.email.trim() || null,
          address: null, // No address in customer table
          isloyal: newCustomer.isloyal ? 1 : 0,
          addedBy: 1,
          hotel_id: 1
        };

        const result = await window.myAPI?.createCustomerWithAddresses({
          customer: customerData,
          addresses: validAddresses
        });
        
        if (result.success) {
          if (onCustomerSelect) {
            onCustomerSelect({
              id: result.customerId,
              name: customerData.name,
              phone: customerData.phone,
              email: customerData.email,
              isloyal: newCustomer.isloyal,
              addresses: validAddresses
            });
          }
          onClose();
        } else {
          alert('Error creating customer: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer');
    }
  };

  const handleReset = () => {
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      eircode: '',
      address: '',
      isloyal: false
    });
    setErrors({});
  };

  if (!isOpen) return null;

    return (
    <>
      <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
            <h2 className="text-xl font-bold">{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-primary p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X size={20} />
            </button>
          </div>

          {/* Customer Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name and Phone in one row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newCustomer.name}
                    onChange={handleInputChange}
                    onFocus={(e) => handleAnyInputFocus(e, 'name')}
                    onClick={(e) => handleAnyInputClick(e, 'name')}
                    onBlur={handleInputBlur}
                    className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleInputChange}
                    onFocus={(e) => handleAnyInputFocus(e, 'phone')}
                    onClick={(e) => handleAnyInputClick(e, 'phone')}
                    onBlur={handleInputBlur}
                    className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'email')}
                  onClick={(e) => handleAnyInputClick(e, 'email')}
                  onBlur={handleInputBlur}
                  className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Addresses Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Addresses
                  </label>
                  <button
                    type="button"
                    onClick={addAddress}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    + Add More Address
                  </button>
                </div>
                
                {addresses.map((address, index) => (
                  <div key={index} className="mb-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Address {index + 1} {address.id && '(Existing)'}
                      </span>
                      <div className="flex gap-2">
                        {address.id && (
                          <button
                            type="button"
                            onClick={() => deleteAddress(address.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        )}
                        {addresses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAddress(index)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Eircode
                        </label>
                        <input
                          type="text"
                          value={address.eircode}
                          onChange={(e) => handleAddressChange(index, 'eircode', e.target.value)}
                          onFocus={(e) => handleAnyInputFocus(e, `address_${index}_eircode`)}
                          onClick={(e) => handleAnyInputClick(e, `address_${index}_eircode`)}
                          onBlur={handleInputBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          placeholder="Eircode"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={address.address}
                          onChange={(e) => handleAddressChange(index, 'address', e.target.value)}
                          onFocus={(e) => handleAnyInputFocus(e, `address_${index}_address`)}
                          onClick={(e) => handleAnyInputClick(e, `address_${index}_address`)}
                          onBlur={handleInputBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          placeholder="Street, Apartment, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loyal Customer Toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="block text-sm font-medium text-gray-700">
                  Loyal Customer
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isloyal"
                    checked={newCustomer.isloyal}
                    onChange={handleInputChange}
                    className="sr-only"
                    id="loyal-toggle"
                  />
                  <label
                    htmlFor="loyal-toggle"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      newCustomer.isloyal ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newCustomer.isloyal ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {editingCustomer ? 'Update Customer' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard - Always visible when needed */}
      {showKeyboard && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-lg">
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-4">
                <label className="block text-xs font-medium text-gray-700">
                  Current Input: <span className="font-semibold text-primary">{activeInput}</span>
                </label>
                {capsLock && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md border border-yellow-200">
                    CAPS LOCK ON
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowKeyboard(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>
            
            <div 
              className="keyboard-container w-full" 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.preventDefault()}
            >
              <Keyboard
                keyboardRef={(r) => (window.keyboard = r)}
                input={keyboardInput}
                onChange={onKeyboardChange}
                onChangeAll={onKeyboardChangeAll}
                onKeyPress={onKeyboardKeyPress}
                theme="hg-theme-default"
                layoutName={capsLock ? "shift" : "default"}
                layout={{
                  default: [
                    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "{tab} q w e r t y u i o p [ ] \\",
                    "{lock} a s d f g h j k l ; ' {enter}",
                    "{shift} z x c v b n m , . / {shift}",
                    "{space}"
                  ],
                  shift: [
                    "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
                    "{tab} Q W E R T Y U I O P { } |",
                    "{lock} A S D F G H J K L : \" {enter}",
                    "{shift} Z X C V B N M < > ? {shift}",
                    "{space}"
                  ]
                }}
                display={{
                  "{bksp}": "⌫",
                  "{enter}": "↵",
                  "{shift}": "⇧",
                  "{lock}": capsLock ? "⇪ ON" : "⇪",
                  "{tab}": "⇥",
                  "{space}": "Space"
                }}
                physicalKeyboardHighlight={true}
                physicalKeyboardHighlightTextColor={"#000000"}
                physicalKeyboardHighlightBgColor={"#fff475"}
               />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerManagement; 