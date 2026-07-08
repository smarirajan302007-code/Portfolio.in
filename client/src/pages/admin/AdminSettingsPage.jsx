import { useEffect, useState } from 'react';
import { FaSave, FaUpload } from 'react-icons/fa';
import { settingsAPI } from '../../services/api';
import { Spinner, BackButton } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    settingsAPI.get().then((r) => setSettings(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved!');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handleFaviconUpload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('favicon', file);
    setUploadingFavicon(true);
    try {
      const res = await settingsAPI.uploadFavicon(fd);
      setSettings(res.data.data);
      toast.success('Favicon uploaded!');
    } catch { toast.error('Failed to upload favicon'); }
    finally { setUploadingFavicon(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Site Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm gap-2">
          {saving ? <Spinner size="sm" /> : <FaSave size={13} />} Save Settings
        </button>
      </div>

      <div className="glass-card p-10 space-y-4">
        <h3 className="text-white font-semibold">SEO & Metadata</h3>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Site Title</label>
          <input name="siteTitle" value={settings?.siteTitle || ''} onChange={handleChange} className="input-field text-sm" placeholder="My Name | Portfolio" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Meta Description</label>
          <textarea name="siteDescription" rows={3} value={settings?.siteDescription || ''} onChange={handleChange} className="input-field text-sm resize-none" />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Keywords (comma-separated)</label>
          <input name="siteKeywords" value={settings?.siteKeywords || ''} onChange={handleChange} className="input-field text-sm" placeholder="developer, react, portfolio..." />
        </div>
        <div>
          <label className="block text-dark-400 text-xs mb-1.5">Google Analytics ID</label>
          <input name="googleAnalyticsId" value={settings?.googleAnalyticsId || ''} onChange={handleChange} className="input-field text-sm" placeholder="G-XXXXXXXXXX" />
        </div>
      </div>

      <div className="glass-card p-10 space-y-4">
        <h3 className="text-white font-semibold">Theme</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-dark-400 text-xs mb-1.5">Primary Color</label>
            <div className="flex gap-2">
              <input name="themeColor" type="color" value={settings?.themeColor || '#4ADE80'} onChange={handleChange} className="h-10 w-14 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer" />
              <input name="themeColor" type="text" value={settings?.themeColor || ''} onChange={handleChange} className="input-field text-sm flex-1" />
            </div>
          </div>
          <div>
            <label className="block text-dark-400 text-xs mb-1.5">Accent Color</label>
            <div className="flex gap-2">
              <input name="accentColor" type="color" value={settings?.accentColor || '#22c55e'} onChange={handleChange} className="h-10 w-14 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer" />
              <input name="accentColor" type="text" value={settings?.accentColor || ''} onChange={handleChange} className="input-field text-sm flex-1" />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-10 space-y-4">
        <h3 className="text-white font-semibold">Favicon</h3>
        <div className="flex items-center gap-4">
          {settings?.favicon?.url && (
            <img src={settings.favicon.url} alt="favicon" className="w-12 h-12 rounded-xl object-contain bg-dark-700 p-1" />
          )}
          <label className="btn-outline text-sm gap-2 cursor-pointer">
            {uploadingFavicon ? <Spinner size="sm" /> : <FaUpload size={13} />}
            {settings?.favicon?.url ? 'Change Favicon' : 'Upload Favicon'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFaviconUpload(e.target.files[0])} />
          </label>
        </div>
        <p className="text-dark-500 text-xs">Recommended: 32×32 or 64×64 PNG/ICO</p>
      </div>

      <div className="glass-card p-10">
        <h3 className="text-white font-semibold mb-4">Maintenance Mode</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings?.maintenanceMode ? 'bg-red-500' : 'bg-dark-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings?.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-dark-300 text-sm">
            {settings?.maintenanceMode ? '🔴 Maintenance mode ON' : '🟢 Site is live'}
          </span>
        </label>
        <p className="text-dark-500 text-xs mt-2">When enabled, visitors see a maintenance page.</p>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
