import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { t } from './i18n';
import './mobile.css';

function QRScanner({ onScan, onClose, lang }) {
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
      <h3>{lang === 'en' ? 'Scan QR Code' : 'Escanear Código QR'}</h3>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
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
      <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
        {scanning ? (lang === 'en' ? 'Point camera at QR code' : 'Apunte la cámara al código QR') : (lang === 'en' ? 'QR code detected!' : '¡Código QR detectado!')}
      </div>
      <button
        onClick={onClose}
        style={{ marginTop: 16, fontSize: 18, padding: '12px 24px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
      >
        {lang === 'en' ? 'Cancel' : 'Cancelar'}
      </button>
    </div>
  );
}

export default function WorkerDashboardPage({ lang, setLang }) {
  const [showQR, setShowQR] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [step, setStep] = useState('dashboard');
  const [logData, setLogData] = useState({ quantity: '', role: '' });
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const roles = [
    { value: 'sole', label: lang === 'en' ? 'Sole' : 'Suela' },
    { value: 'assembly', label: lang === 'en' ? 'Assembly' : 'Armado' },
    { value: 'finishing', label: lang === 'en' ? 'Finishing' : 'Terminación' }
  ];
  const handleScan = (data) => {
    if (data) {
      setQrCode(data);
      setShowQR(false);
      setStep('log');
    }
  };
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode) {
      setError(lang === 'en' ? 'Enter a code.' : 'Ingrese un código.');
      return;
    }
    setQrCode(manualCode);
    setShowManual(false);
    setStep('log');
  };
  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!logData.quantity || !logData.role) {
      setError(lang === 'en' ? 'All fields required.' : 'Todos los campos son obligatorios.');
      return;
    }
    setConfirmation(lang === 'en' ? 'Work logged!' : 'Trabajo registrado!');
    setStep('dashboard');
    setQrCode('');
    setManualCode('');
    setLogData({ quantity: '', role: '' });
    setTimeout(() => setConfirmation(''), 3000);
  };
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 32, textAlign: 'center', marginBottom: 32 }}>
        {lang === 'en' ? 'Worker Dashboard' : 'Panel de Trabajador'}
      </h1>
      {confirmation && (
        <div className="success-message">{confirmation}</div>
      )}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      {step === 'dashboard' && (
        <>
          <div className="mobile-button-group">
            <button
              style={{ fontSize: 24, padding: '24px 0', borderRadius: 8, background: '#1976d2', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', minHeight: '60px', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              onClick={() => { setError(''); setShowQR(true); }}
              onTouchStart={(e) => { e.currentTarget.style.background = '#1565c0'; }}
              onTouchEnd={(e) => { e.currentTarget.style.background = '#1976d2'; }}
            >
              {lang === 'en' ? 'Scan QR Code' : 'Escanear Código QR'}
            </button>
            <button
              style={{ fontSize: 24, padding: '24px 0', borderRadius: 8, background: '#eee', color: '#222', border: 'none', fontWeight: 'bold' }}
              onClick={() => { setShowManual(true); setError(''); }}
            >
              {lang === 'en' ? 'Enter QR Code Manually' : 'Ingresar Código QR Manualmente'}
            </button>
          </div>
          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button
              onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
              style={{ fontSize: 18, padding: '12px 24px', minWidth: 120, background: '#eee', color: '#222', border: 'none', borderRadius: 6, marginTop: 16, cursor: 'pointer', touchAction: 'manipulation' }}
            >
              {lang === 'en' ? 'Español' : 'English'}
            </button>
          </div>
        </>
      )}
      {showQR && (
        <div className="qr-scanner-container" style={{ marginTop: 24, textAlign: 'center' }}>
          <QRScanner
            onScan={handleScan}
            onClose={() => setShowQR(false)}
            lang={lang}
          />
        </div>
      )}
      {showManual && (
        <form onSubmit={handleManualSubmit} style={{ marginTop: 24, textAlign: 'center' }}>
          <input
            type="text"
            value={manualCode}
            onChange={e => setManualCode(e.target.value)}
            placeholder={lang === 'en' ? 'Enter QR code' : 'Ingrese código QR'}
            style={{ fontSize: 20, padding: 12, width: '100%', marginBottom: 16, boxSizing: 'border-box' }}
            autoFocus
          />
          <div className="mobile-button-group">
            <button type="submit" style={{ fontSize: 18, background: '#4caf50', color: 'white' }}>{lang === 'en' ? 'Submit' : 'Enviar'}</button>
            <button type="button" onClick={() => setShowManual(false)} style={{ fontSize: 18, background: '#f44336', color: 'white' }}>{lang === 'en' ? 'Cancel' : 'Cancelar'}</button>
          </div>
        </form>
      )}
      {step === 'log' && (
        <form onSubmit={handleLogSubmit} style={{ marginTop: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 20, marginBottom: 16 }}>
            {lang === 'en' ? 'QR Code:' : 'Código QR:'} <b>{qrCode}</b>
          </div>
          <select
            value={logData.role}
            onChange={e => setLogData({ ...logData, role: e.target.value })}
            style={{ fontSize: 20, padding: 12, width: '100%', marginBottom: 16, boxSizing: 'border-box' }}
          >
            <option value="">{lang === 'en' ? 'Select role/task' : 'Seleccione rol/tarea'}</option>
            {roles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={logData.quantity}
            onChange={e => setLogData({ ...logData, quantity: e.target.value })}
            placeholder={lang === 'en' ? 'Quantity' : 'Cantidad'}
            style={{ fontSize: 20, padding: 12, width: '100%', marginBottom: 16, boxSizing: 'border-box' }}
          />
          <div className="mobile-button-group">
            <button type="submit" style={{ fontSize: 20, background: '#4caf50', color: 'white' }}>{lang === 'en' ? 'Log Work' : 'Registrar Trabajo'}</button>
            <button type="button" onClick={() => { setStep('dashboard'); setQrCode(''); setManualCode(''); setLogData({ quantity: '', role: '' }); }} style={{ fontSize: 20, background: '#f44336', color: 'white' }}>{lang === 'en' ? 'Cancel' : 'Cancelar'}</button>
          </div>
        </form>
      )}
    </div>
  );
} 