import React from 'react'
import { X, Printer, Download } from 'lucide-react'

const PrintRiderReportModal = ({ isOpen, onClose, rider, reportData }) => {
  if (!isOpen) return null

  // Mock data - replace with actual data
  const report = reportData || {
    rider: rider?.name || 'N/A',
    orders: 2,
    amount: 54.75,
    distance: 6.7
  }

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Report - ${report.rider}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: white;
              color: #333;
            }
            .report-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .report-content {
              line-height: 1.8;
              font-size: 16px;
            }
            .report-item {
              margin-bottom: 10px;
            }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1>Delivery Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="report-content">
            <div class="report-item">Delivery report generated for ${report.rider}</div>
            <div class="report-item">Orders: ${report.orders}</div>
            <div class="report-item">Amount: €${report.amount.toFixed(2)}</div>
            <div class="report-item">Distance: ${report.distance} km</div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const handleDownload = () => {
    // Create a text file with the report data
    const reportText = `Delivery Report
Generated on: ${new Date().toLocaleDateString()}

Delivery report generated for ${report.rider}
Orders: ${report.orders}
Amount: €${report.amount.toFixed(2)}
Distance: ${report.distance} km`

    const blob = new Blob([reportText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `delivery-report-${report.rider.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex bg-primary rounded-t-lg items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-white">Print Delivery Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="space-y-3 text-gray-800">
              <div className="text-base leading-relaxed">
                Delivery report generated for <span className="font-semibold">{report.rider}</span>
              </div>
              <div className="text-base leading-relaxed">
                Orders: <span className="font-semibold">{report.orders}</span>
              </div>
              <div className="text-base leading-relaxed">
                Amount: <span className="font-semibold">€{report.amount.toFixed(2)}</span>
              </div>
              <div className="text-base leading-relaxed">
                Distance: <span className="font-semibold">{report.distance} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
          <button
            onClick={handlePrint}
            className="flex-1 mx-6 my-2 bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
      </div>
    </div>
  )
}

const PrintRiderReport = ({ isOpen, onClose, rider, reportData }) => {
  return (
    <PrintRiderReportModal
      isOpen={isOpen}
      onClose={onClose}
      rider={rider}
      reportData={reportData}
    />
  )
}

export default PrintRiderReport