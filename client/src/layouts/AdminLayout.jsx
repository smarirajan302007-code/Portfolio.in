import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome, FaUser, FaCode, FaProjectDiagram, FaGraduationCap,
  FaCertificate, FaLink, FaEnvelope, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaEye, FaKey, FaHistory, FaList, FaIdCard, FaFileAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: FaHome },
  { to: '/admin/profile', label: 'Profile', Icon: FaUser },
  { to: '/admin/about', label: 'About', Icon: FaIdCard },
  { to: '/admin/skills', label: 'Skills', Icon: FaCode },
  { to: '/admin/projects', label: 'Projects', Icon: FaProjectDiagram },
  { to: '/admin/education', label: 'Education', Icon: FaGraduationCap },
  { to: '/admin/certifications', label: 'Certifications', Icon: FaCertificate },
  { to: '/admin/coding', label: 'Coding Profiles', Icon: FaCode },
  { to: '/admin/resume', label: 'Resume', Icon: FaFileAlt },
  { to: '/admin/messages', label: 'Contact', Icon: FaEnvelope },
  { to: '/admin/social-links', label: 'Social Links', Icon: FaLink },
  { to: '/admin/footer', label: 'Footer Settings', Icon: FaList },
  { to: '/admin/settings', label: 'Settings', Icon: FaCog },
  { to: '/admin/history', label: 'History', Icon: FaHistory },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    profileAPI.get()
      .then((r) => {
        if (r.data?.data?.name) setProfileName(r.data.data.name);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 admin-sidebar-width bg-dark-900/95 backdrop-blur-xl border-r border-dark-800/50 
                    flex flex-col transition-transform duration-300 lg:translate-x-0 
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-dark-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
              <FaCode className="text-dark-950 text-sm" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Admin Panel</p>
              <p className="text-dark-500 text-xs">{profileName || 'Admin'}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-dark-400 hover:text-white"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-hidden">
          <div className="space-y-1">
            {sidebarLinks.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-dark-800/50 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <FaEye size={16} />
            <span className="text-sm">View Portfolio</span>
          </a>
          <NavLink to="/admin/change-password" className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <FaKey size={16} />
            <span className="text-sm">Change Password</span>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-400/10">
            <FaSignOutAlt size={16} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-dark-950/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 admin-content-shift flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-dark-900/90 backdrop-blur-xl border-b border-dark-800/50 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-dark-400 hover:text-white transition-colors"
          >
            <FaBars size={20} />
          </button>
          <div className="flex-1 text-dark-300 text-sm font-medium">
            Admin Dashboard
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-400 flex items-center justify-center text-dark-950 text-xs font-bold">
              {profileName?.[0] || 'A'}
            </div>
            <span className="hidden sm:block text-dark-300 text-sm">{admin?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
