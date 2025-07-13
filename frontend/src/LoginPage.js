import React, { useState } from 'react';
// import { t } from './i18n';

const API_URL = 'http://localhost:3001/api/auth/login';

export default function LoginPage({ onLogin, lang, setLang }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setError(data.error || (lang === 'en' ? 'Invalid credentials.' : 'Credenciales inválidas.'));
        setLoading(false);
        return;
      }
      localStorage.setItem('token', data.token);
      onLogin();
    } catch (err) {
      setError(lang === 'en' ? 'Network error.' : 'Error de red.');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24, background: 'white', borderRadius: 8, boxShadow: '0 2px 12px #0002', position: 'relative' }}>
      {/* Responsive and focus styles */}
      <style>{`
        @media (max-width: 500px) {
          .login-form-input, .login-form-button { font-size: 18px !important; padding: 12px !important; }
          .login-translate-btn { top: 8px !important; right: 8px !important; font-size: 15px !important; padding: 8px 12px !important; }
        }
        input:focus, button:focus { outline: 3px solid #1976d2 !important; box-shadow: 0 0 0 2px #90caf9; }
      `}</style>
      <button
        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
        className="login-translate-btn"
        style={{ position: 'absolute', top: 16, right: 16, fontSize: 16, padding: '10px 18px', borderRadius: 6, border: 'none', background: '#eee', cursor: 'pointer', minWidth: 90 }}
      >
        {lang === 'en' ? 'Español' : 'English'}
      </button>
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>{lang === 'en' ? 'Login' : 'Iniciar sesión'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input
          name="email"
          type="email"
          placeholder={lang === 'en' ? 'Email' : 'Correo electrónico'}
          value={form.email}
          onChange={handleChange}
          className="login-form-input"
          style={{ fontSize: 20, padding: 12, borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          name="password"
          type="password"
          placeholder={lang === 'en' ? 'Password' : 'Contraseña'}
          value={form.password}
          onChange={handleChange}
          className="login-form-input"
          style={{ fontSize: 20, padding: 12, borderRadius: 6, border: '1px solid #ccc' }}
        />
        {error && <div style={{ color: 'red', fontSize: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} className="login-form-button" style={{ fontSize: 22, padding: '14px 0', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, minWidth: 120 }}>
          {loading ? (lang === 'en' ? 'Logging in...' : 'Iniciando...') : (lang === 'en' ? 'Login' : 'Entrar')}
        </button>
      </form>
    </div>
  );
} 