import React, { useState, useEffect, useMemo } from 'react';
import { Users, ChevronDown, Search, Download, ChevronLeft, ChevronRight, Mail, Phone, Clock, Calendar, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';
import CustomAlert from '../../CustomAlert';

const EmployeeAttendance = () => {
  // State for filters
  const [attendanceStartDate, setAttendanceStartDate] = useState('');
  const [attendanceEndDate, setAttendanceEndDate] = useState('');
  const [employeeJoiningDate, setEmployeeJoiningDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [chooseFirst, setChooseFirst] = useState('');
  
  // Salary payment state
  const [paySalary, setPaySalary] = useState('');

  // Employee attendance list state
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(7);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  
  // Custom Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Sample sorting options
  const sortingOptions = [
    { value: 'present_today', label: 'Present Today' },
    { value: 'absent_today', label: 'Absent Today' },
    { value: 'late_today', label: 'Late Today' },
    { value: 'most_attendance', label: 'Most Attendance' },
    { value: 'least_attendance', label: 'Least Attendance' }
  ];

  // Generate dummy attendance records for each employee
  const generateEmployeeAttendance = (employeeId, totalDays, presentDays, lateDays) => {
    const attendance = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - totalDays);
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      
      let status = 'Absent';
      let checkIn = null;
      let checkOut = null;
      
      if (i < presentDays) {
        status = 'Present';
        const checkInHour = 8 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        checkIn = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`;
        
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMinute = Math.floor(Math.random() * 60);
        checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`;
        
        if (i < lateDays) {
          status = 'Late';
          const lateCheckInHour = 9 + Math.floor(Math.random() * 1);
          const lateCheckInMinute = 30 + Math.floor(Math.random() * 60);
          checkIn = `${lateCheckInHour.toString().padStart(2, '0')}:${lateCheckInMinute.toString().padStart(2, '0')}`;
        }
      }
      
      attendance.push({
        id: `${employeeId}_${i}`,
        date: currentDate.toISOString().split('T')[0],
        status,
        checkIn,
        checkOut,
        totalHours: checkIn && checkOut ? ((17 - 8) + Math.random() * 2).toFixed(1) : 0
      });
    }
    
    return attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Memoized attendance records for the selected employee
  const selectedEmployeeAttendance = useMemo(() => {
    if (selectedEmployee) {
      return generateEmployeeAttendance(selectedEmployee.id, selectedEmployee.totalDays, selectedEmployee.presentDays, selectedEmployee.lateDays);
    }
    return [];
  }, [selectedEmployee?.id, selectedEmployee?.totalDays, selectedEmployee?.presentDays, selectedEmployee?.lateDays]);

  // Dummy employee attendance data
  const dummyEmployees = [
    {
      id: 1,
      employeeId: 'EMP001',
      name: 'John Smith',
      email: 'john.smith@restaurant.com',
      phone: '0871234567',
      role: 'Manager',
      totalDays: 30,
      presentDays: 28,
      lateDays: 3,
      totalHours: 224,
      salary: 3500,
      joiningDate: '2024-01-15',
      isPaid: true,
      address: '123 Main Street, Dublin, Co. Dublin, D01 AB12, Ireland'
    },
    {
      id: 2,
      employeeId: 'EMP002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@restaurant.com',
      phone: '0862345678',
      role: 'Cashier',
      totalDays: 30,
      presentDays: 25,
      lateDays: 5,
      totalHours: 200,
      salary: 2800,
      joiningDate: '2024-02-20',
      isPaid: false,
      address: '456 Oak Avenue, Cork, Co. Cork, T12 CD34, Ireland'
    },
    {
      id: 3,
      employeeId: 'EMP003',
      name: 'Michael O\'Connor',
      email: 'michael.oconnor@restaurant.com',
      phone: '0853456789',
      role: 'Chef',
      totalDays: 30,
      presentDays: 30,
      lateDays: 1,
      totalHours: 240,
      salary: 3200,
      joiningDate: '2023-11-10',
      isPaid: true,
      address: '789 River Road, Galway, Co. Galway, H91 EF56, Ireland'
    },
    {
      id: 4,
      employeeId: 'EMP004',
      name: 'Emma Walsh',
      email: 'emma.walsh@restaurant.com',
      phone: '0844567890',
      role: 'Cashier',
      totalDays: 30,
      presentDays: 22,
      lateDays: 8,
      totalHours: 176,
      salary: 2600,
      joiningDate: '2024-03-05',
      isPaid: false,
      address: '321 Hill Street, Limerick, Co. Limerick, V94 GH78, Ireland'
    },
    {
      id: 5,
      employeeId: 'EMP005',
      name: 'David Murphy',
      email: 'david.murphy@restaurant.com',
      phone: '0835678901',
      role: 'Chef',
      totalDays: 30,
      presentDays: 27,
      lateDays: 2,
      totalHours: 216,
      salary: 3100,
      joiningDate: '2023-12-15',
      isPaid: true,
      address: '654 Park Lane, Waterford, Co. Waterford, X91 IJ90, Ireland'
    }
  ];

  // Initialize employees data
  useEffect(() => {
    setEmployees(dummyEmployees);
    setFilteredEmployees(dummyEmployees);
  }, []);

  // Filter employees based on search term
  useEffect(() => {
    const filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees]);

  // Get current employees for pagination
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle employee payment toggle
  const handlePaymentToggle = (employeeId) => {
    setEmployees(prevEmployees =>
      prevEmployees.map(employee =>
        employee.id === employeeId
          ? { ...employee, isPaid: !employee.isPaid }
          : employee
      )
    );
  };

  // Handle modal open
  const handleModalOpen = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setPaySalary(''); // Reset pay salary when closing modal
  };

  // Handle keyboard input
  const handleInputFocus = (inputName) => {
    setActiveInput(inputName);
    setShowKeyboard(true);
  };

  const handleInputBlur = (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.hg-theme-default')) {
      return;
    }
    
    setTimeout(() => {
      setShowKeyboard(false);
      setActiveInput('');
    }, 300);
  };

  const handleAnyInputFocus = (e, inputName) => {
    handleInputFocus(inputName);
  };

  const handleAnyInputClick = (e, inputName) => {
    if (!showKeyboard || activeInput !== inputName) {
      handleInputFocus(inputName);
    }
  };

  const onKeyboardChange = (input, inputName) => {
    if (inputName === 'chooseFirst') {
      setChooseFirst(input);
    } else if (inputName === 'paySalary') {
      setPaySalary(input);
    } else if (inputName === 'searchTerm') {
      setSearchTerm(input);
    }
  };

  const handleKeyboardClose = () => {
    setShowKeyboard(false);
    setActiveInput('');
  };

  // Handle number input change
  const handleNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setChooseFirst(value);
  };

  // Get attendance percentage
  const getAttendancePercentage = (presentDays, totalDays) => {
    return ((presentDays / totalDays) * 100).toFixed(1);
  };

  // Get status badge
  const getStatusBadge = (presentDays, totalDays, lateDays) => {
    const percentage = getAttendancePercentage(presentDays, totalDays);
    if (percentage >= 95) {
      return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    } else if (percentage >= 85) {
      return { text: 'Good', color: 'bg-blue-100 text-blue-800' };
    } else if (percentage >= 75) {
      return { text: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Poor', color: 'bg-red-100 text-red-800' };
    }
  };

  // Handle salary payment
  const handleSalaryPayment = () => {
    if (!paySalary || parseFloat(paySalary) <= 0) {
      setAlertMessage('Please enter a valid salary amount');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    
    // Here you would typically make an API call to save the salary payment
    console.log('Paying salary:', paySalary, 'for employee:', selectedEmployee?.name);
    
    // Update the employee's payment status
    if (selectedEmployee) {
      setEmployees(prevEmployees =>
        prevEmployees.map(employee =>
          employee.id === selectedEmployee.id
            ? { ...employee, isPaid: true }
            : employee
        )
      );
      
      // Update the selected employee in the modal
      setSelectedEmployee(prev => prev ? { ...prev, isPaid: true } : null);
    }
    
    setAlertMessage(`Salary payment of €${parseFloat(paySalary).toLocaleString()} saved successfully for ${selectedEmployee?.name}!`);
    setAlertType('success');
    setShowAlert(true);
    setPaySalary(''); // Reset the input
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-gray-800">Employee Attendance</h1>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-3 gap-6">
          
          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={attendanceStartDate}
              onChange={(e) => setAttendanceStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={attendanceEndDate}
              onChange={(e) => setAttendanceEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
              >
                <option value="">Select Attendance Sorting Order</option>
                {sortingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

        </div>
      </div>

      {/* Employee Attendance List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* Header with search and export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">Employee Attendance List</h3>
            <span className="text-sm text-gray-500">({filteredEmployees.length} employees)</span>
          </div>
          <div className="flex items-center gap-3">
                         {/* Search */}
             <div className="relative">
               <input
                 type="text"
                 placeholder="Ex: Search by name or role"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onFocus={() => handleInputFocus('searchTerm')}
                 onBlur={handleInputBlur}
                 onClick={() => handleAnyInputClick(null, 'searchTerm')}
                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-64"
               />
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
             </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">SI</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Employee ID
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Employee Name
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Contact Information
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Role
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Hours
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Salary
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Attendance Rate
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Present Days
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Late Days
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                  Joining Date
                  <ChevronDown className="inline ml-1" size={12} />
                </th>
                                 <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Paid/Unpaid</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => {
                const attendancePercentage = getAttendancePercentage(employee.presentDays, employee.totalDays);
                const statusBadge = getStatusBadge(employee.presentDays, employee.totalDays, employee.lateDays);
                
                return (
                  <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {indexOfFirstEmployee + index + 1}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {employee.employeeId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-800">{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="text-gray-800">{employee.email}</div>
                        <div className="text-gray-500">{employee.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {employee.role}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {employee.totalHours}h
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      €{employee.salary.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">
                          {attendancePercentage}%
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                          {statusBadge.text}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {employee.presentDays}/{employee.totalDays}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {employee.lateDays}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(employee.joiningDate)}
                    </td>
                                         <td className="py-3 px-4">
                       <button
                         onClick={() => handlePaymentToggle(employee.id)}
                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                           employee.isPaid ? 'bg-primary' : 'bg-gray-300'
                         }`}
                       >
                         <span
                           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                             employee.isPaid ? 'translate-x-6' : 'translate-x-1'
                           }`}
                         />
                       </button>
                     </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleModalOpen(employee)}
                        className="p-1 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Employee Attendance Details */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Employee Attendance Details</h3>
              <button onClick={handleModalClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel - Attendance List */}
              <div className="flex-1 p-6 border-r border-gray-200 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-800">Attendance Records</h4>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {selectedEmployee.totalDays} days
                    </span>
                  </div>
                </div>
                
                {/* Attendance Table */}
                <div className="flex-1 overflow-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Date
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Status
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Check In
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Check Out
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm cursor-pointer hover:text-primary">
                          Hours Worked
                          <ChevronDown className="inline ml-1" size={12} />
                        </th>
                      </tr>
                    </thead>
                                         <tbody>
                       {selectedEmployeeAttendance.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(record.date)}
                          </td>
                          <td className="py-3 px-4">
                            {record.status === 'Present' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" />
                                Present
                              </span>
                            )}
                            {record.status === 'Late' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Clock size={12} className="mr-1" />
                                Late
                              </span>
                            )}
                            {record.status === 'Absent' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle size={12} className="mr-1" />
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.checkIn || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.checkOut || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.totalHours > 0 ? `${record.totalHours}h` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Right Panel - Employee Profile */}
              <div className="w-80 p-6 overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  <Users size={20} className="text-primary" />
                  <h4 className="text-lg font-semibold text-gray-800">{selectedEmployee.name}</h4>
                </div>
                
                {/* Profile Picture Placeholder */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200">
                    <span className="text-gray-400 text-2xl">👤</span>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-800">{selectedEmployee.role}</span>
                  </div>
                </div>
                
                {/* Attendance Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Attendance Summary</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Days:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedEmployee.totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Present Days:</span>
                      <span className="text-sm font-medium text-green-600">{selectedEmployee.presentDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Late Days:</span>
                      <span className="text-sm font-medium text-yellow-600">{selectedEmployee.lateDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Absent Days:</span>
                      <span className="text-sm font-medium text-red-600">{selectedEmployee.totalDays - selectedEmployee.presentDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Attendance Rate:</span>
                      <span className="text-sm font-medium text-primary">{getAttendancePercentage(selectedEmployee.presentDays, selectedEmployee.totalDays)}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Salary Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Salary Information</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Salary:</span>
                      <span className="text-sm font-medium text-gray-800">€{selectedEmployee.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`text-sm font-medium ${selectedEmployee.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedEmployee.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Pay Salary Section */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pay Salary Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={paySalary}
                        onChange={(e) => setPaySalary(e.target.value)}
                        onFocus={() => handleInputFocus('paySalary')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'paySalary')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <button
                      onClick={handleSalaryPayment}
                      disabled={!paySalary || parseFloat(paySalary) <= 0}
                      className="w-full px-4 py-2 bg-primary text-white font-medium rounded-lg 
                      shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
                      active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                    >
                      Save Payment
                    </button>
                  </div>
                </div>
                
                {/* Contact Info Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Contact info</h5>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-800">Joined: {formatDate(selectedEmployee.joiningDate)}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-800">{selectedEmployee.address || 'No address available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={handleKeyboardClose}
        activeInput={activeInput}
        onInputChange={onKeyboardChange}
        onInputBlur={handleInputBlur}
        inputValue={
          activeInput === 'paySalary' ? (paySalary || '') :
          activeInput === 'searchTerm' ? (searchTerm || '') :
          (chooseFirst || '')
        }
        placeholder="Type here..."
      />
      
      {/* Custom Alert */}
      <CustomAlert
        message={alertMessage}
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertType}
        duration={2000}
      />
    </div>
  );
};

export default EmployeeAttendance;