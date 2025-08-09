import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  MapPin, 
  ShoppingBag, 
  Eye,
  Check,
  X,
  ChefHat,
  CheckCircle,
  DollarSign,
  ChevronRight,
  Edit,
  Printer,
  Calendar,
  Filter,
  RotateCcw
} from 'lucide-react';

const ManageOrders = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [appliedDateFilter, setAppliedDateFilter] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockOrders = [
      {
        id: '100031',
        type: 'web',
        orderDate: '05 Jul 2025',
        orderTime: '07:43 PM',
        collectionTime: '05 Jul 2025 09:10 pm',
        customer: 'John Dolan',
        phone: '0894632626',
        source: 'Online App',
        items: ['2x Margherita Pizza', '1x Caesar Salad'],
        total: 42.90,
        paymentMethod: 'Card',
        orderMethod: 'Delivery',
        status: 'pending',
        paymentStatus: 'paid'
      },
      {
        id: '100029',
        type: 'pos',
        orderDate: '05 Jul 2025',
        orderTime: '06:50 PM',
        collectionTime: '05 Jul 2025 07:15 pm',
        customer: 'Jessica Irving',
        phone: '0962626267',
        source: 'POS Terminal',
        items: ['1x Burger Deluxe', '2x French Fries'],
        total: 58.80,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'preparing',
        paymentStatus: 'paid'
      },
      {
        id: '100028',
        type: 'pos',
        orderDate: '05 Jul 2025',
        orderTime: '06:24 PM',
        collectionTime: '05 Jul 2025 07:00 pm',
        customer: 'Sandra McDowell',
        phone: '08637637623',
        source: 'POS Terminal',
        items: ['1x Chicken Alfredo'],
        total: 70.55,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'ready',
        paymentStatus: 'unpaid'
      },
      {
        id: '100026',
        type: 'web',
        orderDate: '05 Jul 2025',
        orderTime: '01:46 PM',
        collectionTime: '05 Jul 2025 06:00 pm',
        customer: 'Michelle Lonergan',
        phone: '086237676',
        source: 'Website',
        items: ['1x Pepperoni Pizza', '1x Garlic Bread'],
        total: 28.10,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        id: '100025',
        type: 'pos',
        orderDate: '04 Jul 2025',
        orderTime: '09:30 AM',
        collectionTime: '04 Jul 2025 10:30 am',
        customer: 'Anna Davis',
        phone: '082367237',
        source: 'POS Terminal',
        items: ['1x Fish & Chips'],
        total: 16.99,
        paymentMethod: 'Cash',
        orderMethod: 'Delivery',
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        id: '100024',
        type: 'dinein',
        orderDate: '05 Jul 2025',
        orderTime: '05:30 PM',
        collectionTime: '05 Jul 2025 06:30 pm',
        customer: 'Michael Brown',
        phone: '23236368238',
        source: 'Dine In',
        items: ['1x Steak Dinner', '1x Wine'],
        total: 85.50,
        paymentMethod: 'Card',
        orderMethod: 'Dine In',
        status: 'new',
        paymentStatus: 'unpaid'
      },
      {
        id: '100023',
        type: 'web',
        orderDate: '06 Jul 2025',
        orderTime: '12:30 PM',
        collectionTime: '06 Jul 2025 01:30 pm',
        customer: 'Sarah Johnson',
        phone: '0851234567',
        source: 'Website',
        items: ['1x Chicken Curry', '1x Naan Bread'],
        total: 35.40,
        paymentMethod: 'Card',
        orderMethod: 'Collection',
        status: 'cancelled',
        paymentStatus: 'refunded'
      }
    ];
    setOrders(mockOrders);
  }, []);

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'collection', label: 'Collection', count: orders.filter(o => o.orderMethod === 'Collection').length },
    { id: 'delivery', label: 'Delivery', count: orders.filter(o => o.orderMethod === 'Delivery').length },
    { id: 'web', label: 'Web Orders', count: orders.filter(o => o.type === 'web').length },
    { id: 'dinein', label: 'Dine In', count: orders.filter(o => o.orderMethod === 'Dine In').length },
    { id: 'paid', label: 'Paid', count: orders.filter(o => o.paymentStatus === 'paid').length },
    { id: 'unpaid', label: 'Unpaid', count: orders.filter(o => o.paymentStatus === 'unpaid').length }
  ];

  const formatDateForComparison = (dateStr) => {
    // Convert "05 Jul 2025" format to "2025-07-05" format for comparison
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = months[parts[1]];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by tab
    if (activeTab === 'collection') {
      filtered = filtered.filter(o => o.orderMethod === 'Collection');
    } else if (activeTab === 'delivery') {
      filtered = filtered.filter(o => o.orderMethod === 'Delivery');
    } else if (activeTab === 'web') {
      filtered = filtered.filter(o => o.type === 'web');
    } else if (activeTab === 'dinein') {
      filtered = filtered.filter(o => o.orderMethod === 'Dine In');
    } else if (activeTab === 'paid') {
      filtered = filtered.filter(o => o.paymentStatus === 'paid');
    } else if (activeTab === 'unpaid') {
      filtered = filtered.filter(o => o.paymentStatus === 'unpaid');
    }

    // Filter by applied search term (Order ID only)
    if (appliedSearchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(appliedSearchTerm.toLowerCase())
      );
    }

    // Filter by applied date filter
    if (appliedDateFilter) {
      filtered = filtered.filter(o => {
        const orderDate = formatDateForComparison(o.orderDate);
        return orderDate === appliedDateFilter;
      });
    }

    return filtered;
  };

  const handleApplyFilters = () => {
    setAppliedSearchTerm(searchTerm);
    setAppliedDateFilter(dateFilter);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setAppliedSearchTerm('');
    setAppliedDateFilter('');
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-purple-50 text-purple-700 border-purple-200',
      pending: 'bg-orange-50 text-orange-700 border-orange-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      preparing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      ready: 'bg-green-50 text-green-700 border-green-200',
      completed: 'bg-gray-50 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusText = (status) => {
    const statusMap = {
      new: 'New',
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getActionButtons = (order) => {
    return (
      <div className="flex gap-2">
        <button className="text-primary cursor-pointer transition-colors">
          <Edit size={16} />
        </button>
        <button className="text-primary hover:text-gray-800 cursor-pointer transition-colors">
          <Printer size={16} />
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col px-4 py-2">
      {/* Filter Tabs - Fixed at top */}
      <div className="flex-shrink-0 p-4 bg-white rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-primaryLight text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Search and Date Filter - Fixed */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex justify-end">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by Order ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 px-4 py-1.5 border text-sm border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Date Filter */}
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primaryLight focus:border-transparent"
                />
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={handleApplyFilters}
                className="px-4 py-1.5 bg-primaryLight text-white text-sm font-medium rounded-lg cursor-pointer transition-colors flex items-center gap-2"
              >
                <Filter size={16} />
                Apply Filters
              </button>

              {/* Clear Filters Button */}
              <button
                onClick={handleClearFilters}
                className="px-4 py-1.5 bg-gray-100 text-gray-700 cursor-pointer text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(appliedSearchTerm || appliedDateFilter) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Active Filters:</span>
              {appliedSearchTerm && (
                <span className="px-2 py-1 bg-primaryExtraLight text-primary font-medium rounded-full text-xs">
                  Order ID: {appliedSearchTerm}
                </span>
              )}
              {appliedDateFilter && (
                <span className="px-2 py-1 bg-primaryExtraLight text-primary font-medium rounded-full text-xs">
                  Date: {appliedDateFilter}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table Container - Scrollable */}
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse overflow-hidden rounded-xl shadow-sm">
            <thead className="sticky top-0 bg-primaryExtraLight z-10">
              <tr>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    SI
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-4 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Order ID
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Order Date
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Collection Time
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Customer Information
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Total Amount
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    Order Status
                    <ChevronRight size={12} className="rotate-90" />
                  </div>
                </th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((order, index) => (
                <tr key={order.id} className={`border-b border-gray-100 hover:bg-gray-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-primary">{order.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-800">{order.orderDate}</div>
                      <div className="text-xs text-gray-600">{order.orderTime}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{order.collectionTime}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-600">{order.phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-800">{order.total.toFixed(2)} €</div>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentMethod === 'Card' ? 'bg-primaryExtraLight text-primary' : 'bg-green-100 text-green-800'}`}>
                          {order.paymentMethod}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium bg-primaryExtraLight text-primary`}>
                        {getStatusText(order.status)}
                      </span>
                      <div className="text-xs text-primary mt-2 pl-1">{order.orderMethod}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getActionButtons(order)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredOrders().length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-300 mb-3">
                <ShoppingBag size={40} className="mx-auto" />
              </div>
              <p className="text-gray-600 font-medium text-sm">No orders found</p>
              <p className="text-gray-500 text-xs">Orders matching your filter criteria will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;