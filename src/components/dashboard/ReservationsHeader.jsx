import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewReservation from './reservation/NewReservation';

const ReservationsHeader = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <NewReservation isOpen={showModal} onClose={() => setShowModal(false)} onCreate={() => setShowModal(false)} />
    </div>
  );
};

export default ReservationsHeader;


