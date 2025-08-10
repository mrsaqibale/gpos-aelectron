import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Users,
  X
} from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  
  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  // Load coupons from database
  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const result = await window.myAPI.getAllCoupons();
      if (result.success) {
        // Transform database data to match frontend format
        const transformedCoupons = result.data.map(coupon => ({
          id: coupon.id,
          title: coupon.title,
          customerType: coupon.type || 'All Customers',
          code: coupon.code,
          limitForSameUser: coupon.usage_limit || 0,
          startDate: coupon.start_date ? coupon.start_date.split('T')[0] : '',
          expireDate: coupon.end_date ? coupon.end_date.split('T')[0] : '',
          discountType: coupon.discount_type || 'percentage',
          discount: coupon.amount || 0,
          maxDiscount: coupon.max_discount || 0,
          minPurchase: coupon.min_purchase || 0,
          totalUsers: 0, // This would need to be calculated from usage data
          status: coupon.status === 1 ? 'active' : 'inactive'
        }));
        setCoupons(transformedCoupons);
      } else {
        console.error('Failed to load coupons:', result.message);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const [newCoupon, setNewCoupon] = useState({
    title: '',
    customerType: '',
    code: '',
    limitForSameUser: '',
    startDate: '',
    expireDate: '',
    discountType: 'percentage',
    discount: '',
    maxDiscount: '',
    minPurchase: ''
  });

  const [errors, setErrors] = useState({});

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

  const onKeyboardChange = (input, inputName, buttonType) => {
    // Update the corresponding form field
    if (inputName === 'searchTerm') {
      setSearchTerm(input);
    } else if (inputName) {
      setNewCoupon(prev => ({
        ...prev,
        [inputName]: input
      }));
    }
    
    // Handle special button presses
    if (buttonType === 'enter') {
      // Move to next input field or submit form
      const inputFields = ['title', 'customerType', 'code', 'limitForSameUser', 'startDate', 'expireDate', 'discount', 'maxDiscount', 'minPurchase'];
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newCoupon.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!newCoupon.customerType.trim()) {
      newErrors.customerType = 'Customer type is required';
    }
    
    if (!newCoupon.code.trim()) {
      newErrors.code = 'Code is required';
    }
    
    if (!newCoupon.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!newCoupon.expireDate) {
      newErrors.expireDate = 'Expire date is required';
    }
    
    if (!newCoupon.discount || newCoupon.discount <= 0) {
      newErrors.discount = 'Discount must be greater than 0';
    }
    
    if (newCoupon.discountType === 'percentage' && newCoupon.discount > 100) {
      newErrors.discount = 'Percentage discount cannot exceed 100%';
    }
    
    if (newCoupon.minPurchase && newCoupon.minPurchase < 0) {
      newErrors.minPurchase = 'Minimum purchase cannot be negative';
    }
    
    if (newCoupon.maxDiscount && newCoupon.maxDiscount < 0) {
      newErrors.maxDiscount = 'Maximum discount cannot be negative';
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
      setLoading(true);
      
      if (editingCoupon) {
        // Update existing coupon
        const updateData = {
          title: newCoupon.title,
          type: newCoupon.customerType,
          code: newCoupon.code,
          usage_limit: parseInt(newCoupon.limitForSameUser) || 0,
          start_date: newCoupon.startDate,
          end_date: newCoupon.expireDate,
          discount_type: newCoupon.discountType,
          amount: parseFloat(newCoupon.discount),
          max_discount: parseFloat(newCoupon.maxDiscount) || 0,
          min_purchase: parseFloat(newCoupon.minPurchase) || 0
        };
        
        const result = await window.myAPI.updateCoupon(editingCoupon.id, updateData);
        if (result.success) {
          await loadCoupons(); // Reload data
          setShowForm(false);
          setEditingCoupon(null);
        } else {
          console.error('Failed to update coupon:', result.message);
        }
      } else {
        // Create new coupon
        const createData = {
          title: newCoupon.title,
          type: newCoupon.customerType,
          code: newCoupon.code,
          usage_limit: parseInt(newCoupon.limitForSameUser) || 0,
          start_date: newCoupon.startDate,
          end_date: newCoupon.expireDate,
          discount_type: newCoupon.discountType,
          amount: parseFloat(newCoupon.discount),
          max_discount: parseFloat(newCoupon.maxDiscount) || 0,
          min_purchase: parseFloat(newCoupon.minPurchase) || 0,
          added_by: 1 // TODO: Get current employee ID from context
        };
        
        const result = await window.myAPI.createCoupon(createData);
        if (result.success) {
          await loadCoupons(); // Reload data
          setShowForm(false);
        } else {
          console.error('Failed to create coupon:', result.message);
        }
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      title: coupon.title,
      customerType: coupon.customerType,
      code: coupon.code,
      limitForSameUser: coupon.limitForSameUser.toString(),
      startDate: coupon.startDate,
      expireDate: coupon.expireDate,
      discountType: coupon.discountType,
      discount: coupon.discount.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      minPurchase: coupon.minPurchase.toString()
    });
    setActiveInput(''); // Reset keyboard input
    setShowKeyboard(false); // Hide keyboard when editing coupon
    setShowForm(true);
  };

  const handleDeleteClick = (coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteConfirm(true);
  };

  const deleteCoupon = async (id) => {
    try {
      setLoading(true);
      const result = await window.myAPI.deleteCoupon(id);
      if (result.success) {
        await loadCoupons(); // Reload data
        setShowDeleteConfirm(false);
        setCouponToDelete(null);
      } else {
        console.error('Failed to delete coupon:', result.message);
        alert('Error deleting coupon: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNewCoupon({
      title: '',
      customerType: '',
      code: '',
      limitForSameUser: '',
      startDate: '',
      expireDate: '',
      discountType: 'percentage',
      discount: '',
      maxDiscount: '',
      minPurchase: ''
    });
    setErrors({});
    setActiveInput(''); // Reset keyboard input
    setShowKeyboard(false); // Hide keyboard when resetting
  };

  const handleAddCoupon = () => {
    setEditingCoupon(null);
    setNewCoupon({
      title: '',
      customerType: '',
      code: '',
      limitForSameUser: '',
      startDate: '',
      expireDate: '',
      discountType: 'percentage',
      discount: '',
      maxDiscount: '',
      minPurchase: ''
    });
    setErrors({});
    setActiveInput(''); // Reset keyboard input
    setShowKeyboard(false); // Hide keyboard when adding new coupon
    setShowForm(true);
  };

  const toggleStatus = async (couponId) => {
    try {
      const coupon = coupons.find(c => c.id === couponId);
      const newStatus = coupon.status === 'active' ? 0 : 1; // Convert to database format
      
      const result = await window.myAPI.updateCoupon(couponId, { status: newStatus });
      if (result.success) {
        await loadCoupons(); // Reload data
      } else {
        console.error('Failed to toggle status:', result.message);
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const getFilteredCoupons = () => {
    let filtered = coupons;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(coupon =>
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(coupon => coupon.status === statusFilter);
    }

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDiscountTypeIcon = (type) => {
    return type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />;
  };

  return (
    <div className="space-y-6">
      {/* Coupon Form - NOW AT THE VERY TOP */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">
              {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <div className="flex items-center gap-2">
            
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingCoupon(null);
                  handleReset();
                  setShowKeyboard(false); // Hide keyboard when closing form
                }} 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* First row: Title and Select Customer in 2 columns */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newCoupon.title}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'title')}
                  onClick={(e) => handleAnyInputClick(e, 'title')}
                  onBlur={handleInputBlur}
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="New Coupon"
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Select Customer */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <select
                  name="customerType"
                  value={newCoupon.customerType}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'customerType')}
                  onClick={(e) => handleAnyInputClick(e, 'customerType')}
                  onBlur={handleInputBlur}
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.customerType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select Customer</option>
                  <option value="All Customers">All Customers</option>
                  <option value="New Customers">New Customers</option>
                  <option value="Loyal Customers">Loyal Customers</option>
                  <option value="Delivery Only">Delivery Only</option>
                  <option value="Collection Only">Collection Only</option>
                </select>
                {errors.customerType && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerType}</p>
                )}
              </div>
            </div>

            {/* Second row: Rest of the fields in 3 columns */}
            <div className="grid grid-cols-3 gap-5">
              {/* Code */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={newCoupon.code}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'code')}
                  onClick={(e) => handleAnyInputClick(e, 'code')}
                  onBlur={handleInputBlur}
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., SAVE20"
                  required
                />
                {errors.code && (
                  <p className="text-red-500 text-xs mt-1">{errors.code}</p>
                )}
              </div>

              {/* Limit for same user */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Limit for same user
                </label>
                <input
                  type="number"
                  name="limitForSameUser"
                  value={newCoupon.limitForSameUser}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'limitForSameUser')}
                  onClick={(e) => handleAnyInputClick(e, 'limitForSameUser')}
                  onBlur={handleInputBlur}
                  min="1"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Ex:10"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={newCoupon.startDate}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'startDate')}
                  onClick={(e) => handleAnyInputClick(e, 'startDate')}
                  onBlur={handleInputBlur}
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                )}
              </div>

              {/* Expire Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expire Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="expireDate"
                  value={newCoupon.expireDate}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'expireDate')}
                  onClick={(e) => handleAnyInputClick(e, 'expireDate')}
                  onBlur={handleInputBlur}
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.expireDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.expireDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.expireDate}</p>
                )}
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={newCoupon.discountType}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'discountType')}
                  onClick={(e) => handleAnyInputClick(e, 'discountType')}
                  onBlur={handleInputBlur}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (€)</option>
                </select>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Discount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discount"
                  value={newCoupon.discount}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'discount')}
                  onClick={(e) => handleAnyInputClick(e, 'discount')}
                  onBlur={handleInputBlur}
                  min="0"
                  step="0.01"
                  className={`w-full px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
                    errors.discount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={newCoupon.discountType === 'percentage' ? '20' : '10'}
                  required
                />
                {errors.discount && (
                  <p className="text-red-500 text-xs mt-1">{errors.discount}</p>
                )}
              </div>

              {/* Max Discount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Discount
                </label>
                <input
                  type="number"
                  name="maxDiscount"
                  value={newCoupon.maxDiscount}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'maxDiscount')}
                  onClick={(e) => handleAnyInputClick(e, 'maxDiscount')}
                  onBlur={handleInputBlur}
                  min="0"
                  step="0.01"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="0 (no limit)"
                />
              </div>

              {/* Min Purchase */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Min Purchase
                </label>
                <input
                  type="number"
                  name="minPurchase"
                  value={newCoupon.minPurchase}
                  onChange={handleInputChange}
                  onFocus={(e) => handleAnyInputFocus(e, 'minPurchase')}
                  onClick={(e) => handleAnyInputClick(e, 'minPurchase')}
                  onBlur={handleInputBlur}
                  min="0"
                  step="0.01"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg 
                shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
                active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  editingCoupon ? 'Update Coupon' : 'Submit'
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Coupons List Section - NOW BELOW THE FORM */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            <h2 className="text-lg font-semibold text-gray-800">Coupon List</h2>
          </div>
          <div className="flex items-center gap-3">

            <button
              onClick={handleAddCoupon}
              className="px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg flex items-center gap-2 
              shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
              active:shadow-none active:translate-y-[4px] transition-all"
            >
              <Plus size={16} />
              Add New Coupon
            </button>
          </div>
        </div>

                 {/* Filters */}
         <div className="bg-gray-50 rounded-lg p-4 mb-6">
           <div className="flex justify-end items-center gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
               <input
                 type="text"
                 placeholder="Search coupons..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onFocus={(e) => handleAnyInputFocus(e, 'searchTerm')}
                 onClick={(e) => handleAnyInputClick(e, 'searchTerm')}
                 onBlur={handleInputBlur}
                 className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
               />
             </div>
             
             
             <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
             >
               <option value="all">All Status</option>
               <option value="active">Active</option>
               <option value="inactive">Inactive</option>
             </select>
           </div>
         </div>

         
        {/* Coupons Table */}
        <div className="overflow-x-auto">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading coupons...</span>
            </div>
          )}
          {!loading && (
            <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
              <thead>
                <tr className="bg-primaryExtraLight">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    SI
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Total Users
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Min Purchase
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Max Discount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Discount Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Expire Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Customer Type
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredCoupons().map((coupon, index) => (
                <tr key={coupon.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-900">{coupon.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-medium text-primary">{coupon.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{coupon.discountType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{coupon.totalUsers}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">€{coupon.minPurchase}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">€{coupon.maxDiscount}</span>
                  </td>
                                     <td className="py-3 px-4">
                     <span className="text-sm font-medium text-gray-900">
                       {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `€${coupon.discount}`}
                     </span>
                   </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 capitalize">{coupon.discountType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(coupon.startDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(coupon.expireDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{coupon.customerType}</span>
                  </td>
                  <td className="py-3 px-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={coupon.status === 'active'}
                        onChange={() => toggleStatus(coupon.id)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${coupon.status === 'active' ? 'bg-primary' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${coupon.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleEdit(coupon)}
                        className="text-primary hover:text-primary-dark transition-colors p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(coupon)}
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
        )}
        </div>

        {!loading && getFilteredCoupons().length === 0 && (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No coupons found</p>
            <p className="text-gray-500 text-sm mt-1">Create your first coupon to get started</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && couponToDelete && (
        <div className="fixed inset-0 bg-[#000000a1] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-700 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Coupon</h2>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCouponToDelete(null);
                }}
                className="text-white hover:text-red-700 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this coupon? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Coupon: <strong>{couponToDelete.title}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Code: <strong>{couponToDelete.code}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Discount: <strong>{couponToDelete.discountType === 'percentage' ? `${couponToDelete.discount}%` : `€${couponToDelete.discount}`}</strong>
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCouponToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCoupon(couponToDelete.id)}
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
        inputValue={activeInput === 'searchTerm' ? searchTerm : (newCoupon[activeInput] || '')}
        placeholder="Type here..."
      />
    </div>
  );
}

export default CouponManagement