import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaStar, FaUpload } from 'react-icons/fa';
import { projectsAPI } from '../../services/api';
import { Spinner, EmptyState, BackButton, ConfirmModal } from '../../components/ui/shared';
import { PROJECT_CATEGORIES } from '../../utils/constants';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '', description: '', longDescription: '',
  features: '', techStack: '', githubUrl: '', liveUrl: '',
  featured: false, order: 0, category: 'Web Development',
};

const ProjectForm = ({ initial, onSave, onCancel, loading }) => {
  const [form, setForm] = useState(initial ? {
    ...initial,
    features: (initial.features || []).join(', '),
    techStack: (initial.techStack || []).join(', '),
  } : defaultForm);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let parsedValue = type === 'checkbox' ? checked : value;
    if (type === 'number') {
      parsedValue = Math.max(0, parseInt(value) || 0);
    }
    setForm({ ...form, [name]: parsedValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (imageFile) formData.append('coverImage', imageFile);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-dark-400 text-xs mb-1.5">Project Title *</label>
          <input name="title" value={form.title} onChange={handleChange} className="input-field text-sm" placeholder="E-Commerce Platform" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-dark-400 text-xs mb-1.5">Short Description *</label>
          <textarea name="description" rows={2} value={form.description} onChange={handleChange} className="input-field text-sm resize-none" required />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-dark-400 text-xs mb-1.5">Long Description</label>
          <textarea name="longDescription" rows={3} value={form.longDescription} onChange={handleChange} className="input-field text-sm resize-none" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Features (comma-separated)</label>
          <input name="features" value={form.features} onChange={handleChange} className="input-field text-sm" placeholder="Auth, Dashboard, ..." />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Tech Stack (comma-separated)</label>
          <input name="techStack" value={form.techStack} onChange={handleChange} className="input-field text-sm" placeholder="React, Node.js, ..." />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">GitHub URL</label>
          <input name="githubUrl" value={form.githubUrl} onChange={handleChange} className="input-field text-sm" placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Live Demo URL</label>
          <input name="liveUrl" value={form.liveUrl} onChange={handleChange} className="input-field text-sm" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field text-sm">
            {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Display Order</label>
          <input name="order" type="number" min="0" value={form.order} onChange={handleChange} className="input-field text-sm" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Cover Image</label>
          <label className="btn-outline text-xs gap-2 cursor-pointer">
            <FaUpload size={11} /> {imageFile ? imageFile.name : 'Choose Image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
          </label>
          {initial?.coverImage?.url && !imageFile && (
            <img src={initial.coverImage.url} alt="Current" className="mt-2 h-16 rounded-lg object-cover" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <input id="featured" name="featured" type="checkbox" checked={form.featured} onChange={handleChange} className="accent-green-400 w-4 h-4" />
          <label htmlFor="featured" className="text-dark-300 text-sm flex items-center gap-1">
            <FaStar className="text-yellow-400" size={12} /> Featured Project
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary text-sm gap-2">
          {loading ? <Spinner size="sm" /> : <FaSave size={13} />} Save Project
        </button>
        <button type="button" onClick={onCancel} className="btn-outline text-sm"><FaTimes size={13} /> Cancel</button>
      </div>
    </form>
  );
};

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const fetchProjects = () => {
    setLoading(true);
    projectsAPI.getAll().then((r) => setProjects(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(fetchProjects, []);

  const handleCreate = async (formData) => {
    setSaving(true);
    try {
      await projectsAPI.create(formData);
      toast.success('Project created!');
      setShowForm(false);
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create project'); }
    finally { setSaving(false); }
  };

  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = async (formData) => {
    setSaving(true);
    try {
      await projectsAPI.update(editProject._id, formData);
      toast.success('Project updated!');
      setEditProject(null);
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update project'); }
    finally { setSaving(false); }
  };

  const triggerDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await projectsAPI.delete(deleteId);
      toast.success('Project deleted');
      fetchProjects();
    } catch { toast.error('Failed to delete project'); }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projects Management</h1>
        <button onClick={() => { setShowForm(true); setEditProject(null); }} className="btn-primary text-sm gap-2">
          <FaPlus size={12} /> Add Project
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-10">
            <h3 className="text-white font-semibold mb-4">Add New Project</h3>
            <ProjectForm onSave={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <EmptyState message="No projects added yet." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div key={project._id}>
              {editProject?._id === project._id ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10">
                  <h3 className="text-white font-semibold mb-4">Edit: {project.title}</h3>
                  <ProjectForm initial={project} onSave={handleUpdate} onCancel={() => setEditProject(null)} loading={saving} />
                </motion.div>
              ) : (
                <div className="glass-card flex items-center gap-4 p-10 hover:border-green-400/20 transition-all">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                    {project.coverImage?.url ? (
                      <img src={project.coverImage.url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-500 text-xs">No img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{project.title}</p>
                      {project.featured && <FaStar className="text-yellow-400 flex-shrink-0" size={12} />}
                    </div>
                    <p className="text-dark-400 text-xs truncate mt-0.5">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(project.techStack || []).slice(0, 3).map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 bg-dark-700 text-dark-400 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditProject(project)} className="p-2 text-dark-500 hover:text-green-400 transition-colors rounded-lg hover:bg-dark-700">
                      <FaEdit size={13} />
                    </button>
                    <button onClick={() => triggerDelete(project._id)} className="p-2 text-dark-500 hover:text-red-400 transition-colors rounded-lg hover:bg-dark-700">
                      <FaTrash size={13} />
                    </button>
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
        title="Delete Project"
        message="Are you sure to permanently delete this project? This action cannot be undone."
      />
    </div>
  );
};

export default AdminProjectsPage;
