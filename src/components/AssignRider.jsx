import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Search, CheckCircle } from 'lucide-react';
import { useRiders } from '../contexts/RiderContext';

const AssignRider = ({ 
  isOpen, 
  onClose, 
  onBack, 
  order, 
  onAssignRider, 
  onStatusUpdate 
}) => {
  const { riders, getAvailableRiders, setSelectedRider: setGlobalSelectedRider } = useRiders();
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderSearchQuery, setRiderSearchQuery] = useState('');
  const [availableRiders, setAvailableRiders] = useState([]);
  const [ridersLoading, setRidersLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch available riders
  const fetchAvailableRiders = async () => {
    try {
      setRidersLoading(true);
      // Get riders from context
      const availableRidersList = getAvailableRiders();
      console.log('Fetched available riders:', availableRidersList);
      setAvailableRiders(availableRidersList);
    } catch (error) {
      console.error('Error fetching riders:', error);
      setAvailableRiders([]);
    } finally {
      setRidersLoading(false);
    }
  };

  // Handle rider selection
  const handleRiderSelect = (rider) => {
    setSelectedRider(rider);
  };

  // Handle rider assignment
  const handleAssignRider = async () => {
    if (!selectedRider) {
      return false; // Return false to indicate failure
    }

    try {
      setIsAssigning(true);
      
      // Set the selected rider globally
      setGlobalSelectedRider(selectedRider);
      
      // Call the parent's onAssignRider function
      const success = await onAssignRider(selectedRider);
      if (success) {
        // Reset state on success
        setSelectedRider(null);
        setRiderSearchQuery('');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error assigning rider:', error);
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  // Fetch riders when modal opens and reset state when modal closes
  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens
      setSelectedRider(null);
      setRiderSearchQuery('');
      setIsAssigning(false);
      // Fetch fresh rider data
      fetchAvailableRiders();
    } else {
      // Clean up state when modal closes
      setSelectedRider(null);
      setRiderSearchQuery('');
      setIsAssigning(false);
      setAvailableRiders([]);
    }
  }, [isOpen, riders]); // Add riders as dependency to refresh when riders change

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">Assign Rider</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order Information */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              #{order?.orderNumber}
            </h3>
            <p className="text-sm text-gray-600">Delivery Order</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              key={`search-${isOpen}`}
              type="text"
              placeholder="Search riders..."
              value={riderSearchQuery}
              onChange={(e) => setRiderSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Rider List */}
        <div className="flex-1 overflow-y-auto p-4">
          {ridersLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">Loading riders...</div>
            </div>
          ) : availableRiders.length > 0 ? (
            <div className="space-y-3">
              {availableRiders
                .filter(rider => 
                  rider.name.toLowerCase().includes(riderSearchQuery.toLowerCase()) ||
                  rider.vehicle.toLowerCase().includes(riderSearchQuery.toLowerCase())
                )
                .map((rider) => (
                  <div
                    key={`rider-${rider.id}-${isOpen}`}
                    onClick={() => handleRiderSelect(rider)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedRider?.id === rider.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{rider.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {rider.vehicleType === 'car' ? (
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                          <span className="text-sm text-gray-600">{rider.vehicle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${rider.status === 'Available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {rider.status}
                        </span>
                        {selectedRider?.id === rider.id && (
                          <CheckCircle size={16} className="text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No riders available</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAssignRider}
            disabled={!selectedRider || isAssigning}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${!selectedRider || isAssigning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isAssigning ? 'Assigning...' : 'Assign Rider'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignRider;