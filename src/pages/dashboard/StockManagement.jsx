import React, { useState, useEffect } from "react";
import { 
  Package, 
  Truck, 
  Plus, 
  Search, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2, 
  Filter,
  Calendar,
  List,
  Grid
} from "lucide-react";

const StockManagement = () => {
  const [activeTab, setActiveTab] = useState('stock'); // Default to stock management
  
  // Check if we should start on suppliers tab (when coming from Suppliers button)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'suppliers') {
      setActiveTab('suppliers');
    }
  }, []);
  const [stockItems, setStockItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredStock, setFilteredStock] = useState([]);

  // Mock data for demonstration
  const mockStockData = [
    {
      id: 1,
      stockItem: "Tomatoes",
      qty: 100,
      consumed: 25,
      currentStock: 75,
      lowStock: 20,
      dateAdded: "2024-01-15"
    },
    {
      id: 2,
      stockItem: "Onions",
      qty: 80,
      consumed: 40,
      currentStock: 40,
      lowStock: 15,
      dateAdded: "2024-01-14"
    },
    {
      id: 3,
      stockItem: "Cheese",
      qty: 50,
      consumed: 15,
      currentStock: 35,
      lowStock: 10,
      dateAdded: "2024-01-16"
    },
    {
      id: 4,
      stockItem: "Bread",
      qty: 30,
      consumed: 28,
      currentStock: 2,
      lowStock: 5,
      dateAdded: "2024-01-13"
    },
    {
      id: 5,
      stockItem: "Milk",
      qty: 60,
      consumed: 35,
      currentStock: 25,
      lowStock: 12,
      dateAdded: "2024-01-17"
    }
  ];

  const mockSuppliersData = [
    {
      id: 1,
      name: "Fresh Produce Co.",
      contact: "+1-555-0123",
      email: "orders@freshproduce.com",
      address: "123 Market St, City"
    },
    {
      id: 2,
      name: "Dairy Direct",
      contact: "+1-555-0456",
      email: "supply@dairydirect.com",
      address: "456 Farm Rd, County"
    }
  ];

  useEffect(() => {
    // Load initial data
    setStockItems(mockStockData);
    setSuppliers(mockSuppliersData);
    setFilteredStock(mockStockData);
  }, []);

  // Filter stock items based on search term and date range
  useEffect(() => {
    let filtered = stockItems;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.stockItem.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.dateAdded) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.dateAdded) <= new Date(dateTo)
      );
    }

    setFilteredStock(filtered);
  }, [searchTerm, dateFrom, dateTo, stockItems]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStockItems(mockStockData);
      setSuppliers(mockSuppliersData);
      setIsLoading(false);
    }, 1000);
  };

  const handleViewStock = (item) => {
    console.log("View stock item:", item);
    // Implement view functionality
  };

  const handleEditStock = (item) => {
    console.log("Edit stock item:", item);
    // Implement edit functionality
  };

  const handleDeleteStock = (item) => {
    console.log("Delete stock item:", item);
    // Implement delete functionality
  };

  const handleAddNewStock = () => {
    console.log("Add new stock item");
    // Implement add functionality
  };

  const handleAddNewSupplier = () => {
    console.log("Add new supplier");
    // Implement add supplier functionality
  };

  const getStockStatusColor = (currentStock, lowStock) => {
    if (currentStock <= lowStock) {
      return "text-red-600 bg-red-100";
    } else if (currentStock <= lowStock * 2) {
      return "text-yellow-600 bg-yellow-100";
    } else {
      return "text-green-600 bg-green-100";
    }
  };

  const getStockStatusText = (currentStock, lowStock) => {
    if (currentStock <= lowStock) {
      return "Low Stock";
    } else if (currentStock <= lowStock * 2) {
      return "Medium";
    } else {
      return "Good";
    }
  };

  // Stock Management Content Component
  const StockManagementContent = () => (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Stock List</h2>
        <div className="flex items-center gap-3">
          {/* Search and Filter Section */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by item name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Date From"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Date To"
              />
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleAddNewStock}
            className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Stock
          </button>
        </div>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
        <thead>
          <tr className="bg-primaryExtraLight">
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Stock Item
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Qty
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Consumed
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Current Stock
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Low Stock
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredStock.map((item, index) => (
            <tr key={item.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-4 px-6">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.stockItem}</div>
                  <div className="text-xs text-gray-500">Added: {item.dateAdded}</div>
                </div>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm font-medium text-gray-900">{item.qty}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-600">{item.consumed}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm font-medium text-gray-900">{item.currentStock}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-600">{item.lowStock}</span>
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.currentStock, item.lowStock)}`}>
                  {getStockStatusText(item.currentStock, item.lowStock)}
                </span>
              </td>
              <td className="py-4 px-6">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewStock(item)}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => handleEditStock(item)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                    title="Edit Item"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteStock(item)}
                    className="text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredStock.length === 0 && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No stock items found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm || dateFrom || dateTo ? "Try adjusting your search criteria" : "Add your first stock item to get started"}
          </p>
        </div>
      )}
    </div>
  );

  // Suppliers Management Content Component
  const SuppliersManagementContent = () => (
    <div className="overflow-x-auto bg-white py-5 px-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Suppliers List</h2>
        <button
          onClick={handleAddNewSupplier}
          className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add New Supplier
        </button>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
        <thead>
          <tr className="bg-primaryExtraLight">
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Supplier Name
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Contact
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Address
            </th>
            <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier, index) => (
            <tr key={supplier.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-4 px-6">
                <span className="text-sm font-medium text-gray-900">{supplier.name}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-600">{supplier.contact}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-600">{supplier.email}</span>
              </td>
              <td className="py-4 px-6">
                <span className="text-sm text-gray-600">{supplier.address}</span>
              </td>
              <td className="py-4 px-6">
                <div className="flex gap-2">
                  <button 
                    onClick={() => console.log("View supplier:", supplier)}
                    className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => console.log("Edit supplier:", supplier)}
                    className="text-primary hover:text-primaryDark cursor-pointer transition-colors"
                    title="Edit Supplier"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => console.log("Delete supplier:", supplier)}
                    className="text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                    title="Delete Supplier"
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
  );

  return (
    <div className="px-4 py-2">
      {/* Buttons */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'stock' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Package size={16} />
            Stock Management
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'suppliers' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Truck size={16} />
            Suppliers
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'stock' && <StockManagementContent />}
        {activeTab === 'suppliers' && <SuppliersManagementContent />}
      </div>
    </div>
  );
};

export default StockManagement;
