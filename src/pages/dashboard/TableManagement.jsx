import React, { useState } from 'react';
import { List, Grid } from 'lucide-react';
import FloorManagement from '../../components/dashboard/table/FloorManagement';
import TableManagement from '../../components/dashboard/table/TableManagement';

const TableManagementPage = () => {
  const [activeTab, setActiveTab] = useState('table'); // Default to table management

  return (
    <div className="px-4 py-2">
      {/* Buttons */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('floor')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'floor' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List size={16} />
            Floor Management
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'table' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid size={16} />
            Table Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'floor' && <FloorManagement />}
        {activeTab === 'table' && <TableManagement />}
      </div>
    </div>
  );
};

export default TableManagementPage; 