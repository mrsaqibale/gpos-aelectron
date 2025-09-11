import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReservationsHeader = () => {
  const navigate = useNavigate();
  return (
    <div >
      <div className="flex gap-2 items-center p-2">
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium">All Reservations</button>
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium flex items-center gap-1">
          <Plus size={14} /> New Reservation
        </button>
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium">Today’s Reservations</button>
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium" onClick={() => navigate('/dashboard/sales')}>Sales Screen</button>
      </div>
    </div>
  );
};

export default ReservationsHeader;


