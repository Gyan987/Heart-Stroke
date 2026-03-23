import React, { useRef } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function DigitalHealthCard({ patient = {}, result = null }) {
  const cardRef = useRef()

  async function downloadPDF() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth() - 40
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    pdf.addImage(imgData, 'PNG', 20, 20, pdfWidth, pdfHeight)
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, pdfHeight + 40)
    pdf.save(`health-card-${Date.now()}.pdf`)
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div ref={cardRef} className="p-4 border rounded bg-gradient-to-r from-white to-gray-50">
        <h3 className="text-xl font-semibold">Digital Health Card</h3>
        <div className="mt-2">
          <p><strong>Name:</strong> {patient.name || '—'}</p>
          <p><strong>Age:</strong> {patient.age ?? '—'}</p>
          <p><strong>Gender:</strong> {patient.sex === 1 ? 'Male' : patient.sex === 0 ? 'Female' : '—'}</p>
          <p><strong>Glucose:</strong> {patient.glucose ?? '—'}</p>
          <p><strong>BMI:</strong> {patient.bmi ?? '—'}</p>
        </div>
        <div className="mt-3 p-3 rounded border">
          <p><strong>Risk:</strong> {result ? `${Math.round(result.risk_score)}%` : '—'}</p>
          <p><strong>Category:</strong> {result?.risk_category ?? '—'}</p>
          <p className="text-sm text-gray-500 mt-1">Disclaimer: Demo prediction only. Not clinically validated.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={downloadPDF}>Download PDF</button>
      </div>
    </div>
  )
}
