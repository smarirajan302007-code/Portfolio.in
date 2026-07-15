import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEnvelope, FaEnvelopeOpen, FaInbox, FaPaperPlane, FaTimes } from 'react-icons/fa';
import { contactAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import { formatDate, formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';
import { decryptMessage } from '../../utils/encryption';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    const params = filter === 'unread' ? { isRead: false } : filter === 'read' ? { isRead: true } : {};
    contactAPI.getAll(params)
      .then((r) => {
        const decryptedMsgs = r.data.data.map(m => ({
          ...m,
          subject: decryptMessage(m.subject),
          message: decryptMessage(m.message)
        }));
        setMessages(decryptedMsgs);
      })
      .finally(() => setLoading(false));
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
    setIsReplying(false);
    setReplyText('');
    if (!msg.isRead) handleMarkRead(msg._id);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }
    setSendingReply(true);
    try {
      const res = await contactAPI.reply(selected._id, { 
        message: replyText,
        subject: selected.subject
      });
      toast.success('Reply sent successfully via email!');
      
      // Immediately update local state to show the new reply bubble
      const newReply = res.data.reply;
      const updatedMessages = messages.map(m => {
        if (m._id === selected._id) {
          return { ...m, replies: [...(m.replies || []), newReply] };
        }
        return m;
      });
      setMessages(updatedMessages);
      setSelected({ ...selected, replies: [...(selected.replies || []), newReply] });
      
      setReplyText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
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
                  className={`w-full text-left p-4 rounded-xl hover:bg-dark-800/50 transition-colors border ${selected?._id === msg._id ? 'bg-dark-800/80 border-green-400/50 shadow-glass' : 'border-transparent'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${msg.isRead ? 'bg-dark-600' : 'bg-green-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${msg.isRead ? 'text-dark-300' : 'text-white'}`}>{msg.name}</p>
                        <p className="text-dark-500 text-[10px] whitespace-nowrap">{formatDateTime(msg.createdAt)}</p>
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

        {/* Message detail (Chat UI) */}
        <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden bg-dark-950">
          {selected ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-dark-900 border-b border-dark-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {selected.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-green-400 hover:underline text-xs">{selected.email}</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!selected.isRead && (
                    <button onClick={() => handleMarkRead(selected._id)} className="p-2 text-dark-400 hover:text-green-400 rounded-lg hover:bg-dark-800 transition-colors" title="Mark as read">
                      <FaEnvelopeOpen size={14} />
                    </button>
                  )}
                  <button onClick={() => triggerDelete(selected._id)} className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-800 transition-colors" title="Delete">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-950/50 scrollbar-hidden">
                {/* Initial User Message */}
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                    <div className="text-green-400 text-xs font-bold mb-1 border-b border-dark-700 pb-1">{selected.subject}</div>
                    <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                    <p className="text-dark-500 text-[10px] mt-2 text-right">{formatDateTime(selected.createdAt)}</p>
                  </div>
                </div>

                {/* Replies */}
                {selected.replies?.map((reply, index) => (
                  <div key={index} className="flex justify-end">
                    <div className="max-w-[80%] bg-green-500/10 border border-green-500/20 rounded-2xl rounded-tr-sm p-4 shadow-sm">
                      <p className="text-green-50 text-sm leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                      <p className="text-green-500/60 text-[10px] mt-2 text-right">{formatDateTime(reply.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-dark-900 border-t border-dark-800 shrink-0">
                <div className="flex gap-2">
                  <textarea
                    rows="2"
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-green-400 resize-none"
                    placeholder="Type a reply to send via email..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={sendingReply}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button 
                    onClick={handleSendReply} 
                    className="w-12 h-12 rounded-full bg-green-400 text-dark-950 flex items-center justify-center hover:bg-green-300 transition-colors shrink-0 disabled:opacity-50"
                    disabled={sendingReply || !replyText.trim()}
                    title="Send Reply"
                  >
                    {sendingReply ? <Spinner size="sm" /> : <FaPaperPlane size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-dark-500">
              <FaEnvelope size={40} className="mb-3 text-dark-800" />
              <p className="text-sm">Select a message to view the chat</p>
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
