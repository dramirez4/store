import React, { useState } from 'react';
import InventoryPage from './InventoryPage';
import OrderPage from './OrderPage';
import LoginPage from './LoginPage';

function App() {
  const [lang, setLang] = useState('en');
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('inventory');

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
  };

  if (!authed) {
    return <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} />;
  }

  return (
    <div>
      {/* Responsive and focus styles for navbar */}
      <style>{`
        @media (max-width: 600px) {
          .navbar { flex-wrap: nowrap; overflow-x: auto; }
          .navbar-btn { min-width: 120px !important; font-size: 18px !important; }
        }
        .navbar-btn:focus { outline: 3px solid #1976d2 !important; box-shadow: 0 0 0 2px #90caf9; }
      `}</style>
      <nav className="navbar" style={{ display: 'flex', gap: 16, margin: '24px 0 24px 0', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => setPage('inventory')}
          className="navbar-btn"
          style={{ fontSize: 20, padding: '12px 28px', minWidth: 140, background: page === 'inventory' ? '#1976d2' : '#eee', color: page === 'inventory' ? 'white' : '#222', border: 'none', borderRadius: 6, fontWeight: page === 'inventory' ? 'bold' : 'normal' }}
        >
          {lang === 'en' ? 'Inventory' : 'Inventario'}
        </button>
        <button
          onClick={() => setPage('orders')}
          className="navbar-btn"
          style={{ fontSize: 20, padding: '12px 28px', minWidth: 140, background: page === 'orders' ? '#1976d2' : '#eee', color: page === 'orders' ? 'white' : '#222', border: 'none', borderRadius: 6, fontWeight: page === 'orders' ? 'bold' : 'normal' }}
        >
          {lang === 'en' ? 'Orders' : 'Pedidos'}
        </button>
        <button
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          className="navbar-btn"
          style={{ fontSize: 18, padding: '10px 20px', minWidth: 120, marginLeft: 24, background: '#eee', color: '#222', border: 'none', borderRadius: 6 }}
        >
          {lang === 'en' ? 'Español' : 'English'}
        </button>
        <button
          onClick={handleLogout}
          className="navbar-btn"
          style={{ fontSize: 18, padding: '10px 20px', minWidth: 120, marginLeft: 24, background: '#e53935', color: 'white', border: 'none', borderRadius: 6, fontWeight: 'bold' }}
        >
          {lang === 'en' ? 'Logout' : 'Cerrar sesión'}
        </button>
      </nav>
      {page === 'inventory' ? (
        <InventoryPage lang={lang} setLang={setLang} />
      ) : (
        <OrderPage lang={lang} setLang={setLang} />
      )}
    </div>
  );
}

export default App;
