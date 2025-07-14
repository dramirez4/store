import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { t } from './i18n';
import './mobile.css';

function QRScanner({ onScan, lang }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream = null;
    let animationId = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
        }
        scanFrame();
      } catch (err) {
        setError(lang === 'en' ? 'Camera error. Please use manual entry.' : 'Error de cámara. Use entrada manual.');
        setScanning(false);
      }
    };

    const scanFrame = () => {
      if (!isMounted || !videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && code.data) {
        setScanning(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        onScan(code.data);
        return;
      }
      animationId = requestAnimationFrame(scanFrame);
    };

    startCamera();
    return () => {
      isMounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [onScan, lang]);

  return (
    <div style={{ textAlign: 'center' }}>
      {error && <div style={{ color: 'red', marginBottom: 16, fontSize: 20 }}>{error}</div>}
      <div style={{ position: 'relative', width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <video ref={videoRef} style={{ width: '100%', borderRadius: 8 }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {/* Green overlay box */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '80%',
          height: '60%',
          border: '3px solid #00e676',
          borderRadius: 12,
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ marginTop: 16, fontSize: 18, color: '#666' }}>
        {scanning ? (lang === 'en' ? 'Point camera at QR code' : 'Apunte la cámara al código QR') : (lang === 'en' ? 'QR code detected!' : '¡Código QR detectado!')}
      </div>
    </div>
  );
}

export default function WorkerDashboardPage({ lang, setLang }) {
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  const handleScan = (data) => {
    if (data) {
      setConfirmation(lang === 'en' ? 'Work logged!' : '¡Trabajo registrado!');
      setError('');
      setScanning(false);
      setTimeout(() => {
        setConfirmation('');
        setScanning(true);
      }, 2500);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>
        {lang === 'en' ? 'Scan your batch QR code' : 'Escanee el código QR del lote'}
      </h1>
      {confirmation && (
        <div style={{ color: '#43a047', fontSize: 28, marginBottom: 24, fontWeight: 'bold' }}>
          ✓ {confirmation}
        </div>
      )}
      {error && (
        <div style={{ color: 'red', fontSize: 20, marginBottom: 24 }}>{error}</div>
      )}
      {scanning && (
        <QRScanner onScan={handleScan} lang={lang} />
      )}
      <button
        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
        style={{
          fontSize: 20,
          padding: '12px 24px',
          background: '#eee',
          color: '#222',
          border: 'none',
          borderRadius: 6,
          marginTop: 32,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        {lang === 'en' ? 'Español' : 'English'}
      </button>
    </div>
  );
} 