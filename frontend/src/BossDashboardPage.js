import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from './utils/apiConfig';

const API = `${getApiBaseUrl()}/api`;

function toCSV(rows) {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => r[k]).join(',')));
  return csv.join('\n');
}

export default function BossDashboardPage({ lang }) {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState([]);
  const [roles, setRoles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filters, setFilters] = useState({ workerId: '', roleId: '', batchId: '', start: '', end: '' });
  const [csv, setCsv] = useState('');

  useEffect(() => {
    fetch(`${API}/roles`).then(r => r.json()).then(setRoles);
    fetch(`${API}/workers`).then(r => r.json()).then(setWorkers);
    fetch(`${API}/batches`).then(r => r.json()).then(setBatches);
    fetchLogs();
    fetchStats();
  }, []);

  const fetchLogs = () => {
    const params = new URLSearchParams(filters).toString();
    fetch(`${API}/worker-logs?${params}`).then(r => r.json()).then(setLogs);
  };
  const fetchStats = () => {
    const params = new URLSearchParams(filters).toString();
    fetch(`${API}/worker-logs/stats?${params}`).then(r => r.json()).then(setStats);
  };

  const handleFilter = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  useEffect(() => { fetchLogs(); fetchStats(); }, [filters]);

  const handleExport = () => setCsv(toCSV(logs));

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2 style={{ fontSize: 32, marginBottom: 16 }}>{lang === 'en' ? 'Boss Dashboard' : 'Panel del Jefe'}</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <select name="workerId" value={filters.workerId} onChange={handleFilter} style={{ fontSize: 18, padding: 8 }}>
          <option value="">{lang === 'en' ? 'All Workers' : 'Todos los Trabajadores'}</option>
          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select name="roleId" value={filters.roleId} onChange={handleFilter} style={{ fontSize: 18, padding: 8 }}>
          <option value="">{lang === 'en' ? 'All Roles' : 'Todos los Roles'}</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select name="batchId" value={filters.batchId} onChange={handleFilter} style={{ fontSize: 18, padding: 8 }}>
          <option value="">{lang === 'en' ? 'All Batches' : 'Todos los Lotes'}</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.type} #{b.id}</option>)}
        </select>
        <input name="start" type="date" value={filters.start} onChange={handleFilter} style={{ fontSize: 18, padding: 8 }} />
        <input name="end" type="date" value={filters.end} onChange={handleFilter} style={{ fontSize: 18, padding: 8 }} />
        <button onClick={handleExport} style={{ fontSize: 18, padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6 }}>{lang === 'en' ? 'Export CSV' : 'Exportar CSV'}</button>
      </div>
      {csv && <textarea value={csv} readOnly style={{ width: '100%', height: 80, marginBottom: 16 }} />}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 24 }}>{lang === 'en' ? 'Production Stats' : 'Estadísticas de Producción'}</h3>
        <table style={{ width: '100%', fontSize: 18, marginBottom: 16 }}>
          <thead>
            <tr>
              <th>{lang === 'en' ? 'Group' : 'Grupo'}</th>
              <th>{lang === 'en' ? 'Total Quantity' : 'Cantidad Total'}</th>
              <th>{lang === 'en' ? 'Log Count' : 'Registros'}</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((s, i) => (
              <tr key={i}>
                <td>{s.workerId || s.roleId || s.batchId}</td>
                <td>{s._sum.quantity}</td>
                <td>{s._count._all}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 style={{ fontSize: 24 }}>{lang === 'en' ? 'Logs' : 'Registros'}</h3>
        <table style={{ width: '100%', fontSize: 16 }}>
          <thead>
            <tr>
              <th>{lang === 'en' ? 'Worker' : 'Trabajador'}</th>
              <th>{lang === 'en' ? 'Role' : 'Rol'}</th>
              <th>{lang === 'en' ? 'Batch' : 'Lote'}</th>
              <th>{lang === 'en' ? 'Quantity' : 'Cantidad'}</th>
              <th>{lang === 'en' ? 'Time' : 'Hora'}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i}>
                <td>{l.worker?.name || l.workerId}</td>
                <td>{l.role?.name || l.roleId}</td>
                <td>{l.batch?.type} #{l.batch?.id || l.batchId}</td>
                <td>{l.quantity}</td>
                <td>{new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 32 }}>
        <button style={{ fontSize: 18, padding: '10px 20px', marginRight: 8 }}>{lang === 'en' ? 'Manage Roles' : 'Gestionar Roles'}</button>
        <button style={{ fontSize: 18, padding: '10px 20px', marginRight: 8 }}>{lang === 'en' ? 'Manage Workers' : 'Gestionar Trabajadores'}</button>
        <button style={{ fontSize: 18, padding: '10px 20px' }}>{lang === 'en' ? 'Manage Batches' : 'Gestionar Lotes'}</button>
      </div>
    </div>
  );
} 