import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Key,
  LogOut,
  Shield,
  UserCog,
  ClipboardList,
  Users,
  Table,
  Box,
  Utensils,
  List,
  Truck,
} from "lucide-react";

const adminItems = [
  {
    icon: <Utensils size={18} className="text-primary" />,
    label: "Menu",
    path: "/dashboard/food-management"
  },
  {
    icon: <Table size={18} className="text-primary" />,
    label: "Table Management",
    path: "/dashboard/table-management"
  },
  {
    icon: <Users size={18} className="text-primary" />,
    label: "Employee",
    path: "/dashboard/employee-management"
  },
  {
    icon: <Box size={18} className="text-primary" />,
    label: "Stock Management",
    path: "/dashboard/stock-management"
  },
  {
    icon: <Truck size={18} className="text-primary" />,
    label: "Suppliers",
    path: "/dashboard/stock-management?tab=suppliers"
  },
];

const settingsItems = [
  {
    icon: <Settings size={18} className="text-sky-500" />,
    label: "Application Settings",
    path: "/dashboard/application-settings"
  },
  {
    icon: <Shield size={18} className="text-amber-600" />,
    label: "Security Settings",
    path: "/dashboard/security-settings"
  },
  {
    icon: <Key size={18} className="text-yellow-500" />,
    label: "Change Password",
    path: "/dashboard/change-password"
  },
];

export default function AdminPanel() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="mt-10 flex flex-col items-center justify-center">
      <div className="mb-2 text-center">
        <h2 className="text-3xl font-semibold text-primary mb-1">Menu Panel</h2>
        <p className="text-gray-500 text-sm">Navigation and system access</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Administration Card */}
        <div className="w-[300px] relative overflow-hidden"
             style={{
               background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
               borderRadius: '24px',
               padding: '32px',
               boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
               border: '1px solid rgba(255, 255, 255, 0.3)',
               transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
               position: 'relative',
               overflow: 'hidden'
             }}>
          {/* Gradient top border */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg " 
               style={{
                 background: 'linear-gradient(to right, var(--color-primary), var(--color-primaryLight))'
               }}>
          </div>
          <div className="flex items-center mb-3">
            <ClipboardList size={22} className="text-primary mr-2" />
            <span className="font-bold text-primary text-lg">Administration</span>
          </div>
          <div className="flex flex-col gap-2">
            {adminItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.path)}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#f6fafd] hover:bg-cyan-50 transition border border-transparent focus:outline-none cursor-pointer"
                style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.01)" }}
              >
                {item.icon}
                <span className="text-gray-700 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
                  {/* Settings & Security Card */}
          <div className="w-[300px] relative overflow-hidden"
               style={{
                 background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                 borderRadius: '24px',
                 padding: '32px',
                 boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 8px 16px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                 border: '1px solid rgba(255, 255, 255, 0.3)',
                 transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg" 
                 style={{
                   background: 'linear-gradient(to right, var(--color-primary), var(--color-primaryLight))'
                 }}>
            </div>
          <div className="flex items-center mb-3">
            <UserCog size={22} className="text-primary mr-2" />
            <span className="font-bold text-primary text-lg">Settings & Security</span>
          </div>
          <div className="flex flex-col gap-2">
            {settingsItems.map((item) => (
              <button
                key={item.label}
                onClick={() => item.path && handleNavigation(item.path)}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#f6fafd] hover:bg-cyan-50 transition border border-transparent focus:outline-none cursor-pointer"
                style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.01)" }}
              >
                {item.icon}
                <span className="text-gray-700 font-medium">{item.label}</span>
              </button>
            ))}
            <button
              className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition border border-red-200 focus:outline-none mt-1"
              style={{ boxShadow: "0 1px 2px 0 rgba(0,0,0,0.01)" }}
            >
              <LogOut size={18} className="text-red-500" />
              <span className="text-red-600 font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
