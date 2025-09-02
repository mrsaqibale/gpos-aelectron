const { ipcRenderer } = require('electron');

class LeaveRequests {
  constructor() {
    this.tableName = 'leave_requests';
  }

  // Create new leave request
  async create(leaveData) {
    try {
      const result = await ipcRenderer.invoke('leave-request-create', leaveData);
      return result;
    } catch (error) {
      console.error('Error creating leave request:', error);
      throw error;
    }
  }

  // Get leave requests by employee ID
  async getByEmployeeId(employeeId, status = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-by-employee', {
        employeeId,
        status
      });
      return result;
    } catch (error) {
      console.error('Error getting leave requests by employee:', error);
      throw error;
    }
  }

  // Get leave request by ID
  async getById(id) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-by-id', id);
      return result;
    } catch (error) {
      console.error('Error getting leave request by ID:', error);
      throw error;
    }
  }

  // Get all leave requests with filters
  async getAll(filters = {}) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-all', filters);
      return result;
    } catch (error) {
      console.error('Error getting all leave requests:', error);
      throw error;
    }
  }

  // Get pending leave requests
  async getPendingRequests() {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-pending');
      return result;
    } catch (error) {
      console.error('Error getting pending leave requests:', error);
      throw error;
    }
  }

  // Get approved leave requests
  async getApprovedRequests(startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-approved', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting approved leave requests:', error);
      throw error;
    }
  }

  // Get rejected leave requests
  async getRejectedRequests() {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-rejected');
      return result;
    } catch (error) {
      console.error('Error getting rejected leave requests:', error);
      throw error;
    }
  }

  // Update leave request
  async update(id, updateData) {
    try {
      const result = await ipcRenderer.invoke('leave-request-update', {
        id,
        updateData
      });
      return result;
    } catch (error) {
      console.error('Error updating leave request:', error);
      throw error;
    }
  }

  // Approve leave request
  async approve(id, approvedBy, approvedAt = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-approve', {
        id,
        approvedBy,
        approvedAt: approvedAt || new Date().toISOString()
      });
      return result;
    } catch (error) {
      console.error('Error approving leave request:', error);
      throw error;
    }
  }

  // Reject leave request
  async reject(id, rejectedBy, rejectionReason) {
    try {
      const result = await ipcRenderer.invoke('leave-request-reject', {
        id,
        rejectedBy,
        rejectionReason,
        rejectedAt: new Date().toISOString()
      });
      return result;
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      throw error;
    }
  }

  // Delete leave request (soft delete)
  async delete(id) {
    try {
      const result = await ipcRenderer.invoke('leave-request-delete', id);
      return result;
    } catch (error) {
      console.error('Error deleting leave request:', error);
      throw error;
    }
  }

  // Get leave requests by date range
  async getByDateRange(startDate, endDate, status = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-by-date-range', {
        startDate,
        endDate,
        status
      });
      return result;
    } catch (error) {
      console.error('Error getting leave requests by date range:', error);
      throw error;
    }
  }

  // Get leave requests by type
  async getByType(leaveType, startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-by-type', {
        leaveType,
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting leave requests by type:', error);
      throw error;
    }
  }

  // Get leave statistics
  async getStatistics(startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-statistics', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting leave request statistics:', error);
      throw error;
    }
  }

  // Get employee leave balance
  async getEmployeeLeaveBalance(employeeId, year = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-employee-balance', {
        employeeId,
        year: year || new Date().getFullYear()
      });
      return result;
    } catch (error) {
      console.error('Error getting employee leave balance:', error);
      throw error;
    }
  }

  // Check if employee has overlapping leave requests
  async hasOverlappingLeave(employeeId, startDate, endDate, excludeId = null) {
    try {
      const result = await ipcRenderer.invoke('leave-request-check-overlapping', {
        employeeId,
        startDate,
        endDate,
        excludeId
      });
      return result;
    } catch (error) {
      console.error('Error checking overlapping leave:', error);
      throw error;
    }
  }

  // Get leave requests summary by month
  async getMonthlySummary(month, year) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-monthly-summary', {
        month,
        year
      });
      return result;
    } catch (error) {
      console.error('Error getting monthly leave summary:', error);
      throw error;
    }
  }

  // Get leave requests summary by year
  async getYearlySummary(year) {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-yearly-summary', year);
      return result;
    } catch (error) {
      console.error('Error getting yearly leave summary:', error);
      throw error;
    }
  }

  // Get leave requests by status count
  async getStatusCounts() {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-status-counts');
      return result;
    } catch (error) {
      console.error('Error getting leave request status counts:', error);
      throw error;
    }
  }

  // Get leave requests that need approval
  async getRequestsNeedingApproval() {
    try {
      const result = await ipcRenderer.invoke('leave-request-get-needing-approval');
      return result;
    } catch (error) {
      console.error('Error getting leave requests needing approval:', error);
      throw error;
    }
  }
}

module.exports = LeaveRequests;
