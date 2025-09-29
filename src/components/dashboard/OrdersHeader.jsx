import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useDraftCount } from '../../contexts/DraftContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationsModal from './NotificationsModal';

import {
  Home,
  ShoppingCart,
  FileText,
  CreditCard,
  AlertCircle,
  RotateCcw,
  Database,
  Clock,
  Users2,
  Bell,
  Printer,
  Tv,
  Computer,
  ScreenShare,
  Monitor,
  RotateCwSquare,
  ListOrderedIcon,
  ListOrdered,
  LogOut,
  Menu,
  Save as SaveIcon,
  TrendingUp
} from 'lucide-react';

const OrdersHeader = ({ onMenuClick, onDraftsClick, showMenuButton = true }) => {
  const location = useLocation();
  const isOrdersRoute = location.pathname === '/dashboard/sales';
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { draftCount } = useDraftCount();
  const { getUnreadCount } = useNotifications();
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  const unreadNotificationCount = getUnreadCount();

  if (!isOrdersRoute) return null;

  const headerItems = [
    // {
    //   icon: <Home size={16} />,
    //   style: { backgroundColor: themeColors.primary },
    //   textColor: 'text-white'
    // },

    // {
    //   // icon: <ShoppingCart size={16} />,
    //   style: { backgroundColor: themeColors.primary },
    //   textColor: 'text-white',
    //   label: 'Register'
    // },
    {
      // icon: <FileText size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Manage Orders',
      path: '/dashboard/manage-orders'
    },

    {
      // icon: <CreditCard size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Online Orders'
    },
    {
      // icon: <Bell size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: `Drafts${draftCount > 0 ? ` (${draftCount})` : ''}`,
      onClick: onDraftsClick
    },
    {
      //  icon: <Monitor size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: `Notifications${unreadNotificationCount > 0 ? ` (${unreadNotificationCount})` : ''}`,
      onClick: () => setShowNotificationsModal(true)
    },
    {
      // icon: <Clock size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Reservations',
      path: '/dashboard/reservations'
    },
    // {
    //   //  icon: <Printer size={16} />,
    //   style: { backgroundColor: themeColors.primary },
    //   textColor: 'text-white',
    //   label: 'Order Screen'
    // },

    {
      //  icon: <ListOrdered size={16} />,
      label: 'Customer Display',
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      path: '/dashboard/customer-management'
    },
    // {
    //   //  icon: <ListOrdered size={16} />,
    //   label: 'Recent Sales',
    //   style: { backgroundColor: themeColors.primary },
    //   textColor: 'text-white',
    // },
  ];

  const statusItems = [
    {
      label: 'Online orders',
      count: '0',
      bgColor: 'bg-purple-600',
      textColor: 'text-white',
      textMargin: 'ml-2',
    },
    {
      label: 'Running orders',
      count: '0',
      bgColor: 'bg-red-600',
      textColor: 'text-white',
      textMargin: 'ml-2',
    }
  ];

  return (
    <>
      <div className="bg-white border-b border-gray-300 p-2">
        <div className="flex items-center justify-between">
          {/* Left side - Navigation icons */}
          <div className="flex items-center justify-center space-x-2 ">
            {headerItems.map((item, index) => (
              <div
                key={index}
                onClick={() => {
                  if (item.onClick) { item.onClick(); return; }
                  if (item.path) { navigate(item.path); return; }
                  if (index === 0) navigate('/dashboard'); // fallback: home
                }}
                className={`${item.textColor} ${item.textMargin} btn-lifted rounded-md px-1 py-3 font-semibold flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                style={item.style || (item.bgColor ? { backgroundColor: item.bgColor } : {})}
              >
                {item.icon}
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('headerSaveClicked'));
              }}
              title="Save"
              className="flex justify-center items-center gap-2 py-3 w-[100px] rounded-md text-white text-sm font-semibold btn-lifted bg-[#16A34A] flex items-center gap-2"
            >
              <SaveIcon size={14} />
              Save
            </button>
            <button
              onClick={() => {
                // Ask RunningOrders to open the Status modal
                window.dispatchEvent(new CustomEvent('openStatusModal'));
              }}
              title="Update order status"
              className="flex justify-center items-center gap-2 py-3 w-[100px] rounded-md text-white text-sm font-semibold btn-lifted bg-[#1976D2] flex items-center gap-2"
            >
              <TrendingUp size={14} />
              Status
            </button>
          </div>
        </div>
      </div>
      
      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={showNotificationsModal} 
        onClose={() => setShowNotificationsModal(false)} 
      />
    </>
  );
};

export default OrdersHeader;