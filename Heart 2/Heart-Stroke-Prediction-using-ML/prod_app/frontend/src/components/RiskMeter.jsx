import React from 'react'

function ColorForScore(score) {
  // score is percentage 0-100
  const r = Math.min(255, Math.round((score / 100) * 255))
  const g = Math.min(255, Math.round(((100 - score) / 100) * 255))
  return `rgb(${r},${g},40)`
}

export default function RiskMeter({ result }) {
  const score = result ? Math.round(result.risk_score) : 0
  const category = result ? result.risk_category : 'Awaiting'
  const color = ColorForScore(score)

  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <h3 className="text-lg font-medium">Risk meter</h3>
      <div className="my-4">
        <svg width="160" height="80" viewBox="0 0 160 80">
          <defs>
            <linearGradient id="g" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path d="M10 70 A70 70 0 0 1 150 70" stroke="#e6e6e6" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d={`M10 70 A70 70 0 0 1 ${10 + (140 * (score / 100)).toFixed(2)} 70`} stroke="url(#g)" strokeWidth="12" fill="none" strokeLinecap="round" />
          <circle cx="80" cy="70" r="18" fill={color} />
          <text x="80" y="75" fontSize="12" textAnchor="middle" fill="#fff">{score}%</text>
        </svg>
      </div>
      <div>
        <p className="text-sm">Category: <strong>{category}</strong></p>
      </div>
    </div>
  )
}
