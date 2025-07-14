import React, { useState, useEffect } from 'react';
import QrReader from 'react-qr-reader';
import { getApiBaseUrl } from './utils/apiConfig';

const API = `${getApiBaseUrl()}/api`;

export default function WorkerScanPage({ lang }) {
  const [qr, setQr] = useState('');
  const [batchId, setBatchId] = useState('');
  const [batchInfo, setBatchInfo] = useState(null);
  const [roles, setRoles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [workerId, setWorkerId] = useState(localStorage.getItem('workerId') || '');
  const [roleId, setRoleId] = useState(localStorage.getItem('roleId') || '');
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/roles`).then(r => r.json()).then(setRoles);
    fetch(`${API}/workers`).then(r => r.json()).then(setWorkers);
  }, []);

  useEffect(() => {
    if (qr) {
      try {
        const data = JSON.parse(qr);
        if (data.batchId) {
          setBatchId(data.batchId);
          fetch(`${API}/batches`).then(r => r.json()).then(batches => {
            const found = batches.find(b => b.id === parseInt(data.batchId));
            setBatchInfo(found || null);
          });
        }
      } catch (e) {
        setError('Invalid QR code');
      }
    }
  }, [qr]);

  const handleScan = data => {
    if (data) setQr(data);
  };
  const handleError = err => setError('QR error');

  const handleLog = async () => {
    setError(''); setSuccess('');
    if (!workerId || !roleId || !batchId) {
      setError(lang === 'en' ? 'All fields required' : 'Todos los campos son obligatorios');
      return;
    }
    try {
      const res = await fetch(`${API}/worker-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, roleId, batchId, quantity })
      });
      if (!res.ok) throw new Error('Log failed');
      setSuccess(lang === 'en' ? 'Logged!' : '¡Registrado!');
      localStorage.setItem('workerId', workerId);
      localStorage.setItem('roleId', roleId);
      setTimeout(() => { setSuccess(''); setQr(''); setBatchId(''); setBatchInfo(null); }, 1500);
    } catch {
      setError(lang === 'en' ? 'Failed to log' : 'Error al registrar');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 16 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>{lang === 'en' ? 'Scan & Log Work' : 'Escanear y Registrar'}</h2>
      <div style={{ marginBottom: 16 }}>
        <QrReader
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      </div>
      {batchInfo && (
        <div style={{ marginBottom: 16, fontSize: 18 }}>
          <b>{lang === 'en' ? 'Batch' : 'Lote'}:</b> #{batchInfo.id} ({batchInfo.type})
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <select value={workerId} onChange={e => setWorkerId(e.target.value)} style={{ fontSize: 20, padding: 8, width: '100%', marginBottom: 8 }}>
          <option value="">{lang === 'en' ? 'Select Worker' : 'Seleccionar Trabajador'}</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={roleId} onChange={e => setRoleId(e.target.value)} style={{ fontSize: 20, padding: 8, width: '100%' }}>
          <option value="">{lang === 'en' ? 'Select Role' : 'Seleccionar Rol'}</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 18 }}>{lang === 'en' ? 'Quantity' : 'Cantidad'}: </label>
        <input type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} style={{ fontSize: 20, width: 80, marginLeft: 8 }} />
      </div>
      <button onClick={handleLog} style={{ fontSize: 22, padding: '14px 0', width: '100%', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, marginBottom: 12 }}>
        {lang === 'en' ? 'Log' : 'Registrar'}
      </button>
      {success && <div style={{ color: 'green', fontSize: 20, marginBottom: 8 }}>{success}</div>}
      {error && <div style={{ color: 'red', fontSize: 18 }}>{error}</div>}
    </div>
  );
} 