import React, { useMemo, useState, useEffect } from 'react'
import { CalendarDays, Filter, Edit, Check, X, Trash2, Plus } from 'lucide-react'
import NewReservation from '../../components/dashboard/reservation/NewReservation'
import useCustomAlert from '../../hooks/useCustomAlert'
import CustomAlert from '../../components/CustomAlert'

const Reservations = () => {
    const [activeTab, setActiveTab] = useState('all')
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showNewReservationModal, setShowNewReservationModal] = useState(false)
    const [reservationToDelete, setReservationToDelete] = useState(null)
    const [reservationToEdit, setReservationToEdit] = useState(null)
    const { alertState, showError, showSuccess, hideAlert } = useCustomAlert()

    const filtered = useMemo(() => {
        if (activeTab === 'all') return reservations
        return reservations.filter(r => r.status === activeTab)
    }, [activeTab])

    const handleRequestDelete = (res) => {
        setReservationToDelete(res)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = () => {
        if (reservationToDelete) {
            setReservations(prev => prev.filter(r => r.id !== reservationToDelete.id))
        }
        setShowDeleteModal(false)
        setReservationToDelete(null)
    }

    const handleCancelDelete = () => {
        setShowDeleteModal(false)
        setReservationToDelete(null)
    }

    const statusBadge = (status) => {
        if (status === 'confirmed') return (
            <span className="px-2 py-2 text-xs rounded bg-green-100 text-green-700">CONFIRMED</span>
        )
        if (status === 'pending') return (
            <span className="px-2 py-2 text-xs rounded bg-yellow-100 text-yellow-700">PENDING</span>
        )
        return (
            <span className="px-2 py-2 text-xs rounded bg-gray-100 text-gray-700">CANCELLED</span>
        )
    }

  return (
        <>
            {/* Toolbar moved to ReservationsHeader shown by DashboardLayout on this route */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={18} className="text-primary" />
                        <h2 className="text-lg font-semibold text-gray-800">Reservations</h2>
                    </div>
                    {/* Tabs */}
                <div className="flex items-center gap-2 mb-3">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'confirmed', label: 'Confirmed' },
                        { id: 'pending', label: 'Pending' },
                        { id: 'cancelled', label: 'Cancelled' },
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-4 py-2 rounded text-sm transition-colors duration-150 ${
                                activeTab === t.id
                                  ? 'bg-primary text-white'
                                  : 'bg-white text-gray-700 border border-gray-300 shadow-sm'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                </div>

                

                <div className="space-y-3">
                    {filtered.map(res => (
                        <div key={res.id} className={`reservation-item ${res.status}`}>
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="text-sm font-semibold text-gray-800">{res.name}</div>
                                    <div className="text-lg font-bold text-gray-800 mt-1">Table {res.table}</div>
                                </div>
                            </div>
                            <div className="text-sm text-gray-700">
                                {res.from} - {res.to}
                                <div className="text-gray-500">{res.dateLabel}</div>
                            </div>
                            <div className="text-sm text-gray-700">{res.people} people</div>
                            <div>{statusBadge(res.status)}</div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-1 rounded cursor-pointer bg-[#007bff] text-white text-sm">Edit</button>
                                {res.status === 'pending' ? (
                                    <button className="px-3 py-1 rounded cursor-pointer bg-[#28a745] text-white text-sm">Confirm</button>
                                ) : (
                                    <button className="px-3 py-1 rounded cursor-pointer bg-[#dc3545] text-white text-sm">Cancel</button>
                                )}
                                <button onClick={() => handleRequestDelete(res)} className="px-3 py-1 rounded cursor-pointer bg-[#6c757d] text-white text-sm">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={handleCancelDelete}></div>
                    <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-primary">
                            <h3 className="text-white font-semibold">Delete Reservation</h3>
                            <button onClick={handleCancelDelete} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/15">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-700">
                                Are you sure you want to delete {reservationToDelete?.name}'s reservation for table {reservationToDelete?.table}?
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t">
                            <button onClick={handleCancelDelete} className="px-4 py-2 rounded bg-gray-500 text-white">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
  )
}

export default Reservations