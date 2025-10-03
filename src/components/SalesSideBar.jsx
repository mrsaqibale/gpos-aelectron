import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Calendar,
  Users2,
  Tag,
  FileText,
  ChefHat,
  Settings,
  Eye,
  LogOut
} from 'lucide-react';

const SalesSideBar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Sidebar Menu - Slides from Left */}
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-[#00000089] bg-opacity-50 z-[100]"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <div 
            className="fixed top-0 left-0 bottom-0 bg-primary shadow-2xl z-[101] transform transition-all duration-300 ease-in-out w-56"
            style={{
              transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/20 relative">
              <h1 className="font-bold text-white text-lg">
                G<span className="text-[#f3be25]">POS</span>System
              </h1>
            </div>

            {/* Menu Items */}
            <nav className="px-2 py-3 flex flex-col" style={{ height: 'calc(100vh - 60px)' }}>
              <div className="flex-1 overflow-y-auto space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <LayoutDashboard size={18} />
                  <span className="font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/sales');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <ShoppingCart size={18} />
                  <span className="font-medium">Sales</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/manage-orders');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <ClipboardList size={18} />
                  <span className="font-medium">Manage Orders</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/reservations');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <Calendar size={18} />
                  <span className="font-medium">Reservations</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/customer-management');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <Users2 size={18} />
                  <span className="font-medium">Customer Management</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/coupons');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <Tag size={18} />
                  <span className="font-medium">Coupon & Discount</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/reports');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <FileText size={18} />
                  <span className="font-medium">All Reports</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/kds');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <ChefHat size={18} />
                  <span className="font-medium">KDS</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/dashboard/admin-panel');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <Settings size={18} />
                  <span className="font-medium">Admin</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/customer');
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-sm"
                >
                  <Eye size={18} />
                  <span className="font-medium">Customer Display</span>
                </button>
              </div>

              {/* Logout Button at Bottom */}
              <div className="px-2 py-3 flex-shrink-0">
                <button
                  onClick={() => {
                    localStorage.removeItem('currentEmployee');
                    sessionStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left text-md cursor-pointer"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default SalesSideBar;
