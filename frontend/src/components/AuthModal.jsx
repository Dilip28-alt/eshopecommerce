import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { apiUrl } from '../config';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast
}) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleQuickDemo = () => {
    setLoginEmail('demo@eshophub.com');
    setLoginPassword('password123');
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        onLoginSuccess(data.user);
        onShowToast(data.message || `Welcome, ${data.user.name}!`, 'success');
        onClose();
      } else {
        setErrorMsg(data.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName || !regEmail || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone
        })
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        onLoginSuccess(data.user);
        onShowToast(data.message || 'Account created successfully!', 'success');
        onClose();
      } else {
        setErrorMsg(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content auth-modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: 440, padding: 0 }}
      >
        <button 
          className="close-btn" 
          onClick={onClose} 
          style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)', color: 'white', padding: '2rem 2rem 1.5rem', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
            <Sparkles size={12} /> EShop Hub Account
          </div>
          <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: 4 }}>
            {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
            {mode === 'login' 
              ? 'Sign in to access your orders, cart, and wishlist' 
              : 'Join EShop Hub for seamless shopping and fast checkouts'}
          </p>

          {/* Mode Switch Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10 }}>
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              style={{
                padding: '0.5rem',
                borderRadius: 8,
                fontSize: '0.88rem',
                fontWeight: 700,
                color: mode === 'login' ? 'var(--primary)' : 'white',
                background: mode === 'login' ? 'white' : 'transparent',
                boxShadow: mode === 'login' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMsg(''); }}
              style={{
                padding: '0.5rem',
                borderRadius: 8,
                fontSize: '0.88rem',
                fontWeight: 700,
                color: mode === 'register' ? 'var(--primary)' : 'white',
                background: mode === 'register' ? 'white' : 'transparent',
                boxShadow: mode === 'register' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div style={{ padding: '1.75rem 2rem 2rem' }}>
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', color: '#991b1b', padding: '0.65rem 0.85rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 8, width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Password</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                  <Lock size={16} color="var(--text-muted)" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 8, width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Demo 1-Click Login Button */}
              <button
                type="button"
                onClick={handleQuickDemo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: '#f1f5f9',
                  color: 'var(--primary)',
                  padding: '0.45rem',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: '1px dashed #cbd5e1',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={14} /> Quick Demo Account (demo@eshophub.com)
              </button>

              <button
                type="submit"
                disabled={loading}
                className="checkout-btn"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Don't have an account?{' '}
                <span 
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create one now
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Full Name *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                  <User size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 8, width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Email Address *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                  <Mail size={16} color="var(--text-muted)" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 8, width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                  Phone Number
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                  <Phone size={16} color="var(--text-muted)" />
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 8, width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                    Password *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                    <Lock size={15} color="var(--text-muted)" />
                    <input
                      type="password"
                      placeholder="Min 6 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 6, width: '100%', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>
                    Confirm *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 8, padding: '0.55rem 0.75rem', background: '#f8fafc' }}>
                    <Lock size={15} color="var(--text-muted)" />
                    <input
                      type="password"
                      placeholder="Confirm"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: 6, width: '100%', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="checkout-btn"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <CheckCircle size={16} />
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Already have an account?{' '}
                <span 
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign in
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
