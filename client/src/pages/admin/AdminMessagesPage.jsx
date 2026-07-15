import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEnvelope, FaEnvelopeOpen, FaInbox, FaPaperPlane, FaTimes, FaEdit } from 'react-icons/fa';
import { contactAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import { formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';
import { decryptMessage } from '../../utils/encryption';

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState('all');

  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [editingReply, setEditingReply] = useState(null); // { msgId, replyId, text }

  const fetchMessages = () => {
    setLoading(true);
    contactAPI.getAll({})
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
  useEffect(fetchMessages, []);

  // Group messages by email
  const groupedGroups = Object.values(messages.reduce((acc, msg) => {
    if (!acc[msg.email]) {
      acc[msg.email] = {
        email: msg.email,
        name: msg.name,
        isRead: msg.isRead,
        createdAt: msg.createdAt, // latest
        ids: [msg._id],
        chat: []
      };
    } else {
      acc[msg.email].ids.push(msg._id);
      if (!msg.isRead) acc[msg.email].isRead = false;
      if (new Date(msg.createdAt) > new Date(acc[msg.email].createdAt)) {
        acc[msg.email].createdAt = msg.createdAt;
      }
    }

    acc[msg.email].chat.push({
      _id: msg._id, // used for marking read
      msgId: msg._id,
      type: 'user',
      subject: msg.subject,
      message: msg.message,
      sentAt: msg.createdAt
    });

    if (msg.replies) {
      msg.replies.forEach(reply => {
        acc[msg.email].chat.push({
          _id: reply._id,
          msgId: msg._id,
          type: 'admin',
          message: reply.message,
          sentAt: reply.sentAt
        });
      });
    }
    return acc;
  }, {}));

  groupedGroups.forEach(g => g.chat.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)));
  groupedGroups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredGroups = groupedGroups.filter(g => {
    if (filter === 'unread') return !g.isRead;
    if (filter === 'read') return g.isRead;
    return true;
  });

  const selectedGroup = groupedGroups.find(g => g.email === selectedEmail) || null;

  const handleMarkRead = async (group) => {
    const unreadIds = messages.filter(m => m.email === group.email && !m.isRead).map(m => m._id);
    if (unreadIds.length === 0) return;
    try {
      await Promise.all(unreadIds.map(id => contactAPI.markRead(id)));
      setMessages((msgs) => msgs.map((m) => unreadIds.includes(m._id) ? { ...m, isRead: true } : m));
    } catch { toast.error('Failed to mark as read'); }
  };

  const [deleteEmail, setDeleteEmail] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDelete = (email) => {
    setDeleteEmail(email);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteEmail) return;
    const groupToDelete = groupedGroups.find(g => g.email === deleteEmail);
    if (!groupToDelete) return;

    try {
      await Promise.all(groupToDelete.ids.map(id => contactAPI.delete(id)));
      toast.success('Chat deleted');
      setMessages((msgs) => msgs.filter((m) => m.email !== deleteEmail));
      if (selectedEmail === deleteEmail) setSelectedEmail(null);
    } catch { toast.error('Failed to delete chat'); }
    finally { setShowConfirm(false); setDeleteEmail(null); }
  };

  const handleDeleteReply = async (msgId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await contactAPI.deleteReply(msgId, replyId);
      toast.success('Reply deleted');
      setMessages(msgs => msgs.map(m => {
        if (m._id === msgId) {
          return { ...m, replies: m.replies.filter(r => r._id !== replyId) };
        }
        return m;
      }));
    } catch { toast.error('Failed to delete reply'); }
  };

  const handleSelect = (group) => {
    setSelectedEmail(group.email);
    setEditingReply(null);
    setReplyText('');
    handleMarkRead(group);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply message cannot be empty');
      return;
    }
    
    setSendingReply(true);
    try {
      if (editingReply) {
        // Edit Mode
        const res = await contactAPI.editReply(editingReply.msgId, editingReply.replyId, { message: replyText });
        toast.success('Reply updated!');
        setMessages(msgs => msgs.map(m => {
          if (m._id === editingReply.msgId) {
            return {
              ...m,
              replies: m.replies.map(r => r._id === editingReply.replyId ? res.data.reply : r)
            };
          }
          return m;
        }));
        setEditingReply(null);
      } else {
        // Send New Mode
        // We attach the reply to the most recent user message id
        const userMessages = selectedGroup.chat.filter(c => c.type === 'user');
        const latestMsgId = userMessages[userMessages.length - 1].msgId;
        const latestSubject = userMessages[userMessages.length - 1].subject;

        const res = await contactAPI.reply(latestMsgId, { 
          message: replyText,
          subject: latestSubject
        });
        toast.success('Reply sent successfully via email!');
        
        const newReply = res.data.reply;
        setMessages(msgs => msgs.map(m => {
          if (m._id === latestMsgId) {
            return { ...m, replies: [...(m.replies || []), newReply] };
          }
          return m;
        }));
      }
      setReplyText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reply');
    } finally {
      setSendingReply(false);
    }
  };

  const startEditReply = (reply) => {
    setEditingReply({ msgId: reply.msgId, replyId: reply._id });
    setReplyText(reply.message);
  };

  const cancelEdit = () => {
    setEditingReply(null);
    setReplyText('');
  };

  const unreadCount = groupedGroups.filter((g) => !g.isRead).length;

  return (
    <div className="space-y-4 max-w-5xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="text-green-400 text-sm mt-1">{unreadCount} unread chat{unreadCount > 1 ? 's' : ''}</p>
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
          ) : filteredGroups.length === 0 ? (
            <EmptyState message="No chats found" icon={FaInbox} />
          ) : (
            <div className="flex flex-col gap-2 p-2">
              {filteredGroups.map((group) => (
                <button
                  key={group.email}
                  onClick={() => handleSelect(group)}
                  className={`w-full text-left p-4 rounded-xl hover:bg-dark-800/50 transition-colors border ${selectedEmail === group.email ? 'bg-dark-800/80 border-green-400/50 shadow-glass' : 'border-transparent'}`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${group.isRead ? 'bg-dark-600' : 'bg-green-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium truncate ${group.isRead ? 'text-dark-300' : 'text-white'}`}>{group.name}</p>
                        <p className="text-dark-500 text-[10px] whitespace-nowrap">{formatDateTime(group.createdAt)}</p>
                      </div>
                      <p className="text-dark-400 text-xs truncate">{group.email}</p>
                      <p className="text-dark-600 text-xs truncate mt-0.5">
                        {group.chat[group.chat.length - 1]?.message?.slice(0, 50)}...
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message detail (Chat UI) */}
        <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden bg-dark-950">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-dark-900 border-b border-dark-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {selectedGroup.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm">{selectedGroup.name}</h2>
                    <a href={`mailto:${selectedGroup.email}`} className="text-green-400 hover:underline text-xs">{selectedGroup.email}</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => triggerDelete(selectedGroup.email)} className="p-2 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-800 transition-colors" title="Delete Chat">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-950/50 scrollbar-hidden">
                {selectedGroup.chat.map((item, index) => (
                  <div key={item._id || index} className={`flex ${item.type === 'user' ? 'justify-start' : 'justify-end'} group`}>
                    {item.type === 'user' ? (
                      <div className="max-w-[80%] bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                        <div className="text-green-400 text-xs font-bold mb-1 border-b border-dark-700 pb-1">{item.subject}</div>
                        <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
                        <p className="text-dark-500 text-[10px] mt-2 text-right">{formatDateTime(item.sentAt)}</p>
                      </div>
                    ) : (
                      <div className="max-w-[80%] flex flex-col items-end relative">
                        <div className="absolute -top-3 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-dark-900 border border-dark-700 rounded-lg shadow-lg overflow-hidden z-10">
                          <button onClick={() => startEditReply(item)} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-700" title="Edit">
                            <FaEdit size={10} />
                          </button>
                          <button onClick={() => handleDeleteReply(item.msgId, item._id)} className="p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-700" title="Delete">
                            <FaTrash size={10} />
                          </button>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl rounded-tr-sm p-4 shadow-sm relative">
                          <div className="text-green-400 text-xs font-bold mb-1 border-b border-green-500/20 pb-1">Admin</div>
                          <p className="text-green-50 text-sm leading-relaxed whitespace-pre-wrap">{item.message}</p>
                          <p className="text-green-500/60 text-[10px] mt-2 text-right">{formatDateTime(item.sentAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-dark-900 border-t border-dark-800 shrink-0">
                {editingReply && (
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs text-green-400 font-medium">Editing reply...</span>
                    <button onClick={cancelEdit} className="text-dark-400 hover:text-white text-xs flex items-center gap-1">
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    rows="2"
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-green-400 resize-none"
                    placeholder={editingReply ? "Update your reply..." : "Type a reply to send via email..."}
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
                    title={editingReply ? "Save Edit" : "Send Reply"}
                  >
                    {sendingReply ? <Spinner size="sm" /> : <FaPaperPlane size={16} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-dark-500">
              <FaEnvelope size={40} className="mb-3 text-dark-800" />
              <p className="text-sm">Select a user to view the chat</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Chat History"
        message="Are you sure to permanently delete all messages with this user? This action cannot be undone."
      />
    </div>
  );
};

export default AdminMessagesPage;
