import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';
import EmpAttendanceDetailsModalbox from './EmpAttendanceDetailsModalbox';

const EmployeePayRol = () => {
  const [employees, setEmployees] = useState([]);
  const [filterDate, setFilterDate] = useState('thisWeek');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Keyboard state
  const [showSearchKeyboard, setShowSearchKeyboard] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const currentEmployee = localStorage.getItem('currentEmployee');
      let currentEmployeeId = null;
      
      if (currentEmployee) {
        try {
          const employeeData = JSON.parse(currentEmployee);
          currentEmployeeId = employeeData.id;
        } catch (error) {
          console.error('Error parsing current employee data:', error);
        }
      }
      
      const result = await window.myAPI?.getAllEmployees(currentEmployeeId);
      if (result.success) {
        setEmployees(result.data);
      } else {
        console.error('Error fetching employees:', result.message);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search keyboard handlers
  const handleSearchFocus = () => {
    setShowSearchKeyboard(true);
  };

  const handleSearchBlur = (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.hg-theme-default')) {
      return;
    }
    
    setTimeout(() => {
      setShowSearchKeyboard(false);
    }, 100);
  };

  const handleSearchKeyboardChange = (input) => {
    setSearchQuery(input);
  };

  const handleSearchKeyboardClose = () => {
    setShowSearchKeyboard(false);
  };

  // Modal handlers
  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  // Filter and Search logic
  const filteredEmployees = employees
    .filter(employee => employee.roll !== 'Admin')
    .filter(employee => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${employee.fname} ${employee.lname}`.toLowerCase();
        const empId = `EMP${String(employee.id).padStart(3, '0')}`.toLowerCase();
        return fullName.includes(query) || empId.includes(query);
      }
      return true;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate, searchQuery, itemsPerPage]);

  // Generate Employee ID
  const generateEmpId = (id) => {
    return `EMP${String(id).padStart(3, '0')}`;
  };

  // Calculate salary status
  const getSalaryStatus = (totalSalary, paidAmount) => {
    const pending = totalSalary - paidAmount;
    if (pending === 0) return { text: 'Paid', color: 'bg-green-100 text-green-800' };
    if (pending > 0) return { text: 'Due', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Overdue', color: 'bg-red-100 text-red-800' };
  };

  // Mock data calculation (replace with real data from backend)
  const calculateEmployeePayroll = (employee) => {
    const noOfLeaves = 2; // Mock data
    const totalWorkingHours = 160.00; // Mock data
    const totalSalary = employee.salary_per_hour ? employee.salary_per_hour * totalWorkingHours : 0;
    const paidAmount = totalSalary * 0.8; // Mock: 80% paid
    const pending = totalSalary - paidAmount;
    
    return {
      noOfLeaves,
      totalWorkingHours,
      totalSalary,
      paidAmount,
      pending
    };
  };

  return (
    <div className="space-y-6">
      {/* Employee Payroll List */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        {/* Filter and Search Bar */}
        <div className="flex justify-between items-center mb-6 gap-4">
          {/* Left side - Filter and Show */}
          <div className="flex items-center gap-4">
            {/* Select Date Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Date</label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Show Items Per Page */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Right side - Search Bar */}
          <div className=" max-w-md">
            <input
              type="text"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onClick={handleSearchFocus}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Employee Payroll Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SI
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  EMP ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  NAME
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  NO OF LEAVES
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  TOTAL WORKING HOURS
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  TOTAL SALARY
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  PAID AMOUNT
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  PENDING
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ROLE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SALARY SCHEDULE
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  SALARY STATUS
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => {
                const payroll = calculateEmployeePayroll(employee);
                const salaryStatus = getSalaryStatus(payroll.totalSalary, payroll.paidAmount);
                
                return (
                  <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-50">
                    {/* SI */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{indexOfFirstItem + index + 1}</span>
                    </td>
                    
                    {/* EMP ID */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-700">{generateEmpId(employee.id)}</span>
                    </td>
                    
                    {/* NAME */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{employee.fname} {employee.lname}</span>
                    </td>
                    
                    {/* NO OF LEAVES */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{payroll.noOfLeaves}</span>
                    </td>
                    
                    {/* TOTAL WORKING HOURS */}
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{payroll.totalWorkingHours.toFixed(2)} hrs</span>
                    </td>
                    
                    {/* TOTAL SALARY */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-gray-700">
                        €{payroll.totalSalary.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* PAID AMOUNT */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-green-600">
                        €{payroll.paidAmount.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* PENDING */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-red-600">
                        €{payroll.pending.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* ROLE */}
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        employee.roll === 'Manager' ? 'bg-blue-100 text-blue-800' :
                        employee.roll === 'Driver' || employee.roll === 'Delivery Man' ? 'bg-yellow-100 text-yellow-800' :
                        employee.roll === 'Chef' ? 'bg-red-100 text-red-800' :
                        employee.roll === 'Waiter' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.roll}
                      </span>
                    </td>
                    
                    {/* SALARY SCHEDULE */}
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${
                        employee.salary_schedule === 'Monthly' ? 'bg-blue-100 text-blue-800' :
                        employee.salary_schedule === 'Weekly' ? 'bg-purple-100 text-purple-800' :
                        employee.salary_schedule === 'Bi-Weekly' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.salary_schedule || 'Monthly'}
                      </span>
                    </td>
                    
                    {/* SALARY STATUS */}
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs font-medium ${salaryStatus.color}`}>
                        {salaryStatus.text}
                      </span>
                    </td>
                    
                    {/* ACTION */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewEmployee(employee)}
                        className="px-4 py-2 bg-teal-600 text-white text-xs font-medium rounded flex items-center gap-2 hover:bg-teal-700 transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} employees
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === i + 1
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:bg-gray-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Virtual Keyboard for Search Bar */}
      <VirtualKeyboard
        isVisible={showSearchKeyboard}
        onClose={handleSearchKeyboardClose}
        activeInput="search"
        onInputChange={handleSearchKeyboardChange}
        onInputBlur={handleSearchBlur}
        inputValue={searchQuery}
        placeholder="Search by name or ID..."
      />

      {/* Employee Attendance Details Modal */}
      <EmpAttendanceDetailsModalbox
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default EmployeePayRol;
