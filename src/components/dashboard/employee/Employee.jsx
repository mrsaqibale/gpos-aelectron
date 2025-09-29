import React, { useState, useEffect } from 'react';
import { Edit, Plus, X, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';

const Employee = () => {
    const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  
  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phone: '',
    email: '',
    pin: '',
    confirmPin: '',
    salaryPerHour: '',
    image: null,
    vehicleNumber: '',
    vehicleType: '',
    licenseNumber: '',
    licenseExpiry: ''
  });
  const [pinError, setPinError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [toggleLoading, setToggleLoading] = useState({});
  const [toggleLoadingAvailable, setToggleLoadingAvailable] = useState({});



  const fetchEmployees = async () => {
    try {
      // Get current logged-in employee ID to exclude from the list
      const currentEmployee = localStorage.getItem('currentEmployee');
      let currentEmployeeId = null;
      
      if (currentEmployee) {
        try {
          const employeeData = JSON.parse(currentEmployee);
          currentEmployeeId = employeeData.id;
        } catch (error) {
          console.error('Error parsing current employee data:', error);
        }
      }
      
      const result = await window.myAPI?.getAllEmployees(currentEmployeeId);
      if (result.success) {
        setEmployees(result.data);
        
        // Load images for employees with file paths
        const newImageUrls = {};
        for (const employee of result.data) {
          if (employee.imgurl && employee.imgurl.startsWith('uploads/')) {
            try {
              const imageResult = await window.myAPI.getEmployeeImage(employee.imgurl);
              if (imageResult.success) {
                newImageUrls[employee.id] = imageResult.data;
              }
            } catch (error) {
              console.error('Error loading image for employee:', employee.id, error);
            }
          }
        }
        setImageUrls(newImageUrls);
      } else {
        console.error('Error fetching employees:', result.message);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      firstName: employee.fname || '',
      lastName: employee.lname || '',
      role: employee.roll || '',
      phone: employee.phone || '',
      email: employee.email || '',
      pin: '',
      confirmPin: '',
      salaryPerHour: employee.salary_per_hour || '',
      image: null,
      vehicleNumber: employee.vnumber || '',
      vehicleType: employee.vtype || '',
      licenseNumber: employee.license_number || '',
      licenseExpiry: employee.license_expiry || ''
    });
    // Set image preview if employee has an image
    if (employee.imgurl) {
      if (employee.imgurl.startsWith('uploads/')) {
        // Use cached image URL if available
        const cachedUrl = imageUrls[employee.id];
        if (cachedUrl) {
          setImagePreview(cachedUrl);
        } else {
          // Load image if not cached
          window.myAPI.getEmployeeImage(employee.imgurl).then(result => {
            if (result.success) {
              setImagePreview(result.data);
            } else {
              setImagePreview(null);
            }
          }).catch(() => {
            setImagePreview(null);
          });
        }
      } else {
        // Old system: base64 data
        setImagePreview(`data:image/png;base64,${employee.imgurl}`);
      }
    } else {
      setImagePreview(null);
    }
    setPinError(''); // Clear any previous PIN error messages
    setEmailError('');
    setPhoneError('');
    setShowForm(true);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setNewEmployee({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: '',
      pin: '',
      confirmPin: '',
      salaryPerHour: '',
      image: null,
      vehicleNumber: '',
      vehicleType: '',
      licenseNumber: '',
      licenseExpiry: ''
    });
    setImagePreview(null);
    setPinError(''); // Clear any previous PIN error messages
    setEmailError('');
    setPhoneError('');
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Fixed phone number validation - more user-friendly
    if (name === 'phone') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      if (numericValue.length > 10) {
        return;
      }
      
      // If user is typing and has entered some digits, validate the pattern
      if (numericValue.length > 0 && numericValue.length >= 2) {
        if (!numericValue.startsWith('08')) {
          // If they've typed 2+ digits and it doesn't start with 08, don't allow it
          return;
        }
      }
      
      setNewEmployee(prev => ({
        ...prev,
        [name]: numericValue
      }));
      
      // Clear phone error when typing
      if (phoneError) {
        setPhoneError('');
      }
      return;
    }
    
    // Check for duplicate PIN when PIN field changes
    if (name === 'pin') {
      const trimmedValue = value.trim();
      const existingEmployee = employees.find(emp => 
        emp.pin === trimmedValue && 
        (!editingEmployee || emp.id !== editingEmployee.id)
      );
      
      if (existingEmployee) {
        setPinError('⚠ This PIN is already taken by another employee');
      } else {
        setPinError('');
      }
    }
    
    // Clear email error when typing
    if (name === 'email' && emailError) {
      setEmailError('');
    }
    
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setNewEmployee(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear all previous errors
    setPinError('');
    setEmailError('');
    setPhoneError('');
    
    // Validate PIN match
    if (newEmployee.pin !== newEmployee.confirmPin) {
      alert('PIN and Confirm PIN do not match');
      return;
    }

    // Validate phone number format
    if (newEmployee.phone.length !== 10 || !newEmployee.phone.startsWith('08')) {
      alert('Phone number must be 10 digits and start with 08');
      return;
    }

    try {
      let imageBase64 = null;
      if (newEmployee.image) {
        console.log('Processing image:', newEmployee.image.name, newEmployee.image.size);
        // Read the image as base64
        imageBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Data = reader.result.split(',')[1];
            console.log('Image converted to base64, length:', base64Data.length);
            console.log('Base64 preview (first 100 chars):', base64Data.substring(0, 100));
            resolve(base64Data);
          };
          reader.onerror = (error) => {
            console.error('Error reading image:', error);
            reject(error);
          };
          reader.readAsDataURL(newEmployee.image);
        });
      } else {
        console.log('No image selected');
      }

      const employeeData = {
        fname: newEmployee.firstName,
        lname: newEmployee.lastName,
        roll: newEmployee.role,
        phone: newEmployee.phone,
        email: newEmployee.email,
        pin: newEmployee.pin,
        code: newEmployee.pin, // Using PIN as code for now
        address: '',
        isavailable: 1,
        isActive: 1,
        isDeleted: 0,
        isSyncronized: 0
      };

      // Add vehicle and license information for Delivery Man
      if (newEmployee.role === 'Delivery Man') {
        employeeData.vnumber = newEmployee.vehicleNumber;
        employeeData.vtype = newEmployee.vehicleType;
        // License details
        if (!newEmployee.licenseExpiry) {
          alert('License expiry date is required for Delivery Man');
          return;
        }
        employeeData.license_number = newEmployee.licenseNumber || null;
        employeeData.license_expiry = newEmployee.licenseExpiry;
      } else {
        // Ensure backend clears if role changed away from Delivery Man
        employeeData.vnumber = null;
        employeeData.vtype = null;
        employeeData.license_number = null;
        employeeData.license_expiry = null;
      }

      // Only include image data if a new image is selected
      if (newEmployee.image) {
        employeeData.imgurl = imageBase64;
        employeeData.originalFilename = newEmployee.image.name;
      }

      console.log('Employee data to send:', {
        ...employeeData,
        imgurl: employeeData.imgurl ? `base64_data_${employeeData.imgurl.length}_chars` : 'not provided'
      });

      if (editingEmployee) {
        // Update existing employee
        const result = await window.myAPI?.updateEmployee(editingEmployee.id, employeeData, employeeData.originalFilename || null);
        if (result.success) {
          fetchEmployees();
        } else {
          // Handle validation errors
          if (result.message.includes('Email already exists')) {
            setEmailError('⚠ Email already exists');
          } else if (result.message.includes('Phone number already exists')) {
            setPhoneError('⚠ Phone number already exists');
          } else if (result.message.includes('PIN code already exists')) {
            setPinError('⚠ PIN code already exists');
          } else {
            alert('Error updating employee: ' + result.message);
          }
          return; // Don't close form if there are validation errors
        }
      } else {
        // Add new employee
        const result = await window.myAPI?.createEmployee(employeeData);
        if (result.success) {
          fetchEmployees();
        } else {
          // Handle validation errors
          if (result.message.includes('Email already exists')) {
            setEmailError('⚠ Email already exists');
          } else if (result.message.includes('Phone number already exists')) {
            setPhoneError('⚠ Phone number already exists');
          } else if (result.message.includes('PIN code already exists')) {
            setPinError('⚠ PIN code already exists');
          } else {
            alert('Error creating employee: ' + result.message);
          }
          return; // Don't close form if there are validation errors
        }
      }
      setShowForm(false);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee');
    }
  };

  const handleReset = () => {
    setNewEmployee({
      firstName: '',
      lastName: '',
      role: '',
      phone: '',
      email: '',
      pin: '',
      confirmPin: '',
      salaryPerHour: '',
      image: null,
      vehicleNumber: '',
      vehicleType: '',
      licenseNumber: '',
      licenseExpiry: ''
    });
    setImagePreview(null);
    setPinError('');
    setEmailError('');
    setPhoneError('');
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteConfirm(true);
  };

  const deleteEmployee = async (id) => {
    try {
      const result = await window.myAPI?.updateEmployee(id, { isDeleted: 1 });
      if (result.success) {
        fetchEmployees();
        setShowDeleteConfirm(false);
        setEmployeeToDelete(null);
      } else {
        alert('Error deleting employee: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee');
    }
  };

  const toggleStatus = async (id) => {
    // Prevent multiple rapid clicks
    if (toggleLoading[id]) return;
    
    try {
      setToggleLoading(prev => ({ ...prev, [id]: true }));
      
      const employee = employees.find(emp => emp.id === id);
      if (!employee) return;
      
      console.log('Current employee data:', employee);
      console.log('Current isActive value:', employee.isActive, 'Type:', typeof employee.isActive);
      
      // Handle different possible values for isActive
      let currentStatus;
      if (employee.isActive === 1 || employee.isActive === true || employee.isActive === '1') {
        currentStatus = true;
      } else {
        currentStatus = false;
      }
      
      const newStatus = currentStatus ? 0 : 1;
      
      console.log('Toggling status for employee:', employee.fname, 'from', currentStatus, 'to', newStatus);
      
      const result = await window.myAPI?.updateEmployee(id, { isActive: newStatus });
      console.log('API response:', result);
      
      if (result && result.success) {
        console.log('Status updated successfully');
        // Update the local state immediately for better UX
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.id === id ? { ...emp, isActive: newStatus } : emp
          )
        );
        // Then fetch fresh data from server after a delay
        setTimeout(() => {
          console.log('Fetching fresh data...');
          fetchEmployees();
        }, 200);
      } else {
        console.error('API returned error:', result);
        alert('Error toggling status: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error toggling status. Please try again.');
    } finally {
      setToggleLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleAvailability = async (id) => {
    if (toggleLoadingAvailable[id]) return;
    try {
      setToggleLoadingAvailable(prev => ({ ...prev, [id]: true }));
      const employee = employees.find(emp => emp.id === id);
      if (!employee) return;
      let currentStatus = employee.isavailable === 1 || employee.isavailable === true || employee.isavailable === '1';
      const newStatus = currentStatus ? 0 : 1;
      const result = await window.myAPI?.updateEmployee(id, { isavailable: newStatus });
      if (result && result.success) {
        setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, isavailable: newStatus } : emp));
        setTimeout(() => { fetchEmployees(); }, 200);
      } else {
        alert('Error toggling availability: ' + (result?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Error toggling availability. Please try again.');
    } finally {
      setToggleLoadingAvailable(prev => ({ ...prev, [id]: false }));
    }
  };

  // Keyboard event handlers
  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
    setShowKeyboard(true);
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
    
    // Check if focus is moving to another form input field
    if (e.relatedTarget && e.relatedTarget.tagName === 'INPUT' && e.relatedTarget.closest('form')) {
      // Don't hide keyboard if moving to another input in the same form
      return;
    }
    
    // Check if focus is moving to a select element in the form
    if (e.relatedTarget && e.relatedTarget.tagName === 'SELECT' && e.relatedTarget.closest('form')) {
      // Don't hide keyboard if moving to a select in the same form
      return;
    }
    
    // Only hide keyboard if focus is moving outside the form or to non-input elements
    setTimeout(() => {
      setShowKeyboard(false);
      setActiveInput('');
    }, 100);
  };

  // Auto-show keyboard for any input focus
  const handleAnyInputFocus = (e, inputName) => {
    // Only show keyboard if it's not already showing for this input
    if (!showKeyboard || activeInput !== inputName) {
      handleInputFocus(inputName);
    }
  };

  // Auto-show keyboard for any input click
  const handleAnyInputClick = (e, inputName) => {
    // Always show keyboard on click, regardless of current state
    handleInputFocus(inputName);
  };

  const onKeyboardChange = (input, inputName, buttonType) => {
    // Update the corresponding form field
    if (inputName) {
      setNewEmployee(prev => ({
        ...prev,
        [inputName]: input
      }));
    }
    
    // Handle special button presses
    if (buttonType === 'enter') {
      // Move to next input field or submit form
      const inputFields = ['firstName', 'lastName', 'role', 'phone', 'salaryPerHour', 'email', 'pin', 'confirmPin'];
      const currentIndex = inputFields.indexOf(inputName);
      if (currentIndex < inputFields.length - 1) {
        const nextField = inputFields[currentIndex + 1];
        const nextInput = document.querySelector(`[name="${nextField}"]`);
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };



  const handleKeyboardClose = () => {
    setShowKeyboard(false);
    setActiveInput('');
  };

  return (
    <div className="space-y-6">
      {/* Employee Form - NOW AT THE VERY TOP */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">
              {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <button 
              onClick={() => {
                setShowForm(false);
                setImagePreview(null);
              }} 
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* General Information Section */}
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-gray-200">
                General Information
              </h3>
              
              <div className="flex ">
                {/* Left Side - Form Fields */}
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={newEmployee.firstName}
                        onChange={handleInputChange}
                        onFocus={() => handleAnyInputFocus(null, 'firstName')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'firstName')}
                        className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        placeholder="Ex: John"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={newEmployee.lastName}
                        onChange={handleInputChange}
                        onFocus={() => handleAnyInputFocus(null, 'lastName')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'lastName')}
                        className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        placeholder="Ex: Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={newEmployee.role}
                        onChange={handleInputChange}
                        onFocus={() => handleAnyInputFocus(null, 'role')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'role')}
                        className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="Manager">Manager</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Chef">Chef</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Sweeper">Sweeper</option>
                        <option value="Delivery Man">Delivery Man</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Must start with 08 and be 10 digits)</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={newEmployee.phone}
                        onChange={handleInputChange}
                        onFocus={() => handleAnyInputFocus(null, 'phone')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'phone')}
                        className={`w-[80%] px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                          phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                        }`}
                        placeholder="08xxxxxxxx"
                        maxLength="10"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {newEmployee.phone.length > 0 && (
                          <span className={newEmployee.phone.length === 10 && newEmployee.phone.startsWith('08') ? 'text-green-600' : 'text-red-500'}>
                            {newEmployee.phone.length}/10 digits
                          </span>
                        )}
                      </p>
                      {phoneError && (
                        <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Salary per Hour <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="salaryPerHour"
                        value={newEmployee.salaryPerHour}
                        onChange={handleInputChange}
                        onFocus={() => handleAnyInputFocus(null, 'salaryPerHour')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'salaryPerHour')}
                        className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    {/* Vehicle Information - Only show for Delivery Man */}
                    {newEmployee.role === 'Delivery Man' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Vehicle Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="vehicleNumber"
                            value={newEmployee.vehicleNumber}
                            onChange={handleInputChange}
                            onFocus={() => handleAnyInputFocus(null, 'vehicleNumber')}
                            onBlur={handleInputBlur}
                            onClick={() => handleAnyInputClick(null, 'vehicleNumber')}
                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            placeholder="Ex: ABC-123"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Vehicle Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="vehicleType"
                            value={newEmployee.vehicleType}
                            onChange={handleInputChange}
                            onFocus={() => handleAnyInputFocus(null, 'vehicleType')}
                            onBlur={handleInputBlur}
                            onClick={() => handleAnyInputClick(null, 'vehicleType')}
                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            required
                          >
                            <option value="">Select Vehicle Type</option>
                            <option value="Bike">Bike</option>
                            <option value="Car">Car</option>
                            <option value="Truck">Truck</option>
                            <option value="Bicycle">Bicycle</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            License Number
                          </label>
                          <input
                            type="text"
                            name="licenseNumber"
                            value={newEmployee.licenseNumber}
                            onChange={handleInputChange}
                            onFocus={() => handleAnyInputFocus(null, 'licenseNumber')}
                            onBlur={handleInputBlur}
                            onClick={() => handleAnyInputClick(null, 'licenseNumber')}
                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            placeholder="Optional"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            License Expiry Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="licenseExpiry"
                            value={newEmployee.licenseExpiry}
                            onChange={handleInputChange}
                            onFocus={() => handleAnyInputFocus(null, 'licenseExpiry')}
                            onBlur={handleInputBlur}
                            onClick={() => handleAnyInputClick(null, 'licenseExpiry')}
                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            required
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Right Side - Image Section */}
                <div className="w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee Image
                  </label>
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors w-full h-32 relative overflow-hidden">
                      {imagePreview ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs">Change Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload size={20} className="text-gray-400 mb-1" />
                          <span className="text-primary font-medium text-xs">Upload Image</span>
                        </>
                      )}
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept="image/*"
                      />
                    </label>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Image format - jpg png jpeg gif</p>
                      <p>Image Size - maximum size 2 MB</p>
                      <p>Image Ratio - 1:1</p>
                      {newEmployee.image && (
                        <p className="text-green-600 font-medium">Selected: {newEmployee.image.name}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                <span className="text-lg">👤</span>
                <h3 className="text-lg font-semibold text-primary">
                  Account Info
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                    onFocus={() => handleAnyInputFocus(null, 'email')}
                    onBlur={handleInputBlur}
                    onClick={() => handleAnyInputClick(null, 'email')}
                    className={`w-3/4 px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                      emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                    }`}
                    placeholder="mrsaqibale@gmail.com"
                    required
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-600">{emailError}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    PIN Code <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(4-6 digits)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      name="pin"
                      value={newEmployee.pin}
                      onChange={handleInputChange}
                      onFocus={() => handleAnyInputFocus(null, 'pin')}
                      onBlur={handleInputBlur}
                      onClick={() => handleAnyInputClick(null, 'pin')}
                      className={`w-3/4 px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-6 text-sm ${
                        pinError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                      }`}
                      placeholder="••••••"
                      minLength="4"
                      maxLength="6"
                      pattern="[0-9]{4,6}"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {pinError && (
                    <p className="mt-1 text-xs text-red-600">{pinError}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Confirm PIN <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Must match above)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPin ? "text" : "password"}
                      name="confirmPin"
                      value={newEmployee.confirmPin}
                      onChange={handleInputChange}
                      onFocus={() => handleAnyInputFocus(null, 'confirmPin')}
                      onBlur={handleInputBlur}
                      onClick={() => handleAnyInputClick(null, 'confirmPin')}
                      className="w-3/4 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-6 text-sm"
                      placeholder="••••••"
                      minLength="4"
                      maxLength="6"
                      pattern="[0-9]{4,6}"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg 
                shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
                active:shadow-none active:translate-y-[4px] transition-all"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List Section - NOW BELOW THE FORM */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <h2 className="text-lg font-semibold text-gray-800">Employee List</h2>
          </div>
          <button
            onClick={handleAddEmployee}
            className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg flex items-center gap-2 
            shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
            active:shadow-none active:translate-y-[4px] transition-all"
          >
            <Plus size={16} />
            Add New Employee
          </button>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse  overflow-hidden rounded-xl shadow-sm">
            <thead>
              <tr className="bg-primaryExtraLight">
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  SI
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Employee Name
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Available
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                  Created At
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-primaryuppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter(employee => employee.roll !== 'Admin') // Filter out Admin role employees
                .map((employee, index) => (
                <tr key={employee.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {employee.imgurl ? (
                        <img
                          src={employee.imgurl.startsWith('uploads/') ? imageUrls[employee.id] : `data:image/png;base64,${employee.imgurl}`}
                          alt={`${employee.fname} ${employee.lname}`}
                          className="w-8 h-8 object-cover rounded-full"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {employee.fname?.charAt(0)}{employee.lname?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                        <span className="text-xs text-gray-500">
                          {employee.fname?.charAt(0)}{employee.lname?.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {employee.fname} {employee.lname}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{employee.roll}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{employee.phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{employee.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <label className={`relative inline-flex items-center ${toggleLoadingAvailable[employee.id] ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={employee.isavailable === 1}
                        onChange={() => !toggleLoadingAvailable[employee.id] && toggleAvailability(employee.id)}
                        className="sr-only"
                        disabled={toggleLoadingAvailable[employee.id]}
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${employee.isavailable === 1 ? 'bg-primary' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${employee.isavailable === 1 ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                      {toggleLoadingAvailable[employee.id] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <label className={`relative inline-flex items-center ${toggleLoading[employee.id] ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={employee.isActive === 1}
                        onChange={() => !toggleLoading[employee.id] && toggleStatus(employee.id)}
                        className="sr-only"
                        disabled={toggleLoading[employee.id]}
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${employee.isActive === 1 ? 'bg-primary' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${employee.isActive === 1 ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                      {toggleLoading[employee.id] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {employee.created_at ? new Date(employee.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEditEmployee(employee)}
                        className="text-primary hover:text-primary-dark transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(employee)}
                        className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && employeeToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Employee</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this employee? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Employee: <strong>{employeeToDelete.fname} {employeeToDelete.lname}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Role: <strong>{employeeToDelete.roll}</strong>
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteEmployee(employeeToDelete.id)}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
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
        inputValue={newEmployee[activeInput] || ''}
        placeholder="Type here..."
      />
    </div>
  );
};
export default Employee;