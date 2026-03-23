import React, { useState, useEffect } from 'react'
import MultiStepForm from './components/MultiStepForm'
import RiskMeter from './components/RiskMeter'
import Explainability from './components/Explainability'
import WhatIfSimulator from './components/WhatIfSimulator'
import axios from 'axios'
import DigitalHealthCard from './components/DigitalHealthCard'
import Dashboard from './components/Dashboard'
import SOSButton from './components/SOSButton'

export default function App() {
  const [features, setFeatures] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => {
    // real-time prediction debounce
    const t = setTimeout(() => {
      if (Object.keys(features).length >= 5) {
        axios.post('http://localhost:8000/predict', { features }).then((res) => {
          setResult(res.data)
        }).catch(() => {})
      }
    }, 400)
    return () => clearTimeout(t)
  }, [features])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Heart Stroke Prediction — Dashboard</h1>
          <SOSButton />
        </div>
      </header>
      <main className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <Dashboard />
          <MultiStepForm onChange={setFeatures} />
          <WhatIfSimulator features={features} onChange={setFeatures} />
          <DigitalHealthCard patient={features} result={result} />
        </section>
        <aside className="space-y-4">
          <RiskMeter result={result} />
          <Explainability explain={result?.explain} />
        </aside>
      </main>
    </div>
  )
}
