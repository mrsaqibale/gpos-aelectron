import React, { useState, useEffect, useMemo } from 'react';
import { Users, ChevronDown, Search, Download, ChevronLeft, ChevronRight, Mail, Phone, Clock, Calendar, Eye, X } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';
import CustomAlert from '../../CustomAlert';

// Use the preload API for IPC calls
const { api } = window;

const EmployeeAttendance = () => {
  // State for filters
  const [attendanceStartDate, setAttendanceStartDate] = useState('');
  const [attendanceEndDate, setAttendanceEndDate] = useState('');
  const [employeeJoiningDate, setEmployeeJoiningDate] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [chooseFirst, setChooseFirst] = useState('');
  
  // Salary payment state
  const [paySalary, setPaySalary] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNote, setPaymentNote] = useState('');

  // Employee attendance list state
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(7);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // New modal state for attendance check-in/check-out
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState('');
  const [attendanceAction, setAttendanceAction] = useState('');
  const [attendanceActionOptions, setAttendanceActionOptions] = useState(['Check In', 'Check Out']);

  // Salary history modal state
  const [showSalaryHistoryModal, setShowSalaryHistoryModal] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState([]);

  // Leave request modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');
  
  // Custom Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  // Enhanced sorting options
  const sortingOptions = [
    { value: 'present_today', label: 'Present Today' },
    { value: 'absent_today', label: 'Absent Today' },
    { value: 'late_today', label: 'Late Today' },
    { value: 'most_attendance', label: 'Most Attendance' },
    { value: 'least_attendance', label: 'Least Attendance' },
    { value: 'highest_salary', label: 'Highest Salary' },
    { value: 'lowest_salary', label: 'Lowest Salary' },
    { value: 'unpaid_salary', label: 'Unpaid Salary' },
    { value: 'recent_joiners', label: 'Recent Joiners' }
  ];

  // Leave types
  const leaveTypes = [
    { value: 'sick', label: 'Sick Leave' },
    { value: 'annual', label: 'Annual Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'other', label: 'Other' }
  ];

  // Payment methods
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'digital_payment', label: 'Digital Payment' }
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

  // Real attendance records list for modal
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Enhanced dummy employee attendance data with salary history
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
      address: '123 Main Street, Dublin, Co. Dublin, D01 AB12, Ireland',
      salaryHistory: [
        { id: 1, date: '2024-01-31', amount: 3500, method: 'bank_transfer', note: 'January 2024 Salary' },
        { id: 2, date: '2024-02-29', amount: 3500, method: 'bank_transfer', note: 'February 2024 Salary' },
        { id: 3, date: '2024-03-31', amount: 3500, method: 'bank_transfer', note: 'March 2024 Salary' }
      ]
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
      address: '456 Oak Avenue, Cork, Co. Cork, T12 CD34, Ireland',
      salaryHistory: [
        { id: 1, date: '2024-02-29', amount: 2800, method: 'cash', note: 'February 2024 Salary' },
        { id: 2, date: '2024-03-31', amount: 2800, method: 'cash', note: 'March 2024 Salary' }
      ]
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
      address: '789 River Road, Galway, Co. Galway, H91 EF56, Ireland',
      salaryHistory: [
        { id: 1, date: '2023-11-30', amount: 3200, method: 'bank_transfer', note: 'November 2023 Salary' },
        { id: 2, date: '2023-12-31', amount: 3200, method: 'bank_transfer', note: 'December 2023 Salary' },
        { id: 3, date: '2024-01-31', amount: 3200, method: 'bank_transfer', note: 'January 2024 Salary' },
        { id: 4, date: '2024-02-29', amount: 3200, method: 'bank_transfer', note: 'February 2024 Salary' },
        { id: 5, date: '2024-03-31', amount: 3200, method: 'bank_transfer', note: 'March 2024 Salary' }
      ]
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
      address: '321 Hill Street, Limerick, Co. Limerick, V94 GH78, Ireland',
      salaryHistory: [
        { id: 1, date: '2024-03-31', amount: 2600, method: 'cash', note: 'March 2024 Salary' }
      ]
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
      address: '654 Park Lane, Waterford, Co. Waterford, X91 IJ90, Ireland',
      salaryHistory: [
        { id: 1, date: '2023-12-31', amount: 3100, method: 'bank_transfer', note: 'December 2023 Salary' },
        { id: 2, date: '2024-01-31', amount: 3100, method: 'bank_transfer', note: 'January 2024 Salary' },
        { id: 3, date: '2024-02-29', amount: 3100, method: 'bank_transfer', note: 'February 2024 Salary' },
        { id: 4, date: '2024-03-31', amount: 3100, method: 'bank_transfer', note: 'March 2024 Salary' }
      ]
    }
  ];

  // Initialize employees data
  useEffect(() => {
    loadEmployees();
  }, []);

  // Load employees from database
  const loadEmployees = async () => {
    try {
      if (api) {
        const result = await api.getAllEmployees();
        const rawEmployees = Array.isArray(result) ? result : (result?.data || []);

        // Filter only active and not-deleted employees (robust against 0/1, true/false, '0'/'1', null)
        const activeEmployees = rawEmployees.filter(emp => {
          const activeVal = typeof emp.isActive === 'string' ? parseInt(emp.isActive, 10) : emp.isActive;
          const deletedVal = typeof emp.isDeleted === 'string' ? parseInt(emp.isDeleted, 10) : emp.isDeleted;
          const isActiveOk = activeVal === 1 || activeVal === true || activeVal === '1' || activeVal == null;
          const isDeletedOk = deletedVal === 0 || deletedVal === false || deletedVal === '0' || deletedVal == null;
          return isActiveOk && isDeletedOk;
        });

        // Transform database data to match our component structure
        const transformedEmployees = activeEmployees.map(emp => ({
          id: emp.id,
          employeeId: emp.code || `EMP${emp.id.toString().padStart(3, '0')}`,
          name: `${emp.fname} ${emp.lname}`,
          email: emp.email || '',
          phone: emp.phone || '',
          role: emp.roll || 'Employee',
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          totalHours: 0,
          salary: emp.salary || 0,
          joiningDate: emp.created_at || new Date().toISOString().split('T')[0],
          isPaid: false,
          address: emp.address || '',
          salaryHistory: []
        }));

        // Load additional data for each employee
        const employeesWithDetails = await Promise.all(
          transformedEmployees.map(async (emp) => {
            try {
              const attendanceResult = await api.attendanceGetByEmployee(emp.id);
              const salaryResult = await api.salaryPaymentGetByEmployee(emp.id);

              const attendance = Array.isArray(attendanceResult) ? attendanceResult : (attendanceResult?.data || []);
              const totalDays = attendance.length;
              const presentDays = attendance.filter(record => record.status === 'present').length;
              const lateDays = attendance.filter(record => record.status === 'late').length;
              const totalHours = attendance.reduce((sum, record) => sum + (record.total_hours || 0), 0);

              const salaryHistoryRaw = Array.isArray(salaryResult) ? salaryResult : (salaryResult?.data || []);
              const totalPaid = salaryHistoryRaw.reduce((sum, payment) => sum + (payment.amount || 0), 0);
              const isPaid = totalPaid >= emp.salary;

              return { ...emp, totalDays, presentDays, lateDays, totalHours, isPaid, salaryHistory: salaryHistoryRaw };
            } catch (error) {
              console.error(`Error loading details for employee ${emp.id}:`, error);
              return emp;
            }
          })
        );

        setEmployees(employeesWithDetails);
        setFilteredEmployees(employeesWithDetails);
      } 
    } catch (error) {
      console.error('Error loading employees:', error);
      // Do not fallback to dummy; show no employees to avoid fake data in production
      setEmployees([]);
      setFilteredEmployees([]);
    }
  };

  // Filter and sort employees based on search term and sort criteria
  useEffect(() => {
    let filtered = employees.filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.phone.includes(searchTerm) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case 'highest_salary':
          filtered.sort((a, b) => b.salary - a.salary);
          break;
        case 'lowest_salary':
          filtered.sort((a, b) => a.salary - b.salary);
          break;
        case 'unpaid_salary':
          filtered = filtered.filter(emp => !emp.isPaid);
          break;
        case 'recent_joiners':
          filtered.sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
          break;
        case 'most_attendance':
          filtered.sort((a, b) => (b.presentDays / b.totalDays) - (a.presentDays / a.totalDays));
          break;
        case 'least_attendance':
          filtered.sort((a, b) => (a.presentDays / a.totalDays) - (b.presentDays / b.totalDays));
          break;
        default:
          break;
      }
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchTerm, employees, sortBy]);

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
  const handleModalOpen = async (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    try {
      if (api) {
        const res = await api.attendanceGetByEmployee(employee.id);
        const records = Array.isArray(res) ? res : (res?.data || []);
        records.sort((a, b) => new Date(`${b.date} ${b.checkin || '00:00:00'}`) - new Date(`${a.date} ${a.checkin || '00:00:00'}`));
        setAttendanceRecords(records);
      } else {
        setAttendanceRecords([]);
      }
    } catch (err) {
      console.error('Error loading attendance records:', err);
      setAttendanceRecords([]);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    setPaySalary(''); // Reset pay salary when closing modal
  };

  // Handle attendance modal open
  const handleAttendanceModalOpen = async () => {
    try {
      await loadEmployees();
    } catch (e) {}
    setShowAttendanceModal(true);
    setSelectedEmployeeForAttendance('');
    setAttendanceAction('');
    setAttendanceActionOptions(['Check In', 'Check Out']);
  };

  // Handle attendance modal close
  const handleAttendanceModalClose = () => {
    setShowAttendanceModal(false);
    setSelectedEmployeeForAttendance('');
    setAttendanceAction('');
  };

  // Handle attendance save
  const handleAttendanceSave = async () => {
    if (!selectedEmployeeForAttendance || !attendanceAction) {
      setAlertMessage('Please select both employee and action');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    const selectedEmp = employees.find(emp => emp.id.toString() === selectedEmployeeForAttendance);
    const currentTime = new Date().toISOString();
    const currentDate = new Date().toISOString().split('T')[0];

    try {
      if (api) {
        // Check if employee already has attendance for today
        const existingAttendance = await api.attendanceCheckTodayStatus(selectedEmployeeForAttendance, currentDate);

        let status = 'present';
        let checkin = null;
        let checkout = null;

        if (attendanceAction === 'Check In') {
          // Allow multiple check-ins per day only if last session is closed (has checkout)
          if (existingAttendance.success && existingAttendance.data && !existingAttendance.data.checkout) {
            setAlertMessage('Already checked in. Please Check Out first.');
            setAlertType('error');
            setShowAlert(true);
            return;
          }
          checkin = currentTime;
          status = 'present';
        } else if (attendanceAction === 'Check Out') {
          if (!existingAttendance.success || !existingAttendance.data || existingAttendance.data.checkout) {
            setAlertMessage('No open session to check out');
            setAlertType('error');
            setShowAlert(true);
            return;
          }
          checkout = currentTime;
          // Update existing record with checkout time
          const upd = await api.attendanceUpdate(existingAttendance.data.id, { checkout });
          if (upd?.success) {
            if (upd.computedHours != null) {
              const payInfo = upd.computedPay != null ? `, Pay: €${Number(upd.computedPay).toLocaleString()}` : '';
              setAlertMessage(`Checked out. Hours: ${upd.computedHours}${payInfo}`);
              setAlertType('success');
              setShowAlert(true);
            }
          }
        }

        // Create new attendance record if checking in
        if (attendanceAction === 'Check In') {
          const attendanceData = {
            employee_id: parseInt(selectedEmployeeForAttendance),
            date: currentDate,
            checkin,
            checkout,
            status,
            added_by: 1 // Current logged-in employee ID
          };

          const result = await api.attendanceCreate(attendanceData);
          
          if (result.success) {
            setAlertMessage(`${attendanceAction} recorded successfully for ${selectedEmp?.name} at ${new Date(currentTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
            setAlertType('success');
            setShowAlert(true);
            
            // Reload employees to update attendance data
            await loadEmployees();
            // Refresh modal records if details modal is open for this employee
            try {
              if (showModal && selectedEmployee && selectedEmployee.id === selectedEmp?.id) {
                const res = await api.attendanceGetByEmployee(selectedEmp.id);
                const records = Array.isArray(res) ? res : (res?.data || []);
                records.sort((a, b) => new Date(`${b.date} ${b.checkin || '00:00:00'}`) - new Date(`${a.date} ${a.checkin || '00:00:00'}`));
                setAttendanceRecords(records);
              }
            } catch (e) {}
            
            handleAttendanceModalClose();
          } else {
            setAlertMessage('Failed to save attendance record');
            setAlertType('error');
            setShowAlert(true);
          }
        } else {
          setAlertMessage(`${attendanceAction} recorded successfully for ${selectedEmp?.name} at ${new Date(currentTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
          setAlertType('success');
          setShowAlert(true);
          
          // Reload employees to update attendance data
          await loadEmployees();
          // Refresh modal records if details modal is open for this employee
          try {
            if (showModal && selectedEmployee && selectedEmployee.id === selectedEmp?.id) {
              const res = await api.attendanceGetByEmployee(selectedEmp.id);
              const records = Array.isArray(res) ? res : (res?.data || []);
              records.sort((a, b) => new Date(`${b.date} ${b.checkin || '00:00:00'}`) - new Date(`${a.date} ${a.checkin || '00:00:00'}`));
              setAttendanceRecords(records);
            }
          } catch (e) {}
          
          handleAttendanceModalClose();
        }
      } else {
        // Fallback for development
        console.log('Attendance record:', {
          employeeId: selectedEmployeeForAttendance,
          employeeName: selectedEmp?.name,
          action: attendanceAction,
          time: currentTime,
          date: currentDate
        });

        setAlertMessage(`${attendanceAction} recorded successfully for ${selectedEmp?.name} at ${new Date(currentTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
        setAlertType('success');
        setShowAlert(true);
        handleAttendanceModalClose();
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      setAlertMessage('Error saving attendance record');
      setAlertType('error');
      setShowAlert(true);
    }
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
    } else if (inputName === 'paymentNote') {
      setPaymentNote(input);
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
  const handleSalaryPayment = async () => {
    if (!paySalary || parseFloat(paySalary) <= 0) {
      setAlertMessage('Please enter a valid salary amount');
      setAlertType('error');
      setShowAlert(true);
      return;
    }
    
    try {
      if (api) {
        // Create salary payment record
        const paymentData = {
          employee_id: selectedEmployee.id,
          payment_date: new Date().toISOString().split('T')[0],
          amount: parseFloat(paySalary),
          payment_method: paymentMethod,
          payment_note: paymentNote || `Salary payment for ${selectedEmployee?.name}`,
          paid_by: 1 // Current logged-in employee ID
        };

        const result = await api.salaryPaymentCreate(paymentData);
        
        if (result.success) {
          // Reload employees to get updated data
          await loadEmployees();
          
          // Update the selected employee in the modal
          const updatedEmployee = employees.find(emp => emp.id === selectedEmployee.id);
          if (updatedEmployee) {
            setSelectedEmployee(updatedEmployee);
          }
          
          // Refresh attendance records to update calculations
          try {
            const res = await api.attendanceGetByEmployee(selectedEmployee.id);
            const records = Array.isArray(res) ? res : (res?.data || []);
            records.sort((a, b) => new Date(`${b.date} ${b.checkin || '00:00:00'}`) - new Date(`${a.date} ${a.checkin || '00:00:00'}`));
            setAttendanceRecords(records);
          } catch (e) {
            console.error('Error refreshing attendance records:', e);
          }
          
          setAlertMessage(`Salary payment of €${parseFloat(paySalary).toLocaleString()} saved successfully for ${selectedEmployee?.name}!`);
          setAlertType('success');
          setShowAlert(true);
          setPaySalary(''); // Reset the input
          setPaymentMethod('cash');
          setPaymentNote('');
        } else {
          setAlertMessage('Failed to save salary payment');
          setAlertType('error');
          setShowAlert(true);
        }
      } else {
        // Fallback for development
        console.log('Paying salary:', paySalary, 'for employee:', selectedEmployee?.name);
        
        // Create new salary payment record
        const newPayment = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount: parseFloat(paySalary),
          method: paymentMethod,
          note: paymentNote || `Salary payment for ${selectedEmployee?.name}`,
          paid_by: 1 // Current logged-in employee ID
        };
        
        // Update the employee's payment status and salary history
        if (selectedEmployee) {
          setEmployees(prevEmployees =>
            prevEmployees.map(employee =>
              employee.id === selectedEmployee.id
                ? { 
                    ...employee, 
                    isPaid: true,
                    salaryHistory: [...(employee.salaryHistory || []), newPayment]
                  }
                : employee
            )
          );
          
          // Update the selected employee in the modal
          setSelectedEmployee(prev => prev ? { 
            ...prev, 
            isPaid: true,
            salaryHistory: [...(prev.salaryHistory || []), newPayment]
          } : null);
        }
        
        setAlertMessage(`Salary payment of €${parseFloat(paySalary).toLocaleString()} saved successfully for ${selectedEmployee?.name}!`);
        setAlertType('success');
        setShowAlert(true);
        setPaySalary(''); // Reset the input
        setPaymentMethod('cash');
        setPaymentNote('');
      }
    } catch (error) {
      console.error('Error saving salary payment:', error);
      setAlertMessage('Error saving salary payment');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  // Handle salary history modal
  const handleSalaryHistoryModal = async (employee) => {
    setSelectedEmployee(employee);
    
    try {
      if (api) {
        // Load real salary history from database
        const result = await api.salaryPaymentGetByEmployee(employee.id);
        
        if (result.success) {
          // Transform database data to match component structure
          const transformedHistory = result.data.map(payment => ({
            id: payment.id,
            date: payment.payment_date,
            amount: payment.amount,
            method: payment.payment_method,
            note: payment.payment_note
          }));
          
          setSalaryHistory(transformedHistory);
        } else {
          setSalaryHistory([]);
        }
      } else {
        // Fallback to employee data
        setSalaryHistory(employee.salaryHistory || []);
      }
    } catch (error) {
      console.error('Error loading salary history:', error);
      setSalaryHistory(employee.salaryHistory || []);
    }
    
    setShowSalaryHistoryModal(true);
  };

  // Handle leave request modal
  const handleLeaveModalOpen = async () => {
    try {
      await loadEmployees();
    } catch (e) {}
    setShowLeaveModal(true);
    setLeaveType('');
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  // Handle leave request save
  const handleLeaveRequestSave = async () => {
    if (!leaveType || !leaveStartDate || !leaveEndDate) {
      setAlertMessage('Please fill in all required fields');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    const startDate = new Date(leaveStartDate);
    const endDate = new Date(leaveEndDate);
    
    if (startDate > endDate) {
      setAlertMessage('Start date cannot be after end date');
      setAlertType('error');
      setShowAlert(true);
      return;
    }

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    try {
      if (api) {
        // Check for overlapping leave requests
        const overlappingCheck = await api.leaveRequestCheckOverlapping(selectedEmployee.id, leaveStartDate, leaveEndDate);

        if (overlappingCheck.success && overlappingCheck.data.hasOverlapping) {
          setAlertMessage('Employee has overlapping leave requests for these dates');
          setAlertType('error');
          setShowAlert(true);
          return;
        }

        // Create leave request
        const leaveData = {
          employee_id: selectedEmployee.id,
          leave_type: leaveType,
          start_date: leaveStartDate,
          end_date: leaveEndDate,
          total_days: totalDays,
          reason: leaveReason
        };

        const result = await api.leaveRequestCreate(leaveData);
        
        if (result.success) {
          setAlertMessage(`Leave request submitted successfully for ${totalDays} days`);
          setAlertType('success');
          setShowAlert(true);
          handleLeaveModalClose();
        } else {
          setAlertMessage('Failed to submit leave request');
          setAlertType('error');
          setShowAlert(true);
        }
      } else {
        // Fallback for development
        console.log('Leave request:', {
          employeeId: selectedEmployee?.id,
          leaveType,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          totalDays,
          reason: leaveReason
        });

        setAlertMessage(`Leave request submitted successfully for ${totalDays} days`);
        setAlertType('success');
        setShowAlert(true);
        handleLeaveModalClose();
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      setAlertMessage('Error submitting leave request');
      setAlertType('error');
      setShowAlert(true);
    }
  };

  // Handle leave modal close
  const handleLeaveModalClose = () => {
    setShowLeaveModal(false);
    setLeaveType('');
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  // Calculate total salary paid
  const calculateTotalSalaryPaid = (employee) => {
    if (!employee.salaryHistory) return 0;
    return employee.salaryHistory.reduce((total, payment) => total + payment.amount, 0);
  };

  // Calculate total earned amount from attendance records
  const calculateTotalEarnedAmount = (employee) => {
    if (!attendanceRecords || attendanceRecords.length === 0) return 0;
    return attendanceRecords.reduce((total, record) => total + (record.earned_amount || 0), 0);
  };

  // Calculate pending amount
  const calculatePendingAmount = (employee) => {
    const totalEarned = calculateTotalEarnedAmount(employee);
    const totalPaid = calculateTotalSalaryPaid(employee);
    return Math.max(0, totalEarned - totalPaid);
  };

  // Calculate advance amount when payment exceeds pending
  const calculateAdvanceAmount = (paymentAmount, pendingAmount) => {
    return Math.max(0, paymentAmount - pendingAmount);
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

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleAttendanceModalOpen}
            className="px-6 py-3 bg-primary text-white font-medium rounded-lg cursor-pointer
            hover:translate-y-[2px] 
             transition-all flex items-center gap-2"
          >
            Employee Attendance
          </button>
          
          <button
            onClick={handleLeaveModalOpen}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg cursor-pointer
            hover:translate-y-[2px] 
             transition-all flex items-center gap-2"
          >
            Leave Request
          </button>
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
                          Salary
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
                      {attendanceRecords.map((record) => {
                        const checkInText = record.checkin ? new Date(record.checkin).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
                        const checkOutText = record.checkout ? new Date(record.checkout).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
                        const totalHours = record.total_hours != null ? record.total_hours : (record.checkin && record.checkout ? ((new Date(record.checkout) - new Date(record.checkin)) / (1000*60*60)).toFixed(2) : 0);
                        return (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(record.date)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {record.earned_amount ? `€${Number(record.earned_amount).toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {checkInText}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {checkOutText}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {totalHours > 0 ? `${totalHours}h` : '-'}
                          </td>
                        </tr>
                        );
                      })}
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
                

                
                {/* Salary Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Salary Information</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-sm font-medium text-gray-800">€{calculateTotalEarnedAmount(selectedEmployee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paid Amount:</span>
                      <span className="text-sm font-medium text-green-600">€{calculateTotalSalaryPaid(selectedEmployee).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Amount:</span>
                      <span className="text-sm font-medium text-red-600">€{calculatePendingAmount(selectedEmployee).toLocaleString()}</span>
                    </div>
                    {calculateAdvanceAmount(parseFloat(paySalary), calculatePendingAmount(selectedEmployee)) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Advance Amount:</span>
                        <span className="text-sm font-medium text-blue-600">€{calculateAdvanceAmount(parseFloat(paySalary), calculatePendingAmount(selectedEmployee)).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Salary History Button */}
                  <div className="mt-4">
                    <button
                      onClick={() => handleSalaryHistoryModal(selectedEmployee)}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      View Salary History
                    </button>
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
                      {paySalary && parseFloat(paySalary) > 0 && (
                        <div className="mt-2 text-sm">
                          {parseFloat(paySalary) > calculatePendingAmount(selectedEmployee) ? (
                            <div className="text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                              <strong>Advance Payment:</strong> This payment exceeds the pending amount by €{calculateAdvanceAmount(parseFloat(paySalary), calculatePendingAmount(selectedEmployee)).toFixed(2)}
                            </div>
                          ) : (
                            <div className="text-green-600 bg-green-50 p-2 rounded border border-green-200">
                              <strong>Regular Payment:</strong> This payment covers €{parseFloat(paySalary).toFixed(2)} of the €{calculatePendingAmount(selectedEmployee).toFixed(2)} pending amount
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Note
                      </label>
                      <textarea
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        onFocus={() => handleInputFocus('paymentNote')}
                        onBlur={handleInputBlur}
                        onClick={() => handleAnyInputClick(null, 'paymentNote')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        placeholder="Optional note about this payment"
                        rows="2"
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

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Employee Attendance</h3>
              <button onClick={handleAttendanceModalClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedEmployeeForAttendance}
                    onChange={async (e) => {
                      const value = e.target.value;
                      setSelectedEmployeeForAttendance(value);
                      // Dynamically decide which actions are available for today
                      try {
                        if (api && value) {
                          const today = new Date().toISOString().split('T')[0];
                          const status = await api.attendanceCheckTodayStatus(value, today);
                          if (status?.success && status.data) {
                            // Already has a record today
                            const hasCheckout = !!status.data.checkout;
                            if (hasCheckout) {
                              setAttendanceActionOptions(['Check In']);
                              setAttendanceAction('Check In');
                            } else {
                              setAttendanceActionOptions(['Check Out']);
                              setAttendanceAction('Check Out');
                            }
                          } else {
                            // No record yet today
                            setAttendanceActionOptions(['Check In']);
                            setAttendanceAction('Check In');
                          }
                        } else {
                          setAttendanceActionOptions(['Check In', 'Check Out']);
                          setAttendanceAction('');
                        }
                      } catch (err) {
                        console.error('Error checking today status:', err);
                        setAttendanceActionOptions(['Check In', 'Check Out']);
                        setAttendanceAction('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Choose an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.employeeId} - {employee.name} ({employee.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Action <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={attendanceAction}
                    onChange={(e) => setAttendanceAction(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Choose action</option>
                    {attendanceActionOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAttendanceModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAttendanceSave}
                  disabled={!selectedEmployeeForAttendance || !attendanceAction}
                  className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg 
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
                  active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary History Modal */}
      {showSalaryHistoryModal && selectedEmployee && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Salary History - {selectedEmployee.name}</h3>
              <button onClick={() => setShowSalaryHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Salary Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">€{calculateTotalEarnedAmount(selectedEmployee).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">€{calculateTotalSalaryPaid(selectedEmployee).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Paid Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">€{calculatePendingAmount(selectedEmployee).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Pending Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">€{calculateAdvanceAmount(calculateTotalSalaryPaid(selectedEmployee), calculatePendingAmount(selectedEmployee)).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Advance Amount</div>
                </div>
              </div>

              {/* Salary History Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Method</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Type</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryHistory.length > 0 ? (
                      salaryHistory.map((payment) => {
                        const paymentType = payment.amount > calculatePendingAmount(selectedEmployee) ? 'Advance' : 'Regular';
                        const typeColor = paymentType === 'Advance' ? 'text-blue-600' : 'text-green-600';
                        return (
                          <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {formatDate(payment.date)}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-green-600">
                              €{payment.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                            </td>
                            <td className="py-3 px-4 text-sm font-medium">
                              <span className={`${typeColor} bg-opacity-10 px-2 py-1 rounded-full text-xs`}>
                                {paymentType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {payment.note || '-'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          No salary payments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Leave Request</h3>
              <button onClick={handleLeaveModalClose} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedEmployee?.id || ''}
                    onChange={(e) => {
                      const emp = employees.find(emp => emp.id.toString() === e.target.value);
                      setSelectedEmployee(emp);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Choose an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.employeeId} - {employee.name} ({employee.role})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Choose leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={leaveStartDate}
                  onChange={(e) => setLeaveStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={leaveEndDate}
                  onChange={(e) => setLeaveEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Reason for leave request"
                  rows="3"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleLeaveModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeaveRequestSave}
                  disabled={!selectedEmployee || !leaveType || !leaveStartDate || !leaveEndDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg 
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
                  active:shadow-none active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                >
                  Submit Request
                </button>
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
          activeInput === 'paymentNote' ? (paymentNote || '') :
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