const { contextBridge, ipcRenderer } = require('electron');

// Window control functions
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window:minimize'),
  // maximize: () => ipcRenderer.send('window:maximize'),
  // close: () => ipcRenderer.send('window:close'),
  // isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  // onMaximizeChange: (callback) => ipcRenderer.on('window:maximize-change', callback),
  // onUnmaximizeChange: (callback) => ipcRenderer.on('window:unmaximize-change', callback)
});

// Login page specific close function
contextBridge.exposeInMainWorld('loginWindowControls', {
  close: () => ipcRenderer.send('window:close'),
});

contextBridge.exposeInMainWorld('myAPI', {
  ping: () => 'pong',

  // Category
 createCategory : (data) => ipcRenderer.invoke('category:create', data),
  updateCategory: (id, updates, originalFilename) => ipcRenderer.invoke('category:update', id, updates, originalFilename),
  getCategoriesByHotel: (hotelId) => ipcRenderer.invoke('category:getByHotel', hotelId),
  getCategoryById: (id) => ipcRenderer.invoke('category:getById', id),
  getCategoryImage: (imagePath) => ipcRenderer.invoke('category:getImage', imagePath),

  // Subcategory
  createSubcategory: (data) => ipcRenderer.invoke('subcategory:create', data),
  updateSubcategory: (id, updates) => ipcRenderer.invoke('subcategory:update', id, updates),
  getSubcategoriesByCategory: (categoryId) => ipcRenderer.invoke('subcategory:getByCategory', categoryId),
  getSubcategoriesByHotel: (hotelId) => ipcRenderer.invoke('subcategory:getByHotel', hotelId),

  // Adon
  createAdon: (data) => ipcRenderer.invoke('adon:create', data),
  updateAdon: (id, updates) => ipcRenderer.invoke('adon:update', id, updates),
  getAdonsByHotel: (hotelId) => ipcRenderer.invoke('adon:getByHotel', hotelId),

  // Allergin
  createAllergin: (data) => ipcRenderer.invoke('allergin:create', data),
  createAllergins: (data) => ipcRenderer.invoke('allergin:createMultiple', data),
  getAllAllergins: () => ipcRenderer.invoke('allergin:getAll'),
  getAllerginById: (id) => ipcRenderer.invoke('allergin:getById', id),
  updateAllergin: (id, updates) => ipcRenderer.invoke('allergin:update', id, updates),
  deleteAllergin: (id) => ipcRenderer.invoke('allergin:delete', id),

  // Food-Allergin relationships
  createFoodAllergin: (data) => ipcRenderer.invoke('foodAllergin:create', data),
  getFoodAllergins: (foodId) => ipcRenderer.invoke('foodAllergin:getByFood', foodId),
  updateFoodAllergins: (foodId, allerginIds) => ipcRenderer.invoke('foodAllergin:update', foodId, allerginIds),
  getAllFoodAllergins: () => ipcRenderer.invoke('foodAllergin:getAll'),

  // Food-Adon relationships
  createFoodAdon: (foodId, adonId) => ipcRenderer.invoke('foodAdon:create', foodId, adonId),
  getFoodAdons: (foodId) => ipcRenderer.invoke('foodAdon:getByFood', foodId),
  getAllFoodAdons: () => ipcRenderer.invoke('foodAdon:getAll'),
  updateFoodAdons: (foodId, adonIds) => ipcRenderer.invoke('foodAdon:update', foodId, adonIds),
  deleteFoodAdon: (foodId, adonId) => ipcRenderer.invoke('foodAdon:delete', foodId, adonId),
  deleteAllFoodAdons: (foodId) => ipcRenderer.invoke('foodAdon:deleteAll', foodId),

  // Food
  createFood: (foodData) => ipcRenderer.invoke('food:create', foodData),
  updateFood: (id, data) => ipcRenderer.invoke('food:update', id, data),
  updateFoodBasic: (id, updates) => ipcRenderer.invoke('food:updateBasic', id, updates),
  getFoodByCategory: (categoryId) => ipcRenderer.invoke('food:getByCategory', categoryId),
  getFoodById: (id) => ipcRenderer.invoke('food:getById', id),
  getFoodBySubcategory: (subcategoryId) => ipcRenderer.invoke('food:getBySubcategory', subcategoryId),
  getAllFoods: () => ipcRenderer.invoke('food:getAll'),
  deleteFood: (id) => ipcRenderer.invoke('food:delete', id),
  updateFoodPosition: (id, position) => ipcRenderer.invoke('food:updatePosition', id, position),
  searchFoodsByName: (name, restaurantId) => ipcRenderer.invoke('food:searchByName', name, restaurantId),
  deleteFoodImage: (foodId) => ipcRenderer.invoke('food:deleteImage', foodId),
  getFoodImage: (imagePath) => ipcRenderer.invoke('food:getImage', imagePath),
  getPizzaFoods: () => ipcRenderer.invoke('food:getPizzaFoods'),
  getFoodIngredients: (foodId) => ipcRenderer.invoke('food:getIngredients', foodId),
  updateFoodIngredients: (foodId, ingredientIds) => ipcRenderer.invoke('food:updateIngredients', foodId, ingredientIds),
  processFoodIngredients: (foodId, categoryId, ingredientNames) => ipcRenderer.invoke('food:processIngredients', foodId, categoryId, ingredientNames),
  createFoodIngredient: (foodId, ingredientId) => ipcRenderer.invoke('food:createFoodIngredient', foodId, ingredientId),
  removeFoodIngredient: (foodId, ingredientId) => ipcRenderer.invoke('food:removeIngredient', foodId, ingredientId),

  // Variations
  createVariation: (variationData) => ipcRenderer.invoke('variation:create', variationData),
  updateVariation: (id, updates) => ipcRenderer.invoke('variation:update', id, updates),
  createVariationOption: (optionData) => ipcRenderer.invoke('variationOption:create', optionData),
  updateVariationOption: (id, updates) => ipcRenderer.invoke('variationOption:update', id, updates),

  // Ingredients
  createIngredient: (data) => ipcRenderer.invoke('ingredient:create', data),
  getAllIngredients: () => ipcRenderer.invoke('ingredient:getAll'),
  getIngredientById: (id) => ipcRenderer.invoke('ingredient:getById', id),
  getIngredientsByCategory: (categoryId) => ipcRenderer.invoke('ingredient:getByCategory', categoryId),
  updateIngredient: (id, updates) => ipcRenderer.invoke('ingredient:update', id, updates),
  deleteIngredient: (id) => ipcRenderer.invoke('ingredient:delete', id),
  searchIngredientsByName: (name) => ipcRenderer.invoke('ingredient:searchByName', name),
  getActiveCategories: (hotelId) => ipcRenderer.invoke('ingredient:getActiveCategories', hotelId),
  createCategoryIngredient: (categoryId, ingredientId) => ipcRenderer.invoke('ingredient:createCategoryIngredient', categoryId, ingredientId),
  checkCategoryIngredientExists: (categoryId, ingredientId) => ipcRenderer.invoke('ingredient:checkCategoryIngredientExists', categoryId, ingredientId),
  getIngredientsByCategoryPaginated: (categoryId, limit, offset) => ipcRenderer.invoke('ingredient:getByCategoryPaginated', categoryId, limit, offset),
  removeCategoryIngredient: (categoryId, ingredientId) => ipcRenderer.invoke('ingredient:removeCategoryIngredient', categoryId, ingredientId),
  getAllIngredientsWithCategories: () => ipcRenderer.invoke('ingredient:getAllWithCategories'),

  // Tables
  tableCreate: (data) => ipcRenderer.invoke('table:create', data),
  tableUpdate: (id, updates) => ipcRenderer.invoke('table:update', id, updates),
  tableGetById: (id) => ipcRenderer.invoke('table:getById', id),
  tableGetAll: () => ipcRenderer.invoke('table:getAll'),
  tableGetByFloor: (floorId) => ipcRenderer.invoke('table:getByFloor', floorId),
  tableGetByFloorWithStatus: (floorId, status) => ipcRenderer.invoke('table:getByFloorWithStatus', floorId, status),
  tableUpdateStatus: (tableId, status) => ipcRenderer.invoke('table:updateStatus', tableId, status),
  tableUpdateMultipleStatuses: (tableIds, status) => ipcRenderer.invoke('table:updateMultipleStatuses', tableIds, status),

  // Floor
  floorCreate: (data) => ipcRenderer.invoke('floor:create', data),
  floorUpdate: (id, updates) => ipcRenderer.invoke('floor:update', id, updates),
  floorGetById: (id) => ipcRenderer.invoke('floor:getById', id),
  floorGetAll: () => ipcRenderer.invoke('floor:getAll'),
  floorAddSampleData: () => ipcRenderer.invoke('floor:addSampleData'),

  // Employee
  createEmployee: (data) => ipcRenderer.invoke('employee:create', data),
  updateEmployee: (id, updates, originalFilename) => ipcRenderer.invoke('employee:update', id, updates, originalFilename),
  getEmployeeById: (id) => ipcRenderer.invoke('employee:getById', id),
  getAllEmployees: () => ipcRenderer.invoke('employee:getAll'),
  loginEmployee: (code, roll) => ipcRenderer.invoke('employee:login', code, roll),
  deleteEmployeeImage: (employeeId) => ipcRenderer.invoke('employee:deleteImage', employeeId),
  getEmployeeImage: (imagePath) => ipcRenderer.invoke('employee:getImage', imagePath),
  checkEmailUnique: (email, excludeId) => ipcRenderer.invoke('employee:checkEmailUnique', email, excludeId),
  checkPhoneUnique: (phone, excludeId) => ipcRenderer.invoke('employee:checkPhoneUnique', phone, excludeId),
  checkPinUnique: (pin, excludeId) => ipcRenderer.invoke('employee:checkPinUnique', pin, excludeId),
  validateEmployeeData: (data, excludeId) => ipcRenderer.invoke('employee:validateData', data, excludeId),
  changeEmployeePassword: (employeeId, oldPin, newPin) => ipcRenderer.invoke('employee:changePassword', employeeId, oldPin, newPin),

  // Register
  createRegister: (data) => ipcRenderer.invoke('register:create', data),
  getRegisterById: (id) => ipcRenderer.invoke('register:getById', id),
  getAllRegisters: () => ipcRenderer.invoke('register:getAll'),
  getRegistersByEmployeeId: (employeeId) => ipcRenderer.invoke('register:getByEmployeeId', employeeId),
  getOpenRegisterByEmployeeId: (employeeId) => ipcRenderer.invoke('register:getOpenRegisterByEmployeeId', employeeId),
  closeRegister: (id, endamount) => ipcRenderer.invoke('register:closeRegister', id, endamount),
  updateRegister: (id, updates) => ipcRenderer.invoke('register:update', id, updates),
  deleteRegister: (id) => ipcRenderer.invoke('register:delete', id),
  getRegisterStatistics: (employeeId, startDate, endDate) => ipcRenderer.invoke('register:getStatistics', employeeId, startDate, endDate),

  // Employee Login
  createEmployeeLogin: (employeeId) => ipcRenderer.invoke('employeeLogin:create', employeeId),
  updateEmployeeLogout: (employeeId) => ipcRenderer.invoke('employeeLogin:logout', employeeId),
  getEmployeeLoginSessions: (employeeId, limit, offset) => ipcRenderer.invoke('employeeLogin:getSessions', employeeId, limit, offset),
  getCurrentEmployeeSession: (employeeId) => ipcRenderer.invoke('employeeLogin:getCurrentSession', employeeId),
  getAllLoginSessions: (limit, offset) => ipcRenderer.invoke('employeeLogin:getAllSessions', limit, offset),

                // Customer
  createCustomer: (data) => ipcRenderer.invoke('customer:create', data),
  createCustomerWithAddresses: (data) => ipcRenderer.invoke('customer:createWithAddresses', data),
  updateCustomer: (id, updates) => ipcRenderer.invoke('customer:update', id, updates),
  getCustomerById: (id) => ipcRenderer.invoke('customer:getById', id),
  getCustomersByHotelId: (hotelId) => ipcRenderer.invoke('customer:getByHotelId', hotelId),
  searchCustomerByPhone: (phone) => ipcRenderer.invoke('customer:searchByPhone', phone),
  searchCustomerByName: (name) => ipcRenderer.invoke('customer:searchByName', name),
  getCustomerAddresses: (customerId) => ipcRenderer.invoke('address:getByCustomer', customerId),
  deleteAddress: (id) => ipcRenderer.invoke('address:delete', id),
  
  // Customer Management with Order Statistics
  getCustomersWithOrderStats: (hotelId, limit, offset) => ipcRenderer.invoke('customer:getWithOrderStats', hotelId, limit, offset),
  getCustomersCount: (hotelId) => ipcRenderer.invoke('customer:getCount', hotelId),
  searchCustomersWithOrderStats: (searchTerm, hotelId, limit, offset) => ipcRenderer.invoke('customer:searchWithOrderStats', searchTerm, hotelId, limit, offset),
  getCustomerOrders: (customerId, limit, offset) => ipcRenderer.invoke('customer:getOrders', customerId, limit, offset),
  getCustomerOrderCount: (customerId) => ipcRenderer.invoke('customer:getOrderCount', customerId),

  // Address
  createAddress: (data) => ipcRenderer.invoke('address:create', data),
  getCustomerAddresses: (customerId) => ipcRenderer.invoke('address:getByCustomer', customerId),
  updateAddress: (id, updates) => ipcRenderer.invoke('address:update', id, updates),
  deleteAddress: (id) => ipcRenderer.invoke('address:delete', id),

  // Reservation
  createReservation: (data) => ipcRenderer.invoke('reservation:create', data),
  updateReservation: (id, updates) => ipcRenderer.invoke('reservation:update', id, updates),
  getReservationById: (id) => ipcRenderer.invoke('reservation:getById', id),
  getReservationsByHotelId: (hotelId, limit, offset) => ipcRenderer.invoke('reservation:getByHotelId', hotelId, limit, offset),
  getReservationsByStatus: (status, hotelId, limit, offset) => ipcRenderer.invoke('reservation:getByStatus', status, hotelId, limit, offset),
  getReservationsByDateRange: (startDate, endDate, hotelId) => ipcRenderer.invoke('reservation:getByDateRange', startDate, endDate, hotelId),
  getReservationsByCustomerId: (customerId, limit, offset) => ipcRenderer.invoke('reservation:getByCustomerId', customerId, limit, offset),
  deleteReservation: (id) => ipcRenderer.invoke('reservation:delete', id),
  getReservationsCount: (hotelId, status) => ipcRenderer.invoke('reservation:getCount', hotelId, status),

  // Orders
  createOrder: (data) => ipcRenderer.invoke('order:create', data),
  updateOrder: (id, updates) => ipcRenderer.invoke('order:update', id, updates),
  updateOrderStatus: (id, status, updatedBy) => ipcRenderer.invoke('order:updateStatus', id, status, updatedBy),
  getOrderById: (id) => ipcRenderer.invoke('order:getById', id),
  getAllOrders: (limit, offset) => ipcRenderer.invoke('order:getAll', limit, offset),
  getOrdersByStatus: (status, limit, offset) => ipcRenderer.invoke('order:getByStatus', status, limit, offset),
  getOrdersByCustomer: (customerId, limit, offset) => ipcRenderer.invoke('order:getByCustomer', customerId, limit, offset),
  getOrdersByDateRange: (startDate, endDate, limit, offset) => ipcRenderer.invoke('order:getByDateRange', startDate, endDate, limit, offset),
  cancelOrder: (id, reason, canceledBy, note) => ipcRenderer.invoke('order:cancel', id, reason, canceledBy, note),
  getOrderStatistics: (startDate, endDate) => ipcRenderer.invoke('order:getStatistics', startDate, endDate),
  deleteOrder: (id) => ipcRenderer.invoke('order:delete', id),

  // Order Details
  createOrderDetail: (data) => ipcRenderer.invoke('orderDetail:create', data),
  createMultipleOrderDetails: (orderDetailsArray) => ipcRenderer.invoke('orderDetail:createMultiple', orderDetailsArray),
  updateOrderDetail: (id, updates) => ipcRenderer.invoke('orderDetail:update', id, updates),
  getOrderDetailById: (id) => ipcRenderer.invoke('orderDetail:getById', id),
  getOrderDetailsByOrderId: (orderId) => ipcRenderer.invoke('orderDetail:getByOrderId', orderId),
  getOrderDetailsByFoodId: (foodId, limit, offset) => ipcRenderer.invoke('orderDetail:getByFoodId', foodId, limit, offset),
  getAllOrderDetails: (limit, offset) => ipcRenderer.invoke('orderDetail:getAll', limit, offset),
      deleteOrderDetail: (id) => ipcRenderer.invoke('orderDetail:delete', id),
    deleteOrderDetailsByOrderId: (orderId) => ipcRenderer.invoke('orderDetail:deleteByOrderId', orderId),
  getOrderDetailsWithFood: (orderId) => ipcRenderer.invoke('orderDetail:getWithFood', orderId),
  getOrderDetailsStatistics: (startDate, endDate) => ipcRenderer.invoke('orderDetail:getStatistics', startDate, endDate),
  getTopSellingFoods: (limit, startDate, endDate) => ipcRenderer.invoke('orderDetail:getTopSellingFoods', limit, startDate, endDate),
  calculateOrderTotal: (orderId) => ipcRenderer.invoke('orderDetail:calculateOrderTotal', orderId),

  // Coupon
  createCoupon: (data) => ipcRenderer.invoke('coupon:create', data),
  updateCoupon: (id, updates) => ipcRenderer.invoke('coupon:update', id, updates),
  getAllCoupons: () => ipcRenderer.invoke('coupon:getAll'),
  getCouponById: (id) => ipcRenderer.invoke('coupon:getById', id),
  getCouponsByCustomerId: (customerId) => ipcRenderer.invoke('coupon:getByCustomerId', customerId),
  deleteCoupon: (id) => ipcRenderer.invoke('coupon:delete', id),
  searchCouponByCode: (code) => ipcRenderer.invoke('coupon:searchByCode', code),

  // Voucher
  createVoucher: (data) => ipcRenderer.invoke('voucher:create', data),
  updateVoucher: (id, updates) => ipcRenderer.invoke('voucher:update', id, updates),
  getAllVouchers: () => ipcRenderer.invoke('voucher:getAll'),
  getVoucherById: (id) => ipcRenderer.invoke('voucher:getById', id),
  deleteVoucher: (id) => ipcRenderer.invoke('voucher:delete', id),
  searchVoucherByCode: (code) => ipcRenderer.invoke('voucher:searchByCode', code),

  // Hotel

  // Attendance Management
  attendanceCreate: (data) => ipcRenderer.invoke('attendance-create', data),
  attendanceGetByEmployee: (employeeId, startDate, endDate) => ipcRenderer.invoke('attendance-get-by-employee', { employeeId, startDate, endDate }),
  attendanceGetByDateRange: (startDate, endDate) => ipcRenderer.invoke('attendance-get-by-date-range', { startDate, endDate }),
  attendanceGetByDate: (date) => ipcRenderer.invoke('attendance-get-by-date', date),
  attendanceUpdate: (id, updateData) => ipcRenderer.invoke('attendance-update', { id, updateData }),
  attendanceDelete: (id) => ipcRenderer.invoke('attendance-delete', id),
  attendanceGetStatistics: (startDate, endDate) => ipcRenderer.invoke('attendance-get-statistics', { startDate, endDate }),
  attendanceCheckTodayStatus: (employeeId, date) => ipcRenderer.invoke('attendance-check-today-status', { employeeId, date }),
  attendanceGetEmployeeSummary: (employeeId, month, year) => ipcRenderer.invoke('attendance-get-employee-summary', { employeeId, month, year }),
  attendanceGetLateEmployees: (date) => ipcRenderer.invoke('attendance-get-late-employees', date),
  attendanceGetAbsentEmployees: (date) => ipcRenderer.invoke('attendance-get-absent-employees', date),
  attendanceBulkCreate: (records) => ipcRenderer.invoke('attendance-bulk-create', records),

  // Salary Payments
  salaryPaymentCreate: (data) => ipcRenderer.invoke('salary-payment-create', data),
  salaryPaymentGetByEmployee: (employeeId, startDate, endDate) => ipcRenderer.invoke('salary-payment-get-by-employee', { employeeId, startDate, endDate }),
  salaryPaymentGetByDateRange: (startDate, endDate) => ipcRenderer.invoke('salary-payment-get-by-date-range', { startDate, endDate }),
  salaryPaymentGetById: (id) => ipcRenderer.invoke('salary-payment-get-by-id', id),
  salaryPaymentUpdate: (id, updateData) => ipcRenderer.invoke('salary-payment-update', { id, updateData }),
  salaryPaymentDelete: (id) => ipcRenderer.invoke('salary-payment-delete', id),
  salaryPaymentGetTotalPaid: (employeeId, startDate, endDate) => ipcRenderer.invoke('salary-payment-get-total-paid', { employeeId, startDate, endDate }),
  salaryPaymentGetStatistics: (startDate, endDate) => ipcRenderer.invoke('salary-payment-get-statistics', { startDate, endDate }),
  salaryPaymentGetPending: () => ipcRenderer.invoke('salary-payment-get-pending'),
  salaryPaymentGetHistory: (employeeId, limit) => ipcRenderer.invoke('salary-payment-get-history', { employeeId, limit }),
  salaryPaymentGetByMethod: (method, startDate, endDate) => ipcRenderer.invoke('salary-payment-get-by-method', { method, startDate, endDate }),
  salaryPaymentGetMonthlySummary: (month, year) => ipcRenderer.invoke('salary-payment-get-monthly-summary', { month, year }),
  salaryPaymentGetYearlySummary: (year) => ipcRenderer.invoke('salary-payment-get-yearly-summary', year),
  salaryPaymentCheckPending: (employeeId) => ipcRenderer.invoke('salary-payment-check-pending', employeeId),
  salaryPaymentGetMethodsSummary: (startDate, endDate) => ipcRenderer.invoke('salary-payment-get-methods-summary', { startDate, endDate }),

  // Leave Requests
  leaveRequestCreate: (data) => ipcRenderer.invoke('leave-request-create', data),
  leaveRequestGetByEmployee: (employeeId, status) => ipcRenderer.invoke('leave-request-get-by-employee', { employeeId, status }),
  leaveRequestGetById: (id) => ipcRenderer.invoke('leave-request-get-by-id', id),
  leaveRequestGetAll: (filters) => ipcRenderer.invoke('leave-request-get-all', filters),
  leaveRequestGetPending: () => ipcRenderer.invoke('leave-request-get-pending'),
  leaveRequestGetApproved: (startDate, endDate) => ipcRenderer.invoke('leave-request-get-approved', { startDate, endDate }),
  leaveRequestGetRejected: () => ipcRenderer.invoke('leave-request-get-rejected'),
  leaveRequestUpdate: (id, updateData) => ipcRenderer.invoke('leave-request-update', { id, updateData }),
  leaveRequestApprove: (id, approvedBy, approvedAt) => ipcRenderer.invoke('leave-request-approve', { id, approvedBy, approvedAt }),
  leaveRequestReject: (id, rejectedBy, rejectionReason, rejectedAt) => ipcRenderer.invoke('leave-request-reject', { id, rejectedBy, rejectionReason, rejectedAt }),
  leaveRequestDelete: (id) => ipcRenderer.invoke('leave-request-delete', id),
  leaveRequestGetByDateRange: (startDate, endDate, status) => ipcRenderer.invoke('leave-request-get-by-date-range', { startDate, endDate, status }),
  leaveRequestGetByType: (leaveType, startDate, endDate) => ipcRenderer.invoke('leave-request-get-by-type', { leaveType, startDate, endDate }),
  leaveRequestGetStatistics: (startDate, endDate) => ipcRenderer.invoke('leave-request-get-statistics', { startDate, endDate }),
  leaveRequestGetEmployeeBalance: (employeeId, year) => ipcRenderer.invoke('leave-request-get-employee-balance', { employeeId, year }),
  leaveRequestCheckOverlapping: (employeeId, startDate, endDate, excludeId) => ipcRenderer.invoke('leave-request-check-overlapping', { employeeId, startDate, endDate, excludeId }),
  leaveRequestGetMonthlySummary: (month, year) => ipcRenderer.invoke('leave-request-get-monthly-summary', { month, year }),
  leaveRequestGetYearlySummary: (year) => ipcRenderer.invoke('leave-request-get-yearly-summary', year),
  leaveRequestGetStatusCounts: () => ipcRenderer.invoke('leave-request-get-status-counts'),
  leaveRequestGetNeedingApproval: () => ipcRenderer.invoke('leave-request-get-needing-approval'),
  checkHotelStatus: () => ipcRenderer.invoke('check-hotel-status'),
  getHotelInfo: () => ipcRenderer.invoke('get-hotel-info'),
  createOrUpdateHotel: (hotelData) => ipcRenderer.invoke('create-or-update-hotel', hotelData),
  updateHotelStatus: (status) => ipcRenderer.invoke('update-hotel-status', status),
  checkHotelTable: () => ipcRenderer.invoke('check-hotel-table'),
  getDatabasePath: () => ipcRenderer.invoke('get-database-path'),

});

contextBridge.exposeInMainWorld('api', {
  // Categories
  getCategories: (hotelId) => ipcRenderer.invoke('get-categories', hotelId),
  createCategory: (data) => ipcRenderer.invoke('create-category', data),
  // Adons
  getAdons: (hotelId) => ipcRenderer.invoke('get-adons', hotelId),
  createAdon: (data) => ipcRenderer.invoke('create-adon', data),
  // Subcategories
  getSubcategories: (hotelId) => ipcRenderer.invoke('get-subcategories', hotelId),
  createSubcategory: (data) => ipcRenderer.invoke('create-subcategory', data),
  // ...add more as needed

  // Employees (mirror commonly used functions for convenience)
  getAllEmployees: () => ipcRenderer.invoke('employee:getAll'),
  getEmployeeById: (id) => ipcRenderer.invoke('employee:getById', id),

  // Attendance (subset required by EmployeeAttendance.jsx)
  attendanceCreate: (data) => ipcRenderer.invoke('attendance-create', data),
  attendanceGetByEmployee: (employeeId, startDate, endDate) => ipcRenderer.invoke('attendance-get-by-employee', { employeeId, startDate, endDate }),
  attendanceUpdate: (id, updateData) => ipcRenderer.invoke('attendance-update', { id, updateData }),
  attendanceCheckTodayStatus: (employeeId, date) => ipcRenderer.invoke('attendance-check-today-status', { employeeId, date }),

  // Salary Payments (subset required by EmployeeAttendance.jsx)
  salaryPaymentCreate: (data) => ipcRenderer.invoke('salary-payment-create', data),
  salaryPaymentGetByEmployee: (employeeId, startDate, endDate) => ipcRenderer.invoke('salary-payment-get-by-employee', { employeeId, startDate, endDate }),

  // Leave Requests (subset required by EmployeeAttendance.jsx)
  leaveRequestCreate: (data) => ipcRenderer.invoke('leave-request-create', data),
  leaveRequestCheckOverlapping: (employeeId, startDate, endDate, excludeId) => ipcRenderer.invoke('leave-request-check-overlapping', { employeeId, startDate, endDate, excludeId }),
});

// Expose electronAPI for components that use it
contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, callback),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

// others





// Settings API
contextBridge.exposeInMainWorld('settingsAPI', {
  get: () => ipcRenderer.invoke('settings:get'),
  upsert: (data) => ipcRenderer.invoke('settings:upsert', data),
  checkTable: () => ipcRenderer.invoke('settings:checkTable'),
});