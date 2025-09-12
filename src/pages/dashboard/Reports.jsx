import React, { useState } from 'react'
import DailyReports from '../../components/dashboard/reports/DailyReports'
import DeliveryReports from '../../components/dashboard/reports/DeliveryReports'
import { BarChart3, Calendar, Truck } from 'lucide-react'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('daily')

  const tabs = [
    {
      id: 'daily',
      name: 'Daily Reports',
      icon: <Calendar size={18} />,
      component: <DailyReports />
    },
    {
      id: 'delivery',
      name: 'Delivery Reports',
      icon: <Truck size={18} />,
      component: <DeliveryReports />
    }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  )
}

export default Reports