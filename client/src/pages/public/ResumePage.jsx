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
        // Check if there is only 1 resume and it's already a PDF
      if (resumes.length === 1 && resumes[0].url?.toLowerCase().endsWith('.pdf')) {
        const resumeUrl = resumes[0].url;
        let downloadUrl = resumeUrl;
        
        if (resumeUrl?.includes('res.cloudinary.com') && resumeUrl?.includes('/upload/')) {
          downloadUrl = resumeUrl.replace('/upload/', `/upload/fl_attachment:${baseName}/`);
          window.open(downloadUrl, '_blank');
        } else {
          const response = await fetch(resumeUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${baseName}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
        setDownloading(false);
        return;
      }

      // Otherwise, we have multiple images (or a mix) - we should generate a single PDF
      // Using dynamic import so it doesn't block initial load
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4' // standard A4
      });

      const a4Width = 595.28;
      const a4Height = 841.89;

      for (let i = 0; i < resumes.length; i++) {
        const resumeUrl = resumes[i].url;
        const isPdf = resumeUrl?.toLowerCase().endsWith('.pdf');
        
        if (isPdf) {
          window.open(resumeUrl, '_blank');
          continue;
        }

        // Fetch image and convert to base64
        const response = await fetch(resumeUrl);
        const blob = await response.blob();
        
        const base64data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result);
          };
        });

        if (i > 0) doc.addPage();

        const imgProps = doc.getImageProperties(base64data);
        const imgRatio = imgProps.width / imgProps.height;
        const a4Ratio = a4Width / a4Height;
        
        let finalWidth = a4Width;
        let finalHeight = a4Height;
        let x = 0;
        let y = 0;

        if (imgRatio > a4Ratio) {
          finalHeight = a4Width / imgRatio;
          y = (a4Height - finalHeight) / 2;
        } else {
          finalWidth = a4Height * imgRatio;
          x = (a4Width - finalWidth) / 2;
        }

        doc.addImage(base64data, 'JPEG', x, y, finalWidth, finalHeight);
      }

      doc.save(`${baseName}_Resume.pdf`);
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
