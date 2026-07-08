import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaUpload } from 'react-icons/fa';
import { certificationsAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const defaultForm = { title: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', skills: '' };

const CertForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial ? { ...initial, skills: (initial.skills || []).join(', ') } : defaultForm);
  const [imageFile, setImageFile] = useState(null);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('image', imageFile);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} className="input-field text-sm" placeholder="AWS Certified Developer" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Issuer *</label>
          <input name="issuer" value={form.issuer} onChange={handleChange} className="input-field text-sm" placeholder="Amazon Web Services" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Issue Date</label>
          <input name="issueDate" value={form.issueDate} onChange={handleChange} className="input-field text-sm" placeholder="2024-03" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Expiry Date</label>
          <input name="expiryDate" value={form.expiryDate} onChange={handleChange} className="input-field text-sm" placeholder="2027-03 or leave blank" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Credential URL</label>
          <input name="credentialUrl" value={form.credentialUrl} onChange={handleChange} className="input-field text-sm" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Skills (comma-separated)</label>
          <input name="skills" value={form.skills} onChange={handleChange} className="input-field text-sm" placeholder="AWS, Lambda, S3" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Certificate Image</label>
          <label className="btn-outline text-xs gap-2 cursor-pointer">
            <FaUpload size={11} /> {imageFile ? imageFile.name : 'Choose Image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          {initial?.image?.url && !imageFile && (
            <img src={initial.image.url} alt="cert" className="mt-2 h-16 rounded object-cover" />
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary text-sm gap-2">{loading ? <Spinner size="sm" /> : <FaSave size={13} />} Save</button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm"><FaTimes size={13} /> Cancel</button>
      </div>
    </form>
  );
};

const AdminCertificationsPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editCert, setEditCert] = useState(null);

  const fetch = () => { setLoading(true); certificationsAPI.getAll().then((r) => setCerts(r.data.data)).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleCreate = async (fd) => { setSaving(true); try { await certificationsAPI.create(fd); toast.success('Created!'); setShowForm(false); fetch(); } catch { toast.error('Failed'); } finally { setSaving(false); } };
  const handleUpdate = async (fd) => { setSaving(true); try { await certificationsAPI.update(editCert._id, fd); toast.success('Updated!'); setEditCert(null); fetch(); } catch { toast.error('Failed'); } finally { setSaving(false); } };
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const triggerDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await certificationsAPI.delete(deleteId);
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Certifications Management</h1>
        <button onClick={() => { setShowForm(true); setEditCert(null); }} className="btn-primary text-sm gap-2"><FaPlus size={12} /> Add</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-10">
            <h3 className="text-white font-semibold mb-4">Add Certification</h3>
            <CertForm onSave={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        : certs.length === 0 ? <EmptyState message="No certifications yet." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certs.map((cert) => (
              <div key={cert._id}>
                {editCert?._id === cert._id ? (
                  <div className="glass-card p-10">
                    <CertForm initial={cert} onSave={handleUpdate} onCancel={() => setEditCert(null)} loading={saving} />
                  </div>
                ) : (
                  <div className="glass-card p-10 flex gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                      {cert.image?.url ? <img src={cert.image.url} alt={cert.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-dark-500 text-xs">cert</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{cert.title}</p>
                      <p className="text-green-400 text-xs">{cert.issuer}</p>
                      {cert.issueDate && <p className="text-dark-500 text-xs">{cert.issueDate}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => setEditCert(cert)} className="p-1.5 text-dark-500 hover:text-green-400 rounded-lg hover:bg-dark-700 transition-colors"><FaEdit size={12} /></button>
                      <button onClick={() => triggerDelete(cert._id)} className="p-1.5 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700 transition-colors"><FaTrash size={12} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Certification"
        message="Are you sure to permanently delete this certification? This action cannot be undone."
      />
    </div>
  );
};

export default AdminCertificationsPage;
