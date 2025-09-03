import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const CanvasBoard = forwardRef(({ size = 280 }, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Hi-DPI crispness
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // White bg + brush
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 22;
    ctx.strokeStyle = '#000000';
  }, [size]);

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches[0].clientX) - rect.left;
    const y = (e.clientY ?? e.touches[0].clientY) - rect.top;
    return { x, y };
  };

  const start = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    canvasRef.current.setPointerCapture?.(e.pointerId);
    const { x, y } = pos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = (e) => {
    e?.preventDefault();
    setIsDrawing(false);
    canvasRef.current.releasePointerCapture?.(e.pointerId);
  };

  function clear() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
  }

  function toDataURL() {
    // Export the full canvas
    // NOTE: This respects devicePixelRatio transform we applied above
    const off = document.createElement('canvas');
    off.width = size; off.height = size;
    const octx = off.getContext('2d');
    // draw downscaled to logical size for consistent export
    octx.drawImage(canvasRef.current, 0, 0, size, size);
    return off.toDataURL('image/png');
  }

  function to28x28DataURL({ invert = false } = {}) {
    const src = canvasRef.current;
    const off = document.createElement('canvas');
    off.width = 28; off.height = 28;
    const octx = off.getContext('2d');
    // optional smoothing (true works fine for MNIST)
    octx.imageSmoothingEnabled = true;
    octx.drawImage(src, 0, 0, 28, 28);

    if (invert) {
      // If your model expects white digit on black and your canvas is black on white
      const img = octx.getImageData(0, 0, 28, 28);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        // convert to grayscale and invert
        const g = d[i]; // already nearly grayscale since stroke is black
        const inv = 255 - g;
        d[i] = d[i+1] = d[i+2] = inv;
      }
      octx.putImageData(img, 0, 0);
    }

    return off.toDataURL('image/png');
  }

  useImperativeHandle(ref, () => ({
    clear,
    toDataURL,
    to28x28DataURL,
  }));

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px`, border: '1px solid #ddd', borderRadius: 12, background: '#fff', touchAction: 'none' }}
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerLeave={end}
      onPointerCancel={end}
    />
  );
});

export default CanvasBoard;
