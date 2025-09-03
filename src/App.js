import React, { useRef, useState } from 'react';
import './styles/globals.css';
import CanvasBoard from './components/CanvasBoard';
import Controls from './components/Controls';
import PredictionPanel from './components/PredictionPanel';
import ErrorBanner from './components/ErrorBanner';
import Spinner from './components/Spinner';
import { predictDigit } from './utils/api';

export default function App() {
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClear = () => {
    canvasRef.current?.clear();
    setResult(null);
    setError('');
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError('');
      const dataUrl = canvasRef.current?.to28x28DataURL({ invert: false });
      const json = await predictDigit(dataUrl);
      setResult(json);
    } catch (e) {
      console.error(e);
      setError('Prediction failed. Check backend & CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 10px 20px rgba(0,0,0,.05)' }}>
        <h2 style={{ margin: 0 }}>MNIST Digit Recognizer</h2>
        <p style={{ marginTop: 6, color: '#6b7280' }}>Draw a digit (0–9) and click <b>Predict</b>.</p>

        <CanvasBoard ref={canvasRef} />
        <Controls onClear={handleClear} onPredict={handlePredict} loading={loading} />
        {loading && <Spinner />}
        <ErrorBanner message={error} />
        <PredictionPanel result={result} />

        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
          Tip: if predictions look inverted, ask backend to toggle <code>ImageOps.invert</code>.
        </div>
      </div>
    </div>
  );
}
