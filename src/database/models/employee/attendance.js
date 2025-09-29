const { ipcRenderer } = require('electron');

class Attendance {
  constructor() {
    this.tableName = 'attendance';
  }

  // Create new attendance record
  async create(attendanceData) {
    try {
      const result = await ipcRenderer.invoke('attendance-create', attendanceData);
      return result;
    } catch (error) {
      console.error('Error creating attendance record:', error);
      throw error;
    }
  }

  // Get attendance by employee ID
  async getByEmployeeId(employeeId, startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('attendance-get-by-employee', {
        employeeId,
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting attendance by employee:', error);
      throw error;
    }
  }

  // Get attendance by date range
  async getByDateRange(startDate, endDate) {
    try {
      const result = await ipcRenderer.invoke('attendance-get-by-date-range', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting attendance by date range:', error);
      throw error;
    }
  }

  // Get today's attendance
  async getTodayAttendance() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await ipcRenderer.invoke('attendance-get-by-date', today);
      return result;
    } catch (error) {
      console.error('Error getting today\'s attendance:', error);
      throw error;
    }
  }

  // Update attendance record
  async update(id, updateData) {
    try {
      const result = await ipcRenderer.invoke('attendance-update', {
        id,
        updateData
      });
      return result;
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw error;
    }
  }

  // Delete attendance record (soft delete)
  async delete(id) {
    try {
      const result = await ipcRenderer.invoke('attendance-delete', id);
      return result;
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw error;
    }
  }

  // Get attendance statistics
  async getStatistics(startDate = null, endDate = null) {
    try {
      const result = await ipcRenderer.invoke('attendance-get-statistics', {
        startDate,
        endDate
      });
      return result;
    } catch (error) {
      console.error('Error getting attendance statistics:', error);
      throw error;
    }
  }

  // Check if employee is already checked in today
  async isEmployeeCheckedInToday(employeeId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await ipcRenderer.invoke('attendance-check-today-status', {
        employeeId,
        date: today
      });
      return result;
    } catch (error) {
      console.error('Error checking today\'s status:', error);
      throw error;
    }
  }

  // Get employee attendance summary
  async getEmployeeAttendanceSummary(employeeId, month = null, year = null) {
    try {
      const result = await ipcRenderer.invoke('attendance-get-employee-summary', {
        employeeId,
        month,
        year
      });
      return result;
    } catch (error) {
      console.error('Error getting employee attendance summary:', error);
      throw error;
    }
  }

  // Bulk create attendance records
  async bulkCreate(attendanceRecords) {
    try {
      const result = await ipcRenderer.invoke('attendance-bulk-create', attendanceRecords);
      return result;
    } catch (error) {
      console.error('Error bulk creating attendance records:', error);
      throw error;
    }
  }

  // Get late employees for a specific date
  async getLateEmployees(date) {
    try {
      const result = await ipcRenderer.invoke('attendance-get-late-employees', date);
      return result;
    } catch (error) {
      console.error('Error getting late employees:', error);
      throw error;
    }
  }

  // Get absent employees for a specific date
  async getAbsentEmployees(date) {
    try {
      const result = await ipcRenderer.invoke('attendance-get-absent-employees', date);
      return result;
    } catch (error) {
      console.error('Error getting absent employees:', error);
      throw error;
    }
  }
}

module.exports = Attendance;
