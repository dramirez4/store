import React, { useEffect, useState } from 'react';
import { t } from './i18n';
import { getApiUrl, API_ENDPOINTS } from './utils/apiConfig';

const API_URL = getApiUrl(API_ENDPOINTS.SALES);

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
});

function AddOrderModal({ open, onClose, onAdd, lang, inventory }) {
  const [form, setForm] = useState({ customerName: '', inventoryItemId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ customerName: '', inventoryItemId: '' });
      setError('');
    }
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.inventoryItemId) {
      setError(lang === 'en' ? 'All fields are required.' : 'Todos los campos son obligatorios.');
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customerName: form.customerName,
          inventoryItemId: Number(form.inventoryItemId),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (lang === 'en' ? 'Error adding order.' : 'Error al agregar el pedido.'));
        return;
      }
      onAdd();
      onClose();
    } catch (err) {
      setError(lang === 'en' ? 'Network error.' : 'Error de red.');
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>{lang === 'en' ? 'Add Order' : 'Agregar Pedido'}</h2>
        <input name="customerName" placeholder={lang === 'en' ? 'Customer Name' : 'Nombre del Cliente'} value={form.customerName} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <select name="inventoryItemId" value={form.inventoryItemId} onChange={handleChange} style={{ fontSize: 18, padding: 8 }}>
          <option value="">{lang === 'en' ? 'Select Item' : 'Seleccionar Artículo'}</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.model}, {item.size})
            </option>
          ))}
        </select>
        {error && <div style={{ color: 'red', fontSize: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={{ fontSize: 18, padding: '6px 16px', background: '#eee', border: 'none', borderRadius: 4 }}>{lang === 'en' ? 'Cancel' : 'Cancelar'}</button>
          <button type="submit" style={{ fontSize: 18, padding: '6px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4 }}>{lang === 'en' ? 'Save' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

export default function OrderPage({ lang, setLang }) {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    fetch(API_URL, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      });
  };
  const fetchInventory = () => {
    fetch(getApiUrl(API_ENDPOINTS.INVENTORY), { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => setInventory(data.inventory || []));
  };

  useEffect(() => {
    fetchOrders();
    fetchInventory();
  }, []);

  const markAsPaid = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/${orderId}/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount: 100, status: 'completed' }), // mock payment
      });
      fetchOrders();
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      {/* Responsive and focus styles */}
      <style>{`
        @media (max-width: 600px) {
          .orders-table-wrapper { overflow-x: auto; }
          .orders-table { min-width: 600px; }
        }
        button:focus { outline: 3px solid #1976d2 !important; box-shadow: 0 0 0 2px #90caf9; }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>{lang === 'en' ? 'Orders' : 'Pedidos'}</h1>
      </div>
      <button onClick={() => setShowAdd(true)} style={{ fontSize: 20, padding: '12px 24px', marginBottom: 16, background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, minWidth: 120 }}>
        + {lang === 'en' ? 'Add Order' : 'Agregar Pedido'}
      </button>
      <AddOrderModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={fetchOrders} lang={lang} inventory={inventory} />
      {loading ? (
        <div style={{ fontSize: 20 }}>{lang === 'en' ? 'Loading...' : 'Cargando...'}</div>
      ) : (
        <div className="orders-table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
          <table className="orders-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 20 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: 12 }}>{lang === 'en' ? 'Customer' : 'Cliente'}</th>
                <th style={{ padding: 12 }}>{lang === 'en' ? 'Item' : 'Artículo'}</th>
                <th style={{ padding: 12 }}>{lang === 'en' ? 'Status' : 'Estado'}</th>
                <th style={{ padding: 12 }}>{lang === 'en' ? 'Payment' : 'Pago'}</th>
                <th style={{ padding: 12 }}>{lang === 'en' ? 'Actions' : 'Acciones'}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ background: order.paymentStatus !== 'paid' ? '#ffeaea' : 'white' }}>
                  <td style={{ padding: 12 }}>{order.customerName}</td>
                  <td style={{ padding: 12 }}>{order.inventoryItem?.name || ''}</td>
                  <td style={{ padding: 12 }}>{order.status}</td>
                  <td style={{ padding: 12 }}>
                    {order.paymentStatus === 'paid'
                      ? (lang === 'en' ? 'Paid' : 'Pagado')
                      : (lang === 'en' ? 'Unpaid' : 'No Pagado')}
                  </td>
                  <td style={{ padding: 12, display: 'flex', gap: 12 }}>
                    {order.paymentStatus !== 'paid' && (
                      <button onClick={() => markAsPaid(order.id)} style={{ fontSize: 18, padding: '10px 18px', background: '#43a047', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 4, minWidth: 120 }}>
                        {lang === 'en' ? 'Mark as Paid' : 'Marcar como Pagado'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 