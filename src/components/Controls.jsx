import React from "react";

export default function Controls({ onClear, onPredict, loading }) {
  return (
    <div className="row" style={{ marginTop: 8 }}>
      <button
        type="button"
        className="btn"
        onClick={onClear}
        disabled={loading}
      >
        Clear
      </button>

      <button
        type="button"
        className="btn btn--primary"
        onClick={onPredict}
        disabled={loading}
      >
        {loading && <span className="loader" aria-hidden="true" />}
        {loading ? "Predicting…" : "Predict"}
      </button>
    </div>
  );
}
