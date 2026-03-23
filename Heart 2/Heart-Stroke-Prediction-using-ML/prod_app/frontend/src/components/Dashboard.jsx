import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

function sampleSeries(min, max, points = 12) {
  const arr = []
  for (let i = 0; i < points; i++) arr.push(Math.round(min + Math.random() * (max - min)))
  return arr
}

export default function Dashboard() {
  const bpRef = useRef()
  const glucoseRef = useRef()
  const bmiRef = useRef()

  useEffect(() => {
    const labels = Array.from({ length: 12 }, (_, i) => `M${i + 1}`)
    const bpChart = new Chart(bpRef.current, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Systolic BP', data: sampleSeries(110, 160), borderColor: '#ef4444', tension: 0.4, fill: true }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    })

    const glucoseChart = new Chart(glucoseRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Glucose', data: sampleSeries(80, 180), backgroundColor: '#f59e0b' }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    })

    const bmiChart = new Chart(bmiRef.current, {
      type: 'line',
      data: { labels, datasets: [{ label: 'BMI', data: sampleSeries(18, 35), borderColor: '#10b981', tension: 0.4 }] },
      options: { responsive: true, plugins: { legend: { display: false } } },
    })

    return () => {
      bpChart.destroy()
      glucoseChart.destroy()
      bmiChart.destroy()
    }
  }, [])

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-medium">Health Dashboard</h3>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="p-3 border rounded">
          <h4 className="text-sm font-medium">Blood Pressure</h4>
          <canvas ref={bpRef} />
        </div>
        <div className="p-3 border rounded">
          <h4 className="text-sm font-medium">Glucose</h4>
          <canvas ref={glucoseRef} />
        </div>
        <div className="p-3 border rounded">
          <h4 className="text-sm font-medium">BMI</h4>
          <canvas ref={bmiRef} />
        </div>
      </div>
    </div>
  )
}
