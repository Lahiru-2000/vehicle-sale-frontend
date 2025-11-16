import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export interface SubscriptionExportData {
  id: string
  userName: string
  userEmail: string
  userPhone: string
  planType: string
  planName: string
  price: number
  status: string
  displayStatus: string
  paymentMethod: string
  transactionId: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export function exportToExcel(data: SubscriptionExportData[], filename?: string) {
  try {
    // Prepare data for Excel export
    const excelData = data.map(subscription => ({
      'Subscription ID': subscription.id,
      'User Name': subscription.userName,
      'User Email': subscription.userEmail,
      'User Phone': subscription.userPhone || 'N/A',
      'Plan Type': subscription.planType.toUpperCase(),
      'Plan Name': subscription.planName || 'Standard Plan',
      'Amount (Rs.)': subscription.price,
      'Status': subscription.displayStatus,
      'Payment Method': subscription.paymentMethod || 'N/A',
      'Transaction ID': subscription.transactionId || 'N/A',
      'Start Date': new Date(subscription.startDate).toLocaleDateString(),
      'End Date': new Date(subscription.endDate).toLocaleDateString(),
      'Created At': new Date(subscription.createdAt).toLocaleDateString(),
      'Last Updated': new Date(subscription.updatedAt).toLocaleDateString()
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Subscription ID
      { wch: 25 }, // User Name
      { wch: 30 }, // User Email
      { wch: 15 }, // User Phone
      { wch: 12 }, // Plan Type
      { wch: 20 }, // Plan Name
      { wch: 15 }, // Amount
      { wch: 12 }, // Status
      { wch: 15 }, // Payment Method
      { wch: 25 }, // Transaction ID
      { wch: 12 }, // Start Date
      { wch: 12 }, // End Date
      { wch: 12 }, // Created At
      { wch: 12 }  // Last Updated
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscription Payments')

    // Generate filename
    const defaultFilename = `subscription-payments-${new Date().toISOString().split('T')[0]}.xlsx`
    const finalFilename = filename || defaultFilename

    // Export file
    XLSX.writeFile(workbook, finalFilename)

    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('Excel export error:', error)
    return { success: false, error: 'Failed to export to Excel' }
  }
}

export function exportToPDF(data: SubscriptionExportData[], filename?: string) {
  try {
    // Create new PDF document
    const doc = new jsPDF('l', 'mm', 'a4') // Landscape orientation

    // Add title
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Subscription Payments Report', 14, 15)

    // Add date
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25)

    // Add summary info
    doc.text(`Total Records: ${data.length}`, 14, 35)

    // Prepare data for PDF table
    const tableData = data.map(subscription => [
      subscription.id.substring(0, 8) + '...', // Truncated ID
      subscription.userName,
      subscription.userEmail,
      subscription.planType.toUpperCase(),
      `Rs. ${subscription.price.toLocaleString()}`,
      subscription.displayStatus,
      subscription.paymentMethod || 'N/A',
      new Date(subscription.startDate).toLocaleDateString(),
      new Date(subscription.endDate).toLocaleDateString()
    ])

    // Add table
    doc.autoTable({
      startY: 45,
      head: [['ID', 'User Name', 'Email', 'Plan', 'Amount', 'Status', 'Payment Method', 'Start Date', 'End Date']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 20 }, // ID
        1: { cellWidth: 30 }, // User Name
        2: { cellWidth: 40 }, // Email
        3: { cellWidth: 15 }, // Plan
        4: { cellWidth: 20 }, // Amount
        5: { cellWidth: 15 }, // Status
        6: { cellWidth: 20 }, // Payment Method
        7: { cellWidth: 20 }, // Start Date
        8: { cellWidth: 20 }  // End Date
      },
      margin: { top: 45, right: 14, bottom: 14, left: 14 }
    })

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10)
    }

    // Generate filename
    const defaultFilename = `subscription-payments-${new Date().toISOString().split('T')[0]}.pdf`
    const finalFilename = filename || defaultFilename

    // Save PDF
    doc.save(finalFilename)

    return { success: true, filename: finalFilename }
  } catch (error) {
    console.error('PDF export error:', error)
    return { success: false, error: 'Failed to export to PDF' }
  }
}

export function clearAllFilters() {
  return {
    status: 'all',
    startDate: '',
    endDate: ''
  }
}
