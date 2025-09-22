import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Trash2, Plus, Search, X, 
  Calendar, Euro, Award, MapPin, Phone, Mail 
} from 'lucide-react';
import CustomerManagement from './CustomerManagement';
import CustomerSearchModal from './CustomerSearchModal';

const CustomerListManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleAddCustomer = (newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    setShowAddModal(false);
  };

  const handleEditCustomer = (updatedCustomer) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
    setShowEditModal(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    
    try {
      // First delete all addresses for this customer
      if (deletingCustomer.addresses && deletingCustomer.addresses.length > 0) {
        for (const address of deletingCustomer.addresses) {
          await window.myAPI?.deleteAddress(address.id);
        }
      }
      
      // Then delete the customer
      const result = await window.myAPI?.updateCustomer(deletingCustomer.id, { isDelete: 1 });
      if (result && result.success) {
        setCustomers(prev => prev.filter(customer => customer.id !== deletingCustomer.id));
        setShowDeleteConfirm(false);
        setDeletingCustomer(null);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const handleToggleLoyal = async (customer) => {
    try {
      const newLoyalStatus = !customer.isloyal;
      const result = await window.myAPI?.updateCustomer(customer.id, { isloyal: newLoyalStatus ? 1 : 0 });
      if (result && result.success) {
        setCustomers(prev => 
          prev.map(c => 
            c.id === customer.id ? { ...c, isloyal: newLoyalStatus } : c
          )
        );
      }
    } catch (error) {
      console.error('Error updating loyalty status:', error);
    }
  };

  const handleToggleActive = async (customer) => {
    try {
      const newActiveStatus = !customer.isActive;
      const result = await window.myAPI?.updateCustomer(customer.id, { isActive: newActiveStatus ? 1 : 0 });
      if (result && result.success) {
        setCustomers(prev => 
          prev.map(c => 
            c.id === customer.id ? { ...c, isActive: newActiveStatus } : c
          )
        );
      }
    } catch (error) {
      console.error('Error updating active status:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `€${amount || 0}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Search size={16} />
            Search Customer
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Customer
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Sl
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Customer Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Email/Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Total Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Total Order Amount (€)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Loyalty Points
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Loyal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Joining Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Active/Inactive
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer, index) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 border-b">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b cursor-pointer hover:text-primary">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 border-b">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {customer.email || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {customer.phone || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 border-b">
                    <div className="flex flex-col gap-1">
                      {customer.addresses && customer.addresses.length > 0 ? (
                        customer.addresses.map((addr, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <MapPin size={12} />
                            <span className="text-xs">
                              {addr.address}
                              {addr.code && ` (${addr.code})`}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span>No addresses</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b cursor-pointer hover:text-primary">
                    {customer.totalOrders || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-b">
                    {formatCurrency(customer.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-sm border-b">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {customer.loyaltyPoints || 0} pts
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm border-b">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!customer.isloyal}
                        onChange={() => handleToggleLoyal(customer)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${customer.isloyal ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${customer.isloyal ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 border-b">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(customer.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm border-b">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customer.isActive !== false}
                        onChange={() => handleToggleActive(customer)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors ${customer.isActive !== false ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${customer.isActive !== false ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-sm border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Edit Customer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingCustomer(customer);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Customer Modal */}
      <CustomerManagement
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerSelect={handleAddCustomer}
      />

      {/* Search Customer Modal */}
      <CustomerSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onCustomerSelect={(customer) => {
          setSelectedCustomer(customer);
          setShowDetailsModal(true);
          setShowSearchModal(false);
        }}
      />

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Customer Details</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:text-primary p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900 mt-1">{selectedCustomer.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900 mt-1">{selectedCustomer.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900 mt-1">{selectedCustomer.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Addresses</label>
                <div className="mt-1 space-y-2">
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    selectedCustomer.addresses.map((addr, index) => (
                      <div key={index} className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                        <div className="font-medium">Address {index + 1}</div>
                        <div>{addr.address}</div>
                        {addr.code && <div className="text-gray-600 text-xs">Eircode: {addr.code}</div>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-900">No addresses</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Orders</label>
                <p className="text-sm text-gray-900 mt-1">{selectedCustomer.totalOrders || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loyalty Points</label>
                <input
                  type="number"
                  value={selectedCustomer.loyaltyPoints || 0}
                  onChange={(e) => {
                    setSelectedCustomer(prev => ({
                      ...prev,
                      loyaltyPoints: parseInt(e.target.value) || 0
                    }));
                  }}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Loyal Customer</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!selectedCustomer.isloyal}
                    onChange={() => handleToggleLoyal(selectedCustomer)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${selectedCustomer.isloyal ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${selectedCustomer.isloyal ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Active</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCustomer.isActive !== false}
                    onChange={() => handleToggleActive(selectedCustomer)}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${selectedCustomer.isActive !== false ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${selectedCustomer.isActive !== false ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
                  </div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <CustomerManagement
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
          onCustomerSelect={handleEditCustomer}
          editingCustomer={editingCustomer}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingCustomer && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-500 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Customer</h2>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="text-white hover:text-red-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this customer? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Customer: <strong>{deletingCustomer.name}</strong>
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListManagement; 