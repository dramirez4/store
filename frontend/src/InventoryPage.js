import React, { useEffect, useState } from 'react';
import { t } from './i18n';
import './App.css';

const API_URL = 'http://localhost:3001/api/inventory';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
});

function AddItemModal({ open, onClose, onAdd, lang }) {
  const [form, setForm] = useState({ name: '', model: '', size: '', stockLevel: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.model || !form.size || form.stockLevel === '') {
      setError(lang === 'en' ? 'All fields are required.' : 'Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(Number(form.stockLevel)) || Number(form.stockLevel) < 0) {
      setError(lang === 'en' ? 'Stock must be a non-negative number.' : 'Inventario debe ser un número no negativo.');
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name,
          model: form.model,
          size: form.size,
          stockLevel: Number(form.stockLevel),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (lang === 'en' ? 'Error adding item.' : 'Error al agregar el artículo.'));
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
        <h2 style={{ margin: 0, fontSize: 24 }}>{t('add', lang)} {t('inventory', lang)}</h2>
        <input name="name" placeholder={t('name', lang)} value={form.name} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <input name="model" placeholder={t('model', lang)} value={form.model} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <input name="size" placeholder={t('size', lang)} value={form.size} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <input name="stockLevel" placeholder={t('stockLevel', lang)} value={form.stockLevel} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} type="number" min="0" />
        {error && <div style={{ color: 'red', fontSize: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={{ fontSize: 18, padding: '6px 16px', background: '#eee', border: 'none', borderRadius: 4 }}>{t('cancel', lang)}</button>
          <button type="submit" style={{ fontSize: 18, padding: '6px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4 }}>{t('save', lang)}</button>
        </div>
      </form>
    </div>
  );
}

function EditItemModal({ open, onClose, onEdit, lang, item }) {
  const [form, setForm] = useState(item || { name: '', model: '', size: '', stockLevel: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && item) {
      setForm(item);
      setError('');
    }
  }, [open, item]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.model || !form.size || form.stockLevel === '') {
      setError(lang === 'en' ? 'All fields are required.' : 'Todos los campos son obligatorios.');
      return;
    }
    if (isNaN(Number(form.stockLevel)) || Number(form.stockLevel) < 0) {
      setError(lang === 'en' ? 'Stock must be a non-negative number.' : 'Inventario debe ser un número no negativo.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${item.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: form.name,
          model: form.model,
          size: form.size,
          stockLevel: Number(form.stockLevel),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || (lang === 'en' ? 'Error updating item.' : 'Error al actualizar el artículo.'));
        return;
      }
      onEdit();
      onClose();
    } catch (err) {
      setError(lang === 'en' ? 'Network error.' : 'Error de red.');
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>{t('edit', lang)} {t('inventory', lang)}</h2>
        <input name="name" placeholder={t('name', lang)} value={form.name} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <input name="model" placeholder={t('model', lang)} value={form.model} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <input name="size" placeholder={t('size', lang)} value={form.size} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} />
        <input name="stockLevel" placeholder={t('stockLevel', lang)} value={form.stockLevel} onChange={handleChange} style={{ fontSize: 18, padding: 8 }} type="number" min="0" />
        {error && <div style={{ color: 'red', fontSize: 16 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={{ fontSize: 18, padding: '6px 16px', background: '#eee', border: 'none', borderRadius: 4 }}>{t('cancel', lang)}</button>
          <button type="submit" style={{ fontSize: 18, padding: '6px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: 4 }}>{t('save', lang)}</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDeleteModal({ open, onClose, onDelete, lang }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: 32, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 12px #0002', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 20, marginBottom: 16 }}>{t('confirmDelete', lang)}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ fontSize: 18, padding: '6px 16px', background: '#eee', border: 'none', borderRadius: 4 }}>{t('no', lang)}</button>
          <button onClick={onDelete} style={{ fontSize: 18, padding: '6px 16px', background: '#e53935', color: 'white', border: 'none', borderRadius: 4 }}>{t('yes', lang)}</button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage({ lang }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const fetchInventory = () => {
    setLoading(true);
    fetch(API_URL, {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        setInventory(data.inventory || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setShowEdit(true);
  };

  const handleDelete = (item) => {
    setDeleteItem(item);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      const res = await fetch(`${API_URL}/${deleteItem.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        // Optionally show error
      }
      fetchInventory();
      setShowDelete(false);
      setDeleteItem(null);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="inventory-page" style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      {/* Responsive and focus styles */}
      <style>{`
        @media (max-width: 600px) {
          .inventory-table-wrapper { overflow-x: auto; }
          .inventory-table { min-width: 600px; }
        }
        button:focus { outline: 3px solid #1976d2 !important; box-shadow: 0 0 0 2px #90caf9; }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>{t('inventory', lang)}</h1>
      </div>
      <button onClick={() => setShowAdd(true)} style={{ fontSize: 20, padding: '12px 24px', marginBottom: 16, background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, minWidth: 120 }}>
        + {t('addItem', lang)}
      </button>
      <AddItemModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={fetchInventory} lang={lang} />
      <EditItemModal open={showEdit} onClose={() => setShowEdit(false)} onEdit={fetchInventory} lang={lang} item={editItem} />
      <ConfirmDeleteModal open={showDelete} onClose={() => setShowDelete(false)} onDelete={confirmDelete} lang={lang} />
      {loading ? (
        <div style={{ fontSize: 20 }}>{lang === 'en' ? 'Loading...' : 'Cargando...'}</div>
      ) : (
        <div className="inventory-table-wrapper" style={{ width: '100%', overflowX: 'auto' }}>
          <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 20 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: 12 }}>{t('name', lang)}</th>
                <th style={{ padding: 12 }}>{t('model', lang)}</th>
                <th style={{ padding: 12 }}>{t('size', lang)}</th>
                <th style={{ padding: 12 }}>{t('stockLevel', lang)}</th>
                <th style={{ padding: 12 }}>{t('actions', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} style={{ background: item.stockLevel < 10 ? '#ffeaea' : 'white' }}>
                  <td style={{ padding: 12 }}>{item.name}</td>
                  <td style={{ padding: 12 }}>{item.model}</td>
                  <td style={{ padding: 12 }}>{item.size}</td>
                  <td style={{ padding: 12 }}>
                    {item.stockLevel}
                    {item.stockLevel < 10 && (
                      <span style={{ color: 'red', fontWeight: 'bold', marginLeft: 8 }}>
                        {t('lowStockWarning', lang)}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: 12, display: 'flex', gap: 12 }}>
                    <button onClick={() => handleEdit(item)} style={{ fontSize: 18, marginRight: 0, padding: '10px 18px', background: '#ffc107', color: '#222', fontWeight: 'bold', border: 'none', borderRadius: 4, minWidth: 90 }}>
                      {t('edit', lang)}
                    </button>
                    <button onClick={() => handleDelete(item)} style={{ fontSize: 18, padding: '10px 18px', background: '#e53935', color: 'white', border: 'none', borderRadius: 4, minWidth: 90 }}>
                      {t('delete', lang)}
                    </button>
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