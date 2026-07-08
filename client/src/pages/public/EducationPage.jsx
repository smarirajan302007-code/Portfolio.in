import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaMapMarkerAlt, FaCalendarAlt, FaStar } from 'react-icons/fa';
import { educationAPI } from '../../services/api';
import { SectionHeading, PageLoader, EmptyState, BackButton } from '../../components/ui/shared';

const EducationPage = () => {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    educationAPI
      .getAll()
      .then((r) => setEducation(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="Education"
        subtitle="My academic background and qualifications"
      />

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-green-400/30 to-transparent" />

        {education.length === 0 ? (
          <EmptyState message="No education records yet" icon={FaGraduationCap} />
        ) : (
          <div className="flex flex-col gap-8">
            {education.map((edu, idx) => (
              <motion.div
                key={edu._id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative pl-16"
              >
                {/* Timeline dot */}
                <div className="absolute left-3.5 top-6 timeline-dot" />

                <div className="glass-card-hover p-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{edu.degree}</h3>
                      <p className="text-green-400 font-medium mb-3">{edu.institution}</p>
                    </div>
                    
                    <div className="flex flex-col gap-1 md:text-right flex-shrink-0 text-xs text-dark-400">
                      <div className="flex items-center gap-1.5 md:justify-end">
                        <FaCalendarAlt />
                        <span>
                          {edu.startYear} – {edu.endYear || 'Present'}
                        </span>
                      </div>
                      {edu.location && (
                        <div className="flex items-center gap-1.5 md:justify-end">
                          <FaMapMarkerAlt />
                          <span>{edu.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-3">
                    {edu.cgpa && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-md">
                        <FaStar />
                        <span>CGPA: {edu.cgpa}</span>
                      </div>
                    )}
                    {edu.percentage && (
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-md">
                        <FaStar />
                        <span>{edu.percentage}</span>
                      </div>
                    )}
                  </div>

                  {edu.description && (
                    <p className="text-dark-300 text-sm leading-relaxed mt-4">{edu.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EducationPage;
