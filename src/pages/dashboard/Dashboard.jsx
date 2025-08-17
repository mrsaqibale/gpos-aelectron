import React, { useState } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Star,
  Utensils
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [salesTimeframe, setSalesTimeframe] = useState('30D');
  const [foodTimeframe, setFoodTimeframe] = useState('7D');

  // Sales chart data for different timeframes
  const getSalesData = (timeframe) => {
    switch (timeframe) {
      case '7D':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          data: [1200, 1900, 1600, 2100, 1800, 2200, 1950],
        };
      case '30D':
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [15000, 18000, 22000, 19000],
        };
      case '90D':
        return {
          labels: ['Month 1', 'Month 2', 'Month 3'],
          data: [45000, 52000, 48000],
        };
      default:
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [15000, 18000, 22000, 19000],
        };
    }
  };

  // Food items data for different timeframes
  const getFoodData = (timeframe) => {
    const baseData = {
      'Pizza': 34,
      'Burger': 24,
      'Pasta': 20,
      'Salad': 15,
      'Dessert': 5,
    };

    // Adjust values based on timeframe
    const multiplier = timeframe === '7D' ? 1 : timeframe === '30D' ? 4 : 12;
    return Object.fromEntries(
      Object.entries(baseData).map(([key, value]) => [key, value * multiplier])
    );
  };

  const salesData = getSalesData(salesTimeframe);
  const foodData = getFoodData(foodTimeframe);

  // Sales chart data
  const chartData = {
    labels: salesData.labels,
    datasets: [
      {
        label: 'Daily Sales',
        data: salesData.data,
        borderColor: '#0f766e', // Dark teal color
        backgroundColor: 'rgba(15, 118, 110, 0.1)', // Light teal with transparency
        borderWidth: 2,
        fill: true,
        tension: 0.4, // Smooth curve
        pointBackgroundColor: '#0f766e',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Food items chart data
  const foodChartData = {
    labels: Object.keys(foodData),
    datasets: [
      {
        label: 'Sales',
        data: Object.values(foodData),
        backgroundColor: [
          '#0f766e', // Dark teal - Pizza
          '#0891b2', // Bright blue - Burger
          '#059669', // Green - Pasta
          '#ea580c', // Orange - Salad
          '#dc2626', // Red - Dessert
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend since we only have one dataset
      },
      title: {
        display: true,
        color: '#0f766e', // Dark teal color
        font: {
          size: 16,
          weight: 'bold',
        },
        align: 'start',
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Sales: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide vertical grid lines
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: salesTimeframe === '7D' ? 2500 : salesTimeframe === '30D' ? 25000 : 60000,
        grid: {
          color: 'rgba(229, 231, 235, 0.3)', // Very light gray grid
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const foodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        color: '#0f766e',
        font: {
          size: 16,
          weight: 'bold',
        },
        align: 'start',
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Sales: ${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: foodTimeframe === '7D' ? 35 : foodTimeframe === '30D' ? 140 : 420,
        grid: {
          color: 'rgba(229, 231, 235, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  // Timeframe button component
  const TimeframeButton = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-teal-700 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Daily Sales Trend</h3>
            <div className="flex space-x-2">
              <TimeframeButton
                active={salesTimeframe === '7D'}
                onClick={() => setSalesTimeframe('7D')}
              >
                7D
              </TimeframeButton>
              <TimeframeButton
                active={salesTimeframe === '30D'}
                onClick={() => setSalesTimeframe('30D')}
              >
                30D
              </TimeframeButton>
              <TimeframeButton
                active={salesTimeframe === '90D'}
                onClick={() => setSalesTimeframe('90D')}
              >
                90D
              </TimeframeButton>
            </div>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Food Items Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Food Items</h3>
            <div className="flex space-x-2">
              <TimeframeButton
                active={foodTimeframe === '7D'}
                onClick={() => setFoodTimeframe('7D')}
              >
                7D
              </TimeframeButton>
              <TimeframeButton
                active={foodTimeframe === '30D'}
                onClick={() => setFoodTimeframe('30D')}
              >
                30D
              </TimeframeButton>
              <TimeframeButton
                active={foodTimeframe === '90D'}
                onClick={() => setFoodTimeframe('90D')}
              >
                90D
              </TimeframeButton>
            </div>
          </div>
          <div className="h-80">
            <Bar data={foodChartData} options={foodChartOptions} />
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Dashboard;