import React from 'react';
import { useLocation , useNavigate} from 'react-router-dom';

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

const OrdersHeader = ({ onMenuClick }) => {
  const location = useLocation();
  const isOrdersRoute = location.pathname === '/dashboard/sales';
const navigate = useNavigate();

  if (!isOrdersRoute) return null;

  const headerItems = [
    {
      icon: <Home size={16} />,
    
      bgColor: 'bg-primary',
      textColor: 'text-white'
    },
    {
      icon: <Menu size={16} />,
      bgColor: 'bg-primary',
      textColor: 'text-white',
      onClick: onMenuClick
    },
    {
      icon: <ShoppingCart size={16} />,
      bgColor: 'bg-primary',
      textColor: 'text-white'
    },
    {
      icon: <FileText size={16} />,
       bgColor: 'bg-primary',
      textColor: 'text-white'
    },
   
    {
      icon: <CreditCard size={16} />,
      bgColor: 'bg-primary',
      textColor: 'text-white'
    },
     {
      icon: <Bell size={16} />,
       bgColor: 'bg-primary',
      textColor: 'text-white'
    },
   
   
     {
      icon: <div className=" rounded-full border-1 border-white w-4 h-4  flex items-center justify-center">
    <span className="text-white font-bold text-xs">R</span>
  </div>,
      bgColor: 'bg-primary',
      textColor: 'text-white'
    },
    {
      icon: <Monitor size={16} />,
      bgColor: 'bg-primary',
      textColor: 'text-white'
    },
     {
      icon: <Clock size={16} />,
       bgColor: 'bg-primary',
      textColor: 'text-white'
    },
    {
      icon: <Printer size={16} />,
       bgColor: 'bg-primary',
      textColor: 'text-white'
    },
    
    {
      icon: <ListOrdered size={16} />,
      label: 'Online Orders',
      bgColor: 'bg-[#4e35ed]',
      textColor: 'text-white',
        textMargin: 'space-x-2',
    },
    {
      icon: <ListOrderedIcon size={16} />,
      label: 'Running Orders',
      bgColor: 'bg-[#e63c3c]',
      textColor: 'text-white',
        textMargin: 'space-x-2',
    }
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
                if (item.onClick) item.onClick(); // Handle custom onClick functions
              }}
              className={`${item.bgColor} ${item.textColor} ${item.textMargin} btn-lifted rounded-md px-2 py-1.5 flex items-center justify-center  cursor-pointer hover:opacity-80 transition-opacity`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Right side - Status indicators */}
        <div className="flex items-center  mr-5">
         <button className='cursor-pointer'>
          <LogOut size={22}/>
         </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;