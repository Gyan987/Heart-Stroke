import React, { useState, useEffect } from 'react'

export default function MultiStepForm({ onChange }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({})

  useEffect(() => onChange(data), [data])

  function update(field, value) {
    setData((d) => ({ ...d, [field]: value }))
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="mb-4">
        <div className="h-2 bg-gray-200 rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-red-400" style={{ width: `${(step / 3) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div>
          <h3 className="text-lg font-medium">Personal details</h3>
          <label className="block">Age<input className="input" type="number" onChange={(e) => update('age', Number(e.target.value))} /></label>
          <label className="block">Gender<select className="input" onChange={(e) => update('sex', Number(e.target.value))}><option value="">Select</option><option value="1">Male</option><option value="0">Female</option></select></label>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-medium">Medical info</h3>
          <label className="block">Hypertension<select className="input" onChange={(e) => update('hypertension', Number(e.target.value))}><option value="">Select</option><option value="1">Yes</option><option value="0">No</option></select></label>
          <label className="block">Heart disease<select className="input" onChange={(e) => update('heart_disease', Number(e.target.value))}><option value="">Select</option><option value="1">Yes</option><option value="0">No</option></select></label>
          <label className="block">Glucose<input className="input" type="number" onChange={(e) => update('glucose', Number(e.target.value))} /></label>
          <label className="block">BMI<input className="input" type="number" step="0.1" onChange={(e) => update('bmi', Number(e.target.value))} /></label>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-medium">Lifestyle</h3>
          <label className="block">Smoking status<select className="input" onChange={(e) => update('smoking_status', e.target.value)}><option value="">Select</option><option value="never">Never</option><option value="formerly">Former</option><option value="current">Current</option></select></label>
          <label className="block">Work type<select className="input" onChange={(e) => update('work_type', e.target.value)}><option value="">Select</option><option value="Private">Private</option><option value="Self-employed">Self-employed</option></select></label>
          <label className="block">Residence type<select className="input" onChange={(e) => update('Residence_type', e.target.value)}><option value="">Select</option><option value="Urban">Urban</option><option value="Rural">Rural</option></select></label>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button className="btn" onClick={() => setStep((s) => Math.max(1, s - 1))}>Back</button>
        {step < 3 ? (
          <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>Next</button>
        ) : (
          <button className="btn btn-primary" onClick={() => alert('Submitted — real app would persist')}>Finish</button>
        )}
      </div>
    </div>
  )
}
