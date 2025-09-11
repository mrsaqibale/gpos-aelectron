import React, { useMemo, useState } from 'react'
import { CalendarDays, Filter, Edit, Check, X, Trash2, Plus } from 'lucide-react'

const Reservations = () => {
  const [activeTab, setActiveTab] = useState('all')

  const reservations = [
    { id: 1, name: 'John Smith', table: 12, from: '7:30 PM', to: '9:30 PM', dateLabel: 'Today', people: 4, status: 'confirmed' },
    { id: 2, name: 'Sarah Johnson', table: 8, from: '8:00 PM', to: '10:00 PM', dateLabel: 'Today', people: 2, status: 'pending' },
    { id: 3, name: 'Mike Davis', table: 15, from: '6:45 PM', to: '8:45 PM', dateLabel: 'Today', people: 6, status: 'confirmed' },
  ]

  const filtered = useMemo(() => {
    if (activeTab === 'all') return reservations
    return reservations.filter(r => r.status === activeTab)
  }, [activeTab])

  const statusBadge = (status) => {
    if (status === 'confirmed') return (
      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">CONFIRMED</span>
    )
    if (status === 'pending') return (
      <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700">PENDING</span>
    )
    return (
      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">CANCELLED</span>
    )
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">Reservations</h2>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded bg-black text-white text-sm font-medium">All Reservations</button>
            <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-800 text-sm font-medium flex items-center gap-1"><Plus size={14} /> New Reservation</button>
            <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-800 text-sm font-medium">Today’s Reservations</button>
            <button className="px-3 py-1.5 rounded bg-gray-200 text-gray-800 text-sm font-medium">Sales Screen</button>
          </div>
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
              className={`px-3 py-1 rounded text-sm ${activeTab === t.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="divide-y">
          {filtered.map(res => (
            <div key={res.id} className="flex items-center justify-between py-4">
              <div className="flex items-start gap-3">
                <div className={`w-1 rounded-sm ${res.status === 'confirmed' ? 'bg-green-500' : res.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
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
                <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Edit</button>
                {res.status === 'pending' ? (
                  <button className="px-3 py-1 rounded bg-green-600 text-white text-sm">Confirm</button>
                ) : (
                  <button className="px-3 py-1 rounded bg-red-500 text-white text-sm">Cancel</button>
                )}
                <button className="px-3 py-1 rounded bg-gray-600 text-white text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reservations