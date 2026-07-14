import { useEffect, useState } from 'react';
import { FaSave, FaUpload, FaUser } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { Spinner, BackButton } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminAboutPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    profileAPI.get().then((r) => setProfile(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = Math.max(0, parseInt(value) || 0);
    }
    setProfile((p) => ({ ...p, [name]: parsedValue }));
  };

  const handleArrayChange = (field, value) => {
    setProfile((p) => ({ ...p, [`${field}Raw`]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...profile };
      if (payload.interestsRaw !== undefined) {
        payload.interests = payload.interestsRaw.split(',').map(v => v.trim()).filter(Boolean);
      }
      await profileAPI.update(payload);
      toast.success('About section updated successfully!');
    } catch (err) {
      toast.error('Failed to update About section');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploading('photo');
    try {
      const res = await profileAPI.uploadPhoto(formData);
      setProfile(res.data.data);
      toast.success(`Photo uploaded successfully!`);
    } catch (err) {
      toast.error(`Failed to upload photo`);
    } finally {
      setUploading('');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">About Section</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 text-sm">
          {saving ? <Spinner size="sm" /> : <FaSave size={13} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Profile photo */}
          <div className="glass-card p-10">
            <h3 className="text-white font-medium mb-4 text-sm">Profile Photo</h3>
            <div className="flex flex-col items-center gap-3">
              <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-dark-600 bg-dark-800">
                {profile?.photo?.url ? (
                  <img src={profile.photo.url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-dark-500 text-5xl" />
                  </div>
                )}
              </div>
              <label className="btn-outline text-xs gap-2 cursor-pointer mt-2">
                {uploading === 'photo' ? <Spinner size="sm" /> : <FaUpload size={11} />}
                {profile?.photo?.url ? 'Change Photo' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>
          </div>
          
          {/* Stats */}
          <div className="glass-card p-10 space-y-4">
            <h3 className="text-white font-medium text-sm">Stats (About Sidebar)</h3>
            <div>
              <label className="block text-dark-400 text-xs mb-1.5">Years of Experience</label>
              <input name="yearsOfExperience" type="number" min="0" value={profile?.yearsOfExperience || 0} onChange={handleChange} className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-dark-400 text-xs mb-1.5">Projects Built</label>
              <input name="projectsCompleted" type="number" min="0" value={profile?.projectsCompleted || 0} onChange={handleChange} className="input-field text-sm" />
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-10 space-y-4">
            <h3 className="text-white font-semibold">Content</h3>
            <div>
              <label className="block text-dark-400 text-xs mb-1.5">About Me (Bio)</label>
              <textarea name="bio" rows={5} value={profile?.bio || ''} onChange={handleChange} className="input-field text-sm resize-none" placeholder="Write a short bio about yourself..." />
            </div>
            <div>
              <label className="block text-dark-400 text-xs mb-1.5">Career Objective</label>
              <textarea name="careerObjective" rows={4} value={profile?.careerObjective || ''} onChange={handleChange} className="input-field text-sm resize-none" placeholder="What is my professional goal?" />
            </div>
            <div>
              <label className="block text-dark-400 text-xs mb-1.5">Interests (comma-separated)</label>
              <input
                type="text"
                value={profile?.interestsRaw ?? (profile?.interests || []).join(', ')}
                onChange={(e) => handleArrayChange('interests', e.target.value)}
                className="input-field text-sm"
                placeholder="Web Development, Machine Learning, UI/UX..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAboutPage;
