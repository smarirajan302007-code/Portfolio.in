import { useState } from 'react';
import { FaLock, FaSave, FaEye, FaEyeSlash } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { Spinner, BackButton } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await adminAPI.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ name, label, showKey }) => (
    <div>
      <label className="block text-dark-400 text-xs mb-1.5">{label}</label>
      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" size={13} />
        <input
          name={name}
          type={show[showKey] ? 'text' : 'password'}
          value={form[name]}
          onChange={handleChange}
          className="input-field pl-10 pr-10 text-sm"
          required
        />
        <button type="button" onClick={() => setShow({ ...show, [showKey]: !show[showKey] })}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
          {show[showKey] ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md space-y-6">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <h1 className="text-2xl font-bold text-white">Change Password</h1>
      <div className="glass-card p-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput name="currentPassword" label="Current Password" showKey="current" />
          <PasswordInput name="newPassword" label="New Password" showKey="new" />
          <PasswordInput name="confirmPassword" label="Confirm New Password" showKey="confirm" />
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center gap-2 mt-2">
            {loading ? <Spinner size="sm" /> : <FaSave size={13} />} Change Password
          </button>
        </form>
      </div>
      <div className="glass-card p-10 border border-green-400/20">
        <p className="text-dark-400 text-xs leading-relaxed">
          ✅ Use a strong password with at least 6 characters.<br />
          ✅ Mix uppercase, lowercase, numbers and special characters.<br />
          ✅ Never share my admin credentials.
        </p>
      </div>
    </div>
  );
};

export default AdminChangePasswordPage;
