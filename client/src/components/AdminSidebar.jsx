import { NavLink } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <NavLink to="/admin">Dashboard</NavLink>
      <NavLink to="/admin/papers">Paper Manager</NavLink>
      <NavLink to="/admin/users">User Manager</NavLink>
    </aside>
  );
}
