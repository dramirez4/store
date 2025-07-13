import React, { useEffect, useState } from 'react';
import { t } from './i18n';
import './App.css';

const API_URL = 'http://localhost:3001/api/inventory';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL, {
      headers: {
        // TODO: Add Authorization header with JWT for real app
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setInventory(data.inventory || []);
        setLoading(false);
      });
  }, []);

  const handleLangToggle = () => {
    setLang((prev) => (prev === 'en' ? 'es' : 'en'));
  };

  return (
    <div className="inventory-page" style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32 }}>{t('inventory', lang)}</h1>
        <button onClick={handleLangToggle} style={{ fontSize: 18, padding: '8px 16px' }}>
          {lang === 'en' ? 'Español' : 'English'}
        </button>
      </div>
      <button style={{ fontSize: 20, padding: '12px 24px', marginBottom: 16, background: '#1976d2', color: 'white', border: 'none', borderRadius: 6 }}>
        + {t('addItem', lang)}
      </button>
      {loading ? (
        <div style={{ fontSize: 20 }}>{lang === 'en' ? 'Loading...' : 'Cargando...'}</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 20 }}>
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
                <td style={{ padding: 12 }}>
                  <button style={{ fontSize: 18, marginRight: 8, padding: '6px 14px', background: '#ffc107', border: 'none', borderRadius: 4 }}>
                    {t('edit', lang)}
                  </button>
                  <button style={{ fontSize: 18, padding: '6px 14px', background: '#e53935', color: 'white', border: 'none', borderRadius: 4 }}>
                    {t('delete', lang)}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 