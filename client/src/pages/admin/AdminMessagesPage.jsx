import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaEnvelope, FaEnvelopeOpen, FaInbox, FaPaperPlane, FaTimes, FaEdit, FaCheckSquare } from 'react-icons/fa';
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
  const [editingReply, setEditingReply] = useState(null); // { msgId, replyId, text, subject }

  // Bulk selection state
  const [selectedForDelete, setSelectedForDelete] = useState([]);

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
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [isInnerBulkDelete, setIsInnerBulkDelete] = useState(false);
  const [selectedInnerForDelete, setSelectedInnerForDelete] = useState([]);

  const triggerDelete = (email) => {
    setDeleteEmail(email);
    setIsBulkDelete(false);
    setIsInnerBulkDelete(false);
    setShowConfirm(true);
  };

  const triggerBulkDelete = () => {
    if (selectedForDelete.length === 0) return;
    setIsBulkDelete(true);
    setIsInnerBulkDelete(false);
    setShowConfirm(true);
  };

  const triggerInnerBulkDelete = () => {
    if (selectedInnerForDelete.length === 0) return;
    setIsInnerBulkDelete(true);
    setIsBulkDelete(false);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (isInnerBulkDelete) {
      try {
        const userIds = selectedInnerForDelete.filter(id => selectedGroup?.chat.find(c => c._id === id)?.type === 'user');
        const adminItems = selectedInnerForDelete.map(id => selectedGroup?.chat.find(c => c._id === id)).filter(c => c?.type === 'admin');

        await Promise.all([
          ...userIds.map(id => contactAPI.delete(id)),
          ...adminItems.map(item => contactAPI.deleteReply(item.msgId, item._id))
        ]);
        
        toast.success(`${selectedInnerForDelete.length} message(s) deleted`);
        
        setMessages(msgs => {
          let updated = msgs.filter(m => !userIds.includes(m._id));
          updated = updated.map(m => ({
            ...m,
            replies: m.replies ? m.replies.filter(r => !adminItems.find(a => a._id === r._id)) : []
          }));
          return updated;
        });
        
        setSelectedInnerForDelete([]);
      } catch { toast.error('Failed to delete messages'); }
      finally { setShowConfirm(false); setIsInnerBulkDelete(false); }
    } else if (isBulkDelete) {
      // Bulk delete logic
      try {
        const allIdsToDelete = [];
        selectedForDelete.forEach(email => {
          const group = groupedGroups.find(g => g.email === email);
          if (group) allIdsToDelete.push(...group.ids);
        });

        await Promise.all(allIdsToDelete.map(id => contactAPI.delete(id)));
        toast.success(`${selectedForDelete.length} chat(s) deleted`);
        
        setMessages(msgs => msgs.filter(m => !selectedForDelete.includes(m.email)));
        if (selectedForDelete.includes(selectedEmail)) setSelectedEmail(null);
        setSelectedForDelete([]);
      } catch { toast.error('Failed to delete chats'); }
      finally { setShowConfirm(false); setIsBulkDelete(false); }
    } else {
      // Single delete logic
      if (!deleteEmail) return;
      const groupToDelete = groupedGroups.find(g => g.email === deleteEmail);
      if (!groupToDelete) return;

      try {
        await Promise.all(groupToDelete.ids.map(id => contactAPI.delete(id)));
        toast.success('Chat deleted');
        setMessages((msgs) => msgs.filter((m) => m.email !== deleteEmail));
        if (selectedEmail === deleteEmail) setSelectedEmail(null);
        setSelectedForDelete(prev => prev.filter(e => e !== deleteEmail));
      } catch { toast.error('Failed to delete chat'); }
      finally { setShowConfirm(false); setDeleteEmail(null); }
    }
  };

  const toggleSelectForDelete = (email, e) => {
    e.stopPropagation();
    if (selectedForDelete.includes(email)) {
      setSelectedForDelete(prev => prev.filter(item => item !== email));
    } else {
      setSelectedForDelete(prev => [...prev, email]);
    }
  };

  const toggleInnerSelect = (id) => {
    if (selectedInnerForDelete.includes(id)) {
      setSelectedInnerForDelete(prev => prev.filter(item => item !== id));
    } else {
      setSelectedInnerForDelete(prev => [...prev, id]);
    }
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
    setSelectedInnerForDelete([]);
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
        const res = await contactAPI.editReply(editingReply.msgId, editingReply.replyId, { message: replyText, subject: editingReply.subject });
        toast.success('Reply updated and email resent!');
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
    // Find the latest subject for this group to pass to the backend
    const userMessages = groupedGroups.find(g => g.email === selectedEmail)?.chat.filter(c => c.type === 'user') || [];
    const latestSubject = userMessages[userMessages.length - 1]?.subject || 'Contact Message';

    setEditingReply({ msgId: reply.msgId, replyId: reply._id, subject: latestSubject });
    setReplyText(reply.message);
  };

  const cancelEdit = () => {
    setEditingReply(null);
    setReplyText('');
  };

  const unreadCount = groupedGroups.filter((g) => !g.isRead).length;

  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedGroup?.chat]);

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4">
        <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
            {unreadCount > 0 && (
              <p className="text-green-400 text-sm mt-1">{unreadCount} unread chat{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
          <div className="flex gap-2">
            {selectedForDelete.length > 0 && (
              <button 
                onClick={triggerBulkDelete}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2 mr-4"
              >
                <FaTrash size={12} /> Delete Selected ({selectedForDelete.length})
              </button>
            )}
            {['all', 'unread', 'read'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-green-400 text-dark-950' : 'bg-dark-800 text-dark-400 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[700px]">
        {/* Message list */}
        <div className="lg:col-span-2 glass-card overflow-y-auto scrollbar-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : filteredGroups.length === 0 ? (
            <EmptyState message="No chats found" icon={FaInbox} />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {filteredGroups.map((group) => (
                <div 
                  key={group.email} 
                  className={`flex items-start gap-3 p-4 rounded-xl transition-colors border cursor-pointer ${selectedEmail === group.email ? 'bg-dark-800/80 border-green-400/50 shadow-glass' : 'border-transparent hover:bg-dark-800/50'}`}
                  onClick={() => handleSelect(group)}
                >
                  <button 
                    onClick={(e) => toggleSelectForDelete(group.email, e)}
                    className="mt-1 flex-shrink-0 text-dark-400 hover:text-white transition-colors"
                  >
                    {selectedForDelete.includes(group.email) ? (
                      <FaCheckSquare className="text-green-400" size={16} />
                    ) : (
                      <div className="w-4 h-4 border border-dark-600 rounded-sm" />
                    )}
                  </button>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${group.isRead ? 'bg-dark-600' : 'bg-green-400'}`} />
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
              ))}
            </div>
          )}
        </div>

        {/* Message detail (Chat UI) */}
        <div className="lg:col-span-3 glass-card flex flex-col overflow-hidden bg-dark-950">
          {selectedGroup ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-dark-900 border-b border-dark-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {selectedGroup.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-base">{selectedGroup.name}</h2>
                    <a href={`mailto:${selectedGroup.email}`} className="text-green-400 hover:underline text-sm">{selectedGroup.email}</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedInnerForDelete.length > 0 && (
                    <button onClick={triggerInnerBulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center gap-2 mr-2">
                      <FaTrash size={12} /> Delete Selected ({selectedInnerForDelete.length})
                    </button>
                  )}
                  <button onClick={() => triggerDelete(selectedGroup.email)} className="p-3 text-dark-400 hover:text-red-400 rounded-lg hover:bg-dark-800 transition-colors" title="Delete Entire Chat">
                    <FaTrash size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-950/50 scrollbar-hidden">
                {selectedGroup.chat.map((item, index) => (
                  <div key={item._id || index} className={`flex ${item.type === 'user' ? 'justify-start' : 'justify-end'} group items-center gap-3`}>
                    
                    {item.type === 'user' && (
                      <button 
                        onClick={() => toggleInnerSelect(item._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-400 hover:text-white"
                      >
                        {selectedInnerForDelete.includes(item._id) ? (
                          <FaCheckSquare className="text-green-400" size={16} />
                        ) : (
                          <div className="w-4 h-4 border border-dark-600 rounded-sm" />
                        )}
                      </button>
                    )}

                    {item.type === 'user' ? (
                      <div className="max-w-[85%] bg-dark-800 border border-dark-700 rounded-2xl rounded-tl-sm p-6 shadow-sm">
                        <div className="text-green-400 text-sm font-bold mb-3 border-b border-dark-700 pb-2 break-words break-all">{item.subject}</div>
                        <p className="text-dark-200 text-base leading-relaxed whitespace-pre-wrap break-words break-all">{item.message}</p>
                        <p className="text-dark-500 text-xs mt-4 text-right">{formatDateTime(item.sentAt)}</p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] flex flex-col items-end relative">
                        <div className="absolute -top-4 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-dark-900 border border-dark-700 rounded-lg shadow-lg overflow-hidden z-10">
                          <button onClick={() => startEditReply(item)} className="p-2 text-dark-400 hover:text-white hover:bg-dark-700" title="Edit">
                            <FaEdit size={12} />
                          </button>
                          <button onClick={() => handleDeleteReply(item.msgId, item._id)} className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-700" title="Delete">
                            <FaTrash size={12} />
                          </button>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl rounded-tr-sm p-6 shadow-sm relative">
                          <div className="text-green-400 text-sm font-bold mb-3 border-b border-green-500/20 pb-2">Admin</div>
                          <p className="text-green-50 text-base leading-relaxed whitespace-pre-wrap break-words break-all">{item.message}</p>
                          <p className="text-green-500/60 text-xs mt-4 text-right">{formatDateTime(item.sentAt)}</p>
                        </div>
                      </div>
                    )}

                    {item.type === 'admin' && (
                      <button 
                        onClick={() => toggleInnerSelect(item._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-dark-400 hover:text-white"
                      >
                        {selectedInnerForDelete.includes(item._id) ? (
                          <FaCheckSquare className="text-green-400" size={16} />
                        ) : (
                          <div className="w-4 h-4 border border-dark-600 rounded-sm" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} className="pb-4" />
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-dark-900 border-t border-dark-800 shrink-0">
                {editingReply && (
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-sm text-green-400 font-medium">Editing reply...</span>
                    <button onClick={cancelEdit} className="text-dark-400 hover:text-white text-sm flex items-center gap-1">
                      <FaTimes /> Cancel
                    </button>
                  </div>
                )}
                <div className="flex gap-3">
                  <textarea
                    rows="2"
                    className="flex-1 bg-dark-800 border border-dark-700 rounded-xl px-5 py-4 text-base text-white placeholder-dark-500 focus:outline-none focus:border-green-400 resize-none"
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
                    className="w-14 h-14 rounded-full bg-green-400 text-dark-950 flex items-center justify-center hover:bg-green-300 transition-colors shrink-0 disabled:opacity-50"
                    disabled={sendingReply || !replyText.trim()}
                    title={editingReply ? "Save Edit" : "Send Reply"}
                  >
                    {sendingReply ? <Spinner size="sm" /> : <FaPaperPlane size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-dark-500">
              <FaEnvelope size={50} className="mb-4 text-dark-800" />
              <p className="text-base">Select a user to view the chat</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => { setShowConfirm(false); setIsBulkDelete(false); setIsInnerBulkDelete(false); }}
        onConfirm={handleDelete}
        title={isInnerBulkDelete ? "Delete Selected Messages" : isBulkDelete ? "Delete Selected Chats" : "Delete Chat History"}
        message={
          isInnerBulkDelete
          ? `Are you sure you want to permanently delete the ${selectedInnerForDelete.length} selected message(s)? This action cannot be undone.`
          : isBulkDelete 
          ? `Are you sure you want to permanently delete the ${selectedForDelete.length} selected chat(s)? This action cannot be undone.` 
          : "Are you sure to permanently delete all messages with this user? This action cannot be undone."
        }
      />
    </div>
  );
};

export default AdminMessagesPage;
