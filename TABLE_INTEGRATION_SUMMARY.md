# Table Integration Summary

## Overview
This document summarizes the integration of floor and table management functionality into the GPOS system, replacing hardcoded values with dynamic database-driven data.

## Database Schema

### Floor Table (`floor`)
- `id`: Primary key
- `name`: Floor name (e.g., "1st Floor", "2nd Floor")
- `type`: Floor type (e.g., "Dining", "VIP")
- `created_at`, `updated_at`: Timestamps
- `isdeleted`: Soft delete flag
- `addedby`: User who added the floor

### Restaurant Table (`restaurant_table`)
- `id`: Primary key
- `table_no`: Table number/identifier
- `floor_id`: Foreign key to floor table
- `seat_capacity`: Number of seats (default: 4)
- `status`: Table status ("Free", "Occupied", "Reserved")
- `created_at`, `updated_at`: Timestamps
- `isdeleted`: Soft delete flag
- `addedby`: User who added the table

## Implementation Details

### 1. Database Models

#### `src/database/models/tables/floor.js`
- `createFloor()`: Create new floor
- `updateFloor()`: Update floor details
- `getFloorById()`: Get floor by ID
- `getAllFloors()`: Get all floors with table count

#### `src/database/models/tables/tables.js`
- `createTable()`: Create new table
- `updateTable()`: Update table details
- `getTableById()`: Get table by ID with floor info
- `getAllTables()`: Get all tables with floor info
- `getTablesByFloor()`: Get tables by floor ID
- `getTablesByFloorWithStatus()`: Get tables by floor ID with status filter

### 2. IPC Handlers

#### `electron/ipchandler/floor.cjs`
- `floor:create`: Create floor
- `floor:update`: Update floor
- `floor:getById`: Get floor by ID
- `floor:getAll`: Get all floors

#### `electron/ipchandler/table.cjs`
- `table:create`: Create table
- `table:update`: Update table
- `table:getById`: Get table by ID
- `table:getAll`: Get all tables
- `table:getByFloor`: Get tables by floor
- `table:getByFloorWithStatus`: Get tables by floor with status filter

### 3. Frontend Integration

#### `src/pages/dashboard/RunningOrders.jsx`
Key functions added:
- `fetchFloors()`: Fetch all floors from database
- `fetchTablesByFloor(floorName)`: Fetch tables for specific floor with "Free" status
- `handleFloorSelect(floor)`: Handle floor selection and fetch corresponding tables
- `handleTableSelect(tableId)`: Handle table selection
- `getSelectedTableData()`: Get data for selected table
- `getSeatCapacityOptions()`: Generate seat capacity options based on selected table

## Features Implemented

### 1. Dynamic Floor Loading
- ✅ Fetches all floors from database using `getAllFloors()`
- ✅ Displays floors in selection interface
- ✅ Loading states and error handling

### 2. Status-Based Table Filtering
- ✅ Shows only tables with "Free" status
- ✅ Uses `getTablesByFloorWithStatus(floorId, 'Free')`
- ✅ Handles cases where status column doesn't exist

### 3. Seat Capacity Integration
- ✅ Reads `seat_capacity` from database (default: 4)
- ✅ Dynamically generates person options (1 to seat_capacity)
- ✅ Example: 4-seat table shows options 1, 2, 3, 4

### 4. Table Selection Logic
- ✅ Table dropdown shows: "Table {table_no} ({seat_capacity} seats)"
- ✅ Persons dropdown limited to seat capacity
- ✅ Proper state management and validation

### 5. Merge Table Functionality
- ✅ Both merge table dropdowns use database data
- ✅ Consistent with main table selection logic
- ✅ Same status filtering applies

## Database Migrations

### Existing Migrations
- `012_create_floor_table.sql`: Creates floor table
- `013_create_table_table.sql`: Creates restaurant_table table
- `017_add_seat_capacity_to_table.sql`: Adds seat_capacity and status columns

## Testing

### Test Scripts
- `src/database/test/table-test.js`: Core test functions
- `src/database/test/run-table-test.js`: Test runner
- `npm run test:table-integration`: Run integration test

### Sample Data
The test script inserts sample data:
- 3 floors: "1st Floor", "2nd Floor", "3rd Floor"
- 12 tables with varying seat capacities (2, 4, 6, 8 seats)
- Mixed statuses: "Free", "Occupied", "Reserved"

## Usage Flow

1. **Floor Selection**: User selects a floor from database-driven dropdown
2. **Table Loading**: System fetches only "Free" tables for selected floor
3. **Table Selection**: User selects from available tables showing seat capacity
4. **Person Selection**: Dropdown shows options 1 to seat_capacity
5. **Merge Tables**: Same logic applies for table merging functionality

## Error Handling

- ✅ Graceful handling when database is unavailable
- ✅ Loading states for all async operations
- ✅ Fallback to default values when columns don't exist
- ✅ Proper error messages and logging

## Performance Considerations

- ✅ Efficient database queries with proper joins
- ✅ Caching of floor data (fetched once on component mount)
- ✅ Lazy loading of table data (fetched when floor selected)
- ✅ Minimal re-renders with proper state management

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live table status updates
2. **Table Reservation**: Advanced booking system
3. **Floor Plan Visualization**: 3D floor plan with table positions
4. **Analytics**: Table usage statistics and optimization
5. **Multi-location Support**: Support for multiple restaurant locations

## Conclusion

The table integration successfully replaces all hardcoded floor and table data with dynamic database-driven functionality. The implementation provides a robust, scalable solution that handles real-world restaurant scenarios with proper error handling and user experience considerations.
