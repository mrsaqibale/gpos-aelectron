const { ipcRenderer } = require('electron');

class SalaryPayments {
  constructor() {
    this.tableName = 'salary_payments';
  }

  // Create new salary payment record
  async create(paymentData) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-create', paymentData);
      return result;
    } catch (error) {
      console.error('Error creating salary payment record:', error);
      throw error;
    }
  }

  // Get salary payments by employee ID
  async getByEmployeeId(employeeId, startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-by-employee', {
        employeeId,
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting salary payments by employee:', error);
      throw error;
    }
  }

  // Get salary payments by date range
  async getByDateRange(startDate, endDate) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-by-date-range', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting salary payments by date range:', error);
      throw error;
    }
  }

  // Get salary payment by ID
  async getById(id) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-by-id', id);
      return result;
    } catch (error) {
      console.error('Error getting salary payment by ID:', error);
      throw error;
    }
  }

  // Update salary payment record
  async update(id, updateData) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-update', {
        id,
        updateData
      });
      return result;
    } catch (error) {
      console.error('Error updating salary payment record:', error);
      throw error;
    }
  }

  // Delete salary payment record (soft delete)
  async delete(id) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-delete', id);
      return result;
    } catch (error) {
      console.error('Error deleting salary payment record:', error);
      throw error;
    }
  }

  // Get total salary paid to employee
  async getTotalPaidToEmployee(employeeId, startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-total-paid', {
        employeeId,
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting total salary paid:', error);
      throw error;
    }
  }

  // Get salary payment statistics
  async getStatistics(startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-statistics', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting salary payment statistics:', error);
      throw error;
    }
  }

  // Get pending salary payments
  async getPendingPayments() {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-pending');
      return result;
    } catch (error) {
      console.error('Error getting pending salary payments:', error);
      throw error;
    }
  }

  // Get salary payment history for employee
  async getPaymentHistory(employeeId, limit = 50) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-history', {
        employeeId,
        limit
      });
      return result;
    } catch (error) {
      console.error('Error getting salary payment history:', error);
      throw error;
    }
  }

  // Get salary payments by payment method
  async getByPaymentMethod(method, startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-by-method', {
        method,
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting salary payments by method:', error);
      throw error;
    }
  }

  // Get monthly salary summary
  async getMonthlySummary(month, year) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-monthly-summary', {
        month,
        year
      });
      return result;
    } catch (error) {
      console.error('Error getting monthly salary summary:', error);
      throw error;
    }
  }

  // Get yearly salary summary
  async getYearlySummary(year) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-yearly-summary', year);
      return result;
    } catch (error) {
      console.error('Error getting yearly salary summary:', error);
      throw error;
    }
  }

  // Check if employee has pending salary
  async hasPendingSalary(employeeId) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-check-pending', employeeId);
      return result;
    } catch (error) {
      console.error('Error checking pending salary:', error);
      throw error;
    }
  }

  // Get salary payment methods summary
  async getPaymentMethodsSummary(startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('salary-payment-get-methods-summary', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting payment methods summary:', error);
      throw error;
    }
  }
}

module.exports = SalaryPayments;
