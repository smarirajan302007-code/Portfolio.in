import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { Spinner, BackButton } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileAPI.get().then((r) => setProfile(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleArrayChange = (field, value) => {
    setProfile((p) => ({ ...p, [`${field}Raw`]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...profile };
      if (payload.typingTextsRaw !== undefined) {
        payload.typingTexts = payload.typingTextsRaw.split(',').map(v => v.trim()).filter(Boolean);
      }
      await profileAPI.update(payload);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile Management</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2 text-sm">
          {saving ? <Spinner size="sm" /> : <FaSave size={13} />}
          Save Changes
        </button>
      </div>

      <div>
        {/* Form fields */}
        <div className="space-y-4">
          <div className="glass-card p-10 space-y-4">
            <h3 className="text-white font-semibold">Basic Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Full Name</label>
                <input name="name" value={profile?.name || ''} onChange={handleChange} className="input-field text-sm" placeholder="Your Full Name" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Greeting (e.g. Hey there! 👋 I'm)</label>
                <input name="greeting" value={profile?.greeting || ''} onChange={handleChange} className="input-field text-sm" placeholder="Hey there! 👋 I'm" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Professional Title</label>
                <input name="title" value={profile?.title || ''} onChange={handleChange} className="input-field text-sm" placeholder="Full Stack Developer" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Email</label>
                <input name="email" type="email" value={profile?.email || ''} onChange={handleChange} className="input-field text-sm" placeholder="me@example.com" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Phone</label>
                <input name="phone" value={profile?.phone || ''} onChange={handleChange} className="input-field text-sm" placeholder="+1 555 123 4567" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Location</label>
                <input name="location" value={profile?.location || ''} onChange={handleChange} className="input-field text-sm" placeholder="Boston, MA" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Availability Status</label>
                <input name="availabilityStatus" value={profile?.availabilityStatus || ''} onChange={handleChange} className="input-field text-sm" placeholder="Available for opportunities" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Years of Experience</label>
                <input name="yearsOfExperience" type="number" value={profile?.yearsOfExperience || 0} onChange={handleChange} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-dark-400 text-xs mb-1.5">Projects Completed</label>
                <input name="projectsCompleted" type="number" value={profile?.projectsCompleted || 0} onChange={handleChange} className="input-field text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-dark-400 text-xs mb-1.5">Typing Texts (comma-separated)</label>
                <input
                  type="text"
                  value={profile?.typingTextsRaw ?? (profile?.typingTexts || []).join(', ')}
                  onChange={(e) => handleArrayChange('typingTexts', e.target.value)}
                  className="input-field text-sm"
                  placeholder="Full Stack Developer, React Developer, ..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
