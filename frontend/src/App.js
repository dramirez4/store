import React, { useState } from 'react';
import InventoryPage from './InventoryPage';
import LoginPage from './LoginPage';

function App() {
  const [lang, setLang] = useState('en');
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'));

  const handleLogin = () => setAuthed(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthed(false);
  };

  return authed ? (
    <div>
      <button onClick={handleLogout} style={{ position: 'absolute', top: 16, right: 16, fontSize: 16, padding: '6px 12px', zIndex: 2000 }}>
        {lang === 'en' ? 'Logout' : 'Cerrar sesión'}
      </button>
      <InventoryPage lang={lang} setLang={setLang} />
    </div>
  ) : (
    <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} />
  );
}

export default App;
