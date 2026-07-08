import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
const SafeCountUp = typeof CountUp === 'function' ? CountUp : (CountUp.default || CountUp);
import { useInView } from 'react-intersection-observer';
import { FaCode, FaGraduationCap, FaBriefcase, FaHeart } from 'react-icons/fa';
import { profileAPI } from '../../services/api';
import { SectionHeading, PageLoader, BackButton } from '../../components/ui/shared';

const stats = [
  { label: 'Projects Built', key: 'projectsCompleted', Icon: FaCode, suffix: '+' },
  { label: 'Years of Experience', key: 'yearsOfExperience', Icon: FaBriefcase, suffix: '+' },
];

const AboutPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });

  useEffect(() => {
    profileAPI
      .get()
      .then((r) => setProfile(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="About Me"
        subtitle="Get to know who I am, what I do, and what drives me"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Image + Stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          {/* Photo card */}
          <div className="glass-card p-10 flex items-center gap-8">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-green-400/30">
              {profile?.photo?.url ? (
                <img src={profile.photo.url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                  <FaCode className="text-green-400 text-3xl" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{profile?.name}</h3>
              <p className="text-green-400 text-sm font-medium mb-2">{profile?.title}</p>
              <p className="text-dark-400 text-xs">{profile?.location}</p>
            </div>
          </div>

          {/* Stats */}
          <div ref={ref} className="grid grid-cols-2 gap-6">
            {stats.map(({ label, key, Icon, suffix }) => (
              <div key={key} className="glass-card p-10 text-center flex flex-col items-center justify-center">
                <Icon className="text-green-400 mb-2" size={22} />
                <p className="text-3xl font-black text-white">
                  {inView && <SafeCountUp end={profile?.[key] || 0} duration={2} />}
                  <span className="text-green-400">{suffix}</span>
                </p>
                <p className="text-dark-400 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Interests */}
          <div className="glass-card p-10">
            <div className="flex items-center gap-2 mb-4">
              <FaHeart className="text-green-400" size={16} />
              <h4 className="text-white font-semibold">Interests & Hobbies</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile?.interests || []).map((interest, i) => (
                <span key={i} className="badge text-xs">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-8"
        >
          {/* About */}
          <div className="glass-card p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-400/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaCode className="text-green-400" size={14} />
              </div>
              <h3 className="text-white font-semibold text-lg">Who Am I?</h3>
            </div>
            <p className="text-dark-300 leading-relaxed text-sm">
              {profile?.bio}
            </p>
          </div>

          {/* Career Objective */}
          <div className="glass-card p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-400/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaBriefcase className="text-green-400" size={14} />
              </div>
              <h3 className="text-white font-semibold text-lg">Career Objective</h3>
            </div>
            <p className="text-dark-300 leading-relaxed text-sm">
              {profile?.careerObjective}
            </p>
          </div>

          {/* Currently / Role */}
          <div className="glass-card p-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-400/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaGraduationCap className="text-green-400" size={14} />
              </div>
              <h3 className="text-white font-semibold text-lg">Currently</h3>
            </div>
            <p className="text-dark-300 text-sm leading-relaxed">
              {profile?.title ? (
                <>
                  Working as a{' '}
                  <span className="text-green-400 font-medium">{profile.title}</span>.
                  {profile?.careerObjective ? (
                    <> {profile.careerObjective}</>
                  ) : (
                    <> Actively seeking full-time opportunities and open source contributions.</>
                  )}
                </>
              ) : (
                <>Actively seeking opportunities and contributing to open source projects.</>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutPage;
