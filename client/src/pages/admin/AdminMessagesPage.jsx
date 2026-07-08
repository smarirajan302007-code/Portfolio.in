import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEnvelope, FaEnvelopeOpen, FaInbox } from 'react-icons/fa';
import { contactAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import { formatDate } from '../../utils/constants';
import toast from 'react-hot-toast';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchMessages = () => {
    setLoading(true);
    const params = filter === 'unread' ? { isRead: false } : filter === 'read' ? { isRead: true } : {};
    contactAPI.getAll(params).then((r) => setMessages(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchMessages, [filter]);

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      setMessages((msgs) => msgs.map((m) => m._id === id ? { ...m, isRead: true } : m));
      if (selected?._id === id) setSelected((s) => ({ ...s, isRead: true }));
    } catch { toast.error('Failed to mark as read'); }
  };

  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await contactAPI.delete(deleteId);
      toast.success('Message deleted');
      setMessages((msgs) => msgs.filter((m) => m._id !== deleteId));
      if (selected?._id === deleteId) setSelected(null);
    } catch { toast.error('Failed to delete'); }
  };

  const handleSelect = (msg) => {
    setSelected(msg);
    if (!msg.isRead) handleMarkRead(msg._id);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-4 max-w-5xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="text-green-400 text-sm mt-1">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-green-400 text-dark-950' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[600px]">
        {/* Message list */}
        <div className="lg:col-span-2 glass-card overflow-y-auto scrollbar-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : messages.length === 0 ? (
            <EmptyState message="No messages found" icon={FaInbox} />
          ) : (
            <div className="flex flex-col gap-2 p-2">
              {messages.map((msg) => (
                <button
                  key={msg._id}
                  onClick={() => handleSelect(msg)}
                  className={`w-full text-left p-10 rounded-xl hover:bg-dark-800/50 transition-colors border ${selected?._id === msg._id ? 'bg-dark-800/80 border-green-400/50 shadow-glass' : 'border-transparent'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${msg.isRead ? 'bg-dark-600' : 'bg-green-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${msg.isRead ? 'text-dark-300' : 'text-white'}`}>{msg.name}</p>
                        <p className="text-dark-500 text-xs whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</p>
                      </div>
                      <p className="text-dark-400 text-xs truncate">{msg.subject}</p>
                      <p className="text-dark-600 text-xs truncate mt-0.5">{msg.message.slice(0, 60)}...</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3 glass-card overflow-y-auto">
          {selected ? (
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-white font-bold text-lg">{selected.subject}</h2>
                  <div className="flex items-center gap-3 mt-2 text-dark-400 text-sm">
                    <span className="flex items-center gap-1.5">
                      <div className="w-7 h-7 bg-dark-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {selected.name[0]?.toUpperCase()}
                      </div>
                      {selected.name}
                    </span>
                    <span>·</span>
                    <a href={`mailto:${selected.email}`} className="text-green-400 hover:underline text-xs">{selected.email}</a>
                  </div>
                  <p className="text-dark-500 text-xs mt-1">{formatDate(selected.createdAt)}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {!selected.isRead && (
                    <button onClick={() => handleMarkRead(selected._id)} className="p-2 text-dark-400 hover:text-green-400 rounded-lg hover:bg-dark-700 transition-colors" title="Mark as read">
                      <FaEnvelopeOpen size={14} />
                    </button>
                  )}
                  <button onClick={() => triggerDelete(selected._id)} className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-700 transition-colors" title="Delete">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-dark-800/50 rounded-xl p-10">
                <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="btn-primary text-sm gap-2">
                  <FaEnvelope size={12} /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-dark-500">
              <FaEnvelope size={40} className="mb-3 text-dark-700" />
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure to permanently delete this message? This action cannot be undone."
      />
    </div>
  );
};

export default AdminMessagesPage;
