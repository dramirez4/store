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
      <button
        onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
        style={{ position: 'absolute', top: 16, right: 16, fontSize: 16, padding: '6px 14px', borderRadius: 6, border: 'none', background: '#eee', cursor: 'pointer' }}
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
          style={{ fontSize: 18, padding: 8 }}
        />
        <input
          name="password"
          type="password"
          placeholder={lang === 'en' ? 'Password' : 'Contraseña'}
          value={form.password}
          onChange={handleChange}
          style={{ fontSize: 18, padding: 8 }}
        />
        {error && <div style={{ color: 'red', fontSize: 16 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ fontSize: 20, padding: '10px 0', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6 }}>
          {loading ? (lang === 'en' ? 'Logging in...' : 'Iniciando...') : (lang === 'en' ? 'Login' : 'Entrar')}
        </button>
      </form>
    </div>
  );
} 