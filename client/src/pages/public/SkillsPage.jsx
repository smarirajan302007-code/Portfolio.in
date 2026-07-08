import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { skillsAPI } from '../../services/api';
import { SectionHeading, PageLoader, EmptyState, BackButton } from '../../components/ui/shared';
import { SKILL_CATEGORIES } from '../../utils/constants';
import { FaCode } from 'react-icons/fa';

const categoryColors = {
  Languages: 'from-blue-500 to-blue-700',
  Frontend: 'from-cyan-500 to-cyan-700',
  Backend: 'from-green-500 to-green-700',
  Database: 'from-orange-500 to-orange-700',
  Tools: 'from-purple-500 to-purple-700',
  Frameworks: 'from-pink-500 to-pink-700',
  Other: 'from-gray-500 to-gray-700',
};

const SkillBar = ({ name, level }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-dark-200 text-sm font-medium">{name}</span>
        <span className="text-green-400 text-xs font-mono">{level}%</span>
      </div>
      <div className="skill-bar-bg">
        <motion.div
          className="skill-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${level}%` : 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
};

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    skillsAPI
      .getAll()
      .then((r) => setSkills(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const categories = ['All', ...new Set(skills.map((s) => s.category))];

  const filtered =
    activeCategory === 'All' ? skills : skills.filter((s) => s.category === activeCategory);

  const grouped = filtered.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <section className="section-container">
      <BackButton fixed />
      <SectionHeading
        title="Skills & Technologies"
        subtitle="Technologies I've worked with and my proficiency levels"
      />

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              activeCategory === cat
                ? 'bg-green-400 text-dark-950 border-green-400 shadow-glow'
                : 'bg-dark-800 text-dark-300 border-dark-700 hover:border-green-400/40 hover:text-green-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {skills.length === 0 ? (
        <EmptyState message="No skills added yet" icon={FaCode} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Object.entries(grouped).map(([category, catSkills], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                    categoryColors[category] || 'from-green-500 to-green-700'
                  } flex items-center justify-center`}
                >
                  <FaCode className="text-white text-sm" />
                </div>
                <h3 className="text-white font-semibold">{category}</h3>
                <span className="ml-auto text-dark-500 text-xs">{catSkills.length} skills</span>
              </div>

              {catSkills.map((skill) => (
                <SkillBar key={skill._id} name={skill.name} level={skill.level} />
              ))}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default SkillsPage;
