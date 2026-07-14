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

  const resumes = profile?.resumes?.length > 0 ? profile.resumes : (profile?.resume?.url ? [profile.resume] : []);
  const baseName = profile?.name?.replace(/ /g, '_') || 'Resume';

  const handleDownload = async (e) => {
    e.preventDefault();
    if (downloading || resumes.length === 0) return;
    
    setDownloading(true);
    try {
      // Loop through all resumes and trigger download for each
      for (let i = 0; i < resumes.length; i++) {
        const resumeUrl = resumes[i].url;
        let downloadUrl = resumeUrl;
        
        // Force download cross-origin by injecting Cloudinary attachment flag if applicable
        if (resumeUrl?.includes('res.cloudinary.com') && resumeUrl?.includes('/upload/')) {
          downloadUrl = resumeUrl.replace('/upload/', `/upload/fl_attachment:${baseName}_${i + 1}/`);
          window.open(downloadUrl, '_blank');
          continue;
        }

        const isPdf = resumeUrl?.toLowerCase().endsWith('.pdf');
        const fileExtension = isPdf ? 'pdf' : resumeUrl?.split('.').pop() || 'jpg';
        const downloadName = resumes.length > 1 ? `${baseName}_Page_${i + 1}.${fileExtension}` : `${baseName}.${fileExtension}`;

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
        
        // Slight delay between multiple downloads
        if (i < resumes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error('Download failed, opening in new tab', error);
      resumes.forEach(res => window.open(res.url, '_blank'));
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
          {resumes.length > 0 ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3"
            >
              {downloading ? <Spinner size="sm" /> : <FaDownload />} 
              {downloading ? 'Downloading...' : 'Download Resume'}
            </button>
          ) : (
            <div className="text-dark-500 text-sm">Resume not available yet. Check back soon!</div>
          )}
        </motion.div>

        {/* Display Stacked Resumes */}
        {resumes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-row overflow-x-auto gap-6 mb-16 snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'thin' }}
          >
            {resumes.map((resume, idx) => {
              const isPdf = resume.url?.toLowerCase().endsWith('.pdf');
              return (
                <div key={idx} className="flex-none w-full sm:w-[85%] md:w-[75%] snap-center shadow-2xl rounded-2xl overflow-hidden bg-dark-900 border border-dark-800 mx-auto">
                  {isPdf ? (
                    <embed src={resume.url} type="application/pdf" className="w-full h-[600px] md:h-[800px]" />
                  ) : (
                    <img src={resume.url} alt={`Resume Page ${idx + 1}`} className="w-full h-auto object-contain" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

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
