const { ipcRenderer } = require('electron');
const Attendance = require('./attendance');
const SalaryPayments = require('./salaryPayments');
const LeaveRequests = require('./leaveRequests');

class EnhancedEmployee {
  constructor() {
    this.tableName = 'employee';
    this.attendance = new Attendance();
    this.salaryPayments = new SalaryPayments();
    this.leaveRequests = new LeaveRequests();
  }

  // Get employee with comprehensive data
  async getEmployeeWithDetails(employeeId) {
    try {
      const employee = await ipcRenderer.invoke('employee-get-by-id', employeeId);
      if (!employee) return null;

      // Get attendance data
      const attendance = await this.attendance.getByEmployeeId(employeeId);
      
      // Get salary payment history
      const salaryHistory = await this.salaryPayments.getByEmployeeId(employeeId);
      
      // Get leave requests
      const leaveRequests = await this.leaveRequests.getByEmployeeId(employeeId);

      // Calculate attendance statistics
      const attendanceStats = this.calculateAttendanceStats(attendance);
      
      // Calculate salary statistics
      const salaryStats = this.calculateSalaryStats(employee.salary, salaryHistory);

      return {
        ...employee,
        attendance,
        attendanceStats,
        salaryHistory,
        salaryStats,
        leaveRequests
      };
    } catch (error) {
      console.error('Error getting employee with details:', error);
      throw error;
    }
  }

  // Get all employees with summary data
  async getAllEmployeesWithSummary(filters = {}) {
    try {
      const employees = await ipcRenderer.invoke('employee-get-all', filters);
      
      // Get summary data for each employee
      const employeesWithSummary = await Promise.all(
        employees.map(async (employee) => {
          try {
            const attendance = await this.attendance.getByEmployeeId(employee.id);
            const salaryHistory = await this.salaryPayments.getByEmployeeId(employee.id);
            const leaveRequests = await this.leaveRequests.getByEmployeeId(employee.id);

            const attendanceStats = this.calculateAttendanceStats(attendance);
            const salaryStats = this.calculateSalaryStats(employee.salary, salaryHistory);

            return {
              ...employee,
              attendanceStats,
              salaryStats,
              leaveRequestsCount: leaveRequests.length
            };
          } catch (error) {
            console.error(`Error getting summary for employee ${employee.id}:`, error);
            return employee;
          }
        })
      );

      return employeesWithSummary;
    } catch (error) {
      console.error('Error getting all employees with summary:', error);
      throw error;
    }
  }

  // Calculate attendance statistics
  calculateAttendanceStats(attendanceRecords) {
    if (!attendanceRecords || attendanceRecords.length === 0) {
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        totalHours: 0,
        attendanceRate: 0,
        averageHoursPerDay: 0
      };
    }

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'late').length;

    // Calculate total hours from actual check-in/check-out or stored total_hours
    const totalHours = attendanceRecords.reduce((sum, record) => {
      if (record && record.total_hours != null) {
        const hours = Number(record.total_hours);
        return sum + (Number.isFinite(hours) ? hours : 0);
      }
      if (record && record.checkin && record.checkout) {
        const start = new Date(record.checkin);
        const end = new Date(record.checkout);
        const diffMs = Math.max(0, end - start);
        const hours = diffMs / (1000 * 60 * 60);
        return sum + (Number.isFinite(hours) ? Math.round(hours * 100) / 100 : 0);
      }
      return sum;
    }, 0);
    
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    const averageHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      totalHours,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100
    };
  }

  // Calculate salary statistics
  calculateSalaryStats(monthlySalary, salaryHistory) {
    if (!salaryHistory || salaryHistory.length === 0) {
      return {
        totalPaid: 0,
        remaining: monthlySalary,
        isPaid: false,
        lastPaymentDate: null,
        paymentCount: 0
      };
    }

    const totalPaid = salaryHistory.reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = Math.max(0, monthlySalary - totalPaid);
    const isPaid = remaining === 0;
    const lastPaymentDate = salaryHistory[salaryHistory.length - 1]?.date;
    const paymentCount = salaryHistory.length;

    return {
      totalPaid,
      remaining,
      isPaid,
      lastPaymentDate,
      paymentCount
    };
  }

  // Get employee dashboard data
  async getEmployeeDashboardData(employeeId, startDate = null, endDate = null) {
    try {
      const employee = await this.getEmployeeWithDetails(employeeId);
      if (!employee) return null;

      // Get date range for statistics
      const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const end = endDate || new Date().toISOString().split('T')[0];

      // Get filtered attendance data
      const filteredAttendance = await this.attendance.getByEmployeeId(employeeId, start, end);
      
      // Get filtered salary data
      const filteredSalaryHistory = await this.salaryPayments.getByEmployeeId(employeeId, start, end);
      
      // Get filtered leave requests
      const filteredLeaveRequests = await this.leaveRequests.getByEmployeeId(employeeId);

      // Calculate filtered statistics
      const filteredAttendanceStats = this.calculateAttendanceStats(filteredAttendance);
      const filteredSalaryStats = this.calculateSalaryStats(employee.salary, filteredSalaryHistory);

      return {
        employee: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          role: employee.roll,
          salary: employee.salary,
          joiningDate: employee.created_at
        },
        attendance: {
          records: filteredAttendance,
          stats: filteredAttendanceStats
        },
        salary: {
          history: filteredSalaryHistory,
          stats: filteredSalaryStats
        },
        leave: {
          requests: filteredLeaveRequests,
          pendingCount: filteredLeaveRequests.filter(req => req.status === 'pending').length,
          approvedCount: filteredLeaveRequests.filter(req => req.status === 'approved').length,
          rejectedCount: filteredLeaveRequests.filter(req => req.status === 'rejected').length
        }
      };
    } catch (error) {
      console.error('Error getting employee dashboard data:', error);
      throw error;
    }
  }

  // Get company-wide statistics
  async getCompanyStatistics(startDate = null, endDate = null) {
    try {
      const employees = await this.getAllEmployeesWithSummary();
      
      // Calculate company-wide statistics
      const totalEmployees = employees.length;
      const totalSalary = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
      const totalPaidSalary = employees.reduce((sum, emp) => sum + (emp.salaryStats?.totalPaid || 0), 0);
      const totalRemainingSalary = employees.reduce((sum, emp) => sum + (emp.salaryStats?.remaining || 0), 0);
      
      // Attendance statistics
      const totalAttendanceRate = employees.reduce((sum, emp) => sum + (emp.attendanceStats?.attendanceRate || 0), 0);
      const averageAttendanceRate = totalEmployees > 0 ? totalAttendanceRate / totalEmployees : 0;
      
      // Leave statistics
      const totalLeaveRequests = employees.reduce((sum, emp) => sum + (emp.leaveRequestsCount || 0), 0);

      return {
        employees: {
          total: totalEmployees,
          active: employees.filter(emp => emp.isActive).length,
          inactive: employees.filter(emp => !emp.isActive).length
        },
        salary: {
          total: totalSalary,
          paid: totalPaidSalary,
          remaining: totalRemainingSalary,
          paidPercentage: totalSalary > 0 ? (totalPaidSalary / totalSalary) * 100 : 0
        },
        attendance: {
          averageRate: Math.round(averageAttendanceRate * 100) / 100
        },
        leave: {
          totalRequests: totalLeaveRequests
        }
      };
    } catch (error) {
      console.error('Error getting company statistics:', error);
      throw error;
    }
  }

  // Get employees by attendance status
  async getEmployeesByAttendanceStatus(status, date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      let employees = [];

      switch (status) {
        case 'present':
          employees = await this.attendance.getByDateRange(targetDate, targetDate);
          break;
        case 'absent':
          employees = await this.attendance.getAbsentEmployees(targetDate);
          break;
        case 'late':
          employees = await this.attendance.getLateEmployees(targetDate);
          break;
        default:
          throw new Error('Invalid attendance status');
      }

      return employees;
    } catch (error) {
      console.error('Error getting employees by attendance status:', error);
      throw error;
    }
  }

  // Get employees with pending salary
  async getEmployeesWithPendingSalary() {
    try {
      const employees = await this.getAllEmployeesWithSummary();
      return employees.filter(emp => !emp.salaryStats?.isPaid);
    } catch (error) {
      console.error('Error getting employees with pending salary:', error);
      throw error;
    }
  }

  // Get employees with low attendance
  async getEmployeesWithLowAttendance(threshold = 80) {
    try {
      const employees = await this.getAllEmployeesWithSummary();
      return employees.filter(emp => emp.attendanceStats?.attendanceRate < threshold);
    } catch (error) {
      console.error('Error getting employees with low attendance:', error);
      throw error;
    }
  }
}

module.exports = EnhancedEmployee;
