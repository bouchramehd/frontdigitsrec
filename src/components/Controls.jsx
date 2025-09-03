import React from 'react';
export default function Controls({ onClear, onPredict, loading }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <button onClick={onClear} disabled={loading}>Clear</button>
      <button onClick={onPredict} disabled={loading}>{loading ? 'Predicting…' : 'Predict'}</button>
    </div>
  );
}
