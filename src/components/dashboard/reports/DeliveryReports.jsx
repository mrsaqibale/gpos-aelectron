import React, { useState } from 'react'
import { Check, Info, User, Printer, Plus, ShoppingBag } from 'lucide-react'
import AddRider from '../../AddRider'
import AssignRider from '../../AssignRider'
import { useRiders } from '../../../contexts/RiderContext'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const DeliveryReports = () => {
  const { selectedRider, setSelectedRider } = useRiders()
  const [startDate, setStartDate] = useState('2025-09-12')
  const [startTime, setStartTime] = useState('16:30')
  const [endDate, setEndDate] = useState('2025-09-12')
  const [endTime, setEndTime] = useState('23:59')
  const [showAddRiderModal, setShowAddRiderModal] = useState(false)
  const [showAssignRiderModal, setShowAssignRiderModal] = useState(false)

  // Handle saving rider data
  const handleSaveRider = (riderData) => {
    console.log('New rider added:', riderData)
    // Rider is already added to context in AddRider component
    // Close the modal after saving
    setShowAddRiderModal(false)
  }

  // Handle rider assignment
  const handleAssignRider = async (rider) => {
    console.log('Rider assigned:', rider)
    // Rider is already set in context in AssignRider component
    // Close the modal after assignment
    setShowAssignRiderModal(false)
    return true // Return true to indicate success
  }

  // Handle going back from AssignRider modal
  const handleBackFromAssignRider = () => {
    setShowAssignRiderModal(false)
  }

  // Ensure only one modal is open at a time
  const handleOpenAddRider = () => {
    console.log('Opening AddRider modal, closing AssignRider if open')
    setShowAssignRiderModal(false) // Close AssignRider modal if open
    setShowAddRiderModal(true)
  }

  const handleOpenAssignRider = () => {
    console.log('Opening AssignRider modal, closing AddRider if open')
    setShowAddRiderModal(false) // Close AddRider modal if open
    setShowAssignRiderModal(true)
  }

  // Format date and time for display
  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Sample data for the chart
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Deliveries',
        data: [12, 20, 15, 24, 18, 18, 23],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Delivery Performance Over Time',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 25,
        ticks: {
          stepSize: 5,
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        hoverBackgroundColor: '#3B82F6'
      }
    }
  }

  return (
    <div className="min-h-screen">
      <style jsx>{`
        input[type="date"], input[type="time"] {
          color-scheme: light;
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          position: absolute;
          right: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        input[type="date"]:focus,
        input[type="time"]:focus {
          outline: none;
        }
      `}</style>
      {/* Header */}
      <div className='bg-white p-6 mb-6 rounded-lg'>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-primary" />
            <h1 className="text-2xl font-bold text-gray-800">Delivery Report</h1>
          </div>
          <p className="text-gray-600 mt-1 text-sm bg-[#F3F4F6] rounded-lg p-2">Register: <span className="font-bold text-primary">001</span></p>
        </div>
        
        {/* Date Selectors and Print Button */}
        <div className="flex items-end gap-2 bg-[#F8F9FA] border border-gray-300 rounded-lg p-2">
          <div className="flex flex-col items-start gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Start Date:</label>
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border-none outline-none bg-transparent w-20"
              />
              <span className="text-gray-400">|</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-sm border-none outline-none bg-transparent w-16"
              />
            </div>
          </div>
          
          <div className="flex flex-col items-start gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">End Date:</label>
            <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border-none outline-none bg-transparent w-20"
              />
              <span className="text-gray-400">|</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="text-sm border-none outline-none bg-transparent w-16"
              />
            </div>
          </div>
          
          <button className="bg-primary text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap">
            Print Delivery Summary
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button 
          onClick={handleOpenAssignRider}
          className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg text-sm font-medium"
        >
          Select Rider
        </button>
        <button 
          onClick={handleOpenAddRider}
          className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rider
        </button>
        <div className="bg-gray-200 text-gray-600 p-4 rounded-lg text-sm">
          {selectedRider ? selectedRider.name : 'No rider selected'}
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-sm font-medium flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Report
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-sm font-medium flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Report & Cash Out
        </button>
      </div>
      </div>

      <div className="flex gap-6">
        {/* Left Side - KPI Cards */}
        <div className="w-60 space-y-4">
          {/* Total Deliveries */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Deliveries</p>
                <p className="text-3xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>

          {/* Delivery Revenue */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Delivery Revenue</p>
                <p className="text-3xl font-bold text-gray-800">€0.00</p>
              </div>
            </div>
          </div>

          {/* Active Riders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Riders</p>
                <p className="text-3xl font-bold text-gray-800">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Chart */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Add Rider Modal - Only render if no other modal is open */}
      {showAddRiderModal && !showAssignRiderModal && (
        <AddRider
          isOpen={showAddRiderModal}
          onClose={() => setShowAddRiderModal(false)}
          onSave={handleSaveRider}
        />
      )}

      {/* Assign Rider Modal - Only render if no other modal is open */}
      {showAssignRiderModal && !showAddRiderModal && (
        <AssignRider
          isOpen={showAssignRiderModal}
          onClose={() => setShowAssignRiderModal(false)}
          onBack={handleBackFromAssignRider}
          order={{ orderNumber: '001' }} // Mock order data
          onAssignRider={handleAssignRider}
          onStatusUpdate={() => {}} // Empty function for now
        />
      )}
    </div>
  )
}

export default DeliveryReports