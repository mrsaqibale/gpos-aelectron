import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Home, Wallet, BriefcaseBusiness } from 'lucide-react';

const EmpAttendanceDetailsModalbox = ({ isOpen, onClose, employee }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [salaryData, setSalaryData] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  // Mock attendance data - replace with actual API call
  useEffect(() => {
    if (employee && isOpen) {
      // Mock attendance records
      const mockRecords = [
        {
          date: '2025-10-04',
          status: 'PRESENT',
          checkIn: '9:04',
          checkOut: '18:51',
          hoursWorked: 8.96
        },
        {
          date: '2025-10-03',
          status: 'PRESENT',
          checkIn: '10:45',
          checkOut: '18:53',
          hoursWorked: 8.60
        },
        {
          date: '2025-10-02',
          status: 'PRESENT',
          checkIn: '10:47',
          checkOut: '18:00',
          hoursWorked: 8.24
        },
        {
          date: '2025-10-01',
          status: 'PRESENT',
          checkIn: '9:15',
          checkOut: '17:30',
          hoursWorked: 8.25
        },
        {
          date: '2025-09-30',
          status: 'PRESENT',
          checkIn: '9:00',
          checkOut: '18:00',
          hoursWorked: 9.00
        }
      ];
      
      setAttendanceRecords(mockRecords);

      // Calculate salary data
      const totalWorkingHours = mockRecords.reduce((sum, record) => sum + record.hoursWorked, 0);
      const hourlyRate = employee.salary_per_hour || 15; // Default hourly rate
      const totalAmount = totalWorkingHours * hourlyRate;
      const paidAmount = totalAmount * 0.8; // Mock: 80% paid
      const pendingAmount = totalAmount - paidAmount;

      setSalaryData({
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

  const generateEmpId = (id) => {
    return `EMP${String(id).padStart(3, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Employee Attendance Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Left Section - Employee Details */}
          <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {employee.fname?.[0]}{employee.lname?.[0]}
                </span>
              </div>
            </div>

            {/* Employee Name */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {employee.fname} {employee.lname}
              </h3>
            </div>

            {/* Employee Information */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-sm font-medium text-gray-900">{employee.roll}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="text-sm font-medium text-gray-900">{employee.joined_date || '2023-01-15'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{employee.phone || '+353 87 1680573'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">{employee.address || '123 Main Street, Dublin, Ireland'}</p>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Salary Information</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(salaryData.totalAmount)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Paid Amount</p>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(salaryData.paidAmount)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Pending Amount</p>
                  <p className="text-lg font-semibold text-red-600">{formatCurrency(salaryData.pendingAmount)}</p>
                </div>
              </div>

              <button className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-green-900 transition-colors">
                <Wallet className="w-4 h-4" />
                View Salary History
              </button>
            </div>
          </div>

          {/* Right Section - Attendance Records */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Records</h3>
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {attendanceRecords.length} days
                </span>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-200 transition-colors">
                  <Wallet className="w-4 h-4" />
                  Pay Salary
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      DATE
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      STATUS
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      CHECK IN
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      CHECK OUT
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                      HOURS WORKED
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{record.date}</td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-primary px-3 py-1 rounded-full text-xs font-medium">
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{record.checkIn}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{record.checkOut}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{record.hoursWorked.toFixed(2)} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpAttendanceDetailsModalbox;