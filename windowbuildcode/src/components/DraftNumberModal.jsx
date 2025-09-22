import React, { useState } from 'react';
import { X } from 'lucide-react';

const DraftNumberModal = ({ isOpen, onClose, onSubmit }) => {
  const [userName, setUserName] = useState('');

  const handleSubmit = () => {
    if (userName.trim()) {
      onSubmit(userName.trim());
      setUserName('');
      onClose();
    }
  };

  const handleCancel = () => {
    setUserName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-md">
        {/* Header */}
        <div className="p-6 bg-primary rounded-t-lg text-white border-b border-gray-200">
          <h2 className="text-xl font-bold">Draft</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!userName.trim()}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              userName.trim()
                ? 'bg-primary text-white'
                : 'bg-primary text-white cursor-not-allowed'
            }`}
          >
            Submit
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftNumberModal;
