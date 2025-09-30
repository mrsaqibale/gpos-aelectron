import React from "react";
import { X } from "lucide-react";

const ToggleAllDayViewModal = ({ isOpen, onClose, orders }) => {
  if (!isOpen) return null;

  // Flatten all items and count them
  const itemCounts = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      acc[item.name] = (acc[item.name] || 0) + 1;
    });
    return acc;
  }, {});

  // Convert to array and sort by count (desc)
  const summary = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
          <h2 className="text-lg font-bold">Items Ordered Today</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-blue-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-3 space-y-2">
          {summary.length === 0 ? (
            <p className="text-gray-500 text-center">No items ordered today</p>
          ) : (
            summary.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-md"
              >
                <span className="text-gray-800 font-medium">{item.name}</span>
                <span className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full">
                  {item.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ToggleAllDayViewModal;
