import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaHistory, FaUser, FaProjectDiagram, FaCode,
  FaCertificate, FaGraduationCap, FaShareAlt, FaCog, FaTrash, FaTimes
} from 'react-icons/fa';
import { historyAPI } from '../../services/api';
import { formatDateTime } from '../../utils/constants';
import { PageLoader } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminHistoryPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [clearing, setClearing] = useState(false);

  const fetchLogs = () => {
    historyAPI.getLogs()
      .then((res) => {
        setLogs(res.data.data || []);
      })
      .catch(() => {
        toast.error('Failed to load editing history');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearHistory = async () => {
    if (pin !== '2007') {
      toast.error('Incorrect PIN');
      return;
    }
    setClearing(true);
    try {
      await historyAPI.clearLogs(selectedLogs.length > 0 ? selectedLogs : null);
      toast.success('History cleared successfully');
      if (selectedLogs.length > 0) {
        setLogs(logs.filter(l => !selectedLogs.includes(l._id)));
      } else {
        setLogs([]);
      }
      setShowPinModal(false);
      setPin('');
      setSelectedLogs([]);
    } catch {
      toast.error('Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map(log => log._id));
    }
  };

  const toggleSelectLog = (id) => {
    if (selectedLogs.includes(id)) {
      setSelectedLogs(selectedLogs.filter(logId => logId !== id));
    } else {
      setSelectedLogs([...selectedLogs, id]);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FaHistory className="text-green-400" />
            Editing History Log
          </h2>
          <p className="text-dark-400 text-xs mt-1">
            Full audit log of all changes made to my portfolio
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={() => setShowPinModal(true)}
            disabled={selectedLogs.length === 0}
            className="btn-outline text-sm text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaTrash size={12} /> {selectedLogs.length > 0 ? `Delete Selected (${selectedLogs.length})` : 'Select logs to delete'}
          </button>
        )}
      </div>

      <div className="glass-card p-10">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-dark-500">
            <FaHistory size={48} className="mb-4 text-dark-600 animate-pulse" />
            <h3 className="text-white font-medium mb-1">No History Recorded</h3>
            <p className="text-sm">Changes I make across the admin panel will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-4xl">
            <div className="flex items-center gap-3 p-2 bg-dark-900/60 rounded-xl border border-dark-800">
              <input
                type="checkbox"
                checked={selectedLogs.length === logs.length && logs.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded bg-dark-800 border-dark-600 text-green-500 focus:ring-green-500/50 cursor-pointer ml-3"
              />
              <span className="text-dark-300 text-sm">Select All</span>
            </div>
            {logs.map((log, index) => {
              let CatIcon = FaCog;
              if (log.category === 'Profile') CatIcon = FaUser;
              else if (log.category === 'Projects') CatIcon = FaProjectDiagram;
              else if (log.category === 'Skills') CatIcon = FaCode;
              else if (log.category === 'Certifications') CatIcon = FaCertificate;
              else if (log.category === 'Education') CatIcon = FaGraduationCap;
              else if (log.category === 'Social Links') CatIcon = FaShareAlt;

              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  className="flex items-start gap-4 p-10 rounded-2xl bg-dark-900/40 border border-dark-800/80 hover:border-dark-700/60 hover:bg-dark-800/20 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedLogs.includes(log._id)}
                    onChange={() => toggleSelectLog(log._id)}
                    className="w-4 h-4 rounded bg-dark-800 border-dark-600 text-green-500 focus:ring-green-500/50 cursor-pointer mt-3 ml-2"
                  />
                  <div className="w-10 h-10 bg-dark-800/60 rounded-xl flex items-center justify-center flex-shrink-0 text-green-400 shadow-sm border border-dark-700/30">
                    <CatIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <p className="text-white text-sm font-semibold tracking-wide">
                        {log.action}
                      </p>
                      <span className="text-dark-500 text-xs font-mono">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-dark-300 text-xs leading-relaxed bg-dark-950/30 p-2 rounded-lg border border-dark-800/30 mt-2 font-mono whitespace-pre-wrap">
                        {log.details}
                      </p>
                    )}
                    <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-400/10 text-green-400 border border-green-400/10">
                      {log.category}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-10 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-900 border border-dark-700 p-10 rounded-2xl w-full max-w-sm shadow-2xl relative"
          >
            <button
              onClick={() => { setShowPinModal(false); setPin(''); }}
              className="absolute top-4 right-4 text-dark-400 hover:text-white"
            >
              <FaTimes />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/5 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <FaTrash size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete History</h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                Enter my 4-digit security PIN to permanently delete {selectedLogs.length} selected {selectedLogs.length === 1 ? 'log' : 'logs'}.
              </p>
            </div>
            
            <div className="flex flex-col gap-5">
              <input
                type="password"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-dark-950 border-2 border-dark-600 rounded-xl px-4 py-4 text-center text-3xl tracking-[1em] font-mono text-white focus:outline-none focus:border-red-500/50 shadow-inner transition-colors"
                placeholder="****"
                autoFocus
              />
              <button
                onClick={handleClearHistory}
                disabled={pin.length !== 4 || clearing}
                className="w-full py-3.5 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)] disabled:bg-dark-700 disabled:text-dark-500 disabled:shadow-none transition-all duration-200 flex justify-center items-center gap-2"
              >
                {clearing ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminHistoryPage;
