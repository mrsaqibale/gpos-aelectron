import React from 'react';
import { X, Clock } from 'lucide-react';

const DueTo = ({ 
  isOpen, 
  onClose, 
  hotelInfo, 
  selectedScheduleDate, 
  selectedScheduleTime, 
  availableTimeSlots, 
  useCustomTime, 
  customTime,
  onDateChange, 
  onTimeSelect, 
  onCustomTimeChange, 
  onUseCustomTimeChange, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold">Schedule Order</h2>
          <button
            onClick={onCancel}
            className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hotel Information */}
        {hotelInfo && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="text-center">
              <h3 className="font-semibold text-gray-800">{hotelInfo.name}</h3>
              <p className="text-sm text-gray-600">
                Open: {hotelInfo.opening_time} - Close: {hotelInfo.closeing_time}
              </p>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedScheduleDate}
              onChange={(e) => onDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Time Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Time
            </label>

            {/* Custom Time Input */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useCustomTime"
                  checked={useCustomTime}
                  onChange={(e) => onUseCustomTimeChange(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="useCustomTime" className="text-sm font-medium text-gray-700">
                  Use Custom Time
                </label>
              </div>

              {useCustomTime && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => onCustomTimeChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="HH:MM"
                  />
                  <span className="text-sm text-gray-500">
                    Format: HH:MM (24-hour)
                  </span>
                </div>
              )}
            </div>

            {/* Predefined Time Slots */}
            {!useCustomTime && (
              <>
                {availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {availableTimeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => onTimeSelect(time)}
                        className={`p-3 text-sm rounded-lg border transition-all cursor-pointer ${selectedScheduleTime === time
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-gray-50'
                          }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock size={24} className="mx-auto mb-2" />
                    <p>No available time slots for selected date</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Selected Schedule Display */}
          {(selectedScheduleTime || (useCustomTime && customTime)) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-sm text-gray-600">Order scheduled for:</p>
                <p className="text-lg font-semibold text-blue-800">
                  {selectedScheduleDate} at {useCustomTime ? customTime : selectedScheduleTime}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedScheduleTime && !(useCustomTime && customTime)}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${(selectedScheduleTime || (useCustomTime && customTime))
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default DueTo;