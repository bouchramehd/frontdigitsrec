import React from 'react';
export default function PredictionPanel({ result }) {
  if (!result) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 600 }}>Prediction: {result.prediction}</div>
      {Array.isArray(result.probs) && result.probs.map(p => (
        <div key={p.digit} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <div style={{ width: 20, textAlign: 'right' }}>{p.digit}</div>
          <div style={{ flex: 1, height: 8, background: '#eee' }}>
            <div style={{ width: `${(p.prob * 100).toFixed(1)}%`, height: 8, background: '#444' }} />
          </div>
          <div style={{ width: 56, textAlign: 'right' }}>{(p.prob * 100).toFixed(1)}%</div>
        </div>
      ))}
      {result._mock && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>Mock mode (backend not detected yet)</div>}
    </div>
  );
}
