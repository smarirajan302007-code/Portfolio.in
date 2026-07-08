import { useEffect, useState } from 'react';
import { FaUpload, FaFilePdf, FaTrash, FaEdit } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { Spinner, BackButton, ConfirmModal } from '../../components/ui/shared';
import toast from 'react-hot-toast';

const AdminResumePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    profileAPI.get().then((r) => setProfile(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await profileAPI.uploadResume(formData);
      setProfile(res.data.data);
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await profileAPI.deleteResume();
      setProfile(res.data.data);
      toast.success('Resume deleted successfully!');
      setShowDeleteModal(false);
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const hasResume = !!profile?.resume?.url;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <BackButton fallbackPath="/admin/dashboard" className="mb-1" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Resume Management</h1>
      </div>

      <div className="glass-card p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mx-auto border-2 border-dark-600">
          <FaFilePdf className="text-green-400 text-3xl" />
        </div>
        
        <div>
          <h3 className="text-white font-medium mb-2">{hasResume ? 'my resume is Uploaded' : 'Upload my latest Resume'}</h3>
          <p className="text-dark-400 text-sm mb-6 max-w-sm mx-auto">
            {hasResume ? 'I can view, edit (replace), or delete your current resume below.' : 'Upload my resume in PDF or Image format. This will be available for visitors to download from my portfolio.'}
          </p>
          
          {!hasResume ? (
            <label className="btn-primary text-sm gap-2 cursor-pointer inline-flex">
              {uploading ? <Spinner size="sm" /> : <FaUpload size={13} />}
              {uploading ? 'Uploading...' : 'Select File (PDF or Image)'}
              <input
                type="file"
                accept=".pdf,image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a 
                href={profile.resume.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-outline text-sm gap-2"
              >
                <FaFilePdf size={13} /> View Current
              </a>
              
              <label className="btn-primary text-sm gap-2 cursor-pointer inline-flex">
                {uploading ? <Spinner size="sm" /> : <FaEdit size={13} />}
                {uploading ? 'Uploading...' : 'Edit / Replace'}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>

              <button 
                onClick={() => setShowDeleteModal(true)}
                className="btn-ghost text-red-400 border border-red-500/20 hover:bg-red-500/10 text-sm gap-2"
              >
                <FaTrash size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure to delete my resume? It will be removed from your public portfolio."
        confirmText={deleting ? 'Deleting...' : 'Delete Resume'}
        isDanger={true}
      />
    </div>
  );
};

export default AdminResumePage;
