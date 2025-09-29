import React, { useState, useEffect } from 'react';
import { Search, X, Edit, Trash2, User, Phone, Hash } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Drafts = ({ isOpen, onClose, onEditDraft, currentDraftOrders = [], onDeleteDraft, onDeleteAllDrafts }) => {
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const { themeColors } = useTheme();

  // Use current draft orders passed as props
  useEffect(() => {
    console.log('Drafts modal isOpen:', isOpen);
    console.log('Current draft orders:', currentDraftOrders);
  }, [isOpen, currentDraftOrders]);

    const filteredDrafts = currentDraftOrders.filter(draft => {
    if (!searchQuery.trim()) return true;
    if (!draft) return false; // Safety check for undefined draft
    
    const query = searchQuery.toLowerCase();
    
    // Format draft ID for search
    const draftId = draft.orderNumber || draft.id || 'Unknown';
    const formattedDraftId = draftId.startsWith('draft_id') 
      ? `Draft_${draftId.replace('draft_id', '').padStart(3, '0')}`
      : draftId;
    
    // Get customer name for search
    const customerName = draft.draftName || 
      (draft.customer && draft.customer.name) || 
      'Walk-in Customer';
    
    return (
      customerName.toLowerCase().includes(query) ||
      formattedDraftId.toLowerCase().includes(query) ||
      (draft.customer && draft.customer.phone || 'N/A').toLowerCase().includes(query)
    );
  });

  const handleDraftSelect = (draft) => {
    setSelectedDraft(draft);
  };

  const handleEditDraft = () => {
    if (selectedDraft && onEditDraft) {
      // Transform the draft back to the format expected by the cart
      const cartData = {
        id: selectedDraft.id,
        items: selectedDraft.items,
        customer: selectedDraft.customer,
        table: selectedDraft.table,
        orderType: selectedDraft.orderType,
        waiter: selectedDraft.waiter,
        subTotal: selectedDraft.subTotal,
        discount: selectedDraft.discount,
        tax: selectedDraft.tax,
        charge: selectedDraft.charge,
        tips: selectedDraft.tips,
        totalPayable: selectedDraft.totalPayable
      };
      
      onEditDraft(cartData);
      onClose();
    }
  };

  const handleDeleteDraft = () => {
    if (selectedDraft) {
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteAllDrafts = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteDraft = () => {
    if (selectedDraft && onDeleteDraft) {
      onDeleteDraft(selectedDraft.databaseId);
      setSelectedDraft(null);
    }
    setShowDeleteConfirm(false);
  };

  const confirmDeleteAllDrafts = () => {
    if (onDeleteAllDrafts) {
      onDeleteAllDrafts();
      setSelectedDraft(null);
    }
    setShowDeleteAllConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl h-5/6 flex">
        {/* Left Section - Draft Sales List */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Draft Sale</h2>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search Draft ID, Customer Name, or Phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Draft Orders Table */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Draft ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrafts.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-4 text-center text-gray-500">
                          No draft orders found
                        </td>
                      </tr>
                    ) : (
                      filteredDrafts.map((draft) => {
                        if (!draft) return null; // Safety check
                        
                        // Format draft ID to show as Draft_001, Draft_002, etc.
                        const draftId = draft.orderNumber || draft.id || 'Unknown';
                        const formattedDraftId = draftId.startsWith('draft_id') 
                          ? `Draft_${draftId.replace('draft_id', '').padStart(3, '0')}`
                          : draftId;
                        
                        // Get customer name or default to "Walk-in Customer"
                        const customerName = draft.draftName || 
                          (draft.customer && draft.customer.name) || 
                          'Walk-in Customer';
                        
                        return (
                          <tr
                            key={draft.id || Math.random()}
                            onClick={() => handleDraftSelect(draft)}
                            className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                              selectedDraft?.id === draft.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            <td className="px-4 py-2 text-sm font-bold text-gray-900">
                              {formattedDraftId}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-700">
                              {customerName}
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                              €{(draft.totalPayable || draft.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Delete All Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleDeleteAllDrafts}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Delete all Draft Sales
            </button>
          </div>
        </div>

        {/* Right Section - Order Details */}
        <div className="w-1/2 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {selectedDraft ? (
            <>
              {/* Order Information */}
              <div className="px-6 py-2 border-b border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Draft ID:</span>
                    <span className="text-sm font-bold text-gray-900">
                      {(() => {
                        const draftId = selectedDraft.orderNumber || selectedDraft.id || 'Unknown';
                        return draftId.startsWith('draft_id') 
                          ? `Draft_${draftId.replace('draft_id', '').padStart(3, '0')}`
                          : draftId;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Customer:</span>
                    <span className="text-sm text-gray-900">
                      {selectedDraft.draftName || 
                        (selectedDraft.customer && selectedDraft.customer.name) || 
                        'Walk-in Customer'}
                    </span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Order Type:</span>
                    <span className="text-sm text-gray-900">{selectedDraft.orderType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Waiter:</span>
                    <span className="text-sm text-gray-900">{selectedDraft.waiter}</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Customer:</span>
                    <span className="text-sm text-gray-900">{selectedDraft.customer && selectedDraft.customer.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Phone:</span>
                    <span className="text-sm text-gray-900">{selectedDraft.customer && selectedDraft.customer.phone || 'N/A'}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Table:</span>
                    <span className="text-sm text-gray-900">{selectedDraft.table}</span>
                  </div> */}
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Price</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Qty Disc</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDraft.items.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                              No items in this draft order
                            </td>
                          </tr>
                        ) : (
                          selectedDraft.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-900">{item.name || item.food?.name || 'Unknown Item'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">€{((item.totalPrice || 0) / (item.quantity || 1)).toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.qty || item.quantity || 0}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">€{(item.totalPrice || 0).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="px-6 py-2 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Total Item:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedDraft.totalItems || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Sub Total:</span>
                    <span className="text-sm font-medium text-gray-900">€{(selectedDraft.subTotal || 0).toFixed(2)}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Discount:</span>
                    <span className="text-sm font-medium text-gray-900">€{(selectedDraft.discount || 0).toFixed(2)}</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Total Discount:</span>
                    <span className="text-sm font-medium text-gray-900">€{(selectedDraft.totalDiscount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Tax:</span>
                    <span className="text-sm font-medium text-gray-900">€{(selectedDraft.tax || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Charge:</span>
                    <span className="text-sm font-medium text-gray-900">€{(selectedDraft.charge || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Tips:</span>
                    <span className="text-sm font-medium text-gray-900">€{(selectedDraft.tips || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between bg-gray-100 p-3 rounded-lg mt-2">
                    <span className="text-lg font-bold text-gray-800">Total Payable:</span>
                    <span className="text-lg font-bold text-gray-800">€{(selectedDraft.totalPayable || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-2 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={handleEditDraft}
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit In Cart
                  </button>
                  <button
                    onClick={handleDeleteDraft}
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a draft order to view details</p>
                <p className="text-sm">Choose an order from the list on the left</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedDraft && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-500 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete Draft Order</h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-white hover:text-red-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this draft order? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Draft: <strong>
                  {(() => {
                    const draftId = selectedDraft.orderNumber || selectedDraft.id || 'Unknown';
                    return draftId.startsWith('draft_id') 
                      ? `Draft_${draftId.replace('draft_id', '').padStart(3, '0')}`
                      : draftId;
                  })()}
                </strong>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Customer: <strong>
                  {selectedDraft.draftName || 
                    (selectedDraft.customer && selectedDraft.customer.name) || 
                    'Walk-in Customer'}
                </strong>
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
                onClick={confirmDeleteDraft}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-500 text-white p-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">Delete All Draft Orders</h2>
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="text-white hover:text-red-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete all draft orders? This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                This will delete <strong>{currentDraftOrders.length}</strong> draft order{currentDraftOrders.length !== 1 ? 's' : ''}.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAllDrafts}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drafts;