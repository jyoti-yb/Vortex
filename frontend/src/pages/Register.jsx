import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const CITIES     = ['Hyderabad', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
const PLATFORMS  = ['Zomato', 'Swiggy', 'Zepto'];

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', city: 'Hyderabad', platform: 'Swiggy' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.register(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      nav('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 40, width: '100%', maxWidth: 440, color: '#f1f5f9' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>GigShield</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Parametric insurance for gig workers</p>
        </div>
        {error && <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#fca5a5', fontSize: 14 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['name', 'Full Name', 'text'], ['phone', 'Phone (10 digits)', 'tel'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([key, label, type]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 15, boxSizing: 'border-box' }} required />
            </div>
          ))}
          {[['city', 'City', CITIES], ['platform', 'Platform', PLATFORMS]].map(([key, label, opts]) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6 }}>{label}</label>
              <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', fontSize: 15 }}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: loading ? '#1d4ed8' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: '#60a5fa' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}