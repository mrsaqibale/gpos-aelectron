import React, { createContext, useContext, useState } from 'react'

const RiderContext = createContext()

export const useRiders = () => {
  const context = useContext(RiderContext)
  if (!context) {
    throw new Error('useRiders must be used within a RiderProvider')
  }
  return context
}

export const RiderProvider = ({ children }) => {
  const [riders, setRiders] = useState([
    {
      id: 1,
      name: 'John Smith',
      status: 'Available',
      vehicle: 'Car - ABC123',
      vehicleType: 'car',
      mobile: '+353 87 123 4567',
      address: '123 Main St, Dublin',
      fullName: 'John Smith'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      status: 'Available',
      vehicle: 'Motorcycle - XYZ789',
      vehicleType: 'motorcycle',
      mobile: '+353 87 234 5678',
      address: '456 Oak Ave, Cork',
      fullName: 'Mike Johnson'
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      status: 'On Delivery',
      vehicle: 'Car - DEF456',
      vehicleType: 'car',
      mobile: '+353 87 345 6789',
      address: '789 Pine Rd, Galway',
      fullName: 'Sarah Wilson'
    },
    {
      id: 4,
      name: 'David Brown',
      status: 'Available',
      vehicle: 'Motorcycle - GHI789',
      vehicleType: 'motorcycle',
      mobile: '+353 87 456 7890',
      address: '321 Elm St, Limerick',
      fullName: 'David Brown'
    },
    {
      id: 5,
      name: 'Lisa Davis',
      status: 'Available',
      vehicle: 'Car - JKL012',
      vehicleType: 'car',
      mobile: '+353 87 567 8901',
      address: '654 Maple Dr, Waterford',
      fullName: 'Lisa Davis'
    }
  ])

  const [selectedRider, setSelectedRider] = useState(null)

  const addRider = (riderData) => {
    const newRider = {
      id: Date.now(), // Simple ID generation
      name: riderData.fullName,
      fullName: riderData.fullName,
      status: riderData.status === 'active' ? 'Available' : 'Inactive',
      vehicle: riderData.vehicleType === 'car' 
        ? `Car - ${riderData.regNo || 'N/A'}`
        : riderData.vehicleType === 'bike'
        ? `Bike - ${riderData.regNo || 'N/A'}`
        : `E-bike - ${riderData.regNo || 'N/A'}`,
      vehicleType: riderData.vehicleType,
      mobile: riderData.mobile,
      address: riderData.address,
      // Store additional data for future use
      licenceExpiry: riderData.licenceExpiry,
      insuranceExpiry: riderData.insuranceExpiry,
      blockOnExpiry: riderData.blockOnExpiry,
      payPreset: riderData.payPreset,
      perDrop: riderData.perDrop,
      perKm: riderData.perKm,
      basePerShift: riderData.basePerShift,
      hourlyRate: riderData.hourlyRate,
      deliveryFeeKeptBy: riderData.deliveryFeeKeptBy,
      riderShare: riderData.riderShare,
      cashTipsKeptByRider: riderData.cashTipsKeptByRider,
      cardTipsPayout: riderData.cardTipsPayout,
      payoutMethod: riderData.payoutMethod,
      ibanBic: riderData.ibanBic
    }
    
    setRiders(prevRiders => [...prevRiders, newRider])
    return newRider
  }

  const updateRiderStatus = (riderId, newStatus) => {
    setRiders(prevRiders =>
      prevRiders.map(rider =>
        rider.id === riderId ? { ...rider, status: newStatus } : rider
      )
    )
  }

  const getAvailableRiders = () => {
    return riders.filter(rider => rider.status === 'Available')
  }

  const value = {
    riders,
    selectedRider,
    setSelectedRider,
    addRider,
    updateRiderStatus,
    getAvailableRiders
  }

  return (
    <RiderContext.Provider value={value}>
      {children}
    </RiderContext.Provider>
  )
}

export default RiderContext
