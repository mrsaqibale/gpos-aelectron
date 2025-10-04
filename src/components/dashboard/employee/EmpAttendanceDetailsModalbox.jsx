import React, { useState, useEffect } from 'react';
import { X, Calendar, Phone, Home, Wallet, BriefcaseBusiness, CreditCard, Check } from 'lucide-react';
import CustomAlert from '../../CustomAlert';
import VirtualKeyboard from '../../VirtualKeyboard';
import SalaryHistory from './SalaryHistory';

const EmpAttendanceDetailsModalbox = ({ isOpen, onClose, employee }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [salaryData, setSalaryData] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    givenAmount: '',
    paymentMethod: 'card', // 'card' or 'cash'
    note: ''
  });

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Keyboard state
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeInput, setActiveInput] = useState('');

  // Salary History modal state
  const [showSalaryHistory, setShowSalaryHistory] = useState(false);

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

  // Payment form handlers
  const handlePaySalaryClick = () => {
    setShowPaymentForm(!showPaymentForm);
  };

  const handlePaymentInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentData(prev => ({
      ...prev,
      paymentMethod: method
    }));
  };

  const handlePaymentSubmit = () => {
    // Validate required fields
    if (!paymentData.givenAmount) {
      setAlertMessage('Please enter the payment amount');
      setShowAlert(true);
      return;
    }

    if (!paymentData.paymentMethod) {
      setAlertMessage('Please select a payment method');
      setShowAlert(true);
      return;
    }

    // Handle payment submission logic here
    console.log('Payment submitted:', paymentData);
    
    // Reset form and close
    setPaymentData({
      givenAmount: '',
      paymentMethod: 'card',
      note: ''
    });
    setShowPaymentForm(false);
    
    // Show success message
    setAlertMessage(`Payment of €${paymentData.givenAmount} processed successfully via ${paymentData.paymentMethod.toUpperCase()}!`);
    setShowAlert(true);
    
    // You can add API call here to process the payment
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    setAlertMessage('');
  };

  // Keyboard handlers
  const handleInputFocus = (inputType) => {
    setActiveInput(inputType);
    setShowKeyboard(true);
  };

  const handleInputBlur = (e) => {
    if (e.relatedTarget && e.relatedTarget.closest('.hg-theme-default')) {
      return;
    }
    
    setTimeout(() => {
      setShowKeyboard(false);
      setActiveInput('');
    }, 100);
  };

  const handleKeyboardChange = (input) => {
    if (activeInput === 'givenAmount') {
      setPaymentData(prev => ({
        ...prev,
        givenAmount: input
      }));
    } else if (activeInput === 'note') {
      setPaymentData(prev => ({
        ...prev,
        note: input
      }));
    }
  };

  const handleKeyboardClose = () => {
    setShowKeyboard(false);
    setActiveInput('');
  };

  // Form validation
  const isFormValid = () => {
    return paymentData.givenAmount.trim() !== '' && paymentData.paymentMethod;
  };

  // Salary History handlers
  const handleViewSalaryHistory = () => {
    setShowSalaryHistory(true);
  };

  const handleCloseSalaryHistory = () => {
    setShowSalaryHistory(false);
  };

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Employee Attendance Details</h2>
          <button
            onClick={onClose}
            className="text-white 200 transition-colors"
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

              <button 
                onClick={handleViewSalaryHistory}
                className="w-full mt-4 bg-primary text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 "
              >
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
                <button 
                  onClick={handlePaySalaryClick}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 0 transition-colors"
                >
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
                    <tr key={index} className="border-b border-gray-200 ">
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

            {/* Make Payment Form */}
            {showPaymentForm && (
              <div className="mt-6 border-2 border-primary rounded-lg p-6 bg-gray-50">
                <h4 className="text-lg font-semibold text-primary mb-6">Make Payment</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Total Pending */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Pending
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(salaryData.pendingAmount)}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 focus:outline-none"
                    />
                  </div>

                  {/* Given Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Given Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter amount"
                      value={paymentData.givenAmount}
                      onChange={(e) => handlePaymentInputChange('givenAmount', e.target.value)}
                      onFocus={() => handleInputFocus('givenAmount')}
                      onBlur={handleInputBlur}
                      onClick={() => handleInputFocus('givenAmount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Payment Method and Note */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePaymentMethodChange('card')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                          paymentData.paymentMethod === 'card'
                            ? 'border-primary bg-green-100 text-primary'
                            : 'border-gray-300 bg-white text-gray-700 '
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        Card
                      </button>
                      <button
                        onClick={() => handlePaymentMethodChange('cash')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border-2 transition-colors ${
                          paymentData.paymentMethod === 'cash'
                            ? 'border-primary bg-green-100 text-primary'
                            : 'border-gray-300 bg-white text-gray-700 '
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                        Cash
                      </button>
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <textarea
                      placeholder="Add payment note (optional)"
                      value={paymentData.note}
                      onChange={(e) => handlePaymentInputChange('note', e.target.value)}
                      onFocus={() => handleInputFocus('note')}
                      onBlur={handleInputBlur}
                      onClick={() => handleInputFocus('note')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!isFormValid()}
                  className={`w-full py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors font-medium ${
                    isFormValid()
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-5 h-5" />
                  Pay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        message={alertMessage}
        isVisible={showAlert}
        onClose={handleAlertClose}
        type="success"
        duration={3000}
      />

      {/* Virtual Keyboard */}
      <VirtualKeyboard
        isVisible={showKeyboard}
        onClose={handleKeyboardClose}
        activeInput={activeInput}
        onInputChange={handleKeyboardChange}
        onInputBlur={handleInputBlur}
        inputValue={activeInput === 'givenAmount' ? paymentData.givenAmount : paymentData.note}
        placeholder={activeInput === 'givenAmount' ? 'Enter amount...' : 'Add payment note...'}
      />

      {/* Salary History Modal */}
      <SalaryHistory
        isOpen={showSalaryHistory}
        onClose={handleCloseSalaryHistory}
        employee={employee}
      />
    </div>
  );
};

export default EmpAttendanceDetailsModalbox;