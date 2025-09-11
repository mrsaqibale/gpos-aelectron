import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewReservation from './reservation/NewReservation';

const ReservationsHeader = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <div className="flex gap-2 items-center p-2">
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium">All Reservations</button>
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium flex items-center gap-1" onClick={() => setShowModal(true)}>
           New Reservation
        </button>
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium">Today’s Reservations</button>
        <button className="py-3 px-4 rounded bg-primary text-white text-sm font-medium" onClick={() => navigate('/dashboard/sales')}>Sales Screen</button>
      </div>
      <NewReservation isOpen={showModal} onClose={() => setShowModal(false)} onCreate={() => setShowModal(false)} />
    </div>
  );
};

export default ReservationsHeader;


