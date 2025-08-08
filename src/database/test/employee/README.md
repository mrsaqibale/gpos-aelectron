# Employee Login Test Files

This directory contains test files for the employee login functionality.

## Files

### 1. `testEmployeeLogin.js`
Comprehensive test file that:
- Creates a test employee
- Tests all employee login functions
- Performs multiple login/logout cycles
- Tests session management
- Provides detailed output

### 2. `simpleEmployeeLoginTest.js`
Simple test file that:
- Tests basic login/logout functionality
- Uses a predefined employee ID
- Provides quick verification

### 3. `runEmployeeLoginTest.js`
Test runner script that:
- Tests all employee login functions
- Provides formatted output
- Can be run from command line

## How to Run Tests

### Option 1: Run the comprehensive test
```bash
cd src/database/test/employee
node testEmployeeLogin.js
```

### Option 2: Run the simple test
```bash
cd src/database/test/employee
node simpleEmployeeLoginTest.js
```

### Option 3: Run the test runner
```bash
cd src/database/test/employee
node runEmployeeLoginTest.js
```

## Prerequisites

1. Make sure the database migration has been run:
   ```bash
   cd src/database
   node init.js
   ```

2. Ensure you have an employee in the database. If not, you can:
   - Use an existing employee ID (change the `testEmployeeId` in the test files)
   - Or run the comprehensive test which creates a test employee

## Test Functions

The tests verify the following functions:

### `createEmployeeLogin(employeeId)`
- Creates a new login session for an employee
- Sets login_time to current time
- Sets logout_time to null
- Returns login session details

### `updateEmployeeLogout(employeeId)`
- Finds the most recent open session for the employee
- Updates logout_time to current time
- Returns logout session details

### `getCurrentEmployeeSession(employeeId)`
- Returns the current active session for an employee
- Returns null if no active session exists

### `getEmployeeLoginSessions(employeeId, limit, offset)`
- Returns paginated list of login sessions for an employee
- Includes both active and completed sessions

### `getAllLoginSessions(limit, offset)`
- Returns all login sessions across all employees
- Includes employee details (name, role)
- Useful for admin/management views

## Expected Output

Successful tests should show:
- ✅ Login session created successfully
- ✅ Current session found
- ✅ Logout successful
- ✅ Session management working correctly

## Troubleshooting

### "No open login session found"
- This means the employee has no active sessions
- Create a login session first using `createEmployeeLogin()`

### "Employee not found"
- Make sure the employee ID exists in the database
- Check the employee table for valid IDs

### Database errors
- Ensure the migration has been run
- Check database file permissions
- Verify the database path is correct

## Integration with Frontend

These functions are exposed through IPC handlers:
- `employeeLogin:create` - Create login session
- `employeeLogin:logout` - Update logout time
- `employeeLogin:getSessions` - Get employee sessions
- `employeeLogin:getCurrentSession` - Get current session
- `employeeLogin:getAllSessions` - Get all sessions

The frontend can call these through `window.myAPI`:
```javascript
// Create login session
const result = await window.myAPI.createEmployeeLogin(employeeId);

// Update logout time
const logoutResult = await window.myAPI.updateEmployeeLogout(employeeId);
``` 