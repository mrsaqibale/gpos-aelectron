import React, { useState, useEffect } from 'react';
import { X, Printer } from 'lucide-react';

const SalaryHistory = ({ isOpen, onClose, employee }) => {
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  // Mock salary history data - replace with actual API call
  useEffect(() => {
    if (employee && isOpen) {
      // Mock salary history records
      const mockHistory = [
        {
          id: 1,
          date: '2024-09-30',
          amount: 500.00,
          method: 'Bank Transfer',
          type: 'Salary',
          note: 'Monthly payment'
        },
        {
          id: 2,
          date: '2024-09-15',
          amount: 200.00,
          method: 'Cash',
          type: 'Advance',
          note: 'Advance payment'
        },
        {
          id: 3,
          date: '2024-08-31',
          amount: 500.00,
          method: 'Bank Transfer',
          type: 'Salary',
          note: 'Monthly payment'
        },
        {
          id: 4,
          date: '2024-08-15',
          amount: 150.00,
          method: 'Cash',
          type: 'Advance',
          note: 'Advance payment'
        },
        {
          id: 5,
          date: '2024-07-31',
          amount: 500.00,
          method: 'Bank Transfer',
          type: 'Salary',
          note: 'Monthly payment'
        }
      ];
      
      setSalaryHistory(mockHistory);

      // Calculate summary data
      const totalAmount = mockHistory.reduce((sum, record) => sum + record.amount, 0);
      const paidAmount = mockHistory.reduce((sum, record) => sum + record.amount, 0); // All payments are considered paid
      const pendingAmount = 0; // No pending amounts in mock data

      setSummaryData({
        totalAmount,
        paidAmount,
        pendingAmount
      });
    }
  }, [employee, isOpen]);

  if (!isOpen || !employee) return null;

  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'Salary':
        return 'bg-blue-500 text-white';
      case 'Advance':
        return 'bg-yellow-400 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handlePrint = () => {
    // Handle print functionality
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Salary History - {employee.fname} {employee.lname}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Total Amount */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryData.totalAmount)}</p>
              <p className="text-sm text-gray-500 mt-1">Total Amount</p>
            </div>

            {/* Paid Amount */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summaryData.paidAmount)}</p>
              <p className="text-sm text-gray-500 mt-1">Paid Amount</p>
            </div>

            {/* Pending Amount */}
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summaryData.pendingAmount)}</p>
              <p className="text-sm text-gray-500 mt-1">Pending Amount</p>
            </div>
          </div>

          {/* Salary History Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    DATE
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    AMOUNT
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    METHOD
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    TYPE
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    NOTE
                  </th>
                </tr>
              </thead>
              <tbody>
                {salaryHistory.map((record, index) => (
                  <tr key={record.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm text-gray-900">{record.date}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">{formatCurrency(record.amount)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{record.method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeStyles(record.type)}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{record.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white rounded-md flex items-center gap-2 "
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalaryHistory;