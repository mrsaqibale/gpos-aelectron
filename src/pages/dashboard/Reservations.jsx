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
    const [viewReservation, setViewReservation] = useState(null)
    const { alertState, showError, showSuccess, hideAlert } = useCustomAlert()

    // Load reservations from database
    const loadReservations = async () => {
        setLoading(true)
        try {
            if (!window.myAPI) return
            
            let result
            if (activeTab === 'today') {
                const today = new Date().toISOString().split('T')[0]
                result = await window.myAPI.getReservationsByDateRange(today, today, 1)
            } else if (activeTab === 'upcoming') {
                const today = new Date().toISOString().split('T')[0]
                const futureDate = new Date()
                futureDate.setFullYear(futureDate.getFullYear() + 1)
                result = await window.myAPI.getReservationsByDateRange(today, futureDate.toISOString().split('T')[0], 1)
            } else if (activeTab === 'all') {
                result = await window.myAPI.getReservationsByHotelId(1, 100, 0)
            } else {
                result = await window.myAPI.getReservationsByStatus(activeTab, 1, 100, 0)
            }
            
            if (result && result.success) {
                setReservations(result.data || [])
            }
        } catch (error) {
            console.error('Error loading reservations:', error)
            showError('Failed to load reservations')
        } finally {
            setLoading(false)
        }
    }

    // Load reservations when component mounts or activeTab changes
    useEffect(() => {
        loadReservations()
    }, [activeTab])

    const filtered = useMemo(() => {
        if (activeTab === 'today') {
            const today = new Date().toISOString().split('T')[0]
            return reservations.filter(r => r.reservation_date === today)
        } else if (activeTab === 'upcoming') {
            const today = new Date().toISOString().split('T')[0]
            return reservations.filter(r => r.reservation_date > today)
        } else if (activeTab === 'all') {
            return reservations
        } else {
            return reservations.filter(r => r.status === activeTab)
        }
    }, [activeTab, reservations])

    const handleRequestDelete = (res) => {
        setReservationToDelete(res)
        setShowDeleteModal(true)
    }

    const handleConfirmDelete = async () => {
        if (reservationToDelete) {
            try {
                const result = await window.myAPI.deleteReservation(reservationToDelete.id)
                if (result && result.success) {
                    showSuccess('Reservation deleted successfully')
                    loadReservations() // Reload reservations
                } else {
                    showError('Failed to delete reservation')
                }
            } catch (error) {
                console.error('Error deleting reservation:', error)
                showError('An error occurred while deleting the reservation')
            }
        }
        setShowDeleteModal(false)
        setReservationToDelete(null)
    }

    const handleCancelDelete = () => {
        setShowDeleteModal(false)
        setReservationToDelete(null)
    }

    // Update reservation status
    const updateReservationStatus = async (id, status) => {
        try {
            const result = await window.myAPI.updateReservation(id, { status })
            if (result && result.success) {
                showSuccess(`Reservation ${status} successfully`)
                loadReservations() // Reload reservations
            } else {
                showError(`Failed to ${status} reservation`)
            }
        } catch (error) {
            console.error(`Error updating reservation status:`, error)
            showError(`An error occurred while ${status} the reservation`)
        }
    }

    // Handle new reservation creation
    const handleNewReservation = () => {
        setShowNewReservationModal(true)
    }

    // Handle reservation created
    const handleReservationCreated = () => {
        loadReservations() // Reload reservations
    }

    // Check if reservation can be edited
    const canEditReservation = (reservation) => {
        return reservation.status !== 'cancelled' && reservation.status !== 'completed'
    }

    const statusBadge = (status) => {
        if (status === 'confirmed') return (
            <span className="px-2 py-2 text-xs rounded bg-green-100 text-green-700">CONFIRMED</span>
        )
        if (status === 'completed') return (
            <span className="px-2 py-2 text-xs rounded bg-blue-100 text-blue-700">COMPLETED</span>
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
                    <button 
                        onClick={handleNewReservation}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={16} />
                        New Reservation
                    </button>
                </div>
                    {/* Tabs */}
                <div className="flex items-center gap-2 mb-3">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'today', label: 'Today' },
                        { id: 'upcoming', label: 'Upcoming' },
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

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading reservations...</div>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        {filtered.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No reservations found</div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filtered.map(res => (
                                        <tr key={res.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 text-sm text-gray-800 font-medium">{res.customer_name}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{new Date(res.reservation_date).toLocaleDateString()}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{res.start_time} - {res.end_time}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">
                                                {res.table_no ? `Table ${res.table_no}` : 'No table'}
                                                {res.floor_name && <span className="text-xs text-gray-500 ml-1">({res.floor_name})</span>}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-700">{res.party_size}</td>
                                            <td className="px-3 py-2 text-sm">{statusBadge(res.status)}</td>
                                            <td className="px-3 py-2 text-sm text-gray-700">
                                                {res.special_notes ?
                                                    (res.special_notes.length > 10 ? `${res.special_notes.slice(0, 10)}...` : res.special_notes)
                                                    : '-'}
                                            </td>
                                            <td className="px-3 py-2 text-sm">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setViewReservation(res)}
                                                        className="px-3 py-1 rounded bg-gray-200 text-gray-800 text-sm hover:bg-gray-300"
                                                    >
                                                        View
                                                    </button>
                                                    {canEditReservation(res) && (
                                                        <button
                                                            onClick={() => setReservationToEdit(res)}
                                                            className="px-3 py-1 rounded bg-[#007bff] text-white text-sm hover:bg-[#0056b3]"
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                    {res.status === 'confirmed' ? (
                                                        <>
                                                            <button
                                                                onClick={() => updateReservationStatus(res.id, 'completed')}
                                                                className="px-3 py-1 rounded bg-[#28a745] text-white text-sm hover:bg-[#1e7e34]"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button
                                                                onClick={() => updateReservationStatus(res.id, 'cancelled')}
                                                                className="px-3 py-1 rounded bg-[#dc3545] text-white text-sm hover:bg-[#c82333]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : null}
                                                    <button
                                                        onClick={() => handleRequestDelete(res)}
                                                        className="px-3 py-1 rounded bg-[#6c757d] text-white text-sm hover:bg-[#545b62]"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
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
                                Are you sure you want to delete {reservationToDelete?.customer_name}'s reservation for table {reservationToDelete?.table_no || 'No table'}?
                            </p>
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t">
                            <button onClick={handleCancelDelete} className="px-4 py-2 rounded bg-gray-500 text-white">Cancel</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 rounded bg-red-600 text-white">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Reservation Modal */}
            <NewReservation
                isOpen={showNewReservationModal}
                onClose={() => setShowNewReservationModal(false)}
                onCreate={handleReservationCreated}
            />

            {/* View Reservation Modal */}
            {viewReservation && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setViewReservation(null)}></div>
                    <div className="relative w-full max-w-lg bg-white rounded-lg shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-primary">
                            <h3 className="text-white font-semibold">Reservation Details</h3>
                            <button onClick={() => setViewReservation(null)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/15">
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2 text-sm text-gray-800">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-gray-500">Customer</div>
                                    <div className="font-medium">{viewReservation.customer_name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Date</div>
                                    <div className="font-medium">{viewReservation.reservation_date ? new Date(viewReservation.reservation_date).toLocaleDateString() : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Time</div>
                                    <div className="font-medium">{viewReservation.start_time} - {viewReservation.end_time}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Party Size</div>
                                    <div className="font-medium">{viewReservation.party_size || '-'}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-gray-500">Table</div>
                                    <div className="font-medium">
                                        {viewReservation.table_no ? `Table ${viewReservation.table_no}` : 'No table'}
                                        {viewReservation.floor_name && <span className="text-xs text-gray-500 ml-1">({viewReservation.floor_name})</span>}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Status</div>
                                    <div className="mt-1">{statusBadge(viewReservation.status)}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-gray-500">Notes</div>
                                    <div className="font-medium whitespace-pre-wrap">{viewReservation.special_notes || '-'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <button onClick={() => setViewReservation(null)} className="px-4 py-2 rounded bg-gray-500 text-white">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Alert */}
            <CustomAlert
                message={alertState.message}
                isVisible={alertState.isVisible}
                onClose={hideAlert}
                duration={alertState.duration}
                type={alertState.type}
            />
        </>
  )
}

export default Reservations