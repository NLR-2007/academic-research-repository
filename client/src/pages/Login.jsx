import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '', otp: '' });
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState('');
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  const trimmedIdentifier = form.identifier.trim();

  async function beginPrimaryLogin() {
    try {
      const { data } = await authApi.login({ email: trimmedIdentifier, password: form.password });
      saveSession(data.token, data.user);
      navigate('/profile');
      return true;
    } catch (err) {
      if (err.response?.status !== 401) throw err;
    }

    const { data } = await authApi.adminLogin({ username: trimmedIdentifier, password: form.password });
    setAdminId(data.adminId);
    return true;
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (!trimmedIdentifier || !form.password) {
      setError('Enter your email or admin username and password');
      return;
    }

    try {
      if (!adminId) {
        await beginPrimaryLogin();
        return;
      }

      const { data } = await authApi.verifyOtp({ adminId, otp: form.otp });
      saveSession(data.token, data.user);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-split-layout">
        <div className="auth-visual">
          <h2>{adminId ? 'Administrator Portal' : 'Academic Repository'}</h2>
          <p>Sign in to access your research workspace, upload new papers, and securely collaborate with the global academic community.</p>
        </div>
        <div className="auth-form-container">
          <div className="auth-header">
            <div>
              <p className="eyebrow dark">Secure access</p>
              <h1>{adminId ? 'Verify your access' : 'Welcome back'}</h1>
              <p className="muted">
                {adminId
                  ? 'Enter the Telegram OTP to finish sign in.'
                  : 'Sign in to continue to your research workspace.'}
              </p>
            </div>
            {!adminId && (
              <div className="auth-mode-pills" aria-hidden="true">
                <span className="auth-mode-pill active">Researcher</span>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="form-grid auth-form-grid">
            <label>
              {adminId ? 'Username' : 'Email or username'}
              <input
                value={form.identifier}
                onChange={(e) => {
                  setAdminId(null);
                  setError('');
                  setForm((current) => ({ ...current, identifier: e.target.value, otp: '' }));
                }}
                placeholder="researcher@email.com"
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                placeholder="Enter your password"
              />
            </label>

            {adminId ? (
              <label>
                Telegram OTP
                <input
                  value={form.otp}
                  onChange={(e) => setForm((current) => ({ ...current, otp: e.target.value }))}
                  placeholder="Enter the 6-digit code"
                />
              </label>
            ) : null}

            {error ? <p className="warning auth-message">{error}</p> : null}

            <button style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
              {adminId ? 'Login' : 'Continue'}
            </button>
          </form>

          <div className="auth-footer-row" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p className="auth-switch">
              New researcher? <Link to="/register" style={{ fontWeight: 'bold', color: 'var(--forest)' }}>Create your account</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
