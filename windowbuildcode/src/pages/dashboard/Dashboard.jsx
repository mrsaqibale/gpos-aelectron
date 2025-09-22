import React, { useState } from 'react';
import { 
  ShoppingCart, 
  DollarSign, 
  Star,
  Utensils,
  Wallet,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Eye
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [salesTimeframe, setSalesTimeframe] = useState('30D');
  const [foodTimeframe, setFoodTimeframe] = useState('7D');

  // Dummy data for recent sales transactions
  const recentTransactions = [
    {
      id: '#ORD-001',
      customer: 'John Smith',
      items: 'Pizza Margherita, Coke',
      paymentMethod: 'Credit Card',
      total: 24.50,
      status: 'COMPLETED',
      time: '2 min ago'
    },
    {
      id: '#ORD-002',
      customer: 'Sarah Johnson',
      items: 'Burger Deluxe, Fries',
      paymentMethod: 'Cash',
      total: 18.75,
      status: 'COMPLETED',
      time: '5 min ago'
    },
    {
      id: '#ORD-003',
      customer: 'Mike Wilson',
      items: 'Pasta Carbonara',
      paymentMethod: 'Mobile Pay',
      total: 16.90,
      status: 'PROCESSING',
      time: '8 min ago'
    },
    {
      id: '#ORD-004',
      customer: 'Lisa Brown',
      items: 'Chicken Wings, Beer',
      paymentMethod: 'Credit Card',
      total: 22.30,
      status: 'COMPLETED',
      time: '12 min ago'
    },
    {
      id: '#ORD-005',
      customer: 'David Lee',
      items: 'Caesar Salad, Water',
      paymentMethod: 'Cash',
      total: 14.25,
      status: 'COMPLETED',
      time: '15 min ago'
    },
    {
      id: '#ORD-006',
      customer: 'Emma Davis',
      items: 'Steak, Wine',
      paymentMethod: 'Credit Card',
      total: 45.80,
      status: 'PREPARING',
      time: '18 min ago'
    }
  ];

  // Helper function to get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Credit Card':
        return <CreditCard className="w-4 h-4 text-yellow-600" />;
      case 'Cash':
        return <Banknote className="w-4 h-4 text-green-600" />;
      case 'Mobile Pay':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-600" />;
    }
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            {status}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {status}
          </span>
        );
      case 'PREPARING':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {status}
          </span>
        );
    }
  };

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

  // Payment Methods donut chart data
  const paymentChartData = {
    labels: ['Credit Card', 'Cash', 'Mobile Pay'],
    datasets: [
      {
        data: [65, 25, 10], // Percentages
        backgroundColor: [
          '#0f766e', // Dark teal - Credit Card
          '#0891b2', // Bright cyan/blue - Cash
          '#059669', // Green/teal - Mobile Pay
        ],
        borderWidth: 0,
        cutout: '60%', // Creates donut shape
      },
    ],
  };

  // Peak Hours Analysis chart data
  const peakHoursChartData = {
    labels: ['Lunch (12-2PM)', 'Dinner (6-8PM)', 'Late Night (9-11PM)'],
    datasets: [
      {
        label: 'Sales',
        data: [2700, 4100, 1300],
        backgroundColor: [
          '#0f766e', // Dark teal/blue - Lunch
          '#0891b2', // Bright cyan/blue - Dinner
          '#059669', // Green/teal - Late Night
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

  // Payment Methods donut chart options
  const paymentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
          },
        },
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
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  // Peak Hours Analysis chart options
  const peakHoursChartOptions = {
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
            return `Sales: $${context.parsed.y.toLocaleString()}`;
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
        max: 4500,
        grid: {
          color: 'rgba(229, 231, 235, 0.3)',
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
  };

  // Timeframe button component
  const TimeframeButton = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'bg-primary text-white'
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

      {/* First Row of Charts */}
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

      {/* Second Row of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Credit Card</span>
              <span>Cash</span>
              <span>Mobile Pay</span>
            </div>
          </div>
          <div className="h-80">
            <Doughnut data={paymentChartData} options={paymentChartOptions} />
          </div>
        </div>

        {/* Peak Hours Analysis Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Peak Hours Analysis</h3>
            </div>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span>Lunch</span>
              <span>Dinner</span>
              <span>Late Night</span>
            </div>
          </div>
          <div className="h-80">
            <Bar data={peakHoursChartData} options={peakHoursChartOptions} />
          </div>
        </div>
      </div>

      {/* Third Row - Recent Sales Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-800">Recent Sales Transactions</h3>
          </div>
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View All Sales
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Items</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Payment Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr 
                  key={transaction.id} 
                  className={`border-b border-gray-100 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{transaction.id}</td>
                  <td className="py-3 px-4 text-gray-700">{transaction.customer}</td>
                  <td className="py-3 px-4 text-gray-700">{transaction.items}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(transaction.paymentMethod)}
                      <span className="text-gray-700">{transaction.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">${transaction.total.toFixed(2)}</td>
                  <td className="py-3 px-4">{getStatusBadge(transaction.status)}</td>
                  <td className="py-3 px-4 text-gray-600">{transaction.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
    </div>
  );
};

export default Dashboard;