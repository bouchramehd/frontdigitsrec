import React, { useRef, useState, useEffect, useCallback } from 'react';
import './styles/globals.css';

import CanvasBoard from './components/CanvasBoard';
import Controls from './components/Controls';
import PredictionPanel from './components/PredictionPanel';
import ErrorBanner from './components/ErrorBanner';
import Spinner from './components/Spinner';
import { predictDigit, checkHealth } from './utils/api';

export default function App() {
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => { checkHealth().then(setApiOnline).catch(() => setApiOnline(false)); }, []);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear?.();
    setResult(null);
    setError('');
  }, []);

  const handlePredict = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const dataUrl =
        canvasRef.current?.toBackend28x28DataURL?.() ||
        canvasRef.current?.to28x28DataURL?.({ invert: false }) ||
        canvasRef.current?.toDataURL?.('image/png');
      const json = await predictDigit(dataUrl);
      setResult(json);
    } catch (e) {
      console.error(e);
      setError('Prediction failed. Check backend & CORS.');
    } finally { setLoading(false); }
  }, []);

  return (
    <div className="page">
      {/* FUN BACKGROUND */}
      <div className="bg-fun" aria-hidden="true"></div>

      {/* HERO TITLE */}
      <div className="hero">
        <div className="hero-title">
          <span className="badge-chip">MNIST</span>
          Digit Recognition
        </div>
        <p className="hero-sub">Handwritten digits (0–9) in your browser — draw and hit Predict.</p>
      </div>

      {/* CARD (real page with backend) */}
      <div className="card">
        <div className="header">
          <h2 className="brand">MNIST Digit Recognizer</h2>
          <span className="badge" style={{
            background: apiOnline ? 'rgba(16,185,129,.13)' : 'rgba(244,63,94,.13)',
            color: apiOnline ? 'hsl(160 84% 20%)' : 'hsl(350 84% 35%)',
            border: apiOnline ? '1px solid rgba(16,185,129,.25)' : '1px solid rgba(244,63,94,.25)'
          }}>
            {apiOnline ? 'API: live' : 'Mock mode'}
          </span>
        </div>

        <p className="subtitle">Draw a digit (0–9) and click <b>Predict</b>.</p>

        <div className="stage">
          <CanvasBoard ref={canvasRef} />
        </div>

        <Controls onClear={handleClear} onPredict={handlePredict} loading={loading} />
        {loading && <Spinner />}
        {error && <ErrorBanner message={error} />}
        {result && <PredictionPanel result={result} />}

        <div className="hint">Tip: if predictions look inverted, toggle inversion on the backend (or in your 28×28 export).</div>
      </div>
    </div>
  );
}
