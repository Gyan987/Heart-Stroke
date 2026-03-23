import React from 'react'

export default function WhatIfSimulator({ features = {}, onChange }) {
  const change = (k, v) => onChange({ ...features, [k]: v })
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-medium">What-if simulator</h3>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <label className="block">Glucose<input type="range" min="60" max="200" value={features.glucose || 100} onChange={(e) => change('glucose', Number(e.target.value))} /></label>
        <label className="block">BMI<input type="range" min="15" max="50" value={features.bmi || 25} onChange={(e) => change('bmi', Number(e.target.value))} /></label>
      </div>
      <p className="text-sm text-gray-500 mt-2">Adjust sliders to see risk update in real time.</p>
    </div>
  )
}
