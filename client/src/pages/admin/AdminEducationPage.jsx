import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { educationAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const defaultForm = { degree: '', institution: '', location: '', startYear: '', endYear: 'Present', cgpa: '', percentage: '', description: '', order: 0 };

const EduForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || defaultForm);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-dark-400 text-xs mb-1.5">Degree *</label>
          <input name="degree" value={form.degree} onChange={handleChange} className="input-field text-sm" placeholder="B.Tech Computer Science" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Institution *</label>
          <input name="institution" value={form.institution} onChange={handleChange} className="input-field text-sm" placeholder="MIT" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="input-field text-sm" placeholder="Cambridge, MA" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Start Year *</label>
          <input name="startYear" value={form.startYear} onChange={handleChange} className="input-field text-sm" placeholder="2021" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">End Year</label>
          <input name="endYear" value={form.endYear} onChange={handleChange} className="input-field text-sm" placeholder="2025 or Present" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">CGPA</label>
          <input name="cgpa" value={form.cgpa} onChange={handleChange} className="input-field text-sm" placeholder="8.9/10" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Percentage</label>
          <input name="percentage" value={form.percentage} onChange={handleChange} className="input-field text-sm" placeholder="92%" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-dark-400 text-xs mb-1.5">Description</label>
          <textarea name="description" rows={2} value={form.description} onChange={handleChange} className="input-field text-sm resize-none" />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-primary text-sm gap-2">
          {loading ? <Spinner size="sm" /> : <FaSave size={13} />} Save
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm"><FaTimes size={13} /> Cancel</button>
      </div>
    </form>
  );
};

const AdminEducationPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const fetchRecords = () => {
    setLoading(true);
    educationAPI.getAll().then((r) => setRecords(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchRecords, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try { await educationAPI.create(form); toast.success('Education added!'); setShowForm(false); fetchRecords(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try { await educationAPI.update(editRecord._id, form); toast.success('Updated!'); setEditRecord(null); fetchRecords(); }
    catch (err) { toast.error('Failed to update'); }
    finally { setSaving(false); }
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
      await educationAPI.delete(deleteId);
      toast.success('Deleted');
      fetchRecords();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Education Management</h1>
        <button onClick={() => { setShowForm(true); setEditRecord(null); }} className="btn-primary text-sm gap-2"><FaPlus size={12} /> Add Record</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-10">
            <h3 className="text-white font-semibold mb-4">Add Education Record</h3>
            <EduForm onSave={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        : records.length === 0 ? <EmptyState message="No education records yet." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {records.map((rec) => (
              <div key={rec._id}>
                {editRecord?._id === rec._id ? (
                  <div className="glass-card p-10">
                    <EduForm initial={rec} onSave={handleUpdate} onCancel={() => setEditRecord(null)} loading={saving} />
                  </div>
                ) : (
                  <div className="glass-card flex items-start justify-between gap-4 p-10">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold">{rec.degree}</p>
                      <p className="text-green-400 text-sm mt-0.5">{rec.institution}</p>
                      <p className="text-dark-400 text-xs mt-1">{rec.startYear} – {rec.endYear} · {rec.location}</p>
                      {rec.cgpa && <p className="text-dark-500 text-xs">CGPA: {rec.cgpa}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setEditRecord(rec)} className="p-2 text-dark-500 hover:text-green-400 rounded-lg hover:bg-dark-700 transition-colors"><FaEdit size={13} /></button>
                      <button onClick={() => triggerDelete(rec._id)} className="p-2 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700 transition-colors"><FaTrash size={13} /></button>
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
        title="Delete Education Record"
        message="Are you sure to permanently delete this education record? This action cannot be undone."
      />
    </div>
  );
};

export default AdminEducationPage;
