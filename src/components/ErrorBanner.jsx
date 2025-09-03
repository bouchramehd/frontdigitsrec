import React from 'react';
export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ marginTop: 12, color: '#b91c1c', background: '#fee2e2', padding: 8, borderRadius: 8 }}>
      {message}
    </div>
  );
}
