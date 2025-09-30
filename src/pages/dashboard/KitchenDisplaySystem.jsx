import {
  BadgePlus,
  Utensils,
  CookingPot,
  CheckCircle,
  History,
  RefreshCcw,
  Rows3,
  AlertOctagon,
  CircleCheck,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import KDSCard from "../../components/dashboard/kds/KDSCard"
import ToggleAllDayViewModal from "../../components/dashboard/kds/ToggleAllDayViewModal";
import NotificationsModal from "../../components/dashboard/NotificationsModal";

const KitchenDisplaySystem = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showRecallModal, setShowRecallModal] = useState(false);
  const [showAllDayModal, setShowAllDayModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const [orders, setOrders] = useState([]);
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'preparing', 'ready'


  // load mock orders
  useEffect(() => {
    const mockOrders = [
      {
        id: "KDS001",
        tableNumber: 5,
        orderType: "Dine-In",
        elapsedTime: 540,
        placedAt: new Date(Date.now() - 540000),
        items: [
          { id: 1, name: "Chicken Biryani", status: "new" },
          { id: 2, name: "Garlic Naan", status: "new" },
          { id: 3, name: "Raita", status: "new" },
        ],
        status: "new",
        customer: "John Doe",
      },
      {
        id: "KDS011",
        tableNumber: 6,
        orderType: "Dine-In",
        elapsedTime: 540,
        placedAt: new Date(Date.now() - 540000),
        items: [
          { id: 1, name: "Chicken Biryani", status: "new" },
          { id: 2, name: "Garlic Naan", status: "new" },
        ],
        status: "new",
        customer: "John Doe",
      },
      {
        id: "KDS002",
        tableNumber: 12,
        orderType: "Dine-In",
        elapsedTime: 1140,
        placedAt: new Date(Date.now() - 1140000),
        items: [
          { id: 1, name: "Mutton Curry", status: "preparing" },
          { id: 2, name: "Steamed Rice", status: "preparing" },
          { id: 3, name: "Papad", status: "preparing" },
        ],
        status: "preparing",
        customer: "Jessica Irving",
      },
      {
        id: "KDS004",
        tableNumber: 8,
        orderType: "Dine-In",
        elapsedTime: 1440,
        placedAt: new Date(Date.now() - 1440000),
        items: [
          { id: 1, name: "Fish Curry", status: "ready" },
          { id: 2, name: "Rice", status: "ready" },
          { id: 3, name: "Pickle", status: "ready" },
        ],
        status: "ready",
        customer: "Sarah Johnson",
      },
    ];
    setOrders(mockOrders);
  }, []);

  // dynamically count orders by status
  const counts = {
    new: orders.filter((o) => o.status === "new").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
  };

  const tabs = [
    // { key: "all", label: "All Orders", icon: Utensils, style: { backgroundColor: themeColors.primary } },
    { key: "new", label: "New", icon: BadgePlus, style: { backgroundColor: themeColors.primary }, activeStyle: { backgroundColor: "#fff", color: "#000" } },
    { key: "preparing", label: "In-Preparation", icon: CookingPot, style: { backgroundColor: themeColors.primary }, activeStyle: { backgroundColor: "#fff", color: "#000" } },
  { key: "ready", label: "Ready", icon: CheckCircle, style: { backgroundColor: themeColors.primary }, activeStyle: { backgroundColor: "#fff", color: "#000"} },
  ];
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
const refreshOrders = () => {
  // Simulate refreshing orders

  if (notificationsEnabled) {
    showNotification('Orders refreshed', 'success');
  }
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

return (
  <div className="h-screen flex flex-col bg-gray-100">
    {/* Navbar */}
    <div className="flex justify-between items-center bg-white shadow px-4 py-2">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.key; // 👈 compares with current tab
          const totalCount = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`text-white items-center btn-lifted rounded-md px-2 py-3 gap-2 font-semibold flex tabs-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
              style={isActive ? tab.activeStyle : tab.style}
            >
              <Icon size={16} />
              {tab.label} 
              <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {counts.new}
            </span>
            </button>
          );
        })}

      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* <button
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setShowRecallModal(true)}
        >
          <History size={16} />
          Recall
        </button> */}
        <button
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => refreshOrders()}
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
        <button
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setShowAllDayModal(true)}
        >
          <Rows3 size={16} />
          Item Wise View
        </button>
        <button
          className="flex items-center gap-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => setShowNotificationsModal(true)}
        >
          <AlertOctagon size={16} />
          Notification
        </button>
        <button
          className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => console.log("Logout")}
        >
          Logout
        </button>
      </div>
    </div>

    {/* Main Content */}
    <div className="flex-1 overflow-y-auto p-4">
      {/* New Orders */}
      {(activeFilter === "new") && (
        <div className="grid grid-cols-3 gap-2 bg-white shadow rounded-lg p-4">
          
          {counts.new === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-6">
              <p>No new orders</p>
            </div>
          ) : (
            orders
              .filter((order) => order.status === "new")
              .map((order) => (
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
              ))
          )}
        </div>
      )}

      {/* Preparing */}
      {(activeFilter === "preparing") && (
        <div className="grid grid-cols-3 bg-white shadow rounded-lg p-4">
          {counts.preparing === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-6">
              <p>No orders in preparation</p>
            </div>
          ) : (
            orders
              .filter((o) => o.status === "preparing")
              .map((order) => (
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
              ))
          )}
        </div>
      )}

      {/* Ready */}
      {(activeFilter === "ready") && (
        <div className="grid grid-cols-3 bg-white shadow rounded-lg p-4">
          {counts.ready === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-500 py-6">
              <p>No orders ready</p>
            </div>
          ) : (
            orders
              .filter((o) => o.status === "ready")
              .map((order) => (
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
              ))
          )}
        </div>
      )}
    </div>
    <ToggleAllDayViewModal
      isOpen={showAllDayModal}
      onClose={() => setShowAllDayModal(false)}
      orders={orders}
    />
    <NotificationsModal
      isOpen={showNotificationsModal}
      onClose={() => setShowNotificationsModal(false)}
    />
  </div>
);
};

export default KitchenDisplaySystem;
