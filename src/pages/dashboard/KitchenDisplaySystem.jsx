import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Clock, 
  User, 
  MapPin, 
  ChefHat,
  Bell,
  RotateCcw,
  Calendar,
  Eye,
  Plus,
  AlertTriangle,
  Utensils,
  Timer,
  CheckCircle
} from 'lucide-react';
import KDSCard from '../../components/dashboard/kds/KDSCard';


const KitchenDisplaySystem = () => {
  // Get context from layout
  const {
    kdsCurrentView = 'cards',
    kdsShowNotifications = false,
    kdsShowRecall = false,
    kdsNotificationCount = 0,
    setKdsCurrentView,
    setKdsShowNotifications,
    setKdsShowRecall,
    setKdsNotificationCount
  } = useOutletContext() || {};

  const [activeTab, setActiveTab] = useState('new'); // 'new', 'preparing', 'ready'
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recalledOrders, setRecalledOrders] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders = [
      {
        id: 'KDS001',
        tableNumber: 5,
        orderType: 'Dine-In',
        elapsedTime: 540, // seconds
        placedAt: new Date(Date.now() - 540000),
        items: [
          { 
            id: 1, 
            name: 'Chicken Biryani', 
            status: 'new',
            notes: 'Less spicy',
            isAddedLate: false
          },
          { 
            id: 2, 
            name: 'Garlic Naan', 
            status: 'new',
            notes: '',
            isAddedLate: false
          },
          { 
            id: 3, 
            name: 'Raita', 
            status: 'new',
            notes: '',
            isAddedLate: false
          }
        ],
        status: 'new',
        customer: 'John Doe',
        phone: '0894632626'
      },
      {
        id: 'KDS002',
        tableNumber: 12,
        orderType: 'Dine-In',
        elapsedTime: 1140, // seconds
        placedAt: new Date(Date.now() - 1140000),
        items: [
          { 
            id: 1, 
            name: 'Mutton Curry', 
            status: 'preparing',
            notes: '',
            isAddedLate: false
          },
          { 
            id: 2, 
            name: 'Steamed Rice', 
            status: 'preparing',
            notes: '',
            isAddedLate: false
          },
          { 
            id: 3, 
            name: 'Papad', 
            status: 'preparing',
            notes: '',
            isAddedLate: false
          }
        ],
        status: 'preparing',
        customer: 'Jessica Irving',
        phone: '0962626267'
      },
      {
        id: 'KDS004',
        tableNumber: 8,
        orderType: 'Dine-In',
        elapsedTime: 1440, // seconds
        placedAt: new Date(Date.now() - 1440000),
        items: [
          { 
            id: 1, 
            name: 'Fish Curry', 
            status: 'ready',
            notes: '',
            isAddedLate: false
          },
          { 
            id: 2, 
            name: 'Rice', 
            status: 'ready',
            notes: '',
            isAddedLate: false
          },
          { 
            id: 3, 
            name: 'Pickle', 
            status: 'ready',
            notes: '',
            isAddedLate: false
          }
        ],
        status: 'ready',
        customer: 'Sarah Johnson',
        phone: '0851234567'
      },
      {
        id: 'KDS005',
        tableNumber: 3,
        orderType: 'Dine-In',
        elapsedTime: 360, // seconds
        placedAt: new Date(Date.now() - 360000),
        items: [
          { 
            id: 1, 
            name: 'Chicken Tikka', 
            status: 'new',
            notes: '',
            isAddedLate: false
          },
          { 
            id: 2, 
            name: 'Mixed Vegetables', 
            status: 'new',
            notes: '',
            isAddedLate: true
          }
        ],
        status: 'new',
        customer: 'Anna Davis',
        phone: '082367237'
      },
      {
        id: 'KDS003',
        tableNumber: 15,
        orderType: 'Takeaway',
        elapsedTime: 840, // seconds
        placedAt: new Date(Date.now() - 840000),
        items: [
          { 
            id: 1, 
            name: 'Paneer Tikka', 
            status: 'preparing',
            notes: 'Extra mint chutney',
            isAddedLate: false
          },
          { 
            id: 2, 
            name: 'Butter Naan', 
            status: 'preparing',
            notes: '',
            isAddedLate: false
          }
        ],
        status: 'preparing',
        customer: 'Michael Brown',
        phone: '23236368238'
      },
      {
        id: 'KDS006',
        tableNumber: 7,
        orderType: 'Dine-In',
        elapsedTime: 720, // seconds
        placedAt: new Date(Date.now() - 720000),
        items: [
          { 
            id: 1, 
            name: 'Lamb Korma', 
            status: 'ready',
            notes: 'Mild spice',
            isAddedLate: false
          },
          { 
            id: 2, 
            name: 'Basmati Rice', 
            status: 'ready',
            notes: '',
            isAddedLate: false
          }
        ],
        status: 'ready',
        customer: 'David Wilson',
        phone: '0851237890'
      }
    ];
    setOrders(mockOrders);

    const mockNotifications = [
      {
        id: 1,
        type: 'order_placed',
        message: 'New order #KDS001 received for Table 5',
        time: new Date(Date.now() - 540000),
        read: false
      },
      {
        id: 2,
        type: 'order_ready',
        message: 'Order #KDS004 is ready for service',
        time: new Date(Date.now() - 300000),
        read: false
      },
      {
        id: 3,
        type: 'order_updated',
        message: 'Order #KDS005 updated with additional items',
        time: new Date(Date.now() - 120000),
        read: true
      },
      {
        id: 4,
        type: 'order_delayed',
        message: 'Order #KDS002 is taking longer than expected',
        time: new Date(Date.now() - 60000),
        read: false
      }
    ];
    setNotifications(mockNotifications);
    
    // Update notification count in layout context
    if (setKdsNotificationCount) {
      setKdsNotificationCount(mockNotifications.filter(n => !n.read).length);
    }
  }, [setKdsNotificationCount]);

  // Update notification count when notifications change
  useEffect(() => {
    if (setKdsNotificationCount) {
      setKdsNotificationCount(notifications.filter(n => !n.read).length);
    }
  }, [notifications, setKdsNotificationCount]);

  // Update elapsed time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          elapsedTime: Math.floor((Date.now() - order.placedAt.getTime()) / 1000)
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatElapsedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status);
  };

  const updateItemStatus = (orderId, itemId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
          );
          
          // Check if all items are ready
          const allItemsReady = updatedItems.every(item => item.status === 'ready');
          const orderStatus = allItemsReady ? 'ready' : 
                             updatedItems.some(item => item.status === 'preparing') ? 'preparing' : 'new';
          
          return { ...order, items: updatedItems, status: orderStatus };
        }
        return order;
      })
    );
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const completeOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setRecalledOrders(prev => [...prev, { ...order, completedAt: new Date() }]);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      
      // Add notification
      const newNotification = {
        id: Date.now(),
        type: 'order_completed',
        message: `Order #${orderId} completed and ready for service`,
        time: new Date(),
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
    }
  };

  const cookAllItems = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => ({ ...item, status: 'preparing' }));
          return { ...order, items: updatedItems, status: 'preparing' };
        }
        return order;
      })
    );
  };

  const markAllReady = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => ({ ...item, status: 'ready' }));
          return { ...order, items: updatedItems, status: 'ready' };
        }
        return order;
      })
    );
  };

  const getAllDayData = () => {
    const itemCounts = {};
    [...orders, ...recalledOrders].forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });
    });
    return itemCounts;
  };

  const newOrders = getOrdersByStatus('new');
  const preparingOrders = getOrdersByStatus('preparing');
  const readyOrders = getOrdersByStatus('ready');

  // Get current tab orders
  const getCurrentTabOrders = () => {
    switch (activeTab) {
      case 'new':
        return newOrders;
      case 'preparing':
        return preparingOrders;
      case 'ready':
        return readyOrders;
      default:
        return [];
    }
  };

  // Tab configuration
  const tabs = [
      {
      id: 'preparing',
      label: 'In Preparation',
      count: preparingOrders.length,
      icon: <Timer size={16} />,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      activeColor: 'bg-orange-500 text-white',
      borderColor: 'border-orange-500'
    },
    {
      id: 'new',
      label: 'New Orders',
      count: newOrders.length,
      icon: <ChefHat size={16} />,
      color: 'bg-primaryExtraLight border-primaryLight text-primary',
      activeColor: 'bg-primaryLight text-white',
      borderColor: 'border-primary'
    },
   
    {
      id: 'ready',
      label: 'Ready for Service',
      count: readyOrders.length,
      icon: <CheckCircle size={16} />,
      color: 'bg-green-50 border-green-200 text-green-800',
      activeColor: 'bg-green-500 text-white',
      borderColor: 'border-green-500'
    }
  ];

  const currentTabConfig = tabs.find(tab => tab.id === activeTab);

  return (
    
  <div>
  
      <div className="px-4 py-2">
    
    

      {/* Notifications Panel */}
      {kdsShowNotifications && setKdsShowNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setKdsShowNotifications(false)}
          onMarkAsRead={(id) => {
            setNotifications(prev => 
              prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
          }}
        />
      )}

      {/* All Day View */}
      {kdsCurrentView === 'allday' && (
        <AllDayView data={getAllDayData()} />
      )}

      {/* Cards View with Tabs */}
      {kdsCurrentView === 'cards' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? `${tab.borderColor} text-${tab.id === 'new' ? 'primary' : tab.id === 'preparing' ? 'orange-600' : 'green-600'}`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className={`ml-2 py-1 px-2 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? tab.activeColor : tab.color
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {getCurrentTabOrders().map(order => (
                <KDSCard
                  key={order.id}
                  order={order}
                  onUpdateItemStatus={updateItemStatus}
                  onUpdateOrderStatus={updateOrderStatus}
                  onCompleteOrder={completeOrder}
                  onCookAll={cookAllItems}
                  onMarkAllReady={markAllReady}
                  formatElapsedTime={formatElapsedTime}
                />
              ))}
              
              {getCurrentTabOrders().length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center">
                    {currentTabConfig?.icon && (
                      <div className="mb-4 opacity-50">
                        {React.cloneElement(currentTabConfig.icon, { size: 48 })}
                      </div>
                    )}
                    <p className="text-lg font-medium">No {currentTabConfig?.label.toLowerCase()}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {activeTab === 'new' && 'New orders will appear here'}
                      {activeTab === 'preparing' && 'Orders being prepared will appear here'}
                      {activeTab === 'ready' && 'Orders ready for service will appear here'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recall Section */}
      {kdsShowRecall && setKdsShowRecall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recalled Orders (Last 10 minutes)</h3>
              <button
                onClick={() => setKdsShowRecall(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {recalledOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">#{order.id}</span>
                        <span className="text-gray-600">Table {order.tableNumber}</span>
                        <span className="text-sm text-gray-500">{order.customer}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.items.map((item, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {item.name}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 block mt-2">
                        Completed: {order.completedAt?.toLocaleTimeString()}
                      </span>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium">
                      COMPLETED
                    </span>
                  </div>
                </div>
              ))}
              {recalledOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <RotateCcw size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No recalled orders</p>
                  <p className="text-sm text-gray-400 mt-1">Completed orders from the last 10 minutes will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

// Notification Panel Component
const NotificationPanel = ({ notifications, onClose, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_placed':
        return <Plus className="w-4 h-4 text-blue-500" />;
      case 'order_ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'order_updated':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'order_delayed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'order_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-colors ${
                notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {notification.time.toLocaleTimeString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Bell size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-gray-400 mt-1">New notifications will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// All Day View Component
const AllDayView = ({ data }) => {
  const totalItems = Object.values(data).reduce((sum, count) => sum + count, 0);
  const sortedItems = Object.entries(data).sort(([,a], [,b]) => b - a);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          All Day Summary
        </h3>
        <div className="text-sm text-gray-600">
          Total items: <span className="font-semibold text-primary">{totalItems}</span>
        </div>
      </div>
      
      {sortedItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.map(([itemName, count]) => (
            <div key={itemName} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-700 truncate block">{itemName}</span>
                  <span className="text-xs text-gray-500">Total orders</span>
                </div>
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold ml-2">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Utensils size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No items to display</p>
          <p className="text-sm text-gray-400 mt-1">Item summary will appear here as orders are placed</p>
        </div>
      )}
    </div>
  );
};

export default KitchenDisplaySystem;