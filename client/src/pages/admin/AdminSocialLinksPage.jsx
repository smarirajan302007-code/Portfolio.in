import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { socialLinksAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import { SOCIAL_PLATFORMS } from '../../utils/constants';
import toast from 'react-hot-toast';

const defaultForm = { platform: 'GitHub', url: '', username: '', isCodingProfile: false, isVisible: true, order: 0 };

const LinkForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || defaultForm);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsedValue = type === 'checkbox' ? checked : value;
    if (type === 'number') {
      parsedValue = Math.max(0, parseInt(value) || 0);
    }
    setForm({ ...form, [name]: parsedValue });
  };
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...form, isCodingProfile: false }); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Platform *</label>
          <select name="platform" value={form.platform} onChange={handleChange} className="input-field text-sm">
            {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Username</label>
          <input name="username" value={form.username} onChange={handleChange} className="input-field text-sm" placeholder="@yourusername" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-dark-400 text-xs mb-1.5">URL *</label>
          <input name="url" value={form.url} onChange={handleChange} className="input-field text-sm" placeholder="https://github.com/yourusername" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Display Order</label>
          <input name="order" type="number" min="0" value={form.order} onChange={handleChange} className="input-field text-sm" />
        </div>
        <div className="flex items-center gap-4 pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleChange} className="accent-green-400" />
            <span className="text-dark-300 text-sm">Visible</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary text-sm gap-2">{loading ? <Spinner size="sm" /> : <FaSave size={13} />} Save</button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm"><FaTimes size={13} /> Cancel</button>
      </div>
    </form>
  );
};

const AdminSocialLinksPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editLink, setEditLink] = useState(null);

  const fetch = () => { setLoading(true); socialLinksAPI.getAllAdmin().then((r) => setLinks(r.data.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleCreate = async (form) => { setSaving(true); try { await socialLinksAPI.create(form); toast.success('Link created!'); setShowForm(false); fetch(); } catch { toast.error('Failed'); } finally { setSaving(false); } };
  const handleUpdate = async (form) => { setSaving(true); try { await socialLinksAPI.update(editLink._id, form); toast.success('Updated!'); setEditLink(null); fetch(); } catch { toast.error('Failed'); } finally { setSaving(false); } };
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await socialLinksAPI.delete(deleteId);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Failed'); }
  };

  const social = links.filter((l) => !l.isCodingProfile);

  const renderSection = (title, items) => (
    <div className="mb-8">
      <h3 className="text-white font-semibold mb-4 px-2">{title}</h3>
      {items.length === 0 ? (
        <div className="glass-card p-10 text-center text-dark-500 text-sm">None added yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((link) => (
            <div key={link._id} className="glass-card">
              {editLink?._id === link._id ? (
                <div className="p-5">
                  <LinkForm initial={link} onSave={handleUpdate} onCancel={() => setEditLink(null)} loading={saving} />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-10">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-dark-200 text-sm font-medium">{link.platform}</p>
                      {!link.isVisible && <FaEyeSlash className="text-dark-500" size={11} />}
                    </div>
                    {link.username && <p className="text-dark-500 text-xs">@{link.username}</p>}
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-green-400 text-xs hover:underline truncate block max-w-xs">{link.url}</a>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditLink(link)} className="p-2 text-dark-500 hover:text-green-400 rounded-lg hover:bg-dark-700 transition-colors"><FaEdit size={13} /></button>
                    <button onClick={() => triggerDelete(link._id)} className="p-2 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700 transition-colors"><FaTrash size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Social Profiles</h1>
        <button onClick={() => { setShowForm(true); setEditLink(null); }} className="btn-primary text-sm gap-2"><FaPlus size={12} /> Add Link</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-10">
            <h3 className="text-white font-semibold mb-4">Add Social Link</h3>
            <LinkForm onSave={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> : (
        <div className="flex flex-col gap-8">
          {renderSection('Social Profiles', social)}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Social Link"
        message="Are you sure to permanently delete this social link? This action cannot be undone."
      />
    </div>
  );
};

export default AdminSocialLinksPage;
