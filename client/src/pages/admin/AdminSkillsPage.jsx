import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import { skillsAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import { SKILL_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const defaultForm = { name: '', category: 'Languages', level: 80, color: '#4ADE80', order: 0 };

const SkillForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial || defaultForm);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Skill Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="input-field text-sm" placeholder="e.g. React.js" required />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field text-sm">
            {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Proficiency ({form.level}%)</label>
          <input name="level" type="range" min="0" max="100" value={form.level} onChange={handleChange} className="w-full accent-green-400" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Color</label>
          <div className="flex gap-2">
            <input name="color" type="color" value={form.color} onChange={handleChange} className="h-10 w-14 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer" />
            <input name="color" type="text" value={form.color} onChange={handleChange} className="input-field text-sm flex-1" />
          </div>
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Display Order</label>
          <input name="order" type="number" value={form.order} onChange={handleChange} className="input-field text-sm" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary text-sm gap-2">
          {loading ? <Spinner size="sm" /> : <FaSave size={13} />} Save Skill
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm"><FaTimes size={13} /> Cancel</button>
      </div>
    </form>
  );
};

const AdminSkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editSkill, setEditSkill] = useState(null);

  const fetchSkills = () => {
    setLoading(true);
    skillsAPI.getAll().then((r) => setSkills(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(fetchSkills, []);

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await skillsAPI.create(form);
      toast.success('Skill created!');
      setShowForm(false);
      fetchSkills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create skill');
    } finally { setSaving(false); }
  };

  const handleUpdate = async (form) => {
    setSaving(true);
    try {
      await skillsAPI.update(editSkill._id, form);
      toast.success('Skill updated!');
      setEditSkill(null);
      fetchSkills();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update skill');
    } finally { setSaving(false); }
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
      await skillsAPI.delete(deleteId);
      toast.success('Skill deleted');
      fetchSkills();
    } catch { toast.error('Failed to delete skill'); }
  };

  // Group by category
  const grouped = skills.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Skills Management</h1>
        <button onClick={() => { setShowForm(true); setEditSkill(null); }} className="btn-primary text-sm gap-2">
          <FaPlus size={12} /> Add Skill
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-10">
            <h3 className="text-white font-semibold mb-4">Add New Skill</h3>
            <SkillForm onSave={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills table grouped by category */}
      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : skills.length === 0 ? (
        <EmptyState message="No skills added yet. Click 'Add Skill' to get started." />
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([category, catSkills]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-white font-semibold">{category}</h3>
                <span className="text-dark-500 text-xs">{catSkills.length} skills</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catSkills.map((skill) => (
                  <div key={skill._id} className="glass-card">
                    {editSkill?._id === skill._id ? (
                      <div className="p-5">
                        <SkillForm initial={skill} onSave={handleUpdate} onCancel={() => setEditSkill(null)} loading={saving} />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-10">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: skill.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-dark-200 text-sm font-medium">{skill.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex-1 h-1.5 bg-dark-700 rounded-full max-w-xs">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: `${skill.level}%` }} />
                            </div>
                            <span className="text-dark-500 text-xs font-mono">{skill.level}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditSkill(skill)} className="p-2 text-dark-500 hover:text-green-400 rounded-lg hover:bg-dark-700 transition-colors"><FaEdit size={13} /></button>
                          <button onClick={() => triggerDelete(skill._id)} className="p-2 text-dark-500 hover:text-red-400 rounded-lg hover:bg-dark-700 transition-colors"><FaTrash size={13} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Skill"
        message="Are you sure to permanently delete this skill? This action cannot be undone."
      />
    </div>
  );
};

export default AdminSkillsPage;
