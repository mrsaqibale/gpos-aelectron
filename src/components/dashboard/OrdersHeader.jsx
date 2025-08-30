import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

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
  Menu
} from 'lucide-react';

const OrdersHeader = ({ onMenuClick, onDraftsClick }) => {
  const location = useLocation();
  const isOrdersRoute = location.pathname === '/dashboard/sales';
  const navigate = useNavigate();
  const { themeColors } = useTheme();

  if (!isOrdersRoute) return null;

  const headerItems = [
    // {
    //   icon: <Home size={16} />,
    //   style: { backgroundColor: themeColors.primary },
    //   textColor: 'text-white'
    // },

    {
      // icon: <ShoppingCart size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Register'
    },
    {
      // icon: <FileText size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Manage Orders'
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
      label: 'Drafts'
    },
    {
      //  icon: <Monitor size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Notifications'
    },
    {
      // icon: <Clock size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Reservations'
    },
    {
      //  icon: <Printer size={16} />,
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
      label: 'Order Screen'
    },

    {
      //  icon: <ListOrdered size={16} />,
      label: 'Customer Display',
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
    },
    {
      //  icon: <ListOrdered size={16} />,
      label: 'Recent Sales',
      style: { backgroundColor: themeColors.primary },
      textColor: 'text-white',
    },
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
    <div className="bg-white border-b border-gray-300 p-2">
      <div className="flex items-center justify-between">
        {/* Left side - Navigation icons */}
        <div className="flex items-center justify-center space-x-2 ">
          {headerItems.map((item, index) => (
            <div
              key={index}
              onClick={() => {
                if (index === 0) navigate('/dashboard'); // Go back when Home icon is clicked
                if (index === 3 && onDraftsClick) onDraftsClick(); // Handle Drafts button click
                if (item.onClick) item.onClick(); // Handle custom onClick functions
              }}
              className={`${item.textColor} ${item.textMargin} btn-lifted rounded-md px-4 py-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
              style={item.style || (item.bgColor ? { backgroundColor: item.bgColor } : {})}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center  mr-5">
          <button
            onClick={onMenuClick}
            className="flex cursor-pointer flex-col justify-center items-center p-2 rounded-md text-primary text-xs font-semibold"
            style={{ color: themeColors?.primary }}
          >
            <Menu size={18} />
            Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;