const { contextBridge, ipcRenderer } = require('electron');

// Window control functions
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizeChange: (callback) => ipcRenderer.on('window:maximize-change', callback),
  onUnmaximizeChange: (callback) => ipcRenderer.on('window:unmaximize-change', callback)
});

contextBridge.exposeInMainWorld('myAPI', {
  ping: () => 'pong',

  // Category
 createCategory : (data) => ipcRenderer.invoke('category:create', data),
  updateCategory: (id, updates) => ipcRenderer.invoke('category:update', id, updates),
  getCategoriesByHotel: (hotelId) => ipcRenderer.invoke('category:getByHotel', hotelId),
  getCategoryById: (id) => ipcRenderer.invoke('category:getById', id),

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

  // Food
  createFood: (foodData) => ipcRenderer.invoke('food:create', foodData),
  updateFood: (id, data) => ipcRenderer.invoke('food:update', id, data),
  getFoodByCategory: (categoryId) => ipcRenderer.invoke('food:getByCategory', categoryId),
  getFoodById: (id) => ipcRenderer.invoke('food:getById', id),
  getFoodBySubcategory: (subcategoryId) => ipcRenderer.invoke('food:getBySubcategory', subcategoryId),
  getAllFoods: () => ipcRenderer.invoke('food:getAll'),
  deleteFood: (id) => ipcRenderer.invoke('food:delete', id),
  updateFoodPosition: (id, position) => ipcRenderer.invoke('food:updatePosition', id, position),
  searchFoodsByName: (name, restaurantId) => ipcRenderer.invoke('food:searchByName', name, restaurantId),

  // Tables
  tableCreate: (data) => ipcRenderer.invoke('table:create', data),
  tableUpdate: (id, updates) => ipcRenderer.invoke('table:update', id, updates),
  tableGetById: (id) => ipcRenderer.invoke('table:getById', id),
  tableGetAll: () => ipcRenderer.invoke('table:getAll'),
  tableGetByFloor: (floorId) => ipcRenderer.invoke('table:getByFloor', floorId),

  // Floor
  floorCreate: (data) => ipcRenderer.invoke('floor:create', data),
  floorUpdate: (id, updates) => ipcRenderer.invoke('floor:update', id, updates),
  floorGetById: (id) => ipcRenderer.invoke('floor:getById', id),
  floorGetAll: () => ipcRenderer.invoke('floor:getAll'),

  // Employee
  createEmployee: (data) => ipcRenderer.invoke('employee:create', data),
  updateEmployee: (id, updates) => ipcRenderer.invoke('employee:update', id, updates),
  getEmployeeById: (id) => ipcRenderer.invoke('employee:getById', id),
  getAllEmployees: () => ipcRenderer.invoke('employee:getAll'),
  loginEmployee: (code, roll) => ipcRenderer.invoke('employee:login', code, roll),

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
  createCustomerWithAddresses: (data) => ipcRenderer.invoke('customer:createWithAddresses', data),

  // Address
  createAddress: (data) => ipcRenderer.invoke('address:create', data),
  getCustomerAddresses: (customerId) => ipcRenderer.invoke('address:getByCustomer', customerId),
  updateAddress: (id, updates) => ipcRenderer.invoke('address:update', id, updates),
  deleteAddress: (id) => ipcRenderer.invoke('address:delete', id),

  // Orders
  createOrder: (data) => ipcRenderer.invoke('order:create', data),
  updateOrder: (id, updates) => ipcRenderer.invoke('order:update', id, updates),
  updateOrderStatus: (id, status, updatedBy) => ipcRenderer.invoke('order:updateStatus', id, status, updatedBy),
  getOrderById: (id) => ipcRenderer.invoke('order:getById', id),
  getOrdersByRestaurant: (restaurantId, limit, offset) => ipcRenderer.invoke('order:getByRestaurant', restaurantId, limit, offset),
  getOrdersByStatus: (restaurantId, status, limit, offset) => ipcRenderer.invoke('order:getByStatus', restaurantId, status, limit, offset),
  getOrdersByCustomer: (customerId, limit, offset) => ipcRenderer.invoke('order:getByCustomer', customerId, limit, offset),
  cancelOrder: (id, reason, canceledBy, note) => ipcRenderer.invoke('order:cancel', id, reason, canceledBy, note),
  requestRefund: (id, reason) => ipcRenderer.invoke('order:requestRefund', id, reason),
  processRefund: (id, processedBy) => ipcRenderer.invoke('order:processRefund', id, processedBy),
  getOrderStatistics: (restaurantId, startDate, endDate) => ipcRenderer.invoke('order:getStatistics', restaurantId, startDate, endDate),
  deleteOrder: (id) => ipcRenderer.invoke('order:delete', id),

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
});

// others




