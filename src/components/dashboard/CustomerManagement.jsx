import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import VirtualKeyboard from '../VirtualKeyboard';

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
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  // Store selected address index per customer to persist across modal reopens
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [errors, setErrors] = useState({});

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  const [keyboardInput, setKeyboardInput] = useState('');

  // Eircode autocomplete state
  const [eircodeSuggestions, setEircodeSuggestions] = useState([]);
  const [showEircodeSuggestions, setShowEircodeSuggestions] = useState(false);
  const [activeEircodeIndex, setActiveEircodeIndex] = useState(-1);
  const [eircodeLoading, setEircodeLoading] = useState(false);
  const [currentEircodeInput, setCurrentEircodeInput] = useState({ addressIndex: -1, value: '' });
  const [eircodeSearchTimeout, setEircodeSearchTimeout] = useState(null);

  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [activeAddressIndex, setActiveAddressIndex] = useState(-1);
  const [addressLoading, setAddressLoading] = useState(false);
  const [currentAddressInput, setCurrentAddressInput] = useState({ addressIndex: -1, value: '' });
  const [addressSearchTimeout, setAddressSearchTimeout] = useState(null);

  // Postcoder API configuration
  const POSTCODER_API_KEY = "PCWK5-XD39R-HSZW6-SK54F";
  const POSTCODER_BASE_URL = "https://ws.postcoder.com/pcw";

  // Local Eircode database for common Irish addresses
  const LOCAL_EIRCODE_DB = {
    'H91TK33': {
      summaryline: 'National University of Ireland Galway',
      locationsummary: 'Galway',
      addressline1: 'National University of Ireland Galway',
      addressline2: 'University Road',
      addressline3: 'Galway',
      addressline4: 'H91 TK33'
    },
    'D01F5P2': {
      summaryline: 'O\'Connell Bridge',
      locationsummary: 'Dublin',
      addressline1: 'O\'Connell Bridge',
      addressline2: 'Dublin 1',
      addressline3: 'Dublin',
      addressline4: 'D01 F5P2'
    },
    'D02PK15': {
      summaryline: 'Trinity College Dublin',
      locationsummary: 'Dublin',
      addressline1: 'Trinity College Dublin',
      addressline2: 'College Green',
      addressline3: 'Dublin 2',
      addressline4: 'D02 PK15'
    }
  };

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
          const addressList = editingCustomer.addresses.map(addr => ({
            id: addr.id, // Keep the ID for existing addresses
            address: addr.address || '',
            eircode: addr.code || ''
                    }));
          setAddresses(addressList);
          // Select the previously selected address or first address by default
          // Use the customer's selectedAddressIndex if available, otherwise default to 0
          const customerSelectedIndex = editingCustomer.selectedAddressIndex || 0;
          const addressToSelect = Math.min(customerSelectedIndex, addressList.length - 1);
          setSelectedAddresses([addressToSelect]);
          setSelectedAddressIndex(addressToSelect);
        } else {
          setAddresses([{ address: '', eircode: '' }]);
          setSelectedAddresses([0]);
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
         setSelectedAddresses([0]);
         setSelectedAddressIndex(0);
      }
      setErrors({});
      setShowKeyboard(false);
      setActiveInput('');
      setEircodeSuggestions([]);
      setShowEircodeSuggestions(false);
      setActiveEircodeIndex(-1);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setActiveAddressIndex(-1);
    }
  }, [isOpen, editingCustomer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (eircodeSearchTimeout) {
        clearTimeout(eircodeSearchTimeout);
      }
      if (addressSearchTimeout) {
        clearTimeout(addressSearchTimeout);
      }
    };
  }, [eircodeSearchTimeout, addressSearchTimeout]);

  // Debug selectedAddresses state
  useEffect(() => {
    console.log('Selected addresses state updated:', selectedAddresses);
  }, [selectedAddresses]);

  // Debug selectedAddressIndex state
  useEffect(() => {
    console.log('Selected address index updated:', selectedAddressIndex);
  }, [selectedAddressIndex]);

  // Address autocomplete functions
  const searchAddress = async (address, addressIndex) => {
    console.log('Searching address:', address, 'for address index:', addressIndex);
    
    if (!address || address.length < 3) {
      console.log('Address too short, clearing suggestions');
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setActiveAddressIndex(-1);
      return;
    }

    setAddressLoading(true);
    setCurrentAddressInput({ addressIndex, value: address });
    
    // Clear previous suggestions
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setActiveAddressIndex(-1);

    try {
      // Use the Postcoder API for address search
      const url = `${POSTCODER_BASE_URL}/${POSTCODER_API_KEY}/address/IE/${encodeURIComponent(address)}`;
      console.log('Making address API request to:', url);
      
      const response = await fetch(url);
      console.log('Address API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Address API response data:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Setting address suggestions:', data.length, 'items');
        // Transform the data to match our suggestion format
        const suggestions = data.map((addressData, index) => ({
          id: index.toString(),
          summaryline: addressData.summaryline || `${addressData.addressline1 || ''} ${addressData.addressline2 || ''}`.trim(),
          locationsummary: addressData.posttown || '',
          addressline1: addressData.addressline1 || '',
          addressline2: addressData.addressline2 || '',
          addressline3: addressData.addressline3 || '',
          addressline4: addressData.addressline4 || ''
        }));
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(true);
        setActiveAddressIndex(-1);
      } else {
        console.log('No address suggestions found');
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      
      // Fallback: Show a message that the API is unavailable
      console.log('Address API failed, suggesting manual entry');
      const fallbackMessage = [
        {
          id: '0',
          summaryline: `Address search for "${address}" - API temporarily unavailable`,
          locationsummary: 'Please enter address manually',
          addressline1: '',
          addressline2: '',
          addressline3: '',
          addressline4: '',
          isFallback: true
        }
      ];
      setAddressSuggestions(fallbackMessage);
      setShowAddressSuggestions(true);
      setActiveAddressIndex(-1);
    } finally {
      setAddressLoading(false);
    }
  };

  const retrieveAddressFromSuggestion = async (suggestionId, addressIndex) => {
    console.log('Retrieving address from suggestion:', suggestionId, 'address index:', addressIndex);
    
    if (!currentAddressInput.value || !addressSuggestions[suggestionId]) {
      console.log('No current input or suggestion not found');
      return;
    }

    try {
      const selectedSuggestion = addressSuggestions[suggestionId];
      console.log('Selected address suggestion:', selectedSuggestion);
      
      // If this is a fallback message, don't populate address
      if (selectedSuggestion.isFallback) {
        console.log('Fallback message clicked - not populating address');
        setShowAddressSuggestions(false);
        setAddressSuggestions([]);
        setActiveAddressIndex(-1);
        return;
      }
      
      // Build address from available fields
      const addressParts = [];
      
      // Check for address fields in the suggestion
      if (selectedSuggestion.addressline1) addressParts.push(selectedSuggestion.addressline1);
      if (selectedSuggestion.addressline2) addressParts.push(selectedSuggestion.addressline2);
      if (selectedSuggestion.addressline3) addressParts.push(selectedSuggestion.addressline3);
      if (selectedSuggestion.addressline4) addressParts.push(selectedSuggestion.addressline4);
      
      // If we have address parts, use them directly
      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(', ');
        console.log('Full address from suggestion:', fullAddress);
        
        // Update the address fields
        setAddresses(prev => {
          const newAddresses = prev.map((addr, i) => 
            i === addressIndex 
              ? { 
                  ...addr, 
                  address: fullAddress
                } 
              : addr
          );
          console.log('Updated addresses:', newAddresses);
          return newAddresses;
        });
      } else {
        // If no address parts, try to use the summaryline as the address
        if (selectedSuggestion.summaryline) {
          console.log('Using summaryline as address:', selectedSuggestion.summaryline);
          
          setAddresses(prev => {
            const newAddresses = prev.map((addr, i) => 
              i === addressIndex 
                ? { 
                    ...addr, 
                    address: selectedSuggestion.summaryline
                  } 
                : addr
            );
            console.log('Updated addresses with summaryline:', newAddresses);
            return newAddresses;
          });
        } else {
          console.log('No address data available in suggestion');
        }
      }
      
      console.log('Address updated successfully');
    } catch (error) {
      console.error('Error retrieving address:', error);
    } finally {
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
      setActiveAddressIndex(-1);
    }
  };

  const handleAddressInputChange = (index, value) => {
    console.log('Address input changed:', value, 'for index:', index);
    handleAddressChange(index, 'address', value);
    
    // Clear previous timeout
    if (addressSearchTimeout) {
      clearTimeout(addressSearchTimeout);
    }
    
    // Reset suggestions if input is too short
    if (!value || value.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      setActiveAddressIndex(-1);
      return;
    }
    
    // Set new timeout for debounced search
    const timeoutId = setTimeout(() => {
      console.log('Executing debounced address search for:', value);
      searchAddress(value, index);
    }, 300);
    
    setAddressSearchTimeout(timeoutId);
  };

  const handleAddressKeyDown = (e, addressIndex) => {
    if (!showAddressSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveAddressIndex(prev => 
          prev < addressSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveAddressIndex(prev => 
          prev > 0 ? prev - 1 : addressSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeAddressIndex >= 0 && addressSuggestions[activeAddressIndex]) {
          retrieveAddressFromSuggestion(activeAddressIndex, addressIndex);
        }
        break;
      case 'Escape':
        setShowAddressSuggestions(false);
        setAddressSuggestions([]);
        setActiveAddressIndex(-1);
        break;
    }
  };

  const handleAddressSuggestionClick = (suggestion, addressIndex) => {
    console.log('Address suggestion clicked:', suggestion, 'for address index:', addressIndex);
    console.log('Available address suggestions:', addressSuggestions);
    
    // Find the suggestion index directly from the array
    const suggestionIndex = addressSuggestions.findIndex(s => 
      s.summaryline === suggestion.summaryline && 
      s.locationsummary === suggestion.locationsummary
    );
    console.log('Found address suggestion index:', suggestionIndex);
    
    if (suggestionIndex >= 0) {
      console.log('Calling retrieveAddressFromSuggestion with index:', suggestionIndex);
      retrieveAddressFromSuggestion(suggestionIndex, addressIndex);
    } else {
      console.log('Address suggestion not found in list');
      // Fallback: try to find by ID
      const fallbackIndex = addressSuggestions.findIndex(s => s.id === suggestion.id);
      if (fallbackIndex >= 0) {
        console.log('Found by ID fallback, index:', fallbackIndex);
        retrieveAddressFromSuggestion(fallbackIndex, addressIndex);
      } else {
        console.log('Address suggestion not found by any method');
      }
    }
  };

  // Eircode autocomplete functions
  const searchEircode = async (eircode, addressIndex) => {
    console.log('Searching eircode:', eircode, 'for address index:', addressIndex);
    
    if (!eircode || eircode.length < 3) {
      console.log('Eircode too short, clearing suggestions');
      setEircodeSuggestions([]);
      setShowEircodeSuggestions(false);
      setActiveEircodeIndex(-1);
      return;
    }

    setEircodeLoading(true);
    setCurrentEircodeInput({ addressIndex, value: eircode });
    
    // Clear previous suggestions
    setEircodeSuggestions([]);
    setShowEircodeSuggestions(false);
    setActiveEircodeIndex(-1);

    // Check local database first
    const normalizedEircode = eircode.toUpperCase().replace(/\s/g, '');
    if (LOCAL_EIRCODE_DB[normalizedEircode]) {
      console.log('Found in local database:', normalizedEircode);
      const localAddress = LOCAL_EIRCODE_DB[normalizedEircode];
      const suggestion = {
        id: '0',
        summaryline: localAddress.summaryline,
        locationsummary: localAddress.locationsummary,
        addressline1: localAddress.addressline1,
        addressline2: localAddress.addressline2,
        addressline3: localAddress.addressline3,
        addressline4: localAddress.addressline4
      };
      setEircodeSuggestions([suggestion]);
      setShowEircodeSuggestions(true);
      setActiveEircodeIndex(-1);
      setEircodeLoading(false);
      return;
    }

    try {
      // Use the correct Postcoder API endpoint structure for Irish Eircodes
      // Try the autocomplete endpoint first, then fallback to direct lookup
      const url = `${POSTCODER_BASE_URL}/${POSTCODER_API_KEY}/address/IE/${encodeURIComponent(eircode)}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url);
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('Setting suggestions:', data.length, 'items');
        // Transform the data to match our suggestion format
        const suggestions = data.map((address, index) => ({
          id: index.toString(),
          summaryline: address.summaryline || `${address.addressline1 || ''} ${address.addressline2 || ''}`.trim(),
          locationsummary: address.posttown || '',
          addressline1: address.addressline1 || '',
          addressline2: address.addressline2 || '',
          addressline3: address.addressline3 || '',
          addressline4: address.addressline4 || ''
        }));
        setEircodeSuggestions(suggestions);
        setShowEircodeSuggestions(true);
        setActiveEircodeIndex(-1);
      } else {
        console.log('No suggestions found');
        setEircodeSuggestions([]);
        setShowEircodeSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching eircode suggestions:', error);
      
      // Fallback: Show a message that the API is unavailable and suggest manual entry
      console.log('API failed, suggesting manual entry');
      const fallbackMessage = [
        {
          id: '0',
          summaryline: `Eircode ${eircode} - API temporarily unavailable`,
          locationsummary: 'Please enter address manually',
          addressline1: '',
          addressline2: '',
          addressline3: '',
          addressline4: '',
          isFallback: true
        }
      ];
      setEircodeSuggestions(fallbackMessage);
      setShowEircodeSuggestions(true);
      setActiveEircodeIndex(-1);
    } finally {
      setEircodeLoading(false);
    }
  };

  const retrieveAddress = async (suggestionId, addressIndex) => {
    console.log('Retrieving address for suggestion:', suggestionId, 'address index:', addressIndex);
    
    if (!currentEircodeInput.value || !eircodeSuggestions[suggestionId]) {
      console.log('No current input or suggestion not found');
      return;
    }

    try {
      const selectedSuggestion = eircodeSuggestions[suggestionId];
      console.log('Selected suggestion:', selectedSuggestion);
      
      // If this is a fallback message, don't populate address
      if (selectedSuggestion.isFallback) {
        console.log('Fallback message clicked - not populating address');
        setShowEircodeSuggestions(false);
        setEircodeSuggestions([]);
        setActiveEircodeIndex(-1);
        return;
      }
      
      // Build address from available fields
      const addressParts = [];
      
      // Check for address fields in the suggestion
      if (selectedSuggestion.addressline1) addressParts.push(selectedSuggestion.addressline1);
      if (selectedSuggestion.addressline2) addressParts.push(selectedSuggestion.addressline2);
      if (selectedSuggestion.addressline3) addressParts.push(selectedSuggestion.addressline3);
      if (selectedSuggestion.addressline4) addressParts.push(selectedSuggestion.addressline4);
      
      // If we have address parts, use them directly
      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(', ');
        console.log('Full address from suggestion:', fullAddress);
        
        // Update the address fields
        setAddresses(prev => {
          const newAddresses = prev.map((addr, i) => 
            i === addressIndex 
              ? { 
                  ...addr, 
                  address: fullAddress,
                  eircode: currentEircodeInput.value.toUpperCase()
                } 
              : addr
          );
          console.log('Updated addresses:', newAddresses);
          return newAddresses;
        });
      } else {
        // If no address parts, try to use the summaryline as the address
        if (selectedSuggestion.summaryline) {
          console.log('Using summaryline as address:', selectedSuggestion.summaryline);
          
          setAddresses(prev => {
            const newAddresses = prev.map((addr, i) => 
              i === addressIndex 
                ? { 
                    ...addr, 
                    address: selectedSuggestion.summaryline,
                    eircode: currentEircodeInput.value.toUpperCase()
                  } 
                : addr
            );
            console.log('Updated addresses with summaryline:', newAddresses);
            return newAddresses;
          });
        } else {
          console.log('No address data available in suggestion');
        }
      }
      
      console.log('Address updated successfully');
    } catch (error) {
      console.error('Error retrieving address:', error);
    } finally {
      setShowEircodeSuggestions(false);
      setEircodeSuggestions([]);
      setActiveEircodeIndex(-1);
    }
  };

  const handleEircodeInputChange = (index, value) => {
    console.log('Eircode input changed:', value, 'for index:', index);
    handleAddressChange(index, 'eircode', value);
    
    // Clear previous timeout
    if (eircodeSearchTimeout) {
      clearTimeout(eircodeSearchTimeout);
    }
    
    // Reset suggestions if input is too short
    if (!value || value.length < 3) {
      setEircodeSuggestions([]);
      setShowEircodeSuggestions(false);
      setActiveEircodeIndex(-1);
      return;
    }
    
    // Set new timeout for debounced search
    const timeoutId = setTimeout(() => {
      console.log('Executing debounced search for:', value);
      searchEircode(value, index);
    }, 300);
    
    setEircodeSearchTimeout(timeoutId);
  };

  const handleEircodeKeyDown = (e, addressIndex) => {
    if (!showEircodeSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveEircodeIndex(prev => 
          prev < eircodeSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveEircodeIndex(prev => 
          prev > 0 ? prev - 1 : eircodeSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeEircodeIndex >= 0 && eircodeSuggestions[activeEircodeIndex]) {
          retrieveAddress(activeEircodeIndex, addressIndex);
        }
        break;
      case 'Escape':
        setShowEircodeSuggestions(false);
        setEircodeSuggestions([]);
        setActiveEircodeIndex(-1);
        break;
    }
  };

  const handleEircodeSuggestionClick = (suggestion, addressIndex) => {
    console.log('Suggestion clicked:', suggestion, 'for address index:', addressIndex);
    console.log('Available suggestions:', eircodeSuggestions);
    
    // Find the suggestion index directly from the array
    const suggestionIndex = eircodeSuggestions.findIndex(s => 
      s.summaryline === suggestion.summaryline && 
      s.locationsummary === suggestion.locationsummary
    );
    console.log('Found suggestion index:', suggestionIndex);
    
    if (suggestionIndex >= 0) {
      console.log('Calling retrieveAddress with index:', suggestionIndex);
      retrieveAddress(suggestionIndex, addressIndex);
    } else {
      console.log('Suggestion not found in list');
      // Fallback: try to find by ID
      const fallbackIndex = eircodeSuggestions.findIndex(s => s.id === suggestion.id);
      if (fallbackIndex >= 0) {
        console.log('Found by ID fallback, index:', fallbackIndex);
        retrieveAddress(fallbackIndex, addressIndex);
      } else {
        console.log('Suggestion not found by any method');
      }
    }
  };

  // Close suggestions when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.eircode-input-container')) {
      setShowEircodeSuggestions(false);
      setEircodeSuggestions([]);
      setActiveEircodeIndex(-1);
    }
    if (!e.target.closest('.address-input-container')) {
      setShowAddressSuggestions(false);
      setAddressSuggestions([]);
      setActiveAddressIndex(-1);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (showEircodeSuggestions || showAddressSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showEircodeSuggestions, showAddressSuggestions]);

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
  };

  const handleInputBlur = (e) => {
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

  const onKeyboardChange = (input, inputName) => {
    setKeyboardInput(input);
    
    // Update the corresponding form field
    if (inputName.startsWith('address_')) {
      // Handle address fields
      const [field, index, subField] = inputName.split('_');
      const addressIndex = parseInt(index);
      if (subField) {
        handleAddressChange(addressIndex, subField, input);
      }
    } else if (inputName) {
      // Handle customer fields
      setNewCustomer(prev => ({
        ...prev,
        [inputName]: input
      }));
    }
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
         // Select the newly added address (single selection)
     const newAddressIndex = addresses.length;
     setSelectedAddresses([newAddressIndex]);
     setSelectedAddressIndex(newAddressIndex);
  };

  const removeAddress = (index) => {
    if (addresses.length > 1) {
      setAddresses(prev => prev.filter((_, i) => i !== index));
      // Update selected addresses after removal
      setSelectedAddresses(prev => {
        const newSelected = prev.filter(selectedIndex => selectedIndex !== index);
                 // If we removed the currently selected address, select the first remaining address
         if (newSelected.length === 0) {
           const firstRemainingIndex = Math.min(selectedAddressIndex, addresses.length - 2);
           setSelectedAddressIndex(firstRemainingIndex);
           return [firstRemainingIndex];
         }
        return newSelected;
      });
    }
  };

  const handleAddressSelection = (index) => {
    console.log('Address selection changed for index:', index);
    setSelectedAddresses(prev => {
      if (prev.includes(index)) {
        // If clicking on already selected address, deselect it
        const newSelected = prev.filter(selectedIndex => selectedIndex !== index);
        console.log('Removed index', index, 'from selection');
        console.log('New selection:', newSelected);
        return newSelected;
      } else {
        // If clicking on unselected address, select only this one (single selection)
        const newSelected = [index];
        console.log('Selected only index', index, 'for single selection');
        console.log('New selection:', newSelected);
                 // Remember the selected address index
         setSelectedAddressIndex(index);
        return newSelected;
      }
    });
  };

  const deleteAddress = async (addressId) => {
    if (!addressId) return; // Don't delete if no ID (new address)
    
    try {
      const result = await window.myAPI?.deleteAddress(addressId);
      if (result && result.success) {
        // Remove from local state
        setAddresses(prev => prev.filter(addr => addr.id !== addressId));
        // Update selected addresses after deletion
        setSelectedAddresses(prev => {
          const deletedIndex = addresses.findIndex(addr => addr.id === addressId);
          const newSelected = prev.filter(selectedIndex => selectedIndex !== deletedIndex);
                     // If we deleted the currently selected address, select the first remaining address
           if (newSelected.length === 0) {
             const firstRemainingIndex = Math.min(selectedAddressIndex, addresses.length - 2);
             setSelectedAddressIndex(firstRemainingIndex);
             return [firstRemainingIndex];
           }
          return newSelected;
        });
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

    console.log('Form submission - addresses:', addresses);
    console.log('Form submission - selectedAddresses:', selectedAddresses);
    console.log('Form submission - editingCustomer:', editingCustomer);

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
          // Update existing addresses that are selected
          const addressesToUpdate = addresses
            .filter((addr, index) => addr.id && selectedAddresses.includes(index))
            .map(addr => ({
              id: addr.id,
              address: addr.address.trim(),
              code: addr.eircode.trim() || null
            }));

          console.log('Addresses to update:', addressesToUpdate);

          // Update existing addresses
          for (const address of addressesToUpdate) {
            const updateResult = await window.myAPI?.updateAddress(address.id, {
              address: address.address,
              code: address.code
            });
            console.log('Update result for address', address.id, ':', updateResult);
          }

          // Add new addresses if any (only selected ones)
          const newAddresses = addresses
            .filter((addr, index) => addr.address.trim() && !addr.id && selectedAddresses.includes(index)) // Only selected new addresses
            .map(addr => ({
              address: addr.address.trim(),
              code: addr.eircode.trim() || null,
              addedby: 1
            }));

          console.log('New addresses to create:', newAddresses);

          // Create new addresses
          for (const address of newAddresses) {
            const createResult = await window.myAPI?.createAddress({
              customer_id: editingCustomer.id,
              ...address
            });
            console.log('Create result for new address:', createResult);
          }

          if (onCustomerSelect) {
            onCustomerSelect({
              id: editingCustomer.id,
              ...customerData,
              isloyal: newCustomer.isloyal,
              selectedAddressIndex: selectedAddressIndex // Save the selected address index
            });
          }
          onClose();
        } else {
          alert('Error updating customer: ' + result.message);
        }
      } else {
        // Filter out empty addresses (only selected ones)
        const validAddresses = addresses
          .filter((addr, index) => addr.address.trim() && selectedAddresses.includes(index))
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
              addresses: validAddresses,
              selectedAddressIndex: selectedAddressIndex // Save the selected address index
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
    onClose(); // Close the modal when Cancel is clicked
  };

  if (!isOpen) return null;

    return (
    <>
      <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl">
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
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name and Phone in one row */}
              <div className="grid grid-cols-3 gap-4">
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
                
                {/* Help text for address selection */}
                {editingCustomer && addresses.length >= 2 && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 Select the addresses you want to include. Unselected addresses will remain but won't be updated.
                    </p>
                  </div>
                )}
                
                {addresses.map((address, index) => (
                                     <div key={index} className={`mb-4 p-3 border rounded-lg transition-colors ${
                     editingCustomer 
                       ? selectedAddresses.includes(index)
                         ? 'border-primary bg-primary/5'
                         : 'border-gray-200 bg-gray-50 opacity-60'
                       : 'border-gray-200'
                   }`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        {/* Show checkbox when editing (for single selection) */}
                        {editingCustomer && (
                          <input
                            type="checkbox"
                            checked={selectedAddresses.includes(index)}
                            onChange={() => handleAddressSelection(index)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-700">
                          Address {index + 1} {address.id && '(Existing)'}
                          {/* Debug info */}
                          {process.env.NODE_ENV === 'development' && (
                            <span className="text-xs text-gray-400 ml-2">
                              (Selected: {selectedAddresses.includes(index) ? 'Yes' : 'No'})
                            </span>
                          )}
                        </span>
                      </div>
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
                      <div className="relative eircode-input-container">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Eircode
                        </label>
                        <input
                          type="text"
                          value={address.eircode}
                          onChange={(e) => handleEircodeInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleEircodeKeyDown(e, index)}
                          onFocus={(e) => handleAnyInputFocus(e, `address_${index}_eircode`)}
                          onClick={(e) => handleAnyInputClick(e, `address_${index}_eircode`)}
                          onBlur={handleInputBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          placeholder="Enter Eircode (e.g., D01F5P2)"
                        />
                        
                        {/* Eircode Suggestions Dropdown */}
                        {showEircodeSuggestions && currentEircodeInput.addressIndex === index && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {eircodeLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                            ) : eircodeSuggestions.length > 0 ? (
                              eircodeSuggestions.map((suggestion, suggestionIndex) => (
                                <div
                                  key={suggestion.id}
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                    suggestionIndex === activeEircodeIndex ? 'bg-primary text-white' : ''
                                  }`}
                                  onClick={() => handleEircodeSuggestionClick(suggestion, index)}
                                >
                                  <div className="font-medium">{suggestion.summaryline}</div>
                                  {suggestion.locationsummary && (
                                    <div className="text-xs text-gray-500">{suggestion.locationsummary}</div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No addresses found</div>
                            )}
                          </div>
                        )}
                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-400 mt-1">
                            Debug: {showEircodeSuggestions ? 'Showing' : 'Hidden'} | 
                            Index: {currentEircodeInput.addressIndex} | 
                            Current: {index} | 
                            Loading: {eircodeLoading ? 'Yes' : 'No'} | 
                            Suggestions: {eircodeSuggestions.length} |
                            Input: {currentEircodeInput.value}
                          </div>
                        )}
                      </div>
                      <div className="relative address-input-container">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={address.address}
                          onChange={(e) => handleAddressInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleAddressKeyDown(e, index)}
                          onFocus={(e) => handleAnyInputFocus(e, `address_${index}_address`)}
                          onClick={(e) => handleAnyInputClick(e, `address_${index}_address`)}
                          onBlur={handleInputBlur}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                          placeholder="Start typing address..."
                        />
                        
                        {/* Address Suggestions Dropdown */}
                        {showAddressSuggestions && currentAddressInput.addressIndex === index && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {addressLoading ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
                            ) : addressSuggestions.length > 0 ? (
                              addressSuggestions.map((suggestion, suggestionIndex) => (
                                <div
                                  key={suggestion.id}
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                    suggestionIndex === activeAddressIndex ? 'bg-primary text-white' : ''
                                  }`}
                                  onClick={() => handleAddressSuggestionClick(suggestion, index)}
                                >
                                  <div className="font-medium">{suggestion.summaryline}</div>
                                  {suggestion.locationsummary && (
                                    <div className="text-xs text-gray-500">{suggestion.locationsummary}</div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No addresses found</div>
                            )}
                          </div>
                        )}
                        {/* Debug info */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="text-xs text-gray-400 mt-1">
                            Debug: {showAddressSuggestions ? 'Showing' : 'Hidden'} | 
                            Index: {currentAddressInput.addressIndex} | 
                            Current: {index} | 
                            Loading: {addressLoading ? 'Yes' : 'No'} | 
                            Suggestions: {addressSuggestions.length} |
                            Input: {currentAddressInput.value}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Loyal Customer Toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="block text-sm font-medium text-gray-700">
                  Favourite Customer
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
                  Cancel
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
        {/* {showKeyboard && (
          <VirtualKeyboard
            isVisible={showKeyboard}
            onClose={() => setShowKeyboard(false)}
            activeInput={activeInput}
            onInputChange={onKeyboardChange}
            onInputBlur={handleInputBlur}
            inputValue={keyboardInput}
            onKeyPress={onKeyboardKeyPress}
          />
        )} */}
    </>
  );
};

export default CustomerManagement; 