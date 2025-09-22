import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Users,
  X,
  List,
  Grid
} from 'lucide-react';
import VoucherManagement from '../../components/dashboard/coupons/VoucherManagement';
import CouponManagement from '../../components/dashboard/coupons/CouponManagement';

const Coupons = () => {
  const [activeTab, setActiveTab] = useState('coupon'); // Default to coupon management

  return (
    <div className="px-4 py-2">
      {/* Buttons */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('voucher')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'voucher' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List size={16} />
            Voucher Management
          </button>
          <button
            onClick={() => setActiveTab('coupon')}
            className={`px-3 py-2 rounded-md cursor-pointer text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'coupon' 
                ? 'bg-primaryLight text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid size={16} />
            Coupon Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'voucher' && <VoucherManagement />}
        {activeTab === 'coupon' && <CouponManagement />}
      </div>
    </div>
  );
};

export default Coupons;
