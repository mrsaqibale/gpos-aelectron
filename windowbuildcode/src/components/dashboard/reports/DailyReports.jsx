import React, { useState } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  BarChart3,
  RotateCcw,
  X,
  RefreshCw
} from 'lucide-react'

const DailyReports = () => {
  const [startDate, setStartDate] = useState('2025-09-12')
  const [startTime, setStartTime] = useState('09:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reportGenerated, setReportGenerated] = useState(false)

  // Report data
  const reportData = {
    payments: [
      { type: 'Cash', amount: 1250.50 },
      { type: 'Card', amount: 890.25 },
      { type: 'Digital', amount: 340.75 },
      { type: 'Contactless', amount: 156.80 },
      { type: 'Mobile Pay', amount: 89.45 },
      { type: 'Gift Card', amount: 45.20 },
      { type: 'Store Credit', amount: 23.10 },
      { type: 'Split Payment', amount: 78.90 }
    ],
    taxes: [
      { category: 'VAT 21%', taxes: 420.15, net: 2000.00 },
      { category: 'VAT 9%', taxes: 45.30, net: 503.33 },
      { category: 'VAT 13.5%', taxes: 67.85, net: 502.59 },
      { category: 'VAT 23%', taxes: 89.45, net: 388.91 },
      { category: 'Zero Rate', taxes: 0.00, net: 125.00 },
      { category: 'Exempt', taxes: 0.00, net: 89.50 }
    ],
    transactions: {
      sales: { count: 45, gross: 2480.50, taxes: 465.45, net: 2015.05 },
      refund: { count: 2, gross: -45.00, taxes: -9.45, net: -35.55 },
      void: { count: 1, gross: -25.00, taxes: -5.25, net: -19.75 },
      tip: { count: 12, gross: 120.00, taxes: 0, net: 120.00 }
    }
  }

  // Calculate totals
  const totalTransactions = reportData.transactions.sales.count + reportData.transactions.refund.count + 
                          reportData.transactions.void.count + reportData.transactions.tip.count
  const totalGross = reportData.transactions.sales.gross + reportData.transactions.refund.gross + 
                    reportData.transactions.void.gross + reportData.transactions.tip.gross
  const totalTaxes = reportData.transactions.sales.taxes + reportData.transactions.refund.taxes + 
                    reportData.transactions.void.taxes + reportData.transactions.tip.taxes
  const totalNet = reportData.transactions.sales.net + reportData.transactions.refund.net + 
                  reportData.transactions.void.net + reportData.transactions.tip.net

  // Transaction data for display
  const transactionData = [
    { type: 'Sales', count: reportData.transactions.sales.count, gross: reportData.transactions.sales.gross, taxes: reportData.transactions.sales.taxes, net: reportData.transactions.sales.net, bgColor: 'bg-green-50', icon: <ShoppingCart className="w-4 h-4 text-yellow-600" /> },
    { type: 'Refund', count: reportData.transactions.refund.count, gross: reportData.transactions.refund.gross, taxes: reportData.transactions.refund.taxes, net: reportData.transactions.refund.net, bgColor: 'bg-yellow-50', icon: <RotateCcw className="w-4 h-4 text-blue-600" /> },
    { type: 'Void', count: reportData.transactions.void.count, gross: reportData.transactions.void.gross, taxes: reportData.transactions.void.taxes, net: reportData.transactions.void.net, bgColor: 'bg-red-50', icon: <X className="w-4 h-4 text-red-600" /> },
    { type: 'Tip', count: reportData.transactions.tip.count, gross: reportData.transactions.tip.gross, taxes: reportData.transactions.tip.taxes, net: reportData.transactions.tip.net, bgColor: 'bg-yellow-50', icon: <TrendingUp className="w-4 h-4 text-yellow-600" /> },
    { type: 'Total', count: totalTransactions, gross: totalGross, taxes: totalTaxes, net: totalNet, bgColor: 'bg-blue-50', icon: <BarChart3 className="w-4 h-4 text-blue-600" /> }
  ]

  const handleGenerateReport = () => {
    console.log('Generating report for:', { startDate, startTime, endDate, endTime })
    setReportGenerated(true)
  }

  return (
    <div className="min-h-screen">
      <style jsx>{`
        input[type="date"], input[type="time"] {
          color-scheme: light;
          position: relative;
          z-index: 1;
        }
        input[type="date"]::-webkit-calendar-picker-indicator,
        input[type="time"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: auto;
          height: auto;
          color: transparent;
          background: transparent;
          cursor: pointer;
          z-index: 2;
        }
        input[type="date"]::-webkit-inner-spin-button,
        input[type="date"]::-webkit-clear-button,
        input[type="time"]::-webkit-inner-spin-button,
        input[type="time"]::-webkit-clear-button {
          display: none;
          -webkit-appearance: none;
        }
        input[type="date"]:focus,
        input[type="time"]:focus {
          outline: none;
          z-index: 10;
          position: relative;
        }
        input[type="date"]:focus::-webkit-calendar-picker-indicator,
        input[type="time"]:focus::-webkit-calendar-picker-indicator {
          z-index: 11;
        }
      `}</style>

      {/* Header */}
      <div className='bg-white p-6 mb-6 rounded-lg border border-gray-200'>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={24} className="text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">Daily Report (Z-Report)</h1>
            </div>
            <p className="text-gray-600 mt-1 text-sm bg-[#F3F4F6] rounded-lg p-2">Register: <span className="font-bold text-primary">001</span></p>
          </div>
          
          {/* Date Selectors and Generate Button */}
          <div className="flex items-end gap-2 bg-[#F8F9FA] border border-gray-300 rounded-lg p-2">
            <div className="flex flex-col items-start gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Start Date:</label>
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-3 py-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => e.stopPropagation()}
                  className="text-sm border-none outline-none bg-transparent w-20"
                />
                <span className="text-gray-400">|</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => e.stopPropagation()}
                  className="text-sm border-none outline-none bg-transparent w-20"
                  placeholder="mm/dd/yyyy"
                />
                <span className="text-gray-400">|</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  onBlur={(e) => e.stopPropagation()}
                  className="text-sm border-none outline-none bg-transparent w-16"
                  placeholder="--:--"
                />
              </div>
            </div>
            
            <button 
              onClick={handleGenerateReport}
              className="bg-primary text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start gap-4">
            {/* Header Section */}
            <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Payment Summary</h3>
            </div>
            
            {/* Data List */}
            {reportGenerated ? (
              <div className="flex-1 max-h-48 overflow-y-auto pr-2">
                <div className="space-y-2">
                  {reportData.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{payment.type}:</span>
                      <span className="font-medium text-gray-800">€{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center h-32">
                <p className="text-gray-500 text-sm">Click "Generate Report" to view payment summary</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start gap-4">
            {/* Header Section */}
            <div className="flex items-center gap-3 bg-gray-100 px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700">Tax Breakdown</h3>
            </div>
            
            {/* Data List */}
            {reportGenerated ? (
              <div className="flex-1 max-h-48 overflow-y-auto pr-2">
                <div className="space-y-2">
                  {reportData.taxes.map((tax, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{tax.category}:</span>
                      <div className="text-right">
                        <div className="font-medium text-gray-800">€{tax.taxes.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">€{tax.net.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center h-32">
                <p className="text-gray-500 text-sm">Click "Generate Report" to view tax breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex gap-6">
          <div className="w-80">
            {/* Transaction Summary Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary">
             <FileText className="w-4 h-4 text-white" />
           </div>
                 <h3 className="text-lg font-semibold text-black">Transaction Summary</h3>
              </div>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">{totalTransactions}</span>
            </div>

            {/* Transaction Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <div>TYPE</div>
                  <div>COUNT</div>
                  <div>GROSS</div>
                  <div>TAXES</div>
                  <div>NET</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {transactionData.map((transaction, index) => (
                  <div key={index} className={`px-4 py-3 ${transaction.bgColor}`}>
                    <div className="grid grid-cols-5 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        {transaction.icon}
                        <span className="text-sm font-medium text-gray-800">{transaction.type}</span>
                      </div>
                      <div className="text-sm text-gray-600">{reportGenerated ? transaction.count : '-'}</div>
                      <div className="text-sm text-gray-600">{reportGenerated ? `€${transaction.gross.toFixed(2)}` : '-'}</div>
                      <div className="text-sm text-gray-600">{reportGenerated ? `€${transaction.taxes.toFixed(2)}` : '-'}</div>
                      <div className="text-sm text-gray-600">{reportGenerated ? `€${transaction.net.toFixed(2)}` : '-'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DailyReports