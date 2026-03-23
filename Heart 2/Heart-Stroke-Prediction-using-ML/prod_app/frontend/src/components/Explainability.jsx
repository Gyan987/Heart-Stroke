import React from 'react'

export default function Explainability({ explain }) {
  const items = explain ? Object.entries(explain).slice(0, 8) : []
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-medium">Explainability</h3>
      {!explain && <p className="text-sm text-gray-500">Run an estimate to see feature attributions.</p>}
      {explain && (
        <ul className="mt-2 space-y-1">
          {items.map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="text-sm">{k}</span>
              <span className="text-sm font-medium">{Number(v).toFixed(3)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
