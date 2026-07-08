import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCertificate, FaExternalLinkAlt, FaCalendarAlt } from 'react-icons/fa';
import { certificationsAPI } from '../../services/api';
import { SectionHeading, PageLoader, EmptyState, BackButton } from '../../components/ui/shared';

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificationsAPI
      .getAll()
      .then((r) => setCertifications(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="Certifications"
        subtitle="Professional certifications and achievements"
      />

      {certifications.length === 0 ? (
        <EmptyState message="No certifications added yet" icon={FaCertificate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {certifications.map((cert, idx) => (
            <motion.div
              key={cert._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card-hover overflow-hidden group"
            >
              {/* Certificate image or placeholder */}
              <div className="h-36 bg-gradient-to-br from-dark-700 to-dark-800 overflow-hidden relative">
                {cert.image?.url ? (
                  <img
                    src={cert.image.url}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <FaCertificate className="text-green-400/40 text-5xl mx-auto mb-1" />
                      <p className="text-dark-500 text-xs">{cert.issuer}</p>
                    </div>
                  </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs px-2 py-1 bg-dark-900/80 text-green-400 rounded-full border border-green-400/20 font-medium">
                    {cert.issuer}
                  </span>
                </div>
              </div>

              <div className="p-10">
                <h3 className="text-white font-bold mb-2 leading-tight group-hover:text-green-400 transition-colors">
                  {cert.title}
                </h3>

                {cert.issueDate && (
                  <div className="flex items-center gap-1.5 text-dark-400 text-xs mb-3">
                    <FaCalendarAlt size={10} />
                    Issued: {cert.issueDate}
                    {cert.expiryDate && ` · Expires: ${cert.expiryDate}`}
                  </div>
                )}

                {/* Skills tags */}
                {cert.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="text-xs px-2 py-0.5 bg-dark-700 text-dark-300 rounded border border-dark-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-green-400 text-xs font-medium hover:text-green-300 transition-colors"
                  >
                    <FaExternalLinkAlt size={10} /> View Credential
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default CertificationsPage;
