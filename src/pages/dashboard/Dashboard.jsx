import React from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Star,
  Utensils
} from 'lucide-react';

const Dashboard = () => {
  

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600">
            Real-time insights into your restaurant performance
            </p>
          </div>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-800">$12,847</p>
                <p className="text-sm text-green-600 mt-1">+12.5% vs last week</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Orders Today Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Orders Today</p>
                <p className="text-3xl font-bold text-gray-800">156</p>
                <p className="text-sm text-green-600 mt-1">+8.2% vs yesterday</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Food Items Sold Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Food Items Sold</p>
                <p className="text-3xl font-bold text-gray-800">342</p>
                <p className="text-sm text-green-600 mt-1">+15.3% vs yesterday</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Customer Rating Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Customer Rating</p>
                <p className="text-3xl font-bold text-gray-800">4.8/5</p>
                <p className="text-sm text-green-600 mt-1">+0.2 vs last week</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      
    </div>
  );
};

export default Dashboard;