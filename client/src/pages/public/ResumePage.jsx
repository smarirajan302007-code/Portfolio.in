import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaEye, FaFilePdf } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { SectionHeading, PageLoader, BackButton, Spinner } from '../../components/ui/shared';

const ResumePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    profileAPI
      .get()
      .then((r) => setProfile(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const resumeUrl = profile?.resume?.url;
  const isPdf = resumeUrl?.toLowerCase().endsWith('.pdf');
  const fileExtension = isPdf ? 'pdf' : resumeUrl?.split('.').pop() || 'jpg';
  const baseName = profile?.name?.replace(/ /g, '_') || 'Resume';
  const downloadName = `${baseName}.${fileExtension}`;

  // Force download cross-origin by injecting Cloudinary attachment flag if applicable
  let downloadUrl = resumeUrl;
  if (resumeUrl?.includes('res.cloudinary.com') && resumeUrl?.includes('/upload/')) {
    downloadUrl = resumeUrl.replace('/upload/', `/upload/fl_attachment:${baseName}/`);
  }

  const handleDownload = async (e) => {
    e.preventDefault();
    if (downloading) return;
    
    // If it's a Cloudinary URL with fl_attachment, the browser handles the forced download perfectly via normal navigation
    if (downloadUrl !== resumeUrl) {
      window.location.href = downloadUrl;
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(resumeUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed, opening in new tab', error);
      window.open(resumeUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="Resume"
        subtitle="Download or view my latest resume"
      />

      <div className="max-w-3xl mx-auto">
        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-center mb-8"
        >
          {resumeUrl ? (
            <>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary gap-2"
              >
                <FaEye /> View Resume
              </a>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-outline gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloading ? <Spinner size="sm" /> : <FaDownload />} 
                {downloading ? 'Downloading...' : 'Download PDF'}
              </button>
            </>
          ) : (
            <div className="text-dark-500 text-sm">Resume not available yet. Check back soon!</div>
          )}
        </motion.div>



        {/* Resume highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { label: 'Projects Completed', value: `${profile?.projectsCompleted || '—'}+`, detail: 'Web & Mobile Apps' },
            { label: 'Years Experience', value: `${profile?.yearsOfExperience || '—'}+`, detail: 'Projects & Learning' },
            { label: 'Location', value: profile?.location || '—', detail: 'Open to Remote' },
          ].map((item) => (
            <div key={item.label} className="glass-card p-10 text-center">
              <p className="text-dark-400 text-xs mb-1">{item.label}</p>
              <p className="text-green-400 font-bold text-lg">{item.value}</p>
              <p className="text-dark-500 text-xs">{item.detail}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ResumePage;
