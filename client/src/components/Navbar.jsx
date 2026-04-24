import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { adminApi } from '../api/endpoints.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (user?.role !== 'admin') return undefined;
    const load = async () => {
      const { data } = await adminApi.pendingCount();
      setPending(data.count || 0);
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <header className="nav">
      <Link className="brand" to="/">
        <span className="brand-mark">ARR</span>
        <span>Academic Repository</span>
      </Link>
      <nav>
        <NavLink to="/papers">Papers</NavLink>
        {user?.role === 'user' && <NavLink to="/upload">Upload</NavLink>}
        {user?.role === 'user' && <NavLink to="/profile">Profile</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin <span className="mini-badge">{pending}</span></NavLink>}
        {user ? (
          <button className="link-button logout-button" onClick={logout}>Log out</button>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink className="nav-cta" to="/register">Create account</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
