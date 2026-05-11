import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Upload from './pages/Upload.jsx';
import Profile from './pages/Profile.jsx';
import PaperDetail from './pages/PaperDetail.jsx';
import AllPapers from './pages/AllPapers.jsx';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import PaperManager from './pages/Admin/PaperManager.jsx';
import UserManager from './pages/Admin/UserManager.jsx';
import About from './pages/About.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './styles.css';

function Protected({ children, admin = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="page-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<Protected><Upload /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/papers" element={<AllPapers />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
            <Route path="/admin/papers" element={<Protected admin><PaperManager /></Protected>} />
            <Route path="/admin/users" element={<Protected admin><UserManager /></Protected>} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
