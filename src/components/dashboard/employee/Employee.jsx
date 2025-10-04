import React, { useState, useEffect } from 'react';
import { Edit, Plus, X, Trash2 } from 'lucide-react';
import NewEmployeeForm from './NewEmployeeForm';
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
  const [showSearchKeyboard, setShowSearchKeyboard] = useState(false);
  
  // Filter, Search and Pagination state
  const [filterRole, setFilterRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    role: '',
    nationality: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    pin: '',
    confirmPin: '',
    salaryPerHour: '',
    image: null,
    vehicleNumber: '',
    vehicleType: '',
    licenseNumber: '',
    licenseExpiry: '',
    joiningDate: '',
    shiftStartTime: '',
    shiftEndTime: '',
    salarySchedule: '',
    resignationDate: ''
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
      dateOfBirth: employee.date_of_birth || '',
      role: employee.roll || '',
      nationality: employee.nationality || '',
      phone: employee.phone || '',
      email: employee.email || '',
      address: employee.address || '',
      notes: employee.notes || '',
      pin: '',
      confirmPin: '',
      salaryPerHour: employee.salary_per_hour || '',
      image: null,
      vehicleNumber: employee.vnumber || '',
      vehicleType: employee.vtype || '',
      licenseNumber: employee.license_number || '',
      licenseExpiry: employee.license_expiry || '',
      joiningDate: employee.joining_date || '',
      shiftStartTime: employee.shift_start_time || '',
      shiftEndTime: employee.shift_end_time || '',
      salarySchedule: employee.salary_schedule || '',
      resignationDate: employee.resignation_date || ''
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
      dateOfBirth: '',
      role: '',
      nationality: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      pin: '',
      confirmPin: '',
      salaryPerHour: '',
      image: null,
      vehicleNumber: '',
      vehicleType: '',
      licenseNumber: '',
      licenseExpiry: '',
      joiningDate: '',
      shiftStartTime: '',
      shiftEndTime: '',
      salarySchedule: '',
      resignationDate: ''
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
        date_of_birth: newEmployee.dateOfBirth,
        roll: newEmployee.role,
        nationality: newEmployee.nationality,
        phone: newEmployee.phone,
        email: newEmployee.email,
        address: newEmployee.address,
        notes: newEmployee.notes,
        pin: newEmployee.pin,
        code: newEmployee.pin, // Using PIN as code for now
        salary_per_hour: newEmployee.salaryPerHour,
        joining_date: newEmployee.joiningDate,
        shift_start_time: newEmployee.shiftStartTime,
        shift_end_time: newEmployee.shiftEndTime,
        salary_schedule: newEmployee.salarySchedule,
        resignation_date: newEmployee.resignationDate,
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
      dateOfBirth: '',
      role: '',
      nationality: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      pin: '',
      confirmPin: '',
      salaryPerHour: '',
      image: null,
      vehicleNumber: '',
      vehicleType: '',
      licenseNumber: '',
      licenseExpiry: '',
      joiningDate: '',
      shiftStartTime: '',
      shiftEndTime: '',
      salarySchedule: '',
      resignationDate: ''
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

  // Search keyboard handlers
  const handleSearchFocus = () => {
    setShowSearchKeyboard(true);
  };

  const handleSearchBlur = (e) => {
    // Check if the focus is moving to a keyboard element
    if (e.relatedTarget && e.relatedTarget.closest('.hg-theme-default')) {
      return; // Don't hide keyboard if focus moved to keyboard
    }
    
    setTimeout(() => {
      setShowSearchKeyboard(false);
    }, 100);
  };

  const handleSearchKeyboardChange = (input) => {
    setSearchQuery(input);
  };

  const handleSearchKeyboardClose = () => {
    setShowSearchKeyboard(false);
  };

  // Filter and Search logic
  const filteredEmployees = employees
    .filter(employee => employee.roll !== 'Admin') // Filter out Admin role
    .filter(employee => {
      // Filter by role
      if (filterRole && employee.roll !== filterRole) return false;
      
      // Search by name or phone
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${employee.fname} ${employee.lname}`.toLowerCase();
        const phone = employee.phone?.toLowerCase() || '';
        return fullName.includes(query) || phone.includes(query);
      }
      
      return true;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRole, searchQuery, itemsPerPage]);

  // Generate Employee ID
  const generateEmpId = (id) => {
    return `EMP${String(id).padStart(3, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Employee Form - NOW AT THE VERY TOP */}
      <NewEmployeeForm
        showForm={showForm}
        setShowForm={setShowForm}
        editingEmployee={editingEmployee}
        newEmployee={newEmployee}
        setNewEmployee={setNewEmployee}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        handleReset={handleReset}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        pinError={pinError}
        emailError={emailError}
        phoneError={phoneError}
        showPin={showPin}
        setShowPin={setShowPin}
        showConfirmPin={showConfirmPin}
        setShowConfirmPin={setShowConfirmPin}
        handleAnyInputFocus={handleAnyInputFocus}
        handleInputBlur={handleInputBlur}
        handleAnyInputClick={handleAnyInputClick}
        showKeyboard={showKeyboard}
        activeInput={activeInput}
        handleKeyboardClose={handleKeyboardClose}
        onKeyboardChange={onKeyboardChange}
      />

      {/* Employee List Section - NOW BELOW THE FORM */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Filter and Search Bar */}
        <div className="flex justify-between items-center mb-6 gap-4">
          {/* Left side - Filter and Show */}
          <div className="flex items-center gap-4">
            {/* Filter by Role */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Roles</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                <option value="Sweeper">Sweeper</option>
                <option value="Delivery Man">Delivery Man</option>
              </select>
            </div>

            {/* Show Items Per Page */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
        
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name or phone"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onClick={handleSearchFocus}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <button
            onClick={handleAddEmployee}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Add New Employee
          </button>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SI
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  JOINING DATE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  EMP ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  NAME
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  PHONE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ROTA START
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ROTA END
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  PER HOUR SALARY
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => (
                <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* SI */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{indexOfFirstItem + index + 1}</span>
                  </td>
                  
                  {/* JOINING DATE */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">
                      {employee.joining_date 
                        ? new Date(employee.joining_date).toLocaleDateString('en-CA')
                        : employee.created_at 
                          ? new Date(employee.created_at).toLocaleDateString('en-CA')
                          : '-'
                      }
                    </span>
                  </td>
                  
                  {/* ROLE */}
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      employee.roll === 'Manager' ? 'bg-blue-100 text-blue-800' :
                      employee.roll === 'Driver' || employee.roll === 'Delivery Man' ? 'bg-yellow-100 text-yellow-800' :
                      employee.roll === 'Chef' ? 'bg-red-100 text-red-800' :
                      employee.roll === 'Waiter' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.roll}
                    </span>
                  </td>
                  
                  {/* EMP ID */}
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{generateEmpId(employee.id)}</span>
                  </td>
                  
                  {/* NAME */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{employee.fname} {employee.lname}</span>
                  </td>
                  
                  {/* PHONE */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{employee.phone}</span>
                  </td>
                  
                  {/* ROTA START */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">
                      {employee.shift_start_time || '-'}
                    </span>
                  </td>
                  
                  {/* ROTA END */}
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">
                      {employee.shift_end_time || '-'}
                    </span>
                  </td>
                  
                  {/* PER HOUR SALARY */}
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">
                      €{employee.salary_per_hour ? Number(employee.salary_per_hour).toFixed(2) : '0.00'}
                    </span>
                  </td>
                  
                  {/* STATUS */}
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      employee.resignation_date ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {employee.resignation_date ? 'RESIGNED' : 'AVAILABLE'}
                    </span>
                  </td>
                  
                  {/* ACTION */}
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(employee)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === i + 1
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
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

      {/* Virtual Keyboard for Search Bar */}
      <VirtualKeyboard
        isVisible={showSearchKeyboard}
        onClose={handleSearchKeyboardClose}
        activeInput="search"
        onInputChange={handleSearchKeyboardChange}
        onInputBlur={handleSearchBlur}
        inputValue={searchQuery}
        placeholder="Search by name or phone..."
      />
    </div>
  );
};
export default Employee;