import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';

const initialForm = {
  name: '',
  email: '',
  password: '',
  institution: '',
  role: '',
  bio: '',
  scholarLinks: '',
  profileImage: ''
};

export default function Register() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const { saveSession } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        ...form,
        scholarLinks: form.scholarLinks
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean)
      };

      const { data } = await authApi.register(payload);
      saveSession(data.token, data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-split-layout">
        <div className="auth-visual">
          <h2>Join the Repository</h2>
          <p>Create a verified researcher account to upload papers, manage access requests, and build your digital academic profile.</p>
        </div>
        <div className="auth-form-container">
          <div className="auth-header" style={{ marginBottom: '2rem' }}>
            <div>
              <p className="eyebrow dark">Registration</p>
              <h1>Create your account</h1>
              <p className="muted">Build a complete academic profile now.</p>
            </div>
          </div>

          <form onSubmit={submit} className="form-grid auth-form-grid" style={{ gap: '1.5rem' }}>
            <div className="auth-form-section" style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '1.5rem', border: '1px solid var(--line)', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div className="auth-section-heading" style={{ marginBottom: '1rem' }}>
                <h2>Core details</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Required to establish your identity.</p>
              </div>
              <div className="auth-two-column">
                <label>
                  Name
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lokesh Kumar" required />
                </label>
                <label>
                  Email
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="researcher@email.com" required />
                </label>
                <label>
                  Password
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a secure password" required />
                </label>
                <label>
                  Institution
                  <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="IIT Delhi" required />
                </label>
                <label className="auth-field-wide">
                  Role
                  <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Research Scholar, Professor..." required />
                </label>
              </div>
            </div>

            <div className="auth-form-section" style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '1.5rem', border: '1px solid var(--line)', borderRadius: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div className="auth-section-heading" style={{ marginBottom: '1rem' }}>
                <h2>Optional profile power-ups</h2>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>Add these now to make your profile stronger.</p>
              </div>
              <div className="auth-two-column">
                <label className="auth-field-wide">
                  Bio
                  <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Briefly describe your research interests..." style={{ minHeight: '6rem' }} />
                </label>
                <label className="auth-field-wide">
                  Scholar links
                  <textarea value={form.scholarLinks} onChange={(e) => setForm({ ...form, scholarLinks: e.target.value })} placeholder={'One link per line\nhttps://scholar.google.com/...'} style={{ minHeight: '5rem' }} />
                </label>
                <label className="auth-field-wide">
                  Profile image
                  <input value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} placeholder="Paste an image URL" />
                </label>
              </div>
            </div>

            {error ? <p className="warning auth-message" style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem' }}>{error}</p> : null}

            <button style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}>Create account</button>
          </form>

          <div className="auth-footer-row" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p className="auth-switch">
              Already registered? <Link to="/login" style={{ fontWeight: 'bold', color: 'var(--forest)' }}>Login instead</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
