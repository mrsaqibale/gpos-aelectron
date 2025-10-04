import React, { useState } from 'react';
import { Users, Calendar, DollarSign, Briefcase, RotateCcw } from 'lucide-react';
import Employee from '../../components/dashboard/employee/Employee';
import EmployeeAttendance from '../../components/dashboard/employee/EmployeeAttendance';
import EmployeePayRol from '../../components/dashboard/employee/EmployeePayRol';

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('employee'); // Default to employee management
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Keyboard functionality context
  const keyboardContext = {
    onKeyboardChange: (input) => {
      // This will be handled by the child components
      console.log('Keyboard input:', input);
    },
    onKeyboardChangeAll: (inputs) => {
      // This will be handled by the child components
      console.log('Keyboard inputs:', inputs);
    },
    onKeyboardKeyPress: (button) => {
      // This will be handled by the child components
      console.log('Keyboard button:', button);
    }
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="px-4 py-2">
      {/* Main Gray Container */}
        {/* Header Section */}
        <div className="flex bg-[#CDCDCD] rounded-xl items-start justify-between p-6 mb-6">
          {/* Left Section - Title */}
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
              <p className="text-lg text-gray-600">Manage Your Staff & HR Records</p>
            </div>
          </div>
          <div>
             {/* Tabs */}
        <div className="flex items-center justify-end mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('employee')}
              className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'employee' 
                  ? 'bg-primaryLight text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users size={16} />
              Employee Management
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'attendance' 
                  ? 'bg-primaryLight text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar size={16} />
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'payroll' 
                  ? 'bg-primaryLight text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign size={16} />
              Pay Role
            </button>
          </div>
        </div>
          {/* Right Section - Date Filters */}
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center overflow-hidden border border-gray-300 rounded-lg">
                <label className="bg-primary text-white px-4 py-2 font-semibold text-sm whitespace-nowrap">
                  From:
                </label>
                <input
                  type={activeTab === 'attendance' ? 'datetime-local' : 'date'}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="flex-1 px-3 py-2 border-0 focus:outline-none bg-white focus:ring-0 text-sm"
                  placeholder={activeTab === 'attendance' ? "Start Date & Time" : "Start Date"}
                />
              </div>

              <div className="flex items-center overflow-hidden border border-gray-300 rounded-lg">
                <label className="bg-primary text-white px-4 py-2 font-semibold text-sm whitespace-nowrap">
                  To:
                </label>
                <input
                  type={activeTab === 'attendance' ? 'datetime-local' : 'date'}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="flex-1 px-3 py-2 border-0 focus:outline-none bg-white focus:ring-0 text-sm"
                  placeholder={activeTab === 'attendance' ? "End Date & Time" : "End Date"}
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex items-end gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#0d6efd] text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
          </div>
         
        </div>



        {/* Content */}
        <div>
          {activeTab === 'employee' && <Employee />}
          {activeTab === 'attendance' && <EmployeeAttendance />}
          {activeTab === 'payroll' && <EmployeePayRol />}
        </div>
      </div>

  );
};

export default EmployeeManagement;



