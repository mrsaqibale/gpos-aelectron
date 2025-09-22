import React, { useState } from 'react';
import { Users, Calendar } from 'lucide-react';
import Employee from '../../components/dashboard/employee/Employee';
import EmployeeAttendance from '../../components/dashboard/employee/EmployeeAttendance';

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('employee'); // Default to employee management

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

  return (
    <div className="px-4 py-2">
      {/* Buttons */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'employee' && <Employee />}
        {activeTab === 'attendance' && <EmployeeAttendance />}
      </div>
    </div>
  );
};

export default EmployeeManagement;



