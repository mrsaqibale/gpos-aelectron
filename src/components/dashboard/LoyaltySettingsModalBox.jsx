import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

const LoyaltySettingsModalBox = ({ isOpen, onClose }) => {
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [selectedRule, setSelectedRule] = useState('');
  const [minimumAmount, setMinimumAmount] = useState('100');
  const [minimumOrders, setMinimumOrders] = useState('5');

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const result = await window.electronAPI.invoke('settings:get', 'loyalty_settings');
      if (result.success && result.data) {
        const settings = JSON.parse(result.data);
        setLoyaltyEnabled(settings.enabled || false);
        setSelectedRule(settings.rule || '');
        setMinimumAmount(settings.minimumAmount || '100');
        setMinimumOrders(settings.minimumOrders || '5');
      }
    } catch (error) {
      console.error('Error loading loyalty settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      const settings = {
        enabled: loyaltyEnabled,
        rule: selectedRule,
        minimumAmount,
        minimumOrders
      };

      const result = await window.electronAPI.invoke('settings:set', 'loyalty_settings', JSON.stringify(settings));
      
      if (result.success) {
        console.log('Loyalty settings saved successfully');
        onClose();
      } else {
        console.error('Failed to save loyalty settings:', result.message);
        alert('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving loyalty settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all duration-300 scale-100 animate-fade-in" style={{ borderRadius: '5%' }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 bg-primary text-white" style={{ borderRadius: '5% 5% 0 0' }}>
          <div className="flex items-center gap-3">
            <Settings size={24} />
            <h3 className="text-xl font-bold">Customer Loyalty Settings</h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="m-8 p-5 rounded-lg border border-gray-200">
          {/* Loyalty Program Toggle */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <label className="text-md font-bold text-[#333]">Loyalty Program</label>
            <button
              onClick={() => {
                setLoyaltyEnabled(!loyaltyEnabled);
                if (!loyaltyEnabled === false) {
                  setSelectedRule('');
                }
              }}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-200 ease-in-out ${
                loyaltyEnabled ? 'bg-primary' : 'bg-gray-300'
              } cursor-pointer hover:opacity-80`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-200 ease-in-out ${
                  loyaltyEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Conditional Content Based on Toggle */}
          {loyaltyEnabled && (
            <div className="space-y-6">
              {/* Select Loyalty Rule */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#333] mb-3">
                    Select Loyalty Rule
                  </label>
                  <select
                    value={selectedRule}
                    onChange={(e) => setSelectedRule(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-[#333] bg-white"
                  >
                    <option value="">Select Rule</option>
                    <option value="amount">On Amount Spending</option>
                    <option value="orders">On No of orders</option>
                  </select>
                </div>

                {/* Conditional Input Based on Selected Rule */}
                {selectedRule === 'amount' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#333] mb-3">
                      Minimum Amount Spending (€)
                    </label>
                    <input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-[#333]"
                    />
                  </div>
                )}

                {selectedRule === 'orders' && (
                  <div>
                    <label className="block text-sm font-semibold text-[#333] mb-3">
                      Minimum Number of Orders
                    </label>
                    <input
                      type="number"
                      value={minimumOrders}
                      onChange={(e) => setMinimumOrders(e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm text-[#333]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50" style={{ borderRadius: '0 0 5% 5%' }}>
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-white bg-primary rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoyaltySettingsModalBox;