import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaProjectDiagram, FaCode, FaCertificate, FaEnvelope, FaEye,
  FaArrowRight, FaUser, FaCog, FaTrash, FaGraduationCap, FaShareAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contactAPI, profileAPI } from '../../services/api';
import { Spinner, BackButton } from '../../components/ui/shared';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, to, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-10"
  >
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <p className="text-dark-400 text-xs mb-0.5">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
      {to && (
        <Link to={to} className="text-dark-500 hover:text-green-400 transition-colors">
          <FaArrowRight size={14} />
        </Link>
      )}
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { admin } = useAuth();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await contactAPI.getStats();
      return res.data.data;
    },
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['unreadMessages'],
    queryFn: async () => {
      const res = await contactAPI.getAll({ isRead: false });
      return res.data.data.slice(0, 5);
    },
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      try {
        const res = await profileAPI.get();
        return res.data.data;
      } catch (err) {
        return null;
      }
    },
  });

  const loading = statsLoading || messagesLoading || profileLoading;

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  const stats = statsData || {};
  const messages = messagesData || [];
  const profileName = profileData?.name || '';

  const statCards = [
    { icon: FaProjectDiagram, label: 'Total Projects', value: stats.projects || 0, color: 'bg-blue-500/15 text-blue-400', to: '/admin/projects', delay: 0.1 },
    { icon: FaCode, label: 'Skills', value: stats.skills || 0, color: 'bg-green-400/15 text-green-400', to: '/admin/skills', delay: 0.2 },
    { icon: FaCertificate, label: 'Certifications', value: stats.certifications || 0, color: 'bg-purple-500/15 text-purple-400', to: '/admin/certifications', delay: 0.3 },
    { icon: FaEnvelope, label: 'Unread Messages', value: stats.unreadMessages || 0, color: 'bg-orange-500/15 text-orange-400', to: '/admin/messages', delay: 0.4 },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-green-400">{profileName || 'Admin'} 👋</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">Here's what's happening with my portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <BackButton fallbackPath="/" />
          <Link to="/" target="_blank" className="btn-outline text-xs gap-2">
            <FaEye size={12} /> View Site
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-10"
      >
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Edit Profile', to: '/admin/profile', Icon: FaUser },
            { label: 'Add Project', to: '/admin/projects', Icon: FaProjectDiagram },
            { label: 'Add Skill', to: '/admin/skills', Icon: FaCode },
            { label: 'View Messages', to: '/admin/messages', Icon: FaEnvelope },
          ].map(({ label, to, Icon }) => (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-3 p-10 rounded-xl bg-dark-800/50 border border-dark-700
                         hover:border-green-400/30 hover:bg-dark-800 transition-all text-center"
            >
              <Icon className="text-green-400" size={24} />
              <span className="text-dark-300 text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Messages */}
      <div className="grid grid-cols-1 gap-6 mb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-10 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FaEnvelope className="text-orange-400" size={16} />
                Recent Unread Messages
              </h2>
              <Link to="/admin/messages" className="text-green-400 text-sm hover:underline flex items-center gap-1">
                View All <FaArrowRight size={11} />
              </Link>
            </div>

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-dark-500">
                <FaEnvelope size={32} className="mb-3 text-dark-600" />
                <p className="text-sm">No unread messages</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <Link
                    key={msg._id}
                    to="/admin/messages"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center flex-shrink-0 text-dark-300 text-xs font-bold">
                      {msg.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-dark-200 text-sm font-medium truncate">{msg.name}</p>
                        <p className="text-dark-500 text-xs whitespace-nowrap">{formatDate(msg.createdAt)}</p>
                      </div>
                      <p className="text-dark-400 text-xs truncate">{msg.subject}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-1.5" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminDashboard;
