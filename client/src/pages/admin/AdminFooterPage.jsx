import { useEffect, useState } from 'react';
import { FaSave, FaPlus, FaTrash } from 'react-icons/fa';
import { settingsAPI } from '../../services/api';
import { Spinner, BackButton } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminFooterPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.get()
      .then((r) => setSettings(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleTextChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleLinkChange = (index, field, value) => {
    const newLinks = [...(settings?.footerLinks || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const addLink = () => {
    setSettings({
      ...settings,
      footerLinks: [...(settings?.footerLinks || []), { label: '', url: '' }]
    });
  };

  const removeLink = (index) => {
    const newLinks = [...(settings?.footerLinks || [])];
    newLinks.splice(index, 1);
    setSettings({ ...settings, footerLinks: newLinks });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Footer settings saved!');
    } catch {
      toast.error('Failed to save footer settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Footer Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm gap-2">
          {saving ? <Spinner size="sm" /> : <FaSave size={13} />} Save Footer
        </button>
      </div>

      <div className="glass-card p-10 space-y-4">
        <h3 className="text-white font-semibold">Footer Text</h3>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Description (under logo)</label>
          <textarea
            name="footerText"
            rows={3}
            value={settings?.footerText || ''}
            onChange={handleTextChange}
            className="input-field text-sm resize-none"
            placeholder="Type my footer description here..."
          />
          <p className="text-xs text-dark-500 mt-1">If left blank, the footer will not show a description.</p>
        </div>
      </div>

      <div className="glass-card p-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Footer Menu Links</h3>
          <button onClick={addLink} className="btn-outline text-xs gap-2 py-1.5">
            <FaPlus size={10} /> Add Link
          </button>
        </div>

        {(!settings?.footerLinks || settings.footerLinks.length === 0) ? (
          <p className="text-dark-500 text-sm italic">No footer links added yet.</p>
        ) : (
          <div className="space-y-3">
            {settings.footerLinks.map((link, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-dark-800 p-3 rounded-xl border border-dark-700">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                    placeholder="Link Label (e.g. Home)"
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                    placeholder="URL (e.g. /home)"
                    className="input-field text-sm"
                  />
                </div>
                <button
                  onClick={() => removeLink(idx)}
                  className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors shrink-0"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFooterPage;
